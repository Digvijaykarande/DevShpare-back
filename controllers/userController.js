const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { startSession } = require('../utils/sessions');
const { ensureUsername } = require('./profileController');

// Register User Controller
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if fields are empty
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please fill all the fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    await ensureUsername(savedUser);
    const token = await startSession(savedUser, req);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User Controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if fields are empty
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    if (user.accountStatus && user.accountStatus !== 'Active') {
      return res.status(403).json({ error: `This account is ${user.accountStatus.toLowerCase()}` });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await ensureUsername(user);
    const token = await startSession(user, req);

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
