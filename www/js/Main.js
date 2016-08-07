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
    return $scope.filterByRE(re2).then(function(zipEntry) {
      $scope.fns.push({name:zipEntry.name,text:zipEntry});//.asText()
      $scope.to = re2.exec(zipEntry.name)[1];
      return zipEntry.async("binarystring")
        .then(function(data64) {
          $scope.aesEncrypted = data64;
          if(!!$scope.privateKey) {
            console.log("decrypting aes key",$scope.aesEncrypted.length,$scope.aesEncrypted);
            // https://github.com/digitalbazaar/forge#pkcs8
            aesPlusIv = $scope.privateKey.decrypt($scope.aesEncrypted);
            console.log("aes+iv",aesPlusIv);
            $scope.aeskey = aesPlusIv.substr(0,31+1);
            //      $scope.aeskey = btoa($scope.aeskey);
          }
        });
    });
  };

  $scope.getMetadata = function() {
    $scope.filterByRE(/(.*)_Metadata/i).then(function(zipEntry) {
      $scope.fns.push({name:zipEntry.name,text:zipEntry}); // .asText()
    });
  };

  $scope.getPayload = function() {
    re1 = /(.*)_Payload/i;
    $scope.filterByRE(re1).then(function(zipEntry) {
      zipEntry.async("binarystring")
        .then(function(data64) {
          $scope.fns.push({name:zipEntry.name,text:data64}); // .asText()
          $scope.from = re1.exec(zipEntry.name)[1];
          $scope.dataEncrypted = data64;//ArrayBuffer();

          console.log("decrypting payload");
          var cipher = forge.cipher.createDecipher('AES-ECB', $scope.aeskey);
          cipher.start();
          cipher.update(forge.util.createBuffer($scope.dataEncrypted));
          cipher.finish();
          $scope.dataCompressed = cipher.output.data;

          // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
          console.log("uncompressing payload");
          var zip = new JSZip();
          zip.loadAsync($scope.dataCompressed)
             .then(function(zip) {
                $.each(zip.files, function (index, zipEntry) {
                  zipEntry.async("binarystring")
                    .then(function(data64) {
                      $scope.dataXmlSigned = data64;
                    });
                });
             });
        });
    });

  };

  $scope.downloadXmlSigned  =function() {
    var blob = new Blob([$scope.dataXmlSigned], {type: "application/xml;charset=utf-8"});
    saveAs(blob, "abc.xml");
  };

  $scope.filterByRE = function(re2) {
  // e.g.      re2 = /(.*)_Payload/i;
    console.log("filter by re",re2);

    // https://stuk.github.io/jszip/documentation/howto/read_zip.html
    var zip = new JSZip();
    return zip.loadAsync($scope.zzz)
       .then(function(zip) {
          zipEntry = Object.keys(zip.files).filter(function(zipEntry) {
            //
            return(re2.test(zipEntry));
          })[0];
          return zip.files[zipEntry];
        });
  };

  $scope.readzip = function(zzz) {
    $scope.zzz = zzz;
    $scope.getAesKey().then(function() {
      $scope.getMetadata();
      $scope.getPayload();
    });
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
