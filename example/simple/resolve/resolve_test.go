package resolve

import (
	"context"
	"testing"
	"time"

	"github.com/rgraphql/magellan/example/simple"

	"github.com/rgraphql/magellan/encoder"
	qttestutil "github.com/rgraphql/magellan/qtree/testutil"
	"github.com/rgraphql/magellan/resolver"
	proto "github.com/rgraphql/rgraphql"
)

// .\magellan.exe analyze --schema ..\..\example\simple\schema.graphql --go-pkg "github.com/rgraphql/magellan/example/simple" --go-query-type RootResolver --go-output "../../example/simple/resolve/resolve_generated.go"
func TestResolveSimple(t *testing.T) {
	ctx, ctxCancel := context.WithTimeout(context.Background(), time.Second*30)
	defer ctxCancel()

	schema, qtNode, errCh := qttestutil.BuildMockTree(t)
	_ = schema

	qtNode.ApplyTreeMutation(&proto.RGQLQueryTreeMutation{
		NodeMutation: []*proto.RGQLQueryTreeMutation_NodeMutation{
			{
				NodeId:    0,
				Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
				Node: &proto.RGQLQueryTreeNode{
					Id:        1,
					FieldName: "names",
				},
			},
			{
				NodeId:    0,
				Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
				Node: &proto.RGQLQueryTreeNode{
					Id:        2,
					FieldName: "allPeople",
					Children: []*proto.RGQLQueryTreeNode{
						{
							Id:        3,
							FieldName: "name",
						},
						{
							Id:        4,
							FieldName: "height",
						},
					},
				},
			},
			{
				NodeId:    0,
				Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
				Node: &proto.RGQLQueryTreeNode{
					Id:        5,
					FieldName: "singlePerson",
					Children: []*proto.RGQLQueryTreeNode{
						{
							Id:        6,
							FieldName: "name",
						},
					},
				},
			},
		},
	})

	// Until a go client is written, this is the best I can do.
	encoder := encoder.NewResultEncoder(50)
	outputCh := make(chan []byte)
	doneCh := make(chan struct{})
	var totalLen int
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case dat := <-outputCh:
				totalLen += len(dat)
				t.Logf("[%v] output: %s", totalLen, string(dat))
				if totalLen >= 106 {
					doneCh <- struct{}{}
				}
			}
		}
	}()
	go encoder.Run(ctx, outputCh)

	resolverCtx := resolver.NewContext(ctx, qtNode, encoder)
	rootRes := &simple.RootResolver{}
	go ResolveRootQuery(resolverCtx, rootRes)
	select {
	case err := <-errCh:
		t.Fatal(err.GetError())
	case <-doneCh:
	}
}
