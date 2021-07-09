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

// define target options
def targetsMap = [
        'Package All': ['win32', 'win64', 'linux'],
        'Windows 32 & 64 bits': ['win32', 'win64'],
        'Windows 64 bits': ['win64'],
        'Windows 32 bits': ['win32'],
        'Linux All': ['linux'],
        'Debian All': ['deb32', 'deb64'],
        'Debian 64 bits': ['deb64'],
        'Debian 32 bits': ['deb32'],
        'Windows and Linux deb 32 & 64 bits': ['win32', 'win64', 'deb32', 'deb64']
    ]
// TODO exclude develop?
def isReleaseBranch = branch != null && branch.matches(/master|develop|pre-release.*|release.*/)
def defaultTarget = isReleaseBranch ? 'Package All' : 'Windows 64 bits'
// By default options are listed and sorted ascending and there is no way to configure defaultValue for choices.
// To ensure that the right default option is selected on automatic build, it must be renamed to be sorted first
def defaultTargetFirst = "(Default) ${defaultTarget}"
targetsMap[defaultTargetFirst] = targetsMap[defaultTarget]
targetsMap = targetsMap.findAll { it.key != defaultTarget }
def targets = targetsMap.keySet().sort().join('\n')
println "Is Release branch: ${isReleaseBranch}"
println "Default Target: ${defaultTarget}"
println "Options: ${targets}"

properties([
    parameters([
        choice(name: 'packageTarget', description: 'Package for', choices: targets)
])])

def selectedTarget = params.packageTarget
println "Selected target: ${selectedTarget}"
def scriptTarget = targetsMap.get(selectedTarget).join(',')
println "Script target: ${scriptTarget}"

// limit to "master" executor until AMPOFFLINE-837 is addressed
node('master') {
	try {
		stage('PrepareSetup') {
			checkout scm
			//we print node version
			sh 'node -v'
			sh returnStatus: true, script: 'tar xf ../nm_cache.tar'
			//remove Extraneous packages
			sh 'npm prune'
			//install all needed dependencies
			sh 'npm install'
			sh 'npm run build-dll'
			sh returnStatus: true, script: 'tar cf ../nm_cache.tar node_modules --exclude=amp-ui'
		}
		stage('StyleCheck') {
			try {
				sh 'npm run lint'
			} catch(e) {
				slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Deploy AMP OFFLINE ESLINT check Failed on ${changePretty}")
				throw e
			}
		}
		stage('UnitTest') {
			try {
				sh 'npm run test-mocha'
			} catch(e) {
				slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Deploy AMP OFFLINE TESTS  Failed on ${changePretty}")
				throw e
			}
		}
		stage('Dist') {
			try {
				sh "echo Using package target: ${scriptTarget}"
                sh "./dist.sh ${pr} ${branch} ${scriptTarget}"
				sh "./publish.sh ${BRANCH_NAME}"
				slackSend(channel: 'amp-offline-ci', color: 'good', message: "Deploy AMP OFFLINE - Success\nDeployed ${changePretty}")
			} catch (e) {
				slackSend(channel: 'amp-offline-ci', color: 'warning', message: "Failed to create and publish installers for ${changePretty}")
				throw e
			}
		}
	} finally {
		sh 'rm -fr dist node_modules'
	}
}
