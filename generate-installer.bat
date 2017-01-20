@echo off
call "C:\Program Files\nodejs\nodevars.bat" 
set ampClientLocation="C:\git\amp-offline-2" 
pushd %ampClientLocation%
set "branchName="
set /p branchName=Please enter the branch name, then hit ENTER key to continue. Pressing only ENTER key will work with develop 
if defined branchName (git checkout %branchName%) else (echo will work with develop)
git pull
call npm install
call npm run package
