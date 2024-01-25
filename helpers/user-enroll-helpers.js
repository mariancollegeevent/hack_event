const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const participantSchema = new Schema({
  participantname: String,
  access: String,
  randomnum: Number,
  attempted: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  timer: {
    type: Schema.Types.Mixed,
    required: function() {
      return this.completed === true;
    }
  },
  attempts: {
    type: Schema.Types.Mixed,
    required: function() {
      return this.completed === true;
    }
  }

});



  const participant= mongoose.model('participant', participantSchema);

  function generateRandomNumber() {
    // Generate a random number between 100000 and 999999 (6 digits)
    return Math.floor(100000 + Math.random() * 900000);
}

  function register(participantData){

    return new Promise(async(resolve,reject)=>{
        const newparticipant = new participant();
        newparticipant.participantname=participantData.participant_name;
        newparticipant.access=participantData.accesskey;
        newparticipant.randomnum=generateRandomNumber();
        newparticipant.save();
        resolve(newparticipant);
    })

}

function getParticipantNames() {
    return new Promise(async (resolve, reject) => {
        try {
            const participants = await participant.find({}).lean();
            //const participantNames = participants.map(participant => participant.participantname);
            resolve(participants);
        } catch (error) {
            reject(error);
        }
    });
}

function deleteuser(id){

    return new Promise(async(resolve,reject)=>{
  
      const x=await participant.deleteOne({ _id: id });
       
  
        resolve(x);
    })
  
  }

  function displayuser(id){
    return new Promise(async(resolve,reject)=>{
      const query = participant.where({ _id: id });
  const x= await query.findOne();

      resolve(x);
    })
  }


  function login(userdata) {
    return new Promise(async (resolve, reject) => {
        try {
            const eml = userdata.username;
            const psd = userdata.access;

            const filter = { participantname: eml };
            const val = await participant.findOne(filter).exec();

            if (val) {
              if (val.access===psd) {
                resolve(val);
              }

            } else {
                //resolve({ success: false });
                console.log('Wrong credentials');
            }
        } catch (error) {
            reject(error); // Reject the Promise with the error
        }
    });
}

async function markParticipantAttempted(participantId) {
  try {
    const result = await participant.updateOne(
      { _id: participantId },
      { $set: { attempted: true } }
    );

    if (result.nModified > 0) {
      console.log('Participant marked as attempted successfully');
    } else {
      console.log('Participant not found or already marked as attempted');
    }
  } catch (error) {
    console.error('Error updating participant:', error);
  }
}

async function markParticipantcompleted(participantId, timerValue, attemptsValue) {
  try {
    const participantcmp = await participant.findById(participantId);
    if (!participantcmp) {
      throw new Error('Participant not found');
    }

    // Update the fields
    participantcmp.completed = true;
    participantcmp.timer = timerValue;
    participantcmp.attempts = attemptsValue;

    // Save the updated document
    await participantcmp.save();


  } catch (error) {
    console.error('Error updating participant:', error);
  }
}
module.exports = {
    register,
    getParticipantNames,
    deleteuser,
    displayuser,
    login,
    markParticipantAttempted,
    markParticipantcompleted    
}