package com.datn.drugstore.service.impl;

import com.datn.drugstore.dto.CategoryDTO;
import com.datn.drugstore.request.CreateCategoryRequest;
import com.datn.drugstore.request.UpdateCategoryRequest;
import com.datn.drugstore.entity.Category;
import com.datn.drugstore.repository.CategoryRepository;
import com.datn.drugstore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getAllCategoriesWithShow() {
        return categoryRepository.findByIsShowTrueAndIsParentTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getAllChildCategories() {
        return categoryRepository.findByIsParentFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getChildCategoriesByParent(String parentId) {
        return categoryRepository.findByIsShowTrueAndIsParentFalseAndParentCategory(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CreateCategoryRequest request) {
        List<Category> existing = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals(request.getName()))
                .collect(Collectors.toList());
        if (!existing.isEmpty()) {
            throw new RuntimeException("Category name already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIsShow(request.getIsShow() != null ? request.getIsShow() : false);
        category.setParentCategory(request.getParentCategory());
        category.setIsParent(request.getParentCategory() == null || request.getParentCategory().isEmpty());

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getIsShow() != null) category.setIsShow(request.getIsShow());
        if (request.getParentCategory() != null) {
            category.setParentCategory(request.getParentCategory());
            category.setIsParent(request.getParentCategory() == null || request.getParentCategory().isEmpty());
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategoryStatus(Long id, Boolean isShow) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setIsShow(isShow);
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getDescription(),
                category.getIsShow(), category.getParentCategory(), category.getIsParent(),
                category.getCreatedAt(), category.getUpdatedAt());
    }
}
