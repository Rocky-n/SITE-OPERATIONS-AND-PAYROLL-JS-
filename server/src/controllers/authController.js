const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hardcoded authorized phone numbers for organizational access
const ALLOWED_PHONE_NUMBERS = [
  '9344951989',
  '8220289579',
  '7305304100',
  '9443963668',
];

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'supersecretconstructionkey_2026_jwt_token!';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// Direct Whitelist Login
const whitelistLogin = async (req, res) => {
  try {
    // 4. Backend Fallback Log: Print received body at the very top
    console.log("Received body:", req.body);

    // 1. Check Payload Keys: robust extraction from req.body
    let inputPhone = req.body?.phoneNumber || req.body?.phone;
    if (typeof inputPhone === 'object' && inputPhone !== null) {
      inputPhone = inputPhone.phoneNumber || inputPhone.phone;
    }

    if (!inputPhone && inputPhone !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required. Expected payload: { "phoneNumber": "..." }',
      });
    }

    // 1. Convert input value explicitly to a String
    const rawString = String(inputPhone);

    // 2. Use .trim() to remove any accidental leading or trailing spaces
    const trimmed = rawString.trim();

    // 3. Use .replace(/\D/g, '') to strip out any non-numeric characters
    let clean = trimmed.replace(/\D/g, '');

    // Normalize country code (+91 / 91) if entered to ensure exact 10-digit match
    if (clean.length === 12 && clean.startsWith('91')) {
      clean = clean.slice(2);
    } else if (clean.length === 11 && clean.startsWith('0')) {
      clean = clean.slice(1);
    } else if (clean.length > 10) {
      clean = clean.slice(-10);
    }

    console.log('--- AUTHENTICATION VALIDATION CHECK ---');
    console.log('Raw input received:', inputPhone, '| Type:', typeof inputPhone);
    console.log('Sanitized input being checked:', clean, '| Type:', typeof clean);
    console.log('Whitelisted match:', ALLOWED_PHONE_NUMBERS.includes(clean));

    // 4. Compare clean string against array of strings
    if (!ALLOWED_PHONE_NUMBERS.includes(clean)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Access',
      });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber: clean });
    if (!user) {
      user = await User.create({
        phoneNumber: clean,
        name: 'Site Manager',
        role: 'manager',
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in whitelistLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        phoneNumber: req.user.phoneNumber,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};

module.exports = {
  whitelistLogin,
  getMe,
  ALLOWED_PHONE_NUMBERS,
};
