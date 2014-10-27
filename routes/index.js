var express = require('express');
var router = express.Router();
var emailtools = require('../lib/emailtools');

module.exports.index = function(req, res) {

	if (req.params.format) {
		res.json(emailtools.processUser(req.query));
	}
	else {
		res.render('index', { title: 'Name Guesser' });
	}

};