const chai = require('chai');
const mongoose = require('mongoose');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const deleteFuel = require('../functions/deleteFuel');
const {yesterday, lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Delete the fuel transaction', function() {
    let vehicle = null;
    let fuel2 = null;
    let fuelList = [];

    before(async function() {
        //Create a vehicle
        vehicle = new Vehicle({
            make: "MakeTest",
            model: "MakeModel",
            year: 1900,
            name: "NameTest"
        });
        await vehicle.save();

        //Add a 1st baseline fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: lastmonth,
            odometer: 10000,
            volume: 30,
            price: 1.1,
            cost: 33,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);

        //Add a 2nd baseline fuel transaction
        fuel2 = new Fuel({
            vehicle: vehicle._id,
            date: lastweek,
            odometer: 10500,
            volume: 50,
            price: 2,
            cost: 100,
            mileage: 10,
            pricekm: 5,
            isFull: true,
            isMissed: false
        });
        await fuel2.save();
        fuelList.push(fuel2._id);

        //Add a 3rd baseline fuel transaction
        const fuel3 = new Fuel({
            vehicle: vehicle._id,
            date: yesterday,
            odometer: 11400,
            volume: 60,
            price: 3,
            cost: 180,
            mileage: 15,
            pricekm: 5,
            isFull: true,
            isMissed: false
        });
        await fuel3.save();
        fuelList.push(fuel3._id);
    });

    it('Delete the middle fuel transaction', async function() {
        const result = await deleteFuel.handler({ id: fuel2._id });
        const delFuel = await Fuel.findById(fuel2._id);
        
        expect(result.success).to.be.equal(true);
        expect(delFuel).to.be.null;
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
           await Fuel.findByIdAndDelete(fuelId);
        }

        await Vehicle.findByIdAndDelete(vehicle._id);
    });
});