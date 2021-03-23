const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//basic Image model layout
const ImageSchema = new Schema({
    url: String,
    filename: String
});

module.exports = mongoose.model("Image", ImageSchema);