const mongoose = require('mongoose')


const user = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: false,
    },
    password: {
        type: String,
        required: true
    },
    gender:{
        type:String,
        require:true
    },
  


});


module.exports = mongoose.model('user', user)
// module.exports = mongoose.models.user || mongoose.model("user",user)