<img src="resources/icon.ico" alt="AMP Offline" width="40" height="40"/>AMP Offline
==============
Desktop​​ Application​ based on [Electron](http://electron.atom.io/) that​ provides​ ​the ability​ ​to​ ​contribute​ ​to​ ​[AMP](https://github.com/devgateway/amp)​ ​even​​ if​​ you​ ​have​ ​weak​ ​connection​ ​or connection​ ​issues​ ​are​ ​a ​common​ ​thing​ ​for​ ​you.​ ​The​ ​connection​ ​is​ ​necessary​​ for the initial setup and periodic data sync.

Find out more in [AMP Offline User Manuals](app/static/help).

Development
-------

### Requisites
* node >= 6.x
* npm >= 3.x

### Install
    npm install
    npm run build-dll
    
### Run
    npm run dev

### Test
    npm run test


Installer Build
----
For local OS and architecture:

`npm run package`

For Windows 10 you can use a helper [generate-installer.bat](generate-installer.bat)

Reporting Issues
----
* Before reporting an issue, please do the following:
  * Check the [AMP Offline User Manuals](app/static/help) to make sure the behavior you are reporting is not a feature.
  * Check if the issue was not already reported in the [existing issues](https://github.com/devgateway/amp-client/issues). You are very welcome to provide more details to existing issues.
* Provide steps to reproduce
* Provide actual and expected result  

Contributing
----
* Fork the repository
* Make the fix
* Validate code compliance:
   * `npm run lint`
   * `npm run test-mocha`	
* Submit a pull request to amp-client repository

Contact information
------
For any comments, please [conctact us](info@developmentgateway.org).
