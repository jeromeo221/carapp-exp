const Vehicle = require('../models/Vehicle');
const Fuel = require('../models/Fuel');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    try {
        const vehicle = await vehicleLib.checkVehicleUser(event.id, event.userId);

        //Find if there are any fuel transaction. For now, error out.
        const fuels = await Fuel.find({ vehicle: event.id});
        if(fuels.length > 0){
            return {
                success: false,
                error: "There is an existing fuel transactions"
            }
        } else {
            await Vehicle.findByIdAndDelete(event.id);
            return {
                success: true,
                data: vehicle
            }
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}