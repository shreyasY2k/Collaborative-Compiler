const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bcrypt = require("bcrypt");

function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    const getUserByEmail = email => {
      return User.findOne({ email: email });
    };
    getUserByEmail(email)
      .then(user => {
        if (!user) {
          return done(null, false, { message: "No user with that email" });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, { message: "Password incorrect" });
        });
      })
      .catch(err => {
        return done(err);
      });
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(null, user);
    });
  });
}
module.exports = initialize;
