#!/usr/bin/env groovy
pipeline {
  agent any

  stages {
    stage('Prepare') {
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
        sh 'docker build -f Dockerfile -t ampofflinebuilder .'
        /*
        withDockerContainer(image: 'electronuserland/builder:wine', args: '-v $PRIVKEY:/root/.ssh/id_rsa') {
          sh 'ssh -T -o "StrictHostKeyChecking no" github.com'
        } // withDockerContainer
        */
      } // withCredentials
    } // Prepare

    stage('Build') {
      steps {
      } // steps
    } // Build

  } // stages

}
