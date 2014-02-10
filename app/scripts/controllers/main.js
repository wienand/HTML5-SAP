'use strict';

HTML5SAP.controller('MainCtrl', function ($scope, $timeout, $http) {
  $scope._ = _;
  $scope.materials = {};
  $scope.materialDocumentPositions = {};
  $scope.lastCode = null;
  $scope.alerts = [];
  $scope.username = null;
  $scope.password = null;

  try {
    var ctx = new (window.audioContext || window.webkitAudioContext);
  }
  catch (e) {
    console.log(e);
  }

  $scope.decreaseMaterial = function (code) {
    $scope.materialDocumentPositions[code].quantity = Math.max(0, $scope.materialDocumentPositions[code].quantity - 1);
    if ($scope.materialDocumentPositions[code].quantity === 0) {
      delete $scope.materialDocumentPositions[code];
    }
  };

  $scope.readQRCode = function (code) {
    /*
     if (code === $scope.lastCode) {
     return;
     }
     */
    try {
      var osc = ctx.createOscillator();
      osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.type = 3;
      osc.noteOn(0);
      setTimeout(function () {
        osc.noteOff(0);
      }, 200);
    }
    catch (e) {
      console.log(e);
    }
    if (!$scope.materialDocumentPositions.hasOwnProperty(code)) {
      $scope.materialDocumentPositions[code] = {quantity: 0, description: $scope.materials[code].description};
    }
    $scope.materialDocumentPositions[code].quantity += 1;
    $scope.alerts.push({
      type: 'error',
      msg : '' + code + ': ' + $scope.materialDocumentPositions[code].description + ' (' + $scope.materialDocumentPositions[code].quantity + ')'
    });
    $scope.$apply();
    $timeout(function () {
      $scope.alerts.splice(0, 1);
      $scope.$apply()
    }, 10000);
  };

  var transferOneMaterial = function (material) {
    $http.get('http(s)://<SAP SERVER>:<SAP PORT>/sap/bc/webrfc?_FUNCTION=Z_FM_OWW_HTML_AT_SAP&material='
            + material
            + '&quantity='
            + $scope.materialDocumentPositions[material].quantity
            + '&unit=ST'
        ).success(function () {
          $scope.alerts.push({
            type: 'error',
            msg : 'Transferred ' + $scope.materialDocumentPositions[material].quantity + ' of ' + material + ' to SAP'
          });
          $timeout(function () {
            $scope.alerts.splice(0, 1);
            $scope.$apply()
          }, 15000);
          delete $scope.materialDocumentPositions[material];
          $scope.$apply();
        });
  };

  $scope.transferToSAP = function () {
    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.username + ':' + $scope.password);
    for (var material in $scope.materialDocumentPositions) {
      if ($scope.materialDocumentPositions.hasOwnProperty(material)) {
        transferOneMaterial(material);
      }
    }
  };

  $scope.loadMaterials = function () {
    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.username + ':' + $scope.password);
    $http.get('http(s)://<SAP SERVER>:<SAP PORT>/sap/bc/webrfc?_FUNCTION=Z_FM_OWW_HTML_AT_SAP&material=*').success(function (data, status, headers, config) {
      $scope.materials = angular.fromJson(data.replace(/ +/g, " ").replace(/\0/g, "").trim());
    });
  };
});
