
const ApplicationError = require("./ApplicationError");
const Api = require('./Api');

module.exports = function (err, req, res, next) {
    if (err instanceof ApplicationError) {
        return res.json(Api.createResponse(false, err.type, err.message, err.data))
    }

    console.log('unknown error', err)
    return res.json(Api.unknownerror())
}