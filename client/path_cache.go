package client

import (
	"github.com/hashicorp/golang-lru/v2"
)

// PathCacheEvictHandler is called when a cursor is evicted from the cache.
type PathCacheEvictHandler func(*PathCursor)

// PathCache implements a mutual path aliasing scheme with a server.
type PathCache struct {
	cache   *lru.Cache[uint32, *PathCursor]
	evictCb PathCacheEvictHandler
}

// NewPathCache builds a path cache.
func NewPathCache(size int, evictCb PathCacheEvictHandler) *PathCache {
	c := &PathCache{evictCb: evictCb}
	cache, err := lru.NewWithEvict(size, c.onEvicted)
	if err != nil {
		panic(err)
	}
	c.cache = cache
	return c
}

// Get returns the value with the key.
func (p *PathCache) Get(key uint32) *PathCursor {
	val, ok := p.cache.Get(key)
	if !ok {
		return nil
	}
	return val
}

// Set sets a value in the cache.
func (p *PathCache) Set(key uint32, val *PathCursor) {
	p.cache.Add(key, val)
}

// onEvicted handles when a key is evicted from the cache.
func (p *PathCache) onEvicted(key uint32, value *PathCursor) {
	if p.evictCb == nil {
		return
	}
	p.evictCb(value)
}
