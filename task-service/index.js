const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3002;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).send("OK");
});

// MongoDB connection
mongoose
.connect("mongodb://mongo:27017/tasks")
.then(() => {
console.log("Connected to MongoDB");
})
.catch((err) => {
console.error("Failed to connect to MongoDB", err);
});

// Schema
const TaskSchema = new mongoose.Schema({
title: String,
description: String,
userId: String,
createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", TaskSchema);

// GET all tasks
app.get("/api/tasks", async (req, res) => {
try {
const tasks = await Task.find({});
res.status(200).json(tasks);
} catch (err) {
res.status(500).json({ error: "Failed to fetch tasks" });
}
});

// CREATE task
app.post("/api/tasks", async (req, res) => {
try {
const { title, description, userId } = req.body;
const task = new Task({ title, description, userId });
await task.save();

```
res.status(201).json(task);
```

} catch (err) {
console.log("Error Saving:", err);
res.status(500).json({ error: "Failed to create task" });
}
});

// DELETE all tasks
app.delete("/api/tasks/all", async (req, res) => {
try {
await Task.deleteMany({});
res.status(200).json({ message: "All tasks deleted" });
} catch (err) {
res.status(500).json({ error: "Failed to delete tasks" });
}
});

// Start server
app.listen(port, "0.0.0.0", () => {
console.log(`Task service listening on port ${port}`);
});


module.exports = app;
