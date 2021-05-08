const User = require("../models/user");
const bcrypt = require("bcrypt");


const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

module.exports.signup = async (req, res) => {
    console.log("**********************************");
    console.log("There was a signup request");
    console.log(req.body);
    console.log("**********************************");
    //get user info
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password);

        console.log("Hashed password: ", hashedPassword);

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword
        });

        res.status(200).send();
    } catch (e) {
        console.log("**********************************");
        console.log("There was an error in the signup!");
        console.log("Error: ", e);
        console.log("**********************************");
    }
};

module.exports.login = async (req, res) => {
    console.log("**********************************");
    console.log("There was a login request");
    console.log(req.body);
    console.log("**********************************");

    const foundUser = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    const comparePw = await bcrypt.compare(req.body.password, foundUser.password);

    if (comparePw) {
        //matching passwords
        console.log("Matching passwords");
        const sendUser = {
            name: foundUser.username,
            email: foundUser.email,
            userId: foundUser.id
        }
        return res.status(200).send(JSON.stringify(sendUser));
    } else {
        //no matching passwords
        console.log("No matching passwords");
        return res.status(404).send();
    }

}