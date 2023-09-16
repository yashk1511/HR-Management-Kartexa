import { transporter } from "../config/nodemailer.js";

export const sentmeetlinkMailer = async (
  link,
  email,
  starttime,
  agenda,
  date,
  duration
) => {
  transporter.sendMail(
    {
      from: process.env.Usermail,
      to: email,
      subject: "Have a Meet!!!",
      text: `Your meeting link is ${link}, and the agenda for the meeting is ${agenda}. The meeting is scheduled for ${date} from ${starttime} for ${duration}`,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
    }
  );
};
