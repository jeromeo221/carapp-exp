const User = require('../models/User');
const authLib = require('../libs/auth-lib');
const connectDb = require('../db');

exports.handler = async (event, context) => {
    try {
        const rtoken = event.caid;
        if(!rtoken) throw new Error('Cannot find token');

        const payload = authLib.verifyRefreshToken(rtoken);
        if(!payload) throw new Error('Cannot verify token');
        
        //Connect to database only at this point
        let dbResult = await connectDb();
        if(dbResult) throw new Error(dbResult.error);

        const user = await User.findById(payload.userId);
        if(!user) throw new Error('Cannot verify user');

        let userTokenVersion = parseInt(user.tokenVersion) || 1;
        let payloadTokenVersion = parseInt(payload.version) || 1;
        console.log('userTokenVersion', userTokenVersion);
        console.log('payloadTokenVersion', payloadTokenVersion);
        
        if(userTokenVersion !== payloadTokenVersion){
            throw new Error('Token is expired');
        }
        const newTokenVersion = userTokenVersion + 1;
        const newRefreshToken = authLib.createRefreshToken(user.id, newTokenVersion);
        const token = authLib.createAuthorizerToken(user.id, user.email);

        //Update User
        const newData = {
            tokenVersion: newTokenVersion
        }
        await User.findByIdAndUpdate(payload.userId, newData, {useFindAndModify: false});

        return {
            success: true,
            data: {
                token,
                rtoken: newRefreshToken
            }
        }    
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }    
}