const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model/user-model');
const db = require("./database/db");
const auth = require("./middleware/auth")

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send('Hello world');
})

app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
    
        // Validate input fields complete
        if (!(username && email && password)){
            return res.status(400).send("Please ensure all account details are included");
        }
    
        // Checks if username and email exists in the database
        const usernameExist = await User.findOne({username});
        const emailExist = await User.findOne({email: email.toLowerCase()})

        if (usernameExist) {
            console.log(usernameExist);
            return res.status(409).send("This username is taken. Please try again with a different username");
        }

        if (emailExist) {
            return res.status(409).send("This email has been used. Please try again with a different email");
        }

        // Hash to encrypt user password before entering database
        encryptedPassword = await bcrypt.hash(password, 10);

        // Store user in database, role is 'user' by default enforced in the schema
        const newUser = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        if (newUser) {
            return res.status(201).json(newUser);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send(`Problem creating account: ${err}`);
    }
});

app.put("/changeRole", async (req, res) => {
    try {
        const { username, role } = req.body;

        // Validate input fields complete
        if (!(username && (role=="admin" || role=="user")) ){
            return res.status(400).send("Please ensure all details are included and correct");
        }

        const userDetail = await User.findOneAndUpdate({username}, {role});

        if (userDetail) {
            console.log(`Changed ${username} role to ${role}`);
            return res.status(201).send(`Changed ${username} role to ${role}`);
        } else {
            return res.status(400).send("Can't find username");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send(`Problem changing role: ${err}`);
    }
});

app.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            return res.status(400).send("Missing email and/or password !");
          }

        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("User not found!");
        }

        if (await bcrypt.compare(password, user.password)) {
            // Create token using our private key
            const token = jwt.sign(
                { username: user.username, email, role: user.role},
                process.env.TOKEN_KEY, 
                { expiresIn: "2h",}
            )
            
            user.token = token;
            console.log("Login successful");
            console.log(user);
            return res.status(200).json(user);
        }

        return res.status(400).send("Invalid credentials");

    } catch (err) {
        console.log(err);
        return res.status(500).send(`Problem changing role: ${err}`);
    }
});

app.get("/page", auth, (req, res) => {
    console.log(`/page: ${req.user.username} - Access granted`);
    return res.status(200).send(`Authentication successful for ${req.user.username} to view this page!`);
})

app.get("/adminPage", auth, (req, res) => {
    if (req.user.role != "admin") {
        console.log(`/adminPage:${req.user.username} - Access denied`);
        res.status(403).send(`${req.user.username} not authorised to view this page! User lacks permission`);
    } else {
        console.log(`/adminPage:${req.user.username} - Access granted`);
        res.status(200).send(`${req.user.username} is authenticated & authorised to view this admin page`);
    }
})

module.exports = app;