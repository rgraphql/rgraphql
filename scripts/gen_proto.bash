#!/bin/bash
JSON_OUTPUT_PATH=./.tmp.json
PBJS=./node_modules/protobufjs/bin/pbjs

if [ ! -d "./scripts" ]; then
  if [ -n "$ATTEMPTED_CD_DOTDOT" ]; then
    echo "You need to run this from the root of the project."
    exit 1
  fi
  set -e
  cd ../ && ATTEMPTED_CD_DOTDOT=yes $@
  exit 0
fi

write_definitions() {
  JSON_PATH=$1
  DEFS_PATH=$2
  INTERFACES_PATH=$3

  echo "Generated json, $(cat $JSON_PATH | wc -l) lines."
  echo "/* tslint:disable:trailing-comma */" > $DEFS_PATH
  echo "/* tslint:disable:quotemark */" >> $DEFS_PATH
  echo "/* tslint:disable:max-line-length */" >> $DEFS_PATH
  echo "export const PROTO_DEFINITIONS = $(cat ${JSON_PATH});" >> $DEFS_PATH

  cat $JSON_PATH | node ./scripts/gen_typings.js > $INTERFACES_PATH
}

set -e
${PBJS} \
  -p $(pwd)/node_modules/protobufjs \
  -t json \
  $(pwd)/src/*.proto > \
  ${JSON_OUTPUT_PATH}

write_definitions ${JSON_OUTPUT_PATH} \
  ./src/proto/definitions.ts \
  ./src/proto/interfaces.ts

sed -i -e "s/\"package\": null/\"package\": <any>null/g" ./src/proto/definitions.ts
sed -i -e "s/\"fields\": \\[/\"fields\": <any[]>[/g" ./src/proto/definitions.ts
rm ${JSON_OUTPUT_PATH} || true
