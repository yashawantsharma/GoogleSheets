const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  dueDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },


}, {
  timestamps: true
});

module.exports = mongoose.model("task", taskSchema);