var seclib = require('./index'),
	urllib = require('url'),
	SecurityError = require('./error');

/**
 * return the accepts mimetype
 */
function accepts (req) {
	var header = req.headers && req.headers.accept;
	if (header) {
		var token = header.split(',');
		if (token && token.length) {
			for (var c = 0; c < token.length; c++) {
				var mime = token[c].trim().split('/');
				if (mime && mime.length) {
					mime = mime[1].replace(/;.*/, '');
					if (mime === 'html' || mime === 'json') {
						return mime;
					}
				}
			}
		}
	}
	var userAgent = req.headers && req.headers['user-agent'];
	if (userAgent && userAgent.toLowerCase().indexOf('mozilla') > 0) {
		return 'html';
	}
	return 'unknown';
}

/**
 * returns true if this is SSL request
 */
function isSecure (req) {
	return req.secure ||
		req.headers && req.headers.host && req.headers.host.indexOf('https://') === 0;
}

/**
 * return a full relative url
 */
function makeRelativeUrl (req, relpath) {
	var url = (isSecure(req) ? 'https' : 'http') + '://' + req.get('host') + req.originalUrl;
	return urllib.resolve(url, relpath);
}

/**
 * get the redirect url
 */
function redirectUrl (req, resp, redirectTo, redirectUrlParam) {
	// we want to redirect to a specified url
	var fullUrl = encodeURIComponent(makeRelativeUrl(req, req.url));
	var q = redirectTo.indexOf('?') > 0;
	if (q) {
		return redirectTo + '&' + redirectUrlParam + '=' + fullUrl;
	} else {
		return redirectTo + '?' + redirectUrlParam + '=' + fullUrl;
	}
}

/**
 * perform a redirect
 */
function redirect (req, resp, redirectTo, redirectUrlParam) {
	resp.redirect(redirectUrl(req, resp, redirectTo, redirectUrlParam));
}

/**
 * handle unauthorized
 */
function unauthorized (req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, reason, error) {
	if (errorHandler) {
		// custom error handling
		return errorHandler(req, resp, reason, error);
	}
	var media = accepts(req),
		url = redirectTo && redirectUrl(req, resp, redirectTo, redirectUrlParam);
	if (media === 'json' || req.xhr) {
		// if accepts JSON, then let's return JSON
		resp.status(401).json({
			success: false,
			code: error && error.code || 401,
			message: reason,
			error: error && error.message,
			url: url
		});
	} else {
		if (redirectTo) {
			// custom redirect
			return redirect(req, resp, redirectTo, redirectUrlParam);
		}
		// if we have a custom render, use it
		if (renderUnauthorized) {
			return resp.status(401).render(renderUnauthorized, {
				reason: reason,
				error: error,
				redirectUrl: url
			});
		}
		resp.status(401).send('Unauthorized');
	}
}

/**
 * Middleware class for returning express compatible middleware
 */
function Middleware(options) {
	options = options || {};

	var header = options.header || 'authorization',
		urlpattern = options.urlpattern,
		errorHandler = options.errorHandler,
		redirectTo = options.redirect,
		redirectUrlParam = options.redirectUrlParam || 'redirect',
		secret = options.secret,
		encoding = options.encoding || 'utf8',
		renderUnauthorized = options.renderUnauthorized,
		successHandler = options.successHandler,
		required = options.required === undefined ? true : options.required,
		useSession = options.useSession,
		sessionKey = useSession && (options.sessionKey || header);

	if (!secret) {
		throw new SecurityError('missing required options "secret"');
	}

	/**
	 * the middleware code itself
	 */
	return function middleware (req, resp, next) {
		if (!urlpattern || urlpattern.test(req.url)) {
			var value = req.headers && req.headers[header];
			if (!value && required) {
				return unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, 'unauthorized', new Error('missing ' + header + ' header'));
			} else if (value) {
				try {
					var encoded = seclib.validateAPITokenFromHTTPAuthorization(secret, value, encoding);
					req[header] = encoded;
					if (useSession && req.session) {
						req.session[sessionKey] = useSession;
					}
					if (successHandler) {
						return successHandler(req, resp, next, encoded);
					}
				}
				catch (E) {
					if (required) {
						// console.log(E.stack);
						return unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, E.message, E);
					}
				}
			}
		}
		return next();
	};
}

module.exports = Middleware;
