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


xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -target ${LIB}Tests EXCLUDED_ARCHS=arm64 GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")" SYMROOT=./build
xcodebuild test -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} SYMROOT=./build -destination 'platform=iOS Simulator,name=iPhone 8,OS=13.3'
if [ $? -ne 0 ]; then
	exit $?
fi

if [ -d build ]; then
	rm -rf build
fi


xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} clean
xcodebuild -sdk iphoneos -configuration ${CONFIG} -scheme ${LIB} clean

xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -target ${LIB} EXCLUDED_ARCHS=arm64 GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")"
xcodebuild -sdk iphoneos -configuration ${CONFIG} -target ${LIB} GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")"

lipo build/${CONFIG}-iphonesimulator/lib${LIB}.a build/${CONFIG}-iphoneos/lib${LIB}.a -create -output build/lib${LIB}.a

if [ $? -ne 0 ]; then
	exit $?
fi

for arch in armv7 arm64 i386 x86_64; do
	xcrun -sdk iphoneos lipo build/lib${LIB}.a -verify_arch $arch
	if (( $? != 0 )); then
		echo -e "\033[31mERROR:\033[0m YOU DID NOT BUILD IN SYMBOLS FOR $arch"
		exit 1
	fi
done

xcrun -sdk iphoneos lipo -info build/lib${LIB}.a
mv build/lib${LIB}.a build/lib${FINALNAME}.a

findsymbol() {
	otool -Sv build/lib${LIB}.a | grep $1 | wc -l | sed 's/[ \s\t]*//g'
}

if [ `findsymbol decrypt` -ne 0 ]; then
	echo -e "\033[31mERROR:\033[0m should not have found decrypt symbol in final binary. obfuscation failed!"
	exit 1
fi

if [ `findsymbol hmac256` -ne 0 ]; then
	echo -e "\033[31mERROR:\033[0m should not have found hmac256 symbol in final binary. obfuscation failed!"
	exit 1
fi

if [ `findsymbol sha1` -ne 0 ]; then
	echo -e "\033[31mERROR:\033[0m should not have found sha1 symbol in final binary. obfuscation failed!"
	exit 1
fi

# copy and replace our build tokens in our header
cp appcsecurity/appcsecurity.h build
sed -i -e "s/APPC_SYMBOL_HMAC256/${APPC_SYMBOL_HMAC256}/" build/appcsecurity.h
sed -i -e "s/APPC_SYMBOL_SHA1/${APPC_SYMBOL_SHA1}/" build/appcsecurity.h
sed -i -e "s/APPC_SYMBOL_DECRYPTWITHKEY/${APPC_SYMBOL_DECRYPTWITHKEY}/" build/appcsecurity.h
sed -i -e "s/APPC_SYMBOL_DECRYPT/${APPC_SYMBOL_DECRYPT}/" build/appcsecurity.h

echo -e "\033[32mBuilt static library located at \033[0m\033[33mbuild/lib${FINALNAME}.a\033[0m"
echo -e "\033[32mBuilt header located at \033[0m\033[33mbuild/${FINALNAME}.h\033[0m"
exit 0

