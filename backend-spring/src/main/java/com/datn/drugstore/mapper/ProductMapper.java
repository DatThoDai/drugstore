package com.datn.drugstore.mapper;

import com.datn.drugstore.dto.ProductDTO;
import com.datn.drugstore.entity.Product;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public static ProductDTO toDTO(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setMa(product.getMa());
        dto.setName(product.getName());
        dto.setImage(product.getImage());
        dto.setDescription(product.getDescription());
        dto.setRating(product.getRating());
        dto.setNumReviews(product.getNumReviews());
        dto.setPrice(product.getPrice());
        dto.setCountInStock(product.getCountInStock());
        dto.setLowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 10);
        dto.setLoanPrice(product.getLoanPrice());
        dto.setIsBought(product.getIsBought());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        if (product.getCategory() != null) {
            dto.setCategory(CategoryMapper.toDTO(product.getCategory()));
        }
        
        return dto;
    }

    public static List<ProductDTO> toDTOList(List<Product> products) {
        if (products == null) {
            return null;
        }
        return products.stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());
    }
}
