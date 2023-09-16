import profileModel from "../models/profile.js";
import UserModel from "../models/user.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import LeaveModel from "../models/leaves.js";

import UserMeetModel from "../models/usermeet.js";
import UserBadgeModel from "../models/userbadge.js";
import MonthlyLeavesModel from "../models/monthlyLeaves.js";
import e from "express";

export const userRegistration = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
      isBlocked: false,
      tokens: [], // Initialize an empty tokens array for the user
    });

    // const token = jwt.sign(
    //   { email: newUser.email, id: newUser._id },
    //   process.env.JWT_SECRET
    // );

    // newUser.tokens.push({ token }); // Add the token to the tokens array
    await newUser.save(); // Save the updated user document with the token

    res.status(200).json({ result: newUser });
  } catch (error) {
    res.status(500).json("Something went wrong...");
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if(existingUser.isBlocked === true){
      return res.status(400).json({message: "user Blocked by admin"});
    }
    if(existingUser.isSuspended === true){
      const currentDate = new Date();
      if(currentDate > existingUser.suspendedTill){
        existingUser.isSuspended = false;
        existingUser.suspendedTill ="";
      }
      else{
        return res.status(400).json({message: `user suspended till ${existingUser.suspendedTill}`});
      }
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET
    );
    existingUser.tokens.push({ token });
    await existingUser.save();

    // Set the necessary headers
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_API);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    const options = { hour12: false };
    const recentLogin = new Date();
    recentLogin.setHours(recentLogin.getHours() + 4);
    const formattedRecentLogin = recentLogin.toLocaleTimeString([], options);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });
    res.cookie("recentLogin", formattedRecentLogin, {
      httpOnly: false, // Set to true if you want the cookie to be accessible only by the server
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });

    // Send the response with the JSON data

    res.status(200).json({ token, isLoggedIn: true });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

export const userLogout = async (req, res) => {
  const email = res.user.email;
  const { remainloggingtime } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.remainloggingtime = remainloggingtime;
    const currentTime = new Date().toLocaleTimeString();
    user.lastLogin = currentTime;
    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("recentLogin", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Cookies removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEmployee = async (req, res) => {
  try {
    const employees = await UserModel.find({}, "username").exec();
    const usernames = employees.map((employee) => employee.username); // Use "username" instead of "name"

    res.status(200).json(usernames);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the data" });
  }
};

export const authorize = async (req, res) => {
  console.log("link auth");
  const { id, token } = req.params;
  try {
    const existinguser = await UserModel.findOne({ _id: id });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }
    const secret = process.env.JWT_SECRET + existinguser.password;
    try {
      const payload = jwt.verify(token, secret);

      return res.status(200).json({ message: "let him change password" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "User don't Exist." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong...here");
  }
};

export const newPassword = async (req, res) => {
  const { id, token } = req.params;
  const { Newpassword, ConfirmPassword } = req.body;
  if (ConfirmPassword != Newpassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  try {
    const existinguser = await UserModel.findOne({ _id: id });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }
    const secret = process.env.JWT_SECRET + existinguser.password;
    try {
      const payload = jwt.verify(token, secret);
      const hashedPassword = await bcrypt.hash(Newpassword, 12);
      await UserModel.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      console.log("changes saved");
      res.status(200).json({ result: existinguser, token });
    } catch {
      console.log(err);
    }
  } catch (error) {
    res.status(500).json("Something went wrong...");
  }
};

export const FormPage = async (req, res) => {
  const email = res.user.email;

  try {
    // console.log(req.body);
    const {
      formValues: {
        salutation,
        husband_father_salutation,
        firstName,
        lastName,
        fatherFirstName,
        fatherLastName,
        permanentAddress,
        phoneNumber,
        emailId,
        birthday,
        referenceContactNumber,
        designation,
        qualification,
        university,
        skills,
        experience,
        hobby,
        timeTotal,
        workFromHome,
        Offer_Letter,
        file,
        Degree_Certificate,
        Id_Proof,
        Non_disclosure_agreement,
        Employee_agreement,
        Appointment_Letter,
        Over_time,
      },
    } = req.body;
    // console.log(emailId);
    if(phoneNumber!=""){
      const sanitizedValue = phoneNumber.replace(/\D/g, "");
      if(sanitizedValue.length !=10){
        return res.status(400).json({message:"Enter correct Phone Number"});
      }
    }
    console.log(referenceContactNumber);
    if(referenceContactNumber!=""){
      const sanitizedValue = referenceContactNumber.replace(/\D/g, "");
      if(sanitizedValue.length !=10){
        return res.status(400).json({message:"Enter correct Reference Number"});
      }
    }
    if(emailId!=""){
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailId)) {
        return res.status(400).json({message:"Enter correct Email Address"});
      }
    }
    const existingUser = await profileModel.findOne({ email: email });
    const user = await UserModel.findOne({ email: email });
    user.profile_image = file;
    await user.save();
    if (existingUser) {
      // Update the existing user profile with new values
      existingUser.salutation = salutation;
      existingUser.husband_father_salutation = husband_father_salutation;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.fatherFirstName = fatherFirstName;
      existingUser.fatherLastName = fatherLastName;
      existingUser.permanentAddress = permanentAddress;
      existingUser.phoneNumber = phoneNumber;
      existingUser.emailId = emailId;
      existingUser.birthday = birthday;
      existingUser.referenceContactNumber = referenceContactNumber;
      existingUser.designation = designation;
      existingUser.qualification = qualification;
      existingUser.university = university;
      existingUser.skills = skills;
      existingUser.experience = experience;
      existingUser.hobby = hobby;
      existingUser.timeTotal = timeTotal;
      existingUser.workFromHome = workFromHome;
      existingUser.Offer_Letter = Offer_Letter;
      existingUser.file = file;
      existingUser.Degree_Certificate = Degree_Certificate;
      existingUser.Id_Proof = Id_Proof;
      existingUser.Non_disclosure_agreement = Non_disclosure_agreement;
      existingUser.Employee_agreement = Employee_agreement;
      existingUser.Appointment_Letter = Appointment_Letter;
      existingUser.Over_time = Over_time;

      await existingUser.save();

      return res.status(200).json({ message: "Profile updated successfully" });
    }

    // Create a new user profile if existingUser is not found
    const newUser = await profileModel.create({
      email,
      salutation,
      husband_father_salutation,
      firstName,
      lastName,
      fatherFirstName,
      fatherLastName,
      permanentAddress,
      phoneNumber,
      emailId,
      birthday,
      referenceContactNumber,
      designation,
      qualification,
      university,
      skills,
      experience,
      hobby,
      timeTotal,
      workFromHome,
      Offer_Letter,
      file,
      Degree_Certificate,
      Id_Proof,
      Non_disclosure_agreement,
      Employee_agreement,
      Appointment_Letter,
      Over_time,
    });

    await newUser.save();

    return res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveapply = async (req, res) => {
  try {
    const { email, leave, startDate, endDate } = req.body;
    const file = req.file;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const leaveData = await LeaveModel.create({
      leave: leave,
      startDate: startDate,
      endDate: endDate,
      file: file.path,
      user: user._id,
    });

    res.status(200).json(leaveData);
  } catch (error) {
    console.error("Error saving leave data:", error);
    res.status(500).json({ error: "Failed to save leave data." });
  }
};

export const Userdetail = async (req, res) => {
  try {
    const email = res.user.email;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const usermeet = await UserMeetModel.findOne({ email: email });
    const userbadge = await UserBadgeModel.findOne({ email: email });
    const userleave = await MonthlyLeavesModel.findOne({email:email, month: new Date().getMonth()});
    if(!userleave){
      user.leavecount=0;
    }
    else{
      user.leavecount=userleave.totalCount;
    }
    if (!usermeet) {
      user.meetcount = 0;
    } else {
      user.meetcount = usermeet.scheduled_meet.length;
    }
    if (!userbadge) {
      user.badgecount = 0;
    } else {
      user.badgecount = userbadge.earnedBadges.length;
    }
    user.taskcount = user.Task.length;
    user.coursecount = user.Courses.length + user.Ebooks.length;
    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
