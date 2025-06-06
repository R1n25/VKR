    // Функция для оформления заказа
    const handleCheckout = async () => {
        setIsProcessing(true);
        setError('');
        
        try {
            // Получаем данные корзины
            const cartItems = getCartItems();
            
            if (!cartItems.length) {
                setError('Корзина пуста');
                setIsProcessing(false);
                return;
            }
            
            // Формируем данные для отправки
            const orderData = {
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                delivery_method: formData.deliveryMethod,
                delivery_address: formData.deliveryMethod === 'delivery' ? formData.address : null,
                payment_method: formData.paymentMethod,
                comment: formData.comment,
                items: cartItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                }))
            };
            
            // Отправляем запрос на создание заказа
            const response = await axios.post('/api/orders', orderData);
            
            if (response.data && response.data.success) {
                // Очищаем корзину
                clearCart();
                
                // Отправляем событие обновления количества товаров
                cartItems.forEach(item => {
                    const productUpdatedEvent = new CustomEvent('productUpdated', {
                        detail: { 
                            productId: item.id,
                            action: 'checkout',
                            quantity: item.quantity,
                            orderId: response.data.order.id
                        },
                        bubbles: true
                    });
                    window.dispatchEvent(productUpdatedEvent);
                });
                
                // Перенаправляем на страницу успешного оформления заказа
                router.visit(route('checkout.success', { order_id: response.data.order.id }));
            } else {
                setError('Не удалось оформить заказ. Попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            
            if (error.response && error.response.data) {
                if (error.response.data.error === 'Недостаточно товара на складе') {
                    setError(`Недостаточно товара "${error.response.data.part_name}" на складе. Доступно: ${error.response.data.available}, запрошено: ${error.response.data.requested}`);
                } else {
                    setError(error.response.data.message || 'Не удалось оформить заказ. Попробуйте еще раз.');
                }
            } else {
                setError('Не удалось оформить заказ. Попробуйте еще раз.');
            }
        } finally {
            setIsProcessing(false);
        }
    }; 