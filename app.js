const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = "mongodb://localhost:27017/shopist";
const db = mongoose.connection;
const User = require("./models/user");
const bcrypt = require("bcrypt");

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

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}


//ROUTES
app.post("/signup", async (req, res) => {
    console.log("**********************************");
    console.log("There was a signup request");
    console.log(req.body);
    console.log("**********************************");
    //get user info
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(200).send();
    } catch (e) {
        console.log("Error: ", e);
    }

});



app.post("/login", async (req, res) => {
    console.log("**********************************");
    console.log("There was a login request");
    console.log(req.body);
    console.log("**********************************");

    const foundUser = await User.find({ email: req.body.email });

    const comparePw = await bcrypt.compare(req.body.password, foundUser[0].password);

    if (comparePw) {
        //matching passwords
        console.log("Matching passwords");
        const sendUser = {
            name: foundUser[0].username,
            email: foundUser[0].email
        }
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