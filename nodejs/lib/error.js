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

module.exports = SecurityError;
