package resolve

import (
	"context"
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
)

var contextType = reflect.TypeOf((*context.Context)(nil)).Elem()
var errorType = reflect.TypeOf((*error)(nil)).Elem()

type funcResolver struct {
	f *reflect.Method

	// result resolver
	resultResolver Resolver

	// index of context argument
	contextArg int
	// index of arguments argument
	argsArg int
	// type of arguments argument
	argsType reflect.Type
	// index of output channel argument
	outputChanArg int
	// has an error returned
	returnsError bool
}

func (rt *ResolverTree) buildFuncResolver(f *reflect.Method, rtyp ast.Type) (Resolver, error) {
	res := &funcResolver{f: f}

	// Number of inputs
	ftyp := f.Type
	numIn := ftyp.NumIn()

	// Output type
	var outputType reflect.Type

	// We expect the first argument to be the receiver.
	// Also, this should never NOT be the case, given how we call this func.
	for i := 1; i < numIn; i++ {
		nextIn := ftyp.In(i)

		// Context argument.
		isContext := res.contextArg == 0 &&
			nextIn.Kind() == reflect.Interface &&
			nextIn.Implements(contextType)
		if isContext {
			res.contextArg = i
			continue
		}

		// Struct argument (args)
		isArgs := res.argsArg == 0 &&
			nextIn.Kind() == reflect.Ptr &&
			nextIn.Elem().Kind() == reflect.Struct
		if isArgs {
			argTyp := nextIn.Elem()
			// TODO: assert struct matches arguments.
			res.argsArg = i
			res.argsType = argTyp
			continue
		}

		isOutputChan := res.outputChanArg == 0 &&
			nextIn.Kind() == reflect.Chan
		if isOutputChan {
			// Some extra checks on channels.
			if nextIn.ChanDir() != reflect.SendDir {
				return nil, fmt.Errorf("Argument to %s (idx %d) - %v - output channel must be send-only (chan<-).", ftyp.String(), i, nextIn.String())
			}
			// Our output type is <-chan string
			outputType = reflect.ChanOf(reflect.RecvDir, nextIn.Elem())
			res.outputChanArg = i
			continue
		}

		return nil, fmt.Errorf("Unexpected argument to %s (idx %d) - %v (kind %v)", ftyp.String(), i, nextIn.String(), nextIn.Kind())
	}

	// If we are a live function, expect 1 return (error)
	if res.outputChanArg > 0 {
		if res.contextArg == 0 {
			return nil, fmt.Errorf("Expected context.Context argument to %s - channel-based output requires a context to communicate cancellation.", ftyp.String())
		}
		if ftyp.NumOut() != 1 || ftyp.Out(0) != errorType {
			return nil, fmt.Errorf("Unexpected return signature of %s, expected error only for channel output.", ftyp.String())
		}
		res.returnsError = true
	} else {
		rerr := func() error {
			return fmt.Errorf("Unexpected return signature of %s, expected (result, error) or (result).", ftyp.String())
		}
		if ftyp.NumOut() == 1 {
			if ftyp.Out(0) == errorType {
				return nil, rerr()
			}
		} else if ftyp.NumOut() != 2 || ftyp.Out(1) != errorType {
			return nil, rerr()
		} else {
			res.returnsError = true
		}
		outputType = ftyp.Out(0)
	}

	// Build executor for this function's result.
	resultResolver, err := rt.BuildResolver(TypeResolverPair{
		GqlType:      rtyp,
		ResolverType: outputType,
	})
	if err != nil {
		return nil, err
	}
	res.resultResolver = resultResolver

	return res, nil
}
