const Fuel = require('../models/Fuel');
const fuelLib = require('../libs/fuel-lib');

exports.handler = async (event, context) => {
    let inputData = event.data;

    //This needs to be recomputed
    inputData.mileage = null;
    inputData.pricekm = null;

    //Do not allow to update date as this will complicate fuel efficiency computation
    if(inputData.date){
        return {
            success: false,
            error: 'Date of fuel transaction cannot be updated'
        }
    }
    
    try {
        const fuel = await Fuel.findById(event.id);
        const toUpdateFuel = {
            ...fuel._doc,
            ...inputData
        }
        
        await fuelLib.validate(toUpdateFuel);
        const result = await fuelLib.computeEfficiency(toUpdateFuel);
        inputData.mileage = result.mileage;
        inputData.pricekm = result.pricekm;

        const newFuel = await Fuel.findByIdAndUpdate(event.id, inputData, {new: true, useFindAndModify: false});
        if(newFuel){
            await fuelLib.recalculateEfficiency(newFuel);
            return {
                success: true,
                data: newFuel
            }
        } else {
            return {
                success: false,
                error: 'Unable to update the fuel transaction'
            }
        }
        
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}