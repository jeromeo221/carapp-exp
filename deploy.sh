#! /bin/bash

npm install -g serverless
npm install

serverless deploy --stage $env --package $CODEBUILD_SRC_DIR/artifacts/$env -v