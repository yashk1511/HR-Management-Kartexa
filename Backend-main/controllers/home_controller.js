import { resetPasswordMailer } from "../mailers/password_reset_mailer.js";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";

export function home_controller(req, res) {
  return res.render("home", {
    title: "Change Password",
  });
}

export const resetPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const existinguser = await UserModel.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }
    const secret = process.env.JWT_SECRET + existinguser.password;

    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      secret,
      {
        expiresIn: "1d",
      }
    );

    const link = `${process.env.SERVER_API}/reset/${existinguser._id}/${token}`;
    resetPasswordMailer(email, link);
  } catch (error) {
    res.status(500).json("Something went wrong...");
  }
  return res.send("email sent");
};

export const loggedIn = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const rootUser = await UserModel.findOne({
      _id: verifyToken.id,
      "tokens.token": token,
    });
    if(rootUser){
      return res.send(true);
    }
    else {
      return res.send(false);
    }
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
};
export const isAdmin = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.send(false);
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const rootUser = await UserModel.findOne({
      _id: verifyToken.id,
      "tokens.token": token,
    });
    if (!rootUser || !rootUser.isAdmin) {
      return res.send(false);
    }
    res.send(true);
  } catch (err) {
    res.status(401).send("Unauthorized: No token provided");
    console.log(err);
  }
};
