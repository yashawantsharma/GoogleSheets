const Task = require("../Model/taskModel");


exports.addtask = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    // DD/MM/YYYY → valid Date object
    const parseDate = (str) => {
      if (!str) return null;
      const [day, month, year] = str.trim().split("/");
      return new Date(`${year}-${month}-${day}`); // ISO format banta hai
    };

    const tasks = data.map((row) => {
      const rowLower = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
      );

      return {
        title: rowLower["title"] || rowLower["task"] || rowLower["name"],
        description: rowLower["description"] || rowLower["desc"] || rowLower["details"],
        dueDate: parseDate(rowLower["duedate"] || rowLower["due_date"] || rowLower["due date"] || rowLower["date"]),
      };
    });

    const invalid = tasks.find((t) => !t.title || !t.description || !t.dueDate || isNaN(t.dueDate));
    if (invalid) {
      return res.status(400).json({ message: "Some rows have missing or invalid fields" });
    }

    const created = await Task.insertMany(tasks);

    res.status(201).json({
      message: `${created.length} tasks created successfully`,
      tasks: created,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.findall = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
};



// exports.getTaskById = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.status(200).json(task);

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };



// exports.updateTask = async (req, res) => {
//   try {
//     const updatedTask = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.status(200).json({
//       message: "Task updated successfully",
//       task: updatedTask
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };



// exports.deleteTask = async (req, res) => {
//   try {
//     const deletedTask = await Task.findByIdAndDelete(req.params.id);

//     if (!deletedTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     res.status(200).json({
//       message: "Task deleted successfully"
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };