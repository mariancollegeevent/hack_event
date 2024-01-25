const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const adminSchema = new Schema({
    name : String,
    password : String

  });

const admin=mongoose.model('admin', adminSchema);

function register(adminData){

    return new Promise(async(resolve,reject)=>{
        adminData.password=await bcrypt.hash(adminData.password,10)
        const newadmin = new admin();
        newadmin.name=adminData.username;
        
        newadmin.password=adminData.password;

        newadmin.save();

        resolve(newadmin);
    })

}

function login(userdata) {
    return new Promise(async (resolve, reject) => {
        try {
            const eml = userdata.username;
            const psd = userdata.password;

            const filter = { name: eml };
            const val = await admin.findOne(filter).exec();

            if (val) {
                bcrypt.compare(psd, val.password, function (err, result) {
                    if (err) {
                        reject(err); // Handle bcrypt.compare errors
                    } else if (result) {
                        resolve({ success: true });
                    } else {
                        resolve({ success: false });
                    }
                });
            } else {
                resolve({ success: false });
                console.log('Wrong credentials');
            }
        } catch (error) {
            reject(error); // Reject the Promise with the error
        }
    });
}

module.exports = {
    register,
    login
    
}