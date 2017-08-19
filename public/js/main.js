// focus on the input element
var primaryInputElem = document.querySelector(".comment-input");
if(primaryInputElem) primaryInputElem.focus();

var app = angular.module('searchApp', []);

app.directive('keyAction', function() {
  return function(scope, element) {
    var search = scope.search;

    element.bind('keydown', function(e) {
      var elem = e.target;
      // here we'll be checking for the common symbol for tagging users, "@"
      var character = search.textareaText[search.searchStart-1];
      // if we are mentioning someone and it hasn't been broken by the above condition, continue
      if(search.mentioning && character && character === "@") {
        // handle arrow key
        switch (e.key) {
          // arrow up/down, change the selection
          case "ArrowUp":
            e.preventDefault();
            if(search.resultSelection > 0) {
              search.setResultSelection(search.resultSelection-1);
            } else {
              search.setResultSelection(0);
            }
          break;
          case "ArrowDown":
            e.preventDefault();
            if(search.resultSelection < search.results.length-1) {
              search.setResultSelection(search.resultSelection+1);
            } else {
              search.setResultSelection(search.results.length-1);
            }
          break;
          case "Enter":
            // insert user
            e.preventDefault();
            console.log("enter");
            search.insertUser(search.results[search.resultSelection]);
            // update the view with the data
            // this may not be the best solution but it was certainly better solution than the convoluted mess I might come up with based on lack of familiarity
            // will update when a better solution is discovered
            scope.$apply();
          break;
        }
      }
    });

    element.bind('keyup', function(e) {
      var elem = e.target;
      // here we'll be checking for the common symbol for tagging users, "@"
      var character = search.textareaText[search.searchStart-1];
      var character2 = search.textareaText[elem.selectionStart-1];

      // if there's anything other than a character allowed in a user name or an @, stop trying to mention someone and clear results
      if(character2 === undefined || !character2.match(/[a-z0-9\-\_@]/i)) {
        search.mentioning = false;
        search.resetResults();
      } else
      // if we are mentioning someone and it hasn't been broken by the above condition, continue
      if(search.mentioning && character && character === "@") {
        // handle arrow key selection in the key down event
      } else
      // if the matching character is an @, start mentioning here
      if(character2 && character2 === "@") {
        search.mentioning = true;
        search.searchStart = elem.selectionStart;
      } else {
        // stop mentioning and reset search results
        search.mentioning = false;
        search.resetResults();
      }

      if(search.mentioning) {
        search.searchEnd = elem.selectionStart;
        search.getUsers(search.searchStart, elem.selectionStart);
      }
    });
  };
});

app.controller('SearchController', function($http, $scope) {
  // console.log("mounted", this, $scope);
  var search = this;
  search.results = [];
  search.resultSelection = 0;
  search.mentioning = false;
  search.searchStart = 0;
  search.searchEnd = 0;
  search.username = "";
  search.textareaText = "";
  search.characterMinimum = 40;
  search.minCharsReached = false;
  search.characterCount = 0 - search.characterMinimum;
  search.errors = {
    username: null,
    comment: null,
  };

  search.cleanupText = function (str, {clearSpaces, xhr} = {}) {
    var newStr = str
    // replace extra spaces with only one
    if(clearSpaces) newStr = newStr.replace(/\s{2,}/g, " ");
    // filter out character that's key in XHR
    if(xhr) newStr = newStr.replace(/[>]/g, "&#62;");

    return newStr;
  }

  // event for when the textarea input is changed
  search.onChange = function () {
    var validText = search.cleanupText(search.textareaText, {
      clearSpaces: true
    });

    search.characterCount = validText.length - search.characterMinimum;
    if(validText.length - 40 >= 0) {
      search.minCharsReached = true;
    } else {
      search.minCharsReached = false;
    }
  }

  // set the results of the request to get users
  search.setData = function (data) {
    search.results = data;
  }

  // sets the result selection number to input or the current value
  search.setResultSelection = function (input) {
    // update the value
    if(typeof input !== "number") {
      search.resultSelection = search.resultSelection;
    } else {
      search.resultSelection = input;
    }
  }

  // fetch users from the server
  search.getUsers = function (start, end) {
    var stringSlice = search.textareaText.slice(start, end)

    // console.log(start, end, stringSlice);

    $http.post("/query-users", {
      query: stringSlice
    }).then(function success(data) {
      search.setData(data.data);
    }, function error(data) {
      console.error(data);
    });
  }

  // inserts the username of a selected user into the text box
  search.insertUser = function (result) {
    var regex = new RegExp("\.{1," + search.searchStart + "\}(.\{1," + (search.searchEnd - search.searchStart) + "\})");
    // if the user is inserting a name while leaving no space between the text ahead, inset a space
    var spaceCharacter = "";
    // try to match a space or nothing
    var match = !search
      .textareaText
      .slice(search.searchEnd, search.searchEnd+1)
      .match(/(\s|$^)/);

    if( match ) spaceCharacter = " ";

    var replacementText = search.textareaText.replace(regex, (_, group) => {
      // replace the existing text with the existing text(up to and including the @) + the new username
      return search.textareaText.slice(0, search.searchStart) + result.username + spaceCharacter
    });
    search.textareaText = replacementText;
    console.log(search.textareaText);
    search.resetResults();
    search.resetSelection();
    primaryInputElem.focus();
  }

  search.resetResults = function () {
    search.results = [];
  }

  search.resetSelection = function () {
    search.searchStart = 0;
    search.searchEnd = 0;
    search.resultSelection = 0;
  }

  search.resetInputs = function () {
    search.username = "";
    search.textareaText = "";
  }

  // send the new comment to the server
  search.submit = function (e) {
    var validText = search.cleanupText(search.textareaText, {
      clearSpaces: true,
      xhr: true
    });

    search.errors.username = "";
    search.errors.comment = "";

    if(!search.minCharsReached) {
      search.errors.comment = "Comment must be at least 40 characters.";
    }
    // check the username for invalid characters and length
    if(search.username.length < 3) {
      search.errors.username = "Username must be at least 3 characters.";
    }
    // regex credit: https://stackoverflow.com/a/35743562/4107851
    // this should allow for at least some foreign characters with accent marks
    if(!search.username.match(/^([^\u0000-\u007F]|\w)+$/i)) {
      search.errors.username = "Username contains invalid characters.";
    }

    // if errors is an empty string there are no errors
    var errors = Object.values(search.errors).join("");
    if(errors) return;

    $http.post("/add-comment", {
      username: search.username,
      text: validText
    }).then(function success(data) {
      console.log(data);
      search.resetInputs();
    }, function error(data) {
      console.error(data);
    });
  }
});

app.controller("CommentsController", function ($http, $scope, socket) {
  var comments = this;
  comments.results = [];

  comments.setComment = function(data) {
    comments.results.push(data);
  }

  socket.on("comment", comments.setComment);

  $http.get("/get-comments").then(function success(data) {
    data.data.map(data => comments.setComment(data));
  }, function error(data) {
    console.error(data);
  });
});

app.filter("reverse", function () {
  return function(items) {
    return items.slice().reverse();
  }
});

// https://stackoverflow.com/a/25500347/4107851
app.filter("rawHTML", function ($sce) {
  return function (data) {
    var newData = $sce.trustAsHtml(data);
    return newData;
  }
});

// source: https://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
app.factory("socket", function ($rootScope) {
  var socket = io();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }
  };
});
