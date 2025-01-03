package introspect

import (
	"strings"

	"github.com/graphql-go/graphql/language/ast"
)

// ASTLookup can look up pointers to type definitions.
type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}

// Resolver for various introspection fields on an object.
type ObjectResolver struct {
	Lookup         ASTLookup
	AST            *ast.ObjectDefinition
	SchemaResolver *SchemaResolver
}

// Schema resolves the __schema field on an object.
func (sr *ObjectResolver) Schema() *SchemaResolver {
	return sr.SchemaResolver
}

// Type resolves the __type field on an object.
func (sr *ObjectResolver) Type() *TypeResolver {
	return &TypeResolver{
		Lookup: sr.Lookup,
		AST:    sr.AST,
	}
}

// SchemaResolver resolves fields on the __schema object.
type SchemaResolver struct {
	Lookup    ASTLookup
	RootQuery ast.TypeDefinition

	NamedTypes map[string]ast.TypeDefinition
}

// QueryType returns the root query type of the schema.
func (r *SchemaResolver) QueryType() *TypeResolver {
	if r.RootQuery == nil {
		return nil
	}
	return &TypeResolver{
		Lookup: r.Lookup,
		AST:    r.RootQuery,
	}
}

// Directives returns the list of directive resolvers.
func (r *SchemaResolver) Directives() []*DirectiveResolver {
	// Currently no directives are supported.
	// Live and defer are both implied. @if, etc need to be implemented.
	return []*DirectiveResolver{}
}

// Types finds all named types on the schema.
func (r *SchemaResolver) Types() []*TypeResolver {
	res := make([]*TypeResolver, len(r.NamedTypes))
	i := 0
	for _, typ := range r.NamedTypes {
		res[i] = &TypeResolver{
			AST:    typ,
			Lookup: r.Lookup,
		}
		i++
	}
	return res
}

// TypeResolver resolves fields on the __type object.
type TypeResolver struct {
	Lookup ASTLookup
	// NameCache overrides the name in ast.
	NameCache string
	AST       ast.Node
}

// Kind resolves the kind of the Type.
func (r *TypeResolver) Kind() string {
	// kindSrc == ScalarDefinition
	kindSrc := r.AST.GetKind()
	kindSrc = strings.TrimSuffix(kindSrc, "Definition")
	kindSrc = strings.ToUpper(kindSrc)
	return kindSrc
}

type namedType interface {
	GetName() *ast.Name
}

func resolveNamedType(typ ast.Node) (typeName *string) {
	named, ok := typ.(namedType)
	if !ok {
		return
	}
	name := named.GetName()
	if name == nil || name.Value == "" {
		return
	}
	return &name.Value
}

// Name resolves the name of the Type.
func (r *TypeResolver) Name() (typeName *string) {
	if r.NameCache != "" {
		return &r.NameCache
	}
	name := resolveNamedType(r.AST)
	if name != nil {
		r.NameCache = *name
	}
	return name
}

// Description resolves the description of the Type.
func (r *TypeResolver) Description() *string {
	// The AST for some reason doesn't parse comments.
	return nil
}

// Fields returns a list of fields on a type.
func (r *TypeResolver) Fields() []*FieldResolver {
	objd, ok := r.AST.(*ast.ObjectDefinition)
	if !ok {
		return nil
	}
	res := []*FieldResolver{}
	// res := make([]*FieldResolver, len(objd.Fields))
	for _, field := range objd.Fields {
		if field.Name == nil || strings.HasPrefix(field.Name.Value, "__") {
			continue
		}
		res = append(res, &FieldResolver{
			Lookup: r.Lookup,
			AST:    field,
		})
	}
	return res
}

// Fields returns a list of fields on a type.
func (r *TypeResolver) InputFields() []*InputValueResolver {
	// TODO: figure out how to resolve this.
	return []*InputValueResolver{}
}

// Interfaces returns a list of interfaces a type implements.
func (r *TypeResolver) Interfaces() []*TypeResolver {
	// TODO: implement interfaces.
	return make([]*TypeResolver, 0)
}

// PossibleTypes returns a list of possible types a interface could be.
func (r *TypeResolver) PossibleTypes() []*TypeResolver {
	// TODO: implement this, and interfaces
	return make([]*TypeResolver, 0)
}

// EnumValues returns all the possible values of an enum.
func (r *TypeResolver) EnumValues(args *struct{ IncludeDeprecated bool }) []*EnumValueResolver {
	ed, ok := r.AST.(*ast.EnumDefinition)
	if !ok {
		return nil
	}
	res := make([]*EnumValueResolver, len(ed.Values))
	for i, val := range ed.Values {
		res[i] = &EnumValueResolver{
			Lookup: r.Lookup,
			AST:    val,
		}
	}
	return res
}

// OfType resolves the __type field of an array.
func (sr *TypeResolver) OfType() *TypeResolver {
	list, ok := sr.AST.(*ast.List)
	if !ok {
		return nil
	}
	return &TypeResolver{
		Lookup: sr.Lookup,
		AST:    sr.Lookup.LookupType(list.Type),
	}
}

// FieldResolver resolves information about a field.
type FieldResolver struct {
	Lookup ASTLookup
	AST    *ast.FieldDefinition
}

// Type resolves the type of a field.
func (r *FieldResolver) Type() *TypeResolver {
	aste := r.Lookup.LookupType(r.AST.Type)
	if aste == nil {
		return nil
	}
	return &TypeResolver{
		Lookup: r.Lookup,
		AST:    aste,
	}
}

// IsDeprecated checks if a field is deprecated.
func (e *FieldResolver) IsDeprecated() bool {
	return false
}

// DeprecationReason returns the reason a field was deprecated, if any
func (e *FieldResolver) DeprecationReason() *string {
	return nil
}

// Name resolves the name of a field.
func (f *FieldResolver) Name() string {
	return f.AST.Name.Value
}

// Description returns the description of a field.
func (f *FieldResolver) Description() *string {
	// TODO: figure out descriptions for fields.
	return nil
}

// Args returns the arguments of a field.
func (f *FieldResolver) Args() []*InputValueResolver {
	res := make([]*InputValueResolver, len(f.AST.Arguments))
	for i, arg := range f.AST.Arguments {
		res[i] = &InputValueResolver{
			Lookup: f.Lookup,
			AST:    arg,
		}
	}
	return res
}

// EnumValueResolver resolves information about an enum value.
type EnumValueResolver struct {
	Lookup ASTLookup
	AST    *ast.EnumValueDefinition
}

// Name returns the name of an enum value.
func (e *EnumValueResolver) Name() string {
	return e.AST.Name.Value
}

// Description gets the description of an enum value.
func (e *EnumValueResolver) Description() *string {
	return nil
}

// IsDeprecated checks if an enum value is deprecated.
func (e *EnumValueResolver) IsDeprecated() bool {
	return false
}

// DeprecationReason returns the reason a value was deprecated, if any.
func (e *EnumValueResolver) DeprecationReason() *string {
	return nil
}

// InputValueResolver resolves information about input values.
type InputValueResolver struct {
	Lookup ASTLookup
	AST    *ast.InputValueDefinition
}

// Name returns the name of the input value.
func (r *InputValueResolver) Name() string {
	return r.AST.Name.Value
}

// Description returns the description of the input value.
func (r *InputValueResolver) Description() *string {
	return nil
}

// Type returns the type information of the input value.
func (r *InputValueResolver) Type() *TypeResolver {
	return &TypeResolver{
		Lookup: r.Lookup,
		AST:    r.Lookup.LookupType(r.AST.Type),
	}
}

// DefaultValue returns the graphql-formatted string of the default value.
func (r *InputValueResolver) DefaultValue() string {
	if r.AST.DefaultValue == nil {
		return ""
	}
	vstr, _ := r.AST.DefaultValue.GetValue().(string)
	return vstr
}

// DirectiveResolver resolves information about a directive.
type DirectiveResolver struct{}

// Name returns the name of the directive.
func (r *DirectiveResolver) Name() string {
	return ""
}

// Description returns the description of the directive.
func (r *DirectiveResolver) Description() string {
	return ""
}

// Args returns the arguments of the directive.
func (r *DirectiveResolver) Args() []*InputValueResolver {
	return nil
}

// Locations returns the locations of the directive.
func (r *DirectiveResolver) Locations() []string {
	return nil
}
