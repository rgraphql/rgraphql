package execution

import (
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

type listResolver struct {
	isPtr        bool
	elemResolver Resolver
}

func (lr *listResolver) Execute(rc *ResolverContext, resolver reflect.Value) {
	rc.SetPrimitiveKind(proto.RGQLPrimitive_PRIMITIVE_KIND_ARRAY)
	if lr.isPtr {
		if resolver.IsNil() {
			rc.SetValue(reflect.ValueOf(nil), true)
			return
		}
		resolver = resolver.Elem()
	}

	count := resolver.Len()
	if count == 0 {
		// Send a [] to fill the field.
		rc.SetValue(reflect.ValueOf(make([]string, 0)), true)
		return
	}

	for i := 0; i < count; i++ {
		iv := resolver.Index(i)
		child := rc.ArrayChild(i)
		if rc.IsSerial {
			lr.elemResolver.Execute(child, iv)
		} else {
			go lr.elemResolver.Execute(child, iv)
		}
	}
}

type chanListResolver struct {
	*listResolver
}

func (fr *chanListResolver) Execute(rc *ResolverContext, resolver reflect.Value) {
	rc.SetPrimitiveKind(proto.RGQLPrimitive_PRIMITIVE_KIND_ARRAY)

	if resolver.IsNil() {
		rc.SetValue(reflect.ValueOf(nil), true)
		return
	}

	done := rc.Context.Done()
	doneVal := reflect.ValueOf(done)
	idx := 0
	for {
		// resolver = <-chan string
		// select {
		chosen, recv, recvOk := reflect.Select([]reflect.SelectCase{
			// case rval := <-resolver:
			{
				Chan: resolver,
				Dir:  reflect.SelectRecv,
			},
			// case <-ctx.Done()
			{
				Chan: doneVal,
				Dir:  reflect.SelectRecv,
			},
		})
		switch chosen {
		case 0:
			if !recvOk {
				return
			}
			child := rc.ArrayChild(idx)
			go fr.elemResolver.Execute(child, recv)
			idx++
			continue
		case 1:
			return
		}
	}
}

func (rt *modelBuilder) buildListResolver(pair typeResolverPair, ldef *ast.List) (Resolver, error) {
	rtType := pair.ResolverType
	rtKind := rtType.Kind()
	isPtr := rtKind == reflect.Ptr
	if isPtr {
		rtType = pair.ResolverType.Elem()
		rtKind = rtType.Kind()
	}
	isChan := rtKind == reflect.Chan
	if isChan {
		if rt.SerialOnly {
			return nil, fmt.Errorf("Cannot accept non-immediate result in mutations (at %s - mutations cannot return deferred values).", pair.ResolverType.String())
		}
		if rtType.ChanDir() != reflect.RecvDir {
			return nil, fmt.Errorf("Invalid array type %s, (should be a %v, is a %v)", pair.ResolverType.String(), reflect.RecvDir, pair.ResolverType.ChanDir())
		}
	} else {
		if rtKind != reflect.Slice {
			return nil, fmt.Errorf("Expected array type, got %v (should be a slice or a chan).", pair.ResolverType.String())
		}
	}

	// The type in the pair will be a []*ResolverType or []ResolverType or <-chan ResolverType etc...
	arrElem := rtType.Elem()
	if arrElem.Kind() == reflect.Ptr {
		arrElem = arrElem.Elem()
	}

	var cres *chanListResolver
	res := &listResolver{isPtr: isPtr}
	if isChan {
		cres = &chanListResolver{listResolver: res}
		rt.Resolvers[pair] = cres
	} else {
		rt.Resolvers[pair] = res
	}

	// Follow list element
	elemResolver, err := rt.buildResolver(typeResolverPair{
		ResolverType: arrElem,
		Type:         ldef.Type,
	})
	if err != nil {
		return nil, err
	}
	res.elemResolver = elemResolver

	if isChan {
		return cres, nil
	}

	return res, nil
}
