# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application jar file (skipping tests for fast build)
RUN mvn clean package -DskipTests

# Stage 2: Create the production runtime image with Java 17 JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/tutor-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the application with memory-optimized JVM flags for Render free tier (512MB RAM)
ENTRYPOINT ["java", \
  "-Xmx256m", \
  "-Xms64m", \
  "-Xss256k", \
  "-XX:MaxMetaspaceSize=150m", \
  "-XX:+UseSerialGC", \
  "-XX:TieredStopAtLevel=1", \
  "-jar", "app.jar"]
