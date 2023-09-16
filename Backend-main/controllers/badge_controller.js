import UserModel from "../models/user.js";
import BadgeModel from "../models/badge.js";
import UserBadgeModel from "../models/userbadge.js";

export function fun(req, res) {
  return res.render("home");
}

export const getbadges = async (req, res) => {
  try {
    const badgetype = req.body.badgetype;
    const user = await UserBadgeModel.findOne({ email: res.user.email });

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    let badgeIds = [];
    let badges = [];

    switch (badgetype) {
      case undefined: // All badges
        badges = await BadgeModel.find();
        break;
      case "popular":
        badges = await BadgeModel.find({ popular: true });
        break;
      case "ongoing":
        if (!user) {
          break;
        }
        badgeIds = user.ongoingBadges;
        badges = await BadgeModel.find({ id: { $in: badgeIds } });
        break;
      default:
        if (!user) {
          break;
        }
        badgeIds = user.earnedBadges;
        badges = await BadgeModel.find({ id: { $in: badgeIds } });
        break;
    }
    return res.status(200).json(badges);
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userbadgeid = async (req, res) => {
  try {
    const user = await UserBadgeModel.findOne({ email: res.user.email });

    if (user) {
      return res.status(200).json(user.earnedBadges);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserdetails = async (req, res) => {
  try {
    const users = await UserModel.find({}, "username email");
    if (users.length === 0) {
      res.status(404).json({ error: "No users found" });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

export const addbadges = async (req, res) => {
  const { employeeUsername, employeeEmail, badgeId, badgeDetails } = req.body;

  try {
    let user = await UserBadgeModel.findOne({ email: employeeEmail });

    if (!user) {
      // Create a new user if not found
      user = new UserBadgeModel({
        email: employeeEmail,
        earnedBadges: [],
        ongoingBadges: [],
      });
    }

    const badge = await BadgeModel.findOne({ id: badgeId });

    if (badge) {
      if (badgeDetails === "ongoing") {
        const isBadgePresentInOngoing = user.ongoingBadges.includes(badgeId);

        if (isBadgePresentInOngoing) {
          return res
            .status(400)
            .json({ message: "Badge already exists in user's ongoing badges" });
        }

        const isBadgePresentInEarned = user.earnedBadges.includes(badgeId);

        if (isBadgePresentInEarned) {
          return res
            .status(400)
            .json({ message: "Badge already exists in user's earned badges" });
        }

        // Add the badge ID to the user's ongoing badges array
        user.ongoingBadges.push(badgeId);
      } else if (badgeDetails === "earned") {
        const isBadgePresentInEarned = user.earnedBadges.includes(badgeId);

        if (isBadgePresentInEarned) {
          return res
            .status(400)
            .json({ message: "Badge already exists in user's earned badges" });
        }

        const badgeIndexInOngoing = user.ongoingBadges.indexOf(badgeId);

        if (badgeIndexInOngoing !== -1) {
          // Remove the badge ID from the user's ongoing badges array using splice
          user.ongoingBadges.splice(badgeIndexInOngoing, 1);
        }

        user.earnedBadges.push(badgeId);
      } else {
        return res.status(404).json({ message: "Badge could not be added" });
      }

      await user.save();
      // await userdetails.save();
      return res.status(200).json({ message: "Successfully added the badge" });
    } else {
      return res.status(404).json({ message: "Badge not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch details" });
  }
};
