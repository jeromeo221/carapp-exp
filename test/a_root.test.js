const mongoose = require('mongoose');

before(async function() {
    let uri = process.env.MONGODB_URL_UTF || 'mongodb://localhost:27017/carapp'
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
});

after(async function() {
    await mongoose.disconnect();
});