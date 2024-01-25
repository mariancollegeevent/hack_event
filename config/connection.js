// const path = require('path');
// const multer = require('multer');
const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const fs = require('fs');
require('dotenv').config();



// module.exports.connect=function(){
//     mongoose.connect("mongodb://localhost:27017/hackmarathon");
//     console.log("database connected");
// }

// module.exports.connect = function () {
//     // Replace <password> with your actual MongoDB Atlas password
//     const atlasUrl = "mongodb+srv://alenpaji:rrvDrbwgocPECh55@cluster0.qusfk9u.mongodb.net/?retryWrites=true&w=majority";

//     mongoose.connect(atlasUrl, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });

//     const db = mongoose.connection;

//     db.on('error', (err) => {
//         console.error('Database connection error:', err);
//     });

//     db.once('open', () => {
//         console.log('Database connected');
//     });
// };


module.exports.connect = function () {
    const username = process.env.USERNAMEMONGO;
    const password = process.env.PASSWORD;
    console.log(username)

    mongoose.connect(`mongodb+srv://${username}:${password}@event-hackathon.d5mgoek.mongodb.net/?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
    });
};




