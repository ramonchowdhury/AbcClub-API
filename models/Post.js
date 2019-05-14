const mongoose = require('mongoose');
const Joi = require('joi');

const  PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }
  ],
  comments: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
        },
        text: {
            type: String,
            required: true
          },
          name: {
            type: String
          },
          avatar: {
            type: String
          },
          date: {
              type: Date,
              default: Date.now
          }
    }
  ],
  date: {
      type: Date,
      default: Date.now
  }
});

const Post = mongoose.model('posts', PostSchema);


function validateData(data) {
  const schema = {
    text: Joi.string().required(),
    name: Joi.string(),
    avatar: Joi.string()
  };

  return Joi.validate(data, schema);
}

exports.Post = Post;

exports.validate = validateData;
