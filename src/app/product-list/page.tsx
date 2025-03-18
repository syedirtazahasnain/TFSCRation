'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([]); // Products for the current page
  const [allProducts, setAllProducts] = useState<any[]>([]); // All products fetched so far
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();

  // Fetch products from the backend
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        router.push('/login'); // Redirect to login if no token is found
        return;
      }

      const response = await fetch(
        `http://household.test/api/products?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the bearer token
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data.data); // Set products for the current page
      setAllProducts((prev) => [...prev, ...data.data.data]); // Add products to allProducts
      setTotalPages(data.data.last_page); // Set total pages for pagination
      setCurrentPage(data.data.current_page); // Set current page
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }

    const existingProduct = cart.find((item) => item.product_id === productId);

    if (existingProduct) {
      // Update quantity if product already exists in cart
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Add new product to cart
      setCart((prevCart) => [
        ...prevCart,
        { product_id: productId, quantity },
      ]);
    }
  };

  // Update product quantity in cart
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId)
    );
  };

  // Submit cart to backend
  const submitCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://household.test/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: cart }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Products added to cart successfully!');
        setCart([]); // Clear the cart after successful submission
      } else {
        throw new Error(data.message || 'Failed to add products to cart');
      }
    } catch (err) {
      setError('Failed to add products to cart. Please try again.');
    }
  };

  // Fetch products when the page loads or when the page number changes
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Calculate total price and quantity
  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      item.quantity *
        (allProducts.find((p) => p.id === item.product_id)?.price || 0),
    0
  );
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Product List</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(products) &&
              products.map((product) => {
                const cartItem = cart.find((item) => item.product_id === product.id);
                const quantity = cartItem ? cartItem.quantity : 1;

                return (
                  <div
                    key={product.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-gray-600 mb-4">{product.detail}</p>
                    <p className="text-lg font-bold">${product.price}</p>
                    <div className="flex items-center mt-4">
                      <button
                        onClick={() => addToCart(product.id, 1)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Add to Cart
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0) {
                            updateQuantity(product.id, value);
                          }
                        }}
                        className="ml-4 w-16 px-2 py-1 border rounded-lg"
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-500 border border-blue-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Cart */}
      <div
        className={`fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-lg ${
          isCartOpen ? 'w-96' : 'w-24'
        } transition-all duration-300`}
      >
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          {isCartOpen ? '✕' : '🛒'}
        </button>
        {isCartOpen && (
          <>
            <h2 className="text-xl font-bold mb-4">Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <ul className="max-h-64 overflow-y-auto">
                  {cart.map((item) => {
                    const product = allProducts.find(
                      (p) => p.id === item.product_id
                    );
                    return (
                      <li key={item.product_id} className="mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{product?.name}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${(product?.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4">
                  <p className="font-bold">Total Quantity: {totalQuantity}</p>
                  <p className="font-bold">Total Price: ${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={submitCart}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-4"
                >
                  Submit Cart
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}