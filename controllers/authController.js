const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid details' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid details' });
    }
    const token = jwt.sign({ userId: user._id }, "jhghghggffgdfdffdsdsdtetr", { expiresIn: '1h' }); // generate token
    return res.status(200).json({ message: '$user Logged in successfully', token }); // return token
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exist' });
    }
    const existingUser3 = await User.findOne({ phoneNumber: phoneNumber });
    if (existingUser3) {
      return res.status(400).json({ message: 'Phonenumber already exist' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, phoneNumber });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'All fields are required' });
  }
};
