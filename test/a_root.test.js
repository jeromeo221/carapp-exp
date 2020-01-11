const mongoose = require('mongoose');

before(async function() {
    let mongoUrl = process.env.MONGODB_URL_UTF || process.env.MONGODB_URL;
    let uri = mongoUrl || 'mongodb://localhost:27017/carapp'
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
});

after(async function() {
    await mongoose.disconnect();
});