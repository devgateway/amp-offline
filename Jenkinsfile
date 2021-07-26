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
                && docker build -f deps.Dockerfile -t ${env.jobName}-deps .
            """
          }
        } // withCredentials
      } // steps

      post {
        cleanup { script { sh 'rm -f id_rsa' } }
      }
    } // Dependencies

    stage('Build & Test') {
      failFast true
      parallel {

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

        stage('Renderer') {
          steps {
            script {
              sh """
                docker run --rm \\
                  -v '${env.WORKSPACE}/app:/project/app:ro' \\
                  -v '${env.WORKSPACE}/resources:/project/resources:ro' \\
                  -v '${env.WORKSPACE}/webpack.config.production.js:/project/webpack.config.production.js:ro' \\
                  -v '${env.jobName}-dist:/project/dist:rw' \\
                  ${env.jobName}-builder npm run build-renderer
              """
            }
          } // steps
        } // Renderer

        stage('Test') {
          steps {
            script {
              sh """
                docker run --rm \\
                  -v '${env.WORKSPACE}/app:/project/app:ro' \\
                  -v '${env.WORKSPACE}/test:/project/test:ro' \\
                  -v '${env.WORKSPACE}/.gitignore:/project/.gitignore:ro' \\
                  -v '${env.WORKSPACE}/.eslintrc:/project/.eslintrc:ro' \\
                  ${env.jobName}-builder npm run test-mocha
              """
            }
          } // steps
        } // Test

        stage('ESLint') {
          steps {
            script {
              sh """
                docker run --rm \\
                  -v '${env.WORKSPACE}/app:/project/app:ro' \\
                  -v '${env.WORKSPACE}/.gitignore:/project/.gitignore:ro' \\
                  -v '${env.WORKSPACE}/.eslintrc:/project/.eslintrc:ro' \\
                  ${env.jobName}-builder npm run test-mocha
              """
            }
          } // steps
        } // Test

      } // parallel
    } // Build & Test

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
                sh """
                  docker run --rm \\
                    -v '${env.jobName}-dist:/project/dist:ro' \\
                    -v '${env.jobName}-cache-${PKG}${ARCH}:/root/.cache:rw' \\
                    ${env.jobName}-builder sh -c 'npm run package-${PKG}-${ARCH} && ls -R package'
                """
              } // script
            }
          } // Package
        }
      }
    } // Package All

  } // stages

}
