package client

import (
	"github.com/rgraphql/rgraphql/varstore"
)

// qtVarStoreHandler attaches the variable store callbacks to the query tree.
type qtVarStoreHandler struct {
	qt *QueryTree
}

// newQtVarStoreHandler builds a new variable store handler.
func newQtVarStoreHandler(qt *QueryTree) *qtVarStoreHandler {
	return &qtVarStoreHandler{qt: qt}
}

// HandleVariableAdded handles a variable being added to the store.
func (q *qtVarStoreHandler) HandleVariableAdded(vb *varstore.Variable) {
	q.qt.pendingVariables = append(q.qt.pendingVariables, vb.ASTVariable.CloneVT())
}

// HandleVariableRemoved handles a variable being purged from the store.
func (q *qtVarStoreHandler) HandleVariableRemoved(vb *varstore.Variable) {
	// Query tree does not care.
}

// _ is a type assertion
var _ varstore.VariableStoreHandler = ((*qtVarStoreHandler)(nil))
