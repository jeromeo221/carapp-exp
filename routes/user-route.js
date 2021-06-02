const getUser = require('../functions/getUser');
const updateUser = require('../functions/updateUser.js');
const updateUserPwd = require('../functions/updateUserPwd');
const login = require('../functions/login');
const signup = require('../functions/signup');
const refresh = require('../functions/refresh');
const connectDb = require('../db');
const authLib = require('../libs/auth-lib');

module.exports = function (app) {
    //Signup
    app.post('/signup', async (req, res) => {
        let result = await connectDb();
        if(!result){
            result = await signup.handler(req.body, {});
        }
        res.json(result);
    });

    //Get User
    app.get('/user/:id', async (req, res) => {
        let result = await connectDb();
        if(!result){
            const payload = {
                userId: req.requestContext.authorizer.userId,
                ...req.params
            }
            result = await getUser.handler(payload, {});
        }
        res.json(result);
    });

    //Update User
    app.put('/user/:id', async (req, res) => {
        let result = await connectDb();
        if(!result){
            const newRequest = {
                id: req.params.id,
                userId: req.requestContext.authorizer.userId,
                data: req.body.data
            }
            result = await updateUser.handler(newRequest, {});
        }    
        res.json(result);
    });

    //Change password
    app.put('/user/:id/changepwd', async (req, res) => {
        let result = await connectDb();
        if(!result){
            const newRequest = {
                id: req.params.id,
                userId: req.requestContext.authorizer.userId,
                data: req.body.data
            }
            result = await updateUserPwd.handler(newRequest, {});
        }    
        res.json(result);
    });

    //Login
    app.post('/login', async (req, res) => {
        let result = await connectDb();
        if(!result){
            result = await login.handler(req.body, {});
            if(result.success){
                if(req.body.isMobile){
                    res.json({
                        success: result.success,
                        data: {
                            token: result.data.token,
                            mtoken: result.data.mtoken
                        }
                    });
                } else {
                    authLib.sendRefreshToken(res, result.data.rtoken);
                    res.json({
                        success: result.success,
                        data: {
                            token: result.data.token
                        }
                    });
                }            
                return;
            }
        }
        res.json(result);
    });

    //Logout
    app.post('/logout', (req, res) => {
        try {
            authLib.sendRefreshToken(res, '');
            res.json({ success: true })
        } catch(err){
            res.json({
                success: false,
                error: err.message
            })
        }
    });

    //Refresh
    app.post('/refresh', async (req, res) => {
        result = await refresh.handler(req.cookies, {});
        if(result.success){
            authLib.sendRefreshToken(res, result.data.rtoken);
            res.json({
                success: result.success,
                data: {
                    token: result.data.token
                }
            });
        } else {
            res.json(result);
        }
    });
}