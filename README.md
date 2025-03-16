1. clone the code from main branch 2. Setup Backend
Navigate to the backend folder:cd backend Install dependencies:npm install 3.Setup Frontend
Navigate to the frontend folder:cd frontend Install dependencies:npm install 4. Start the development server: npm run dev for frontend and nodemon for backend 5. for database setup run this query: CREATE DATABASE product_management;

USE product_management;

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);

CREATE TABLE material (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL
);

CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    SKU VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    Category_id INT,
    material_ids VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (Category_id) REFERENCES category(category_id)
);

CREATE TABLE product_media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);


Thanks in Advance for Considering this if any issue contact : 9111642625 email: rhk0012@gmail.com # media-task
