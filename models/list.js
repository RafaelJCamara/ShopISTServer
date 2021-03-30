const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//basic List model layout
const ListSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    uuid: {
        type: String,
        required: true,
        unique: true
    }
});


module.exports = mongoose.model("List", ListSchema);