import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
    getCartByUserId,
    createCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    clearCart as apiClearCart,
} from "../api/cartApi";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Generate temporary ID for guest cart items
const generateId = () =>
    crypto?.randomUUID?.() || Math.floor(Math.random() * 1_000_000_000);

export function CartProvider({ children }) {
    const { user } = useAuth();

    const userId = user?.userId ?? null;
    const authToken = user?.authToken ?? null;

    const [cartItems, setCartItems] = useState([]);

    //----------------------------------------------------------
    // LOAD CART (Backend if logged in, localStorage if guest)
    //----------------------------------------------------------
    useEffect(() => {
        if (!userId || !authToken) {
            // Load guest cart
            const stored = localStorage.getItem("cart");
            const items = stored ? JSON.parse(stored) : [];

            setCartItems(
                items.map((i) => ({
                    cartItemId: i.cartItemId || generateId(),
                    book: i.book,
                    quantity: i.quantity,
                }))
            );

            return;
        }

        // Logged-in user → load backend cart
        (async () => {
            try {
                const res = await getCartByUserId(userId, authToken);
                setCartItems(res?.cart?.cartItemList ?? []);
            } catch (err) {
                console.warn("Cart not found → creating one automatically");

                try {
                    const created = await createCart(userId, authToken);
                    setCartItems(created?.cart?.cartItemList ?? []);
                } catch (innerErr) {
                    console.error("Failed to create cart:", innerErr);
                }
            }
        })();
    }, [userId, authToken]);

    //----------------------------------------------------------
    // Handle forced reload after login merge
    //----------------------------------------------------------
    useEffect(() => {
        const flag = localStorage.getItem("forceReloadCart");

        if (userId && authToken && flag === "1") {
            (async () => {
                try {
                    const res = await getCartByUserId(userId, authToken);
                    setCartItems(res?.cart?.cartItemList ?? []);
                } catch (err) {
                    console.error("Forced reload failed:", err);
                }
                localStorage.removeItem("forceReloadCart");
            })();
        }
    }, [userId, authToken]);

    //----------------------------------------------------------
    // Save guest cart to localStorage
    //----------------------------------------------------------
    useEffect(() => {
        if (!userId) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems, userId]);

    //----------------------------------------------------------
    // ADD TO CART
    //----------------------------------------------------------
    const addToCart = async (book, qty = 1) => {
        if (userId && authToken) {
            const res = await addItemToCart(
                userId,
                book.bookId,
                qty,
                authToken
            );
            setCartItems(res?.cart?.cartItemList ?? []);
        } else {
            setCartItems((prev) => {
                const existing = prev.find(
                    (i) => i.book.bookId === book.bookId
                );

                if (existing) {
                    return prev.map((i) =>
                        i.book.bookId === book.bookId
                            ? { ...i, quantity: i.quantity + qty }
                            : i
                    );
                }

                return [
                    ...prev,
                    {
                        cartItemId: generateId(),
                        book: {
                            bookId: book.bookId,
                            title: book.title,
                            author: book.author,
                            price: book.price,
                            imageUrl: book.imageUrl,
                        },
                        quantity: qty,
                    },
                ];
            });
        }
    };

    //----------------------------------------------------------
    // REMOVE ITEM
    //----------------------------------------------------------
    const removeFromCart = async (bookId, cartItemId) => {
        if (userId && authToken) {
            const res = await removeItemFromCart(
                userId,
                cartItemId,
                authToken
            );
            setCartItems(res?.cart?.cartItemList ?? []);
        } else {
            setCartItems((prev) =>
                prev.filter((i) => i.cartItemId !== cartItemId)
            );
        }
    };

    //----------------------------------------------------------
    // INCREASE QUANTITY
    //----------------------------------------------------------
    const increaseQty = async (bookId, cartItemId) => {
        const item = cartItems.find((i) => i.cartItemId === cartItemId);
        if (!item) return;

        if (userId && authToken) {
            const res = await updateCartItemQuantity(
                userId,
                cartItemId,
                item.quantity + 1,
                authToken
            );
            setCartItems(res?.cart?.cartItemList ?? []);
        } else {
            setCartItems((prev) =>
                prev.map((i) =>
                    i.cartItemId === cartItemId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            );
        }
    };

    //----------------------------------------------------------
    // DECREASE QUANTITY
    //----------------------------------------------------------
    const decreaseQty = async (bookId, cartItemId) => {
        const item = cartItems.find((i) => i.cartItemId === cartItemId);
        if (!item) return;

        const newQty = item.quantity - 1;

        if (userId && authToken) {
            if (newQty <= 0) {
                const res = await removeItemFromCart(
                    userId,
                    cartItemId,
                    authToken
                );
                setCartItems(res?.cart?.cartItemList ?? []);
            } else {
                const res = await updateCartItemQuantity(
                    userId,
                    cartItemId,
                    newQty,
                    authToken
                );
                setCartItems(res?.cart?.cartItemList ?? []);
            }
        } else {
            if (newQty <= 0) {
                setCartItems((prev) =>
                    prev.filter((i) => i.cartItemId !== cartItemId)
                );
            } else {
                setCartItems((prev) =>
                    prev.map((i) =>
                        i.cartItemId === cartItemId
                            ? { ...i, quantity: newQty }
                            : i
                    )
                );
            }
        }
    };

    //----------------------------------------------------------
    // CLEAR CART
    //----------------------------------------------------------
    const clearCart = async () => {
        if (userId && authToken) {
            const res = await apiClearCart(userId, authToken);
            setCartItems(res?.cart?.cartItemList ?? []);
        } else {
            setCartItems([]);
        }
    };

    //----------------------------------------------------------
    // TOTALS
    //----------------------------------------------------------
    const cartTotal = cartItems
        .reduce(
            (sum, item) =>
                sum + (item.book?.price ?? 0) * item.quantity,
            0
        )
        .toFixed(2);

    const cartCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

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

