#!/bin/bash
cd `dirname $0`/$(dirname `readlink $0`)
./data/bin/node --harmony ./data/src/cli.js $@ & wait
