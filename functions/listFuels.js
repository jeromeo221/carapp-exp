const Fuel = require('../models/Fuel');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    try {
        if(!event.vehicle) throw new Error('Vehicle is required');
        await vehicleLib.checkVehicleUser(event.vehicle, event.userId);

        //Soft pagination limits
        let page = 1;
        let limit = 20;
        if(event.page) page = parseInt(event.page);
        if(event.limit) limit = parseInt(event.limit);
        
        //let fuels = await Fuel.find({ vehicle: event.vehicle }, null, {sort: 'date'});
        let fuels = await Fuel.paginate({ vehicle: event.vehicle }, { sort: {date: 'asc'}, page, limit})
        return {
            success: true,
            data: fuels.docs,
            options: {
                totalPages: fuels.pages,
                limit: fuels.limit,
                page: fuels.page
            }
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}