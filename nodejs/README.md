# Appcelerator Security Library for NodeJS 
[![Build Status](https://travis-ci.org/appcelerator/appc-security.svg?branch=master)](https://travis-ci.org/appcelerator/appc-security) [![npm version](https://badge.fury.io/js/appc-security.svg)](http://badge.fury.io/js/appc-security)

This is a basic security library for encryption and decryption and other security related tasks that are common in NodeJS.

This library was created as a secure coding best practice for use with Appcelerator NodeJS related software. 

It is made available on GitHub for peer review and for transparency in our security practices.  If you find a security related issue with this software, please use [Responsible Disclosure of Security Vulnerabilities](http://www.appcelerator.com/privacy/responsible-disclosure-of-security-vulnerabilities/) by reporting it.

## Usage

The following APIs are available:

- `sha1(value,encoding)` - simple SHA1 digest. defaults to hex encoding if not specified
- `generateLargeRandomValue(size,encoding)` - generate random bytes. defaults to hex encoding if not specified. size by default is 512
- `encrypt(plainText, key, pepper, hmac_key, encoding, size)` - using AES encryption, encrypt plain text. pass in a shared key, shared pepper (to mix with generated salt), and shared hmac key used for integrity validation. default encoding is hex if not specified. default size is 512. use 128 or 192 for alternative sizes.
- `decrypt(encrypted, key, pepper, hmac_key, encoding, size)` - using AES decryption, decrypt encrypted buffer. pass in a shared key, shared pepper (to mix with generated salt), and shared hmac key used for integrity validation. default encoding is hex if not specified.` default size is 512. use 128 or 192 for alternative sizes.

The following properties can be changed. Care should be taken care of to only modify these if you absolutely know what you're doing. In general, these should not be changed.

- `HMAC_LENGTH` - length of the HMAC (defaults to 64)
- `ITERATIONS` - number of iterations when performing PBKDF2 generation. the larger the number, the better. 
- `SALT_LENGTH` - length of the SALT (defaults to 512)
- `IV_LENGTH` - length of the IV (defaults to 32)
- `KEY_LENGTH` - length of the derived key (defaults to 32)
- `DEBUG` - turn on debug logging. this is helpful for testing issues. however, care should be taken not to enable this in production since encryption data is logged.  (defaults to false)

For `ITERATIONS`, we currently use `100000` rounds (in the year 2015). NOTE: the decryption needs to match the same number of iterations specified here for decryption to work.

### Example Encryption

Generate (and store separately, not shown) an encrypted string as hex:

```javascript
var key = generateLargeRandomValue(),
	pepper = generateLargeRandomValue(),
	hmacKey = generateLargeRandomValue(),
	encryptedHex = encrypt('this is secret',key,pepper,hmacKey);
```

Decrypt the encrypted hex back into plain text:

```javascript
var plainText = decrypt(encryptedHex,key,pepper,hmacKey);
```

You can use different output encodings, such as `base64`:

```javascript
var encryptedHex = encrypt('this is secret',key,pepper,hmacKey,'base64');
var plainText = decrypt(encryptedHex,key,pepper,hmacKey,'base64');
```

### Why 3 shared keys?

We use 3 shared keys as part of the encryption, which are:

- `key`: this is the shared symmetric key used for both encryption and decryption. This should generally be a large unguessable value.  Use `generateLargeRandomValue` if you need to select one.  This key is not used directly during encryption, instead we generate a derived key using [PBKDF](http://en.wikipedia.org/wiki/PBKDF2).
- `pepper`: we generate a large random salt (by default, 512) and we hash the salt with the pepper so that we can transmit the salt along with the encrypted result.  the pepper is used by the decryptor to create the shared salt.
- `hmacKey`: we verify that the encrypted value is the same as what we generated and has not been tampered with. the algorithm uses [HMAC-256](http://en.wikipedia.org/wiki/Hash-based_message_authentication_code) to generate an HMAC of the result so that it can be verified against tampering.

It's imperative that you store all 3 shared keys in secure, private storage.  Loss of any of the keys results in the data not being decryptable.

To increase security, you should store these values in different locations and generate them uniquely if possible.  For example, you could generate the pepper for a database value and store both the resulting encryption and pepper together in the database (for example, in a table row).  The shared key and the hmacKey could then be stored separately and used during decryption.  Even if the database was compromised, you would have the encrypted data and the pepper, but you wouldn't have the key and hmacKey and each record would contain a different pepper.


## License

While this source code is made available on GitHub and is public, this code is closed source and Confidential and Proprietary to Appcelerator, Inc. All Rights Reserved.  This code MUST not be modified, copied or otherwise redistributed without express written permission of Appcelerator. This file is licensed as part of the Appcelerator Platform and governed under the terms of the Appcelerator license agreement.

