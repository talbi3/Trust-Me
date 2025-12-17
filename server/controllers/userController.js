
// GET /api/user/profile
export const getUserProfile = (req, res) => {
  // Mocked user profile (server-side mock)
  res.json({
    name: "Maya",
    dateOfBirth: "2001-06-15",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
  });
};

// PUT /api/user/profile
export const updateUserProfile = (req, res) => {
  const updatedProfile = req.body;

  console.log("Received profile update:", updatedProfile);

  // Mock success response
  res.json({ success: true });
};
