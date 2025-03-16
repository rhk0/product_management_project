import React, { useEffect, useState } from 'react';

const Statistics = () => {
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        const response = await fetch('http://localhost:5000/api/products/statistics');
        const data = await response.json();
        setStats(data);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 underline">Product Statistics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Category Wise Highest Price</h2>
                    <ul className="space-y-2">
                        {stats.categoryStats?.map((stat) => (
                            <li key={stat.category_name} className="flex justify-between text-gray-600">
                                <span>{stat.category_name}</span>
                                <span className="font-semibold">${stat.highest_price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Price Range Wise Product Count</h2>
                    <ul className="space-y-2">
                        {stats.priceRangeStats?.map((stat) => (
                            <li key={stat.price_range} className="flex justify-between text-gray-600">
                                <span>{stat.price_range}</span>
                                <span className="font-semibold">{stat.product_count} products</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Products with No Media</h2>
                    <ul className="space-y-2">
                        {stats.noMediaProducts?.map((product) => (
                            <li key={product.product_id} className="text-gray-600">
                                {product.product_name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
