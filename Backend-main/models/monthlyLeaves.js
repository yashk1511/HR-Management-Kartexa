import { Schema, model } from "mongoose";

const MonthlyLeavesSchema = new Schema({
  email: {
    type: Schema.Types.String,
    ref: "User",
  },
  leaves: [
    {
      leaveName: String,
      count: Number,
    },
  ],
  month:{
    type: Number,
  },
  totalCount:{
    type: Number
  }
});

const MonthlyLeavesModel = model("MonthlyLeaves", MonthlyLeavesSchema);

export default MonthlyLeavesModel;
