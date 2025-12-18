## Frontend: API Documentation 

> [!NOTE]
> The backend server will run on **http://localhost:5000**
> 
> The frontend will run on **http://localhost:3000**

## Endpoints
#### Users

##### Profile

- **GET** `/api/user/profile/`
  - Return: a hardcoded user object with name, date of birth, etc.

- **PUT** `/api/user/profile`
  - Receive: data, logs it
  - Return: { success: true }
  -     
  ```javascript
  {
    name: string,
    dateOfBirth: string,
    profilePictureUrl: string
  }
  ```
##### Settings

- **GET** `/api/user/settings`
  - Return: a hardcoded settings object

- **PUT** `/api/user/settings`
  - Receive: settings
  - Return: { success: true }

  
  ```javascript
  {
    "notifications": {
      "email": boolean,
      "push": boolean
    },
    "connectors": [
      { 
        "id": "whatsapp" | "telegram" | "youtube" | "discord", 
        "name": "Whatsapp" | "Telegram" | "Youtube" | "Discord", 
        "connected": boolean 
      }
    ]
  }
  ```
