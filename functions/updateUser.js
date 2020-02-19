const User = require('../models/User');

exports.handler = async (event, context) => {
    try {
        if(!event.userId) throw new Error('Not authorized');
        if(!event.id) throw new Error('User is required');
        if(event.userId !== event.id) throw new Error('Unauthorized to update this user');
        
        let inputData = event.data;
        if(inputData.password) throw new Error('Cannot update password');

        const newUser = await User.findByIdAndUpdate(event.id, event.data, {new: true, useFindAndModify: false});
        const displayNewUser = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
        return {
            success: true,
            data: displayNewUser
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}
