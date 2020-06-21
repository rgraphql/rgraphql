package server

import (
	"context"

	"github.com/rgraphql/magellan/qtree"
	proto "github.com/rgraphql/rgraphql"
)

// queryExecution represents a single executing query.
type queryExecution struct {
	ctx       context.Context
	ctxCancel context.CancelFunc

	qid        uint32
	outpChan   <-chan []byte
	cacheSize  uint32
	cacheStrat proto.RGQLValueInit_CacheStrategy
	qt         *qtree.QueryTreeNode
}

// QueryId returns the query ID for the execution.
func (e *queryExecution) QueryId() uint32 {
	return e.qid
}

// Output returns the query execution output channel.
func (e *queryExecution) Output() <-chan []byte {
	return e.outpChan
}

// CacheSize returns the cache size used.
func (e *queryExecution) CacheSize() uint32 {
	return e.cacheSize
}

// CacheStrategy returns the cache strategy used.
func (e *queryExecution) CacheStrategy() proto.RGQLValueInit_CacheStrategy {
	return e.cacheStrat
}
