import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";

export const admin_auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    const rootUser = await UserModel.findOne({
      _id: verifyToken.id,
      "tokens.token": token,
    });

    if (!rootUser) {
      throw new Error("User not found");
    }

    else if (!rootUser.isAdmin) {
      throw new Error("Unauthorized: User is not an admin");
    }

    else {
      res.user = rootUser;
      next();
    }
  } catch (err) {
    res.status(401).send("Unauthorized:No token provided");
    console.log(err);
  }
};
