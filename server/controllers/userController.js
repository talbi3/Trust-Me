import User from '../data/user.js';

/**
 * GET /api/user/profile
 */
const getUserProfile = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email query param is required." });
        }

        const user = await User.findOne({ email }).lean();
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            dateOfBirth: user.dateOfBirth
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * PUT /api/user/profile
 */
/**
 * PUT /api/user/profile
 * Expects multipart/form-data
 */
/**
 * PUT /api/user/profile
 * Expects JSON with email, name, dateOfBirth, and optionally profilePictureUrl
 */
const updateUserProfile = async (req, res) => {
    try {
        // 1. התיקון: מוסיפים את profilePictureUrl לחילוץ מה-body
        const { email, name, dateOfBirth, profilePictureUrl } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required to identify the user." });
        }

        let updateData = { 
            name, 
            dateOfBirth 
        };
        
        if (profilePictureUrl) {
            updateData.profilePictureUrl = profilePictureUrl;
        }


        const updatedUser = await User.findOneAndUpdate(
            { email: email }, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user: updatedUser });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/user/settings
 */
const getUserSettings = async (req, res) => {
    try {
        // 1. Extract email from Query Parameters
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email query param is required." });
        }

        const user = await User.findOne({ email }).select('settings').lean();

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json(user.settings);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * PUT /api/user/settings
 */
const updateUserSettings = async (req, res) => {
        try {
        const { email, ...settingsData } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required in body to identify user." });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { settings: settingsData } }, 
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ success: true, settings: updatedUser.settings });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * DELETE /api/user
 */
const deleteUser = async (req, res) => {
    const { email } = req.body; 

    if (!email) {
        return res.status(400).json({ error: "Email is required to identify the user." });
    }

    try {
        const user = await User.findOneAndDelete({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User deleted successfully", 
            user 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export {
    getUserProfile,
    updateUserProfile,
    getUserSettings,
    updateUserSettings,
    deleteUser,
};




