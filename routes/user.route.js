import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, generateHashedPassword, getUserByName } from '../services/user.service.js';
import { client } from '../index.js';

const router = express.Router();

router.post("/signup", async (request, response) => {
    const { name, username, password } = request.body;

    const userFromDB = await getUserByName(username);
    console.log(userFromDB);

    if (userFromDB) {
        response.status(400).send({ message: "Username already exists" });
    } else if (password.length < 8) {
        response.status(400).send({ message: "Password must contain atleast 8 characters" });
    } else {
        const hashedPassword = await generateHashedPassword(password);
        const newUser = await createUser({
            name: name,
            username: username,
            password: hashedPassword
        });
        response.send(newUser);
    }
});

router.post("/signin", async (request, response) => {
    const { username, password } = request.body;

    const userFromDB = await getUserByName(username);
    console.log(userFromDB);

    if (!userFromDB) {
        response.status(401).send({ message: "Invalid Credintials" });
    } else {
        const storedDBPassword = userFromDB.password;
        const isPasswordCheck = await bcrypt.compare(password, storedDBPassword);
        console.log(isPasswordCheck);

        if (isPasswordCheck) {
            const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);
            response.send({
                message: "Succesful Login",
                token: token
            });
        } else {
            response.status(401).send({ message: "Invalid Credintials" });
        }
    }

});

//sending data to inbox
router.post("/inbox", async (request, response) => {
    console.log("inbox route");
    console.log(response);
    const data = request.body;
    const result = await client.db('gmailClone')
        .collection('inbox')
        .insertOne(data);

    response.send(result);
});

//get mails for inbox
app.get("/inbox", async (request, response) => {
    const mails = await client.db('gmailClone')
        .collection('inbox')
        .find({})
        .toArray();

    response.send(mails);
});

export default router;
