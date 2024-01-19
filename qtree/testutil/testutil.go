package testutil

import (
	"bytes"
	"testing"

	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/qtree"
	"github.com/rgraphql/rgraphql/schema"
)

// MockSchemaSrc is a mock schema source code fragment.
var MockSchemaSrc = `
type Person {
	name: String
	height: Int
}

type RootQuery {
    counter: Int
	allPeople: [Person]
	names: [String]!
    singlePerson: Person
}

schema {
	query: RootQuery
}
`

// BuildMockTree builds a mock schema and query tree.
func BuildMockTree(t *testing.T, schemaFrags ...string) (
	*schema.Schema,
	*qtree.QueryTreeNode,
	<-chan *proto.RGQLQueryError,
) {
	var schemaBuf bytes.Buffer
	if len(schemaFrags) == 0 {
		_, _ = schemaBuf.WriteString(MockSchemaSrc)
	} else {
		for _, frag := range schemaFrags {
			_, _ = schemaBuf.WriteString(frag)
			_, _ = schemaBuf.WriteString("\n")
		}
	}

	sch, err := schema.Parse(schemaBuf.String())
	if err != nil {
		t.Fatal(err.Error())
	}
	errCh := make(chan *proto.RGQLQueryError, 10)
	qt, err := sch.BuildQueryTree(errCh)
	if err != nil {
		t.Fatal(err.Error())
	}
	return sch, qt, errCh
}
