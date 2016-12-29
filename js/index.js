try {
    var isFileSaverSupported = !!new Blob;
    if(!isFileSaverSupported) {
      $("#realbody").hide();
      $("#unsupported").show();
    }
} catch (e) {}
