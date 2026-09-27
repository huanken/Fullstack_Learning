import { productService } from '../services/productService.js';

export const productController = {
  async getProducts(req, res, next) {
    try {
      const result = await productService.getAllProducts(req.query);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: result.items,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Product created successfully',
        data: newProduct
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Product updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStock(req, res, next) {
    try {
      const updated = await productService.updateStock(req.params.id, req.body.stock);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Product stock updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Product '${req.params.id}' deleted successfully`
      });
    } catch (err) {
      next(err);
    }
  }
};
