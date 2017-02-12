package resolve

import (
	"context"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
)

type objectResolver struct {
	// Go type and GraphQL type
	pair TypeResolverPair
	// Type name
	typeName reflect.Value
	// Field resolvers
	fieldResolvers map[string]Resolver
	// Fields marked as arrays
	arrayFields map[string]bool
	// Introspection resolver
	introspectResolver reflect.Value
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

		childRc := rc.Child(nod, false, r.arrayFields[fieldName])
		fieldCancels[fieldName] = childRc.ctxCancel
		if fieldName == "__typename" {
			go fr.Execute(childRc, r.typeName)
		} else if fieldName == "__schema" || fieldName == "__type" {
			go fr.Execute(childRc, r.introspectResolver)
		} else {
			go fr.Execute(childRc, resolver)
		}
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

// Build resolvers for an object.
func (rt *ResolverTree) buildObjectResolver(pair TypeResolverPair, odef *ast.ObjectDefinition) (Resolver, error) {
	objr := &objectResolver{
		pair:           pair,
		typeName:       reflect.ValueOf(odef.Name.Value),
		fieldResolvers: make(map[string]Resolver),
		arrayFields:    make(map[string]bool),
	}
	rt.Resolvers[pair] = objr

	objr.introspectResolver = reflect.ValueOf(&introspect.ObjectResolver{
		Lookup:         rt.Lookup,
		AST:            odef,
		SchemaResolver: rt.IntrospectionResolver,
	})

	// Foreach field, expect a resolver function.
	for _, field := range odef.Fields {
		if field.Name == nil || field.Name.Value == "" {
			continue
		}

		var resolverType reflect.Type
		switch field.Name.Value {
		case "__schema":
			fallthrough
		case "__type":
			resolverType = introspect.ObjectResolverType
		default:
			resolverType = pair.ResolverType
		}

		resolverFunc, err := findResolverFunc(resolverType, field.Name.Value)
		if err != nil {
			return nil, err
		}

		// Build function executor.
		fieldResolver, err := rt.buildFuncResolver(resolverFunc, field)
		if err != nil {
			return nil, err
		}
		objr.fieldResolvers[field.Name.Value] = fieldResolver

		// Strip not-null, check if list
		ftyp := field.Type
		if nn, ok := ftyp.(*ast.NonNull); ok {
			ftyp = nn.Type
		}
		if _, ok := ftyp.(*ast.List); ok {
			objr.arrayFields[field.Name.Value] = true
		}
	}

	tnResolver, err :=
		rt.buildPrimitiveResolver(reflect.TypeOf(""), stringTypeRef)
	if err != nil {
		return nil, err
	}
	objr.fieldResolvers["__typename"] = tnResolver

	return objr, nil
}
