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
              def commitHash = "${sh(returnStdout: true, script: 'git rev-parse --short HEAD')}"
              def branchName = "${sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD')}"
              sh """
                cp \$PRIVKEY id_rsa \\
                  && docker build -t ampofflinebuilder \\
                    --build-arg COMMIT_HASH=${commitHash.trim()} \\
                    --build-arg BRANCH_NAME=${branchName.trim()} \\
                    . \\
                  && mkdir -p dist
              """
            } finally {
              sh 'rm -f id_rsa'
            }
          }
        } // withCredentials
      } // steps
    } // Prepare

    stage('Package All') {
      matrix {
        axes {
          axis {
            name 'PLATFORM'
            values 'win', 'deb'
          }
          axis {
            name 'ARCH'
            values '32', '64'
          }
        }

        stages {
          stage('Package') {
            steps {
              script {
                def bindDir = "${env.WORKSPACE}/dist/${PLATFORM}/${ARCH}"

                sh "mkdir -p \"${bindDir}\""
                withDockerContainer(
                  image: 'ampofflinebuilder',
                  args: "-v \"${bindDir}:/project/dist:rw\""
                ) {
                  sh "ls -l * && npm run package-${PLATFORM}-${ARCH} 2>&1"
                }
              } // script
            }
          } // Package
        }
      }
    } // Package All

  } // stages

}
