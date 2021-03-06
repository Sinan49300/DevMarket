const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');


/* SIGNUP ROUTE */
router.route('/signup')

  .get((req, res, next) => {
    res.render('accounts/signup', { message: req.flash('errors')});
  })

  .post((req, res, next) => {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors',  'Un compte existe déja avec cette adresse mail');
        return res.redirect('/signup');
      } else {
        var user = new User();
        user.name = req.body.username;
        user.email = req.body.email;
        user.photo = user.gravatar();
        user.password = req.body.password;
        user.save(function(err) {
          if (err) return next(err);
          req.logIn(user, function(err) {
            if (err) return next(err);
            res.redirect('/');
          });
        });
      }
    });
  });


/* LOGIN ROUTE */
router.route('/login')

  .get((req, res, next) => {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { message: req.flash('loginMessage')});
  })

  .post(passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));

  router.get('/auth/facebook/callback', passport.authenticate('facebook',
   { successRedirect: '/profile',
    failureRedirect:'/login',
    failureFlash: true 
  }));

  router.get('/auth/google', passport.authenticate('google', { scope: 'email'}));

  router.get('/auth/google/callback', passport.authenticate('google',
   { successRedirect: '/profile',
    failureRedirect:'/login',
    failureFlash: true 
  }));

/* PROFILE ROUTE */
router.route('/profile')
   .get(passportConfig.isAuthenticated, (req, res, next) => {
  res.render('accounts/profile', { message: req.flash('succés')});
   })
   .post((req, res, next) => {
     User.findOne({ _id: req.user._id}, function(err, user) {
       if(user) {
         if (req.body.name) user.name = req.body.name;
         if (req.body.email) user.email = req.body.email;
         if (req.body.about) user.about = req.body.about;
         user.save(function(err) {
           req.flash('succés', 'Details mise à jour');
           res.redirect('/profile');

         });
       }
     });
   });




router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
