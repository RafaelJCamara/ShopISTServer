const PantryListModel = require("../models/pantrylist");
const ProductModel = require("../models/product");
const PantryListProductModel = require("../models/pantrylistproduct");
const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);

//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for list creation");
    console.log(req.body);
    console.log("******************");
    const { name } = req.body;
    const listUuid = uid();

    const newList = await PantryListModel.create({
        name,
        uuid: listUuid
    });

    const info = {
        uuid: listUuid
    };

    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    //get list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId
        },
        include: ProductModel
    });

    const sendList = {
        products: [],
    };

    foundList.Products.forEach(product => {
        sendList.products.push({
            name: product.name,
            description: product.description,
            stock: product.dataValues.PantryListProduct.stock
        });
    });

    res.status(200).send(JSON.stringify(sendList));
};

//when someone deletes the pantry list
module.exports.deleteList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to delete a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    try {
        //get the corresponding pantry list
        const foundList = await PantryListModel.findOne({
            where: {
                uuid: listId
            }
        });

        await foundList.destroy();
    } catch (error) {

    }

};

//when a user consumes products from the pantry list
module.exports.consumeProducts = async (req, res) => {
    console.log("************");
    console.log("Someone consumed itens from the list.");
    console.log(req.body);
    console.log("************");

    const productsToConsume = req.body.products;
    const { listId } = req.params;

    productsToConsume.forEach(async (productConsumed) => {
        try {
            //search product in the database
            const foundProduct = await ProductModel.findOne({
                where: {
                    name: productConsumed.name
                }
            });

            const foundList = await PantryListModel.findOne({
                where: {
                    uuid: listId
                }
            });

            //make the update
            const currentProductState = await PantryListProductModel.findOne({
                where: {
                    PantryListId: foundList.id,
                    ProductId: foundProduct.id,
                }
            });

            await PantryListProductModel.update(
                {
                    stock: Number(currentProductState.stock) - Number(productConsumed.quantity),
                },
                {
                    where: {
                        PantryListId: foundList.id,
                        ProductId: foundProduct.id,
                    }
                }
            );
        } catch (error) {
            console.log("There was an error.");
            console.log("Error: ", error);
        }

    });

    res.status(200).send();
};
