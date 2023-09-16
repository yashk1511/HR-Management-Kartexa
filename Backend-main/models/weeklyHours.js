import { Schema, model } from "mongoose";

const WeeklyHoursSchema = new Schema({
  WorkMinutes: { type: Number },
  email: {
    type: Schema.Types.String,
    ref: "User",
  },
  username: {
    type:String,
  },
  week:{
    type: Number,
  }
});

const WeeklyHoursModel = model("WeeklyHours", WeeklyHoursSchema);

export default WeeklyHoursModel;
