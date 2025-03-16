import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    SKU: "",
    product_name: "",
    Category_id: "",
    material_ids: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    fetchProducts();
  }, [page, limit, filters]);

  const fetchProducts = async () => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters,
    }).toString();

    const response = await fetch(
      `http://localhost:5000/api/products?${queryParams}`
    );
    const data = await response.json();
    setProducts(data);
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Remove the deleted product from the local state
        setProducts(
          products.filter((product) => product.product_id !== productId)
        );
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const saveEditedProduct = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${editingProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            SKU: editingProduct.SKU,
            product_name: editingProduct.product_name,
            category_id: editingProduct.Category_id,
            material_ids: editingProduct.material_ids
              .split(",")
              .map((id) => Number(id.trim())),
            price: editingProduct.price,
            media_url: editingProduct.media_url, // Add media_url to the request
          }),
        }
      );

      if (response.ok) {
        setProducts(
          products.map((product) =>
            product.product_id === editingProduct.product_id
              ? { ...editingProduct }
              : product
          )
        );
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        console.error("Error updating product:", errorData.message);
      }
    } catch (error) {
      console.error("Failed to edit product:", error);
    }
  };

  const handleChangeEdit = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name]: e.target.value,
    });
  };

  // Add navigation function for Add Product and Statistics
  const handleAddProduct = () => {
    navigate("/add"); // Navigate to the "Add Product" page
  };

  const handleViewStatistics = () => {
    navigate("/statistics"); // Navigate to the "Statistics" page
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {/* Buttons for Add Product and Statistics */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAddProduct}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Product
        </button>
        <button
          onClick={handleViewStatistics}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          View Statistics
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <input
          type="text"
          name="SKU"
          placeholder="Filter by SKU"
          value={filters.SKU}
          onChange={handleChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="product_name"
          placeholder="Filter by Product Name"
          value={filters.product_name}
          onChange={handleChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="Category_id"
          placeholder="Filter by Category_id"
          value={filters.Category_id}
          onChange={handleChange}
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="material_ids"
          placeholder="Filter by material_ids"
          value={filters.material_ids}
          onChange={handleChange}
          className="border p-2 m-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">SKU</th>
              <th className="border px-4 py-2">Product Name</th>
              <th className="border px-4 py-2">Category_id</th>
              <th className="border px-4 py-2">material_ids</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td className="border px-4 py-2">{product.SKU}</td>
                <td className="border px-4 py-2">{product.product_name}</td>
                <td className="border px-4 py-2">{product.Category_id}</td>
                <td className="border px-4 py-2">{product.material_ids}</td>
                <td className="border px-4 py-2">${product.price}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <input
              type="text"
              name="SKU"
              value={editingProduct.SKU}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="SKU"
            />
            <input
              type="text"
              name="product_name"
              value={editingProduct.product_name}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="Product Name"
            />
            <input
              type="text"
              name="Category_id"
              value={editingProduct.Category_id}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="Category_id"
            />
            <input
              type="text"
              name="material_ids"
              value={editingProduct.material_ids}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="material_ids"
            />
            <input
              type="number"
              name="price"
              value={editingProduct.price}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="Price"
            />
            {/* Media URL Input */}
            <input
              type="text"
              name="media_url"
              value={editingProduct.media_url || ""}
              onChange={handleChangeEdit}
              className="border p-2 m-2"
              placeholder="Media URL"
            />
            <div className="mt-4">
              <button
                onClick={saveEditedProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;
