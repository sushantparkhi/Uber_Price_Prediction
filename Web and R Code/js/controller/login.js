myApp.controller("LoginCtrl", function ($scope, $analytics, $location,toaster) {
    $analytics.pageTrack('/login');
    $scope.uname = '';
    $scope.pwd = '';
    $scope.price = function (event) {
        if ($scope.uname === 'demo' && $scope.pwd === 'demo') {
            $location.path("/price");
        } else {
            toaster.pop('error', "Wrong Username or Password", "Please use demo for username and password.");
        }
        event.preventDefault();
        return false;
    }

});
