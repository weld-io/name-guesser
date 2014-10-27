# Name Guesser API

API service for guessing name, gender, company etc based on just an email address.

Inspired by [Genderize.io](http://genderize.io).

## Usage

Request:

	http://localhost:3000/?email=jane.doe@google.com

Response:

	{
		email: "jane.doe@google.com",
		name: "Jane Doe"
		firstName: "Jane",
		lastName: "Doe",
		gender: "female",
		company: {
			name: "Google",
			id: "google",
			domain: "google.com"
		}
	}
