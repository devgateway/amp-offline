@echo off

rem Use this script to configure custom env vars. Do NOT commit.
rem Alternatively configure them in your IDE.

set AMP_TEST_USER=""
set AMP_TEST_PASSWORD=""

call npm run dev
