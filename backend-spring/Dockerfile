FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY ./target/drugstore-0.0.1-SNAPSHOT.jar ./app.jar
ENTRYPOINT ["java", "-Duser.timezone=Asia/Ho_Chi_Minh", "-jar", "app.jar"]
EXPOSE 8081
