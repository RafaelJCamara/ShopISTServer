const PantryListModel = require("../models/pantrylist");
const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const { Op } = require("sequelize");

//when a user clicks tries to generate shopping lists from the selected pantry lists
module.exports.generateShoppingLists = async (req, res) => {
    console.log("******************");
    console.log("Someone is generating a shopping list.");
    console.log("******************");

    //Selected lists UUID (array)
    const { selectedPantryLists } = req.body;

    //iterate over every pantry list and create a shopping list by product type
    //general format [{productType, [products] }]
    const shoppingListVariety = [];

    const allPantryLists = await PantryListModel.findAll({
        where: {
            uuid: {
                [Op.in]: selectedPantryLists,
            }
        },
        attributes: ['id'],
        include: ProductModel
    });

    allPantryLists.forEach(list => {
        //for each pantry list check it's items and append to variety list
        list.Products.forEach(prod => {
            if (shoppingListVariety.some(element => element.type === prod.producttype)) {
                //type already exists
                //just append to the existing products list
                shoppingListVariety.forEach((el, index) => {
                    if (el.type == prod.producttype) {
                        shoppingListVariety[index].products.push({
                            name: prod.name,
                            description: prod.description,
                        });
                    }
                });

            } else {
                //type does not exists
                //create new object and append
                shoppingListVariety.push({
                    type: prod.producttype,
                    products: [{
                        name: prod.name,
                        description: prod.description
                    }]
                });
            }
        });
    });

    res.status(200).send(JSON.stringify(shoppingListVariety));
};

module.exports.checkout = async (req, res) => {
    console.log("******************");
    console.log("Someone just shopped. Will add products to pantry list");
    console.log(req.body);
    console.log("******************");
    res.status(200).send();

    //Id of the list that originated the cart
    //List of the products bought
    const { shoppingListId, boughtProducts } = req.body;

    //find and update the corresponding shopping list
    const shoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId
        }
    });

    console.log(shoppingList);

    //get the pantry lists (add items from it)
    //the approach is filling the lists                  
    const pantryLists = {};

    res.status(200).send();
};