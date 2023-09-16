import { Schema, model } from "mongoose";
import BadgeModel from "./badge.js";
import UserModel from "./user.js";

const userBadgeSchema = new Schema({
  email: { type: Schema.Types.String, ref: UserModel, required: true },
  earnedBadges: [{ type: Schema.Types.Number, ref: BadgeModel, required: true }],
  ongoingBadges: [{ type: Schema.Types.Number, ref: BadgeModel, required: true }]
});

const UserBadgeModel = model("UserBadgeModel", userBadgeSchema);

export default UserBadgeModel;