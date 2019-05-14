const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const config = require('config');

const User = mongoose.model('users');


const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.get('jwtPrivateKey');



module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

        User.findById(jwt_payload._id)
          .then(user => {
            if (user) return done(null, user);
            
            return done(null, false); // return Unauthorized
          })
          .catch(err => console.log(err));
      })
    );
  };
  