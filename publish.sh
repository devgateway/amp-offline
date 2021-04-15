#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <branchName>"
    exit
fi

BRANCH_NAME=$1

INSTALLERS=`ls dist/* | grep -P "(32|64).(exe|rpm|deb)"`

echo INSTALLERS=$INSTALLERS

ssh sulfur "mkdir -p /opt/amp-offline-snapshots/${BRANCH_NAME}"
scp $INSTALLERS sulfur.migrated.devgateway.org:/opt/amp-offline-snapshots/${BRANCH_NAME}
