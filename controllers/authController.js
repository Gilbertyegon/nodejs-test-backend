const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create a new function to send OTP email
async function sendOtpEmail(user) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:'bravoyegon@gmail.com',
      pass: 'qswbdwkmgvyzkbie'
    }
  });

  const mailOptions = {
    from: 'SOLOMON BAKERY <bravoyegon@gmail.com>',
    to: user.email,
    subject: 'Email Verification',
    text: `Your OTP for email verification is ${user.otp}. It is valid for 5 minutes.`
  };
  

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ $or: [{ email: email }, { phoneNumber: email }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid details' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid details' });
    }
    const token = jwt.sign({ userId: user._id }, "jhghghggffgdfdffdsdsdtetr", { expiresIn: '1h' }); // generate token
    
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified
    };

    return res.status(200).json({ message: 'Logged in successfully', token, user: userResponse }); // return token and user object
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Update the createUser function
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

    const otp = crypto.randomBytes(4).toString('hex');
    const otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes

    const newUser = new User({ firstName, lastName, email, password: hashedPassword, phoneNumber, otp, otpExpiry });
    await newUser.save();

    // Send email with OTP
    await sendOtpEmail(newUser);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'All fields are required' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === otp && Date.now() <= user.otpExpiry) {
      user.isVerified = true;
      user.otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate new 6-digit OTP
      user.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
      await user.save();
      res.status(200).json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};


exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      user.otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate new 6-digit OTP
      user.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
      await user.save();

      // Send email with the new OTP
      await sendOtpEmail(user);

      res.status(200).json({ message: 'OTP resent successfully' });
    } else {
      res.status(400).json({ message: 'Email is already verified' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error resending OTP' });
  }
};
