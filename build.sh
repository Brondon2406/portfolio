#!/bin/bash
# build.sh

echo "Building server..."
cd server
npm install
npm run build
cd ..

echo "Building admin..."
cd admin
npm install
npm run build
cd ..

echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Build completed!"