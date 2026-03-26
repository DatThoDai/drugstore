package com.datn.drugstore.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private Boolean isShow;
    private String parentCategory;
    private Boolean isParent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}