package main

import (
	"fmt"

	"github.com/graphql-go/graphql/gqlerrors"
	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/graphql-go/graphql/language/source"
	"github.com/rgraphql/rgraphql/schema"
)

func main() {

	scm, err := schema.Parse(`
type Person {
	name: String
	height: Int
}

type RootQuery {
	allPeople: [Person]
}

schema {
	query: RootQuery
}
	`)
	if err != nil {
		panic(err)
	}
	_ = scm

	request := `
query {
	allPeople {
		height
	}
}
	`

	source := source.NewSource(&source.Source{
		Body: []byte(request),
		Name: "GraphQL request",
	})

	queryAst, err := parser.Parse(parser.ParseParams{Source: source})
	if err != nil {
		errors := gqlerrors.FormatErrors(err)
		panic(errors)
	}

	if len(queryAst.Definitions) != 1 {
		panic("expected a single definition in query")
	}

	queryInter := queryAst.Definitions[0]
	query, queryOk := queryInter.(*ast.OperationDefinition)
	if !queryOk {
		panic("expected a query operation definition")
	}

	fmt.Printf("%#v\n", query)
}
