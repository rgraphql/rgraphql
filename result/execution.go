package result

import (
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// QueryExecution represents a running result tree.
type QueryExecution interface {
	// QueryId returns the ID of the query.
	QueryId() uint32
	// Output returns the output channel.
	Output() <-chan []byte
	// CacheSize returns the cache size used.
	CacheSize() uint32
	// CacheStrategy returns the cache type used.
	CacheStrategy() proto.RGQLValueInit_CacheStrategy
}
