AMP Offline
==============
This project is a standalone [Electron](http://electron.atom.io/) application for users of the AMP platform, when you have a slow/unreliable connection this app will allow you to work on existent AMP workspaces and edit or create Activities:

1. You need a valid user name and password for AMP.
2. The first time you login the app will download all necessary data to work offline.
3. Periodically the app will check if you have Internet connection and sync your local data with AMP.

Requisites
-------
node 6.x or above.
npm 3.x or above.

Install
-------    
    npm install
    npm run build-dll
    
Run
-----
	npm run dev

Test
-----
  	npm run test
Build for windows 10
----
There is a .bat file named generate-installer.bat in the root directory that you can use to checkout code and build the client. you can check https://wiki.dgfoundation.org/display/AMPDOC/How+to+generate+a+windows10+installar+for+amp-offline for mor details
