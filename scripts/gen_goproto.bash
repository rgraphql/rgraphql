#!/bin/bash
set -eo pipefail

ROOT_DIR=$(pwd)

echo "Generating proto .pb.go files..."
if [ -d  ./pkg/proto ]; then
  rm -rf ./pkg/proto
fi

protowrap \
  -I ${ROOT_DIR} \
  -I ${GOPATH}/src \
  -I ${ROOT_DIR}/node_modules \
  --go_out=${ROOT_DIR}/pkg/ \
  --print_structure \
  --only_specified_files \
  ${ROOT_DIR}/src/*.proto

echo "Moving go files around..."
pushd pkg/
mv src proto

pushd proto
find . -name '*.pb.go' -exec sed -i -e 's# "src/# "github.com/rgraphql/rgraphql/pkg/proto/#g' {} \;
popd && popd

pushd pkg/
echo "Simpifying code..."
find . -name '*.pb.go' -exec gofmt -w -s {} \;

echo "Installing code..."
go install ./...
popd
