const jwt = require('jsonwebtoken');

exports.createAuthorizerToken = (id, email) => {
  const secret = process.env.AUTHORIZER_PHRASE;
  if(!secret) throw new Error('No authorizer phrase');
  
  const payload = {
    userId: id,
    email
  }
  const token = jwt.sign({payload}, secret, {expiresIn: '15m'});
  return token;
}

exports.createRefreshToken = (id, version) => {
  const secret = process.env.REFRESHER_PHRASE;
  if(!secret) throw new Error('No authorizer phrase');
  
  const payload = {
    userId: id,
    version
  }
  const token = jwt.sign({payload}, secret, {expiresIn: '1d'});
  return token;
}

exports.sendRefreshToken = (res, token) => {
  res.cookie('caid', token, {
    httpOnly: true,
    path: '/refresh'
  });
}

exports.verifyAuthorizerToken = (bearerToken) => {
  const tokenArray = bearerToken.split(" ");

  if(!tokenArray[1]) {
    throw new Error('No authorization token');
  }

  const secret = process.env.AUTHORIZER_PHRASE;
  if(!secret) {
    throw new Error('No authorizer phrase');
  }

  const decoded = jwt.verify(tokenArray[1], secret);
  return {
    userId: decoded.payload.userId,
    email: decoded.payload.email
  }
}

exports.verifyRefreshToken = (token) => {
  if(!token) {
    throw new Error('No authorization token');
  }

  const secret = process.env.REFRESHER_PHRASE;
  if(!secret) {
    throw new Error('No authorizer phrase');
  }

  const decoded = jwt.verify(token, secret);
  return {
    userId: decoded.payload.userId,
    version: decoded.payload.version
  }
}

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