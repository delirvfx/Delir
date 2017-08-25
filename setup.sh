#!/bin/sh
yarn
yarn rebuild
ln -s ../src/delir-core node_modules/delir-core
