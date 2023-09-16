import { Schema, model } from "mongoose";
import MeetModel from "./meets.js";
import UserModel from "./user.js";

const userMeetSchema = new Schema({
  email: { type: Schema.Types.String, ref: UserModel, required: true },
  scheduled_meet: [{ type: Schema.Types.ObjectId, ref: MeetModel, required: true }],
  rescheduled_meet: [{ type: Schema.Types.ObjectId, ref: MeetModel, required: true }],
  cancelled_meet: [{ type: Schema.Types.ObjectId, ref: MeetModel, required: true }]
});

const UserMeetModel = model("UserMeetModel", userMeetSchema);

export default UserMeetModel;
