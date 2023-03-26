const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "iamagoodboy"
const fetchuser = require("../middleware/fetchuser")


//?Route-1 Create a User Using POST "/api/auth/createuser" Doesn't Require Auth.
router.post("/createuser", [body('email', "Enter a valid Email.").isEmail(), body('password', "Enter A Valid PassWord").isLength({ min: 5 }), body('name', "Enter a valie Name").isLength({ min: 3 })], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success, error: "Check the Credentials You Entered." });
    }



    /*    const salt = await bcrypt.genSalt(10)
        let secPass = await bcrypt.hash(req.body.password, salt)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        }).then(user => {
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)
            console.log(authToken)
            res.json({ authToken })
            console.log("Saved to Db")
        }).catch(err => {
            console.log("Failed To Save to The DataBase." + (err.message))
            res.status(500).send("Internal Server Error Some Error Occured.")
        });*/
    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);


        // res.json(user)
        success = true;
        res.json({ success, authToken })

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send({ success, error: "Internal Server Error" });
    }

})

//* Route-2 Authentication a user using POST "api/auth/login" , No Login required.

router.post('/login', [body('email', "Enter a valid Email.").isEmail(), body('password', "PassWord Can't be blank.").exists()], async (req, res) => {
    //If there are erros then they have to be sent.
    const errors = validationResult(req)
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ success, authToken })
    } catch (err) {
        console.log("Failed To Save to The DataBase." + (err.message))
        res.status(500).json({ success, error: "Internal Server Error Some Error Occured." })
    }

})



//! Get Logged in Users Details using : POST "/api/auth/getuser" , Login Required.

router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (err) {
        console.log("Failed To Save to The DataBase." + (err.message))
        res.status(500).send("Internal Server Error Some Error Occured.")
    }
})

module.exports = router