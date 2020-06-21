package varstore

import (
	"sync"

	"github.com/rgraphql/magellan/types"
	proto "github.com/rgraphql/rgraphql"
)

// VariableStore stores and de-duplicates variable references.
type VariableStore struct {
	mtx       sync.Mutex
	nextID    uint32
	variables map[uint32]*Variable
	handler   VariableStoreHandler
}

// VariableStoreHandler handles variable store events.
type VariableStoreHandler interface {
	// HandleVariableAdded handles a variable being added to the store.
	HandleVariableAdded(vb *Variable)
	// HandleVariableRemoved handles a variable being purged from the store.
	HandleVariableRemoved(vb *Variable)
}

// NewVariableStore builds a new variable store.
func NewVariableStore(handler VariableStoreHandler) *VariableStore {
	return &VariableStore{
		variables: make(map[uint32]*Variable),
		nextID:    1,
		handler:   handler,
	}
}

// unpackValue converts a Primitive into a Go value.
func unpackValue(prim *proto.RGQLPrimitive) interface{} {
	switch prim.Kind {
	case proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL:
		return prim.GetBoolValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_INT:
		return prim.GetIntValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT:
		return prim.GetFloatValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_STRING:
		return prim.GetStringValue()
	default:
		return nil
	}
}

// Put stores a AST variable from proto in the store.
// The value is unpacked and stored.
// Existing references are not overwritten.
func (vs *VariableStore) Put(varb *proto.ASTVariable) {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	vb, eok := vs.variables[varb.Id]
	if !eok {
		vb = NewVariable(*varb)
		vs.variables[varb.Id] = vb
		if vs.handler != nil {
			vs.handler.HandleVariableAdded(vb)
		}
	}

	if varb.Id > vs.nextID {
		vs.nextID = varb.Id + 1
	}
}

// Get looks up a variable by ID and adds a reference.
// The variable remains in the store until all references are closed.
func (vs *VariableStore) Get(id uint32) *VariableReference {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	existing, ok := vs.variables[id]
	if ok && existing != nil {
		return existing.AddReference()
	}

	return nil
}

// GetOrPutWithValue gets or creates a variable with a value, returning a reference.
func (vs *VariableStore) GetOrPutWithValue(val *proto.RGQLPrimitive) *VariableReference {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	for _, ev := range vs.variables {
		if types.IsPrimEquiv(val, ev.ASTVariable.GetValue()) {
			return ev.AddReference()
		}
	}

	nid := vs.nextID
	vs.nextID++
	nv := NewVariable(proto.ASTVariable{
		Id:    nid,
		Value: val,
	})
	vs.variables[nid] = nv
	if vs.handler != nil {
		vs.handler.HandleVariableAdded(nv)
	}
	return nv.AddReference()
}

// GarbageCollect sweeps the variable store and purges any 0-ref variables.
func (vs *VariableStore) GarbageCollect() {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	for id, varb := range vs.variables {
		if !varb.HasReferences() {
			delete(vs.variables, id)
			if vs.handler != nil {
				vs.handler.HandleVariableRemoved(varb)
			}
		}
	}
}

// Variable pairs a variable ID to a value.
type Variable struct {
	// ASTVariable is the AST value for the variable.
	proto.ASTVariable

	// referenceCtr is the reference counter.
	referenceCtr uint32
	// refMtx guards the reference mutex
	refMtx sync.RWMutex
	// references contains all variable reference handles.
	references map[uint32]*VariableReference
}

// NewVariable builds a new variable.
func NewVariable(varb proto.ASTVariable) *Variable {
	return &Variable{
		ASTVariable: varb,
		references:  make(map[uint32]*VariableReference),
	}
}

// HasReferences checks if the variable has any references.
func (v *Variable) HasReferences() bool {
	v.refMtx.RLock()
	defer v.refMtx.RUnlock()
	return len(v.references) > 0
}

// AddReference locks the reference mutex and adds a new reference.
func (v *Variable) AddReference() *VariableReference {
	v.refMtx.Lock()
	defer v.refMtx.Unlock()

	v.referenceCtr++
	id := v.referenceCtr
	ref := &VariableReference{
		refID: id,
		vb:    v,
	}
	v.references[id] = ref
	return ref
}

// VariableReference is a variable reference handle.
type VariableReference struct {
	refID uint32
	vb    *Variable
	once  sync.Once
}

// GetValue returns the variable's value.
func (r *VariableReference) GetValue() *proto.RGQLPrimitive {
	return r.vb.Value
}

// GetVarID returns the variable ID
func (r *VariableReference) GetVarID() uint32 {
	return r.vb.Id
}

// Unsubscribe removes the variable reference.
func (r *VariableReference) Unsubscribe() {
	r.once.Do(func() {
		r.vb.refMtx.Lock()
		defer r.vb.refMtx.Unlock()

		delete(r.vb.references, r.refID)
	})
}
