const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Signup route

// Get user with userid information route
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user by ID in the database
    const user = await User.findById(userId);
    if (user) {
      res.json({
        status: "Success",
        data: user,
      });
    } else {
      res.json({
        status: "Failed",
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "Failed",
      message: "An error occurred while fetching user information",
    });
  }
});

//get all users
router.get("/", async (req, res) => {
  try {
    // Fetch all user records from the database
    const users = await User.find();

    if (users && users.length > 0) {
      res.json({
        status: "Success",
        data: users,
      });
    } else {
      res.json({
        status: "Success",
        message: "No users found",
        data: [],
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "Failed",
      message: "An error occurred while fetching user information",
    });
  }
});

//post
router.post("/signup", async (req, res) => {
  console.log("Request received for /user/signup");
  console.log("Request body:", req.body);

  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (!name || !email || !password || !dateOfBirth) {
    res.json({
      status: "Failed",
      message: "Empty input field",
    });
  } else if (!/^[a-zA-Z]*$/.test(name)) {
    res.json({
      status: "Failed",
      message: "Invalid name",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "Failed",
      message: "Invalid email",
    });
  } else if (isNaN(Date.parse(dateOfBirth))) {
    res.json({
      status: "Failed",
      message: "Invalid date of birth",
    });
  } else if (password.length < 8) {
    res.json({
      status: "Failed",
      message: "Password is too short!",
    });
  } else {
    try {
      // Checking if the user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.json({
          status: "Failed",
          message: "User with the provided email already exists",
        });
      } else {
        // Hash the password before saving it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          dateOfBirth: new Date(dateOfBirth),
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        res.json({
          status: "Success",
          message: "Signup Successful!",
          data: savedUser,
        });
      }
    } catch (err) {
      console.error(err);
      res.json({
        status: "Failed",
        message: "An error occurred during signup",
      });
    }
  }
});

// Update user information route
router.put("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, dateOfBirth } = req.body;
    // Find the user by ID in the database
    const user = await User.findById(userId);
    if (user) {
      // Update user properties
      user.name = name || user.name;
      user.email = email || user.email;
      user.dateOfBirth = dateOfBirth || user.dateOfBirth;
      // Save the updated user
      const updatedUser = await user.save();
      res.json({
        status: "Success",
        data: updatedUser,
      });
    } else {
      res.json({
        status: "Failed",
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "Failed",
      message: "An error occurred while updating user information",
    });
  }
});

// Delete user route
router.delete("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user by ID in the database and delete it
    const deletedUser = await User.findByIdAndDelete(userId);
    if (deletedUser) {
      res.json({
        status: "Success",
        message: "User deleted successfully",
      });
    } else {
      res.json({
        status: "Failed",
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "Failed",
      message: "An error occurred while deleting the user",
    });
  }
});

//Signin Route
router.post("/signin", async (req, res) => {
  console.log("Request received for /user/signin");
  console.log("Request body:", req.body);

  const { email, password } = req.body;
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    res.json({
      status: "Failed",
      message: "Email or password field is empty",
    });
  } else {
    try {
      // Find the user by email in the database
      const user = await User.findOne({ email: trimmedEmail });

      if (user) {
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(
          trimmedPassword,
          user.password
        );

        if (passwordMatch) {
          res.json({
            status: "Success",
            message: "Signin Successful!",
            data: {
              userId: user._id,
              name: user.name,
              email: user.email,
            },
          });
        } else {
          res.json({
            status: "Failed",
            message: "Incorrect password",
          });
        }
      } else {
        res.json({
          status: "Failed",
          message: "User not found",
        });
      }
    } catch (err) {
      console.error(err);
      res.json({
        status: "Failed",
        message: "An error occurred during signin",
      });
    }
  }
});

module.exports = router;
