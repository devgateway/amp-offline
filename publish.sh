#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <branchName>"
    exit
fi

BRANCH_NAME=$1

INSTALLERS=`ls | grep -P "(exe|rpm|deb)"`

ssh sulfur "mkdir -p /opt/amp-offline-snapshots/${BRANCH_NAME}"
scp $INSTALLERS sulfur:/opt/amp-offline-snapshots/${BRANCH_NAME}
