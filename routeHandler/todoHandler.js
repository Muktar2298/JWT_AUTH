const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
// todo schema
const todoSchema = require("../schemas/todoSchema");
// user schema
const userSchema = require("../schemas/userSchema");
// for authentication
const checkLogin = require("../middlewares/checkLogin");

// -- crateing Mongoose model based on Schema
const Todo = new mongoose.model("Todo", todoSchema);
// user model
const User = new mongoose.model("User", userSchema);



// GET all the Todos
router.get("/", checkLogin, (req, res) => {
  Todo.find()
    .populate("user", "name username -_id")
    .select({
      _id: 0,
      date: 0,
    })
    .limit(2)
    .exec((err, data) => {
      if (err) {
        res.status(500).json({ error: "Server Side Problem" });
      } else {
        res.status(200).json({
          result: data,
          message: "Success!",
        });
      }
    });
});

// GET a single todo by ID
router.get("/:id", checkLogin, async (req, res) => {
  try {
    const data = await Todo.findOne({ _id: req.params.id });
    res.status(200).json({ data: data, message: "Success" });
  } catch (err) {
    res.status(500).json({ error: "There was a server side Problem!" });
  }
});

// insert single todo
router.post("/", checkLogin, async (req, res) => {
  try {
    const newTodo = new Todo({
      ...req.body,
      user: req.userId, // for sending user id for connecting database relation
    });
    const todo = await newTodo.save();
    await User.updateOne(
      {
        _id: req.userId,
      },
      {
        $push: {
          todos: todo._id,
        },
      }
    );

    res.status(200).json({
      message: "Todo was inserted succesfully!!",
    });
  } catch (err) {
    res.status(500).json({
      error: "There was a server side Problem!",
    });
  }
});

// insert Multiple todos
router.post("/all", checkLogin, async (req, res) => {
  // way -02
  try {
    await Todo.insertMany(req.body);
    res.status(200).json({
      message: "Todo were inserted succesfully!!",
    });
  } catch (err) {
    res.status(500).json({
      error: "There was a server side Problem!",
    });
  }
});

// update single todo by ID
router.put("/:id", checkLogin, async (req, res) => {
  try {
    await Todo.updateOne(
      { _id: req.params.id },
      { $set: { status: "inactive" } }
    );
    res.status(200).json({ message: "Todo Was Update successfully!" });
  } catch (error) {
    res.status(500).json({ error: "There was a Server Side Error!" });
  }
});

// update & read the result
router.put("/:id", checkLogin, async (req, res) => {
  try {
    var result = await Todo.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { title: "MongoDB Database & Others" } },
      { new: true, useFindAndModify: false }
    );
    res.status(200).json({ message: "Updated Succesful!" });
  } catch (err) {
    res.status(500).json({ error: "There was a Server side Problem!" });
  }
  console.log(result);
});

// DELETE single todo
router.delete("/:id", checkLogin, async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Succesfully Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server Side Problem!" });
  }
});

// delete all todos
router.delete("/", checkLogin, async (req, res) => {
  try {
    await Todo.deleteMany({});
    res.status(200).json({ message: "Succesfully Deleted All Documents!" });
  } catch (err) {
    res.status(500).json({ error: "Server Side Problem!" });
  }
});

module.exports = router;
