import { Schema, model } from "mongoose";

const ebookSchema = new Schema({
  title: { type: String },
  description: { type: String },
  skills: [{ type: String }],
  banner: { type: String },
  ebookType: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const EbookModel = model("Ebook", ebookSchema);

export default EbookModel;
