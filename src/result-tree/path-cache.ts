import { PathCursor } from './path-cursor'
import { LRUMap } from 'lru_map'

// PathCacheEvictHandler is called when a cursor is evicted from the cache.
export type PathCacheEvictHandler = (cursor: PathCursor) => void

// PathCache implements a mutual path aliasing scheme with a server.
export class PathCache {
  // cache contains cached path cursors
  private cache: LRUMap<number, PathCursor>
  // evictCb is the eviction callback
  private evictCb: PathCacheEvictHandler | null

  constructor(size: number, evictCb: PathCacheEvictHandler | null) {
    this.evictCb = evictCb
    this.cache = new LRUMap<number, PathCursor>(size)
  }

  // get retrieves a cursor by key, registering use
  public get(key: number): PathCursor | null {
    return this.cache.get(key) || null
  }

  // reset resets the cache
  public reset() {
    this.cache.clear()
  }

  // set sets the cursor by key and value
  public set(key: number, val: PathCursor) {
    this.setWithEvict(key, val)
  }

  // setWithEvict sets the key to the value.
  // the map is checked to see if any values will be evicted.
  // if so, the evicted value is shifted first and emitted to the callback
  private setWithEvict(key: number, value: PathCursor) {
    let cacheSize = this.cache.size
    let cacheLimit = this.cache.limit
    let exists = this.cache.has(key)
    if (cacheSize === cacheLimit && !exists) {
      let removedTuple = this.cache.shift()
      if (this.evictCb && removedTuple) {
        this.evictCb(removedTuple[1])
      }
    }
    this.cache.set(key, value)
  }
}
