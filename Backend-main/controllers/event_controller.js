import ProfileModel from "../models/profile.js";

export const send_events = async (req, res) => {
  const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
  const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY =
    "holiday@group.v.calendar.google.com";
  const API_KEY = process.env.GOOGLE_CALENDAR_API;
  const CALENDAR_REGION = "en.indian";
  const url = `${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}`;
  const events = [];

  try {
    const response = await fetch(url);
    const data = await response.json();
    const holidays = data.items;
    events.push(holidays);

    try {
      const profileData = await ProfileModel.find(
        {},
        { _id: 0, firstName: 1, lastName: 1, birthday: 1 }
      );
      const name = profileData.map(
        (profile) => profile.firstName + " " + profile.lastName
      );
      const birthday = profileData.map((profile) => profile.birthday);
      events.push({ name, birthday });

      res.status(200).send(events);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
