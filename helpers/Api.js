const base64Img = require('base64-img');


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



exports.catchAsyncErrors = fn => (...args) => fn(...args).catch(args[2])



exports.imageUrlToBase64 = (picURL) => {
    return new Promise((resolve, reject) => {

        base64Img.requestBase64(picURL, function (err, res, body) {
            if (err) {
                return reject(err);
            }
            resolve(body);
        });

    });
}