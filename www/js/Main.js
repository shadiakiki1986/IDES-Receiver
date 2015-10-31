function Main($scope) {

  $scope.privateKey = null; // forge.js private key object
  $scope.privateKeyText = "";
  $scope.fns = [];
  $scope.from = "";
  $scope.to = "";
  $scope.aesEncrypted = "";
  $scope.aeskey = "";
  $scope.dataEncrypted = "";
  $scope.dataCompressed = "";

  $scope.privkeyshown = false;
  $scope.privkeyfullshown = false;

  $scope.getAesKey = function() {
    re2 = /(.*)_Key/i;
    zipEntry = $scope.filterByRE(re2);
 
    $scope.fns.push({name:zipEntry.name,text:zipEntry});//.asText()
    $scope.to = re2.exec(zipEntry.name)[1];
    $scope.aesEncrypted = zipEntry.asBinary();
    if(!!$scope.privateKey) {
      // https://github.com/digitalbazaar/forge#pkcs8
      $scope.aeskey = $scope.privateKey.decrypt($scope.aesEncrypted);
//      $scope.aeskey = btoa($scope.aeskey);
    }
  };

  $scope.getMetadata = function() {
    zipEntry = $scope.filterByRE(/(.*)_Metadata/i);
    $scope.fns.push({name:zipEntry.name,text:zipEntry}); // .asText()
  };

  $scope.getPayload = function() {
    re1 = /(.*)_Payload/i;
    zipEntry = $scope.filterByRE(re1);

    $scope.fns.push({name:zipEntry.name,text:zipEntry.asBinary()}); // .asText()
    $scope.from = re1.exec(zipEntry.name)[1];
    $scope.dataEncrypted = zipEntry.asBinary();//ArrayBuffer();

    var cipher = forge.cipher.createDecipher('AES-ECB', $scope.aeskey);
    cipher.start();
    cipher.update(forge.util.createBuffer($scope.dataEncrypted));
    cipher.finish();
    $scope.dataCompressed = cipher.output.data;

    var zip = new JSZip($scope.dataCompressed);
    $.each(zip.files, function (index, zipEntry) {
      $scope.dataXmlSigned = zipEntry.asBinary();
    });


  };

  $scope.downloadXmlSigned  =function() {
    var blob = new Blob([$scope.dataXmlSigned], {type: "application/xml;charset=utf-8"});
    saveAs(blob, "abc.xml");
  };

  $scope.filterByRE = function(re2) {
  // e.g.      re2 = /(.*)_Payload/i;

    var zip = new JSZip($scope.zzz);
    zipEntry = Object.keys(zip.files).filter(function(zipEntry) {
      //
      return(re2.test(zipEntry));
    })[0];
    return zip.files[zipEntry];
  };

  $scope.readzip = function(zzz) {
    $scope.zzz = zzz;
    $scope.getAesKey();
    $scope.getMetadata();
    $scope.getPayload();
  };

  $scope.setPrivateKey = function(pk) {
    // https://github.com/digitalbazaar/forge#pkcs8
    try {
      $scope.privateKey = forge.pki.privateKeyFromPem(pk);
      $scope.privateKeyText = pk;
      return true;
    } catch(err) {
      alert(err.message);
      return false;
    }
  };

  angular.element(document).ready(function () {
    // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
    if (!window.FileReader || !window.ArrayBuffer) {
      alert("No support for file reader api in your browser");
      return;
    }
  
     $("#file").on("change", function(evt) {
      // see http://www.html5rocks.com/en/tutorials/file/dndfiles/
      var files = evt.target.files;
      for (var i = 0, f; f = files[i]; i++) {
  
        var reader = new FileReader();
  
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            $scope.$apply(function() {
                $scope.readzip(e.target.result);
            });
          }
        })(f);
  
        // read the file !
        // readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
        reader.readAsArrayBuffer(f);
        // reader.readAsBinaryString(f);
      }
    }); 

    var pk = localStorage.getItem("privateKey");
    if(!pk) {
      $("#privateKey").on("change", function(evt) {
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {
          var reader = new FileReader();
          reader.onload = (function(theFile) {
            return function(e) {
              $scope.$apply(function() {
		if($scope.setPrivateKey(e.target.result)) {
                  localStorage.setItem("privateKey",e.target.result);
                  localStorage.setItem("privateKeyText",e.target.result);
		}
              });
            }
          })(f);
          reader.readAsText(f);
        }
      });
    } else {
      $scope.$apply(function() {
        $scope.setPrivateKey(pk);
      });
    }
  
  });

  $scope.clearPrivateKey = function() {
    $scope.privateKey = null;
    $scope.privateKeyText = "";
    localStorage.clear();
  };
}
