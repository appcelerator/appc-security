const should = require('should');

const lib = require('..');

describe('library', function () {

	it('should support sha1', function () {
		lib.sha1('abc').should.eql('a9993e364706816aba3e25717850c26c9cd0d89d');
	});

	it('should support generateLargeRandomValue with default size', function () {
		let value = lib.generateLargeRandomValue();
		value.should.be.string;
		value.should.be.length(512);
		// should be lowercase hex
		value.toLowerCase().should.be.equal(value);
	});

	it('should support generateLargeRandomValue with different size', function () {
		let value = lib.generateLargeRandomValue(10);
		value.should.be.string;
		value.should.be.length(20);
	});

	it('should support generateLargeRandomValue with different encoding', function () {
		let value = lib.generateLargeRandomValue(10, 'base64');
		value.should.be.string;
		// eslint-disable-next-line security/detect-new-buffer
		let buf = new Buffer(value, 'base64');
		should(value).match(/=$/);
		should(value.toString('base64')).equal(value);
	});

	it('should encrypt to base64', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey, 'base64');
		should(result).be.object;
		should(result.value).match(/=$/);

		should(result).have.property('saltAndPepper');
		should(result).have.property('iv');
		should(result).have.property('derivedKey');

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey, 'base64');
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt', function () {
		let key = 'key',
			pepper = 'pepper',
			hmacKey = 'hmacKey',
			result = lib.encrypt('ABC', key, pepper, hmacKey, 'base64');
		should(result).be.object;
		should(result.value).match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey, 'base64');
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES128', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey, 'base64', 128);
		should(result).be.object;
		should(result.value).match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey, 'base64', 128);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES192', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey, 'base64', 192);
		should(result).be.object;
		should(result.value).match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey, 'base64', 192);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES256', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey, 'base64', 256);
		should(result).be.object;
		should(result.value).match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey, 'base64', 256);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should fail to encrypt using invalid size', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey, null, 64);
		}).should.throw('invalid algorithm size: 64');
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey, null, 674);
		}).should.throw('invalid algorithm size: 674');
	});

	it('should not fail to encrypt with short key', function () {
		let key = '123',
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should not fail to encrypt with short pepper', function () {
		let key = '123',
			pepper = '123',
			hmacKey = lib.generateLargeRandomValue();
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should not fail to encrypt with short hmac', function () {
		let key = '123',
			pepper = '123',
			hmacKey = '123';
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should encrypt to hex as default', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		should(result.value).not.match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt json string', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			json = JSON.stringify({ user: 'foo', org: 'bar' }),
			result = lib.encrypt(json, key, pepper, hmacKey);
		should(result).be.object;
		should(result.value).not.match(/=$/);

		let result2 = lib.decrypt(result.value, key, pepper, hmacKey);
		should(result2).be.string;
		should(result2).equal(json);
	});

	it('should encrypt fail with invalid encoding', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function () {
			lib.encrypt('ABC', key, pepper, hmacKey, 'foobar');
		}).should.throw('encryption failed');
	});

	it('should fail to decrypt with invalid encrypted blob', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		(function () {
			lib.decrypt('123', key, pepper, hmacKey);
		}).should.throw('invalid encrypted data');
	});

	it('should fail to decrypt with wrong key', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		(function () {
			lib.decrypt(result.value, '123', pepper, hmacKey);
		}).should.throw('decryption failed');
	});

	it('should fail to decrypt with wrong pepper', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		(function () {
			lib.decrypt(result.value, key, '123', hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with wrong hmac', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		(function () {
			lib.decrypt(result.value, key, pepper, '123');
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with wrong encryption', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		(function () {
			lib.decrypt(result.value + '1', key, pepper, hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with modified hmac', function () {
		let key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC', key, pepper, hmacKey);
		should(result).be.object;
		let hmac = result.value.substring(0, lib.HMAC_LENGTH),
			remainder = result.value.substring(lib.HMAC_LENGTH);
		(function () {
			result = hmac.substring(0, hmac.length - 2) + remainder;
			lib.decrypt(result, key, pepper, hmacKey);
		}).should.throw('encrypted data has been tampered with');
		(function () {
			result = hmac + 'abc' + remainder;
			lib.decrypt(result, key, pepper, hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

	it('should support encoding session token for API key', function () {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 10000, { foo: 'bar' });
		should(token).be.a.string;
		let result = lib.verifySessionTokenForAPIKey(token, '456');
		should(result).be.an.object;
		should(result).have.property('apikey', '123');
		should(result).have.property('iss', 'https://security.appcelerator.com');
		should(result).have.property('sub', 'apikey');
		should(result).have.property('headers');
		should(result).have.property('iat');
		result.iat.should.be.approximately(Math.floor(Date.now() / 1000), 2);
		should(result).have.property('exp');
		result.exp.should.be.approximately(Math.floor((Date.now() + 10000) / 1000), 2);
	});

	it('should fail encoding session token for API key with invalid secret', function () {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 10000, { foo: 'bar' });
		should(token).be.a.string;
		(function () {
			lib.verifySessionTokenForAPIKey(token, '123');
		}).should.throw('invalid signature');
	});

	it('should fail encoding session token for API key with expired token', function (done) {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 1000, { foo: 'bar' });
		should(token).be.a.string;
		setTimeout(function () {
			(function () {
				lib.verifySessionTokenForAPIKey(token, '456');
			}).should.throw('token expired');
			done();
		}, 1200);
	});

	it('should fail encoding session token for API key with expired token and expiredAt property', function (done) {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 1000, { foo: 'bar' });
		should(token).be.a.string;
		setTimeout(function () {
			try {
				lib.verifySessionTokenForAPIKey(token, '456');
			} catch (E) {
				should(E).have.property('expiredAt');
				should(E.expiredAt).be.a.Date;
				E.expiredAt.getTime().should.be.approximately(Math.floor((Date.now() + 1000)), 5000);
			}
			done();
		}, 1200);
	});

	it('should encoding session token for API key with utf8 encoding', function () {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 1000, { foo: 'bar' }, 'utf8');
		should(token).be.a.string;
		let encoded = lib.verifySessionTokenForAPIKey(token, '456', 'utf8');
		should(encoded).be.an.object;
		should(encoded).have.property('apikey', '123');
		should(encoded).have.property('iss', 'https://security.appcelerator.com');
	});

	it('should encoding session token for API key and generate Authorization HTTP header', function () {
		let token = lib.createSessionTokenFromAPIKey('123', '0', '456', 1000, { foo: 'bar' });
		should(token).be.a.string;
		let headers = {};
		lib.generateAPITokenHTTPAuthorization(token, '456', headers);
		should(headers).have.property('authorization');
		// eslint-disable-next-line no-useless-escape
		should(headers.authorization).match(/^APIKey\s(\w+)\s([\w\.=-]+)$/);
	});

	it('should allow setting various parameters', function () {
		[ 'HMAC_LENGTH', 'ITERATIONS', 'SALT_LENGTH', 'IV_LENGTH', 'KEY_LENGTH', 'DEBUG' ].forEach(function (k) {
			let value = lib[k];
			lib[k] = value;
			should(lib[k]).be.equal(value);
		});
	});
});
