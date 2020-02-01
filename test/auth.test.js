const chai = require('chai');
const User = require('../models/User');
const signup = require('../functions/signup');
const login = require('../functions/login');

let expect = chai.expect;

describe('Authentication and Authorization', function() {
    let user = null;
    let newUser = null;
    const email = "utf.test2@gmail.com";

    before(async function() {
        user = new User({
            email: "utf.test1@gmail.com",
            password: "p123456",
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
        token = result.data.token;
    });

    after(async function() {
        if(user) await User.findByIdAndDelete(user._id);
        if(newUser) await User.findByIdAndDelete(newUser._id);
    });
});