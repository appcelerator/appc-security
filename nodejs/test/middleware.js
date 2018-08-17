const should = require('should');
const express = require('express');
const request = require('request');

const lib = require('..');

let app;
let server;

describe('middleware', function () {

	beforeEach(function (done) {
		app = express();
		server = app.listen(9999, done);
	});

	afterEach(function (done) {
		if (!server) {
			return done();
		}
		server.close(done);
	});

	it('should require a secret value', function () {
		(function () {
			// eslint-disable-next-line no-unused-vars
			let middleware = new lib.Middleware();
		}).should.throw('missing required options "secret"');
	});

	it('should reject without key as HTML', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		// eslint-disable-next-line no-unused-expressions
		should(middleware).be.a.function;
		app.get('/', middleware);
		request.get('http://127.0.0.1:9999/', function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('Unauthorized');
			done();
		});
	});

	it('should reject without key as HTML with accept header', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		// eslint-disable-next-line no-unused-expressions
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('Unauthorized');
			done();
		});
	});

	it('should reject without key with custom render', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			renderUnauthorized: 'unauth'
		});
		// eslint-disable-next-line no-unused-expressions
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		app.render = function (template, params, callback) {
			if (template === 'unauth' && params.reason === 'unauthorized' && params.error.message === 'missing authorization header') {
				callback(null, 'OK');
			} else {
				callback(new Error('invalid request'));
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should reject without key as JSON with accept header', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with XHR header', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as primary', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'application/json, text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as secondary', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml, application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as secondary and with precendence', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml;q=0.3, application/json;q=0.1'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject with custom error handler', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			errorHandler: function (req, resp, reason, error) {
				resp.json({
					success: false,
					code: 402,
					message: reason,
					error: error.message
				});
			}
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml, application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				success: false,
				code: 402,
				message: 'unauthorized',
				error: 'missing authorization header'
			}));
			done();
		});
	});

	it('should reject with custom url pattern', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			urlpattern: /^\/secure\/.*/
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			resp.send('OK');
		});
		app.get('/secure/foo', function (req, resp) {
			resp.send('NOT OK');
		});
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			opts.url = 'http://127.0.0.1:9999/secure/foo';
			request.get(opts, function (err, resp, body) {
				should(body).be.equal('Unauthorized');
				done();
			});
		});
	});

	it('should reject with custom redirect url', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			urlpattern: /^\/secure\/.*/,
			redirect: 'http://127.0.0.1:9999/success'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/success', function (req, resp) {
			if (req.headers && req.headers.referer) {
				if (req.headers.referer === 'http://127.0.0.1:9999/secure/foo') {
					return resp.send('OK');
				}
			}
			resp.send('NOT OK (1)');
		});
		app.get('/secure/foo', function (req, resp) {
			resp.send('NOT OK (2)');
		});
		let opts = {
			url: 'http://127.0.0.1:9999/secure/foo',
			headers: {
				accept: 'text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should reject with custom redirect url as json', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			redirect: 'http://127.0.0.1:9999/failed'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			resp.send('NOT OK');
		});
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal(JSON.stringify({
				success: false,
				code: 401,
				message: 'unauthorized',
				error: 'missing authorization header',
				url: 'http://127.0.0.1:9999/failed?redirect=http%3A%2F%2F127.0.0.1%3A9999%2F'
			}));
			done();
		});
	});

	it('should reject with custom redirect url with custom param', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			urlpattern: /^\/secure\/.*/,
			redirect: 'http://127.0.0.1:9999/success',
			redirectUrlParam: '_url'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/success', function (req, resp) {
			if (req.headers && req.headers.referer) {
				if (req.headers.referer === 'http://127.0.0.1:9999/secure/foo') {
					return resp.send('OK');
				}
			}
			resp.send('NOT OK (1)');
		});
		app.get('/secure/foo', function (req, resp) {
			resp.send('NOT OK (2)');
		});
		let opts = {
			url: 'http://127.0.0.1:9999/secure/foo',
			headers: {
				accept: 'text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should do basic apikey with defaults', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			if (req.authorization && req.authorization.apikey === '123' && req.authorization.headers && req.authorization.headers.foo === 'bar') {
				return resp.send('OK');
			}
			resp.send('NOT OK');
		});
		let token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, { foo: 'bar' });
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		lib.generateAPITokenHTTPAuthorization(token, 'secret', opts.headers);
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should do basic apikey with custom header', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			header: '_apikey'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			if (req._apikey && req._apikey.apikey === '123' && req._apikey.headers && req._apikey.headers.foo === 'bar') {
				return resp.send('OK');
			}
			resp.send('NOT OK');
		});
		let token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, { foo: 'bar' });
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		lib.generateAPITokenHTTPAuthorization(token, 'secret', opts.headers, '_apikey');
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should do basic apikey with custom encoding', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			encoding: 'utf8'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			if (req.authorization && req.authorization.apikey === '123' && req.authorization.headers && req.authorization.headers.foo === 'bar') {
				return resp.send('OK');
			}
			resp.send('NOT OK');
		});
		let token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, { foo: 'bar' }, 'utf8');
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		lib.generateAPITokenHTTPAuthorization(token, 'secret', opts.headers);
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should do basic apikey with custom success handler', function (done) {
		let middleware = new lib.Middleware({
			secret: 'secret',
			encoding: 'utf8',
			successHandler: function (req, resp, next, encoded) {
				resp.send('OK ' + encoded.apikey);
			}
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			resp.send('NOT OK');
		});
		let token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, { foo: 'bar' }, 'utf8');
		let opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		lib.generateAPITokenHTTPAuthorization(token, 'secret', opts.headers);
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK 123');
			done();
		});
	});

});
