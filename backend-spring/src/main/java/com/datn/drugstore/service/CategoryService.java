package com.datn.drugstore.service;

import com.datn.drugstore.dto.CategoryDTO;
import com.datn.drugstore.request.CreateCategoryRequest;
import com.datn.drugstore.request.UpdateCategoryRequest;

import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();
    List<CategoryDTO> getAllCategoriesWithShow();
    List<CategoryDTO> getAllChildCategories();
    List<CategoryDTO> getChildCategoriesByParent(String parentId);
    CategoryDTO getCategoryById(Long id);
    CategoryDTO createCategory(CreateCategoryRequest request);
    void deleteCategory(Long id);
    CategoryDTO updateCategory(Long id, UpdateCategoryRequest request);
    CategoryDTO updateCategoryStatus(Long id, Boolean isShow);
}