#!/bin/bash

random()
{
	cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1
}

CONFIG="Release"
LIB="appcsecurity"
FINALNAME="appcsecurity"
XCTOOL=`which xctool`
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

if [ ! -f $XCTOOL ]; then
	echo "Install XCTool for Automated Unit Testing"
	echo "See https://github.com/facebook/xctool for instructions"
else
	xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -target ${LIB}Tests GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")" SYMROOT=./build
	xctool -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} run-tests -reporter pretty SYMROOT=./build
	if [ $? -ne 0 ]; then
		exit $?
	fi
fi

if [ -d build ]; then
	rm -rf build
fi


xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -scheme ${LIB} clean
xcodebuild -sdk iphoneos -configuration ${CONFIG} -scheme ${LIB} clean

xcodebuild -sdk iphonesimulator -configuration ${CONFIG} -target ${LIB} GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")"
xcodebuild -sdk iphoneos -configuration ${CONFIG} -target ${LIB} GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS '"$(printf '%q ' "${defines[@]}")"

lipo build/${CONFIG}-iphonesimulator/lib${LIB}.a build/${CONFIG}-iphoneos/lib${LIB}.a -create -output build/lib${LIB}.a

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

