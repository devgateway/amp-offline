#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <branchName>"
    exit
fi

BRANCH_NAME=$1

ssh sulfur "mkdir -p /opt/amp-offline-snapshots/${BRANCH_NAME}"
scp dist/*.exe sulfur:/opt/amp-offline-snapshots/${BRANCH_NAME}
