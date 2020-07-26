module tools

go 1.14

// note: protobuf is intentionally held at 1.3.x
replace github.com/golang/protobuf => github.com/golang/protobuf v1.3.5

require github.com/golangci/golangci-lint v1.27.0
