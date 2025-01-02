package resolve

//go:generate go run github.com/rgraphql/rgraphql/cmd/rgraphql analyze --schema ../schema.graphql --go-pkg github.com/rgraphql/rgraphql/example/simple --go-query-type RootResolver --go-output ./resolve.rgql.go
