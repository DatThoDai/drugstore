package com.datn.drugstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO implements Serializable {
    private Long id;
    private String ma;
    private String name;
    private String image;
    private String description;
    private List<ProductReviewDTO> reviews;
    private BigDecimal rating;
    private Integer numReviews;
    private CategoryDTO category;
    private BigDecimal price;
    private Integer countInStock;
    private BigDecimal loanPrice;
    private Boolean isBought;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}