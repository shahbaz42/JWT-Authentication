const mongoose = require("mongoose");

const userSchema = {
    email: String,
    password: String
}

const DB = "mongodb://localhost:27017/JWT";

mongoose.connect(DB, function(err){
    if(err){
        console.log("Error connecting to DB");
    }else{
        console.log("Connected to DB");
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;