var _s = require('underscore.string');

var firstNames = require('../config/firstNames');
var lastNames = require('../config/lastNames');
var firstNameReplacements = require('../config/firstNameReplacements');
var lastNameReplacements = require('../config/lastNameReplacements');
var companies = require('../config/companies');

var MINIMUM_NAME_SEARCH_LENGTH = 5;

var processName = function (userObj, resultObj) {

	var makeFullName = function (first, last) {
		return (first ? first : '')
			+ (first && last ? ' ' : '')
			+ (last ? last : '');
	}

	var emailParts = userObj.email.split('@');
	var emailBeforeDomain = emailParts[0]; // 'jane.doe'
	var emailFullDomain = emailParts[1]; // 'google.co.uk'
	var emailDomainName = emailFullDomain.substring(0, emailFullDomain.indexOf('.')); // 'google'
	
	// Strip after + in email address
	if (emailBeforeDomain.indexOf('+') !== -1) {
		emailBeforeDomain = emailBeforeDomain.substring(0, emailBeforeDomain.indexOf('+'));
	}

	// Syntax: firstname_lastname
	emailBeforeDomain = emailBeforeDomain.replace(/\_/g, '.');
	// Syntax: firstname-lastname
	emailBeforeDomain = emailBeforeDomain.replace(/\-/g, '.');

	// Syntax: firstname.lastname
	var dotPosition = emailBeforeDomain.indexOf('.');
	if (dotPosition !== -1) {
		var tempFirstName = emailBeforeDomain.substring(0, dotPosition);
		var tempLastName = emailBeforeDomain.substring(dotPosition + 1, emailBeforeDomain.length);
		tempLastName = tempLastName.replace(/\./g, ' ');
		if (firstNames.indexOf(tempFirstName) !== -1) {
			resultObj.firstName = tempFirstName;
			resultObj.lastName = tempLastName;
		}
		// Syntax: lastname.firstname
		else if (firstNames.indexOf(tempLastName) !== -1) {
			resultObj.firstName = tempLastName;
			resultObj.lastName = tempFirstName;
		}
		// Syntax: firstname.lastname.lastname@ (multiple last names)
		// ---not implemented---
	}
	// No dot
	else {
		var tempName = emailBeforeDomain;
		// Syntax: firstname@
		if (firstNames.indexOf(tempName) !== -1) {
			resultObj.firstName = tempName;
		}
		else {
			// Init
			var firstNamesSorted = firstNames.sort(function (a, b) {
				return (b.length - a.length); // ASC -> a - b; DESC -> b - a
			});
			// Syntax: firstnamelastname@
			var i = 0;
			while (i < firstNamesSorted.length && firstNamesSorted[i].length >= MINIMUM_NAME_SEARCH_LENGTH) {
				i++;
				// If email _starts_ with this name
				if (emailBeforeDomain.indexOf(firstNamesSorted[i]) === 0) {
					resultObj.firstName = firstNamesSorted[i];
					var remainingName = emailBeforeDomain.substring(resultObj.firstName.length, emailBeforeDomain.length);
					if (lastNames.indexOf(remainingName) !== -1) {
						resultObj.lastName = remainingName;
					}
					break;
				}
			}
		}
		// Syntax: lastnamefirstname@
		// ---not implemented---
		// Syntax: iLastname@ (initial)
		// ---not implemented---
		// Syntax: firstnameXYZ@
		// ---not implemented---
		// Syntax: firstname@lastname
		// ---not implemented---
		// Syntax: hi/hello@firstnamelastname
		// ---not implemented---
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

var generateCompanyIdFromName = function (companyName) {
	if (!companyName)
		return undefined;
	return companyName.trim().toLowerCase().replace('å', 'a').replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace(/[^\w-]+/g,'');
}

var processCompany = function (userObj, resultObj) {
	var emailParts = userObj.email.split('@');
	var companyLookup = companies[emailParts[1]];
	if (companyLookup !== undefined) {
		resultObj.company = {};
		resultObj.company.name = companyLookup.name;
		resultObj.company.id = companyLookup.id || generateCompanyIdFromName(companyLookup.name);
		resultObj.company.domain = emailParts[1];
	}
	return resultObj;
}

module.exports.processUser = function (userObj) {
	userObj.email = userObj.email.replace(/\ /, '+');
	var resultObj = { email: userObj.email };
	processName(userObj, resultObj);
	processGender(userObj, resultObj);
	processCompany(userObj, resultObj);
	return resultObj;
}