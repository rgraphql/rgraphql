package encoding

import (
	"context"

	"github.com/golang/protobuf/proto"
	"github.com/rgraphql/magellan/execution"
	pb "github.com/rgraphql/rgraphql/pkg/proto"
)

// ResultEncoder manages the stream of RGLValue messages for a result tree.
type ResultEncoder struct {
	pathCache *PathCache
	inputChan chan *execution.ResolverValue
}

// NewResultEncoder builds a result encoder.
func NewResultEncoder(cacheSize int) *ResultEncoder {
	return &ResultEncoder{
		pathCache: NewPathCache(cacheSize),
		inputChan: make(chan *execution.ResolverValue),
	}
}

// labelPathComponents decides if any components in the path should be labeled.
func (r *ResultEncoder) labelPathComponents(components []*execution.ResolverContext) {
	// If the length is small enough, it's not worth the cache space.
	/*
		if len(components) < 2 {
			return
		}
	*/

	// We have the choice of where to put the label, if at all.
	// We want to label any live fields, since they are likely to change.
	// We also want to label any fields that have pending children.
	for _, cmp := range components[:len(components)-1] {
		labeled := func() bool {
			cmp.Lock.Lock()
			isFinal := cmp.IsFinal
			cmp.Lock.Unlock()

			// If the field is final (no new values will be emitted) and there are no children,
			// then labeling it is pointless.
			if isFinal {
				return false
			}

			// Label this field.
			r.pathCache.Put(cmp)
			return true
		}()
		if labeled {
			break
		}
	}
}

// Run starts the ResultEncoder.
func (r *ResultEncoder) Run(ctx context.Context, outputChan chan<- []byte) {
	defer func() {
		close(outputChan)
	}()

	for {
		var nextValue *execution.ResolverValue
		select {
		case <-ctx.Done():
			return
		case nextValue = <-r.inputChan:
		}

		// Rewind until we reach the root or an existing path identifier.
		rootCtx := nextValue.Context
		isPathRoot := func(c *execution.ResolverContext) bool {
			if c.PathComponent.PosIdentifier != 0 {
				// Renew the cache in the same order as the client.
				r.pathCache.Put(c)
				return true
			}

			return c.PathParent == nil
		}

		// Traverse the parents until we reach a suitable root.
		pathComponents := []*execution.ResolverContext{rootCtx}
		for !isPathRoot(rootCtx) {
			rootCtx = rootCtx.PathParent
			pathComponents = append(pathComponents, rootCtx)
		}

		// Determine if we want to label any nodes with an identifier.
		r.labelPathComponents(pathComponents)

		// Serialize the path and the element.
		// Note: index 0 is the end of the path (with the value)
		//       index len(pathComponents)-1 is the beginning of the path
		startFrom := len(pathComponents) - 1
		startComponent := pathComponents[startFrom].PathComponent
		mergePosIdentifier := startComponent.PosIdentifier != 0 && pathComponents[startFrom-1].PathComponent.PosIdentifier == 0
		if mergePosIdentifier {
			startFrom--
		}
		var posIdRestore uint32
		for i := startFrom; i >= 0; i-- {
			cmp := pathComponents[i]
			pc := cmp.PathComponent

			// If the end of the path has a position identifier
			if mergePosIdentifier && i == len(pathComponents)-2 {
				plc := pathComponents[len(pathComponents)-1].PathComponent
				if plc.PosIdentifier != 0 {
					posIdRestore = pc.PosIdentifier + 1
					pc.PosIdentifier = plc.PosIdentifier
				}
			} else if i == len(pathComponents)-1 && pc.PosIdentifier != 0 {
				pc = &pb.RGQLValue{PosIdentifier: pc.PosIdentifier}
			}

			if i == 0 {
				if nextValue.Error != nil {
					pc.Error = nextValue.Error.Error()
				} else {
					pc.Value = nextValue.Value
				}
			}
			bin, err := proto.Marshal(pc)
			if err != nil {
				panic(err)
			}
			if i == 0 {
				pc.Value = nil
				pc.Error = ""
			}
			select {
			case <-ctx.Done():
				return
			case outputChan <- bin:
			}
			if posIdRestore != 0 {
				pc.PosIdentifier = posIdRestore - 1
				posIdRestore = 0
			}
		}
	}
}

// WriteValue writes a resolver value to the encoder.
func (r *ResultEncoder) WriteValue(value *execution.ResolverValue) {
	r.inputChan <- value
}
