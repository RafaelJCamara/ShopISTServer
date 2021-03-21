const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = "mongodb://localhost:27017/shopist";
const db = mongoose.connection;
const User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");


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

app.use(express.json());


//passport middleware init
app.use(passport.initialize());
app.use(passport.session());

//passport settings
passport.use(new LocalStrategy(User.authenticate()));

//how to store user information on session (also delete) with passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});



//ROUTES
app.post("/signup", async (req, res) => {
    console.log("**********************************");
    console.log("There was a signup request");
    console.log(req.body);
    console.log("**********************************");
    try {
        const {
            username,
            email,
            password
        } = req.body;

        const user = new User({
            email,
            username
        });
        //register user with passport
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                console.log("Error!");
                return res.status(404).send();
            }
            console.log("Success!");
            //send success message to android application
            return res.status(200).send();
        });
    } catch (e) {
        //error occured
        return res.status(404).send();
    }
});

app.post("/login", (req, res) => {
    console.log("**********************************");
    console.log("There was a login request");
    console.log(req.body);
    console.log("**********************************");

    passport.authenticate("local", (req, res) => {
        console.log("Success in the login...");
    })

    //search user details on database
    const userFound = {
        name: "Rafael_username_from_nodejs",
        email: "Rafael_email_from_nodejs"
    }

    //send object to android client
    res.status(200).send(JSON.stringify(userFound));
})


//error handling
app.use((err, req, res, next) => {
    const {
        statusCode = 500, message = "Something went wrong"
    } = err;

    const error = {
        statusCode,
        message
    }
    res.status(statusCode).send(JSON.stringify(error));
});


app.listen("3000", () => {
    console.log("Server started...");
});