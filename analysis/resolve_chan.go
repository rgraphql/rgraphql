package analysis

import (
	"fmt"
	gast "go/ast"
	gtypes "go/types"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
)

// A chan value creates a stream of values over time.
// This can be leveraged to make complex live fields or arrays.
type chanValueResolver struct {
	// elemResolver Resolver
}

// GetName returns the name.
func (r *chanValueResolver) GetName() string {
	return ""
}

// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
func (r *chanValueResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
	return nil, nil
}

// GenerateGoASTRef generates the Go statements to call the resolver.
func (r *chanValueResolver) GenerateGoASTRef() ([]gast.Stmt, error) {
	return nil, nil
}

var _ Resolver = ((*chanValueResolver)(nil))

/*

// Execute handles a chan value.
func (cv *chanValueResolver) Execute(rc *ResolverContext, value reflect.Value) {
	doneVal := reflect.ValueOf(rc.Context.Done())
	if value.IsNil() {
		rc.SetValue(reflect.ValueOf(nil), true)
		return
	}

	var child *ResolverContext
	for {
		chosen, recv, recvOk := reflect.Select([]reflect.SelectCase{
			{
				Chan: value,
				Dir:  reflect.SelectRecv,
			},
			{
				Chan: doneVal,
				Dir:  reflect.SelectRecv,
			},
		})
		if chosen == 1 || !recvOk {
			if child != nil {
				child.Purge()
			}
			return
		}
		if child == nil {
			child = rc.VirtualChild()
		}
		go cv.elemResolver.Execute(child, recv)
	}
}
*/

// buildChanValueResolver builds a resolver to handle a channel representing a live value.
func (rt *modelBuilder) buildChanValueResolver(value *gtypes.Chan, gnode ast.Node) (Resolver, error) {
	if value.Dir() != gtypes.RecvOnly {
		return nil, fmt.Errorf(
			"expected recv only channel, got %s",
			value.String(),
		)
	}

	elemResolver, err := rt.buildResolver(typeResolverPair{
		ASTType:      gnode,
		ResolverType: value.Elem(),
	})
	if err != nil {
		return nil, err
	}
	_ = elemResolver

	/*
		return &chanValueResolver{
			elemResolver: elemResolver,
		}, nil
	*/

	return nil, errors.Errorf("chan value resolver unimplemented: %#v", value.String())
}
