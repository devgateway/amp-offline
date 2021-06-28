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
          sh 'uptime'
        }
      }
    } // Build

  } // stages

}
