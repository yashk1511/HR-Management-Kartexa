import { Schema, model } from "mongoose";

const BadgeSchema = new Schema({
  id: { type: Number, trim: true },
  title: { type: String, trim: true },
  height: { type: Number, trim: true },
  width: { type: Number, trim: true },
  popular: {type: Boolean, trim: true},
  tc: { type: Boolean },
});

const BadgeModel = model("Badge", BadgeSchema);

export default BadgeModel;
