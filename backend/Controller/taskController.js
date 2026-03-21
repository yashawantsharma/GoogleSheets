// const Task = require("../Model/taskModel");


// exports.addtask = async (req, res) => {
//   try {
//     const { data } = req.body;

//     if (!data || !Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ message: "No data provided" });
//     }

//     // DD/MM/YYYY → valid Date object
//     const parseDate = (str) => {
//       if (!str) return null;
//       const [day, month, year] = str.trim().split("/");
//       return new Date(`${year}-${month}-${day}`); // ISO format banta hai
//     };

//     const tasks = data.map((row) => {
//       const rowLower = Object.fromEntries(
//         Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
//       );

//       return {
//         title: rowLower["title"] || rowLower["task"] || rowLower["name"],
//         description: rowLower["description"] || rowLower["desc"] || rowLower["details"],
//         dueDate: parseDate(rowLower["duedate"] || rowLower["due_date"] || rowLower["due date"] || rowLower["date"]),
//       };
//     });

//     const invalid = tasks.find((t) => !t.title || !t.description || !t.dueDate || isNaN(t.dueDate));
//     if (invalid) {
//       return res.status(400).json({ message: "Some rows have missing or invalid fields" });
//     }

//     const created = await Task.insertMany(tasks);

//     res.status(201).json({
//       message: `${created.length} tasks created successfully`,
//       tasks: created,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.findall = async (req, res) => {
//   try {
//     const tasks = await Task.find().sort({ createdAt: -1 });

//     res.status(200).json(tasks);

//   } catch (error) {
//     res.status(500).json({ message: "Server error" })
//   }
// };



// // exports.getTaskById = async (req, res) => {
// //   try {
// //     const task = await Task.findById(req.params.id);

// //     if (!task) {
// //       return res.status(404).json({ message: "Task not found" });
// //     }

// //     res.status(200).json(task);

// //   } catch (error) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };



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

const Task = require("../Model/taskModel"); // apna model path check karo

// ─── Find All with Pagination ──────────────────────────────
// GET /task/findall?page=1&limit=15
const findall = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 15);
    const skip  = (page - 1) * limit;

    // Total count (for frontend to calculate totalPages)
    const total = await Task.countDocuments();

    // Paginated data
    const tasks = await Task.find()
      .sort({ createdAt: -1 })   // newest first — zarurat na ho toh hata sakte ho
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: tasks,
      pagination: {
        total,          // total documents in DB
        page,           // current page
        limit,          // rows per page
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("findall error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Add Single Task ───────────────────────────────────────
// POST /task/
const addtask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const task = await Task.create({ title, description, dueDate });
    res.status(201).json({ message: "Task created", data: task });
  } catch (error) {
    console.error("addtask error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Bulk Save ─────────────────────────────────────────────
// POST /task/bulk
const bulkSave = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }
    const formatted = data.map((item) => ({
      title:       item.Title       || item.title       || "",
      description: item.Description || item.description || "",
      dueDate:     item["Due Date"] || item.dueDate     || "",
    }));
    const saved = await Task.insertMany(formatted);
    res.status(201).json({ message: `${saved.length} tasks saved`, data: saved });
  } catch (error) {
    console.error("bulkSave error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Update Task ───────────────────────────────────────────
// PUT /task/update/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const updated = await Task.findByIdAndUpdate(
      id,
      { title, description, dueDate },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task updated", data: updated });
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Delete Task ───────────────────────────────────────────
// DELETE /task/delete/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { findall, addtask, bulkSave, updateTask, deleteTask };