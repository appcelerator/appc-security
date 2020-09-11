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
				dir('build/appcsecurity-universal') {
					archiveArtifacts 'appcsecurity.xcframework'
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
				nodejs(nodeJSInstallationName: "node 12.18.0") {
					ensureNPM()
					sh 'npm ci'
					sh 'npm run test'
				}
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
