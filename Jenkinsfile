#!/usr/bin/env groovy
pipeline {
  agent {
    docker {
      image 'electronuserland/builder:wine'
    }
  }

  stages {

    stage('Build') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnlyKey'
        )]) {
          // alpine deps: openssh-client git python3 make g++
          // electronuserland/builder: all above preinstalled
          sh 'head /etc/apt/sources.list'
          /*
          withDockerContainer(image: 'electronuserland/builder:wine', args: '-v $PRIVKEY:/root/.ssh/id_rsa') {
            sh 'ssh -T -o "StrictHostKeyChecking no" github.com'
          } // withDockerContainer
          */
        } // withCredentials
      } // steps
    } // Build

  } // stages

}
