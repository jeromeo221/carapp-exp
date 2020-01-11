const Vehicle = require('../models/Vehicle');
const Fuel = require('../models/Fuel');

exports.handler = async (event, context) => {
    try {
        //Find if there are any fuel transaction. For now, error out.
        const fuels = await Fuel.find({ vehicle: event.id});
        if(fuels.length > 0){
            return {
                success: false,
                error: "There is an existing fuel transactions"
            }
        } else {
            const vehicle = await Vehicle.findById(event.id);
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