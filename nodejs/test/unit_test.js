var should = require('should'),
	lib = require('../');

describe('library', function(){

	it('should support sha1', function(){
		lib.sha1('abc').should.eql('a9993e364706816aba3e25717850c26c9cd0d89d');
	});

	it('should support generateLargeRandomValue with default size', function(){
		var value = lib.generateLargeRandomValue();
		value.should.be.string;
		value.should.be.length(512);
		// should be lowercase hex
		value.toLowerCase().should.be.equal(value);
	});

	it('should support generateLargeRandomValue with different size', function(){
		var value = lib.generateLargeRandomValue(10);
		value.should.be.string;
		value.should.be.length(20);
	});

	it('should support generateLargeRandomValue with different encoding', function(){
		var value = lib.generateLargeRandomValue(10,'base64');
		value.should.be.string;
		var buf = new Buffer(value, 'base64');
		should(value).match(/=$/);
		should(value.toString('base64')).equal(value);
	});

	it('should encrypt to base64', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey,'base64');
		should(result).be.string;
		should(result).match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey,'base64');
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt', function(){
		lib.DEBUG = true;
		var key = 'key',
			pepper = 'pepper',
			hmacKey = 'hmacKey',
			result = lib.encrypt('ABC',key,pepper,hmacKey,'base64');
		should(result).be.string;
		should(result).match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey,'base64');
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES128', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey,'base64',128);
		should(result).be.string;
		should(result).match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey,'base64',128);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES192', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey,'base64',192);
		should(result).be.string;
		should(result).match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey,'base64',192);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt using AES256', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey,'base64',256);
		should(result).be.string;
		should(result).match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey,'base64',256);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should fail to encrypt using invalid size', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey,null,64);
		}).should.throw('invalid algorithm size: 64');
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey,null,674);
		}).should.throw('invalid algorithm size: 674');
	});

	it('should not fail to encrypt with short key', function(){
		var key = '123',
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should not fail to encrypt with short pepper', function(){
		var key = '123',
			pepper = '123',
			hmacKey = lib.generateLargeRandomValue();
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should not fail to encrypt with short hmac', function(){
		var key = '123',
			pepper = '123',
			hmacKey = '123';
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey);
		}).should.not.throw('encryption failed');
	});

	it('should encrypt to hex as default', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		should(result).not.match(/=$/);

		var result2 = lib.decrypt(result,key,pepper,hmacKey);
		should(result2).be.string;
		should(result2).equal('ABC');
	});

	it('should encrypt fail with invalid encoding', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue();
		(function(){
			lib.encrypt('ABC',key,pepper,hmacKey,'foobar');
		}).should.throw('encryption failed');
	});

	it('should fail to decrypt with invalid encrypted blob', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		(function(){
			lib.decrypt('123',key,pepper,hmacKey);
		}).should.throw('invalid encrypted data');
	});

	it('should fail to decrypt with wrong key', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		(function(){
			lib.decrypt(result,'123',pepper,hmacKey);
		}).should.throw('decryption failed');
	});

	it('should fail to decrypt with wrong pepper', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		(function(){
			lib.decrypt(result,key,'123',hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with wrong hmac', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		(function(){
			lib.decrypt(result,key,pepper,'123');
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with wrong encryption', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		(function(){
			lib.decrypt(result+'1',key,pepper,hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

	it('should fail to decrypt with modified hmac', function(){
		var key = lib.generateLargeRandomValue(),
			pepper = lib.generateLargeRandomValue(),
			hmacKey = lib.generateLargeRandomValue(),
			result = lib.encrypt('ABC',key,pepper,hmacKey);
		should(result).be.string;
		var hmac = result.substring(0, lib.HMAC_LENGTH),
			remainder = result.substring(lib.HMAC_LENGTH);
		(function(){
			result = hmac.substring(0,hmac.length-2) + remainder;
			lib.decrypt(result,key,pepper,hmacKey);
		}).should.throw('encrypted data has been tampered with');
		(function(){
			result = hmac + 'abc' + remainder;
			lib.decrypt(result,key,pepper,hmacKey);
		}).should.throw('encrypted data has been tampered with');
	});

});