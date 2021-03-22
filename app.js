const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = "mongodb://localhost:27017/shopist";
const db = mongoose.connection;
const User = require("./models/user");


//connect to database

//part 1
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

//part 2
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected...");
});
//end connect to database


//using json
app.use(express.json());

//ROUTES
app.post("/signup", async (req, res) => {
    console.log("**********************************");
    console.log("There was a signup request");
    console.log(req.body);
    console.log("**********************************");

    const newUser = new User(req.body);
    await newUser.save();

    res.status(200).send();

});

app.post("/login", async (req, res) => {
    console.log("**********************************");
    console.log("There was a login request");
    console.log(req.body);
    console.log("**********************************");

    const foundUser = await User.find({ email: req.body.email });
    console.log(foundUser[0].password);
    console.log(req.body.password);
    const sendUser = {
        name: foundUser[0].username,
        email: foundUser[0].email
    }

    if (req.body.password == foundUser[0].password) {
        //matching passwords
        console.log("Matching passwords");
        return res.status(200).send(JSON.stringify(sendUser));
    } else {
        //no matching passwords
        console.log("No matching passwords");
        return res.status(404).send();
    }

})

app.listen("3000", () => {
    console.log("Server started...");
});