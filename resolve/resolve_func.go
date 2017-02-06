package resolve

import (
	"context"
	"fmt"
	"reflect"
	"sort"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/types"
	"github.com/rgraphql/magellan/util"
)

var contextType = reflect.TypeOf((*context.Context)(nil)).Elem()
var errorType = reflect.TypeOf((*error)(nil)).Elem()

type funcResolver struct {
	f *reflect.Method

	// result resolver
	resultResolver Resolver
	// Type of returned data.
	resultType reflect.Type

	// field name this func is assigned to
	fieldName string
	// index of context argument
	contextArg int
	// index of arguments argument
	argsArg int
	// type of arguments argument
	argsType reflect.Type
	// map from field name -> arg field index
	argsFields map[string][]int
	// index of output channel argument
	outputChanArg int
	// has an error returned
	returnsError bool
}

type funcResolverArg struct {
	index int
	value reflect.Value
}

type funcResolverArgs []*funcResolverArg

func (f funcResolverArgs) Len() int {
	return len(f)
}

func (f funcResolverArgs) Less(i, j int) bool {
	argi := f[i]
	argj := f[j]
	return argi.index < argj.index
}

func (f funcResolverArgs) Swap(i, j int) {
	tmp := f[i]
	f[i] = f[j]
	f[j] = tmp
}

func (fr *funcResolver) Execute(ctx context.Context, rc *resolutionContext, valOf reflect.Value) {
	qnode := rc.qnode
	fmt.Printf("Exec func %#v (%s)\n", valOf.Interface(), qnode.FieldName)
	var args funcResolverArgs
	if fr.contextArg > 0 {
		args = append(args, &funcResolverArg{
			index: fr.contextArg,
			value: reflect.ValueOf(ctx),
		})
	}
	if fr.argsArg > 0 {
		// Build arguments object.
		argVal := reflect.New(fr.argsType)
		for fieldName, fieldIndex := range fr.argsFields {
			varRef, varOk := qnode.Arguments[fieldName]
			if !varOk {
				continue
			}
			argVal.FieldByIndex(fieldIndex).Set(reflect.ValueOf(varRef.Value))
		}
		args = append(args, &funcResolverArg{
			index: fr.argsArg,
			value: argVal,
		})
	}
	var outputChan reflect.Value
	if fr.outputChanArg > 0 {
		// Build output channel, no buffer.
		outputChanType := reflect.ChanOf(reflect.BothDir, fr.resultType)
		outputChanSendType := reflect.ChanOf(reflect.SendDir, fr.resultType)
		outputChan = reflect.MakeChan(outputChanType, 0)
		outputChanSend := outputChan.Convert(outputChanSendType)
		args = append(args, &funcResolverArg{
			index: fr.outputChanArg,
			value: outputChanSend,
		})
	}

	method := valOf.Method(fr.f.Index)
	sort.Sort(args)
	argsr := make([]reflect.Value, len(args))
	for i, a := range args {
		argsr[i] = a.value
	}

	// Trigger another goroutine to yield to other functions that might execute.
	// Furthermore, we can ditch the entire parent scope.
	go fr.executeFunc(ctx, rc, method, argsr, outputChan)
}

// Actually execute the function and handle the result.
func (fr *funcResolver) executeFunc(ctx context.Context,
	rc *resolutionContext,
	method reflect.Value,
	args []reflect.Value,
	outputChan reflect.Value) {

	var returnedChan chan bool
	var returnVals []reflect.Value
	isStreaming := fr.outputChanArg > 0
	done := ctx.Done()
	doneVal := reflect.ValueOf(done)

	if isStreaming {
		returnedChan = make(chan bool, 1)
		returnedChanVal := reflect.ValueOf(returnedChan)
		go func() {
			for {
				chosen, recv, recvOk := reflect.Select([]reflect.SelectCase{
					{
						Chan: outputChan,
						Dir:  reflect.SelectRecv,
					},
					{
						Chan: returnedChanVal,
						Dir:  reflect.SelectRecv,
					},
					{
						Chan: doneVal,
						Dir:  reflect.SelectRecv,
					},
				})
				if chosen > 0 || !recvOk {
					return
				}
				go fr.resultResolver.Execute(ctx, rc, recv)
			}
		}()
	}

	returnVals = method.Call(args)
	if returnedChan != nil {
		// Signal to the output channel receiver to stop work.
		returnedChan <- true
	}

	// Identify returned things.
	var result reflect.Value
	var errorVal reflect.Value

	if !isStreaming {
		result = returnVals[0]
	}
	if fr.returnsError {
		if isStreaming {
			errorVal = returnVals[0]
		} else {
			errorVal = returnVals[1]
		}
	}

	// TODO: Handle error here, if returned.
	_ = errorVal
	// TODO: Create sub-context for the function itself, cancel it after it returns.
	if isStreaming {
		// TODO: handle channel results.
	} else if !fr.returnsError || errorVal.IsNil() {
		go fr.resultResolver.Execute(ctx, rc, result)
	}
	// TODO: Process return value.
}

func (rt *ResolverTree) buildFuncResolver(f *reflect.Method, fieldt *ast.FieldDefinition) (Resolver, error) {
	res := &funcResolver{f: f, fieldName: fieldt.Name.Value}

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
			res.argsFields = make(map[string][]int)
			for _, arg := range fieldt.Arguments {
				fieldExportedName := util.ToPascalCase(arg.Name.Value)
				matchedArgField, ok := argTyp.FieldByName(fieldExportedName)
				if !ok {
					return nil, fmt.Errorf("Expected field %s on argument type %s.", fieldExportedName, argTyp.String())
				}
				res.argsFields[arg.Name.Value] = matchedArgField.Index
				fieldKind := matchedArgField.Type.Kind()
				astKind, ok := types.AstPrimitiveKind(arg.Type)
				if ok && astKind != fieldKind {
					return nil, fmt.Errorf("Expected field %s on argument type %s to be a %v, found %v", fieldExportedName, argTyp.String(), astKind, fieldKind)
				}
				// TODO: JSON conversion to named type
			}
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
			outputType = nextIn.Elem()
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
		GqlType:      fieldt.Type,
		ResolverType: outputType,
	})
	if err != nil {
		return nil, err
	}
	res.resultResolver = resultResolver
	res.resultType = outputType

	return res, nil
}
