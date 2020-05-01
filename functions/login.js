const jwt = require('jsonwebtoken');
const bcyrpt = require('bcryptjs');
const User = require('../models/User');
const authLib = require('../libs/auth-lib');

exports.handler = async (event, context) => {
    const email = event.email;
    const password = event.password;
    const isMobile = event.isMobile;
    const mtoken = event.mtoken; //Mobile token

    try {
        if(!email) throw new Error('Email is required');

        //Check if user exists
        const user = await User.findOne({ email });
        if(!user) throw new Error('Incorrect username or password');

        if (isMobile){
            
            if(mtoken){
                //Check if mobile token exists in db
                if(!user.mtoken) throw new Error('Failed to login')

                //Check if mobile token matches
                if(mtoken !== user.mtoken) throw new Error('Unable to login');

                //Verify and Generate an authorizer token
                authLib.verifyAuthorizerToken('Bearer ' + mtoken)
                const token = authLib.createAuthorizerToken(user.id, email);

                return {
                    success: true,
                    data: {
                        token
                    }
                }
                
            } else {
                //No token, try to login
                if(!password) throw new Error('Password is required');

                //Check user password if match
                const success = await bcyrpt.compare(password, user.password);
                if(!success) throw new Error('Incorrect username or password');

                const token = authLib.createAuthorizerToken(user.id, email);
                const mtoken = authLib.createMobileToken(user.id, email);
                
                //Store the mobile token to user
                await User.findByIdAndUpdate(user.id, {mtoken}, {useFindAndModify: false});

                return {
                    success: true,
                    data: {
                        token,
                        mtoken
                    }
                }
            }
            
        } else {
            
            if(!password) throw new Error('Password is required');
            
            //Check user password if match
            const success = await bcyrpt.compare(password, user.password);
            if(!success) throw new Error('Incorrect username or password');
    
            const userVersion = user.tokenVersion || '1';
            const token = authLib.createAuthorizerToken(user.id, email);
            const rtoken = authLib.createRefreshToken(user.id, userVersion);
            return {
                success: true,
                data: {
                    token,
                    rtoken
                }
            }
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }    
}