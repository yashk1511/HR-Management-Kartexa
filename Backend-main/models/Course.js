import { Schema, model } from "mongoose";

const courseSchema = new Schema({
  title: { type: String },
  description: { type: String },
  skills: [{ type: String }],
  banner: { type: String },
  courseType: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const CourseModel = model("Course", courseSchema);

export default CourseModel;
