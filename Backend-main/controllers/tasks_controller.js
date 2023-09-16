import Task from "../models/Task.js";
import UserModel from "../models/user.js";
import path from "path";
import fs from "fs";
export const createTask = async (req, res) => {
  const email = res.user.email;
  const { title, description, date, deadline, assignedTo } = req.body;
  try {
    const user = await UserModel.findOne({ username: assignedTo });
    // const user = await UserModel.findOne({ email: email });

    const task = new Task({
      title: title,
      desc: description,
      date: date,
      deadline: deadline,
      dept: req.body.dept,
      teamMember: assignedTo,
      relatedDoc: req.body.relatedDoc,
      type: "Project Based Task",
      status: "Incomplete",
      user: user._id,
    });

    await task.save();

    user.Task.push(task._id);
    // user.taskcount += 1;

    await user.save();

    res.status(200).json({ message: "Task created successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const getAllTasks = async (req, res) => {
  const email = res.user.email;
  // console.log(email);
  try {
    const user = await UserModel.findOne({ email: email }).populate("Task");
    // console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.Task);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};
export const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to retrieve task" });
  }
};

export const setStatus = async (req, res) => {
  console.log("inside set status");
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    task.status = "Completed";
    await task.save();
    res.status(200).json({ message: "Task marked as complete" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to change the status" });
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task) {
      fs.unlinkSync(req.file.path); // Delete the uploaded file if the task is not found
      return res.status(404).json({ message: "Task not found" });
    }

    task.file = req.file.path;

    await task.save();

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Failed to upload file", error });
  }
};

export const saveFiles = async (req, res) => {
  console.log("in saving files");
  try {
    // if (!req.file) {
    //   return res.status(400).json({ message: "No file was uploaded" });
    // }
    // console.log(req.params);
    const { id } = req.params;
    const taskArray = req.body;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    for (var i = 0; i < taskArray.length; i++) {
      // console.log(taskArray[i]);
      task.file.push(taskArray[i].base64);
    }
    await task.save();
    // console.log(task);

    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Failed to upload file", error });
  }
};

export const getAdminTask = async (req, res) => {
  // const email = res.user.email;
  // console.log(email);
  try {
    const allTasks = await Task.find({});
    // console.log(user);
    if (!allTasks) {
      return res.status(200).json({ message: "No Tasks found" });
    } else {
      res.status(200).json(allTasks);
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};
