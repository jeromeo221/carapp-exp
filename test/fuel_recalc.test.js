const chai = require('chai');
const mongoose = require('mongoose');
const fuelLib = require('../libs/fuel-lib');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const {today, yesterday, lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Recalculation of fuel efficiency', function() {
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

        //Create a fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: lastmonth,
            odometer: 10000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);

        //Create another fuel transaction
        fuel2 = new Fuel({
            vehicle: vehicle._id,
            date: today,
            odometer: 11000,
            volume: 25,
            price: 2.5,
            cost: 62.5,
            isFull: true,
            isMissed: false
        });
        await fuel2.save();
        fuelList.push(fuel2._id);
    });

    it('Add a middle transaction with fuel efficiency recalculation', async function() {
        const addFuel = new Fuel({
            vehicle: vehicle._id,
            date: lastweek,
            odometer: 10600,
            volume: 70,
            price: 1.4,
            cost: 98,
            isFull: true,
            isMissed: true
        })
        await addFuel.save();
        fuelList.push(addFuel._id);

        await fuelLib.recalculateEfficiency(addFuel);
        const recalcFuel = await Fuel.findById(fuel2._id);
        expect(recalcFuel.mileage).to.be.equal(16);
        expect(recalcFuel.pricekm).to.be.equal(6.4);
    });

    it('Add another middle transaction with missed and not full', async function() {
        const addFuel = new Fuel({
            vehicle: vehicle._id,
            date: yesterday,
            odometer: 10800,
            volume: 10,
            price: 1,
            cost: 10,
            isFull: false,
            isMissed: true
        })
        await addFuel.save();
        fuelList.push(addFuel._id);

        await fuelLib.recalculateEfficiency(addFuel);
        const recalcFuel = await Fuel.findById(fuel2._id);
        expect(recalcFuel.mileage).to.be.null;
        expect(recalcFuel.pricekm).to.be.null;
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        await Vehicle.findByIdAndDelete(vehicle._id);
    });
});