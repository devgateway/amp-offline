@echo off
call "C:\Program Files\nodejs\nodevars.bat"
set ampServerUrl=%1
set ampServerPort=%2
set ampServerProtocol=%3
set ampClientLocation="C:\git\amp-offline\amp-client"

pushd %ampClientLocation%
set "branchName="
set /p branchName=Please enter the branch name, then hit ENTER key to continue. Pressing only ENTER key will work with develop
if defined branchName (git checkout %branchName%) else (echo will work with develop)
git pull
if defined ampServerUrl call npm config set amp-offline:ampServerUrl %ampServerUrl%
if defined ampServerPort call npm config set amp-offline:ampServerPort %ampServerPort%
if defined ampServerProtocol call npm config set amp-offline:ampServerProtocol %ampServerProtocol%
call npm install
call npm run package
