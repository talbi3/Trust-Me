import User from '../data/user.js';

//! Should be Admin only
// GET /api/auth/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Create a new user
/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
    const { googleId, email, name, profilePicture } = req.body;

    if (!googleId || !email || !name) {
        return res.status(400).json({ error: 'googleId, email, and name are required.' });
    }

    try {
        const exists = await User.findOne({
            $or: [{ email }, { googleId }],
        }).lean();

        if (exists) {
            return res.status(400).json({ error: "A user with this Email or Google ID already exists." });
        }

        const newUser = await User.create({
            googleId,
            email,
            name, 
            profilePictureUrl: profilePicture 
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required for login." });
    }

    try {
        const user = await User.findOne({ email }).lean();

        if (!user) {
            return res.status(404).json({ error: "User not found. Please register first." });
        }

        res.status(200).json({ user });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllUsers,
    register,
    login,
    logout
};
