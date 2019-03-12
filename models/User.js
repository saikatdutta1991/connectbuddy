const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PointSchema = require('./PointSchema');
const jwt = require('jsonwebtoken');

var userSchema = new Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        maxlength: [128, 'User name must be between 0-128 characters']
    },
    location: {
        type: PointSchema,
        required: true
    },
    email: {
        type: String,
        required: [true, 'User email is required']
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
});


/** get jwt token */
userSchema.methods.getJwtToken = function () {
    return jwt.sign({
        data: {
            _id: this._id,
            email: this.email
        }
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
}


/** remove password property from json response */
userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    return obj;
}



const User = mongoose.model('User', userSchema);

module.exports = User;