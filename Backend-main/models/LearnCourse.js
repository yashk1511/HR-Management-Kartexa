import { Schema, model } from "mongoose";

const learncourseSchema = new Schema({
  file: { type: String },
});

const LearnCourseModel = model("LearnCourse", learncourseSchema);

export default LearnCourseModel;
