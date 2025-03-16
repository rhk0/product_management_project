import express from 'express';
import { listProducts, createProduct, modifyProduct, removeProduct, productStatistics } from '../controllers/productController.js';

const router = express.Router();

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', modifyProduct);
router.delete('/products/:id', removeProduct);
router.get('/products/statistics', productStatistics);

export default router;