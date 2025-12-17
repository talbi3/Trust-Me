import User from '../data/User.js';

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by Google ID
const getUserByGoogleId = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.googleId });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Create a new user
const createUser = async (req, res) => {
    const { googleId, email, fullname, profilePicture } = req.body;

    if (!googleId || !email || !fullname) {
        return res.status(400).json({ error: 'googleId, email, and fullname are required.' });
    }

    try {
        // Prevent duplicates
        const exists = await User.findOne({
            $or: [{ email }, { googleId }],
        }).lean();

        if (exists) {
            return res.status(400).json({ error: "A user with this Email or Google ID already exists." });
        }

        const newUser = await User.create({
            googleId,
            email,
            fullname,
            profilePicture
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    const { googleId } = req.params;

    try {
        const user = await User.findOneAndDelete({ googleId });

        if (!user) {
            return res.status(404).json({ mssg: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user
const updateUser = async (req, res) => {
    const { googleId } = req.params;

    try {
        const user = await User.findOneAndUpdate(
            { googleId },
            { ...req.body },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ mssg: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllUsers,
    getUserByGoogleId,
    createUser,
    deleteUser,
    updateUser
};