Schema:

type Person {
	name: String
	steps: Int
	parents: [String]
}

type RootQuery {
	allPeople: [Person]
}

schema {
	query: RootQuery
}
`

Query:

allPeople {
	name
	parents
}

Later we add steps to allPeople, and then remove it, to demonstrate updating a
query over time.
