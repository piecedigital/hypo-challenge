# Search Controller

This is the primary controller that handles user input in the username and comment input elements. It has several function attached to it:

- cleanupText - purges the provided string of extra spaces and/or changes the closing angle bracket to its HTML code equivalent.

- onChange - handles the `change` event for the main comment input

- setResultSelection - when the user suggestion module is up/the user is attempting to mention someone, this value indicates who they're selecting with arrow key movement

- getUsers - fetches user data to the server

- setData - sets user data fetched from the server

- insertUser - inserts the user name of a selected user from the suggestion menu

- resetResults - resets fetched users

- resetSelection - resets text selection numbers

- resetInputs - resets the username and comment inputs

- submit - submits the new comment to the server

At this time there is a 3 character minimum for the username, and it only allows letters, numbers, hyphens and underscores. The comment has a 40 character minimum, and makes use of the `cleanupText` function
