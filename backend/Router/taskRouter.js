const mongoose = require("mongoose");
const express = require("express");
const route = express.Router();

const taskController = require("../Controller/taskController");
// const auth = require("../Middleware/auth");

route.post("/", taskController.addtask);
route.get("/findall",taskController.findall);
route.put("/update/:id", taskController.updateTask);
route.delete("/delete/:id", taskController.deleteTask);

module.exports=route