#!groovy

// Important: What is BRANCH_NAME?
// It is branch name for builds triggered from branches.
// It is PR-<pr-id> for builds triggered from pull requests.
def tag
if (BRANCH_NAME ==~ /feature\/AMP-\d+.*/) {
    def jiraId = (BRANCH_NAME =~ /feature\/AMP-(\d+).*/)[0][1]
    tag = "feature-${jiraId}"
} else {
    tag = BRANCH_NAME.replaceAll(/[^a-zA-Z0-9_-]/, "-").toLowerCase()
}

// Record original branch or pull request for cleanup jobs
def branch = env.CHANGE_ID == null ? BRANCH_NAME : null
def pr = env.CHANGE_ID

println "Branch: ${branch}"
println "Pull request: ${pr}"
println "Tag: ${tag}"

def codeVersion
def dbVersion

stage('Build') {
    node {
        checkout scm

        //withEnv(["PATH+MAVEN=${tool 'M339'}/bin"]) {
			//we print node version
			sh 'node -v'
			//remove Extraneous packages
            sh 'npm prune'
			//install all needed dependencies
            sh 'npm install'
			//run eslint
			sh 'npm run lint'
        //}
    }
}

def deployed = false
def changePretty = (pr != null) ? "pull request ${pr}" : "branch ${branch}"

// If this stage fails then next stage will retry deployment. Otherwise next stage will be skipped.
stage('Deploy') {

    // Find list of countries which have database dumps compatible with ${codeVersion}

    node {
        try {
            // we run package version
            sh 'npm run package'

            // here we will copy the build file to a web server
            

            slackSend(channel: 'amp-offline-ci', color: 'good', message: "Deploy AMP OFFLINE- Success\nDeployed ${changePretty} ")

            deployed = true
        } catch (e) {
            slackSend(channel: 'amp-offline-i', color: 'warning', message: "Deploy AMP OFFLINE - Failed\nFailed to deploy ${changePretty}")

            currentBuild.result = 'UNSTABLE'
        }
    }
}

