import MeetModel from "../models/meets.js";
import UserModel from "../models/user.js";
import UserMeetModel from "../models/usermeet.js";
import { sentmeetlinkMailer } from "../mailers/meet_send_mailer.js";

export const getAllmeetings = async (req, res) => {
  try {
    const user = await UserMeetModel.findOne({ email: res.user.email })
      .populate("scheduled_meet")
      .populate("rescheduled_meet")
      .populate("cancelled_meet");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scheduledMeets = user.scheduled_meet.map((meet) => ({
      _id: meet._id,
      type: "Scheduled Meetings",
      ...meet.toObject(),
    }));

    const rescheduledMeets = user.rescheduled_meet.map((meet) => ({
      _id: meet._id,
      type: "Rescheduled Meetings",
      ...meet.toObject(),
    }));

    const cancelledMeets = user.cancelled_meet.map((meet) => ({
      _id: meet._id,
      type: "Cancelled Meetings",
      ...meet.toObject(),
    }));

    const meets = [...scheduledMeets, ...rescheduledMeets, ...cancelledMeets];
    // console.log(meets);
    return res.status(200).json({ meets });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getmeetdetails = async (req, res) => {
  try {
    const meetId = req.params.id;

    const meet = await MeetModel.findById(meetId);
    if (!meet) {
      return res.status(404).json({ message: "Meet not found" });
    }

    return res.status(200).json(meet);
  } catch (error) {
    console.error("Error retrieving meet:", error);
    return res.status(500).json({ message: "Failed to retrieve meet" });
  }
};

export const postmeetdetail = async (req, res) => {
  const email = res.user.email;
  try {
    const { meetingWith, agenda, meetingDate, startTime, endTime, meetLink, department } =
      req.body;

    if (meetingWith === email) {
      return res
        .status(400)
        .json({ message: "You cannot schedule a meeting with yourself" });
    }
    const hostUser = await UserModel.findOne({ email: email });
    console.log(startTime);
    const [startHour, startMinute] = startTime.split(":");
    const [endHour, endMinute] = endTime.split(":");

    const startTimestamp = new Date();
    startTimestamp.setHours(startHour);
    startTimestamp.setMinutes(startMinute);

    const endTimestamp = new Date();
    endTimestamp.setHours(endHour);
    endTimestamp.setMinutes(endMinute);

    if (endTimestamp < startTimestamp) {
      endTimestamp.setDate(endTimestamp.getDate() + 1); // Add 1 day to the end time
    }

    const durationInMillis = endTimestamp.getTime() - startTimestamp.getTime();
    const durationInMinutes = Math.floor(durationInMillis / (1000 * 60));

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const durationString = `${hours} hours ${minutes} minutes`;
    const meet = new MeetModel({
      topic: agenda,
      date: meetingDate,
      starttime: startTime,
      endtime: endTime,
      link: meetLink,
      agenda: agenda,
      duration: durationString,
      desc: agenda,
      host: hostUser.username,
      hostEmail: email,
      members: 2,
      department: department,
    });

    const savedMeet = await meet.save();

    const userMeet1 = await UserMeetModel.findOne({ email: meetingWith });
    const userMeet2 = await UserMeetModel.findOne({ email: email });

    if (!userMeet1) {
      const newUserMeet1 = new UserMeetModel({
        email: meetingWith,
        scheduled_meet: [savedMeet._id],
        rescheduled_meet: [],
        cancelled_meet: [],
      });
      await newUserMeet1.save();
    } else {
      userMeet1.scheduled_meet.push(savedMeet._id);
      await userMeet1.save();
    }
    sentmeetlinkMailer(
      meetLink,
      meetingWith,
      startTime,
      agenda,
      meetingDate,
      durationString
    );
    if (!userMeet2) {
      const newUserMeet2 = new UserMeetModel({
        email: email,
        scheduled_meet: [savedMeet._id],
        rescheduled_meet: [],
        cancelled_meet: [],
      });
      await newUserMeet2.save();
    } else {
      userMeet2.scheduled_meet.push(savedMeet._id);
      await userMeet2.save();
    }

    res.status(200).json({ message: "Meeting details saved successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Failed to save meeting details" });
  }
};

export const cancelMeeting = async (req, res) => {
  const id = req.params.id;
  const email = res.user.email;

  try {
    const meet = await MeetModel.findById({ _id: id });
    if (!meet) {
      return res.status(404).json({ message: "Meet not found" });
    }

    if (meet.hostEmail === email) {
      const allUser = await UserMeetModel.find({});

      // Remove the meet from all UserMeetModel's scheduled_meet array and push it to cancelled_meet array
      for (const user of allUser) {
        const meetIndex = user.scheduled_meet.findIndex(
          (scheduledMeet) => scheduledMeet.toString() === id
        );
        if (meetIndex !== -1) {
          const cancelledMeet = user.scheduled_meet.splice(meetIndex, 1)[0];
          user.cancelled_meet.push(cancelledMeet);
          await user.save();
        }
      }
      meet.members = 0;
      await meet.save();
      return res
        .status(200)
        .json({ message: "Meeting cancelled for all successfully" });
    } else {
      const user = await UserMeetModel.findOne({ email: email })
        .populate("scheduled_meet")
        .populate("rescheduled_meet")
        .populate("cancelled_meet");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const meetIndex = user.scheduled_meet.findIndex(
        (meet) => meet._id.toString() === id
      );
      if (meetIndex !== -1) {
        const cancelledMeet = user.scheduled_meet[meetIndex];
        user.cancelled_meet.push(cancelledMeet);
        user.scheduled_meet.splice(meetIndex, 1);
      } else {
        const rescheduledMeetIndex = user.rescheduled_meet.findIndex(
          (meet) => meet._id.toString() === id
        );
        if (rescheduledMeetIndex !== -1) {
          const cancelledMeet = user.rescheduled_meet[rescheduledMeetIndex];
          user.cancelled_meet.push(cancelledMeet);
          user.rescheduled_meet.splice(rescheduledMeetIndex, 1);
        } else {
          return res.status(404).json({ message: "Meet not found" });
        }
      }
      await user.save();
      meet.members -= 1;
      await meet.save();
      return res
        .status(200)
        .json({ message: "Meeting cancelled successfully" });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ error: "Failed to cancel meet" });
  }
};

export const meetform = async (req, res) => {
  const { link, emails, starttime, agenda, date, duration } = req.body;
  const { id } = req.params;
  const email = res.user.email;
  try {
    const existingMeet = await MeetModel.findOne({ _id: id });

    if (!existingMeet) {
      return res.status(404).json({ message: "Meet doesn't exist." });
    }

    for (let i = 0; i < emails.length; i++) {
      const recipientEmail = emails[i];
      if (recipientEmail === email) {
        continue;
      }

      const userMeet = await UserMeetModel.findOne({ email: recipientEmail });

      if (!userMeet) {
        const newUserMeet = new UserMeetModel({
          email: recipientEmail,
          scheduled_meet: [id],
          rescheduled_meet: [],
          cancelled_meet: [],
        });
        existingMeet.members += 1;
        await existingMeet.save();
        await newUserMeet.save();
        sentmeetlinkMailer(
          link,
          recipientEmail,
          starttime,
          agenda,
          date,
          duration
        );
      } else {
        // Check if the meet is already present in scheduled_meet array
        if (!userMeet.scheduled_meet.includes(id)) {
          userMeet.scheduled_meet.push(id);
          await userMeet.save();
          sentmeetlinkMailer(
            link,
            recipientEmail,
            starttime,
            agenda,
            date,
            duration
          );
          existingMeet.members += 1;
          await existingMeet.save();
        }
      }
    }

    res.status(200).json("Invites Sent");
  } catch (error) {
    res.status(500).json("Something went wrong...");
  }
};
