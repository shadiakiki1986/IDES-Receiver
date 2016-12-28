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
  $scope.error = false;

  $scope.getAesKey = function() {
    re2 = /(.*)_Key/i;
    return $scope.filterByRE(re2).then(function(zipEntry) {
      $scope.fns.push({name:zipEntry.name,text:zipEntry});//.asText()
      $scope.to = re2.exec(zipEntry.name)[1];
      // https://stuk.github.io/jszip/documentation/api_zipobject/async.html
      return zipEntry.async("binarystring")
        .then(function(data64) {
          return $scope.$apply(function() {
            return $scope.getAesKeyCore(data64);
          });
        });
    });
  };

  $scope.getAesKeyCore = function(data64) {
          if(!$scope.privateKey) {
            return('no private key... not decrypting');
          }

          $scope.aesEncrypted = data64;
          if($scope.debug) {
            console.log(
              "decrypting aes key",
              $scope.aesEncrypted.length,
              btoa($scope.aesEncrypted)
            );
          }

          try {
            // https://github.com/digitalbazaar/forge#pkcs8
            aesPlusIv = $scope.privateKey.decrypt($scope.aesEncrypted);//,'RAW');
          } catch(e) {
            return e;
          }

          if($scope.debug) {
            console.log(
              'decrypted aes',
              aesPlusIv.length,
              btoa(aesPlusIv)
            );
          }

          if(aesPlusIv.length==32) {
            $scope.cipher='AES-ECB';
            $scope.aeskey = aesPlusIv;
            $scope.iv=false;
          } else if(aesPlusIv.length==48) {
            $scope.cipher='AES-CBC';
            $scope.aeskey = aesPlusIv.substr(0,31+1);
            $scope.iv = aesPlusIv.substr(32);
          } else {
            throw('invalid aes length or aes+iv length');
          }

          return false;
  };

  $scope.getMetadata = function() {
    return $scope.filterByRE(/(.*)_Metadata/i).then(function(zipEntry) {
      return $scope.fns.push({name:zipEntry.name,text:zipEntry}); // .asText()
    });
  };

  $scope.debug=false;

  $scope.getPayload = function() {
    re1 = /(.*)_Payload/i;
    return $scope.filterByRE(re1).then(function(zipEntry) {
      return zipEntry.async("binarystring")
        .then(function(data64) {
          $scope.$apply(function() {
            return $scope.getPayloadCore(re1,zipEntry,data64);
          });
        });
    });

  };

  $scope.getPayloadCore=function(re1,zipEntry,data64) {
          $scope.fns.push({name:zipEntry.name,text:data64}); // .asText()
          $scope.from = re1.exec(zipEntry.name)[1];
          $scope.dataEncrypted = data64;//ArrayBuffer();

          console.log("decrypting payload");
          var cipher = forge.cipher.createDecipher($scope.cipher, $scope.aeskey);
          options = {};
          if($scope.cipher=='AES-CBC') options = {iv:$scope.iv};
          cipher.start(options);
          cipher.update(forge.util.createBuffer($scope.dataEncrypted));
          cipher.finish();
          $scope.dataCompressed = cipher.output.data;

          // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
          console.log("uncompressing payload");
          var zip = new JSZip();
          return zip.loadAsync($scope.dataCompressed)
             .then(function(zip) {
               $scope.$apply(function() {
                  $.each(zip.files, function (index, zipEntry) {
                    zipEntry.async("text")
                      .then(function(data64) {
                        $scope.$apply(function() {
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
    $scope.error = false;
    $scope.dataXmlSigned = false;
    $scope.getAesKey().then(function(error) {
        if(error) {
          if(error=='Error: Encryption block is invalid.') {
            error+=' Perhaps the RSA private key does not correspond to the imported ZIP file?';
          }
          msg = 'AES key decryption: '+error;
          $scope.$apply(function() {
            $scope.error = msg;
          });
          throw msg;
        }
        $scope.getMetadata().then(function() {
            $scope.getPayload();
        });
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
