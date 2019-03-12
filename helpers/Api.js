exports.unknownerror = function (error) {
    return this.createResponse(false, 'unkonwn_error', 'Unknown error. Try again')
}



/** create formated api json response */
exports.createResponse = function (success, type, message, data, stackTrace) {

    return {
        success: success,
        type: type.toLowerCase(),
        message: message,
        data: data,
        stack: stackTrace
    };
}

/** format express validation errors */
exports.formatErrorExpress = function ({ location, msg, param, value, nestedErrors }) {
    return msg
}



exports.catchAsyncErrors = function (fn) {
    return (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => {
                console.log('async error', err)
                next(err)
            });
        }
    }
}