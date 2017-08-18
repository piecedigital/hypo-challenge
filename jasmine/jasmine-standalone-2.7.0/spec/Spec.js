describe("Texting SearchController", function () {
  var scope = {
    test: true
  };

  // beforeEach(module("SearchController"));
  // beforeEach(inject(function ($rootScope) {
  //   scope = $rootScope;
  // }));
  var ctrl;

  beforeEach(inject(function($controller, $rootScope) {
    console.log("scope");
    scope = $rootScope.$new();
    ctrl = $controller('SearchController', {
      $scope: scope
    });
  }));

  it("should add two integer numbers.", function() {
    console.log(scope);
    // $scope.add(2,3)
    // expect($scope.Result).toEqual(5);
  });
});
