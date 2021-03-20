const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//basic User model layout
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//adding passport (it generates a username [unique] and password)
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);