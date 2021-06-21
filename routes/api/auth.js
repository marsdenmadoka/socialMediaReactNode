const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

//@route GET api/auth
//@desc  Get User //Getting current user
//@access private 
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user); //returnig/get the user inside the db in json form excluding the password
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/auth for LOGIN
//@desc  Authenticate user login and get token
//@access public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email }); //see if the user is valid
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid username or password" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password); //see if the pasword is valid
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid username or password" }] });
      }

      //Return jsonwebtoken - get token after succesfull sign
      const payload = {
        user: {
          id: user.id,
          //isAdmin:user.isAdmin
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token }); //return the token in json form
        }
      );

      //   res.send("user registered successful");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server Error");
    }
  }
);
module.exports = router;
