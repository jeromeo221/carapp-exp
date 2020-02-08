const chai = require('chai');
const addVehicle = require('../functions/addVehicle');
const getVehicle = require('../functions/getVehicle');
const updateVehicle = require('../functions/updateVehicle');
const deleteVehicle = require('../functions/deleteVehicle');
const listVehicle = require('../functions/listVehicles');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

let expect = chai.expect;

describe('Vehicle operations', async function() {
    let vehicle = null;
    let vehicle2 = null;
    let user = null;
    let user2 = null;

    before(async function() {
        user = new User({
            email: "utf.test1@gmail.com",
            password: "p123456",
            name: "Utf Test1"
        });
        await user.save();

        user2 = new User({
            email: "utf.test2@gmail.com",
            password: "p123456",
            name: "Utf Test2"
        });
        await user2.save();
    });

    it('Adds a vehicle', async function() {
        const result = await addVehicle.handler({
            userId: user._id,
            data: {
                make: "MakeTest",
                model: "ModelTest",
                year: 1900,
                name: "NameTest"
            }
        }, {});
        expect(result.success).to.be.equal(true);
        vehicle = await Vehicle.findById(result.data._id);
        expect(vehicle.make).to.be.equal('MakeTest');
        expect(vehicle.model).to.be.equal('ModelTest');
        expect(vehicle.year).to.be.equal(1900);
        expect(vehicle.name).to.be.equal('NameTest');
        expect(vehicle.user.toString()).equals(user._id.toString());
    });

    it('Gets the vehicle details', async function() {
        const payload = {
            userId: user._id,
            id: vehicle._id
        }
        const result = await getVehicle.handler(payload, {});
        expect(result.success).to.be.equal(true);
        expect(result.data.make).to.be.equal('MakeTest');
        expect(result.data.model).to.be.equal('ModelTest');
        expect(result.data.year).to.be.equal(1900);
        expect(vehicle.user.toString()).equals(user._id.toString());
        expect(result.data.name).to.be.equal('NameTest');
    });

    it('Gets the vehicle details with different user', async function() {
        const payload = {
            userId: user2._id,
            id: vehicle._id
        }
        const result = await getVehicle.handler(payload, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Oops. Vehicle does not exist');
    });

    it('Updates the vehicle details', async function() {
        const result = await updateVehicle.handler({
            id: vehicle._id,
            userId: user._id,
            data: {
                make: "MakeTest",
                model: "UpdatedModelTest"
            }
        }, {});
        expect(result.success).to.be.equal(true);
        const newVehicle = await Vehicle.findById(vehicle._id);
        expect(newVehicle.make).to.be.equal('MakeTest');
        expect(newVehicle.model).to.be.equal('UpdatedModelTest');
    });

    it('Updates the vehicle details with different user', async function() {
        const result = await updateVehicle.handler({
            id: vehicle._id,
            userId: user2._id,
            data: {
                make: "MakeTest2",
                model: "UpdatedModelTest2"
            }
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Oops. Vehicle does not exist');
    });

    it('Gets the vehicle list', async function() {
        vehicle2 = new Vehicle({
            make: 'MakeTest2',
            model: 'ModelTest2',
            year: 1901,
            user: user._id,
            name: 'NameTest2'
        });
        await vehicle2.save();
        const result = await listVehicle.handler({ userId: user._id }, {});
        expect(result.success).to.be.equal(true);
        expect(result.data).to.have.length(2);
    });

    it('Deletes the vehicle with different user', async function() {
        const result = await deleteVehicle.handler({
            id: vehicle._id,
            userId: user2._id
        }, {});
        expect(result.success).to.be.equal(false);
        expect(result.error).to.be.equal('Oops. Vehicle does not exist');
    });
    
    it('Deletes the vehicle', async function() {
        const result = await deleteVehicle.handler({
            id: vehicle._id,
            userId: user._id
        }, {});
        expect(result.success).to.be.equal(true);
    });

    after(async function() {
        await Vehicle.findByIdAndDelete(vehicle._id);
        await Vehicle.findByIdAndDelete(vehicle2._id);
        await User.findByIdAndDelete(user._id);
        await User.findByIdAndDelete(user2._id);
    });
});
