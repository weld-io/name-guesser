var express = require('express');
var router = express.Router();
var emailtools = require('../lib/emailtools');

/* GET home page. */
router.get('/', function(req, res) {

	console.log(req.query);

	res.format({
		html: function(){
			res.render('index', { title: 'Name Guesser' });
		},

		json: function(){
			res.json(emailtools.processUser(req.query));
		}
	});

});

module.exports = router;