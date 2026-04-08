package com.datn.drugstore.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class OtpProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TOPIC = "otp-email";

    public void sendOtpEvent(String email, String otp) {
        try {
            Map<String, String> data = new HashMap<>();
            data.put("email", email);
            data.put("otp", otp);

            String message = objectMapper.writeValueAsString(data);
            kafkaTemplate.send(TOPIC, message);

            System.out.println("Sent OTP event to Kafka for: " + email);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
