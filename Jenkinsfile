#!/usr/bin/env groovy
pipeline {
  agent any

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
