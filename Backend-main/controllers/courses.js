import CourseModel from "../models/Course.js";
import EbookModel from "../models/Ebooks.js";
import LearnCourseModel from "../models/LearnCourse.js";
import path from "path";
import UserModel from "../models/user.js";
import mongoose from "mongoose";
export const Allcourses = async (req, res) => {
  try {
    const courses = await CourseModel.find();

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Allebooks = async (req, res) => {
  console.log("skldgfjd");
  try {
    const ebooks = await EbookModel.find();
    res.status(200).json(ebooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const learning_center = async (req, res) => {
  const file = req.file.path;

  //creating model
  const learncourse = new LearnCourseModel({
    file,
  });

  await learncourse.save().then(() => {
    res.status(201).json({ name: "lnsdfk" });
  });
};
export const download = async (req, res) => {
  try {
    const item = await LearnCourseModel.find();
    if (!item) {
      throw new Error("No item found");
    }
    res.status(200).json(item[0].file);
  } catch (error) {
    console.log(error);
    // Handle the error and send an appropriate response
    res.status(500).send("Error occurred while downloading the file.");
  }
};

export const enrollcourse = async (req, res) => {
  const course_id = req.params.id;
  const user_id = res.user.id;
  console.log(course_id);
  if (!course_id || !user_id) {
    return res
      .status(400)
      .json({ error: "course_id and user_id are required!" });
  }
  try {
    const course = await CourseModel.findById(course_id);
    const user = await UserModel.findById(user_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const alreadyEnrolled = user.Courses.includes(course_id);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Already Enrolled!" });
    }
    user.Courses.push(course_id);
    user.coursecount += 1;
    await user.save();
    return res.status(200).json({ message: "Course enrolled!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const enrollebook = async (req, res) => {
  const ebook_id = req.params.id;

  const user_id = res.user.id;

  if (!ebook_id || !user_id) {
    return res
      .status(400)
      .json({ error: "ebook_id and user_id are required!" });
  }
  try {
    const ebook = await EbookModel.findById(ebook_id);
    const user = await UserModel.findById(user_id);
    if (!ebook) {
      return res.status(200).json({ error: "Ebook not found!" });
    }
    if (!user) {
      return res.status(200).json({ error: "User not found!" });
    }
    const alreadyEnrolled = user.Ebooks.includes(ebook_id);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Already Enrolled!" });
    }
    user.Ebooks.push(ebook_id);
    user.coursecount += 1;
    await user.save();
    return res.status(200).json({ message: "Ebook enrolled!" });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ error: "Internal server error" });
  }
};
