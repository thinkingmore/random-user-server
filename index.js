const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;


// Middleware to parse JSON body data
app.use(express.json());


// Validate user ID function
function validateUserId(userId) {
    return Number.isInteger(userId) && userId > 0;
  }

// validate the post user data body
function validateUser(user) {
    return (
      user &&
      user.Id &&
      user.gender &&
      user.name &&
      user.contact &&
      user.address &&
      user.photoUrl
    );
  }

  
// Validate update request body
function validateUpdateRequestBody(users) {
    return users.every(user => (
      user &&
      user.Id &&
      user.gender &&
      user.name &&
      user.contact &&
      user.address &&
      user.photoUrl
    ));
  }
       
    
// Route to get data from JSON file
app.get('/', (req, res) => {
   res.send("Welcome to random user API")
  });


// Route to get a random user from JSON file
app.get('/user/random', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read data from JSON file.' });
      }
      try {
        const jsonData = JSON.parse(data);
        const randomUserIndex = Math.floor(Math.random() * jsonData.users.length);
        const randomUser = jsonData.users[randomUserIndex];
        return res.json(randomUser);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    });
  });  

app.get('/user/all', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data from JSON file.' });
    }
    try {
        const jsonData = JSON.parse(data);

        // Check if the 'limit' query parameter is provided and convert it to a number
        let limit = parseInt(req.query.limit);

        // If the 'limit' query parameter is not provided or invalid, set it to 10 (default limit)
        if (isNaN(limit) || limit <= 0) {
            limit = 10;
        }

        // Return the limited number of users based on the 'limit' query parameter
        const limitedUsers = jsonData.users.slice(0, limit);

      return res.json(limitedUsers);

    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse JSON data.' });
    }
  });
});

// Route to save a user to JSON file
app.post('/user/save', (req, res) => {
    const newUser = req.body;
    if (!validateUser(newUser)) {
      return res.status(400).json({ error: 'Invalid user data. Please provide all required properties (Id, gender, name, contact, address, photoUrl).' });
    }
  
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read data from JSON file.' });
      }
      try {
        const jsonData = JSON.parse(data);
        jsonData.users.push(newUser);
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save user data.' });
          }
          return res.json({ message: 'User data saved successfully.' });
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    });
  });

  
// Route to update a user by ID
app.put('/user/:id', (req, res) => {
const userId = parseInt(req.params.id);

if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID. Please provide a valid integer ID greater than 0.' });
}

// Read the existing data from the JSON file
fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
    return res.status(500).json({ error: 'Failed to read data from JSON file.' });
    }

    try {
    const jsonData = JSON.parse(data);

    // Find the index of the user with the provided ID
    const userIndex = jsonData.users.findIndex((user) => user.Id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user data in the array
    jsonData.users[userIndex] = { ...jsonData.users[userIndex], ...req.body };

    // Write the updated data back to the JSON file
    fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
        return res.status(500).json({ error: 'Failed to update user data.' });
        }
        return res.json({ message: 'User data updated successfully.' });
    });
    } catch (err) {
    return res.status(500).json({ error: 'Failed to parse JSON data.' });
    }
});
});


// Route to bulk update users

app.put('/user/update/multiple', (req, res) => {
    const usersToUpdate = req.body;
  
    if (!Array.isArray(usersToUpdate) || usersToUpdate.length === 0) {
      return res.status(400).json({ error: 'Invalid request body. Please provide an array of user objects for bulk update.' });
    }
    
    if (!validateUpdateRequestBody(usersToUpdate) || usersToUpdate.length === 0) {
        return res.status(400).json({ error: 'Invalid request body. Please provide an array of user objects for bulk update.' });
      }
    // Read the existing data from the JSON file
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read data from JSON file.' });
      }
  
      try {
        const jsonData = JSON.parse(data);
  
        for (const user of usersToUpdate) {
          const userId = user.Id;
          const userIndex = jsonData.users.findIndex(u => u.Id === userId);
  
          if (userIndex === -1) {
            return res.status(404).json({ error: `User with ID ${userId} not found.` });
          }
  
          // Update the user data in the array
          jsonData.users[userIndex] = { ...jsonData.users[userIndex], ...user };
        }
  
        // Write the updated data back to the JSON file
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update user data.' });
          }
          return res.json({ message: 'Users data updated successfully.' });
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    });
  });

// Route to delete a user by ID
app.delete('/user/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    // Validate the user ID
    if (!validateUserId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID. Please provide a valid integer ID greater than 0.' });
    }
  
    // Validate the user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID. Please provide a valid integer ID greater than 0.' });
    }
  
    // Read the existing data from the JSON file
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read data from JSON file.' });
      }
  
      try {
        const jsonData = JSON.parse(data);
  
        // Find the index of the user with the provided ID
        const userIndex = jsonData.users.findIndex((user) => user.Id === userId);
  
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found.' });
        }
  
        // Remove the user from the array
        jsonData.users.splice(userIndex, 1);
  
        // Write the updated data back to the JSON file
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete user.' });
          }
          return res.json({ message: 'User deleted successfully.' });
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    });
  });  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
