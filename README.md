# IDES Receiver
The _IDES Receiver_ is a Single-Page Application that can decrypt and decompress zip files received from the IRS via the IDES gateway.
It does so serverlessly, purely on your local machine in your own browser.
Just
1. Import your PEM-formatted RSA Private key
2. Open the received zip file
3. and generate the XML content

# Under the hood
* Angular
* JQuery
* Bootstrap
* FileSaver.js
* forge.js

# Installation
If it is desired to install the IDES Receiver on your local server:

    make install
    wget http://github.com/Stuk/jszip/zipball/master && unzip master && rm master
    cp Stuk-jszip-82ceacc/dist/jszip.min.js www/js/vendor/jszip.js

# My dev notes: Publishing to gh-pages

First checkout of remote branch locally

    git checkout -b gh-pages origin/gh-pages

Copying files from master to gh-pages

    make publish

If there were any "new" files that were added, a "git add" is needed in "gh-pages" branch followed by a commit and push

Finally, return to master branch

    git checkout master

# License
Licensed under Creative Commons 1.0. Check the [[LICENSE]] file for the full text.
