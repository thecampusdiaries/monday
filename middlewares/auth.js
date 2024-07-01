// Auth
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl
      req.flash('error', `Please log in to perform the action.`);
      return res.redirect('/users/login');
    }
    next();
  };
  
  module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl
    }
    return next()
  }