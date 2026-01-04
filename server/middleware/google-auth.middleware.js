import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { CustomError } from "../utils/errors.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      throw new CustomError({ message: "Missing Authorization token.", statusCode: 401 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new CustomError({ message: "Google token missing email.", statusCode: 401 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      throw new CustomError({ message: "User not found. Please ask admin to add you.", statusCode: 401 });
    }

    req.user = user;    
    next();
  } catch (err) {
    next(err);
  }
};

export default googleAuth;
