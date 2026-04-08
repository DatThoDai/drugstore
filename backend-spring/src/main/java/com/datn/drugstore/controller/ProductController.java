package com.datn.drugstore.controller;

import com.datn.drugstore.dto.ProductDTO;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.request.CreateProductRequest;
import com.datn.drugstore.request.ProductReviewRequest;
import com.datn.drugstore.request.UpdateProductRequest;
import com.datn.drugstore.response.BaseResponse;
import com.datn.drugstore.service.ProductService;
import com.datn.drugstore.utils.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<BaseResponse> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int pageNumber) {
        Page<ProductDTO> page = productService.getAllProducts(keyword, pageNumber, 12);
        Map<String, Object> data = new HashMap<>();
        data.put("products", page.getContent());
        data.put("page", page.getNumber() + 1);
        data.put("pages", page.getTotalPages());
        return ResponseFactory.success(data);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getAllProductsAdmin() {
        List<ProductDTO> products = productService.getAllProductsAdmin();
        return ResponseFactory.success(products);
    }

    @GetMapping("/search/{type}")
    public ResponseEntity<BaseResponse> searchProducts(@PathVariable String type) {
        List<ProductDTO> products = productService.searchProducts(type);
        return ResponseFactory.success(products);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getLowStockProducts(
            @RequestParam(required = false) Integer threshold) {
        List<ProductDTO> products = productService.getLowStockProducts(threshold);
        return ResponseFactory.success(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseFactory.success(product);
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<BaseResponse> addProductReview(
            @PathVariable Long id,
            @Valid @RequestBody ProductReviewRequest request,
            @AuthenticationPrincipal User user) {
        productService.addProductReview(id, request, user);
        return ResponseFactory.successMessage("Đánh giá đã được thêm");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseFactory.successMessage("Xóa sản phẩm thành công");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @AuthenticationPrincipal User user) {
        ProductDTO product = productService.createProduct(request, user.getId());
        return ResponseFactory.created(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request) {
        ProductDTO product = productService.updateProduct(id, request);
        return ResponseFactory.success(product, "Cập nhật sản phẩm thành công");
    }

    @GetMapping("/searchProduct/{option}")
    public ResponseEntity<BaseResponse> searchProductByOption(@PathVariable String option) {
        List<ProductDTO> products = productService.getAllProductsAdmin();
        if ("old".equals(option)) {
            products = products.stream()
                    .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                    .collect(java.util.stream.Collectors.toList());
        } else {
            products = products.stream()
                    .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
                    .collect(java.util.stream.Collectors.toList());
        }
        return ResponseFactory.success(products);
    }

    @GetMapping("/searchHere/{q}")
    public ResponseEntity<BaseResponse> getProductsByCategory(@PathVariable Long q) {
        List<ProductDTO> products = productService.getProductsByCategory(q);
        return ResponseFactory.success(products);
    }
}
