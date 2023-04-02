#!/bin/bash

# Make sure this script is run in the parent directory of the nodejs lambda functions

# go through all child directories, find if they include package.json, then run npm install for each
for dir in $(find . -name node_modules -prune -o -name package.json -type f);
do
  cd "$dir"
  echo "$dir"
  [ -d "node_modules" ] && rm -r node_modules
  npm install --no-package-lock
  cd -
done
