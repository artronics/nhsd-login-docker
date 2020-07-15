#!/bin/ash

cd /usr/src/app || exit
npm run --silent start "$@" | head -n 1
#npm run start "$@"
