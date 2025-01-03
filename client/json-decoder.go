package client

import (
	"encoding/json"
	"fmt"
	"sync"
)

// JSONDecoder decodes a result tree to a JSON object.
type JSONDecoder struct {
	resultMtx     sync.Mutex
	result        map[string]interface{}
	resultHandler ResultTreeHandler
}

// NewJSONDecoder builds a new json decoder.
// TODO: Arrays are currently unordered
func NewJSONDecoder(qt *QueryTree) *JSONDecoder {
	d := &JSONDecoder{
		result: make(map[string]interface{}),
	}
	d.resultHandler = newJsonDecoderHandler(func(cb func()) {
		d.resultMtx.Lock()
		cb()
		data, _ := json.Marshal(d.result)
		fmt.Printf("Result: %s\n", string(data))
		d.resultMtx.Unlock()
	}, d.result, qt.root)
	return d
}

// GetResultHandler returns the result tree handler.
func (d *JSONDecoder) GetResultHandler() ResultTreeHandler {
	return d.resultHandler
}

// Access locks the result and calls the callback.
// Do not mutate the result object.
func (d *JSONDecoder) Access(cb func(map[string]interface{})) {
	d.resultMtx.Lock()
	defer d.resultMtx.Unlock()

	cb(d.result)
}
