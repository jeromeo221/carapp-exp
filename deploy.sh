#! /bin/bash

npm install -g serverless
npm install serverless-offline serverless-dotenv-plugin

mkdir -p .serverless
cp -r $CODEBUILD_SRC_DIR/artifacts/$env/* $PWD/.serverless
serverless deploy --stage $env --package .serverless -v