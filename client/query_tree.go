package client

import (
	"sync"

	"github.com/rgraphql/rgraphql/schema"
	"github.com/rgraphql/rgraphql/varstore"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/visitor"
	"github.com/pkg/errors"
	proto "github.com/rgraphql/rgraphql"
)

// QueryTree manages merging Query fragments into a single query tree.
// This is a different implementation from qtree (the server-side implementation).
type QueryTree struct {
	// schema is the underlying graphql schema
	schema *schema.Schema
	// root is the root of the query tree
	root *qtNode
	// mtx guards the tree
	mtx sync.Mutex
	// varStore is the variable store
	varStore *varstore.VariableStore
	// attachedQueries contains information about each attached query.
	attachedQueries map[*Query]*qtAttachedQuery
	// handler handles changes to the tree.
	handler QueryTreeHandler
	// nextID contains the next query node id
	nextID uint32

	// pendingVariables contains the set of new variables to xmit
	pendingVariables []*proto.ASTVariable
}

// QueryTreeHandler handles changes to the query tree.
type QueryTreeHandler interface {
	// HandleMutation handles a change to the query tree.
	// The query ID is not filled in.
	HandleMutation(mut *proto.RGQLQueryTreeMutation)
}

// NewQueryTree builds the root of a query tree.
func NewQueryTree(schema *schema.Schema, handler QueryTreeHandler) (*QueryTree, error) {
	if schema == nil || schema.Definitions == nil || schema.Definitions.RootQuery == nil {
		return nil, errors.New("definitions and root query must not be nil")
	}

	rootQuery := schema.Definitions.RootQuery
	qt := &QueryTree{
		schema:  schema,
		handler: handler,
		nextID:  1,

		attachedQueries: make(map[*Query]*qtAttachedQuery),
	}
	qt.varStore = varstore.NewVariableStore(newQtVarStoreHandler(qt))
	qt.root = newQtNode(rootQuery, qt.varStore)
	return qt, nil
}

// Schema returns the underlying schema.
func (q *QueryTree) Schema() *schema.Schema {
	return q.schema
}

// StartQuery creates a new Query attached to the tree from a query fragment.
func (q *QueryTree) StartQuery(op *ast.OperationDefinition) (*Query, error) {
	query, err := NewQuery(op)
	if err != nil {
		return nil, err
	}

	// Attach query to the query tree.
	if err := q.Attach(query); err != nil {
		return nil, err
	}

	return query, nil
}

// Attach attaches the query to the query tree.
func (q *QueryTree) Attach(query *Query) error {
	q.mtx.Lock()
	defer q.mtx.Unlock()

	if _, ok := q.attachedQueries[query]; ok {
		return nil
	}

	lookupType := q.schema.Definitions.LookupType
	qnode := q.root
	defer q.gcSweep()

	// Keep a list of query tree nodes we need to roll-back if we encounter an error.
	// Visit the nodes in the query and match them with qtNode.
	// Push the new node into a new node slice.
	// Keep a count of depth under new tree
	// Subtract in the leave func

	// Field <-> *qtNode
	var validateErr error
	attachedQuery := newQtAttachedQuery(query)

	var newNodes []*qtNode
	var newNodeDepth int
	visitor.Visit(query.ast, &visitor.VisitorOptions{
		EnterKindMap: map[string]visitor.VisitFunc{
			"Field": func(p visitor.VisitFuncParams) (string, interface{}) {
				field := p.Node.(*ast.Field)
				if field.Name == nil || field.Name.Value == "" {
					return visitor.ActionSkip, nil
				}

				childNode, err := qnode.resolveChild(field, lookupType, func() *qtNode {
					nodeID := q.nextID
					q.nextID++
					return &qtNode{id: nodeID}
				})
				if err != nil {
					validateErr = err
					return visitor.ActionBreak, nil
				}

				if childNode == nil {
					return visitor.ActionBreak, nil
				}

				if childNode.refCount == 0 && newNodeDepth == 0 {
					newNodes = append(newNodes, childNode)
				}

				childNode.refCount++
				newNodeDepth++
				attachedQuery.appendQueryNode(childNode)
				qnode = childNode
				return visitor.ActionNoChange, nil
			},
		},
		LeaveKindMap: map[string]visitor.VisitFunc{
			"Field": func(p visitor.VisitFuncParams) (string, interface{}) {
				field := p.Node.(*ast.Field)
				if field.Name == nil || field.Name.Value == "" {
					return visitor.ActionSkip, nil
				}

				if newNodeDepth != 0 {
					newNodeDepth--
					qnode = qnode.parent
				}

				return visitor.ActionNoChange, nil
			},
		},
	}, nil)

	if validateErr != nil {
		// purge nodes
		for _, qn := range attachedQuery.qtNodes {
			qn.refCount--
			if qn.refCount == 0 {
				qn.flagGcNext()
			}
		}
		q.gcSweep()
		q.pendingVariables = nil
		return validateErr
	}

	if len(newNodes) != 0 {
		// TODO: set query ID?
		mut := &proto.RGQLQueryTreeMutation{
			NodeMutation: make([]*proto.RGQLQueryTreeMutation_NodeMutation, len(newNodes)),
			Variables:    q.pendingVariables,
		}
		for i := range newNodes {
			newNodes[i].markXmitted()
			mut.NodeMutation[i] = &proto.RGQLQueryTreeMutation_NodeMutation{
				NodeId:    newNodes[i].parent.id,
				Node:      newNodes[i].buildProto(),
				Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
			}
		}
		if q.handler != nil {
			q.handler.HandleMutation(mut)
		}
	}

	q.pendingVariables = nil
	q.attachedQueries[query] = attachedQuery
	q.gcSweep()
	return nil
}

// Detach detaches the query from the query tree.
func (q *QueryTree) Detach(query *Query) error {
	q.mtx.Lock()
	defer q.mtx.Unlock()

	at, atOk := q.attachedQueries[query]
	if !atOk {
		return nil
	}

	var gcSweep bool
	for _, nod := range at.qtNodes {
		nod.refCount--
		if nod.refCount == 0 {
			gcSweep = true
			nod.flagGcNext()
		}
	}
	delete(q.attachedQueries, query)

	if gcSweep {
		q.gcSweep()
	}

	return nil
}

// gcSweep sweeps the GC tree
// Transmits the removal of purged nodes to the handler.
// Only the minimum depth nodes are transmitted as removed.
func (q *QueryTree) gcSweep() {
	var allUnrefNodes []*qtNode
	_ = q.root.gcSweep(func(unrefNodes []*qtNode) {
		allUnrefNodes = append(allUnrefNodes, unrefNodes...)
	})
	if len(allUnrefNodes) > 0 && q.handler != nil {
		var muts []*proto.RGQLQueryTreeMutation_NodeMutation
		for i := range allUnrefNodes {
			muts = append(muts, &proto.RGQLQueryTreeMutation_NodeMutation{
				NodeId:    allUnrefNodes[i].id,
				Operation: proto.RGQLQueryTreeMutation_SUBTREE_DELETE,
			})
		}
		// TOOD: set query id
		q.handler.HandleMutation(&proto.RGQLQueryTreeMutation{
			NodeMutation: muts,
		})
	}
}
