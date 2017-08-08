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

def changePretty = (pr != null) ? "pull request ${pr}" : "branch ${branch}"

stage('PrepareSetup') {
	node {
		checkout scm
		//we print node version
		sh 'node -v'
		//remove Extraneous packages
		sh 'npm prune'
		//install all needed dependencies
		sh 'npm install'
		sh 'npm run build-dll'
	}
}
stage('StyleCheck') {
	node {
		try {
			sh 'npm run lint'
		} catch(e) {
			slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Deploy AMP OFFLINE ESLINT check Failed on ${changePretty}")
			throw e
		}
	}
}
stage('UnitTest') {
	node {
		try {
			sh 'npm run test-mocha'
		} catch(e) {
			slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Deploy AMP OFFLINE TESTS  Failed on ${changePretty}")
			throw e
		}
	}
}
/* disabling DIST step temporary, until it works for develop
stage('Dist') {
	node {
		try {
			sh './dist.sh'
			sh './publish.sh ${BRANCH_NAME}'
			slackSend(channel: 'amp-offline-ci', color: 'good', message: "Deploy AMP OFFLINE - Success\nDeployed ${changePretty}")
		} catch (e) {
			slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Failed to create and publish installers for ${changePretty}")
			throw e
		}
	}
}
*/
