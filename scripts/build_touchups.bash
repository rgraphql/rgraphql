#!/bin/bash

typings_issue() {
  echo " -> https://github.com/apollostack/apollo-client/issues/861"
}

echo "Touching up reference to es6-promise..."
typings_issue
sed -i -e '/es6-promise/d' ./lib/**/*.d.ts
