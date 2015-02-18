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

	var searchNameArray = function (searchString, nameArray, callbackWhenFound, endingName) {
		var i = 0;
		while (i < nameArray.length && nameArray[i].length >= MINIMUM_NAME_SEARCH_LENGTH) {
			i++;
			if (endingName === true) {
				// If searchString _ends_ with this name
				if (searchString.indexOf(nameArray[i]) === searchString.length - nameArray[i].length && searchString.length >= nameArray[i].length) {
					var remainingName = searchString.substring(0, searchString.length - nameArray[i].length);
					callbackWhenFound(nameArray[i], remainingName);
					break;
				}
			}
			else {
				// If searchString _starts_ with this name
				if (searchString.indexOf(nameArray[i]) === 0) {
					var remainingName = searchString.substring(nameArray[i].length, searchString.length);
					callbackWhenFound(nameArray[i], remainingName);
					break;
				}
			}
		}		
	}

	var emailParts = userObj.email.split('@');
	var emailBeforeDomain = emailParts[0]; // 'jane.doe'
	var emailFullDomain = emailParts[1]; // 'google.co.uk'
	var emailDomainName = emailFullDomain.substring(0, emailFullDomain.indexOf('.')); // 'google'
	
	// Strip after + in email address
	if (emailBeforeDomain.indexOf('+') !== -1) {
		emailBeforeDomain = emailBeforeDomain.substring(0, emailBeforeDomain.indexOf('+'));
	}

	// Syntax: firstname_lastname@
	emailBeforeDomain = emailBeforeDomain.replace(/\_/g, '.');
	// Syntax: firstname-lastname@
	emailBeforeDomain = emailBeforeDomain.replace(/\-/g, '.');

	// Syntax: firstname.*@
	// Syntax: firstname.lastname@ - e.g. greg.larson@gmail.com
	// Syntax: firstname.lastname.lastname@ (multiple last names) - e.g. greg.larson.smith@gmail.com
	var dotPosition = emailBeforeDomain.indexOf('.');
	if (dotPosition !== -1) {
		// Has dot
		var tempFirstName = emailBeforeDomain.substring(0, dotPosition);
		var tempLastName = emailBeforeDomain.substring(dotPosition + 1, emailBeforeDomain.length);
		tempLastName = tempLastName.replace(/\./g, ' ');
		if (firstNames.indexOf(tempFirstName) !== -1) {
			resultObj.firstName = tempFirstName;
			resultObj.lastName = tempLastName;
			resultObj.pattern = 'firstname.*@';
		}
		// Syntax: lastname.firstname@
		else if (firstNames.indexOf(tempLastName) !== -1) {
			resultObj.firstName = tempLastName;
			resultObj.lastName = tempFirstName;
			resultObj.pattern = 'lastname.firstname@';
		}
	}
	else {
		// No dot
		// Syntax: firstname@ - e.g. greg@gmail.com
		if (firstNames.indexOf(emailBeforeDomain) !== -1) {
			// Yes firstname@
			resultObj.firstName = emailBeforeDomain;
			resultObj.pattern = 'firstname@';
			// Syntax: firstname@lastname - e.g. greg@larson.com
			if (lastNames.indexOf(emailDomainName) !== -1) {
				resultObj.lastName = emailDomainName;
				resultObj.pattern = 'firstname@lastname';
			}
		}
		else {
			// Not firstname@
			var firstNamesSorted = firstNames.sort(function (a, b) {
				return (b.length - a.length); // ASC -> a - b; DESC -> b - a
			});
			var lastNamesSorted = lastNames.sort(function (a, b) {
				return (b.length - a.length); // ASC -> a - b; DESC -> b - a
			});
			// Syntax: firstname*@ - e.g. gregory231@gmail.com
			searchNameArray(emailBeforeDomain, firstNamesSorted, function (name, remainingName) {
				resultObj.firstName = name;
				resultObj.pattern = 'firstname*@';
				// Syntax: firstnamelastname@ - e.g. greglarson@gmail.com
				if (lastNames.indexOf(remainingName) !== -1) {
					resultObj.lastName = remainingName;
					resultObj.pattern = 'firstnamelastname@';
				}
			}, false);
			// Syntax: *lastname@ - e.g. glarson@gmail.com
			// Syntax: firstnamelastname@ (short firstname) - e.g. greglarson@gmail.com
			if (!resultObj.firstName) {
				searchNameArray(emailBeforeDomain, lastNamesSorted, function (name, remainingName) {
					resultObj.lastName = name;
					resultObj.pattern = '*lastname@';
					if (firstNames.indexOf(remainingName) !== -1) {
						resultObj.firstName = remainingName;
						resultObj.pattern = 'firstnamelastname@ (short)';
					}
				}, true);
			}
			// Syntax: lastname*@ - e.g. larsong231@gmail.com
			// Syntax: lastnamefirstname@ - e.g. larsongreg@gmail.com
			if (!resultObj.firstName) {
				searchNameArray(emailBeforeDomain, lastNamesSorted, function (name, remainingName) {
					resultObj.lastName = name;
					resultObj.pattern = 'lastname*@';
					if (firstNames.indexOf(remainingName) !== -1) {
						resultObj.firstName = remainingName;
						resultObj.pattern = 'lastnamefirstname@';
					}
				}, false);
			}
			// Syntax: *@firstnamelastname - e.g. hello@greglarson.com
			if (!resultObj.firstName) {
				searchNameArray(emailDomainName, firstNamesSorted, function (name, remainingName) {
					resultObj.firstName = name;
					resultObj.lastName = remainingName;
					resultObj.pattern = '*@firstnamelastname';
				}, false);
			}
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