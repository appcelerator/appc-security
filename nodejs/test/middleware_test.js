var should = require('should'), // jshint ignore:line
	lib = require('../'),
	express = require('express'),
	request = require('request'),
	app,
	server;

// jscs:disable jsDoc
describe('middleware', function () {

	beforeEach(function (done) {
		app = express();
		server = app.listen(9999, done);
	});

	afterEach(function (done) {
		if (server) {
			server.close(done);
		} else {
			done();
		}
	});

	it('should require a secret value', function () {
		(function () {
			var middleware = new lib.Middleware();
		}).should.throw('missing required options "secret"');
	});

	it('should reject without key as HTML', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		request.get('http://127.0.0.1:9999/', function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('Unauthorized');
			done();
		});
	});

	it('should reject without key as HTML with accept header', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
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
		var middleware = new lib.Middleware({
			secret: 'secret',
			renderUnauthorized: 'unauth'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
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
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':401,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with XHR header', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':401,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as primary', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'application/json, text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':401,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as secondary', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml, application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':401,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject without key as JSON with accept header as secondary and with precendence', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret'
		});
		should(middleware).be.a.function;
		app.get('/', middleware);
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml;q=0.3, application/json;q=0.1'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':401,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject with custom error handler', function (done) {
		var middleware = new lib.Middleware({
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
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/yaml, application/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.eql(JSON.stringify({
				'success':false,
				'code':402,
				'message':'unauthorized',
				'error':'missing authorization header'
			}));
			done();
		});
	});

	it('should reject with custom url pattern', function (done) {
		var middleware = new lib.Middleware({
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
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			opts.url = 'http://127.0.0.1:9999/secure/foo',
			request.get(opts, function (err, resp, body) {
				should(body).be.equal('Unauthorized');
				done();
			});
		});
	});

	it('should reject with custom redirect url', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret',
			urlpattern: /^\/secure\/.*/,
			redirect: 'http://127.0.0.1:9999/success'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/success', function (req, resp) {
			if (req.headers && req.headers.referer) {
				if (req.headers.referer === 'http://127.0.0.1:9999/success?redirect=http%3A%2F%2F127.0.0.1%3A9999%2Fsecure%2Ffoo') {
					return resp.send('OK');
				}
			}
			resp.send('NOT OK');
		});
		app.get('/secure/foo', function (req, resp) {
			resp.send('NOT OK');
		});
		var opts = {
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
		var middleware = new lib.Middleware({
			secret: 'secret',
			redirect: 'http://127.0.0.1:9999/failed'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/', function (req, resp) {
			resp.send('NOT OK');
		});
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/json'
			}
		};
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal(JSON.stringify({
				success:false,
				code:401,
				message:'unauthorized',
				error:'missing authorization header',
				url:'http://127.0.0.1:9999/failed?redirect=http%3A%2F%2F127.0.0.1%3A9999%2F'
			}));
			done();
		});
	});

	it('should reject with custom redirect url with custom param', function (done) {
		var middleware = new lib.Middleware({
			secret: 'secret',
			urlpattern: /^\/secure\/.*/,
			redirect: 'http://127.0.0.1:9999/success',
			redirectUrlParam: '_url'
		});
		should(middleware).be.a.function;
		app.use(middleware);
		app.get('/success', function (req, resp) {
			if (req.headers && req.headers.referer) {
				if (req.headers.referer === 'http://127.0.0.1:9999/success?_url=http%3A%2F%2F127.0.0.1%3A9999%2Fsecure%2Ffoo') {
					return resp.send('OK');
				}
			}
			resp.send('NOT OK');
		});
		app.get('/secure/foo', function (req, resp) {
			resp.send('NOT OK');
		});
		var opts = {
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
		var middleware = new lib.Middleware({
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
		var token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, {foo:'bar'});
		var opts = {
			url: 'http://127.0.0.1:9999/',
			headers: {
				accept: 'text/html'
			}
		};
		lib.generateAPITokenHTTPAuthorization (token, 'secret', opts.headers);
		request.get(opts, function (err, resp, body) {
			should(err).not.be.ok;
			should(body).be.equal('OK');
			done();
		});
	});

	it('should do basic apikey with custom header', function (done) {
		var middleware = new lib.Middleware({
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
		var token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, {foo:'bar'});
		var opts = {
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
		var middleware = new lib.Middleware({
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
		var token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, {foo:'bar'}, 'utf8');
		var opts = {
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
		var middleware = new lib.Middleware({
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
		var token = lib.createSessionTokenFromAPIKey('123', 'test', 'secret', 5000, {foo:'bar'}, 'utf8');
		var opts = {
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
