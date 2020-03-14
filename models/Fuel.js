const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const fuelSchema = new Schema({
    vehicle: {
        type: Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    isFull: {
        type: Boolean,
        required: true,
    },
    isMissed: {
        type: Boolean,
        required: true,
        default: false
    },
    isEstOdo: {
        type: Boolean,
        required: true,
        default: false
    },
    mileage: {
        type: Number
    },
    pricekm: {
        type: Number
    }
});
fuelSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Fuel', fuelSchema);