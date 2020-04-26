const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    tokenVersion: {
        type: Number,
        required: false,
        default: 1
    },
    mtoken: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('User', userSchema);