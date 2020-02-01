const jwt = require('jsonwebtoken');
const bcyrpt = require('bcryptjs');
const User = require('../models/User');

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

        const secret = process.env.AUTHORIZER_PHRASE;
        if(!secret) throw new Error('No authorizer phrase');

        const payload = {
            userId: user.id,
            email
        }
        const token = jwt.sign({payload}, secret, {expiresIn: '1h'});
        return {
            success: true,
            data: {
                token: token
            }
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }    
}