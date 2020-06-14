const Fuel = require('../models/Fuel');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    try {
        if(!event.vehicle) throw new Error('Vehicle is required');
        await vehicleLib.checkVehicleUser(event.vehicle, event.userId);
        
        //let fuels = await Fuel.find({ vehicle: event.vehicle }, null, {sort: 'date'});
        let paginationOption = {
            sort: {date: 'desc'}
        }
        if(event.page) paginationOption["page"] = parseInt(event.page);
        if(event.limit) {
            paginationOption["limit"] = parseInt(event.limit);
        } else {
            paginationOption["limit"] = 50;
        }

        let fuels = await Fuel.paginate({ vehicle: event.vehicle }, paginationOption);
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