#!/bin/bash

random()
{
	cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1
}

CONFIG="Release"
LIB="appcsecurity"
FINALNAME="appcsecurity"
SEED=`random`
APPC_OBFUSCATE_SEED="y`random`"
APPC_OBFUSCATE_SYMBOLS=1
APPC_SYMBOL_HMAC256="f`random`"
APPC_SYMBOL_SHA1="x`random`"
APPC_SYMBOL_DECRYPT="z`random`"
APPC_SYMBOL_DECRYPTWITHKEY="a`random`"


IOS_SIMULATOR_TYPE="iPhone 11 Pro Max"
# Obtain a simulator version for the required simulator
IOS_SIMULATOR_VERSION=$(instruments -s devices | grep "${IOS_SIMULATOR_TYPE}" -m 1 | grep -E -o '([0-9]+\.[0-9]+)')

BUILD_DIR=build
UNIVERSAL_OUTPUTFOLDER=${BUILD_DIR}/${LIB}-universal

mkdir -p "${UNIVERSAL_OUTPUTFOLDER}"

if (( $# > 0 )); then
	CONFIG=$1
fi

if [ "$CONFIG" = "Debug" ]; then
	DEFINES="${DEFINES} DEBUG=1"
fi

if [ -d build ]; then
	rm -rf build
fi

defines=(
	APPC_OBFUSCATE_SEED=$APPC_OBFUSCATE_SEED
	APPC_OBFUSCATE_SYMBOLS=$APPC_OBFUSCATE_SYMBOLS
	APPC_SYMBOL_HMAC256=$APPC_SYMBOL_HMAC256
	APPC_SYMBOL_SHA1=$APPC_SYMBOL_SHA1
	APPC_SYMBOL_DECRYPT=$APPC_SYMBOL_DECRYPT
	APPC_SYMBOL_DECRYPTWITHKEY=$APPC_SYMBOL_DECRYPTWITHKEY
)

if [ ! -d boost_1_74_0 ]; then
	echo -e "Boost 1.74.0 not found"
	if [[ ! -f "boost_1_74_0.tar.gz" ]]; then
		echo -e "Downloading Boost 1.74.0..."
		curl -L -O https://dl.bintray.com/boostorg/release/1.74.0/source/boost_1_74_0.tar.gz
	fi
	echo -e "Extracting Boost 1.74.0..."
	tar xf boost_1_74_0.tar.gz
fi

# run tests on iOS Simulator
xcodebuild \
-sdk iphonesimulator \
-configuration ${CONFIG} \
GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")" \
SYMROOT=./build

xcodebuild test \
-sdk iphonesimulator \
-configuration ${CONFIG} \
-scheme ${LIB} \
SYMROOT=./build \
-destination "platform=iOS Simulator,name=${IOS_SIMULATOR_TYPE},OS=${IOS_SIMULATOR_VERSION}"

if [ $? -ne 0 ]; then
	exit $?
fi

if [ -d build ]; then
	rm -rf build
fi

# clean!
xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} clean
xcodebuild -sdk iphoneos -configuration ${CONFIG} -scheme ${LIB} clean

findsymbol() {
	# otool -Sv build/lib${LIB}.a | grep $1 | wc -l | sed 's/[ \s\t]*//g'
	xcrun llvm-nm -print-armap ${2}/Products/usr/local/lib/lib${LIB}.a  | grep $1 | wc -l | sed 's/[ \s\t]*//g'
}

buildArchive() {
	ARCHIVE_PATH=${BUILD_DIR}/$1.xcarchive
	xcodebuild archive \
	-sdk $1 \
	-scheme ${LIB} \
	-archivePath ${ARCHIVE_PATH} \
	SKIP_INSTALL=NO \
	BUILD_LIBRARIES_FOR_DISTRIBUTION=YES \
	GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")" \
	$2

	if [ `findsymbol decrypt $ARCHIVE_PATH` -ne 0 ]; then
		echo -e "\033[31mERROR:\033[0m should not have found decrypt symbol in final binary $ARCHIVE_PATH. obfuscation failed!"
		exit 1
	fi

	if [ `findsymbol hmac256 $ARCHIVE_PATH` -ne 0 ]; then
		echo -e "\033[31mERROR:\033[0m should not have found hmac256 symbol in final binary $ARCHIVE_PATH. obfuscation failed!"
		exit 1
	fi

	if [ `findsymbol sha1 $ARCHIVE_PATH` -ne 0 ]; then
		echo -e "\033[31mERROR:\033[0m should not have found sha1 symbol in final binary $ARCHIVE_PATH. obfuscation failed!"
		exit 1
	fi

	HEADER_PATH=$ARCHIVE_PATH/Products/usr/local/include/$LIB.h
	# copy and replace our build tokens in our header
	sed -i '' -e "s/APPC_SYMBOL_HMAC256/${APPC_SYMBOL_HMAC256}/" $HEADER_PATH
	sed -i '' -e "s/APPC_SYMBOL_SHA1/${APPC_SYMBOL_SHA1}/" $HEADER_PATH
	sed -i '' -e "s/APPC_SYMBOL_DECRYPTWITHKEY/${APPC_SYMBOL_DECRYPTWITHKEY}/" $HEADER_PATH
	sed -i '' -e "s/APPC_SYMBOL_DECRYPT/${APPC_SYMBOL_DECRYPT}/" $HEADER_PATH
}

buildArchive iphonesimulator
buildArchive iphoneos
buildArchive macosx SUPPORTS_MACCATALYST=YES

# Build the XCFramework
xcodebuild -create-xcframework \
-library $BUILD_DIR/iphonesimulator.xcarchive/Products/usr/local/lib/lib${LIB}.a \
-headers $BUILD_DIR/iphonesimulator.xcarchive/Products/usr/local/include/ \
-library $BUILD_DIR/iphoneos.xcarchive/Products/usr/local/lib/lib${LIB}.a \
-headers $BUILD_DIR/iphoneos.xcarchive/Products/usr/local/include/ \
-library $BUILD_DIR/macosx.xcarchive/Products/usr/local/lib/lib${LIB}.a \
-headers $BUILD_DIR/macosx.xcarchive/Products/usr/local/include/ \
-output ${UNIVERSAL_OUTPUTFOLDER}/${LIB}.xcframework

exit 0
