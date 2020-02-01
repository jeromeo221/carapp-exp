const jwt = require('jsonwebtoken');
const iamLib = require('../libs/iam-lib');

exports.handler = (event, context) => {
    const bearerToken = event.authorizationToken;

    if(!bearerToken) {
        context.fail('No authorization token');
        return;
    }
    const tokenArray = bearerToken.split(" ");

    if(!tokenArray[1]) {
        context.fail('No authorization token');
        return;
    }
     
    try {
        const secret = process.env.AUTHORIZER_PHRASE;
        if(!secret) {
            context.fail('No authorizer phrase');
            return;
        }
        const decoded = jwt.verify(tokenArray[1], secret);
        const authorizerContext = { 
            userId: decoded.payload.userId,
            email: decoded.payload.email
        };
        const policy = iamLib.generateIamPolicy(decoded.payload.userId, 'Allow', authorizerContext, event.methodArn);
        context.succeed(policy);
    } catch(err){
        context.fail('Unauthorized');
    } 
}