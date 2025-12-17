import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../data/user.js';
// import Duck from '../data/duckData.js'; // If you convert Duck data to a Mongoose model later

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
        console.log('🌱 Connected to MongoDB...');

        // 2. Clear existing data (Optional: Be careful in production!)
        await User.deleteMany({});
        console.log('🧹 Old Users cleared');

        // 3. Insert new Fake Data
        await User.insertMany(users);
        console.log('✅ Fake Users added');

        // 4. Exit
        console.log('🏁 Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();