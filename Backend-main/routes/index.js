import express from "express";
import {
  resetPassword,
  loggedIn,
  isAdmin,
} from "../controllers/home_controller.js";
import {
  userRegistration,
  userLogin,
  newPassword,
  authorize,
  FormPage,
  getAllEmployee,
  userLogout,
  Userdetail,
} from "../controllers/user_controller.js";
import {
  createTask,
  getAdminTask,
  getAllTasks,
  getTask,
  saveFiles,
  setStatus,
} from "../controllers/tasks_controller.js";
import {
  getAllmeetings,
  getmeetdetails,
  postmeetdetail,
  cancelMeeting,
  meetform,
} from "../controllers/meet_controller.js";
import {
  newLeave,
  countAllLeaveForUser,
  approveleave,
} from "../controllers/leaves.js";
import {
  getbadges,
  userbadgeid,
  getUserdetails,
  addbadges,
} from "../controllers/badge_controller.js";
import { send_events } from "../controllers/event_controller.js";
import {
  Allcourses,
  Allebooks,
  download,
  learning_center,
  enrollcourse,
  enrollebook,
} from "../controllers/courses.js";

import { getalldata, submitdata, workhour_employee } from "../controllers/Data_controller.js";
const router = express.Router();
import { auth } from "../middleware/authenticate.js";
import { admin_auth } from "../middleware/admin_authenticate.js";
import { blockUser, deleteUser, editUser, findBlockedStatus, getEmployeeDetails, suspendUser, unblockUser } from "../controllers/userManagement_controller.js";

console.log("router loaded");

//login and registration
router.post("/signup", userRegistration);
router.get("/loggedIn", loggedIn);
router.post("/login", userLogin);
router.get("/logout", auth, userLogout);
router.post("/forgot-password", resetPassword); //sends mail
router.get("/reset-password/:id/:token", authorize); //provide this link in mail
router.post("/reset-password/:id/:token", newPassword); //changes password
router.post("/formpage", auth, FormPage);
router.get("/userdetails", auth, Userdetail);
router.post("/meet_form", auth, meetform);

router.post("/createTask", admin_auth, createTask);
router.get("/getAdminTask", admin_auth, getAdminTask);
router.get("/AllTasks", auth, getAllTasks);
router.get("/TaskDetails/:id", auth, getTask);
router.post("/setStatus/:id", auth, setStatus);
router.post("/saveFiles/:id", auth, saveFiles);

// router.post("/upload/:taskId", auth, handleFileUpload);

// router.post("/leaveapply", auth, leaveapply);

//checkin-checkout
router.get("/Alldatas", auth, getalldata);
router.post("/submitdata", auth, submitdata);
router.get("/AllemployeeNames", auth, getAllEmployee);
router.get("/workhour_employee", admin_auth, workhour_employee);

//meet

router.get("/getAllmeets", auth, getAllmeetings);
router.get("/getmeetdetails/:id", auth, getmeetdetails);
router.post("/postmeetdetail", auth, postmeetdetail);
router.post("/cancelMeeting/:id", auth, cancelMeeting);
router.post("/sendInvites/:id", auth, meetform);

//badges
router.post("/getbadges", auth, getbadges);
router.post("/getuserbadegid", auth, userbadgeid);
router.get("/getUserdetails", auth, getUserdetails);
router.post("/addbadges", admin_auth, addbadges);

//calendar
router.get("/getevents", auth, send_events);

//leaves
router.post("/leave/new", auth, newLeave);
router.get("/leave/record", auth, countAllLeaveForUser);
//router.post("/checkin", auth, checkIn);
//router.get("/absent", auth, updateAbsent);
router.get("/approve", approveleave);

//learning center
router.get("/Allcourses", auth, Allcourses);
router.get("/Allebooks", auth, Allebooks);
router.post("/learningcenter", learning_center);
router.post("/learningcenter/download", auth, download);
router.post("/enrollcourse/:id", auth, enrollcourse);
router.post("/enrollebook/:id", auth, enrollebook);

//adminauth
router.get("/adminauth", isAdmin);

//userManagement
router.get("/getEmployeeDetails", admin_auth, getEmployeeDetails);
router.post("/editUser/:id", admin_auth, editUser);
router.get("/findBlockedStatus/:id", admin_auth, findBlockedStatus);
router.post("/blockUser/:id", admin_auth, blockUser);
router.post("/unblockUser/:id", admin_auth, unblockUser);
router.post("/deleteUser/:id", admin_auth, deleteUser);
router.post("/suspendUser/:id", admin_auth, suspendUser);
export default router;
