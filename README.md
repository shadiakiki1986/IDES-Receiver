# IDES Receiver
The _IDES Receiver_ is a Single-Page Application that can [decrypt and decompress](https://www.irs.gov/Businesses/Corporations/FATCA-IDES-Technical-FAQs#EncryptionE1) zip files received from the IRS via the [IDES](https://www.irs.gov/Businesses/Corporations/International-Data-Exchange-Service) gateway.

It is published at http://shadiakiki1986.github.io/IDES-Receiver/

It does so serverlessly, purely on your local machine in your own browser, in 3 steps:

1. Import your PEM-formatted RSA Private key
2. Open the received zip file
3. and generate the XML content

[![Join the chat at https://gitter.im/IDES-Receiver](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/IDES-Receiver?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Supported browsers
* General: modern browser, tested on [firefox](https://www.mozilla.org/en-US/firefox/new/) 41.02
* Generating the XML file: https://github.com/eligrey/FileSaver.js/#supported-browsers

# Under the hood
* [forge.js](https://github.com/digitalbazaar/forge)
* [JSZip](https://stuk.github.io/jszip/)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [Bootstrap](http://getbootstrap.com/)
* [Angular](https://angularjs.org/)
* [JQuery](http://jquery.com/)

# License
Check the [LICENSE](LICENSE) file for the full text

# Related software
The following is the software I developed to generate the compressed and signed zip files submitted *to* IDES
* [fatca-ides-php](https://github.com/shadiakiki1986/fatca-ides-php): Php library that converts bank client data to file format submittable for FATCA at IDES gateway
* [IDES-Data-Preparation-Php](https://github.com/shadiakiki1986/IDES-Data-Preparation-Php): Php implementation of submitting data to www.idesgateway.com. Uses `fatca-ides-php`

# Usage
* Could use the published version at http://shadiakiki1986.github.io/IDES-Receiver/
* or just clone the repository locally
 * and run `python -m SimpleHTTPServer` from the `www` folder
 * or just `firefox www/index.html`

# Dev note 1: Installation
The SPA is published at http://shadiakiki1986.github.io/IDES-Receiver/

If it is desired to install the IDES Receiver on your local server:

    make install

# Dev note 2: Publishing from _master_ branch to _gh-pages_ branch

First checkout of remote branch locally

    git checkout -b gh-pages origin/gh-pages

Copying files from master to gh-pages

    make publish

If there were any "new" files that were added, a "git add" is needed in "gh-pages" branch followed by a commit and push

Finally, return to master branch

    git checkout master

# TODO
* update cipher from cbc to ecb (or other way around?)
 * undefined cipher: is this cbc vs ecb? (check console log 'decrypting payload') when deciphering the sample I provide on the page vs the example zip file i have in the shadi-configs
* if rsa private key does not correspond to the zip file, a console error shows "encryption block is invalid"
