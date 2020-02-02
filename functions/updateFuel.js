const Fuel = require('../models/Fuel');
const fuelLib = require('../libs/fuel-lib');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    let inputData = event.data;

    //This needs to be recomputed
    inputData.mileage = null;
    inputData.pricekm = null;
    
    try {
        //Do not allow to update date as this will complicate fuel efficiency computation
        if(inputData.date) throw new Error('Date of fuel transaction cannot be updated');
        const fuel = await Fuel.findById(event.id);
        const toUpdateFuel = {
            ...fuel._doc,
            ...inputData
        }

        //Do not allow to update vehicle
        if(inputData.vehicle && inputData.vehicle.toString() !== fuel.vehicle.toString()){
            throw new Error('Vehicle cannot be updated'); 
        }

        await vehicleLib.checkVehicleUser(fuel.vehicle, event.userId);        
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