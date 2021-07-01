#!/usr/bin/env groovy
pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnlyKey'
        )]) {
          withDockerContainer(image: 'node:16-alpine', args: '-v $PRIVKEY:/root/.ssh/id_rsa') {
            sh 'ssh -T -o "StrictHostKeyChecking no" github.com'
          } // withDockerContainer
        } // withCredentials
      } // steps
    } // Build

  } // stages

}
