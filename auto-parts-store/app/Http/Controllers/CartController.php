<?php

namespace App\Http\Controllers;

use App\Http\Requests\CartItemRequest;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Показать корзину пользователя
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $cartData = $this->cartService->getCartWithItems();
        
        return Inertia::render('Cart/Index', [
            'cart' => $cartData['cart'],
            'cartItems' => $cartData['items'],
        ]);
    }

    /**
     * Добавить товар в корзину
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'spare_part_id' => 'required|integer|exists:spare_parts,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = $this->cartService->addToCart(
            $request->spare_part_id,
            $request->quantity
        );

        return response()->json([
            'message' => 'Товар добавлен в корзину',
            'cart_item' => $cartItem,
            'cart_count' => $this->cartService->getCartItemsCount(),
        ]);
    }

    /**
     * Удалить товар из корзины
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromCart(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required|integer|exists:cart_items,id',
        ]);

        $result = $this->cartService->removeFromCart($request->cart_item_id);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Товар удален из корзины' : 'Не удалось удалить товар',
            'cart_count' => $this->cartService->getCartItemsCount(),
        ]);
    }

    /**
     * Обновить количество товара в корзине
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'cart_item_id' => 'required|integer|exists:cart_items,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $cartItem = $this->cartService->updateCartItemQuantity(
            $request->cart_item_id,
            $request->quantity
        );

        return response()->json([
            'success' => true,
            'cart_item' => $cartItem,
            'cart_count' => $this->cartService->getCartItemsCount(),
        ]);
    }

    /**
     * Очистить корзину
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart()
    {
        $result = $this->cartService->clearCart();

        return response()->json([
            'success' => $result,
            'message' => 'Корзина очищена',
            'cart_count' => 0,
        ]);
    }

    /**
     * Получить количество товаров в корзине
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCartCount()
    {
        $cartCount = $this->cartService->getCartItemsCount();

        return response()->json([
            'cart_count' => $cartCount,
        ]);
    }
}
