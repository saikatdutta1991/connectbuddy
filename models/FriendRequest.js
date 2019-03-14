const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var friendRequestSchema = new Schema({
    from_user: { type: Schema.Types.ObjectId, ref: 'User' },
    to_user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        default: ''
    }
}, {
        timestamps: { createdAt: true, updatedAt: false }
    });

/** static status types */
friendRequestSchema.statics.REQUESTED = 'requested';
friendRequestSchema.statics.ACCEPTED = 'accepted';

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;