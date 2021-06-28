#!/usr/bin/env groovy
pipeline {
  agent {
    label any //'ansible && docker'
  }

  stages {
    stage('Build') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnly'
        )]) {
          docker.image('node:16-alpine').inside(["-v ${env.PRIVKEY}:/root/.ssh/id_rsa"]) {
            sh 'ssh -T -o "StrictHostKeyChecking no" github.com'
          }
        }
      }
    } // Build

  } // stages

}
