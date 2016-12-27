myApp.controller("PriceCtrl", function ($scope, $analytics, $http, $filter, $timeout, toaster, UberService, LyftService) {
        //Analytics Tracking
        $analytics.pageTrack('/price');
        var d = new Date();
        //Variable Declaration Starts
        $scope.options = '';
        $scope.pickup = '';
        $scope.destination = '';
        $scope.destdetails = '';
        $scope.pickupdetails = '';
        $scope.destlatlng = '';
        $scope.pickuplatlng = '';
        $scope.showMap = false;
        $scope.showTabs = false;
        $scope.current = null;
        $scope.currentbool = true;
        $scope.maps = [];
        //Variable Declaration Ends
        $scope.currentdatetime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());

        //Watch for any changes in the drop down selection to get the coordinates of the location
        //Watch Start
        $scope.$watch("pickupdetails", function () {
            if ($scope.pickupdetails !== '') {
                $scope.pickuplatlng = $scope.pickupdetails.geometry.location;
            }
        });
        $scope.$watch("destdetails", function () {
            if ($scope.destdetails !== '') {
                $scope.destlatlng = $scope.destdetails.geometry.location;
            }
        });
        $scope.$watch("current", function () {
            console.log($scope.current);
            if ($scope.current !== null) {
                $scope.currentbool = false;
            }
        });
        //Watch Ends
        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }

        //Custom Sorting Function
        function comp(a, b) {
            if (a.estimated_cost_cents_min < b.estimated_cost_cents_min)
                return -1;
            if (a.estimated_cost_cents_min > b.estimated_cost_cents_min)
                return 1;
            return 0;
        }

        $scope.result = "";
        //Get Distance
        var getDistance = function (p1, p2) {
            var R = 3958.756; // Earth’s mean radius in meter
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d; // returns the distance in meter
        };
        var rad = function (x) {
            return x * Math.PI / 180;
        };

        //Compare Button Click Event
        $scope.compare = function () {

            if (typeof($scope.pickuplatlng) !== 'undefined' && typeof($scope.destlatlng) !== 'undefined' && $scope.destlatlng !== '' && $scope.pickuplatlng !== '') {
                var code = $("#codeText").val();
                toaster.pop('info', "Fetching Data...", "Please Wait. Getting Data from Services.");

                UberService.getPriceEstimate($scope.pickuplatlng.lat(), $scope.pickuplatlng.lng(), $scope.destlatlng.lat(), $scope.destlatlng.lng())
                    .then(function (data) {
                        console.log("Uber Data");
                        $analytics.eventTrack('UberAPI');
                        $analytics.eventTrack('UberAPI', {category: 'API', label: 'Uber'});
                        console.log(data.prices);
                        $scope.uber = data.prices;
                        $filter('orderBy')($scope.uber, 'low_estimate');
                        $scope.showTabs = true;
                        toaster.pop('success', "Uber Prices", "Uber Prices Loaded Successfully");
                        code = code.replace("{0}", $scope.pickuplatlng.lat());
                        code = code.replace("{1}", $scope.pickuplatlng.lng());
                        code = code.replace("{3}", $scope.currentdatetime.getHours());
                        code = code.replace("{2}", $scope.currentdatetime.getDay());
                        code = code.replace("{4}", data.prices[0].distance);
                        $scope.dist=data.prices[0].distance;
                        //Call Uber API to get Cost Estimate Starts
                        toaster.pop('info', "Fetching Prediction...", "Please Wait. Getting Data from R Code.");

                        var mysnippet = new ocpu.Snippet(code);
                        var req = ocpu.call("identity", {
                            "x": mysnippet
                        }, function (tmp) {
                            $http.get(tmp.getLoc() + "R/.val/json").then(function (response) {
                                $scope.result = response.data;
                                console.log(response.data);
                                toaster.pop('success', "Uber Predicted Prices", "Successfully Predicted Price");
                                $scope.predicted_price = $scope.result[0][0];
                                $scope.neighbour = $scope.result[1][0];
                                $scope.distance_frame = $scope.result[2];
                                $scope.hours_frame = $scope.result[3];
                                $scope.week_frame = $scope.result[4];
                                $scope.distance_frame_label = [];
                                $scope.distance_frame_mean = [];
                                $scope.hours_frame_label = [];
                                $scope.hours_frame_mean = [];
                                $scope.week_frame_label = [];
                                $scope.week_frame_mean = [];
                                angular.forEach($scope.distance_frame, function (value, idx) {
                                    $scope.distance_frame_label.push(value.distance.substring(1, value.distance.length - 1).replace(',', '-'));
                                    $scope.distance_frame_mean.push(round(value.mean, 2));
                                });
                                var frame = [];
                                angular.forEach($scope.hours_frame, function (value, idx) {
                                    $scope.hours_frame_label.push(value.hours);
                                    frame.push(round(value.V1, 2));
                                });
                                $scope.hours_frame_mean.push(frame);
                                var weekday = new Array(7);
                                weekday[0] = "Sunday";weekday[1] = "Monday";weekday[2] = "Tuesday";weekday[3] = "Wednesday";
                                weekday[4] = "Thursday";weekday[5] = "Friday";weekday[6] = "Saturday";
                                angular.forEach($scope.week_frame, function (value, idx) {
                                    $scope.week_frame_label.push(weekday[value.week]);
                                    $scope.week_frame_mean.push(value.V1);
                                });
                            });
                        });
                        req.fail(function (t) {
                            console.log(t);
                            toaster.pop('error', "Error Occurred!", "Error Occurred in Predicting Data!");
                        });

                    });

                //Call Uber API to get Cost Estimate Ends

                //Call Lyft API to get Authentication Token
                LyftService.Authentication().then(function (data) {
                    //Call Lyft API to get Cost Estimate Starts
                    return LyftService.getPriceEstimate($scope.pickuplatlng.lat(), $scope.pickuplatlng.lng(), $scope.destlatlng.lat(), $scope.destlatlng.lng());
                }).then(function (data) {
                    $scope.lyft = data.cost_estimates;
                    $scope.lyft.sort(comp);
                    console.log("Lyft Data");
                    $analytics.eventTrack('LyftAPI');
                    $analytics.eventTrack('LyftAPI', {category: 'API', label: 'Lyft'});

                    console.log($scope.lyft);
                    toaster.pop('success', "Lyft Prices", "Lyft Prices Loaded Successfully");
                });
            }
            else {
                toaster.pop('error', "Error Occurred!", "Please Enter Pickup and Destination Location.");
            }
        }
        //Compare Button Click Event Ends

        //Re-render Google Map when the Map tab is clicked starts
        $scope.reRenderMap = function () {
            console.log($scope.pickupdetails);
            $scope.showMap = true;
            $timeout(function () {
                angular.forEach($scope.maps, function (index) {
                    google.maps.event.trigger(index, 'resize');
                });
            }, 2000);
        };
        //Re-render Google Map when the Map tab is clicked ends

        $scope.$on('mapInitialized', function (evt, evtMap) {
            $scope.maps.push(evtMap);
        });

    }
);