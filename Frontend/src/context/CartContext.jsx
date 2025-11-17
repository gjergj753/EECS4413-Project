import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Hook for easy access
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        // Load from storage on startup
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage on every update
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Add new item (or increase quantity if exists)
    const addToCart = (book, qty = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.bookId === book.bookId);

            if (existing) {
                return prev.map((item) =>
                    item.bookId === book.bookId
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            }

            return [...prev, { ...book, quantity: qty }];
        });
    };

    // Remove item
    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item.bookId !== id));
    };

    // Increase quantity
    const increaseQty = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.bookId === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Decrease quantity
    const decreaseQty = (id) => {
        setCartItems((prev) =>
            prev
                .map((item) =>
                    item.bookId === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Clear cart
    const clearCart = () => setCartItems([]);

    // Total cost
    const cartTotal = cartItems
        .reduce((sum, item) => sum + (item?.price ?? 0) * item.quantity, 0)
        .toFixed(2);

    // Total item count
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                increaseQty,
                decreaseQty,
                clearCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
