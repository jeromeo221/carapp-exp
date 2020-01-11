const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const connectToDatabase = async () => {
  let isConnected = mongoose.connection.readyState;;
  if (isConnected) {
    console.log('using existing database connection');
    return Promise.resolve();
  }

  console.log('using new database connection');
  const uri = process.env.MONGODB_URL || `mongodb://localhost:27017/carapp`
  await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
};

module.exports = connectToDatabase;