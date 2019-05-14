const mongoose = require('mongoose');
const Joi = require('joi');


const  ProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  handle: {
    type: String,
    required: true,
    max: 40
  },
  location: {
      type: String
  },
  bio: {
      type: String
  },
  followers: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }

  ],
  following: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    }

  ],
  experience: [
      {
        title: {
            type: String,
            require: true
        },
        company: {
            type: String,
            require: true
        },
        location: {
            type: String,
        },
        from: {
            type: Date,
            require: true
        },
        to: {
            type: Date
        },
        current: {
            type: Boolean,
            require: true
        }, 
        description: {
            type: String
        }
      }
  ],
  education: [
    {
      school: {
          type: String,
          require: true
      },
      degree: {
          type: String,
          require: true
      },
      fieldofstudy: {
          type: String,
          require: true
      },
      from: {
          type: Date,
          require: true
      },
      to: {
          type: Date
      },
      current: {
          type: Boolean,
          require: true
      }, 
      description: {
          type: String
      }
    }
 ]
});

const Profile = mongoose.model('profiles', ProfileSchema);

function validate(data) {
    const schema = {
        handle: Joi.string().max(40).required(),
        location: Joi.string().allow(''),
        bio: Joi.string().allow('')
    };
    return Joi.validate(data, schema);
  }

function validateExperienceInput(data){
    const schema = {
        company: Joi.string().required(),
        title: Joi.string().max(40).required(),
        location: Joi.string().allow(''),
        from: Joi.string().required(),
        to: Joi.string().allow(''),
        current: Joi.boolean().allow(''),
        description: Joi.string().allow('')
    }
    return Joi.validate(data, schema);
}

function validateEducationInput (data) {
    const schema = {
        school: Joi.string().max(40).required(),
        degree: Joi.string().required(),
        fieldofstudy: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().allow(''),
        current: Joi.boolean().required(),
        description: Joi.string().allow('')
    }
    return Joi.validate(data, schema);
}


exports.Profile = Profile;
exports.validate = validate;
exports.validateExp = validateExperienceInput;
exports.validateEdu = validateEducationInput;