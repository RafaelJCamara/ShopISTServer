const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//basic Product model layout
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    description: String
});


module.exports = mongoose.model("Product", ProductSchema);