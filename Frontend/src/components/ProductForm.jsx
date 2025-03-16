import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import toast components
import "react-toastify/dist/ReactToastify.css"; // Import styles

const ProductForm = () => {
  const [formData, setFormData] = useState({
    SKU: "",
    product_name: "",
    category_id: "",
    material_ids: "",
    price: "",
    mediaUrls: "", // Add mediaUrls to state
  });

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

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST", // Always POST for adding a new product
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product added successfully!");

        setFormData({
          SKU: "",
          product_name: "",
          category_id: "",
          material_ids: "",
          price: "",
          mediaUrls: "",
        });
      } else {
        toast.error(result.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(`Error: ${error.message || "Failed to save product"}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-center mb-6 underline">
        Add New Product
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
            Add Product
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ProductForm;
