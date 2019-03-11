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