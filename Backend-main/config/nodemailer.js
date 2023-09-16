import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";
import ejs from "ejs";
import { join } from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.Usermail,
    pass: process.env.Password,
  },
});

const renderTemplate = (data, relativePath) => {
  let mailHTML;
  console.log("insisde render temolate");
  ejs.renderFile(
    join(__dirname, "../views/mailers", relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log("Error in rendering template", err);
        return;
      }

      mailHTML = template;
    }
  );

  return mailHTML;
};

export { transporter, renderTemplate };