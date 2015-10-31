# IDES Receiver
The _IDES Receiver_ is a Single-Page Application that can [decrypt and decompress](https://www.irs.gov/Businesses/Corporations/FATCA-IDES-Technical-FAQs#EncryptionE1) zip files received from the IRS via the [IDES](https://www.irs.gov/Businesses/Corporations/International-Data-Exchange-Service) gateway.

It is published at http://shadiakiki1986.github.io/IDES-Receiver/

It does so serverlessly, purely on your local machine in your own browser, in 3 steps:
1. Import your PEM-formatted RSA Private key
2. Open the received zip file
3. and generate the XML content


# Supported browsers
* General: modern browser, tested on [firefox](https://www.mozilla.org/en-US/firefox/new/) 41.02
* Generating the XML file: https://github.com/eligrey/FileSaver.js/#supported-browsers

# Under the hood
* [forge.js](https://github.com/digitalbazaar/forge)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [Bootstrap](http://getbootstrap.com/)
* [Angular](https://angularjs.org/)
* [JQuery](http://jquery.com/)

# License
Check the [LICENSE](LICENSE) file for the full text

# Dev note 1: Installation
The SPA is published at http://shadiakiki1986.github.io/IDES-Receiver/

If it is desired to install the IDES Receiver on your local server:

    make install
    wget http://github.com/Stuk/jszip/zipball/master && unzip master && rm master
    cp Stuk-jszip-82ceacc/dist/jszip.min.js www/js/vendor/jszip.js

# Dev note 2: Publishing from _master_ branch to _gh-pages_ branch

First checkout of remote branch locally

    git checkout -b gh-pages origin/gh-pages

Copying files from master to gh-pages

    make publish

If there were any "new" files that were added, a "git add" is needed in "gh-pages" branch followed by a commit and push

Finally, return to master branch

    git checkout master


