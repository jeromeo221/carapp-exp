const authLib = require('../libs/auth-lib');

exports.handler = (event, context) => {
    const bearerToken = event.authorizationToken;

    if(!bearerToken) {
        context.fail('No authorization token');
        return;
    }

    try {
        const authorizerContext = authLib.verifyAuthorizerToken(bearerToken);
        const policy = authLib.generateIamPolicy(authorizerContext.userId, 'Allow', authorizerContext, event.methodArn);
        context.succeed(policy);
    } catch(err){
        context.fail(err.message);
    } 
}