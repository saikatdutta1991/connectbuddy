module.exports = class ApplicationError extends Error {

    constructor(type, message = '', data = [], status) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.type = type;
        this.data = data;
        this.message = message;

        this.status = status || 200;
    }
}