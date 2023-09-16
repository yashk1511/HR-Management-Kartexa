import { transporter } from "../config/nodemailer.js";
export const resetPasswordMailer = async (email, link) => {
  transporter.sendMail(
    {
      from: process.env.Usermail,
      to: email,
      subject: "Reset Password",
      text: link,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
      console.log("Message sent", info);
      return res.status(200).json({ status: 200, validUser });
    }
  );
};
