const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
    try {
        if(!event.userId) throw new Error('Not authorized');
        if(!event.id) throw new Error('User is required');
        if(event.userId !== event.id) throw new Error('Unauthorized to update this user');
        
        let inputData = event.data;
        if(!inputData.oldPassword) throw new Error('Old Password is required')
        if(!inputData.password || !inputData.password2) throw new Error('New Password is required');
        if(inputData.password !== inputData.password2) throw new Error('Password should match');

        const user = await User.findById(event.id);
        const success = await bcrypt.compare(inputData.oldPassword, user.password);
        if(!success) throw new Error('Incorrect password');

        //Change the password
        //Encrypt password. Might need to be done at front end?
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(inputData.password, salt);

        await User.findByIdAndUpdate(event.id, { password: hash });
        return {
            success: true
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}
