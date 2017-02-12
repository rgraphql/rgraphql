package schema

import (
	"context"
	"fmt"
	"testing"
)

var testSchema string = `
type Person {
	name: String
	friends: [String]
	parents: [String]
}

type RootQuery {
	people(age: Int): [Person]
}

schema {
	query: RootQuery
}
`

type RootQueryResolver struct{}

func (*RootQueryResolver) People(ctx context.Context, args *struct{ Age int }) []*PersonResolver {
	return []*PersonResolver{{}, {}}
}

type PersonResolver struct{}

func (r *PersonResolver) Name() *string {
	res := "Tiny"
	return &res
}

func (r *PersonResolver) Friends(ctx context.Context, outp chan<- string) error {
	res := []string{
		"Jim",
		"Tom",
		"Bill",
	}
	for _, e := range res {
		outp <- e
	}
	return nil
}

func (r *PersonResolver) Parents() <-chan <-chan string {
	outp := make(chan<- chan string)
	res := []string{
		"Jim",
		"Tom",
		"Bill",
	}
	for _, e := range res {
		och := make(chan string, 1)
		och <- e
		outp <- och
	}
	return nil
}

func TestBuildSchema(t *testing.T) {
	schema, err := Parse(testSchema)
	if err != nil {
		t.Fatal(err.Error())
	}

	err = schema.SetResolvers(&RootQueryResolver{})
	if err != nil {
		t.Fatal(err.Error())
	}
}
