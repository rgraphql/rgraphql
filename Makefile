# https://github.com/aperturerobotics/protobuf-project

GOIMPORTS=hack/bin/goimports
GOLANGCI_LINT=hack/bin/golangci-lint
GO_MOD_OUTDATED=hack/bin/go-mod-outdated
GOLIST=go list -f "{{ .Dir }}" -m

export GO111MODULE=on
undefine GOARCH
undefine GOOS

all:

vendor:
	go mod vendor

$(GOIMPORTS):
	cd ./hack; \
	go build -v \
		-o ./bin/goimports \
		golang.org/x/tools/cmd/goimports

$(GOLANGCI_LINT):
	cd ./hack; \
	go build -v \
		-o ./bin/golangci-lint \
		github.com/golangci/golangci-lint/cmd/golangci-lint

$(GO_MOD_OUTDATED):
	cd ./hack; \
	go build -v \
		-o ./bin/go-mod-outdated \
		github.com/psampaz/go-mod-outdated

.PHONY: outdated
outdated: $(GO_MOD_OUTDATED)
	go list -mod=mod -u -m -json all | $(GO_MOD_OUTDATED) -update -direct

.PHONY: list
list: $(GO_MOD_OUTDATED)
	go list -mod=mod -u -m -json all | $(GO_MOD_OUTDATED)

.PHONY: lint
lint: $(GOLANGCI_LINT)
	$(GOLANGCI_LINT) run

.PHONY: fix
fix: $(GOLANGCI_LINT)
	$(GOLANGCI_LINT) run --fix

.PHONY: test
test:
	go test -v ./...
