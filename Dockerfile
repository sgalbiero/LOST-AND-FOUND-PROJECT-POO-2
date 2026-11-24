FROM node:24-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:17-jdk AS backend-build
WORKDIR /workspace
COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle/ gradle/
COPY src/ src/
COPY --from=frontend-build /workspace/frontend/dist/ src/main/resources/static/
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre
RUN useradd --system --uid 10001 appuser
WORKDIR /app
COPY --from=backend-build /workspace/build/libs/*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
