import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";

export const getEmployeeDetails = async (req, res) => {
    // console.log("inside user management")
  try {
    const users = await UserModel.find({});
    
    if(users){
        // console.log(users);
        return res.status(200).json(users);
    }
    else {
        return res.status(400).json({message: "Falied to fetch data"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const editUser = async (req, res) => {
    // console.log("inside edit management")
    const {id} = req.params;
    // console.log(req.body);
    const {email, username, isAdmin, Role} = req.body;
    // console.log(isAdmin);
  try {
    const user = await UserModel.findById(id);
    // console.log(user);
    if(user){
        user.email = email;
        user.isAdmin = isAdmin;
        user.Role = Role;
        user.username = username;
        user.tokens = [];
        await user.save();
        return res.status(200).json({message : "user modified"});
    }
    else {
        return res.status(400).json({message: "Falied to edit"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const findBlockedStatus = async (req, res) => {
    // console.log("inside edit management")
    const {id} = req.params;
  try {
    const user = await UserModel.findById(id);
    // console.log(user);
    if(user){
        if(user.isBlocked === true){
            return res.status(200).json({isAlreadyBlocked : true});
        }
        else {
            return res.status(200).json({isAlreadyBlocked : false});
        }
    }
    else {
        return res.status(400).json({message: "Falied to fetch"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const blockUser = async (req, res) => {
    // console.log("inside edit management")
    const {id} = req.params;
    // console.log(id);
  try {
    const user = await UserModel.findById(id);
    // console.log(user);
    if(user){
        user.isBlocked = true;
        user.tokens = [];
        await user.save();
        return res.status(200).json({message : "user blocked"});
    }
    else {
        return res.status(400).json({message: "Falied to block"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const unblockUser = async (req, res) => {
    // console.log("inside edit management")
    const {id} = req.params;
    // console.log(id);
  try {
    const user = await UserModel.findById(id);
    // console.log(user);
    if(user){
        user.isBlocked = false;
        user.tokens = [];
        await user.save();
        return res.status(200).json({message : "user unblocked"});
    }
    else {
        return res.status(400).json({message: "Falied to unblock"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const deleteUser = async (req, res) => {
    console.log("inside delete management")
    const {id} = req.params;
    // console.log(id);
  try {
    const user = await UserModel.findByIdAndDelete(id);
    return res.status(200).json({message : "user deleted"});
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};

export const suspendUser = async (req, res) => {
    // console.log("inside edit management")
    const {id} = req.params;
    let { suspensionDays } = req.body;
    suspensionDays = parseInt(suspensionDays);
    console.log(suspensionDays);
  try {
    const user = await UserModel.findById(id);
    if(suspensionDays === 0){
        user.isSuspended = false;
        user.suspendedTill = "";
        user.tokens = [];
        await user.save();
        return res.status(200).json(`User suspended for ${suspensionDays} `);
    }
    if(user){
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + suspensionDays);
        console.log(currentDate);
        user.isSuspended = true;
        user.suspendedTill = currentDate;
        user.tokens = [];
        await user.save();
        return res.status(200).json(`User suspended for ${suspensionDays} `);
    }
    else {
        return res.status(400).json(`User not suspended for ${suspensionDays} `);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).error(err);
  }
};
