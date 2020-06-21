SHELL := /bin/bash
export GO111MODULE=on
GOLIST=go list -f "{{ .Dir }}" -m

GOLANGCI_LINT=hack/bin/golangci-lint

all:

vendor:
	go mod vendor

$(GOLANGCI_LINT):
	cd ./hack; \
	go build -v \
		-o ./bin/golangci-lint \
		github.com/golangci/golangci-lint/cmd/golangci-lint

lint: $(GOLANGCI_LINT)
	$(GOLANGCI_LINT) run ./...

test:
	go test -v ./...
