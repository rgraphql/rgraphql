package resolver

import (
	"github.com/rgraphql/rgraphql/qtree"
)

// FieldResolver resolves a field on an object.
type FieldResolver func(rctx *Context)

// LookupFieldResolver looks up the field resolver by field name.
// Returns nil if not found.
type LookupFieldResolver func(fieldName string) FieldResolver

// ResolveObject watches the query node fields and executes field resolvers.
func ResolveObject(rctx *Context, lookupFieldResolver LookupFieldResolver) {
	qnode := rctx.QNode

	fieldCancels := make(map[uint32]func())
	processChild := func(nod *qtree.QueryTreeNode) {
		fieldName := nod.FieldName
		fr := lookupFieldResolver(fieldName)
		if fr == nil {
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
