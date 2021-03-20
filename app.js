const express = require("express");
const app = express();


app.use(express.json());


app.get("/", (req, res) => {
    res.send("Homepage route");
});

app.post("/login", (req, res) => {
    console.log("**********************************");
    console.log("There was a request");
    console.log("**********************************");
    console.log(req.body);

    const userFound = {
        name: "Rafael",
        email: "r@g.c"
    }

    //send object to android client
    res.status(200).send(JSON.stringify(userFound));
})

app.listen("3000", () => {
    console.log("Server started...");
});