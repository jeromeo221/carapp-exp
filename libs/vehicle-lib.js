const Vehicle = require('../models/Vehicle');

exports.validate = (data) => {
    if(!data.make) throw new Error('Make is required');
    if(!data.model) throw new Error('Model is required');
}

exports.checkVehicleUser = async (vehicleId, userId) => {
    if(!userId) throw new Error('User is required');
    if(!vehicleId) throw new Error('Vehicle is required');
    let vehicle = await Vehicle.findById(vehicleId);
    if(!vehicle) throw new Error('Vehicle does not exist');
    if(!vehicle.user) throw new Error('Vehicle does not have a user');
    if(userId.toString() !== vehicle.user.toString()){
        throw new Error('Oops. Vehicle does not exist');
    }
    return vehicle;
}