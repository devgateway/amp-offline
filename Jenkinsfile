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
            name 'PKG'
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
                def jobName = "${env.JOB_NAME}-${PKG}${ARCH}".replaceAll('[^\\p{Alnum}-]', '_')
                def distVolume = "${jobName}-dist"
                def cacheVolume = "${jobName}-cache"

                sh """
                  docker run --rm -i \\
                    -v '${distVolume}:/project/dist:rw' \\
                    -v '${cacheVolume}:/root/.cache:rw' \\
                    ampofflinebuilder npm run package-${PKG}-${ARCH}
                """
              } // script
            }
          } // Package
        }
      }
    } // Package All

  } // stages

}
