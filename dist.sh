#!/bin/bash

rm -r dist

# Command to be executed in the container. First it creates linux packages (4 files, rpm/deb x 32/64).
# Then create two Windows (NSIS) installers once at a time since doing both at the same time will result in one
# installer supporting 32 and 64 bit architectures.
# Last step changes ownership of the installers from root:root to user that launched this script.
DIST_CMD="
    npm run build &&
    npm run package-win-64 && rename 's/.exe/-64.exe/' dist/*.exe &&
    chown -R $(id -u):$(id -g) dist node_modules"

docker run --rm -t -v ${PWD}:/project \
	-v amp-client-electron:/root/.electron \
	-v amp-client-cache:/root/.cache \
	electronuserland/electron-builder:wine /bin/bash -c "$DIST_CMD"

# Clean ~/.electron, execute only if really needed
# docker volume rm amp-client-electron

# Clean ~/.cache, execute only if really needed
# docker volume rm amp-client-cache
