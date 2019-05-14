const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const passport = require('passport');

const router = express.Router();

const {User, registrationValidation, loginValidation} = require('../models/User');


//@current
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const data = _.pick(req.user, ['id', 'name', 'email', 'avatar']);
    res.json(data);
    }
  );


//@login
router.post('/login', (req, res) => {

    const { error } = loginValidation(req.body);    
	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
	}

    User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                return res.status(404).send({email: "User not found"});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        const payload = _.pick(user, ['_id','name', 'email']);
                        jwt.sign(payload, config.get('jwtPrivateKey'), { expiresIn: 3600 }, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        });
                    } else {
                        return res.status(400).send({password: "Password incorrect"});
                    }
                });
        });

});


//@registration
router.post('/register', (req, res) => {
	const { error } = registrationValidation(req.body);

	if (error){
		return res.status(400).send({[error.details[0].context.label]: error.details[0].message});
    }
    User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                return res.status(400).send({email: "email already exists"});
            } else {
                newUser = new User(_.pick(req.body, ['name', 'email', 'password']));
                const salt =  bcrypt.genSaltSync(10);
                newUser.password =  bcrypt.hashSync(newUser.password, salt)
                newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => res.status(400).send(err));
            }
        })
        .catch(err => res.status(400).send(err))
});





module.exports = router;