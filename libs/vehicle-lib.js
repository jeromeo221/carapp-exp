const Vehicle = require('../models/Vehicle');

exports.validate = (data) => {
    if(!data.make) throw new Error('Make is required');
    if(!data.model) throw new Error('Model is required');
}