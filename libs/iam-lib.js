exports.generateIamPolicy = (userId, effect, context, arn) => {
    //Do not use the methodArn directly for resource or you'll run into problems
    const resource = arn.split("/");

    const policy = {
        principalId: userId,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: effect,
              Resource: `${resource[0]}/*`,
            },
          ],
        },
        context,
    };
    
    return policy;    
}