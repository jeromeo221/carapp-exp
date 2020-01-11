const Fuel = require('../models/Fuel');
const fuelLib = require('../libs/fuel-lib');

exports.handler = async (event, context) => {
    let inputData = event.data;
    if (inputData.isFull == null) inputData.isFull = false;
    if (inputData.isMissed == null) inputData.isMissed = false;
    let fuel = new Fuel({
        vehicle: inputData.vehicle,
        date: inputData.date,
        odometer: inputData.odometer,
        volume: inputData.volume,
        price: inputData.price,
        cost: inputData.cost,
        isFull: inputData.isFull,
        isMissed: inputData.isMissed
    });
    
    try {
        await fuelLib.validate(fuel);
        const eff = await fuelLib.computeEfficiency(fuel);
        fuel.mileage = eff.mileage;
        fuel.pricekm = eff.pricekm;

        await fuel.save();
        await fuelLib.recalculateEfficiency(fuel);
        return {
            success: true,
            data: fuel
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}