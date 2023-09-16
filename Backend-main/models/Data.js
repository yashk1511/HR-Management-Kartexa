import { Schema, model } from "mongoose";

const dataSchema = new Schema({
  sn: { type: String },
  date: { type: String },
  status: { type: String, trim: true },
  starttime: { type: String, trim: true },
  endtime: { type: String, trim: true },
  overtime: { type: String },
  work: { type: String },
  email: {
    type: Schema.Types.String,
    ref: "User",
  },
  week:{
    type: Number,
  }
});

const DataModel = model("Data", dataSchema);

export default DataModel;
