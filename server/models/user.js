const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');   // works fine in CommonJS land

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // NEW ────────────────────────────────────────────────
  //  Stores the team IDs (or names) the user follows.
  favorites: {
    type: [String],
    default: []
  }
});

// hash password on create / when modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare incoming login pw to hash
userSchema.methods.matchPassword = function (plainPw) {
  return bcrypt.compare(plainPw, this.password);
};

module.exports = mongoose.model('User', userSchema);
