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
              /* TODO: set hash/branch at later phase
              sh """
                cp \$PRIVKEY id_rsa \\
                  && docker build -t ampofflinebuilder \\
                    --build-arg COMMIT_HASH=${commitHash.trim()} \\
                    --build-arg BRANCH_NAME=${branchName.trim()} \\
                    . \\
                  && mkdir -p dist
              """
              */
              sh """
                cp \$PRIVKEY id_rsa \\
                  && docker build -t ampofflinebuilder .
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
            name 'SCRIPT'
            values 'lint', 'test-mocha', 'package-win', 'package-deb'
          }
          axis {
            name 'ARCH'
            values 'null', '32', '64'
          }
        }

        stages {
          stage('QA') {
            when {
              expression { ARCH == 'null' && ! SCRIPT.startsWith('package-') }
            }
            steps {
              script {
                sh """
                  docker run --rm \\
                    -v '${env.WORKSPACE}/test:/project/test:ro' \\
                    -v '${env.WORKSPACE}/.gitignore:/project/.gitignore:ro' \\
                    -v '${env.WORKSPACE}/.eslintrc:/project/.eslintrc:ro' \\
                    ampofflinebuilder npm run ${SCRIPT}
                """
              }
            }
          } // QA

          stage('Package') {
            when {
              expression { ARCH != 'null' && SCRIPT.startsWith('package-') }
            }
            steps {
              script {
                def jobName = "${env.JOB_NAME}-${SCRIPT}${ARCH}".replaceAll('[^\\p{Alnum}-]', '_')

                sh """
                  docker run --rm \\
                    -v '${jobName}-cache:/root/.cache:rw' \\
                    ampofflinebuilder npm run ${SCRIPT}-${ARCH}
                """
              } // script
            }
          } // Package
        }
      }
    } // Package All

  } // stages

}
