node('node') {
    currentBuild.result = "SUCCESS"

    try {

       stage 'Checkout'

            checkout scm

       stage 'Test'

            env.NODE_ENV = "test"

            print "Environment will be : ${env.NODE_ENV}"

            sh 'node -v'
            sh 'npm prune'
            sh 'npm install'
            sh 'npm test'

       stage 'Build'

            sh 'npm run package'

       stage 'Deploy'

            echo 'Push to a remote server so it can be downloaded'

       stage 'Cleanup'

            echo 'prune and cleanup'
            sh 'npm prune'
            sh 'rm node_modules -rf'
            slackSend(channel: 'amp-ci', color: 'good', message: "project build successful")
            mail body: '',
                        from: 'jdeanquin@developmentgateway.org',
                        replyTo: 'jdeanquin@developmentgateway.org',
                        subject: 'project build successful',
                        to: 'jdeanquin@developmentgateway.org'

        }


    catch (err) {

        currentBuild.result = "FAILURE"
		slackSend(channel: 'amp-offline-ci', color: 'warning', message: "project build error is here: ${env.BUILD_URL}")
        throw err
    }

}