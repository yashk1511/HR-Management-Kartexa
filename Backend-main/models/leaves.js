import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  leave: {
    type: String,
    enum: [
      "Sick Leave Pending",
      "Casual Leave Pending",
      "Paternity Leave Pending",
      "Social Cause Leave Pending",
      "Anniversary Leave Pending",
      "Birthday Leave Pending",
      "Unpaid Casual Leave Pending",
    ],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  document: {
    type: String,
  },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
