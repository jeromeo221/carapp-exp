const User = require('../models/User');

exports.handler = async (event, context) => {
    try {
        if(!event.userId) throw new Error('Not authorized');
        if(!event.id) throw new Error('User is required');
        if(event.userId !== event.id) throw new Error('Unauthorized to view this user');
        
        const user = await User.findById(event.id);
        const userDisplayData = {
            id: user._id,
            email: user.email,
            name: user.name
        }
        return {
            success: true,
            data: userDisplayData
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}