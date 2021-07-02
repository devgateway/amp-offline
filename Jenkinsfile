#!/usr/bin/env groovy
pipeline {
  agent any

  environment {
    COMMIT_HASH = "${sh(returnStdout: true, script: 'git rev-parse --short HEAD')}"
    BRANCH_NAME = "${sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD')}"
  }

  stages {
    stage('Prepare') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnlyKey'
        )]) {
          // alpine deps: openssh-client git python3 make g++
          // electronuserland/builder: all above preinstalled
          script {
            try {
              sh 'cp $PRIVKEY id_rsa && docker build -t ampofflinebuilder .'
            } finally {
              sh 'rm -f id_rsa'
            }
          }
        } // withCredentials
      } // steps
    } // Prepare

  } // stages

}
