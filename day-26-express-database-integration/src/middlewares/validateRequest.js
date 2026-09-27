import { AppError } from '../errors/AppError.js';

export function validateCreateProduct(req, res, next) {
  const { title, category, price } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title is required and must be at least 3 characters' });
  }
  if (!category || typeof category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  if (price === undefined || typeof price !== 'number' || price <= 0) {
    errors.push({ field: 'price', message: 'Price is required and must be a positive number' });
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed', 400, 'INVALID_PAYLOAD', errors));
  }
  next();
}
