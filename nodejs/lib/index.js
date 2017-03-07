/**
 * This code is closed source and Confidential and Proprietary to
 * Appcelerator, Inc. All Rights Reserved.  This code MUST not be
 * modified, copied or otherwise redistributed without express
 * written permission of Appcelerator. This file is licensed as
 * part of the Appcelerator Platform and governed under the terms
 * of the Appcelerator license agreement.
 */
var crypto = require('crypto'),
	SecurityError = require('./error');

var ITERATIONS = 100000;
var SALT_LENGTH = 512;
var IV_LENGTH = 32;
var HMAC_LENGTH = 64;
var KEY_LENGTH = 32;
var DEBUG = false;

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
 * @param {string} a value
 * @param {string} b value
 * @returns {boolean} returns true if the same, false if not
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
 * @param {number} size
 * @param {string} encoding, defaults to hex
 * @returns {string} value
 */
function generateLargeRandomValue(size, encoding) {
	size = size || SALT_LENGTH / 2;
	var value = new Buffer(crypto.randomBytes(size));
	return value.toString(encoding || 'hex');
}

/**
 * check the size of the encoding used 128, 192, 256
 */
function checkSize(size) {
	size = size || 256;
	if (size < 128 || size > 256) {
		throw new SecurityError('invalid algorithm size: ' + size);
	}
	return size;
}

/**
 * encrypt a plainText Buffer
 *
 * @param {string} plainText buffer to encrypt
 * @param {string} shared key used for encryption
 * @param {string} shared pepper which is used to hash the salt
 * @param {string} shared hmac_key for verifying the hmac of the encrypted blob
 * @param {string} encoding of the returned encrypted buffer (defaults to hex)
 * @param {number} size of the algorithm to used (128, 192, 256)
 * @returns {Object} object hash of encryption results. value property is the encryptedText
 */
function encrypt (plainText, key, pepper, hmac_key, encoding, size) {
	// validate the size
	size = checkSize(size);
	try {
		var keySizeFactor = 256 / size,
			// create random IV
			iv = new Buffer(generateLargeRandomValue(IV_LENGTH / 2), 'hex'),
			// create an HMAC
			hmac = crypto.createHmac('SHA256', hmac_key),
			// create a random salt
			salt = generateLargeRandomValue(),
			// create a salt + pepper hash which hashes our salt with a known pepper
			saltAndPepper = sha1(salt + pepper),
			// use the password to create a derived key used for encrypting
			derivedKey = crypto.pbkdf2Sync(key, saltAndPepper, ITERATIONS, KEY_LENGTH / keySizeFactor, 'SHA1'),
			// create our cipher
			cipher = crypto.createCipheriv('AES-' + size + '-CBC', derivedKey, iv);

		// encrypt the plainText
		var encrypted = cipher.update(plainText, 'utf-8', 'hex');
		encrypted += cipher.final('hex');

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
			console.log('size=', size + '\n');
			console.log('keySizeFactor=', keySizeFactor + '\n');
			console.log('hmac_key=', hmac_key + '\n');
			console.log('hmacEncoding=', hmacEncoding.length, hmacEncoding + '\n');
			console.log('salt=', salt.length, salt + '\n');
			console.log('pepper=', pepper + '\n');
			console.log('iv=', iv.toString('hex').length, iv.toString('hex') + '\n');
			console.log('encrypted=', encrypted.length, encrypted + '\n');
			console.log('saltAndPepper=', saltAndPepper.length, saltAndPepper + '\n');
			console.log('------- END ENCRYPTION ------\n');
		}

		// our encrypted string in hex format
		// these are all safe to be plain text since we used
		// shared keys and salt + pepper which only the two parties will know
		var encryptedText = hmacEncoding + salt + iv.toString('hex') + encrypted;
		if (encoding && encoding !== 'hex') {
			// if we need to return a different encoding than hex, encode it
			encryptedText = new Buffer(encryptedText, 'hex').toString(encoding);
		}
		return {
			value: encryptedText,
			derivedKey: derivedKey,
			saltAndPepper: saltAndPepper,
			salt: salt,
			iv: iv
		};
	}
	catch (E) {
		throw new SecurityError('encryption failed');
	}
}

/**
 * decrypt an encrypted blob
 *
 * @param {string} encrypted string
 * @param {string} shared key used for encryption
 * @param {string} shared pepper which is used to hash the salt
 * @param {string} shared hmac_key for verifying the hmac of the encrypted blob
 * @param {string} encoding of the encrypted buffer (defaults to hex)
 * @param {number} size of the algorithm used (128, 192, 256)
 * @returns {string} decrypted blob
 */
function decrypt (encrypted, key, pepper, hmac_key, encoding, size) {
	// validate the size
	size = checkSize(size);
	// if this is encoded, we first need to decode it back to hex
	if (encoding && encoding !== 'hex') {
		encrypted = new Buffer(encrypted, encoding);
		encrypted = encrypted.toString('hex');
	}
	if (encrypted.length <= HMAC_LENGTH + SALT_LENGTH + IV_LENGTH) {
		throw new SecurityError('invalid encrypted data');
	}
	try {
		var keySizeFactor = 256 / size,
			hmacValue = encrypted.substring(0, HMAC_LENGTH),
			salt = encrypted.substring(HMAC_LENGTH, HMAC_LENGTH + SALT_LENGTH),
			iv = encrypted.substring(SALT_LENGTH + HMAC_LENGTH, SALT_LENGTH + HMAC_LENGTH + IV_LENGTH),
			encryptedBuf = encrypted.substring(SALT_LENGTH + HMAC_LENGTH + IV_LENGTH),
			hmac = crypto.createHmac('SHA256', hmac_key),
			saltAndPepper = sha1(salt + pepper);

		// we first need to re-create our HMAC and make sure that the encrypted blob is the
		// same as the encryption routine created and that it hasn't been tampered with
		hmac.update(encryptedBuf);
		hmac.update(saltAndPepper);
		hmac.update(iv);
		hmac = hmac.digest('hex');

		/* istanbul ignore if */
		if (DEBUG) {
			console.log('------- BEGIN DECRYPTION ------\n');
			console.log('size=', size + '\n');
			console.log('keySizeFactor=', keySizeFactor + '\n');
			console.log('hmac_key=', hmac_key + '\n');
			console.log('hmac=', hmacValue + '\n');
			console.log('salt=', salt + '\n');
			console.log('pepper=', pepper + '\n');
			console.log('iv=', iv.length, iv + '\n');
			console.log('encrypted=', encryptedBuf + '\n');
			console.log('saltAndPepper=', saltAndPepper + '\n');
			console.log('hmac result=', hmac + '\n');
		}

		// test for constant time comparison which both checks the values and ensures that
		// we don't have a timing attack. this validates that the encrypted value hasn't been
		// modified from what we encrypted
		if (!constantTimeCompare(hmac, hmacValue)) {
			throw new SecurityError('encrypted data has been tampered with');
		}

		// create our derived key
		var derivedKey = crypto.pbkdf2Sync(key, saltAndPepper, ITERATIONS, KEY_LENGTH / keySizeFactor, 'SHA1'),
			ivKey = new Buffer(iv, 'hex'),
			// create our decryption cipher
			cipher = crypto.createDecipheriv('AES-' + size + '-CBC', derivedKey, ivKey);

		/* istanbul ignore if */
		if (DEBUG) {
			console.log('derived key=', derivedKey.toString('hex') + '\n');
			console.log('------- END DECRYPTION ------\n');
		}

		var decrypted = cipher.update(encryptedBuf, 'hex', 'utf-8');
		return decrypted + cipher.final('utf-8');
	}
	catch (E) {
		if (E instanceof SecurityError) {
			throw E;
		} else {
			throw new SecurityError('decryption failed');
		}
	}
}

/**
 * generate a session token as a JSON Web Token which is encoded using encoding (utf-8 is default).
 * if you want the encoding to be normal plain text, pass in 'utf8' as the value
 * to encoding
 *
 * @param {string} apikey the api key string
 * @param {string} key_secret the apikey secret key string
 * @param {string} master_secret the master secret key string
 * @param {number} expiry the expiration time in milliseconds
 * @param {Object} metadata extra metadata as headers to encode in the token
 * @param {string} encoding format to return, defaults to utf8
 * @returns {string} encoded session token
 */
function createSessionTokenFromAPIKey (apikey, key_secret, master_secret, expiry, metadata, encoding) {
	metadata = metadata || {};
	metadata.$ks = key_secret;
	var jwt = require('jsonwebtoken'),
		object = {
			apikey: apikey,
			headers: metadata
		},
		secret = crypto.pbkdf2Sync(apikey, sha1(apikey + key_secret + master_secret), 100, 16, 'SHA1').toString('base64'),
		options = {
			expiresIn: String(expiry),
			issuer: 'https://security.appcelerator.com',
			algorithm: 'HS256',
			subject: 'apikey'
		},
		encoded = jwt.sign(object, secret, options);
	return new Buffer(encoded).toString(encoding || 'utf8');
}

/**
 * verify an encoded session token and return its verified value or raise an
 * exception if not valid
 *
 * @param {string} token encoded token value
 * @param {string} master_secret the secret key string
 * @param {string} encoding format of the token, defaults to base64
 * @returns {Object} decoded value
 */
function verifySessionTokenForAPIKey (token, master_secret, encoding) {
	try {
		var jwt = require('jsonwebtoken'),
			buf = new Buffer(token, encoding || 'utf8').toString(),
			decoded = jwt.decode(buf, {complete: true}),
			secret = crypto.pbkdf2Sync(decoded.payload.apikey, sha1(decoded.payload.apikey + decoded.payload.headers.$ks + master_secret), 100, 16, 'SHA1').toString('base64');
		return jwt.verify(buf, secret, {algorithm: 'HS256', issuer: 'https://security.appcelerator.com'});
	}
	catch (e) {
		// console.log(e.stack);
		var message = e.message.replace(/jwt/g, 'token');
		var ex = new SecurityError(message);
		if (e.expiredAt) {
			ex.expiredAt = e.expiredAt;
		}
		throw ex;
	}
}

/**
 * generate an appropriate HTTP Authorization header for the token using secret
 */
function generateAPITokenHTTPAuthorization (token, secret, headers, headerName) {
	var jwt = require('jsonwebtoken'),
		decoded = jwt.decode(token, {complete: true}),
		hmac = crypto.createHmac('SHA256', decoded && decoded.payload && decoded.payload.headers && decoded.payload.headers.$ks);
	hmac.update(token);
	var result = 'APIKey ' + hmac.digest('hex') + ' ' + token;
	headers && (headers[headerName || 'authorization'] = result);
	return result;
}

var AuthorizationRegExp = /^APIKey\s(\w+)\s([\w\.=-]+)$/;
/**
 * verify a HTTP Authorization header as a valid API key and return the
 * decoded value or raise an SecurityError if any errors decoding
 */
function validateAPITokenFromHTTPAuthorization (secret, authorization, encoding) {
	if (!authorization) {
		throw new SecurityError('missing authorization');
	}
	var tok = AuthorizationRegExp.exec(authorization);
	if (!tok || tok.length !== 3) {
		throw new SecurityError('invalid authorization');
	}
	var token = tok[2],
		encoded = verifySessionTokenForAPIKey(token, secret, encoding),
		hmac = crypto.createHmac('SHA256', encoded.headers && encoded.headers.$ks);
	hmac.update(token);
	hmac = hmac.digest('hex');
	if (tok[1] !== hmac) {
		throw new SecurityError('invalid authorization');
	}
	return encoded;
}

// export our APIs
exports.sha1 = sha1;
exports.generateLargeRandomValue = generateLargeRandomValue;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.createSessionTokenFromAPIKey = createSessionTokenFromAPIKey;
exports.verifySessionTokenForAPIKey = verifySessionTokenForAPIKey;
exports.generateAPITokenHTTPAuthorization = generateAPITokenHTTPAuthorization;
exports.validateAPITokenFromHTTPAuthorization = validateAPITokenFromHTTPAuthorization;

// jscs:disable jsDoc
Object.defineProperty(exports, 'Middleware', {
	get: function () {
		return require('./middleware');
	}
});

Object.defineProperty(exports, 'Plugin', {
	get: function () {
		return require('./plugin');
	}
});

Object.defineProperty(exports, 'HMAC_LENGTH', {
	set: function (value) {
		HMAC_LENGTH = value;
	},
	get: function () {
		return HMAC_LENGTH;
	}
});

Object.defineProperty(exports, 'ITERATIONS', {
	set: function (value) {
		ITERATIONS = value;
	},
	get: function () {
		return ITERATIONS;
	}
});

Object.defineProperty(exports, 'SALT_LENGTH', {
	set: function (value) {
		SALT_LENGTH = value;
	},
	get: function () {
		return SALT_LENGTH;
	}
});

Object.defineProperty(exports, 'IV_LENGTH', {
	set: function (value) {
		IV_LENGTH = value;
	},
	get: function () {
		return IV_LENGTH;
	}
});

Object.defineProperty(exports, 'KEY_LENGTH', {
	set: function (value) {
		KEY_LENGTH = value;
	},
	get: function () {
		return KEY_LENGTH;
	}
});

Object.defineProperty(exports, 'DEBUG', {
	set: function (value) {
		DEBUG = value;
	},
	get: function () {
		return DEBUG;
	}
});
