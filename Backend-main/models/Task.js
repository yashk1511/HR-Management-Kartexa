import { Schema, model } from "mongoose";
const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
    },
    deadline: {
      type: Date,
      required: true,
    },
    desc: {
      type: String,
    },
    type: {
      type: String,
    },
    file: [{
      type: String,
    }],
    teamMember: {type: String},
    status: {type: String},
  },
  {
    timestamps: true,
  }
);

const Task = model("Task", taskSchema);

export default Task;
