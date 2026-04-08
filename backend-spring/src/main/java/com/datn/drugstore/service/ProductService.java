package com.datn.drugstore.service;

import com.datn.drugstore.dto.ProductDTO;
import com.datn.drugstore.request.UpdateProductRequest;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.request.CreateProductRequest;
import com.datn.drugstore.request.ProductReviewRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {
    Page<ProductDTO> getAllProducts(String keyword, int page, int size);
    List<ProductDTO> getAllProductsAdmin();
    ProductDTO getProductById(Long id);
    ProductDTO createProduct(CreateProductRequest request, Long userId);
    ProductDTO updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
    void addProductReview(Long productId, ProductReviewRequest request, User user);
    List<ProductDTO> searchProducts(String type);
    List<ProductDTO> getProductsByCategory(Long categoryId);
    List<ProductDTO> getLowStockProducts(Integer threshold);
}