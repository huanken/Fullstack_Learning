import express from 'express';
import { productController } from '../controllers/productController.js';
import { validateCreateProduct } from '../middlewares/validateRequest.js';

const router = express.Router();

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', validateCreateProduct, productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.patch('/products/:id/stock', productController.updateStock);
router.delete('/products/:id', productController.deleteProduct);

export default router;
