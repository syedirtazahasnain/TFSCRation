"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";

interface CartItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price?: number;
  total?: number;
  product?: {
    id: number;
    name: string;
    detail: string;
    price: string;
  };
}

interface CartData {
  id: number;
  user_id: number;
  items: CartItem[];
  payable_amount: number;
}

interface Product {
  id: number;
  name: string;
  detail: string;
  price: number;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [localQuantities, setLocalQuantities] = useState<{[key: number]: number}>({});
  const router = useRouter();

  // Fetch products from the backend
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `http://household.test/api/products?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data.data);
      setAllProducts((prev) => [...prev, ...data.data.data]);
      setTotalPages(data.data.last_page);
      setCurrentPage(data.data.current_page);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://household.test/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      if (data.data && data.data.cart_data) {
        setCartData(data.data.cart_data);
        const cartItems = data.data.cart_data.items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
          total: parseFloat(item.total),
          product: item.product
        }));
        setCart(cartItems);
        
        // Initialize local quantities
        const quantities: {[key: number]: number} = {};
        cartItems.forEach((item: CartItem) => {
          quantities[item.product_id] = item.quantity;
        });
        setLocalQuantities(quantities);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // Sync cart with backend
  const syncCartWithBackend = async (cartItems: CartItem[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
  
      const response = await fetch("http://household.test/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          products: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to sync cart with backend");
      }
  
      // Update cart with backend response
      if (data.data && data.data.cart_data) {
        // The response structure is different for add/update vs get cart
        // For add/update, cart_data is an array, not an object with items
        const updatedCart = Array.isArray(data.data.cart_data) 
          ? data.data.cart_data.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: parseInt(item.quantity),
              unit_price: parseFloat(item.unit_price),
              total: parseFloat(item.total),
              // Product info might not be included in the response
              product: allProducts.find(p => p.id === item.product_id) || undefined
            }))
          : data.data.cart_data.items.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: parseInt(item.quantity),
              unit_price: parseFloat(item.unit_price),
              total: parseFloat(item.total),
              product: item.product
            }));
  
        setCart(updatedCart);
        
        // Update local quantities
        const quantities: {[key: number]: number} = {};
        updatedCart.forEach((item: CartItem) => {
          quantities[item.product_id] = item.quantity;
        });
        setLocalQuantities(quantities);
  
        // If we have the full cart data (from get cart), set it
        if (data.data.cart_data.payable_amount !== undefined) {
          setCartData(data.data.cart_data);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to sync cart with backend");
    }
  };

  // Update cart state from backend response
  const updateCartState = (cartData: any) => {
    setCartData(cartData);
    const cartItems = cartData.items.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
      total: parseFloat(item.total),
      product: item.product
    }));
    setCart(cartItems);
    
    // Update local quantities
    const quantities: {[key: number]: number} = {};
    cartItems.forEach((item: CartItem) => {
      quantities[item.product_id] = item.quantity;
    });
    setLocalQuantities(quantities);
  };

  // Add product to cart
  const addToCart = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }
  
    // Use the current local quantity if available
    const finalQuantity = localQuantities[productId] || quantity;
  
    const existingProduct = cart.find((item) => item.product_id === productId);
  
    let updatedCart;
    if (existingProduct) {
      // Update quantity if product already exists in cart
      updatedCart = cart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: finalQuantity }
          : item
      );
    } else {
      // Add new product to cart
      updatedCart = [...cart, { product_id: productId, quantity: finalQuantity }];
    }
  
    await syncCartWithBackend(updatedCart);
  };

  // Update local quantity state
  const updateLocalQuantity = (productId: number, value: number) => {
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://household.test/api/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item from cart");
      }

      // Update cart with backend response
      if (data.data && data.data.cart_data) {
        updateCartState(data.data.cart_data);
      }
    } catch (err) {
      setError(err.message || "Failed to remove item from cart");
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://household.test/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      // Clear cart state
      setCart([]);
      setCartData(null);
      setLocalQuantities({});
      setApiResponse("Cart cleared successfully");
    } catch (err) {
      setError(err.message || "Failed to clear cart");
    }
  };

  // Submit cart to place order
  const submitCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://household.test/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: cart }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data.message || "Order placed successfully!");
        setCart([]); // Clear the cart after successful submission
        setLocalQuantities({}); // Clear local quantities
        setCartData(null); // Clear cart data
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (err) {
      setApiResponse(err.message || "Failed to place order. Please try again.");
    }
  };

  // Fetch products and cart when the page loads or when the page number changes
  useEffect(() => {
    fetchProducts(currentPage);
    fetchCart();
  }, [currentPage]);

  // Calculate total price and quantity
  const totalPrice = cartData?.payable_amount || cart.reduce(
    (total, item) => total + (item.total || 0),
    0
  );
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Product List</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {apiResponse && <p className="text-green-500 mb-4">{apiResponse}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(products) &&
                products.map((product) => {
                  const cartItem = cart.find(
                    (item) => item.product_id === product.id
                  );
                  const quantity = localQuantities[product.id] || 1;

                  return (
                    <div
                      key={product.id}
                      className="bg-white p-6 rounded-lg shadow-md"
                    >
                      <h2 className="text-xl font-semibold mb-2">
                        {product.name}
                      </h2>
                      <p className="text-gray-600 mb-4">{product.detail}</p>
                      <p className="text-lg font-bold">${product.price}</p>
                      <div className="flex items-center mt-4">
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              updateLocalQuantity(product.id, value);
                            }
                          }}
                          className="w-16 px-2 py-1 border rounded-lg mr-2"
                        />
                        <button
                          onClick={() => addToCart(product.id, quantity)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          {cartItem ? "Update Cart" : "Add to Cart"}
                        </button>
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
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 border border-blue-500"
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
            isCartOpen ? "w-96" : "w-24"
          } transition-all duration-300`}
        >
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          >
            {isCartOpen ? "✕" : `🛒 ${totalQuantity}`}
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
                      const product = item.product || allProducts.find(
                        (p) => p.id === item.product_id
                      );
                      return (
                        <li key={item.id || item.product_id} className="mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{product?.name}</h3>
                              <p>Quantity: {item.quantity}</p>
                              <p>
                                Price: ${item.unit_price?.toFixed(2)} × {item.quantity} = ${item.total?.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id!)}
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
                    <p className="font-bold">
                      Total Price: ${totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={clearCart}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={submitCart}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Submit Cart
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}