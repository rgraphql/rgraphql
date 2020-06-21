package encoder

import (
	"github.com/hashicorp/golang-lru"
	"github.com/rgraphql/magellan/resolver"
	"sync"
)

// PathCache builds a mutual path aliasing scheme with a client.
type PathCache struct {
	idLock sync.Mutex
	id     uint32
	cache  *lru.Cache
}

// NewPathCache builds a path cache.
func NewPathCache(size int) *PathCache {
	c := &PathCache{id: 1}
	cache, err := lru.NewWithEvict(size, c.onEvicted)
	if err != nil {
		panic(err)
	}
	c.cache = cache
	return c
}

// onEvicted handles when a key is evicted from the cache.
func (p *PathCache) onEvicted(key interface{}, value interface{}) {
	ctx := value.(*resolver.Context)

	ctx.PathMtx.Lock()
	defer ctx.PathMtx.Unlock()

	id := key.(uint32)
	if ctx.PathComponent == nil || id != ctx.PathComponent.PosIdentifier {
		return
	}
	ctx.PathComponent.PosIdentifier = 0
}

// Put adds or renews a resolver context alias ID.
func (p *PathCache) Put(ctx *resolver.Context) (added bool, id uint32) {
	pathComponent := ctx.PathComponent
	id = pathComponent.PosIdentifier
	if id == 0 {
		p.idLock.Lock()
		id := p.id
		p.id++
		p.idLock.Unlock()

		pathComponent.PosIdentifier = id
		added = true
	}

	p.cache.Add(id, ctx)
	return
}
