const jwt = require('jsonwebtoken');
const bcyrpt = require('bcryptjs');
const User = require('../models/User');
const authLib = require('../libs/auth-lib');

exports.handler = async (event, context) => {
    const email = event.email;
    const password = event.password;

    try {
        if(!email) throw new Error('Email is required');
        if(!password) throw new Error('Password is required');

        //Check if user exists
        const user = await User.findOne({ email });
        if(!user) throw new Error('Incorrect username or password');
        
        //Check user password if match
        const success = await bcyrpt.compare(password, user.password);
        if(!success) throw new Error('Incorrect username or password');

        const userVersion = user.version || '1';
        const token = authLib.createAuthorizerToken(user.id, email);
        const rtoken = authLib.createRefreshToken(user.id, userVersion);
        return {
            success: true,
            data: {
                token,
                rtoken
            }
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }    
}