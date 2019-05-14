const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('config');
const _ = require('lodash');
const { Post, validate} = require('../models/Post');
const { Profile } = require('../models/Profile');

const router = express.Router();

//@Twitte
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { error } = validate(req.body);
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
    }
    const newPost = new Post(_.merge({user: req.user.id}, _.pick(req.body, ['text', 'name', 'avatar'])));
    
    newPost.save()
        .then( post => res.json(post))
        .catch(err => res.json(err))
});

//@Get Twitte List -> all
router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(400).json({err: "error found"}))
});

//@Get Twitte by PostId
router.get('/:id', (req, res) => {
    Post.findById({_id: req.params.id})
        .then(posts => res.json(posts))
        .catch(err => res.status(400).json({err: "Not Found"}))
});

//@Get Post By Handle
router.get('/getpostsbyhandle/:handle', (req, res) => {

    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name'])
        .then(profile => {
            Post.find({user: profile.user._id})
                .sort({date: -1})
                .then(posts => res.json(posts))
                .catch(err => res.status(400).json({err: "error found"}))
    
        })
        .catch(err => res.status(404).json(err));
})


//@Delete Post By Id
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({err: "Unauthorized Access."})
            } 
            post.remove().then(() => res.json({ success: true }))      
        })
        .catch(err => res.status(400).json({ err: "Post not found."}))
});

//@Like Post By Id
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({alreadyLiked: "User allready liked."})
            }   
            post.likes.unshift({ user: req.user.id});
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(400).json({ err: "Post not found."}))
});

//@Unlike Post By Id
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findOneAndUpdate({ _id: req.params.id } ,{
  
        $pull: { likes: { user: req.user.id } }},{ new: true })
        .then(post => res.json(post))
        .catch(err => res.status(400).json({err: "error found."}));

});

//@Comment Post By Id
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { error } = validate(req.body);
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
    }
    
    Post.findById(req.params.id)
        .then(post => {
            const newComment = _.merge({user: req.user.id}, _.pick(req.body, ['text', 'name', 'avatar']));
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(400).send(err))
});

//@Delete Comment Post By id == postID,
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findOneAndUpdate({ _id: req.params.id } ,{
        
        $pull: { comments: { 
            _id: req.params.comment_id, 
            user: req.user.id } }},{ new: true }
        )
        .then(post => res.json(post))
        .catch(err => res.status(400).json({err: "error found."}));
});

module.exports = router; 