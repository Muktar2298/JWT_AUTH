const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userHandler = require("./routeHandler/userHandler");
const todoHandler = require("./routeHandler/todoHandler");

// express app initialization
const app = express();
app.use(express.json());
dotenv.config();

// database connection with mongoose
mongoose
  .connect("mongodb://localhost/todos")
  .then(() => console.log("Connection Succesful!"))
  .catch((err) => console.log(err));

// application routes
app.use("/user", userHandler);
app.use("/todo", todoHandler);

// default error handler
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};
app.use(errorHandler);

// application port
app.listen(3000, () => {
  console.log("App listening at port 3000");
});
  