# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B verify

FROM eclipse-temurin:17-jre-jammy AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
    && groupadd --system cinebook && useradd --system --gid cinebook cinebook
WORKDIR /app
COPY --from=build --chown=cinebook:cinebook /app/target/cinebook-api-1.0.0.jar app.jar
ENV PORT=8080 SERVER_ADDRESS=0.0.0.0
USER cinebook
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
