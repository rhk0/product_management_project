import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import toast components
import "react-toastify/dist/ReactToastify.css"; // Import styles

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

  const navigate = useNavigate();

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
            media_url: editingProduct.media_url,
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

        toast.success( " product Updated successfully!");

      } else {
        const errorData = await response.json();
        console.error("Error updating product:", errorData.error);
        toast.error(`Error: ${errorData.error || "Failed to update product"}`);

      }
    } catch (error) {
      console.error("Failed to edit product:", error);
      toast.error(`Error: ${error.message || "Failed to update product"}`);

    }
  };

  const handleChangeEdit = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddProduct = () => {
    navigate("/add");
  };

  const handleViewStatistics = () => {
    navigate("/statistics");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

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
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 mb-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <div className="mb-4">
              <label htmlFor="SKU" className="block text-sm font-semibold mb-1">
                SKU
              </label>
              <input
                type="text"
                name="SKU"
                value={editingProduct.SKU}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="SKU"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="product_name"
                className="block text-sm font-semibold mb-1"
              >
                Product Name
              </label>
              <input
                type="text"
                name="product_name"
                value={editingProduct.product_name}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="Product Name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="Category_id" className="block text-sm font-semibold mb-1">
                Category ID
              </label>
              <input
                type="text"
                name="Category_id"
                value={editingProduct.Category_id}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="Category ID"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="material_ids"
                className="block text-sm font-semibold mb-1"
              >
                Material IDs
              </label>
              <input
                type="text"
                name="material_ids"
                value={editingProduct.material_ids}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="Material IDs"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-semibold mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={editingProduct.price}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="Price"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="media_url" className="block text-sm font-semibold mb-1">
                Media URL
              </label>
              <input
                type="text"
                name="media_url"
                value={editingProduct.media_url || ""}
                onChange={handleChangeEdit}
                className="border p-2 w-full"
                placeholder="Media URL"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={saveEditedProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
      <ToastContainer /> 

    </div>
  );
};

export default ProductList;
