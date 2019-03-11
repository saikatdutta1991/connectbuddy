
const ApplicationError = require("./ApplicationError");
const Api = require('./Api');

module.exports = function (err, req, res, next) {
    if (err instanceof ApplicationError) {
        return res.json(Api.createResponse(false, err.type, err.message, err.data))
    }
    return res.json(Api.unknownerror())
}