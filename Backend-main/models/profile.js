import { Schema, model } from "mongoose";
import UserModel from "./user.js";

const profileSchema = new Schema({
  email:{type: Schema.Types.String, ref:UserModel},
  salutation:{type: String},
  husband_father_salutation:{type:String},
  firstName: { type: String },
  lastName:{type:String},
  fatherFirstName:{type:String},
  fatherLastName:{type:String},
  permanentAddress: { type: String },
  phoneNumber: { type: String },
  emailId: { type: String },
  birthday: { type: String },
  referenceContactNumber: { type: String },
  university: {type:String},
  file: {
    type: String,
  },
  designation: { type: String },
  qualification: { type: String },
  Degree_Certificate: {
    type: String,
  },
  skills: { type: String },
  experience: { type: String },
  hobby: { type: String },
  Id_Proof:{ type: String,},
  time: { type: String },
  timeTotal: { type: String },
  Saturday: { type: String },
  Sunday: { type: String },
  Over_time: { type: String },
  workFromHome: { type: String },
  Offer_Letter: {
    type: String,
  },
  Non_disclosure_agreement: {
    type: String,
  },
  Employee_agreement: {
    type: String,
  },
  Appointment_Letter: {
    type: String,
  },
});

const profileModel = model("Profile", profileSchema);

export default profileModel;
