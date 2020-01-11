#! /bin/bash

npm install -g serverless
npm install serverless-offline serverless-dotenv-plugin

npm list -g --depth=0
mkdir -p -v $CODEBUILD_SRC_DIR$CODEBUILD_SRC_DIR/artifacts/$env
cp -r -v $CODEBUILD_SRC_DIR/artifacts/$env/* $CODEBUILD_SRC_DIR$CODEBUILD_SRC_DIR/artifacts/$env
serverless deploy --stage $env --package $CODEBUILD_SRC_DIR/artifacts/$env -v