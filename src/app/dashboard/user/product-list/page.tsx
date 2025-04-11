"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import "@/app/extra.css";
import { AddShoppingCart, Delete, HighlightOff, Close, ArrowForwardIos } from "@mui/icons-material";

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
  const [localQuantities, setLocalQuantities] = useState<{
    [key: number]: number;
  }>({});
  const router = useRouter();

  // Fetch products from the backend
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?page=${page}`,
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
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
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
          product: item.product,
        }));
        setCart(cartItems);

        // Initialize local quantities
        const quantities: { [key: number]: number } = {};
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
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
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
            product:
              allProducts.find((p) => p.id === item.product_id) || undefined,
          }))
          : data.data.cart_data.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unit_price),
            total: parseFloat(item.total),
            product: item.product,
          }));

        setCart(updatedCart);

        // Update local quantities
        const quantities: { [key: number]: number } = {};
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
      product: item.product,
    }));
    setCart(cartItems);

    // Update local quantities
    const quantities: { [key: number]: number } = {};
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
      updatedCart = [
        ...cart,
        { product_id: productId, quantity: finalQuantity },
      ];
    }

    await syncCartWithBackend(updatedCart);
  };

  // Update local quantity state
  const updateLocalQuantity = (productId: number, value: number) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/remove/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/clear`, {
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
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/place`, {
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
        // router.push(`/orders/${data.data.id}`);
        router.push(`/dashboard/user/orders/${data.data.id}`);
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
  const totalPrice =
    cartData?.payable_amount ||
    cart.reduce((total, item) => total + (item.total || 0), 0);
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-4 p-4">
        <div className="px-6 py-6 bg-[#2b3990] rounded-[20px] xl:rounded-[25px] text-[#fff] relative">
          <h1 className="text-2xl font-bold my-0">Order Products</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Product List" }]}
          />

          <div
            className="absolute top-[10px] right-[10px] z-40 bg-[#fff] p-[10px] rounded-[15px] cursor-pointer"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            {isCartOpen ? (
              <AddShoppingCart />
            ) : (
              <div className="flex items-center gap-1 relative">
                <AddShoppingCart className="text-[#000]" />
                <div className="absolute top-[-12px] left-[-12px] w-[18px] h-[18px] bg-[#c00] rounded-full flex items-center justify-center">
                  <p className="text-xs my-0 text-[#fff]">{totalQuantity}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {apiResponse && <p className="text-green-500 mb-4">{apiResponse}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-[10px] xl:gap-[15px] relative h-[75vh] overflow-hidden">

              <div className="lg:col-span-5 overflow-y-auto rashnItems">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[10px] xl:gap-[15px]">
                  {Array.isArray(products) &&
                    products.map((product) => {
                      const cartItem = cart.find(
                        (item) => item.product_id === product.id
                      );
                      const quantity = localQuantities[product.id] || 1;

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-[20px] overflow-hidden border-[1px] border-[#2b3990] border-opacity-40"
                        >
                          <div className="bg-[#f9f9f9] rounded-t-lg overflow-hidden h-[150px] w-full">
                            <img
                              src={product.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${product.image}` : "/images/items/atta.webp"} 
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/items/atta.webp";
                              }}
                            />
                          </div>
                          <div className="py-2 px-3">
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-semibold my-0 capitalize">
                                {product.name}
                              </h2>
                              <p className="my-0 text-xs">Flour</p>
                            </div>
                            <div className="flex items-center justify-end">
                              <p className="my-0 text-sm font-semibold">1 kg</p>
                            </div>
                            <p className="text-xl font-semibold">
                              {product.price}{" "}
                              <span className="pl-[2px] text-sm font-normal">
                                Rs
                              </span>
                            </p>
                            <div className="grid grid-cols-2 gap-[5px] mt-4">
                              <div className="flex items-center justify-center w-[90px] h-8 px-1 relative">
                                <button
                                  onClick={() =>
                                    quantity > 1 &&
                                    updateLocalQuantity(product.id, quantity - 1)
                                  }
                                  className="flex items-center justify-center text-[12px] absolute top-1/2 -translate-y-1/2 left-[0px] w-[18px] h-[18px] rounded-md bg-[#000] text-white hover:bg-[#00aeef] duration-200 transition-all ease-in-out"
                                >
                                  -
                                </button>

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
                                  className="w-14 ml-[5px] text-center text-xl outline-none border-none bg-transparent"
                                />

                                <button
                                  onClick={() =>
                                    updateLocalQuantity(product.id, quantity + 1)
                                  }
                                  className="flex items-center justify-center text-[12px] absolute top-1/2 -translate-y-1/2 right-[10px] w-[18px] h-[18px] rounded-md bg-[#000] text-white hover:bg-[#00aeef] duration-200 transition-all ease-in-out"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={() => addToCart(product.id, quantity)}
                                  className="bg-blue-400 text-white px-3 py-1 rounded-xl hover:bg-blue-700"
                                >
                                  <AddShoppingCart className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
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
                      className={`mx-1 px-4 py-2 rounded ${currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white text-blue-500 border border-blue-500"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-200 rounded-[15px] px-6 py-0 relative lg:col-span-2 overflow-y-auto rashnItems">
                <div>
                  <div className="flex justify-between items-center mt-4">
                    <h2 className="text-xl font-bold my-0">Cart Items</h2>
                    <Delete
                      onClick={clearCart} className="text-[#c00] cursor-pointer w-3 h-3" />
                  </div>
                  {cart.length === 0 ? (
                    <p>Your cart is empty.</p>
                  ) : (
                    <>
                      <div className="flex justify-end my-2">
                        <div className="text-right">
                          <p className="font-semibold text-xl"><span className="text-sm font-normal pr-[10px]">Total Price </span> {totalPrice.toFixed(0)} <span className="text-xs pl-[2px]">Rs </span>
                          </p>
                          <div className="flex justify-end">
                            <p className="font-semibold text-xs uppercase py-[1px] px-[10px] rounded-[5px] text-[#fff] bg-[#2b3990]">Items: {totalQuantity}</p>
                          </div>
                        </div>
                      </div>

                      <ul className="overflow-y-auto">
                        {cart.map((item) => {
                          console.log("Cart Item:", item);
                          const product =
                            item.product ||
                            allProducts.find((p) => p.id === item.product_id);
                          return (
                            <li key={item.id || item.product_id} className="mb-2 p-[10px] rounded-[15px] bg-[#fff] relative w-full flex items-center gap-[10px]">
                              <div className="">
                                <div className="w-[50px] rounded-lg h-full overflow-hidden"><img
                                  src={
                                    item.product?.image 
                                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${item.product.image}` 
                                      : "/images/items/atta.webp"
                                  } 
                                  alt={item.product?.name || "Product image"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/images/items/atta.webp";
                                  }}
                                />
                                </div>
                              </div>
                              <div className="w-full">
                                <div>
                                  <h3 className="font-semibold capitalize">{product?.name} <span className="text-sm font-normal pl-[15px] lowercase">x {item.quantity}</span></h3>
                                  <div className="pt-[4px] flex justify-between items-center">
                                    <p className="font-semibold">
                                      {item.total}
                                      <span className="pl-[4px] text-xs font-normal">
                                        Rs
                                      </span>
                                    </p>
                                    <p className="my-0 text-sm px-[10px] bg-[#2b3990] rounded-[5px] text-[#fff]">
                                      {item.unit_price} <span className="text-xs pl-[3px] font-semibold">Per - {item.product?.measure ?? "Unit"}</span>
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id!)}
                                  className="text-[#c00] hover:text-[#000] absolute top-[5px] right-[5px] cursor-pointer duration-200 ease-in-out transition-all w-[18px] h-[18px] flex items-center justify-center overflow-hidden"
                                >
                                  <Close className="p-1" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={submitCart}
                          className="bg-green-400 text-white px-8 py-2 rounded-[10px] hover:bg-green-700 text-sm uppercase font-semibold"
                        >
                          Submit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      {/* Cart */}
      <div
        className={`w-[30%] xl:w-[25%] 2xl:w-[20%] h-screen z-50 fixed top-0 right-0 bg-gray-200 p-6 overflow-y-auto transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-[120%]"
          }`}
      >
        {/* Absolute Close */}
        <div className="absolute top-[5px] left-0 w-[30px] h-[30px] bg-[#2b3990] flex items-center justify-center cursor-pointer duration-300 ease-in-out transition-all hover:bg-[#00aeef] rounded-r-[10px]">
          <ArrowForwardIos
            className="text-[#fff] p-[3px] my-0"
            onClick={() => setIsCartOpen(!isCartOpen)}
          />
        </div>

        <h2 className="text-xl font-bold my-4">Cart Items</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="flex justify-end my-2">
              <div className="text-right">
                <p className="font-semibold text-xl"><span className="text-sm font-normal pr-[10px]">Total Price </span> {totalPrice.toFixed(0)} <span className="text-xs pl-[2px]">Rs </span>
                </p>
                <div className="flex justify-end">
                  <p className="font-semibold text-xs uppercase py-[1px] px-[10px] rounded-[5px] text-[#fff] bg-[#2b3990]">Items: {totalQuantity}</p>
                </div>
              </div>
            </div>

            <ul className="overflow-y-auto">
              {cart.map((item) => {
                const product =
                  item.product ||
                  allProducts.find((p) => p.id === item.product_id);
                return (
                  <li key={item.id || item.product_id} className="mb-2 p-[10px] rounded-[15px] bg-[#fff] relative w-full flex items-center gap-[10px]">
                    <div className="">
                      <div className="w-[50px] rounded-lg h-full overflow-hidden"><img
                       src={
                        item.product?.image 
                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL_PUBLIC}${item.product.image}` 
                          : "/images/items/atta.webp"
                      } 
                      alt={item.product?.name || "Product image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/items/atta.webp";
                      }}
                      />
                      </div>
                    </div>
                    <div className="w-full">
                      <div>
                        <h3 className="font-semibold capitalize">{product?.name} <span className="text-sm font-normal pl-[15px] lowercase">x {item.quantity}</span></h3>
                        <div className="pt-[4px] flex justify-between items-center">
                          <p className="font-semibold">
                            {item.total}
                            <span className="pl-[4px] text-xs font-normal">
                              Rs
                            </span>
                          </p>
                          <p className="my-0 text-sm px-[10px] bg-[#2b3990] rounded-[5px] text-[#fff]">
                            {item.unit_price} <span className="text-xs pl-[3px] font-semibold">Per - {item.product?.measure ?? "Unit"}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id!)}
                        className="text-[#c00] hover:text-[#000] absolute top-[5px] right-[5px] cursor-pointer duration-200 ease-in-out transition-all w-[18px] h-[18px] flex items-center justify-center overflow-hidden"
                      >
                        <Close className="p-1" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-end mb-4">
              <button
                onClick={submitCart}
                className="bg-green-400 text-white px-8 py-2 rounded-[10px] hover:bg-green-700 text-sm uppercase font-semibold"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
