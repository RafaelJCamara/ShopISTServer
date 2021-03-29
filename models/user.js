const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//basic User model layout
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lists: [
        {
            type: Schema.Types.ObjectId,
            ref: "List"
        }
    ]
});


module.exports = mongoose.model("User", UserSchema);