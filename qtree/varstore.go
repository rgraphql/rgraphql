package qtree

import (
	"sync"

	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// Storage of variable data on the server.
type VariableStore struct {
	Variables map[uint32]*Variable

	mtx sync.Mutex
}

func NewVariableStore() *VariableStore {
	return &VariableStore{
		Variables: make(map[uint32]*Variable),
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

func (vs *VariableStore) Put(varb *proto.ASTVariable) {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	vb, eok := vs.Variables[varb.Id]
	if !eok {
		vb = NewVariable(varb.Id)
	}
	vb.Value = unpackValue(varb.Value)
	vs.Variables[varb.Id] = vb
}

func (vs *VariableStore) Get(id uint32) *VariableReference {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	existing, ok := vs.Variables[id]
	if ok && existing != nil {
		return existing.AddReference()
	}
	return nil
}

func (vs *VariableStore) GarbageCollect() {
	vs.mtx.Lock()
	defer vs.mtx.Unlock()

	for id, varb := range vs.Variables {
		if !varb.HasReferences() {
			delete(vs.Variables, id)
		}
	}
}

type Variable struct {
	Id         uint32
	Value      interface{}
	References map[uint32]*VariableReference

	referenceCtr uint32
	refMtx       sync.RWMutex
}

func NewVariable(id uint32) *Variable {
	return &Variable{
		Id:         id,
		References: make(map[uint32]*VariableReference),
	}
}

func (v *Variable) HasReferences() bool {
	v.refMtx.RLock()
	defer v.refMtx.RUnlock()
	return len(v.References) > 0
}

func (v *Variable) AddReference() *VariableReference {
	v.refMtx.Lock()
	defer v.refMtx.Unlock()

	v.referenceCtr++
	id := v.referenceCtr
	ref := &VariableReference{
		Id:    v.Id,
		Value: v.Value,
		refId: id,
		vb:    v,
	}
	v.References[id] = ref
	return ref
}

type VariableReference struct {
	Id    uint32
	Value interface{}

	refId uint32
	vb    *Variable
	once  sync.Once
}

func (vr *VariableReference) Unsubscribe() {
	vr.once.Do(func() {
		vr.vb.refMtx.Lock()
		defer vr.vb.refMtx.Unlock()

		delete(vr.vb.References, vr.refId)
	})
}
