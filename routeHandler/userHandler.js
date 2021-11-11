const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../schemas/userSchema");
// -- crateing Mongoose model based on Schema
const User = new mongoose.model("User", userSchema);

// SIGNUP or REGISTER
router.post("/signup", async (req, res) => {
  try {
    // Encrypt the password using bcrypt package
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      username: req.body.name,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).json({ message: "Signup Successful!" });
  } catch (err) {
    res.status(500).json({ error: "Signup Failed" });
  }
});

// LOGIN OR SIGNIN
router.post("/login", async (req, res) => {
  try {
    // Check is user Created a Account
    const user = await User.find({ username: req.body.username });
    // if user have(or Alredy Created a account)
    if (user && user.length > 0) {
      // check the user password
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user[0].password
      );
      // if password match(isValid)
      if (isPasswordValid) {
        // Create token(Generate Token)
        const token = jwt.sign(
          { username: user[0].username, userId: user[0]._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res
          .status(200)
          .json({ access_token: token, message: "Login Successfull!" });
      } else {
        res.status(401).json({ error: "Your Password is Invalid" });
      }
    } else {
      res.status(401).json({ error: "You have no Account" });
    }
  } catch (err) {
    res.status(401).json({ error: "Authentication  Failed" });
  }
});

router.get("/alltodos", async (req, res) => {
  try {
    const users = await User.find({}).populate(
      "todos",
      "-_id"
    );
    res.status(200).json({
      data: users,
      message: "Success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "There was an Server Side Error" });
  }
});

module.exports = router;
