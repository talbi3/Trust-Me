import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../data/user.js';       
import { CONNECTOR_IDS } from '../data/connector.js';

dotenv.config();


const getConnectorsState = (connectedAppIds = []) => {
  return CONNECTOR_IDS.map(id => ({
    id: id,
    connected: connectedAppIds.includes(id)
  }));
};

const users = [
    {
        // 1. Tony Stark: Super connected, wants all notifications
        email: "tony@stark.com",
        name: "Tony Stark",
        profilePictureUrl: "https://robohash.org/tony",
        dateOfBirth: "1970-05-29",
        settings: {
            notifications: {
                email: true,
                push: true
            },
            // Tony is connected to Discord (tech) and YouTube (media)
            connectors: getConnectorsState(['discord', 'youtube'])
        }
    },
    {
        // 2. Peter Parker: Young, uses Whatsapp, hates email notifications
        email: "peter@parker.com",
        name: "Peter Parker",
        profilePictureUrl: "https://robohash.org/peter",
        dateOfBirth: "2001-08-10",
        settings: {
            notifications: {
                email: false,
                push: true
            },
            // Peter is on Whatsapp
            connectors: getConnectorsState(['whatsapp'])
        }
    },
    {
        // 3. Natasha: Spy, keeps low profile, only secure apps
        email: "natasha@romanoff.com",
        name: "Natasha Romanoff",
        profilePictureUrl: "https://robohash.org/natasha",
        dateOfBirth: "1984-11-22",
        settings: {
            notifications: {
                email: false,
                push: false
            },
            // Natasha only uses Telegram (encrypted messaging)
            connectors: getConnectorsState(['telegram'])
        }
    },
    {
        // 4. ADMIN USER: Bruce Wayne, no notifications, all connectors
        email: "1@1.com",
        name: "Bruce Wayne",
        profilePictureUrl: "https://robohash.org/bruce",
        dateOfBirth: "1972-02-19",
        settings: {
            notifications: {
                email: false,
                push: false
            },
            // Bruce is connected to all platforms
            connectors: getConnectorsState(CONNECTOR_IDS)
        }
    },

];

const seedDB = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 2. Clear existing data
        await User.deleteMany({});
        console.log('Old Users & Settings cleared');

        // try {
        //     await User.collection.drop(); 
        //     console.log('Old Users collection (and strict indexes) dropped');
        // } catch (error) {
        //      if (error.code === 26) {
        //         console.log('Collection created fresh');
        //     } else {
        //         throw error;
        //     }
        // }

        // 3. Insert new Fake Users
        await User.insertMany(users);
        console.log('Fake Users added');

        // 5. Exit
        console.log('Seeding complete!');
        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        // eslint-disable-next-line n/no-process-exit
        process.exit(1);
    }
};

seedDB();