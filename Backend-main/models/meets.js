import { Schema, model } from "mongoose";

const meetSchema = new Schema(
  {
    topic: {
      type: String,
    },
    date: {
      type: String,
    },
    starttime: {
      type: String,
    },
    endtime: {
      type: String,
    },
    link: {
      type: String,
    },
    department: {
      type: String,
    },
    duration: {
      type: String,
    },
    desc: {
      type: String,
    },
    agenda: {
      type: String,
    },
    host:{
      type:String,
    },
    hostEmail:{
      type:String,
    },
    members:{
      type:Number,
    }
    // type: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

const MeetModel = model("Meets", meetSchema);

export default MeetModel;
