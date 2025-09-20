const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Database Connected Successfully");
    })
    .catch((error)=>{
        console.log("Database Connection Failled");
        console.error(error);
        process.exit(1);
    })
}