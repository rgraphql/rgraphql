module github.com/rgraphql/magellan

go 1.16

// note: protobuf is intentionally held at 1.3.x
replace github.com/golang/protobuf => github.com/golang/protobuf v1.3.5

require (
	github.com/davecgh/go-spew v1.1.1
	github.com/golang/protobuf v1.3.5
	github.com/graphql-go/graphql v0.7.9
	github.com/hashicorp/golang-lru v0.5.4
	github.com/pkg/errors v0.9.1
	github.com/rgraphql/rgraphql v1.0.7
	github.com/sirupsen/logrus v1.6.0
	github.com/urfave/cli v1.22.4
	golang.org/x/tools master
)
