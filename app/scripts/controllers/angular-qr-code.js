angular.module('qrCode', [])
    .directive('qrCodeScanner', function () {
      return {
        priority  : 0,
        template  : '<div align="center"><video id="camCapture" style="width:240px; height:180px; display: block;"></video><canvas id="qr-canvas" width="800" height="600" style="width:240px; height:180px;display:none;" ></canvas></div>',
        replace   : false,
        transclude: false,
        restrict  : 'A',
        scope     : {qrCodeScanner: '&'},
        link      : function postLink($scope, iElement, iAttrs) {
          var domCanvasCtx = document.getElementById("qr-canvas").getContext("2d"),
              domCam = document.getElementById("camCapture");

          function captureToCanvas() {
            domCanvasCtx.drawImage(domCam, 0, 0);
            try {
              qrcode.decode();
              setTimeout(captureToCanvas, 1500);
            }
            catch (e) {
              console.log(e);
              setTimeout(captureToCanvas, 500);
            }
          }

          function onSuccess(stream) {
            domCam.autoplay = true;
            if (window.webkitURL) {
              domCam.src = window.webkitURL.createObjectURL(stream);
            }
            else {
              domCam.src = stream;
            }
            setTimeout(captureToCanvas, 500);
          }

          function onError(error) {
            console.log(error);
          }

          qrcode.callback = $scope.qrCodeScanner();

          if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true, audio: true}, onSuccess, onError);
          }
          else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({video: true, audio: false}, onSuccess, onError);
          }
          else {
            // moms, dads, grandmas, and grandpas
          }

        }
      };
    });