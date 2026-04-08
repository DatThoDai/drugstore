package com.datn.drugstore.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datn.drugstore.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailConsumer {

    @Autowired
    private EmailService emailService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "user-registration", groupId = "drugstore-email-group")
    public void consumeRegistrationEvent(String message) {
        try {
            System.out.println("Received registration event: " + message);

            Map<String, String> data = objectMapper.readValue(message, Map.class);
            String email = data.get("email");
            String name = data.get("name");

            emailService.sendWelcomeEmail(email, name);

            System.out.println("Email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("Error processing registration event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @KafkaListener(topics = "otp-email", groupId = "drugstore-email-group")
    public void consumeOtpEvent(String message) {
        try {
            System.out.println("Received OTP event: " + message);

            Map<String, String> data = objectMapper.readValue(message, Map.class);
            String email = data.get("email");
            String otp   = data.get("otp");

            emailService.sendOtpEmail(email, otp);

            System.out.println("OTP email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("Error processing OTP event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
