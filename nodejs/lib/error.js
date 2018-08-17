'use strict';

/**
 * SecurityError class
 *
 * @param {String|*} message error message
 * @param {String|*} code error code
 * @param {Number|*} status status code
 * @returns {void}
 */
function SecurityError(message, code, status) {
	Object.setPrototypeOf(this.constructor, Object.getPrototypeOf(Error));
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = message;
	this.code = code;
	this.status = status || 500;
}

module.exports = SecurityError;
