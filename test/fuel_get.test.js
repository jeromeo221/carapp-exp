const chai = require('chai');
const mongoose = require('mongoose');
const getFuel = require('../functions/getFuel');
const listFuel = require('../functions/listFuels');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const {lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Retrieve fuel details', async function() {
    let vehicle = null;
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
    });

    it('Gets the fuel details', async function() {
        const result = await getFuel.handler({ id: fuelList[0] }, {});

        expect(result.success).to.be.equal(true);
        expect(result.data.vehicle.toString()).equals(vehicle._id.toString());
        expect(result.data.date.toISOString()).to.be.equal(new Date(lastmonth).toISOString());
        expect(result.data.odometer).to.be.equal(10000);
        expect(result.data.volume).to.be.equal(30);
        expect(result.data.price).to.be.equal(1.1);
        expect(result.data.cost).to.be.equal(33);
        expect(result.data.isFull).to.be.equal(true);
        expect(result.data.isMissed).to.be.equal(false);
    });

    it('Gets the fuel list', async function() {
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
        
        const result = await listFuel.handler({ vehicle: vehicle._id}, {});
        expect(result.success).to.be.equal(true);
        expect(result.data).to.have.length(2);
        expect(result.data[0].odometer).to.be.equal(10000);
        expect(result.data[1].odometer).to.be.equal(10500);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }
 
        await Vehicle.findByIdAndDelete(vehicle._id);
    });
});
