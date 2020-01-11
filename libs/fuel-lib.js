const Fuel = require('../models/Fuel');

exports.validate = async (currentFuel) => {
    try{
        //Validate if there is a an existing date and odometer
        const dupFuel = await Fuel.find(
            { 
                _id: {$ne: currentFuel._id},
                date: {$eq: currentFuel.date},
                odometer: {$eq: currentFuel.odometer},
                vehicle: {$eq: currentFuel.vehicle}
            });
        if(dupFuel.length > 0){
            throw new Error('There is already an existing fuel transaction with the same date and odometer reading');
        }

        //Validate to make sure odometer of fuel record is greater than the previous fuel record
        const prevFuels = await Fuel.find(
            { 
                date: {$lt: currentFuel.date}, 
                vehicle: {$eq: currentFuel.vehicle}
            }, null, {sort: '-date'});
        
        for(const fuel of prevFuels){
            if(fuel.odometer >= currentFuel.odometer){
                throw new Error('The odometer reading is less than the previous fuel fillup odometer')
            }
            break;
        }

        //Validate to make sure odometer of fuel record is less than the next fuel record
        const nextFuels = await Fuel.find(
            { 
                date: {$gt: currentFuel.date},
                vehicle: {$eq: currentFuel.vehicle}
            }, null, {sort: 'date'});

        for(const fuel of nextFuels){
            if(fuel.odometer <= currentFuel.odometer){
                throw new Error('The odometer reading is greater than the next fuel fillup odometer')
            }
            break;
        }
    } catch (err){
        throw new Error(err.message);
    }
}

exports.computeEfficiency = async (currentFuel) => {
    try {
        let volume = 0;
        let cost = 0;
        let mileage = null;
        let pricekm = null;

        //Only computed if it is full and is not missed
        if (!currentFuel.isMissed && currentFuel.isFull) {
            volume += currentFuel.volume;
            cost += currentFuel.cost;

            //Find the previous fuel records
            const fuels = await Fuel.find(
                { 
                    date: {$lt: currentFuel.date},
                    vehicle: {$eq: currentFuel.vehicle}
                }, null, {sort: '-date'});

            for (const fuel of fuels){
                //If it is missed and not full, then we cannot compute
                if(fuel.isMissed && !fuel.isFull){
                    break;
                }

                //If full, then use this to compute the efficiency, if not, get the next record
                if(fuel.isFull){
                    mileage = (currentFuel.odometer - fuel.odometer)/volume
                    pricekm = (currentFuel.odometer - fuel.odometer)/cost
                    break;
                } else {
                    //Add the volume if this is not full
                    volume += fuel.volume;
                    cost += fuel.cost;
                }
            }
        }
        return {
            mileage,
            pricekm
        }
    } catch(err){
        throw new Error(err.message);
    }
}

exports.recalculateEfficiency = async (currentFuel) => {
    try {
        //When a record is manipulated, we need to recalculate all fuel efficiency after this record. 
        //This will work assuming that the user cannot update the fuel date.
        const fuels = await Fuel.find(
            { 
                date: {$gt: currentFuel.date},
                vehicle: {$eq: currentFuel.vehicle}
            }, null, {sort: 'date'});
            
        for(const fuel of fuels){
            const eff = await this.computeEfficiency(fuel);
            if(eff.mileage !== fuel.mileage || eff.pricekm !== fuel.pricekm){
                fuel.mileage = eff.mileage;
                fuel.pricekm = eff.pricekm;
                await Fuel.findByIdAndUpdate(fuel._id, fuel, {useFindAndModify: false});
            }
        }
    } catch(err){
        throw new Error(err.message);
    }
}