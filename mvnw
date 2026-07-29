#!/bin/sh
DIR="$(cd "$(dirname "$0")" && pwd)"
exec java "-Dmaven.multiModuleProjectDirectory=$DIR" -classpath "$DIR/.mvn/wrapper/maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain "$@"
