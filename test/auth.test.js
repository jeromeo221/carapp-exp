const chai = require('chai');
const User = require('../models/User');
const signup = require('../functions/signup');
const login = require('../functions/login');
const getUser = require('../functions/getUser');
const updateUser = require('../functions/updateUser');
const updateUserPwd = require('../functions/updateUserPwd');
const refresh = require('../functions/refresh');
const authLib = require('../libs/auth-lib');
const bcrypt = require('bcryptjs');

let expect = chai.expect;

describe('Authentication and Authorization', function() {
    let user = null;
    let newUser = null;
    let rtoken = null;
    const email = "utf.test2@gmail.com";

    before(async function() {
        const userPassword = 'p123456'
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(userPassword, salt);
        user = new User({
            email: "utf.test1@gmail.com",
            password: hash,
            name: "Utf Test1"
        });
        await user.save();
    });

    it('Signup with user already registered', async function() {
        const result = await signup.handler({ 
            email: "utf.test1@gmail.com",
            name: "Utf Test1",
            password: "p123456",
            password2: "p123456"
        });        
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('This email is already registered');
    });

    it('Signup user', async function() {
        const result = await signup.handler({ 
            email,
            name: "Utf Test2",
            password: "p123456",
            password2: "p123456"          
        });
        expect(result.success).to.be.equal(true);
        expect(result.data.email).to.be.equal(email);
        expect(result.data.name).to.be.equal('Utf Test2');
        const newUserList = await User.find({email});
        newUser = newUserList[0];
        expect(newUser.email).to.be.equal(email);
    });

    it('Login user with non existent email', async function() {
        const result = await login.handler({
            email: "nonexistentemail@gmail.com",
            password: "p123456"
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Incorrect username or password');
    });

    it('Login user with wrong password', async function() {
        const result = await login.handler({
            email,
            password: "p12345"
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Incorrect username or password');
    });

    it('Login user', async function() {
        const result = await login.handler({
            email,
            password: "p123456"
        }, {});
        expect(result.success).to.be.equal(true);
        expect(result.data.token).to.have.length.greaterThan(10);
    });

    it('Refresh token', async function() {
        //Create a refresh token first
        rtoken = authLib.createRefreshToken(user._id, 1);
        const result = await refresh.handler({caid: rtoken}, {});
        expect(result.success).to.be.equal(true);
        expect(result.data.token).to.have.length.greaterThan(10);

        //This token should have a version of 2 to be used on the next test case
        rtoken = result.data.rtoken;
    });

    it('Refresh token on the next version', async function() {
        //The user and new token from prev test case should have both of version 2
        const result = await refresh.handler({caid: rtoken}, {});
        expect(result.success).to.be.equal(true);
        expect(result.data.token).to.have.length.greaterThan(10);
    });

    it('Refresh token with the wrong version', async function() {
        const wrongToken = authLib.createRefreshToken(user._id, 5);
        const result = await refresh.handler({caid: wrongToken}, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Token is expired');
    });

    it('Get the user', async function() {
        const result = await getUser.handler({
            id: user._id,
            userId: user._id
        }, {});
        expect(result.data.name).to.be.equal('Utf Test1');
        expect(result.data.email).to.be.equal('utf.test1@gmail.com');
    });

    it('Update the user', async function() {
        const newUser = {
            email: 'utf.test1.upd@gmail.com',
            name: 'Utf Test 1 update'
        }
        const result = await updateUser.handler({
            id: user._id,
            userId: user._id,
            data: newUser
        }, {});
        expect(result.success).to.be.equal(true);
        expect(result.data.name).to.be.equal('Utf Test 1 update');
        expect(result.data.email).to.be.equal('utf.test1.upd@gmail.com');
    });

    it('Update the user password no new password populated', async function() {
        const passwordData = {
            oldPassword: "p123456",
            password: "p1112"
        }
        const result = await updateUserPwd.handler({
            id: user._id,
            userId: user._id,
            data: passwordData
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('New Password is required');
    });

    it('Update the user password with incorrect old password', async function() {
        const passwordData = {
            oldPassword: "p12345",
            password: "p1112",
            password2: "p1112"
        }
        const result = await updateUserPwd.handler({
            id: user._id,
            userId: user._id,
            data: passwordData
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Incorrect password');
    });

    it('Update the user password successfully', async function(){
        const passwordData = {
            oldPassword: "p123456",
            password: "p1112",
            password2: "p1112"
        }
        const result = await updateUserPwd.handler({
            id: user._id,
            userId: user._id,
            data: passwordData
        }, {});
        expect(result.success).to.be.equal(true);
    });

    after(async function() {
        if(user) await User.findByIdAndDelete(user._id);
        if(newUser) await User.findByIdAndDelete(newUser._id);
    });
});