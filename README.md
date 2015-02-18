# Name Guesser API

API service for guessing name, gender, company etc based on just an email address.

Inspired by [Genderize.io](http://genderize.io).

## Supported email formats

* firstname_lastname
* firstname-lastname
* firstname.*@
* firstname.lastname@ - e.g. greg.larson@gmail.com
* firstname.lastname.lastname@ (multiple last names) - e.g. greg.larson.smith@gmail.com
* lastname.firstname@
* firstname@ - e.g. greg@gmail.com
* firstname@lastname - e.g. greg@larson.com
* firstname*@ - e.g. gregory231@gmail.com
* firstnamelastname@ - e.g. greglarson@gmail.com
* *lastname@ - e.g. glarson@gmail.com
* firstnamelastname@ (short firstname) - e.g. greglarson@gmail.com
* lastname*@ - e.g. larsong231@gmail.com
* lastnamefirstname@ - e.g. larsongreg@gmail.com
* *@firstnamelastname - e.g. hello@greglarson.com
* firstnamelastname@ - e.g. greglarson@gmail.com

## Usage

Request:

	http://localhost:3000/.json?email=jane.doe@google.com
	http://localhost:3000/.json?email=jane.doe@google.com&country=us // country code for gender not yet implemented

Response*:

	{
		email: "jane.doe@google.com",
		fullName: "Jane Doe"
		firstName: "Jane",
		lastName: "Doe",
		gender: "female",
		company: {
			name: "Google",
			id: "google",
			domain: "google.com"
		}
	}

*Gender and Company not yet implemented.
