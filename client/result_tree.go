package client

import (
	"sync"

	"github.com/pkg/errors"
	proto "github.com/rgraphql/rgraphql"
)

// ResultTree stores a RGQLValue result space.
// Subscribes to the "query node disposed" channel.
// The minimum depth disposed node is emitted on that channel (only).
// ResultTree stores the []RGQLValue series.
type ResultTree struct {
	mtx sync.Mutex

	cursor    *PathCursor
	pathCache *PathCache
	qtree     *QueryTree

	root *rtNode

	// rootCursor is cloned to make a new cursor
	rootCursor *PathCursor
	// handlers are the result tree handlers
	handlers map[ResultTreeHandler][]*PathCursor
	// cachedCursors are all cursors in the cache
	cachedCursors map[*rtNode][]*PathCursor
}

// NewResultTree builds a new result tree.
func NewResultTree(
	qtree *QueryTree,
	cacheStrategy proto.RGQLValueInit_CacheStrategy,
	cacheSize int,
) (*ResultTree, error) {
	if cacheStrategy != proto.RGQLValueInit_CACHE_LRU {
		return nil, errors.New("cache strategy unsupported")
	}

	rnode := newRtNode(proto.RGQLValue{})
	rt := &ResultTree{
		rootCursor: NewPathCursor(qtree.root, rnode),

		qtree: qtree,
		root:  rnode,

		handlers:      make(map[ResultTreeHandler][]*PathCursor),
		cachedCursors: make(map[*rtNode][]*PathCursor),
	}
	rt.pathCache = NewPathCache(cacheSize, rt.handleCursorEvict)

	return rt, nil
}

// AddResultHandler adds a result tree handler.
// The entire contents of the existing tree are immediately sent to the handler.
func (r *ResultTree) AddResultHandler(handler ResultTreeHandler) {
	r.mtx.Lock()
	defer r.mtx.Unlock()

	if _, exists := r.handlers[handler]; exists {
		return
	}

	r.handlers[handler] = nil
	r.rootCursor.resultHandlers = append(r.rootCursor.resultHandlers, handler)
	r.root.callHandler(handler, func(rtn *rtNode, h ResultTreeHandler) {
		handlerCursors := r.handlers[h]
		cursors := r.cachedCursors[rtn]
		for _, cursor := range cursors {
			cursor.resultHandlers = append(cursor.resultHandlers, h)
			handlerCursors = append(handlerCursors, cursor)
		}
		r.handlers[h] = handlerCursors
	})
}

// RemoveResultHandler removes a result tree handler.
func (r *ResultTree) RemoveResultHandler(handler ResultTreeHandler) {
	r.mtx.Lock()
	defer r.mtx.Unlock()

	cursors, exists := r.handlers[handler]
	if !exists {
		return
	}

	// remove handler from all referenced cursors
	rmFromResultHandlers := func(rhsp *[]ResultTreeHandler) {
		rhs := *rhsp
		for ri := range rhs {
			if rhs[ri] == handler {
				rhs[ri] = rhs[len(rhs)-1]
				rhs[len(rhs)-1] = nil
				rhs = rhs[:len(rhs)-1]
				*rhsp = rhs
				break
			}
		}
	}
	for _, cursor := range cursors {
		rmFromResultHandlers(&cursor.resultHandlers)
	}
	delete(r.handlers, handler)
	rmFromResultHandlers(&r.rootCursor.resultHandlers)
}

// HandleValue handles a rgql value stream.
// This must be called in the same order the messages were emitted.
// If an error is returned, behavior may be somewhat undefined.
func (r *ResultTree) HandleValue(va *proto.RGQLValue) error {
	r.mtx.Lock()
	defer r.mtx.Unlock()

	isFirst := r.cursor == nil
	if isFirst {
		if posID := va.GetPosIdentifier(); posID != 0 {
			posIDCursor := r.pathCache.Get(posID)
			if posIDCursor == nil {
				return errors.Errorf("unknown position id referenced: %d", posID)
			}

			r.cursor = posIDCursor.Clone()
			va.PosIdentifier = 0

			if va.GetValue() != nil {
				r.cursor.Apply(&proto.RGQLValue{Value: va.GetValue()})
				r.cursor = nil
			}
			return nil
		}

		r.cursor = r.rootCursor.Clone()
	}

	// vaHasValue := va.GetValue().GetKind() == proto.RGQLPrimitive_PRIMITIVE_KIND_NULL ||
	// 	va.GetError() != ""
	r.cursor.Apply(va) // Apply applies the segment.
	if posID := va.GetPosIdentifier(); posID != 0 {
		r.pathCache.Set(posID, r.cursor.Clone())
	}
	if va.GetValue() != nil {
		r.cursor = nil
	}

	return nil
}

// handleCursorEvict handles a cursor being evicted from the cache.
// eviction always occurs during a call tree that has locked r.mtx
func (r *ResultTree) handleCursorEvict(cursor *PathCursor) {
	if cursor.rnode != nil {
		// Purge the cursor from the rnode set
		rCursors, rCursorsOk := r.cachedCursors[cursor.rnode]
		if rCursorsOk {
			for ri := range rCursors {
				if rCursors[ri] == cursor {
					rCursors[ri] = rCursors[len(rCursors)-1]
					rCursors[len(rCursors)-1] = nil
					rCursors = rCursors[:len(rCursors)-1]
					break
				}
			}
			if len(rCursors) > 0 {
				r.cachedCursors[cursor.rnode] = rCursors
			} else {
				delete(r.cachedCursors, cursor.rnode)
			}
		}
	}

	for _, handler := range cursor.resultHandlers {
		handlerCursors, handlerCursorsOk := r.handlers[handler]
		if !handlerCursorsOk {
			continue
		}

		for ri, ric := range handlerCursors {
			if cursor == ric {
				handlerCursors[ri] = handlerCursors[len(handlerCursors)-1]
				handlerCursors[len(handlerCursors)-1] = nil
				handlerCursors = handlerCursors[:len(handlerCursors)-1]
				break
			}
		}

		r.handlers[handler] = handlerCursors
	}
}
