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
          script {
            docker.image('node:16-alpine').inside(["-v ${env.PRIVKEY}:/root/.ssh/id_rsa"]) {
              sh 'ssh -T -o "StrictHostKeyChecking no" github.com'
            }
          }
        }
      }
    } // Build

  } // stages

}
