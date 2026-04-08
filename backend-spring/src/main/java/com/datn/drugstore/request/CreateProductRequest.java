package com.datn.drugstore.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotBlank(message = "Description is required")
    private String description;

    private String image;

    @NotNull(message = "Count in stock is required")
    private Integer countInStock;

    private Integer lowStockThreshold;

    private BigDecimal loanPrice;

    private Long category;

    private String ma;

    private Boolean bought;

}