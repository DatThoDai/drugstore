package com.datn.drugstore.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private BigDecimal price;
    private String description;
    private String image;
    private Integer countInStock;
    private Integer lowStockThreshold;
    private BigDecimal loanPrice;
    private Long category;
    private String ma;
    private Boolean bought;
}