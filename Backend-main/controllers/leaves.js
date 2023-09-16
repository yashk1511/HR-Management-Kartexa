import Leave from "../models/leaves.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import UserModel from "../models/user.js";
import { leaveapplymailer } from "../mailers/leave_apply_mailer.js";
import MonthlyLeavesModel from "../models/monthlyLeaves.js";
import { toASCII } from "punycode";


const difference = (start, end) =>{
  const diffInMs = end - start;
  const numDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return numDays;
}

const getLastDateofMonth = (date) =>{
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = newDate.getMonth();
  const nextMonth = (month + 1) % 12;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonthStartDate = new Date(nextYear, nextMonth, 1);
  const endDate = new Date(nextMonthStartDate.getTime() - 1);
  const endDateString = endDate.toISOString().split("T")[0] + "T00:00:00.000+00:00";
  const endDateWithTimezoneOffset = new Date(endDateString);
  return endDateWithTimezoneOffset;
}

const getStartDateOfNextMonthFromEndDate = (date) =>{
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayString = nextDay.toISOString().split("T")[0] + "T00:00:00.000+00:00";
  const nextDayWithTimezoneOffset = new Date(nextDayString);
  return nextDayWithTimezoneOffset;
}



export const newLeave = async (req, res) => {
  const { name, email, leave, startDate, endDate, document } = req.body;

  const leaves = await Leave.create({
    name,
    email,
    leave,
    startDate,
    endDate,
    document,
  });

  leaveapplymailer(name, email, leave, startDate, endDate, leaves._id, leaves, document);
  res.json({
    success: true,
    message: "Leave applied",
  });
};
export const countAllLeaveForUser = async (req, res) => {
  const email = res.user.email;
  // console.log("in leave record");
  try {
    const month = new Date().getMonth();
    // console.log(month);
    const leaveData = await MonthlyLeavesModel.findOne({month:month, email:email});
    // console.log(leaveData);
    if(!leaveData){
      let arr = [
        { leaveName: "Anniversary Leave Pending", count: 1 },
        { leaveName: "Birthday Leave Pending", count: 1 },
        { leaveName: "Casual Leave Pending", count: 2 },
        { leaveName: "Paternity Leave Pending", count: 15 },
        { leaveName: "Sick Leave Pending", count: 2 },
        { leaveName: "Social Cause Leave Pending", count: 2 },
        { leaveName: "Unpaid Casual Leave Pending", count: 4 },
      ];
      const curmonthdata = await MonthlyLeavesModel.create({
        leaves: arr,
        month: month,
        email: email,
        totalCount:0,
      });
      await curmonthdata.save();
      return res.status(200).json({leaves: curmonthdata.leaves,totalCount: curmonthdata.totalCount });
    }
    else{
      // console.log("ggs")
      return res.status(200).json({leaves: leaveData.leaves,totalCount: leaveData.totalCount});
    }
  } catch (error) {
    console.log("in erroe");
    throw new Error("Error counting leave: " + error);
  }
};
export const approveleave = async (req, res) => {
  // const email = res.user.email;
  try {
    const { leaveId, status } = req.query;
    const leave = await Leave.findById(leaveId);
    if(!leave){
      return res.status(400).send("Leave not found");
    }
    if(leave.isApproved === true){
      return res.status(200).send("Alredy Approved");
    }
    if (status === "approved") {
      const currentMonth = leave.startDate.getMonth();
      const nextMonth = leave.endDate.getMonth();
      const reason = leave.leave;
      if(currentMonth != nextMonth){
        const lastDate = getLastDateofMonth(leave.startDate);
        const nextDate = getStartDateOfNextMonthFromEndDate(lastDate);
        const leave1 = await Leave.create({
          name: leave.name,
          email: leave.email,
          leave: leave.leave,
          startDate: leave.startDate,
          endDate: lastDate,
          document: leave.document,
          isApproved: true,
        });
        const leave2 = await Leave.create({
          name: leave.name,
          email: leave.email,
          leave: leave.leave,
          startDate: nextDate,
          endDate: leave.endDate,
          document: leave.document,
          isApproved: true,
        });
        await leave1.save();
        await leave2.save();
        const curmonthwiseleave = await MonthlyLeavesModel.findOne({month: currentMonth, email:leave.email});
        // console.log(curmonthwiseleave);
        if(!curmonthwiseleave){
          let arr = [
            { leaveName: "Anniversary Leave Pending", count: 1 },
            { leaveName: "Birthday Leave Pending", count: 1 },
            { leaveName: "Casual Leave Pending", count: 2 },
            { leaveName: "Paternity Leave Pending", count: 15 },
            { leaveName: "Sick Leave Pending", count: 2 },
            { leaveName: "Social Cause Leave Pending", count: 2 },
            { leaveName: "Unpaid Casual Leave Pending", count: 4 },
          ];
          let totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(leave.startDate, lastDate)-1) >=0 ? (arr[i].count - difference(leave.startDate, lastDate)-1) : 0; 
              totalCount=difference(leave.startDate, lastDate)+1;
              break;
            }
          }
          const curmonthdata = await MonthlyLeavesModel.create({
            leaves: arr,
            month: currentMonth,
            email: leave.email,
            totalCount: totalCount,
          });
          // console.log(curmonthdata);
          await curmonthdata.save();
        }
        else {
          const arr = curmonthwiseleave.leaves;
          let totalCount = curmonthwiseleave.totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(leave.startDate, lastDate)-1) >=0 ? (arr[i].count - difference(leave.startDate, lastDate)-1) : 0; 
              totalCount+=difference(leave.startDate, lastDate)+1;
              break;
            }
          }
          curmonthwiseleave.leaves = arr;
          curmonthwiseleave.totalCount=totalCount;
          await curmonthwiseleave.save();
        }
        const nextmonthwiseleave = await MonthlyLeavesModel.findOne({month: nextMonth, email: leave.email});
        if(!nextmonthwiseleave){
          let arr = [
            { leaveName: "Anniversary Leave Pending", count: 1 },
            { leaveName: "Birthday Leave Pending", count: 1 },
            { leaveName: "Casual Leave Pending", count: 2 },
            { leaveName: "Paternity Leave Pending", count: 15 },
            { leaveName: "Sick Leave Pending", count: 2 },
            { leaveName: "Social Cause Leave Pending", count: 2 },
            { leaveName: "Unpaid Casual Leave Pending", count: 4 },
          ];
          let totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(nextDate, leave.endDate)-1) >=0 ? (arr[i].count - difference(nextDate, leave.endDate)-1) : 0; 
              totalCount=difference(nextDate, leave.endDate)+1;
              break;
            }
          }
          const nextmonthdata = await MonthlyLeavesModel.create({
            leaves: arr,
            month: nextMonth,
            email: leave.email,
            totalCount: totalCount,
          });
          await nextmonthdata.save();
        }
        else {
          const arr = nextmonthwiseleave.leaves;
          let totalCount = nextmonthwiseleave.totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(nextDate, leave.endDate)-1) >=0 ? (arr[i].count - difference(nextDate, leave.endDate)-1) : 0; 
              totalCount+= difference(nextDate, leave.endDate)+1;
              break;
            }
          }
          nextmonthwiseleave.leaves = arr;
          nextmonthwiseleave.totalCount = totalCount;
          await nextmonthwiseleave.save();
        }
        await Leave.findByIdAndDelete(leaveId);
      }
      else{
        const curmonthwiseleave = await MonthlyLeavesModel.findOne({month: currentMonth, email: leave.email});
        // console.log(curmonthwiseleave);
        if(!curmonthwiseleave){
          let arr = [
            { leaveName: "Anniversary Leave Pending", count: 1 },
            { leaveName: "Birthday Leave Pending", count: 1 },
            { leaveName: "Casual Leave Pending", count: 2 },
            { leaveName: "Paternity Leave Pending", count: 15 },
            { leaveName: "Sick Leave Pending", count: 2 },
            { leaveName: "Social Cause Leave Pending", count: 2 },
            { leaveName: "Unpaid Casual Leave Pending", count: 4 },
          ];
          let totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(leave.startDate, leave.endDate)-1) >=0 ? (arr[i].count - difference(leave.startDate, leave.endDate)-1) : 0; 
              totalCount=difference(leave.startDate, leave.endDate)+1;
              break;
            }
          }
          const curmonthdata = await MonthlyLeavesModel.create({
            leaves: arr,
            month: currentMonth,
            email: leave.email,
            totalCount: totalCount,
          });
          // console.log(curmonthdata);
          await curmonthdata.save();
        }
        else {
          const arr = curmonthwiseleave.leaves;
          let totalCount = curmonthwiseleave.totalCount;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].leaveName === reason) {
              arr[i].count = (arr[i].count - difference(leave.startDate, leave.endDate)-1) >=0 ? (arr[i].count - difference(leave.startDate, leave.endDate)-1) : 0; 
              totalCount += difference(leave.startDate, leave.endDate)+1;
              break;
            }
          }
          curmonthwiseleave.leaves = arr;
          curmonthwiseleave.totalCount = totalCount;
          await curmonthwiseleave.save();
        }
        leave.isApproved = true;
        await leave.save();
      }
      res.status(200).send("Leave approved successfully!");
    } else {
      await Leave.findByIdAndDelete(leaveId);
      res.status(200).send("Leave Rejected");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to approve leave." });
  }
};
