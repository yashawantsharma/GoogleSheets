const mongoose = require("mongoose");
const express = require("express");
const route = express.Router();

const userController = require("../Controller/userController");
// const auth = require("../Middleware/auth");

route.post("/", userController.register);
route.post("/login",userController.login);

module.exports=route
