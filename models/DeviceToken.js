const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var deviceTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    device_type: {
        type: String,
        enum: ['android', 'ios'],
        default: 'android'
    },
    device_token: {
        type: String
    }
});



deviceTokenSchema.statics.getDeviceTokens = async function (userid) {
    let tokens = await this.find({ user: userid }).lean().exec();
    return tokens.map(token => token.device_token);
}


const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);

module.exports = DeviceToken;