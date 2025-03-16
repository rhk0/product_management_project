import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import toast components
import "react-toastify/dist/ReactToastify.css"; // Import styles

const ProductForm = () => {
  const { id } = useParams(); // Extract the `id` parameter from the URL

  const [formData, setFormData] = useState({
    SKU: "",
    product_name: "",
    category_id: "",
    material_ids: "",
    price: "",
    mediaUrls: "", // Add mediaUrls to state
  });

  // Fetch product data if `id` is provided (for editing)
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format form data
      const formattedData = {
        ...formData,
        category_id: Number(formData.category_id), // Convert category_id to number
        material_ids: Array.isArray(formData.material_ids)
          ? formData.material_ids
          : typeof formData.material_ids === "string" &&
            formData.material_ids.trim() !== ""
          ? formData.material_ids.split(",").map((id) => Number(id.trim())) // Convert to an array of numbers
          : [], // Default to an empty array if invalid
        mediaUrls: formData.mediaUrls
          ? formData.mediaUrls.split(",").map((url) => url.trim())
          : [],
      };

      const url = id
        ? `http://localhost:5000/api/products/${id}` // Update product
        : "http://localhost:5000/api/products"; // Add new product

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      // Success message
      toast.success(`${id ? "Updated" : "Added"} product successfully!`);
    } catch (error) {
      console.error("Error saving product:", error);

      // Show error toast message with appropriate message
      toast.error(`Error: ${error.message || "Failed to save product"}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-center mb-6 underline">
        {id ? "Update Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="SKU"
            value={formData.SKU}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Materials
          </label>
          <input
            type="text"
            name="material_ids"
            value={formData.material_ids}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Media URLs{" "}
          </label>
          <input
            type="text"
            name="mediaUrls"
            value={formData.mediaUrls}
            onChange={handleChange}
            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-md w-full sm:w-auto"
          >
            {id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
      <ToastContainer /> {/* Toast container to display toast messages */}
    </div>
  );
};

export default ProductForm;
