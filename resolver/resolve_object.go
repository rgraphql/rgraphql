package resolver

import (
	"github.com/rgraphql/rgraphql/qtree"
	"github.com/rgraphql/rgraphql/schema"
)

// FieldResolver resolves a field on an object.
type FieldResolver func(rctx *Context)

// FieldTable is a mapping between field ID and resolver.
type FieldTable map[uint32]FieldResolver

// ResolveObject watches the query node fields and executes field resolvers.
func ResolveObject(rctx *Context, table FieldTable) {
	qnode := rctx.QNode

	fieldCancels := make(map[uint32]func())
	processChild := func(nod *qtree.QueryTreeNode) {
		fieldName := nod.FieldName
		fieldNameHash := schema.HashFieldName(fieldName)
		fr, ok := table[fieldNameHash]
		if !ok {
			return
		}

		childRc := rctx.FieldChild(nod)
		fieldCancels[nod.Id] = childRc.Purge
		go fr(childRc)

		/*
			var resArg reflect.Value
			if fieldName == "__typename" {
				resArg = r.typeName
			} else if fieldName == "__schema" || fieldName == "__type" {
				resArg = r.introspectResolver
			} else {
				resArg = resolver
			}
		*/
	}

	for _, child := range qnode.Children {
		processChild(child)
	}

	qsub := qnode.SubscribeChanges()
	defer qsub.Unsubscribe()
	qsubChanges := qsub.Changes()

	done := rctx.Context.Done()
	for {
		select {
		case qs := <-qsubChanges:
			switch qs.Operation {
			case qtree.Operation_AddChild:
				processChild(qs.Child)
			case qtree.Operation_DelChild:
				id := qs.Child.Id
				childCancel, ok := fieldCancels[id]
				if ok {
					childCancel()
					delete(fieldCancels, id)
				}
			case qtree.Operation_Delete:
				rctx.Purge()
				return
			}
		case <-done:
			return
		}
	}
}
