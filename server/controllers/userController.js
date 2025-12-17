
// GET /api/user/profile => returns a hardcoded user object with name, date of birth, etc.
export const getUserProfile = (req, res) => {
  // Mocked user profile (server-side mock)
  res.json({
    name: "Maya",
    dateOfBirth: "2001-06-15",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
  });
};

// PUT /api/user/profile => receives data, logs it, and returns { success: true }
export const updateUserProfile = (req, res) => {
  const updatedProfile = req.body;

  console.log("Received profile update:", updatedProfile);

  // Mock success response
  res.json({ success: true });
};

// GET /api/user/settings => returns a hardcoded settings object
export const getUserSettings = (req, res) => {
  // Mocked user settings (server-side mock)
  res.json({
  "notifications": {
    "email": true,
    "push": false
  },
  "connectors": [
    { "id": "whatsapp", "name": "WhatsApp", "connected": true },
    { "id": "telegram", "name": "Telegram", "connected": false },
    { "id": "youtube", "name": "YouTube", "connected": true },
    { "id": "discord", "name": "Discord", "connected": false }
  ]
});
};


// PUT /api/user/settings => accepts updated settings
export const updateUserSettings = (req, res) => {
  const updatedSettings = req.body;

  console.log("Received settings update:", updatedSettings);

  // Mock success response
  res.json({ success: true });
};