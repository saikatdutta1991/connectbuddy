"use strict";

let MessageStorage = function () {
    this.__storage = {};
}

MessageStorage.prototype.pushMessage = function (uid, message) {
    this.__createObjectKey(uid)
    this.__storage[uid].push(message)
}


MessageStorage.prototype.pullMessage = function (uid) {
    this.__createObjectKey(uid)
    let message = this.__storage[uid].splice(0, 1)[0];
    return message;
}


MessageStorage.prototype.__createObjectKey = function (keyname) {
    if (this.__storage[keyname] == undefined) {
        this.__storage[keyname] = []
    }
}

MessageStorage.prototype.clearMessages = function (uid) {
    this.__createObjectKey(uid)
    this.__storage[uid] = []
}



MessageStorage.prototype.getStorage = function () {
    return this.__storage;
}


let messageStorage = new MessageStorage();
module.exports = messageStorage;