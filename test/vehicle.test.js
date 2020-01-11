const chai = require('chai');
const mongoose = require('mongoose');
const addVehicle = require('../functions/addVehicle');
const getVehicle = require('../functions/getVehicle');
const updateVehicle = require('../functions/updateVehicle');
const listVehicle = require('../functions/listVehicles');
const Vehicle = require('../models/Vehicle');

let expect = chai.expect;

describe('Vehicle operations', async function() {
    let vehicle = null;
    let vehicle2 = null;

    before(async function() {
    });

    it('Adds a vehicle', async function() {
        const result = await addVehicle.handler({
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
    });

    it('Gets the vehicle details', async function() {
        const result = await getVehicle.handler({id: vehicle._id});
        expect(result.success).to.be.equal(true);
        expect(result.data.make).to.be.equal('MakeTest');
        expect(result.data.model).to.be.equal('ModelTest');
        expect(result.data.year).to.be.equal(1900);
        expect(result.data.name).to.be.equal('NameTest');
    });

    it('Updates the vehicle details', async function() {
        const result = await updateVehicle.handler({
            id: vehicle._id,
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

    it('Gets the vehicle list', async function() {
        vehicle2 = new Vehicle({
            make: 'MakeTest2',
            model: 'ModelTest2',
            year: 1901,
            name: 'NameTest2'
        });
        await vehicle2.save();
        const result = await listVehicle.handler({}, {});
        expect(result.success).to.be.equal(true);
        //expect(result.data).to.have.length(2); Fix this when userId is operational
        expect(result.data).to.have.length.above(2);
    });

    after(async function() {
        await Vehicle.findByIdAndDelete(vehicle._id);
        await Vehicle.findByIdAndDelete(vehicle2._id);
    });
});
