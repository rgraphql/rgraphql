package resolve

import (
	"context"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/qtree"
)

type objectResolver struct {
	// Go type and GraphQL type
	pair TypeResolverPair
	// Object definition
	odef *ast.ObjectDefinition
	// Field resolvers
	fieldResolvers map[string]Resolver
}

func (r *objectResolver) Execute(rc *resolutionContext, resolver reflect.Value) {
	qnode := rc.qnode

	// Nil resolver returned.
	if !resolver.IsValid() || resolver.IsNil() {
		rc.SetValue(nil)
		return
	}

	fieldCancels := make(map[string]context.CancelFunc)

	processChild := func(nod *qtree.QueryTreeNode) {
		fieldName := nod.FieldName
		fr, ok := r.fieldResolvers[fieldName]
		if !ok {
			return
		}

		childRc := rc.Child(nod, false)
		fieldCancels[fieldName] = childRc.ctxCancel
		go fr.Execute(childRc, resolver)
	}

	// TODO: Mutex this
	for _, child := range qnode.Children {
		processChild(child)
	}

	qsub := qnode.SubscribeChanges()
	defer qsub.Unsubscribe()
	qsubChanges := qsub.Changes()

	done := rc.ctx.Done()
	for {
		select {
		case qs := <-qsubChanges:
			switch qs.Operation {
			case qtree.Operation_AddChild:
				processChild(qs.Child)
			case qtree.Operation_DelChild:
				childCancel, ok := fieldCancels[qs.Child.FieldName]
				if ok {
					childCancel()
					delete(fieldCancels, qs.Child.FieldName)
				}
			case qtree.Operation_Delete:
				rc.ctxCancel()
				return
			}
		case <-done:
			return
		}
	}
}

// func (r *objectResolver) execute()

// Build resolvers for an object.
func (rt *ResolverTree) buildObjectResolver(pair TypeResolverPair, odef *ast.ObjectDefinition) (Resolver, error) {
	objr := &objectResolver{
		pair:           pair,
		odef:           odef,
		fieldResolvers: make(map[string]Resolver),
	}

	// Foreach field, expect a resolver function.
	for _, field := range odef.Fields {
		if field.Name == nil || field.Name.Value == "" {
			continue
		}

		resolverFunc, err := findResolverFunc(pair.ResolverType, field.Name.Value)
		if err != nil {
			return nil, err
		}

		// Build function executor.
		fieldResolver, err := rt.buildFuncResolver(resolverFunc, field)
		if err != nil {
			return nil, err
		}
		objr.fieldResolvers[field.Name.Value] = fieldResolver
	}

	return objr, nil
}
