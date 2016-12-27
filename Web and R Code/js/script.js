//Get Current User Location based on HTML5 Geolocation
var scope;
$(document).ready(function () {
    scope = angular.element(document.getElementById("app")).scope();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        scope.current = "undefined";
    }
});

function showPosition(position) {
    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var bound = new google.maps.LatLngBounds();
    bound.extend(pos);
    //Setting Scope Variable from JavaScript(Current Position and Option Variable for AutoComplete)
    scope.current = pos;
    scope.options = {"bounds": bound};
    scope.$apply();
}

