const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('config');
const _ = require('lodash');
const { User } = require('../models/User');
const { Profile, validate, validateExp, validateEdu } = require('../models/Profile');
const { Post} = require('../models/Post');

const router = express.Router();


//@Get All Profile
router.get('/all', (req, res) => {
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                return res.status(400).json({noprofile: "There is no profile."});
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({noprofile: "err"}));
});


//@Get Your Profile
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
 
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name'])
        .then(profile => {
            if(!profile){
                return res.status(400).json({noprofile: "There is no profile for this user."});
            }

            res.json(profile)
    
        })
        .catch(err => res.status(404).json(err));
});

//@Get Profile/:handle -> 
router.get('/handle/:handle', (req, res) => {
 
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name'])
        .then(profile => {
            if(!profile){
                return res.status(400).json({noprofile: "There is no profile for this user."});
            }

            res.json(profile)
    
        })
        .catch(err => res.status(404).json(err));
});



//@follow
router.post('/follow/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
	
    Profile.findOne({ user: req.params.id })
        .then(profile => { 
            profile.followers.unshift({ user: req.user.id});
            profile.save();
        })
        .catch(err => res.status(400).json({ err: "Post not found follow."}))
   
	Profile.findOne({ user: req.user.id })
		.then(profile => {
			profile.following.unshift({user: req.params.id});
			profile.save().then(data => res.json(data));
		})
		.catch(err => res.status(400).json({ err: "Post not found following."}))
});


//@unfollow
router.post('/unfollow/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
	
    Profile.findOneAndUpdate({ user: req.params.id } ,{
        $pull: {
            followers: { user: req.user.id } 
        }},{ new: true })
        .then(profile => {

		    Profile.findOneAndUpdate({ user: req.user.id } ,{
		        $pull: {
		            following: { user: req.params.id } 
		        }},{ new: true })
		        .then(profile => res.json(profile))

		})
        .catch(err => res.status(400).json({error: "error found."}));

});



//@Create Profile
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

	const { error } = validate(req.body);
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
	}

    let profileFields = _.pick(req.body, ['handle', 'location', 'bio'])
    
    profileFields.user = req.user.id;
    
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) { 
                Profile.findOneAndUpdate({ user: req.user.id }, {$set: profileFields}, { new: true })
                    .then(profile => res.json(profile))
                    .catch(err => res.status(400).send(err));
            } else{ 
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile){
                           return res.status(400).send({handle: "That handle already exists."});
                        }
                        const newProfile = new Profile(profileFields);
                        newProfile.save().then(profile => res.json(profile))
                    .catch(err => res.status(400).send({handle: "Type Correctly"}))
                })                    
            }
        });
});
 


//@Post Experience
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    

	const { error } = validateExp(req.body);
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
	}
    
    const newExp =  _.pick(req.body, ['title', 'company', 'location', 'from', 'to', 'current', 'description']);
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        });
});


//@Post Education
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    
	const { error } = validateEdu(req.body);
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
	}
    
    const newEdu =  _.pick(req.body, ['school', 'degree', 'fieldofstudy', 'from', 'to', 'current', 'description']);
    
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
        });
});


//@Delete Experience
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    Profile.findOneAndUpdate({ user: req.user.id } ,{
        $pull: {
            experience: { _id: req.params.exp_id } 
        }},{ new: true })
        .then(profile => {
            res.json(profile);
        })
        .catch(err => res.status(400).json({error: "error found."}));
});

//@Delete Experience
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

       Profile.findOneAndUpdate({ user: req.user.id } ,{
        $pull: {
            education: { _id: req.params.edu_id } 
        }},{ new: true })
        .then(profile => {
            res.json(profile);
        })
        .catch(err => res.status(400).json({err: "error found."}));
});


module.exports = router; 