const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
    const email = event.email;
    const name = event.name;
    const password = event.password;
    const password2 = event.password2;
    
    try {
        if(!email) throw new Error('Email is required');
        if(!password || !password2) throw new Error('Password is required');
        if(password !== password2) throw new Error('Password should match');

        const user = await User.findOne({email});
        if(user) throw new Error('This email is already registered');

        //Encrypt password. Might need to be done at front end?
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hash,
            name
        });

        await newUser.save();
        return {
            success: true,
            data: {
                email,
                name
            }
        }
    }catch(err){
        return {
            success: false,
            error: err.message
        }
    }

}