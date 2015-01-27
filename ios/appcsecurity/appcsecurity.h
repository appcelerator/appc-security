/**
 * This code is closed source and Confidential and Proprietary to
 * Appcelerator, Inc. All Rights Reserved.  This code MUST not be
 * modified, copied or otherwise redistributed without express
 * written permission of Appcelerator. This file is licensed as
 * part of the Appcelerator Platform and governed under the terms
 * of the Appcelerator license agreement.
 */


#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCrypto.h>

// the build script will generate these each time you build
#ifdef APPC_OBFUSCATE_SYMBOLS
#define hmac256 		APPC_SYMBOL_HMAC256
#define sha1 			APPC_SYMBOL_SHA1
#define decrypt 		APPC_SYMBOL_DECRYPT
#define decryptWithKey 	APPC_SYMBOL_DECRYPTWITHKEY
#endif

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

/**
 * produce an HMAC-256 for data using key
 *
 * @param {NSString} key for performing HMAC
 * @param {NSString} data to HMAC
 * @returns {NSString} HMAC value
 */
EXTERN NSString* hmac256(NSString *key, NSString *data);

/**
 * produce a SHA1 from a data
 *
 * @param {NSString} data to hash
 * @returns {NSString} hashed value of data
 */
EXTERN NSString* sha1(NSString *data);

/**
 * decrypt an encrypted value using key, pepper and hmacKey and return resulting plainText
 *
 * @param {NSString} encrypted value
 * @param {NSString} key
 * @param {NSString} pepper
 * @param {NSString} hmacKey
 * @param {NSString} encoding, defaults to hex. can pass in base64 as well
 * @param {size_t} size of the AES encoding.  Can pass in 128, 192 or 512 (default).
 * @returns {NSString} plain text or nil if decryption failed
 */
EXTERN NSString* decrypt(NSString *value, NSString *key, NSString *pepper, NSString *hmacKey, NSString *encoding, size_t size);

/**
 * decrypt an encrypted value using computed derived key, pepper and hmacKey and return resulting plainText
 *
 * @param {NSString} encrypted value
 * @param {NSString} derived key computed during encryption
 * @param {NSString} pepper
 * @param {NSString} hmacKey
 * @param {NSString} encoding, defaults to hex. can pass in base64 as well
 * @param {size_t} size of the AES encoding.  Can pass in 128, 192 or 512 (default).
 * @returns {NSString} plain text or nil if decryption failed
 */
EXTERN NSString* decryptWithKey(NSString *value, NSString *derivedKeyHex, NSString *pepper, NSString *hmacKey, NSString *encoding, size_t size);

