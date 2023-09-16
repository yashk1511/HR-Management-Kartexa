import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, trim: true },
  email: { type: String, trim: true },
  password: { type: String, trim: true },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  tc: { type: Boolean },
  isAdmin: { type: Boolean },
  Courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  Ebooks: [{ type: Schema.Types.ObjectId, ref: "Ebook" }],
  meetcount: { type: Number, default: 0 },
  leavecount: { type: Number, default: 0 },
  taskcount: { type: Number, default: 0 },
  badgecount: { type: Number, default: 0 },
  successratio: { type: Number, default: 50 },
  coursecount: { type: Number, default: 0 },
  Task: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  Data: [{ type: Schema.Types.ObjectId, ref: "Data" }],
  lastLogin: {
    type: String,
  },
  profile_image: { type: String },
  Role: {type: String},
  jobTitle: {type: String},
  isBlocked: {type: Boolean},
  isSuspended: {type: Boolean},
  suspendedTill: {type: String},
});

const UserModel = model("User", userSchema);

export default UserModel;
