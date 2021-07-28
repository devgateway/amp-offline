#!/usr/bin/env groovy
pipeline {
  agent any

  environment {
    jobName = "${env.JOB_NAME.replaceAll('[^\\p{Alnum}-]', '_').toLowerCase()}"
  }

  stages {
    stage('Dependencies') {
      steps {
        withCredentials([sshUserPrivateKey(
          keyFileVariable: 'PRIVKEY',
          credentialsId: 'GitHubDgReadOnlyKey'
        )]) {
          script {
            sh """
              cp \$PRIVKEY id_rsa \\
                && jq --sort-keys --compact-output --from-file package.jq package.json >package.min.json \\
                && docker build -f deps.Dockerfile -t ${env.jobName}-deps .
            """
          }
        } // withCredentials
      } // steps

      post {
        cleanup { script { sh 'rm -f id_rsa package.min.json' } }
      }
    } // Dependencies

    stage('Main') {
      steps {
        script {
          sh """
            sed -i 's/#jobName#/${env.jobName}/' Dockerfile \\
              && docker build -f Dockerfile -t ${env.jobName}-builder .
          """
        }
      } // steps
    } // Main

    stage('Build & QA') {
      failFast true
      parallel {

        stage('Renderer') {
          steps {
            script {
              def binds = [
                'app',
                'resources',
                'webpack.config.production.js'
              ].collect({"-v '${env.WORKSPACE}/${it}:/project/${it}:ro'"})
              sh """
                docker run --rm \\
                  ${binds.join(' ')} \\
                  -v '${env.jobName}-dist:/project/dist:rw' \\
                  ${env.jobName}-builder npm run build-renderer
              """
            }
          } // steps
        } // Renderer

        stage('Test') {
          steps {
            script {
              def binds = [
                'app',
                'test',
                '.gitignore',
                '.eslintrc',
                'webpack.config.test.js',
                'webpack.config.development.js'
              ].collect({"-v '${env.WORKSPACE}/${it}:/project/${it}:ro'"})
              sh """
                docker run --rm \\
                  ${binds.join(' ')} \\
                  ${env.jobName}-builder npm run test-mocha
              """
            }
          } // steps
        } // Test

        stage('Lint') {
          steps {
            script {
              def binds = [
                'app',
                'test',
                '.gitignore',
                '.eslintrc',
                'webpack.config.test.js',
                'webpack.config.development.js'
              ].collect({"-v '${env.WORKSPACE}/${it}:/project/${it}:ro'"})
              sh """
                docker run --rm \\
                  ${binds.join(' ')} \\
                  ${env.jobName}-builder npm run test-mocha
              """
            }
          } // steps
        } // Test

      } // parallel
    } // Build & QA

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
            environment {
              ARTIFACT_DIR = "package-${PKG}-${ARCH}"
            }

            steps {
              script {
                sh """
                  mkdir -p '${env.ARTIFACT_DIR}' \\
                    && docker run --rm \\
                      -v '${env.jobName}-dist:/project/dist:ro' \\
                      -v '${env.jobName}-cache-${PKG}${ARCH}:/root/.cache:rw' \\
                      -v '${env.WORKSPACE}/${env.ARTIFACT_DIR}:/project/package:rw' \\
                      ${env.jobName}-builder sh -c \\
                      "FORCE_COLOR=0 npm run package-${PKG}-${ARCH} && chown -R \$(id -u) package"
                """
                dir("${env.ARTIFACT_DIR}") {
                  archiveArtifacts artifacts: "*.exe,*.deb,*.rpm", onlyIfSuccessful: true
                  deleteDir()
                }
              } // script
            }
          } // Package
        }
      } // matrix

      post {
        cleanup { script { sh "docker volume rm '${env.jobName}-dist'" } }
        success {
          echo "Build succeeded, and the artifacts available at: ${env.RUN_ARTIFACTS_DISPLAY_URL}"
        }
      }
    } // Package All

  } // stages

}
