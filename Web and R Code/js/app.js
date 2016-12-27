/*External Dependencies
ngAnimate: Required by toaster
ngRoute: For Routing
ngAutoComplete: Auto Complete Directive
ui.bootstrap: Bootstrap Tab based on AngularJS
toaster: For Toast Notification
External Dependencies Ends*/
var myApp = angular.module("myApp", ['ngAnimate', 'ngRoute','ngAutocomplete', 'chart.js','ngMap', 'ui.bootstrap','toaster','angulartics', 'angulartics.google.analytics'])
//Routing Configuration
    .config(function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "price.html"
            })
            .when("/price", {
                templateUrl: "price.html"
            })
    })
    //HTTP Interceptor to add Authorization Header based on the Requests
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($window) {
            return {
                'request': function (config) {
                    if (config.url.indexOf("uber") >= 0) {
                        config.headers["Authorization"] = 'Token iot6tHkOuq9X4ruQVOiJ36LvFw6jFUiTNapg2mm6';
                    } else if (config.url.indexOf("oauth/token") >= 0) {
                        config.headers["Authorization"] = " Basic " + btoa("oiMVwGmsaAVS:ph4STG3bT6Fgk1GzuLeV7FRKV5RX8P7W");
                    } else {
                        config.headers["Authorization"] = $window.sessionStorage.getItem("token");
                    }
                    return config;
                }

            }
        });
    })
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            chartColors: ['#FF5252', '#FF8A80'],
            responsive: true
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
    }])
    //Uber API Endpoint
    .constant("Uber", "https://api.uber.com/v1")
    //Lyft Authentication API Endpoint
    .constant("LyftToken", "https://api.lyft.com")
    //Lyft API Endpoint
    .constant("Lyft", "https://api.lyft.com/v1")
    //Uber Service to get Price Estimate
    .factory("UberService", function ($http, $window, Uber) {
        return {
            getPriceEstimate: function (start_lat, start_lng, end_lat, end_lng) {
                return $http.get(Uber + "/estimates/price?" +
                    "start_latitude=" + start_lat +
                    "&start_longitude=" + start_lng +
                    "&end_latitude=" + end_lat +
                    "&end_longitude=" + end_lng
                ).then(function (response) {
                    return response.data;
                });
            }
        };

    })
    //Lyft Service to get Authentication Token and Price Estimate
    .factory("LyftService", function ($http, $window, LyftToken, Lyft) {
        return {
            Authentication: function () {
                return $http.post(LyftToken + "/oauth/token", {
                    "grant_type": "client_credentials",
                    "scope": "public"
                }).then(function (response) {
                    $window.sessionStorage.setItem("token", "Bearer " + response.data.access_token);
                    return response.data;
                });
            },
            getPriceEstimate: function (start_lat, start_lng, end_lat, end_lng) {
                return $http.get(Lyft + "/cost?" +
                    "start_lat=" + start_lat +
                    "&start_lng=" + start_lng +
                    "&end_lat=" + end_lat +
                    "&end_lng=" + end_lng
                ).then(function (response) {
                    return response.data;
                })
            }
        }
    });

