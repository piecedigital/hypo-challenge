describe("Testing SearchController", function() {
  var ctrl, scope = {}, http;

  var exampleResult = [{
    "username": "pturner0",
    "avatar_url": "https://secure.gravatar.com/avatar/cd4318b7fb1cf64648f59198aca8757f?d=mm",
    "name": "Paula Turner"
  }];
  var testText = "This   is test text. >";
  var compareText = {
    spaces: "This is test text. >",
    xhr: "This   is test text. &#62;",
    both: "This is test text. &#62;",
  };

  beforeEach(module("searchApp"));
  beforeEach(inject(function(_$rootScope_, $controller, $httpBackend) {
    ctrl = $controller("SearchController", {
      $scope: scope
    });
  }));

  it("cleanupText should purge extra spaces and transform angle brackets", function() {
    expect(ctrl.cleanupText(testText)).toEqual(testText);
    expect(ctrl.cleanupText(testText, {
      clearSpaces: true
    })).toEqual(compareText.spaces);
    expect(ctrl.cleanupText(testText, {
      xhr: true
    })).toEqual(compareText.xhr);
    expect(ctrl.cleanupText(testText, {
      clearSpaces: true,
      xhr: true
    })).toEqual(compareText.both);
  });

  it("onChange should update the validity of text input", function() {
    ctrl.onChange();
    expect(ctrl.minCharsReached).toBeFalsy();
    ctrl.textareaText = new Int8Array(40).join("");
    ctrl.onChange();
    expect(ctrl.minCharsReached).toBeTruthy();
  });

  it("setData should update results", function() {
    expect(ctrl.results.length).toBe(0);
    ctrl.setData(exampleResult);
    expect(ctrl.results.length).toBe(1);
  });

  it("insertUser should insert a username into the text", function() {
    var textInputData = "Gansta Ipsum @ptu";
    var textOutputData = "Gansta Ipsum @pturner0";

    ctrl.textareaText = textInputData;
    ctrl.searchStart = 14;
    ctrl.searchEnd = 17;

    ctrl.insertUser(exampleResult[0]);

    expect(ctrl.textareaText).toEqual(textOutputData);
  });

  it("resetResults should reset results", function() {
    ctrl.setData(exampleResult);
    expect(ctrl.results.length).toBe(1);

    ctrl.resetResults();

    expect(ctrl.results.length).toBe(0);
  });

  it("resetSelection should reset selection start and end", function() {
    ctrl.searchStart = 14;
    ctrl.searchEnd = 17;
    expect(ctrl.searchStart).toBe(14);
    expect(ctrl.searchEnd).toBe(17);

    ctrl.resetSelection();
    expect(ctrl.searchStart).toBe(0);
    expect(ctrl.searchEnd).toBe(0);
  });

  it("resetInputs should reset username and textarea", function() {
    ctrl.username = "PieceDigital";
    ctrl.textareaText = "Available for hire";

    expect(ctrl.username).toBeTruthy();
    expect(ctrl.textareaText).toBeTruthy();

    ctrl.resetInputs();

    expect(ctrl.username).toBeFalsy();
    expect(ctrl.textareaText).toBeFalsy();
  });
});
