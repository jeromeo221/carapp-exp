const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number
    },
    user: {
        type: String
    },
    name: {
        type: String
    },
    unit: {
        type: String
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);