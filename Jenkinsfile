#!/usr/bin/env groovy
pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnly'
        )]) {
          sh 'uptime'
        }
      }
    } // Build

  } // stages

}
