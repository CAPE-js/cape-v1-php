To set up a CAPE test environment, run the following commands from the inside the cape directory:

ln -s testenv/config.json .
ln -s testenv/index.html .
ln -s testenv/local.js .
ln -s testenv/data .
ln -s testenv/Assets .

Then set the directory up to be served from the web. Probably using something like:
php -Slocalhost:8080 

