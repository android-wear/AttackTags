var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('Usage: /user/user_name');
});

module.exports = router;

router.get('/:screen_name', function(req, res, next){
    User.get(req.params.screen_name, function(err, user){
        if(err) {
            next(err);
        }
        res.send(user);
    });
});