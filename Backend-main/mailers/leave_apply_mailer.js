import { transporter } from "../config/nodemailer.js";
export const leaveapplymailer = async (
  name,
  email,
  leave,
  startDate,
  endDate,
  leaveID,
  leaveApplication,
  documentBase64
) => {
  const document = `${documentBase64}`;
  const approvalLink = `${process.env.SERVER_API}/approve?leaveId=${leaveApplication._id}&status=approved`;
  const rejectionLink = `${process.env.SERVER_API}/approve?leaveId=${leaveApplication._id}&status=rejected`;
  transporter.sendMail(
    {
      from: email,
      to: process.env.Usermail,
      subject: "leave request!!!",
      html: `<p>Dear Admin,</p>
      <p>I am writing to formally request a leave of absence from ${startDate} to ${endDate} due to ${leave}. Please find below the details of my leave application:</p>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Start Date: ${startDate}</p>
      <p>End Date: ${endDate}</p>
      <p>Reason for Leave: ${leave}</p>
      <p>I have attached the necessary documents to support my leave request. Kindly review them for your reference. If there are any additional documents required, please let me know, and I will promptly provide them.</p>
      <p>During my absence, I have made arrangements to ensure that my tasks are properly delegated to [Colleague's Name/Team] to minimize any disruption to ongoing projects. I will also be available via email should any urgent matters arise that require my attention.</p>
      <p>I understand the importance of maintaining productivity within the organization, and I assure you that I will do my best to complete any pending tasks before my departure. I believe that taking this leave will ultimately contribute to my overall well-being and enable me to return refreshed and more focused.</p>
      <p>Thank you for your understanding and consideration. I look forward to your response:</p>
      <ul>
        <li><a href="${approvalLink}">Approve</a></li>
        <li><a href="${rejectionLink}">Reject</a></li>
        
      </ul>
      <p>Yours sincerely,</p>
      <p>${name}</p>`,

      attachments: [
        {
          filename: "reason.pdf",
          path: document,
        },
      ],
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }

      console.log("Message sent", info);
    }
  );
};
