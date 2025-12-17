import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../data/user.js';       
import Settings, { buildDefaultFeaturesObject } from '../data/settings.js'; 

dotenv.config();

const users = [
    {
        googleId: "1001",
        email: "tony@stark.com",
        fullname: "Tony Stark",
        profilePicture: "https://robohash.org/tony"
    },
    {
        googleId: "1002",
        email: "peter@parker.com",
        fullname: "Peter Parker",
        profilePicture: "https://robohash.org/peter"
    },
    {
        googleId: "1003",
        email: "natasha@romanoff.com",
        fullname: "Natasha Romanoff",
        profilePicture: "https://robohash.org/natasha"
    }
];

const seedDB = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 2. Clear existing data
        await User.deleteMany({});
        await Settings.deleteMany({}); // Clear settings too
        console.log('Old Users & Settings cleared');

        // 3. Insert new Fake Users
        await User.insertMany(users);
        console.log('Fake Users added');

        // 4. Insert default Settings for those users
        const settingsData = users.map(user => ({
            userGoogleId: user.googleId,
            features: buildDefaultFeaturesObject()
        }));

        await Settings.insertMany(settingsData);
        console.log('✅ Default Settings added');

        // 5. Exit
        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();