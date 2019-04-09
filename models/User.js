const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PointSchema = require('./PointSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const ApplicationError = require('../helpers/ApplicationError');
const DeviceToken = require('../models/DeviceToken');
const PushManager = require('../helpers/PushManager');

var userSchema = new Schema({
    google_account_id: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: [true, "User name is required"],
        maxlength: [128, 'User name must be between 0-128 characters']
    },
    location: {
        type: PointSchema,
        default: {
            coordinates: [0.0000000, 0.0000000]
        }
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
        default: ''
    },

    image_path: {
        type: String,
        default: ''
    },
    image_base64: {
        type: String,
        default: ''
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],

});


userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });
userSchema.index({ location: '2dsphere' });
userSchema.index({ name: 'text', email: 'text' });


/** verify password */
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}



/** encrypt password string to password hash */
userSchema.statics.encryptPassword = password => {
    return bcrypt.hashSync(password, 10);
}




/** get jwt token */
userSchema.methods.getJwtToken = function () {
    return jwt.sign({
        data: {
            _id: this._id,
            email: this.email
        }
    }, process.env.JWT_SECRET, { expiresIn: '1000d' });
}


/** remove password property from json response */
userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    delete obj.image_path;
    delete obj.image_base64;
    return obj;
}



/** 
 * image destination and file name generation
 */
userSchema.statics.imageStorage = multer({
    storage: multer.diskStorage({
        destination: 'public/uploads/users/images',
        filename: (req, file, cb) => {
            var filename = `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`
            cb(null, filename)
        }
    })
}).single('image');



/**
 * upload file promise
 */
userSchema.statics.uploadImage = (req, res) => {
    return new Promise((resolve, reject) => {
        User.imageStorage(req, res, (err) => {
            if (err) {
                return reject(err)
            }

            if (!req.file) {
                reject(new ApplicationError('file_missing', 'Image file missing'));
            }

            resolve(req.file)
        })
    });
}



/** generating image url */
userSchema.virtual('image_url').get(function () {
    if (!this.image_base64) {
        return process.env.DEFAULT_USER_IMAGE_URL;
    }
    return this.image_base64;
});

userSchema.statics.getImageurl = user => {
    if (!user.image_base64) {
        return process.env.DEFAULT_USER_IMAGE_URL;
    }
    return user.image_base64;
}


/**
 * send push notifications
 */
userSchema.statics.sendPushNotification = async function (userid, type, title, subtitle, body, extra = {}) {

    let tokens = await DeviceToken.getDeviceTokens(userid);

    console.log('User::sendPushNotification()');
    console.log('User::sendPushNotification() device tokens : ', tokens);

    tokens.forEach(token => {
        PushManager.send(token, {}, {
            type: type,
            title: title,
            subtitle: subtitle,
            body: body,
            extra: extra
        }).then(response => { console.log(response) }).catch(err => { })
    });
}





const User = mongoose.model('User', userSchema);

module.exports = User;