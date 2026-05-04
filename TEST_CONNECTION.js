const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connection String:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@') : 'MISSING');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((error) => {
    console.log('Connection Failed');
    console.log('Error:', error.message);
    if (error.message.includes('authentication')) {
      console.log('\nTroubleshooting:');
      console.log('1. Check IP Whitelist:');
      console.log('   - Go to https://cloud.mongodb.com/');
      console.log('   - Select your project');
      console.log('   - Go to "Network Access"');
      console.log('   - Add IP "0.0.0.0/0" (Allow Anywhere)\n');
      console.log('2. Verify Database User:');
      console.log('   - Go to "Database Access"');
      console.log('   - Find your database user');
      console.log('   - Edit and reset password if needed\n');
      console.log('3. Check password encoding:');
      console.log('   - Special chars must be URL encoded');
      console.log('   - @ = %40, # = %23, ! = %21\n');
    }
    process.exit(1);
  });
