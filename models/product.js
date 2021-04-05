const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//basic Product model layout
//represents products at cart
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    quantityToBuy: {
        type: Number,
        required: true
    },
    productPerStore: [{
        store: {
            type: Schema.Types.ObjectId,
            ref: "Store"
        },
        priceInStore: {
            type: Number,
        }
    }]
});


module.exports = mongoose.model("Product", ProductSchema);