package com.datn.drugstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewDTO implements Serializable {
    private Long id;
    private Integer rating;
    private String comment;
    private String userName;
    private Long userId;
    private LocalDateTime createdAt;
}