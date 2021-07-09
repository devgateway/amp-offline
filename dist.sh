#!/bin/bash

rm -fr dist

TARGET=$3
echo TARGET=$TARGET

# Prepare package command to execute based on the target input
CMD_WIN_32="npm run package-win-32 && rename 's/.exe/-32.exe/' dist/*.exe"
CMD_WIN_64="npm run package-win-64 && rename 's/.exe/-64.exe/' dist/*.exe"
CMD_WIN_64_AFTER_WIN_32="
    rename 's/.exe/.e32/' dist/*-32.exe &&
    $CMD_WIN_64 &&
    rename 's/.e32/.exe/' dist/*.e32"
RENAME_DEB32="rename 's/i386.deb/32.deb/' dist/*i386.deb"
RENAME_DEB64="rename 's/amd64.deb/64.deb/' dist/*amd64.deb"
RENAME_RPM32="rename 's/i686.rpm/32.rpm/' dist/*i686.rpm"
RENAME_RPM64="rename 's/x86_64.rpm/64.rpm/' dist/*x86_64.rpm"
CMD_LINUX="npm run package-linux && $RENAME_DEB32 && $RENAME_DEB64 && $RENAME_RPM32 && $RENAME_RPM64"
CMD_DEB32="npm run package-deb-32 && $RENAME_DEB32"
CMD_DEB64="npm run package-deb-64 && $RENAME_DEB64"


CMD_TARGET=""
if [[ $TARGET == *"win32"* ]]; then
  CMD_TARGET="$CMD_TARGET && $CMD_WIN_32"
  CMD_WIN_64=$CMD_WIN_64_AFTER_WIN_32
fi
if [[ $TARGET == *"win64"* ]]; then
  CMD_TARGET="$CMD_TARGET && $CMD_WIN_64"
fi
if [[ $TARGET == *"linux"* ]]; then
  CMD_TARGET="$CMD_TARGET && $CMD_LINUX"
fi
if [[ $TARGET == *"deb32"* ]]; then
  CMD_TARGET="$CMD_TARGET && $CMD_DEB32"
fi
if [[ $TARGET == *"deb64"* ]]; then
  CMD_TARGET="$CMD_TARGET && $CMD_DEB64"
fi

# Command to be executed in the container. First it creates linux packages (4 files, rpm/deb x 32/64).
# Then create two Windows (NSIS) installers once at a time since doing both at the same time will result in one
# installer supporting 32 and 64 bit architectures.
# Last step changes ownership of the installers from root:root to user that launched this script.
DIST_CMD="
    npm run build $CMD_TARGET;
    chown -R $(id -u):$(id -g) ."

echo DIST_CMD=$DIST_CMD

docker run --dns=8.8.8.8 --rm -t -v ${PWD}:/project \
	-v amp-client-electron:/root/.electron \
	-v amp-client-cache:/root/.cache \
	-e PR_NR=$1 -e JENKINS_BRANCH=$2 \
	electronuserland/builder:wine /bin/bash -c "$DIST_CMD"

# Clean ~/.electron, execute only if really needed
# docker volume rm amp-client-electron

# Clean ~/.cache, execute only if really needed
# docker volume rm amp-client-cache
