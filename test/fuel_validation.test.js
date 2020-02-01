const chai = require('chai');
const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const addFuel = require('../functions/addFuel');
const updateFuel = require('../functions/updateFuel');
const {today, yesterday, lastweek, lastmonth } = require('../libs/test-lib');

let expect = chai.expect;

describe('Odometer and Date validations', function() {
    let user = null;
    let vehicle = null;
    let fuelList = [];

    before(async function() {
        //Create a user
        user = new User({
            email: "utf.test1@gmail.com",
            password: "p123456",
            name: "Utf Test1"
        });
        await user.save();

        //Create a vehicle
        vehicle = new Vehicle({
            make: "MakeTest",
            model: "MakeModel",
            year: 1900,
            user: user._id,
            name: "NameTest"
        });
        await vehicle.save();

        //Create a fuel transaction
        const fuel = new Fuel({
            vehicle: vehicle._id,
            date: new Date(lastweek).toISOString(),
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
        const fuel2 = new Fuel({
            vehicle: vehicle._id,
            date: new Date(yesterday).toISOString(),
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

    it('Adds a transaction where odometer is less than the previous one', async function() {
        const newFuel = await addFuel.handler({
            userId: user._id,
            data: {
                vehicle: vehicle._id,
                date: new Date(today).toISOString(),
                odometer: 10500,
                volume: 10,
                price: 3,
                cost: 30,
                isFull: true
            }
        }, {});

        if(newFuel.success) fuelList.push(newFuel.data._id);
        expect(newFuel.success).to.be.equal(false);
        expect(newFuel.error).to.be.equal('The odometer reading is less than the previous fuel fillup odometer');
    });

    it('Adds a transaction where odometer is greater than the next one', async function() {
        const newFuel = await addFuel.handler({
            userId: user._id,
            data: {
                vehicle: vehicle._id,
                date: new Date(lastmonth).toISOString(),
                odometer: 10500,
                volume: 10,
                price: 3,
                cost: 30,
                isFull: true
            }
        }, {});

        if(newFuel.success) fuelList.push(newFuel.data._id);
        expect(newFuel.success).to.be.equal(false);
        expect(newFuel.error).to.be.equal('The odometer reading is greater than the next fuel fillup odometer');
    });

    it('Updates a transaction where odometer is less than the previous one', async function() {
        const updateData = {
            id: fuelList[1],
            userId: user._id,
            data: {
                odometer: 9000
            }
        }
        const fuel = await updateFuel.handler(updateData, {});
        expect(fuel.success).to.be.equal(false);
        expect(fuel.error).to.be.equal('The odometer reading is less than the previous fuel fillup odometer');
    });

    it('Updates a transaction where odometer is greater than the next one', async function() {
        const updateData = {
            id: fuelList[0],
            userId: user._id,
            data: {
                odometer: 12000
            }
        }
        const fuel = await updateFuel.handler(updateData, {});
        expect(fuel.success).to.be.equal(false);
        expect(fuel.error).to.be.equal('The odometer reading is greater than the next fuel fillup odometer');
    });

    it('Add a fuel transaction with already an existing date', async function() {
        const newFuel = await addFuel.handler({
            userId: user._id,
            data: {
                vehicle: vehicle._id,
                date: new Date(lastweek).toISOString(),
                odometer: 10000,
                volume: 10,
                price: 3,
                cost: 30,
                isFull: true
            }
        }, {});

        if(newFuel.success) fuelList.push(newFuel.data._id);
        expect(newFuel.success).to.be.equal(false);
        expect(newFuel.error).to.be.equal('There is already an existing fuel transaction with the same date and odometer reading');
    });

    it('Updates the date of fuel transaction', async function() {
        const updateData = {
            id: fuelList[0],
            userId: user._id,
            data: {
                date: new Date(lastmonth).toISOString()
            }
        }
        const fuel = await updateFuel.handler(updateData, {});
        expect(fuel.success).to.be.equal(false);
        expect(fuel.error).to.be.equal('Date of fuel transaction cannot be updated');
    });

    after(async function() {
        //Cleanup fuel transactions
        for(const fuelId of fuelList){
            await Fuel.findByIdAndDelete(fuelId);
        }

        if(vehicle) await Vehicle.findByIdAndDelete(vehicle._id);
        if(user) await User.findByIdAndDelete(user._id);
    });
});