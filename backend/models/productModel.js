import pool from '../config/db.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Get products with filters and pagination
export const getProducts = async (page, limit, filters) => {
    try {
        const offset = (page - 1) * limit;
        let query = `
            SELECT p.*, pm.url as media_url 
            FROM product p
            LEFT JOIN product_media pm ON p.product_id = pm.product_id
        `;
        let conditions = [];
        let values = [];

        if (filters.product_name) {
            conditions.push('p.product_name LIKE ?');
            values.push(`%${filters.product_name}%`);
        }
        if (filters.Category_id) {
            conditions.push('p.Category_id = ?');
            values.push(filters.Category_id);
        }
        if (filters.material_ids) {
            conditions.push('p.material_ids LIKE ?');
            values.push(`%${filters.material_ids}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const [rows] = await pool.query(query, values);

        // Decrypt SKU and map media URL
        const decryptedRows = rows.map(row => {
            if (row.SKU) {
                try {
                    row.SKU = decrypt(row.SKU);
                } catch (error) {
                    console.error("Decryption error for SKU:", row.SKU, error);
                }
            }
            return row;
        });


        // Filter by decrypted SKU in JavaScript if applicable
        if (filters.SKU) {
            return decryptedRows.filter(product => product.SKU === filters.SKU);
        }

        return decryptedRows;
    } catch (error) {
        throw new Error(`Error while fetching products: ${error.message}`);
    }
};

// Check if category exists
const checkCategoryExists = async (category_id) => {
    try {
        const [rows] = await pool.query('SELECT * FROM category WHERE category_id = ?', [category_id]);
        return rows.length > 0;
    } catch (error) {
        throw new Error(`Error while checking category existence: ${error.message}`);
    }
};

// Check if materials exist
const checkMaterialsExist = async (materialIds) => {
    try {
        if (!Array.isArray(materialIds)) {
            throw new Error("material_ids must be an array");
        }

        const placeholders = materialIds.map(() => "?").join(",");
        const query = `SELECT material_id FROM material WHERE material_id IN (${placeholders})`;
        const [rows] = await pool.query(query, materialIds);

        const existingMaterialIds = rows.map(row => row.material_id);

        return materialIds.every(id => existingMaterialIds.includes(id));
    } catch (error) {
        throw new Error(`Error while checking material existence: ${error.message}`);
    }
};


// Check if SKU already exists
const checkSKUExists = async (SKU) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product WHERE SKU = ?', [SKU]);
        return rows.length > 0;
    } catch (error) {
        throw new Error(`Error while checking SKU existence: ${error.message}`);
    }
};

// Add a new product
export const addProduct = async (product) => {
    try {
        const { SKU, product_name, category_id, material_ids, price, mediaUrls = [] } = product;

        if (!SKU) {
            throw new Error("SKU is required");
        }

        // Check if SKU already exists before encryption
        const existingProductQuery = 'SELECT SKU FROM product';
        const [existingProducts] = await pool.query(existingProductQuery);

        // Decrypt and check for duplicates
        for (let existingProduct of existingProducts) {
            const decryptedSKU = decrypt(existingProduct.SKU); // Decrypt SKU

            if (decryptedSKU === SKU) {
                throw new Error("Duplicate SKU detected. SKU must be unique.");
            }
        }

        if (!Array.isArray(material_ids) || material_ids.length === 0) {
            throw new Error("material_ids must be a non-empty array");
        }

        const encryptedSKU = encrypt(SKU); // Encrypt SKU before storing it

        // Validate Category ID
        const categoryExists = await checkCategoryExists(category_id);
        if (!categoryExists) {
            throw new Error("Invalid category_id. It does not exist.");
        }

        // Validate Material IDs
        const materialsExist = await checkMaterialsExist(material_ids);
        if (!materialsExist) {
            throw new Error("Invalid material_ids. Some materials do not exist.");
        }

        const materialIdsString = material_ids.join(","); // Store as comma-separated string

        // Insert product into the product table
        const query = `
            INSERT INTO product (SKU, product_name, Category_id, material_ids, price)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [encryptedSKU, product_name, category_id, materialIdsString, price]);
        const productId = result.insertId;

        // Insert media URLs if provided
        if (mediaUrls.length > 0) {
            const mediaQuery = `
                INSERT INTO product_media (product_id, url) 
                VALUES (?, ?)
            `;
            for (let url of mediaUrls) {
                await pool.query(mediaQuery, [productId, url]);
            }
        }

        return productId;
    } catch (error) {
        throw new Error(`Error while adding product: ${error.message}`);
    }
};



// Update product and its corresponding media URLs
export const updateProduct = async (id, product) => {
    try {
        const { SKU, product_name, category_id, material_ids, price, mediaUrls = [] } = product;

        if (!SKU) {
            throw new Error("SKU is required");
        }

        // Check if SKU already exists before encrypting
        const existingProductQuery = 'SELECT SKU, product_id FROM product WHERE product_id != ?';
        const [existingProducts] = await pool.query(existingProductQuery, [id]);

        // Decrypt and check for duplicates
        for (let existingProduct of existingProducts) {
            const decryptedSKU = decrypt(existingProduct.SKU); // Decrypt SKU

            if (decryptedSKU === SKU) {
                throw new Error("Duplicate SKU detected. SKU must be unique.");
            }
        }

        if (!Array.isArray(material_ids) || material_ids.length === 0) {
            throw new Error("material_ids must be a non-empty array");
        }

        const encryptedSKU = encrypt(SKU); // Encrypt SKU before updating

        // Validate Category ID
        const categoryExists = await checkCategoryExists(category_id);
        if (!categoryExists) {
            throw new Error("Invalid category_id. It does not exist.");
        }

        // Validate Material IDs
        const materialsExist = await checkMaterialsExist(material_ids);
        if (!materialsExist) {
            throw new Error("Invalid material_ids. Some materials do not exist.");
        }

        const materialIdsString = material_ids.join(",");

        // Update product details in the product table
        const query = `
            UPDATE product 
            SET SKU = ?, product_name = ?, Category_id = ?, material_ids = ?, price = ?
            WHERE product_id = ?
        `;
        await pool.query(query, [encryptedSKU, product_name, category_id, materialIdsString, price, id]);

        // Update media URLs for the product
        if (mediaUrls.length > 0) {
            const deleteMediaQuery = 'DELETE FROM product_media WHERE product_id = ?';
            await pool.query(deleteMediaQuery, [id]);

            const mediaQuery = `
                INSERT INTO product_media (product_id, url) 
                VALUES (?, ?)
            `;
            for (let url of mediaUrls) {
                await pool.query(mediaQuery, [id, url]);
            }
        }

    } catch (error) {
        throw new Error(`Error while updating product: ${error.message}`);
    }
};



// Delete product
export const deleteProduct = async (id) => {
    try {
        const deleteMediaQuery = 'DELETE FROM product_media WHERE product_id = ?';
        await pool.query(deleteMediaQuery, [id]);

        const query = 'DELETE FROM product WHERE product_id = ?';
        await pool.query(query, [id]);
    } catch (error) {
        throw new Error(`Error while deleting product: ${error.message}`);
    }
};

// Get product statistics
export const getStatistics = async () => {
    try {
        const [categoryStats] = await pool.query(`
            SELECT c.category_name, MAX(p.price) as highest_price
            FROM product p
            JOIN category c ON p.Category_id = c.category_id
            GROUP BY c.category_name
        `);

        const [priceRangeStats] = await pool.query(`
            SELECT 
                CASE 
                    WHEN price BETWEEN 0 AND 500 THEN '0-500'
                    WHEN price BETWEEN 501 AND 1000 THEN '501-1000'
                    ELSE '1000+'
                END AS price_range,
                COUNT(*) as product_count
            FROM product
            GROUP BY price_range
        `);

        const [noMediaProducts] = await pool.query(`
            SELECT p.*
            FROM product p
            LEFT JOIN product_media pm ON p.product_id = pm.product_id
            WHERE pm.media_id IS NULL
        `);

        return {
            categoryStats,
            priceRangeStats,
            noMediaProducts
        };
    } catch (error) {
        throw new Error(`Error while fetching product statistics: ${error.message}`);
    }
};
