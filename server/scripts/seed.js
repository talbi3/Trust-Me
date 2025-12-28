import 'dotenv/config';
import logger from '../utils/logger.js';
import { faker } from '@faker-js/faker';

import { connectDB, disconnectDB } from '../config/db.js'; 
import User from '../data/user.schema.js';       
import { CONNECTOR_IDS } from '../data/connector.schema.js';
import UserMetadata from '../data/userMetadata.schema.js';
import ChatLog from '../data/chatLog.schema.js';


// --- Helpers for User ---
const getRandomConnectorsState = () => {
  return CONNECTOR_IDS.map(id => ({
    id: id,
    connected: faker.datatype.boolean() 
  }));
};

const createRandomUser = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;

  return {
    email: faker.internet.email({ firstName, lastName }),
    name: name,
    profilePictureUrl: `https://robohash.org/${firstName}?set=set4`, 
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
    settings: {
        notifications: {
            email: faker.datatype.boolean(),
            push: faker.datatype.boolean(),
        },
        connectors: getRandomConnectorsState()
    }
  };
};

const adminUser = {
    email: "1@1.com",
    name: "Bruce Wayne",
    profilePictureUrl: "https://robohash.org/bruce",
    dateOfBirth: "1972-02-19",
    settings: {
        notifications: { email: false, push: false },
        connectors: CONNECTOR_IDS.map(id => ({ id, connected: true }))
    }
};

const INCIDENT_TYPES = [
  "bullying",
  "harassment",
  "scam",
  "inappropriate_content",
  "other",
];

const createRandomIncidents = () => {
  const count = faker.number.int({ min: 0, max: 3 });
  return Array.from({ length: count }).map(() => ({
    type: faker.helpers.arrayElement(INCIDENT_TYPES),
    date: faker.date.past({ years: 2 }),
    notes: faker.lorem.sentence(),
  }));
};

const getRandomPronouns = () =>
  faker.helpers.arrayElement(["she/her", "he/him", "they/them"]);


// --- Helper for ChatLogs (The new logic) ---
const createAdminChatLogs = (adminId) => {
    const base = new Date();
    
    const dayOffset = (n) => {
        const d = new Date(base);
        d.setDate(d.getDate() - n);
        return d;
    };

    return [
        {
          userId: adminId,
          message: "Hello from yesterday",
          type: "user",
          category: "general",
          timestamp: dayOffset(1),
        },
        {
          userId: adminId,
          message: "Assistant reply yesterday",
          type: "assistant",
          category: "general",
          timestamp: dayOffset(1),
        },
        {
          userId: adminId,
          message: "Today message 1",
          type: "user",
          category: "mars",
          timestamp: dayOffset(0), 
        },
        {
          userId: adminId,
          message: "Today message 2",
          type: "assistant",
          category: "mars",
          timestamp: dayOffset(0),
        },
    ];
};


// --- Main Seed Execution ---
const seedDB = async () => {
    try {
        // 1. Connect to MongoDB
        await connectDB();

        // 2. Clear existing data  
        await User.deleteMany({});
        await UserMetadata.deleteMany({});
        await ChatLog.deleteMany({}); 
        logger.info('Old Users, Metadata & ChatLogs cleared');

        // 3. Insert new Fake Users
        const randomUsers = Array.from({ length: 10 }).map(() => createRandomUser());
        const allUsers = [...randomUsers, adminUser]; 
        
        const insertedUsers = await User.insertMany(allUsers);
        logger.info(`${insertedUsers.length} Users added successfully!`);

        // 4. Find the real Admin ID from the database result
        const adminDbUser = insertedUsers.find(u => u.email === adminUser.email);

        // 5. Create Metadata (linked to users)
        const metadataDocs = insertedUsers.map((user) => ({
          userId: user._id,
          pronouns: user.email === adminUser.email ? "he/him" : getRandomPronouns(),
          previousIncidents: user.email === adminUser.email ? [] : createRandomIncidents(),
          preferences: {},  
        }));

        await UserMetadata.insertMany(metadataDocs);
        logger.info(`${metadataDocs.length} UserMetadata docs added successfully!`);

        // 6. Create ChatLogs (Only for Admin) 
        if (adminDbUser) {
            const chatLogs = createAdminChatLogs(adminDbUser._id);
            await ChatLog.insertMany(chatLogs);
            logger.info(`Chat logs added for admin: ${adminDbUser.name}`);
        } else {
            logger.warn('Admin user not found, skipping chat logs.');
        }

        // 7. Exit
        logger.info('Seeding complete!');
        await disconnectDB();

    } catch (error) {
        logger.error('Seeding failed:', error);
        // eslint-disable-next-line n/no-process-exit
        process.exit(1);
    }
};

seedDB();