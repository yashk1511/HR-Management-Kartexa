import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const rootUser = await UserModel.findOne({
      _id: verifyToken.id,
      "tokens.token": token,
    });
    if(rootUser){
      res.user = rootUser;
      next();
    }
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
};