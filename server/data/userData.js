const users = [
    {
        id: 1,
    name: "Maya",
    dateOfBirth: "2001-06-15",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
      settings: {
        notifications: {
          email: true,
          push: false
        },
        connectors: [
          { id: "whatsapp", name: "WhatsApp", connected: true },
          { id: "telegram", name: "Telegram", connected: false },
          { id: "youtube", name: "YouTube", connected: true },
          { id: "discord", name: "Discord", connected: false }
        ]
      }
    },
    {
      id: 2,
      name: "John",
      dateOfBirth: "1990-01-01",
      profilePictureUrl:
        "https://images.unsplash.com/photo-1501231291980-1c5b5c5c5c5c?w=200&h=200&fit=crop",
      settings: {
        notifications: {
          email: false,
          push: false
        },
        connectors: [
          { id: "whatsapp", name: "WhatsApp", connected: true },
          { id: "telegram", name: "Telegram", connected: false },
          { id: "youtube", name: "YouTube", connected: false },
          { id: "discord", name: "Discord", connected: false }
        ]
      }
    },
    {
      id: 3,
      name: "Alice",
      dateOfBirth: "1995-05-05",
      profilePictureUrl:
        "https://images.unsplash.com/photo-1501231291980-1c5b5c5c5c5c?w=200&h=200&fit=crop",
      settings: {
        notifications: {
          email: true,
          push: true
        },
        connectors: [
          { id: "whatsapp", name: "WhatsApp", connected: true },
          { id: "telegram", name: "Telegram", connected: true },
          { id: "youtube", name: "YouTube", connected: true },
          { id: "discord", name: "Discord", connected: false }
        ]
      }
    },
    {
      id: 4,
      name: "Bob",
      dateOfBirth: "1988-08-08",
      profilePictureUrl:
        "https://images.unsplash.com/photo-1501231291980-1c5b5c5c5c5c?w=200&h=200&fit=crop",
      settings: {
        notifications: {
          email: true,
          push: false
        },
        connectors: [
          { id: "whatsapp", name: "WhatsApp", connected: false },
          { id: "telegram", name: "Telegram", connected: true },
          { id: "youtube", name: "YouTube", connected: false },
          { id: "discord", name: "Discord", connected: true }
        ]
      }
    }
  ];

export default users;
