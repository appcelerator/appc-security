#! groovy
@Library('pipeline-library')

def buildAndroid(androidNDKLevel) {
	// will be done in follow up when moved to gradle
}

def buildIOS() {
	return {
		node('osx && xcode') {
			checkout scm
			dir('ios') {
				sh './build.sh'
				dir('build') {
					archiveArtifacts 'libappcsecurity.a'
				}
			}
		}
	}
}

def buildNodeJS () {
	return {
		node('(osx || linux)') {
			checkout scm
			dir('nodejs') {
				ensureNPM()
				sh 'npm ci'
				sh 'npm run test'
			}
		}
	}
}

stage('Build') {
	parallel(
		// 'android': buildAndroid(),
		'ios': buildIOS(),
		'nodejs': buildNodeJS()
	)
}
