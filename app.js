const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = "mongodb://localhost:27017/shopist";
const db = mongoose.connection;
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const listRouter = require("./routes/lists");

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

//user routes
app.use("/user", userRouter);

//product routes
app.use("/product", productRouter);

//user routes
app.use("/list", listRouter);


app.listen("3000", () => {
    console.log("Server started...");
});