const chai = require('chai');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const addFuel = require('../functions/addFuel');
const {today, yesterday, lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Adds fuel transactions', function() {
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
    });

    it('Add first fuel resulting to no efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(lastmonth).toISOString(),
                odometer: 10000,
                volume: 30,
                price: 2,
                cost: 60,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);        

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.vehicle.toString()).equals(vehicle._id.toString());
        expect(fuel.date.toISOString()).to.be.equal(new Date(lastmonth).toISOString());
        expect(fuel.odometer).to.be.equal(10000);
        expect(fuel.volume).to.be.equal(30);
        expect(fuel.price).to.be.equal(2);
        expect(fuel.cost).to.be.equal(60);
        expect(fuel.isMissed).to.be.equal(false);
        expect(fuel.isFull).to.be.equal(true);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds second fuel transaction resulting to efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(lastweek).toISOString(),
                odometer: 10500,
                volume: 40,
                price: 2.5,
                cost: 100,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);        

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.equals(12.5);
        expect(fuel.pricekm).to.be.equals(5)
    });

    it('Adds third fuel transaction with not full tank resulting to no efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(yesterday).toISOString(),
                odometer: 10900,
                volume: 35,
                price: 1.7,
                cost: 59.5
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);        

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds fourth fuel transaction with full tank resulting to efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(today).toISOString(),
                odometer: 11200,
                volume: 25,
                price: 1.2,
                cost: 30,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.closeTo(11.6667, 0.0001);
        expect(fuel.pricekm).to.be.closeTo(7.8212, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});

describe('Adds fuel transactions with missed fillup and not full tank', function() {
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

        //Add a fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: new Date(lastmonth).toISOString(),
            odometer: 10000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);
    });

    it('Adds fuel transaction with missed fillup and not full resulting to no efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(lastweek).toISOString(),
                odometer: 11200,
                volume: 25,
                price: 1.2,
                cost: 30,
                isFull: false,
                isMissed: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds another fuel transaction with full tank resulting to no efficiency calcuations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(yesterday).toISOString(),
                odometer: 11500,
                volume: 32,
                price: 2.8,
                cost: 89.6,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds another fuel transaction with full tank resulting to efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(today).toISOString(),
                odometer: 11800,
                volume: 35,
                price: 2.6,
                cost: 91,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.closeTo(8.5714, 0.0001);
        expect(fuel.pricekm).to.be.closeTo(3.2967, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});

describe('Adds fuel transactions with missed fillup and full tank', function() {
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
            date: new Date(lastmonth).toISOString(),
            odometer: 10000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);
    });

    it('Adds fuel transaction with missed fillup and full tank resulting to no efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(lastweek).toISOString(),
                odometer: 10200,
                volume: 15,
                price: 1.5,
                cost: 22.5,
                isFull: true,
                isMissed: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds another fuel transaction with full tank resulting to efficiency calcuations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(yesterday).toISOString(),
                odometer: 10900,
                volume: 50,
                price: 1.5,
                cost: 75,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.equal(14);
        expect(fuel.pricekm).to.be.closeTo(9.3333, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});

describe('Adds fuel transactions with missed fillup and full tank', function() {
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
            date: new Date(lastmonth).toISOString(),
            odometer: 10000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);
    });

    it('Adds fuel transaction with missed fillup and full tank resulting to no efficiency calculations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(lastweek).toISOString(),
                odometer: 10200,
                volume: 15,
                price: 1.5,
                cost: 22.5,
                isFull: true,
                isMissed: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.null;
        expect(fuel.pricekm).to.be.null;
    });

    it('Adds another fuel transaction with full tank resulting to efficiency calcuations', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: new Date(yesterday).toISOString(),
                odometer: 10900,
                volume: 50,
                price: 1.5,
                cost: 75,
                isFull: true
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.equal(14);
        expect(fuel.pricekm).to.be.closeTo(9.3333, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});

describe('Adds fuel transactions with missed fillup and full tank', function() {
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
            odometer: 10000,
            volume: 30,
            price: 2,
            cost: 60,
            isFull: true,
            isMissed: false
        });
        await fuel.save();
        fuelList.push(fuel._id);

        //Add another baseline fuel transaction
        const fuel2 = new Fuel({
            vehicle: vehicle._id,
            date: today,
            odometer: 11000,
            volume: 90,
            price: 1,
            cost: 90,
            isFull: true,
            isMissed: false
        });
        await fuel2.save();
        fuelList.push(fuel2._id);
        
    });

    it('Adds fuel transaction in the middle', async function() {
        const newFuel = await addFuel.handler({
            data: {
                vehicle: vehicle._id,
                date: yesterday,
                odometer: 10500,
                volume: 40,
                price: 1.5,
                cost: 60,
                isFull: true,
                isMissed: false
            }
        }, {});

        expect(newFuel.success).to.be.equal(true);
        fuelList.push(newFuel.data._id);

        const fuel = await Fuel.findById(newFuel.data._id);
        expect(fuel.mileage).to.be.equal(12.5);
        expect(fuel.pricekm).to.be.closeTo(8.3333, 0.0001);
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
    });
});