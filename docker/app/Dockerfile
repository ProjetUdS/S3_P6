FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY build/quarkus-app/ ./
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
