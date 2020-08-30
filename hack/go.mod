module tools

go 1.14

// note: protobuf is intentionally held at 1.3.x
replace github.com/golang/protobuf => github.com/golang/protobuf v1.3.5

require (
	github.com/golang/protobuf v1.4.2
	github.com/golangci/golangci-lint v1.30.0
	github.com/square/goprotowrap v0.0.0-20190116012208-bb93590db2db
)
