const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var friendRequestSchema = new Schema({
    from_user: Schema.Types.ObjectId,
    to_user: Schema.Types.ObjectId,
    status: {
        type: String,
        default: ''
    }
});

/** static status types */
friendRequestSchema.statics.REQUESTED = 'requested';
friendRequestSchema.statics.ACCEPTED = 'accepted';

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;