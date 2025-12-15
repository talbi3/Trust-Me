import User from '../data/User.js'; // Updated to use import and .js extension

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { googleId, email, fullname, profilePicture } = req.body;

        if (!googleId || !email || !fullname) {
            return res.status(400).json({ error: 'googleId, email, and fullname are required.' });
        }

        const newUser = new User({
            googleId,
            email,
            fullname,
            profilePicture
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'A user with this Email or Google ID already exists.' });
        }
        res.status(400).json({ error: error.message });
    }
};

// Get user by Google ID
export const getUserByGoogleId = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.googleId });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};