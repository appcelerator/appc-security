#!/bin/sh

CONFIG="Release"
LIB="appcsecurity"
FINALNAME="appcsecurity"
DEFINES=

if (( $# > 0 )); then
	CONFIG=$1
fi

if [ "$CONFIG" = "Debug" ]; then
	DEFINES="GCC_PREPROCESSOR_DEFINITIONS=DEBUG=1"
fi

if [ -d build ]; then
	rm -rf build
fi

xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} clean
xcodebuild -sdk iphoneos -configuration ${CONFIG} -scheme ${LIB} clean

xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -target ${LIB} ${DEFINES}
xcodebuild -sdk iphoneos -configuration ${CONFIG} -target ${LIB} ${DEFINES}

lipo build/${CONFIG}-iphonesimulator/lib${LIB}.a build/${CONFIG}-iphoneos/lib${LIB}.a -create -output build/lib${LIB}.a

for arch in armv7 arm64 i386 x86_64; do
	xcrun -sdk iphoneos lipo build/lib${LIB}.a -verify_arch $arch
	if (( $? != 0 )); then
		echo "ERROR: YOU DID NOT BUILD IN SYMBOLS FOR $arch"
		exit 1
	fi
done

xcrun -sdk iphoneos lipo -info build/lib${LIB}.a
mv build/lib${LIB}.a build/lib${FINALNAME}.a
