/**
 * This code is closed source and Confidential and Proprietary to
 * Appcelerator, Inc. All Rights Reserved.  This code MUST not be
 * modified, copy or otherwise redistributed without expression
 * written permission of Appcelerator. This file is licensed as
 * part of the Appcelerator Platform and governed under the terms
 * of the Appcelerator license agreement.
 */
var crypto = require('crypto');

var ITERATIONS = 100000;
var SALT_LENGTH = 512;
var IV_LENGTH = 32;
var HMAC_LENGTH = 64;
var KEY_LENGTH = 32;
var DEBUG = false;

/**
 * SecurityError class
 */
function SecurityError(message, code, status) {
	this.constructor.prototype.__proto__ = Error.prototype;
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = message;
	this.code = code;
	this.status = status || 500;
}

/**
 * simple SHA1
 */
function sha1(value, encoding) {
	var cipher = crypto.createHash('SHA1');
	cipher.update(value);
	return cipher.digest(encoding || 'hex');
}

/**
 * a constant time comparision which helps prevent timing attacks
 *
 * @param {String} a value 
 * @param {String} b value
 * @preturns {boolean} returns true if the same, false if not
 */
function constantTimeCompare(a, b) {
	var sentinel;

	/* istanbul ignore if */
	if (a.length !== b.length) {
		return false;
	}

	for (var c = 0; c <= (a.length - 1); c++) {
		sentinel |= a.charCodeAt(c) ^ b.charCodeAt(c);
	}

	return sentinel === 0;
}

/**
 * return a large random bytes using encoding (default is hex)
 *
 * @param {Number} size
 * @param {String} encoding, defaults to hex
 * @returns {String} value
 */
function generateLargeRandomValue(size, encoding) {
	size = size || SALT_LENGTH/2;
	var value = new Buffer(crypto.randomBytes(size));
	return value.toString(encoding || 'hex');
}

/**
 * check the size of the encoding used 128, 192, 256
 */
function checkSize(size) {
	size = size || 256;
	if (size < 128 || size > 256) {
		throw new SecurityError('invalid algorithm size: '+size);
	}
	return size;
}

/**
 * encrypt a plainText Buffer
 *
 * @param {String} plainText buffer to encrypt
 * @param {String} shared key used for encryption
 * @param {String} shared pepper which is used to hash the salt
 * @param {String} shared hmac_key for verifying the hmac of the encrypted blob
 * @param {String} encoding of the returned encrypted buffer (defaults to hex)
 * @param {Number} size of the algorithm to used (128, 192, 256)
 * @returns {String} encrypted blob in hex format
 */
function encrypt (plainText, key, pepper, hmac_key, encoding, size) {
	// validate the size
	size = checkSize(size);
	try {
		var keySizeFactor = 256 / size,
			// create random IV
			iv = new Buffer(generateLargeRandomValue(IV_LENGTH/2),'hex'),
			// create an HMAC
			hmac = crypto.createHmac('SHA256', hmac_key),
			// create a random salt
			salt = generateLargeRandomValue(),
			// create a salt + pepper hash which hashes our salt with a known pepper
			saltAndPepper = sha1(salt+pepper),
			// use the password to create a derived key used for encrypting
			derivedKey = crypto.pbkdf2Sync(key, saltAndPepper, ITERATIONS, KEY_LENGTH / keySizeFactor),
			// create our cipher
			cipher = crypto.createCipheriv('AES-'+size+'-CBC', derivedKey, iv);

		// encrypt the plainText
		cipher.setEncoding('hex');
		cipher.write(plainText);
		cipher.end();
		var encrypted = cipher.read();

		// create an HMAC of the encrypted value + the saltAndPepper + the iv
		// we'll use this before decrypting to validate that the encrypted value
		// wasn't tampered with before decryption
		hmac.update(encrypted);
		hmac.update(saltAndPepper);
		hmac.update(iv.toString('hex'));
		var hmacEncoding = hmac.digest('hex');

		/* istanbul ignore if */
		if (DEBUG) {
			console.log('------- BEGIN ENCRYPTION ------\n');
			console.log('size=',size+'\n');
			console.log('keySizeFactor=',keySizeFactor+'\n');
			console.log('hmacKey=',hmacKey+'\n');
			console.log('hmacEncoding=',hmacEncoding.length,hmacEncoding+'\n');
			console.log('salt=',salt.length,salt+'\n');
			console.log('pepper=',pepper+'\n');
			console.log('iv=',iv.toString('hex').length,iv.toString('hex')+'\n');
			console.log('encrypted=',encrypted.length,encrypted+'\n');
			console.log('saltAndPepper=',saltAndPepper.length,saltAndPepper+'\n');
			console.log('------- END ENCRYPTION ------\n');
		}

		// our encrypted string in hex format
		// these are all safe to be plain text since we used 
		// shared keys and salt + pepper which only the two parties will know
		var encryptedText = hmacEncoding + salt + iv.toString('hex') + encrypted;
		if (encoding && encoding!=='hex') {
			// if we need to return a different encoding than hex, encode it
			return new Buffer(encryptedText,'hex').toString(encoding);
		}
		return encryptedText;
	}
	catch (E) {
		throw new SecurityError('encryption failed');
	}
}

/**
 * decrypt an encrypted blob
 *
 * @param {String} encrypted string
 * @param {String} shared key used for encryption
 * @param {String} shared pepper which is used to hash the salt
 * @param {String} shared hmac_key for verifying the hmac of the encrypted blob
 * @param {String} encoding of the encrypted buffer (defaults to hex)
 * @param {Number} size of the algorithm used (128, 192, 256)
 * @returns {String} decrypted blob
 */
function decrypt (encrypted, key, pepper, hmac_key, encoding, size) {
	// validate the size
	size = checkSize(size);
	// if this is encoded, we first need to decode it back to hex
	if (encoding && encoding!=='hex') {
		encrypted = new Buffer(encrypted,encoding);
		encrypted = encrypted.toString('hex');
	}
	if (encrypted.length <= HMAC_LENGTH + SALT_LENGTH + IV_LENGTH) {
		throw new SecurityError("invalid encrypted data");
	}
	try {
		var keySizeFactor = 256 / size,
			hmacValue = encrypted.substring(0, HMAC_LENGTH),
			salt = encrypted.substring(HMAC_LENGTH, HMAC_LENGTH + SALT_LENGTH),
			iv = encrypted.substring(SALT_LENGTH + HMAC_LENGTH, SALT_LENGTH + HMAC_LENGTH + IV_LENGTH),
			encrypted = encrypted.substring(SALT_LENGTH + HMAC_LENGTH + IV_LENGTH),
			hmac = crypto.createHmac('SHA256', hmac_key),
			saltAndPepper = sha1(salt+pepper);

		// we first need to re-create our HMAC and make sure that the encrypted blob is the 
		// same as the encryption routine created and that it hasn't been tampered with
		hmac.update(encrypted);
		hmac.update(saltAndPepper);
		hmac.update(iv);
		hmac = hmac.digest('hex');

		/* istanbul ignore if */
		if (DEBUG) {
			console.log('------- BEGIN DECRYPTION ------\n');
			console.log('size=',size+'\n');
			console.log('keySizeFactor=',keySizeFactor+'\n');
			console.log('hmacKey=',hmacKey+'\n');
			console.log('hmac=',hmacValue+'\n');
			console.log('salt=',salt+'\n');
			console.log('pepper=',pepper+'\n');
			console.log('iv=',iv.length,iv+'\n');
			console.log('encrypted=',encrypted+'\n');
			console.log('saltAndPepper=',saltAndPepper+'\n');
			console.log('hmac result=',hmac+'\n');
		}

		// test for constant time comparision which both checks the values and ensures that 
		// we don't have a timing attack. this validates that the encrypted value hasn't been
		// modified from what we encrypted
		if (!constantTimeCompare(hmac,hmacValue)) {
			throw new SecurityError('encrypted data has been tampered with');
		}

		// create our derived key
		var derivedKey = crypto.pbkdf2Sync(key, saltAndPepper, ITERATIONS, KEY_LENGTH/keySizeFactor),
			ivKey = new Buffer(iv,'hex'),
			// create our decryption cipher
			cipher = crypto.createDecipheriv('AES-'+size+'-CBC', derivedKey, ivKey);

		/* istanbul ignore if */
		if (DEBUG) {
			console.log('derived key=',derivedKey.toString('hex')+'\n');
			console.log('------- END DECRYPTION ------\n');
		}

		cipher.update(encrypted,'hex','utf8');
		return cipher.final('utf8');
	}
	catch (E) {
		if (E instanceof SecurityError) {
			throw E;
		}
		else {
			throw new SecurityError('decryption failed');
		}
	}
}

// export our APIs
exports.sha1 = sha1;
exports.generateLargeRandomValue = generateLargeRandomValue;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.HMAC_LENGTH = HMAC_LENGTH;
exports.ITERATIONS = ITERATIONS;
exports.SALT_LENGTH = SALT_LENGTH;
exports.IV_LENGTH = IV_LENGTH;
exports.KEY_LENGTH = KEY_LENGTH;
exports.DEBUG = DEBUG;


// for testing
/* istanbul ignore if */
if (module.id === ".") {
	var key = 'key',
		pepper = 'pepper',
		hmacKey = 'hmacKey';

	DEBUG = true;
	ITERATIONS = 100;
	var keysize = 256;
	var result = encrypt('ABC',key,pepper,hmacKey,'base64',keysize);
	var result2 = decrypt(result,key,pepper,hmacKey,'base64',keysize);
	console.log('static NSString *ENC = @"'+result+'";\n');
	console.log('static NSString *KEY = @"'+key+'";\n');
	console.log('static NSString *PEPPER = @"'+pepper+'";\n');
	console.log('static NSString *HMACKEY = @"'+hmacKey+'";\n');
	console.log('OK ?',result2==='ABC');
}
