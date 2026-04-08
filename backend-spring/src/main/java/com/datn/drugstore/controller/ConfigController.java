package com.datn.drugstore.controller;

import com.datn.drugstore.response.BaseResponse;
import com.datn.drugstore.utils.ResponseFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${vnpay.url:}")
    private String vnpayUrl;

    @Value("${vnpay.tmn-code:}")
    private String vnpayTmnCode;

    @GetMapping("/vnpay")
    public ResponseEntity<BaseResponse> getVNPayConfig() {
        return ResponseFactory.success(Map.of(
                "url", vnpayUrl,
                "tmnCode", vnpayTmnCode
        ));
    }

}