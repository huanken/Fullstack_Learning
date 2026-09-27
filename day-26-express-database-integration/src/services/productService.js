import { productRepository } from '../models/productRepository.js';
import { AppError } from '../errors/AppError.js';

export const productService = {
  async getAllProducts(queryParams) {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
    const allowedSort = ['createdAt', 'price', 'title', 'stock'];
    const sortBy = allowedSort.includes(queryParams.sortBy) ? queryParams.sortBy : 'createdAt';
    const order = queryParams.order === 'asc' ? 'asc' : 'desc';

    return await productRepository.findAll({
      page,
      limit,
      category: queryParams.category,
      search: queryParams.search,
      sortBy,
      order
    });
  },

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(`Product with ID '${id}' not found`, 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  },

  async createProduct(payload) {
    if (!payload.title || payload.title.trim().length < 3) {
      throw new AppError('Title must be at least 3 characters long', 400, 'VALIDATION_ERROR');
    }
    if (typeof payload.price !== 'number' || payload.price <= 0) {
      throw new AppError('Price must be a positive number', 400, 'VALIDATION_ERROR');
    }
    return await productRepository.create(payload);
  },

  async updateProduct(id, payload) {
    await this.getProductById(id); // Check existence
    if (payload.price !== undefined && payload.price <= 0) {
      throw new AppError('Price must be a positive number', 400, 'VALIDATION_ERROR');
    }
    return await productRepository.update(id, payload);
  },

  async updateStock(id, stockQuantity) {
    await this.getProductById(id);
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      throw new AppError('Stock must be a non-negative integer', 400, 'VALIDATION_ERROR');
    }
    return await productRepository.update(id, { stock: stockQuantity });
  },

  async deleteProduct(id) {
    await this.getProductById(id);
    return await productRepository.softDelete(id);
  }
};
