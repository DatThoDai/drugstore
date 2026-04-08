package com.datn.drugstore.service.impl;

import com.datn.drugstore.dto.CategoryDTO;
import com.datn.drugstore.dto.ProductDTO;
import com.datn.drugstore.dto.ProductReviewDTO;
import com.datn.drugstore.entity.Category;
import com.datn.drugstore.entity.Product;
import com.datn.drugstore.entity.ProductReview;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.repository.CategoryRepository;
import com.datn.drugstore.repository.ProductRepository;
import com.datn.drugstore.request.CreateProductRequest;
import com.datn.drugstore.request.ProductReviewRequest;
import com.datn.drugstore.request.UpdateProductRequest;
import com.datn.drugstore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<ProductDTO> getAllProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());
        Page<Product> products;
        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::convertToDTO);
    }

    @Override
    public List<ProductDTO> getAllProductsAdmin() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(CreateProductRequest request, Long userId) {
        if (productRepository.findByNameContainingIgnoreCase(request.getName(), PageRequest.of(0, 1)).hasContent()) {
            throw new RuntimeException("Product name already exists");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImage(request.getImage());
        product.setCountInStock(request.getCountInStock());
        product.setLowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10);
        product.setLoanPrice(request.getLoanPrice());
        product.setIsBought(request.getBought());

        if (request.getCategory() != null) {
            Category category = categoryRepository.findById(request.getCategory())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);
        savedProduct.setMa(String.valueOf(savedProduct.getId()));
        productRepository.save(savedProduct);
        return convertToDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getImage() != null) product.setImage(request.getImage());
        if (request.getCountInStock() != null) product.setCountInStock(request.getCountInStock());
        if (request.getLowStockThreshold() != null) product.setLowStockThreshold(request.getLowStockThreshold());
        if (request.getLoanPrice() != null) product.setLoanPrice(request.getLoanPrice());
        if (request.getCategory() != null) {
            Category category = categoryRepository.findById(request.getCategory())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        if (request.getBought() != null) product.setIsBought(request.getBought());

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public void addProductReview(Long productId, ProductReviewRequest request, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean alreadyReviewed = product.getReviews().stream()
                .anyMatch(review -> review.getUser().getId().equals(user.getId()));
        if (alreadyReviewed) {
            throw new RuntimeException("Product already reviewed");
        }

        ProductReview review = new ProductReview();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUser(user);
        review.setProduct(product);

        product.getReviews().add(review);
        updateProductRating(product);

        productRepository.save(product);
    }

    @Override
    public List<ProductDTO> searchProducts(String type) {
        return productRepository.findByNameContainingIgnoreCase(type, PageRequest.of(0, 100))
                .getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

        @Override
        public List<ProductDTO> getLowStockProducts(Integer threshold) {
        List<Product> products = threshold != null
            ? productRepository.findByCountInStockLessThanEqual(threshold)
            : productRepository.findLowStockProducts();
        return products.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        }

    private void updateProductRating(Product product) {
        if (!product.getReviews().isEmpty()) {
            double avgRating = product.getReviews().stream()
                    .mapToInt(ProductReview::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
            product.setNumReviews(product.getReviews().size());
        }
    }

    private ProductDTO convertToDTO(Product product) {
        CategoryDTO categoryDTO = product.getCategory() != null ?
                new CategoryDTO(product.getCategory().getId(), product.getCategory().getName(),
                        product.getCategory().getDescription(), product.getCategory().getIsShow(),
                        product.getCategory().getParentCategory(), product.getCategory().getIsParent(),
                        product.getCategory().getCreatedAt(), product.getCategory().getUpdatedAt()) : null;

        List<ProductReviewDTO> reviewDTOs = product.getReviews() != null
                ? product.getReviews().stream()
                        .map(review -> new ProductReviewDTO(review.getId(), review.getRating(), review.getComment(),
                                review.getUser().getName(), review.getUser().getId(), review.getCreatedAt()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        return new ProductDTO(product.getId(), product.getMa(), product.getName(), product.getImage(),
                product.getDescription(), reviewDTOs, product.getRating(), product.getNumReviews(),
            categoryDTO, product.getPrice(), product.getCountInStock(),
            product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 10, product.getLoanPrice(),
                product.getIsBought(), product.getCreatedAt(), product.getUpdatedAt());
    }

}
