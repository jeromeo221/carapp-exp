const chai = require('chai');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const updateFuel = require('../functions/updateFuel');
const {today, yesterday, lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Updates fuel transactions', function() {
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

        //Add a baseline fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: lastmonth,
            odometer: 8000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);
    });

    it('Updates the first fuel transaction', async function() {
        const updFuel = await updateFuel.handler({
            id: fuelList[0],
            data: {
                odometer: 10000,
                volume: 28,
                price: 2.1,
                cost: 58.8
            }
        });

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuelList[0]);
        expect(findFuel.date.toISOString()).to.be.equal(new Date(lastmonth).toISOString());
        expect(findFuel.odometer).to.be.equal(10000);
        expect(findFuel.volume).to.be.equal(28);
        expect(findFuel.price).to.be.equal(2.1);
        expect(findFuel.cost).to.be.equal(58.8);
        expect(findFuel.mileage).to.be.null;
        expect(findFuel.pricekm).to.be.null;
        expect(findFuel.isFull).to.be.equal(true);
        expect(findFuel.isMissed).to.be.equal(false);
    });

    it('Updates the last fuel transaction', async function() {
        //Adds another fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: yesterday,
            odometer: 10500,
            volume: 50,
            price: 1,
            cost: 50,
            mileage: 10,
            pricekm: 10,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);

        const updFuel = await updateFuel.handler({
            id: fuel,
            data: {
                odometer: 10600,
                volume: 51,
                price: 1.2,
                cost: 61.2
            }
        });

        expect(updFuel.success).to.be.equal(true);
        const findfuel = await Fuel.findById(fuel._id);
        expect(findfuel.odometer).to.be.equal(10600);
        expect(findfuel.mileage).to.be.closeTo(11.7647, 0.0001);
        expect(findfuel.pricekm).to.be.closeTo(9.8039, 0.0001);
    });

    it('Updates updates the date of fuel transaction', async function() {
        const updFuel = await updateFuel.handler({
            id: fuelList[0],
            data: {
                date: today
            }
        });

        expect(updFuel.success).to.be.equal(false);
        expect(updFuel.error).to.be.equal('Date of fuel transaction cannot be updated');
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});

describe('Updates fuel transaction missed fillup', function() {
    let vehicle = null;
    let fuel2 = null;
    let fuel3 = null;
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
        fuel3 = new Fuel({
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

    it('Updates the odometer of middle fuel transaction', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                odometer: 10600
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2._id);
        expect(findFuel.mileage).to.be.equal(12);
        expect(findFuel.pricekm).to.be.equal(6);
    });

    it('Updates the middle fuel transaction for all parameters', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                odometer: 10700,
                volume: 52,
                price: 2.2,
                cost: 114.4
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2);
        expect(findFuel.mileage).to.be.closeTo(13.4615, 0.0001);
        expect(findFuel.pricekm).to.be.closeTo(6.1188, 0.0001);
    });

    it('Updates middle fuel transaction to missed fillup', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                isMissed: true
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2);
        expect(findFuel.mileage).to.be.null;
        expect(findFuel.pricekm).to.be.null;
    });

    it('Updates middle fuel transaction from missed fillup', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                isMissed: false
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2);
        expect(findFuel.mileage).to.be.closeTo(13.4615, 0.0001);
        expect(findFuel.pricekm).to.be.closeTo(6.1188, 0.0001);
    });

    it('Updates middle fuel transaction from full tank', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                isFull: false
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2);
        expect(findFuel.mileage).to.be.null;
        expect(findFuel.pricekm).to.be.null;
    });

    it('Updates middle fuel transaction to full tank', async function() {
        const updFuel = await updateFuel.handler({
            id: fuel2._id,
            data: {
                isFull: true
            }
        }, {});

        expect(updFuel.success).to.be.equal(true);
        const findFuel = await Fuel.findById(fuel2);
        expect(findFuel.mileage).to.be.closeTo(13.4615, 0.0001);
        expect(findFuel.pricekm).to.be.closeTo(6.1188, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
           await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});