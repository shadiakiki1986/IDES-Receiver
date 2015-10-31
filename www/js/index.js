var app = angular.module('myApp', []);
app.controller('Main', Main);

try {
    var isFileSaverSupported = !!new Blob;
    if(!isFileSaverSupported) {
      $("#realbody").hide();
      $("#unsupported").show();
    }
} catch (e) {}
