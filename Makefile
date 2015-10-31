install:
	bower install
	cp bower_components/angular/angular.min.js www/js/vendor/angular.js
	cp bower_components/jquery/dist/jquery.min.js www/js/vendor/jquery.js
	cp bower_components/bootstrap/dist/js/bootstrap.min.js www/js/vendor/bootstrap.js
	cp bower_components/bootstrap/dist/css/bootstrap.min.css www/css/vendor/bootstrap.css
	cp bower_components/file-saver/FileSaver.min.js www/js/vendor/FileSaver.js
	sudo npm install node-forge && cd node_modules/node-forge && sudo npm install && npm run minify
	cp node_modules/node-forge/js/forge.min.js www/js/vendor/forge.js
	wget http://getbootstrap.com/examples/jumbotron-narrow/jumbotron-narrow.css -O www/css/vendor/jumbotron-narrow.css

publish:
	cd www/ && tar -czf IDES-Receiver-www.tgz *
	git checkout gh-pages
	mv www/IDES-Receiver-www.tgz .
	rm -rf www/
	tar -xzf IDES-Receiver-www.tgz
	rm IDES-Receiver-www.tgz 
	git commit -a -m "updating gh-pages from master"
	git push

