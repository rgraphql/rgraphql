package encoder

import (
	"context"

	pb "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/resolver"
)

// ResultEncoder manages the stream of RGLValue messages for a result tree.
type ResultEncoder struct {
	pathCache *PathCache
	inputChan chan *resolver.Value
}

// NewResultEncoder builds a result encoder.
func NewResultEncoder(cacheSize int) *ResultEncoder {
	return &ResultEncoder{
		pathCache: NewPathCache(cacheSize),
		inputChan: make(chan *resolver.Value),
	}
}

// labelPathComponents decides if any components in the path should be labeled.
func (r *ResultEncoder) labelPathComponents(components []*resolver.Context) {
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
			cmp.PathMtx.Lock()
			isFinal := cmp.IsFinal
			cmp.PathMtx.Unlock()

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
		var nextValue *resolver.Value
		select {
		case <-ctx.Done():
			return
		case nextValue = <-r.inputChan:
		}

		// Rewind until we reach the root or an existing path identifier.
		rootCtx := nextValue.Context
		if rootCtx == nil {
			continue
		}

		isPathRoot := func(c *resolver.Context) bool {
			if c.PathComponent != nil && c.PathComponent.PosIdentifier != 0 {
				// Renew the cache in the same order as the client.
				r.pathCache.Put(c)
				return true
			}

			return c.PathParent == nil
		}

		// Traverse the parents until we reach a suitable root.
		pathComponents := []*resolver.Context{rootCtx}
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
		var posIDRestore uint32
		for i := startFrom; i >= 0; i-- {
			cmp := pathComponents[i]
			pc := cmp.PathComponent

			// If the end of the path has a position identifier
			if mergePosIdentifier && i == len(pathComponents)-2 {
				plc := pathComponents[len(pathComponents)-1].PathComponent
				if plc.PosIdentifier != 0 {
					posIDRestore = pc.PosIdentifier + 1
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
			bin, _ := pc.MarshalVT()
			if i == 0 {
				pc.Value = nil
				pc.Error = ""
			}
			select {
			case <-ctx.Done():
				return
			case outputChan <- bin:
			}
			if posIDRestore != 0 {
				pc.PosIdentifier = posIDRestore - 1
				posIDRestore = 0
			}
		}
	}
}

// WriteValue writes a resolver value to the encoder.
func (r *ResultEncoder) WriteValue(ctx context.Context, value *resolver.Value) {
	select {
	case <-ctx.Done():
		return
	case r.inputChan <- value:
	}
}

var _ resolver.ValueWriter = ((*ResultEncoder)(nil))
