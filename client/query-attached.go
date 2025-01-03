package client

// qtAttachedQuery is a query attached to the query tree.
type qtAttachedQuery struct {
	// query is the referenced query
	query *Query
	// qtNodes are the query tree nodes referenced by this query.
	qtNodes []*qtNode
}

func newQtAttachedQuery(query *Query) *qtAttachedQuery {
	return &qtAttachedQuery{query: query}
}

// appendChildNode adds a qtNode to the query.
func (q *qtAttachedQuery) appendQueryNode(n *qtNode) {
	q.qtNodes = append(q.qtNodes, n)
}
