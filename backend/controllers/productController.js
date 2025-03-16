import { getProducts, addProduct, updateProduct, deleteProduct, getStatistics } from '../models/productModel.js';

// List products with filters and pagination
export const listProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const products = await getProducts(parseInt(page), parseInt(limit), filters);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const productId = await addProduct(req.body);
        res.status(201).json({ id: productId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an existing product
export const modifyProduct = async (req, res) => {
    try {
        await updateProduct(req.params.id, req.body);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a product
export const removeProduct = async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product statistics (category, price range, no media)
export const productStatistics = async (req, res) => {
    try {
        const stats = await getStatistics();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
