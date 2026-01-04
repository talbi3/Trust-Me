import 'dotenv/config';
import logger from '../utils/logger.js';
import { faker } from '@faker-js/faker';

import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/user.model.js';
import { CONNECTOR_IDS } from '../models/connector.schema.js';
import UserMetadata from '../models/userMetadata.model.js';


const SEEDED_GOOGLE_USERS = [
  {
    email: "katzori1999@gmail.com",
    name: "Ori Katz",
    profilePictureUrl: "https://robohash.org/ori1?set=set4",
    dateOfBirth: "1999-07-16",
  },
  {
    email: "orishlach20@gmail.com",
    name: "Or Ishlach",
    profilePictureUrl: "https://robohash.org/ori2?set=set4",
    dateOfBirth: "1999-01-01",
  },
  {
    email: "orEkronot@gmail.com",
    name: "Or 2",
    profilePictureUrl: "https://robohash.org/ori3?set=set4",
    dateOfBirth: "1999-01-01",
  },
].map((u, idx) => ({
  ...u,
  settings: {
    notifications: { email: false, push: false },
    connectors: CONNECTOR_IDS.map((id) => ({ id, connected: idx === 0 })), 
  },
}));

const INCIDENT_TYPES = ["bullying", "harassment", "scam", "inappropriate_content", "other"];

const createRandomIncidents = () => {
  const count = faker.number.int({ min: 0, max: 3 });
  return Array.from({ length: count }).map(() => ({
    type: faker.helpers.arrayElement(INCIDENT_TYPES),
    date: faker.date.past({ years: 2 }),
    notes: faker.lorem.sentence(),
  }));
};

const getRandomPronouns = () => faker.helpers.arrayElement(["she/her", "he/him", "they/them"]);



// --- Main Seed Execution ---
const seedDB = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await UserMetadata.deleteMany({});
    logger.info("Old Users & Metadata cleared");

    const allUsers = [...SEEDED_GOOGLE_USERS];

    const insertedUsers = await User.insertMany(allUsers);
    logger.info(`${insertedUsers.length} Google Users added successfully!`);

    const metadataDocs = insertedUsers.map((user) => ({
      userId: user._id,
      pronouns: getRandomPronouns(),
      previousIncidents: createRandomIncidents(),
      preferences: {},
    }));

    await UserMetadata.insertMany(metadataDocs);
    logger.info(`${metadataDocs.length} UserMetadata docs added successfully!`);


    logger.info("Seeding complete!");
    await disconnectDB();
  } catch (error) {
    logger.error("Seeding failed:", error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

seedDB();