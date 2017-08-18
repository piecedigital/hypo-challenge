var path = require("path");
var fs = require("fs");
var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var PORT = process.env["PORT"] || 3005;

// YES, these variable names are ridiculously long, but that's intentional for the sake of this demo, that this setup is not 100% accurate to a normal server setup
var allTheUsersLoadedAtOnce = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json")));

var commentsThatShouldBeInADatabase = [];

// console.log(allTheUsersLoadedAtOnce);

var getUsers = function() {
  return JSON.parse(JSON.stringify(allTheUsersLoadedAtOnce));
}

// GET methods
var getComments = function(req, res) {
  res.send(commentsThatShouldBeInADatabase);
}

// POST methods
var queryUsers = function(req, res) {
  var body = req.body;
  // var body = JSON.parse(req.body);
  var parsedUserInput = body ? body.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : "";
  var type = req.params.type || "";
  var regex;
  // this conditional statement gives us the option to query users in different ways
  // "start": the query will match a name from the beginning
  // "global"|undefined: the query will match a name at any position
  if(type.toLowerCase() === "start") {
    regex = new RegExp("^" + parsedUserInput, "i");
  } else {
    // type.toLowerCase() === "global"
    // type.toLowerCase() === ""
    regex = new RegExp(parsedUserInput, "i");
  }
  var users = getUsers();
  var filteredUsers = [];
  var i = 0, userData;

  for(i; i < users.length; i++) {
    // if there is no input, we return nothing
    if(parsedUserInput.length === 0) break;

    // limit the search result to 10
    if(filteredUsers.length >= 10) break;
    userData = users[i];
    if(
      userData.username.match(regex) ||
      userData.name.match(regex)
    ) {
      filteredUsers.push(userData);
    }
  }

  // return the results
  res.send(filteredUsers);
}

var addComment = function(req, res) {
  var username = req.body.username || "Username";
  var text = req.body.text;

  var newComment = {
    username,
    text
  };

  // an extra layer of error checking
  var errors = [];

  if(text.length < 40) {
    errors.push("Comment must be at least 40 characters.");
  }
  // check the username for invalid characters and length
  if(username.length < 3) {
    errors.push("Username must be at least 3 characters.");
  }
  if(username.match(/[^a-z0-9\-\_]/i)) {
    errors.push("Username contains invalid characters.");
  }

  if(errors.length === 0) {
    commentsThatShouldBeInADatabase.push(newComment);

    res.status(200).send("okay");
  } else {
    res.status(400).send(errors.join(" "));
  }
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "jasmine")));
app.use(bodyParser.text());
app.use(bodyParser.json());

app
.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
})
.get("/test", function (req, res) {
  res.sendFile(path.join(__dirname, "views/index.spec.html"));
})
.get("/special", function (req, res) {
  res.sendFile(path.join(__dirname, "views/special.html"));
})
.get("/get-comments", getComments)
.get("*", function (_, res) {
  res.status(404).send("Not Found");
})

app
.post("/query-users/:type?", queryUsers)
.post("/add-comment", addComment)
.post("*", function (_, res) {
  res.status(404).send("Not Found");
})

app.listen(PORT, function () {
  console.log("Listening on port:", PORT);
});

module.exports = {
  commentsThatShouldBeInADatabase,
  getUsers,
  getComments,
  queryUsers,
  addComment,
}
