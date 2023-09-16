import DataModel from "../models/Data.js";
import UserModel from "../models/user.js";
import WeeklyHoursModel from "../models/weeklyHours.js";

const getWeekNumber = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

const calculateTimeDifference = (startTime, endTime) => {
  const start = new Date(`01/01/2022 ${startTime}`);
  const end = new Date(`01/01/2022 ${endTime}`);
  if(endTime<startTime) return 0;
  const differenceInMs = end - start;
  const differenceInMinutes = Math.round(differenceInMs / (1000 * 60)); // Convert milliseconds to minutes
  return differenceInMinutes;
};

export const getalldata = async (req, res) => {
  const email = res.user.email;
  try {
    const user = await UserModel.findOne({ email: email }).populate("Data");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const data = user.Data;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to retrieve data" });
  }
};
export const submitdata = async (req, res) => {
  const email = res.user.email;
  try {
    const user = await UserModel.findOne({ email: email });
    const currentTime = new Date();
    const currentTimeString = currentTime.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' });
    const existingData = await DataModel.findOne({date:req.body.date, email:email});
    // console.log(existingData);
    const date = new Date(req.body.date);
    const week = getWeekNumber(date);
    if(!existingData){
      const data = new DataModel({
        date: req.body.date,
        status: "P",
        starttime: currentTimeString, // Time or date adjust yourself as per requirement
        endtime: "6:30 pm",
        overtime: "6 min",
        work: req.body.desc,
        email: email,
        week: week,
      });
      await data.save();
      user.Data.push(data._id);
      await user.save();
      const differenceInMinutes = calculateTimeDifference(data.starttime, "6:30 pm");
      // console.log(differenceInMinutes);
      const weeklyhours = await WeeklyHoursModel.findOne({week: week, email:email});
      const username = await UserModel.findOne({email:email});
      console.log(username.username);
      if(weeklyhours){
        weeklyhours.WorkMinutes+= differenceInMinutes;
        await weeklyhours.save();
      }
      else{
        const weeklydata = await WeeklyHoursModel.create({
          email: email,
          WorkMinutes: differenceInMinutes,
          week: week,
          username: username.username,
        })
        await weeklydata.save();
      }
      res.status(200).json({ message: "Data created successfully" });
    }
    else {
      return res.status(400).json({message: "Already checked In"});
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to create Data" });
  }
};

export const workhour_employee = async (req, res) => {
  const email = res.user.email;
  // console.log("inside workhour employee");
  try {
    const currentDate = new Date();
    const week = getWeekNumber(currentDate);
    const data = await WeeklyHoursModel.find({week:week-1});
    
    if(data){
      const transformedData = data.map(item => ({
        ...item.toObject(),
        workhours: item.WorkMinutes / (60*5), // Convert minutes to hours
      }));
      transformedData.sort((a, b) => b.workhours - a.workhours);
      // console.log(transformedData);
      return res.status(200).send(transformedData);
    }
    else {
      res.status(400).send([]);
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to create Data" });
  }
};
