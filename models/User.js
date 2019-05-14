const mongoose = require('mongoose');
const Joi = require('joi');

const  UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  avatar: {
    type: String
  },
  date: {
      type: Date,
      default: Date.now
  }
});

const User = mongoose.model('users', UserSchema);

function registrationValidation(data) {
    const schema = {
      name: Joi.string().min(4).max(50).required(),
      email: Joi.string().min(10).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
      password2: Joi.any().valid(Joi.ref('password')).required()
    };

  return Joi.validate(data, schema);
}

function loginValidation(data) {
  const schema = {
    email: Joi.string().min(10).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(data, schema);
}

exports.User = User;
exports.registrationValidation = registrationValidation;
exports.loginValidation = loginValidation;
