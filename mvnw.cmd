@REM Maven Wrapper startup batch script
@echo off
set ERROR_CODE=0
set MAVEN_PROJECTBASEDIR=%~dp0
java "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%." -classpath "%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
if %ERRORLEVEL% NEQ 0 set ERROR_CODE=%ERRORLEVEL%
exit /b %ERROR_CODE%
