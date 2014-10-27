var _s = require('underscore.string');

var firstNames = require('../config/firstNames');
var firstNameReplacements = require('../config/firstNameReplacements');
var lastNameReplacements = require('../config/lastNameReplacements');

var processName = function (userObj, resultObj) {

	var makeFullName = function (first, last) {
		return (first ? first : '')
			+ (first && last ? ' ' : '')
			+ (last ? last : '');
	}

	var emailParts = userObj.email.split('@');
	var emailBeforeDomain = emailParts[0];
	
	// Strip after + in email address
	if (emailBeforeDomain.indexOf('+') !== -1) {
		emailBeforeDomain = emailBeforeDomain.substring(0, emailBeforeDomain.indexOf('+'));
	}

	// firstname.lastname
	var dotPosition = emailBeforeDomain.indexOf('.');
	if (dotPosition !== -1) {
		var tempFirstName = emailBeforeDomain.substring(0, dotPosition);
		var tempLastName = emailBeforeDomain.substring(dotPosition + 1, emailBeforeDomain.length);
		if (firstNames.indexOf(tempFirstName) !== -1) {
			resultObj.firstName = tempFirstName;
			resultObj.lastName = tempLastName;
		}
		// lastname.firstname
		else if (firstNames.indexOf(tempLastName) !== -1) {
			resultObj.firstName = tempLastName;
			resultObj.lastName = tempFirstName;
		}
	}
	// No dot
	else {
		var tempName = emailBeforeDomain;
		if (firstNames.indexOf(tempName) !== -1) {
			resultObj.firstName = tempName;
		}
	}

	// Firstnames replace: "ake" --> "åke"
	for (var searchKey in firstNameReplacements) {
		if (resultObj.firstName === searchKey) {
			resultObj.firstName = firstNameReplacements[searchKey];
		}
	}

	// Lastnames replace: "stromberg" --> "strömberg"
	for (var searchKey in lastNameReplacements) {
		if (resultObj.lastName === searchKey) {
			resultObj.lastName = lastNameReplacements[searchKey];
		}
	}

	// Titleize
	if (resultObj.firstName)
		resultObj.firstName = _s.titleize(resultObj.firstName);
	if (resultObj.lastName)
		resultObj.lastName = _s.titleize(resultObj.lastName);
	
	// Assemble
	if (resultObj.firstName || resultObj.lastName) {
		resultObj.fullName = makeFullName(resultObj.firstName, resultObj.lastName);
	}

	return resultObj;
}

var processGender = function (userObj, resultObj) {
	return resultObj;
}

var processCompany = function (userObj, resultObj) {
	return resultObj;
}

module.exports.processUser = function (userObj) {
	var resultObj = { email: userObj.email };
	processName(userObj, resultObj);
	processGender(userObj, resultObj);
	processCompany(userObj, resultObj);
	return resultObj;
}