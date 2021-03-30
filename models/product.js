const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//basic Product model layout
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        min: 0,
    },
    description: String,
    quantity: {
        type: Number,
        min: 1,
        default: 1
    }
});


module.exports = mongoose.model("Product", ProductSchema);