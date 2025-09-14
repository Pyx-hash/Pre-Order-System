   document.addEventListener('DOMContentLoaded', function() {
            // Sample product data
            let products = [
                { id: 1, name: 'Pizza Margherita', price: 12.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fa0530ba-f553-4c3f-8846-4281a52b461b.png' },
                { id: 2, name: 'Burger Classic', price: 8.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fa6b0395-dd8d-4e1e-ae61-09668b543f8d.png' },
                { id: 3, name: 'Fresh Salad', price: 6.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/66665a23-135f-4e0f-89ca-e0f0034da117.png' },
                { id: 4, name: 'Pasta Carbonara', price: 10.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f79c8ee0-e8e5-45bf-a814-d36c398723d4.png' },
                { id: 5, name: 'Ice Cream', price: 4.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7c4b0953-e207-48bc-8033-b77f625f64b6.png' },
                { id: 6, name: 'Soft Drink', price: 2.99, image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1bea0756-537e-4121-ac96-316fb471cd73.png' }
            ];

            let cart = [];
            let orders = [];

            // Initialize the app
            function init() {
                renderProducts();
                loadOrders();
                setupEventListeners();
            }

            // Render products to the product grid
            function renderProducts() {
                const productList = document.getElementById('product-list');
                productList.innerHTML = '';
                
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="product-img">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">₱${product.price.toFixed(2)}</div>
                        </div>
                    `;
                    productCard.addEventListener('click', () => addToCart(product));
                    productList.appendChild(productCard);
                });
            }

            // Add product to cart
            function addToCart(product) {
                const existingItem = cart.find(item => item.id === product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                }
                
                renderCart();
                showNotification('Product added to cart', 'success');
            }

            // Render cart items
            function renderCart() {
                const cartItems = document.getElementById('cart-items');
                const cartTotal = document.getElementById('cart-total');
                
                cartItems.innerHTML = '';
                let total = 0;
                
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">₱${item.price.toFixed(2)} each</div>
                        </div>
                        <div class="item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                        <div class="item-total">₱${itemTotal.toFixed(2)}</div>
                    `;
                    
                    cartItems.appendChild(cartItem);
                });
                
                cartTotal.textContent = `₱${total.toFixed(2)}`;
                
                // Add event listeners to quantity buttons
                document.querySelectorAll('.decrease').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        decreaseQuantity(id);
                    });
                });
                
                document.querySelectorAll('.increase').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id);
                        increaseQuantity(id);
                    });
                });
            }

            // Decrease item quantity
            function decreaseQuantity(id) {
                const item = cart.find(item => item.id === id);
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    cart = cart.filter(item => item.id !== id);
                }
                renderCart();
            }

            // Increase item quantity
            function increaseQuantity(id) {
                const item = cart.find(item => item.id === id);
                item.quantity += 1;
                renderCart();
            }

            // Process checkout
            function checkout() {
                if (cart.length === 0) {
                    showNotification('Cart is empty. Add products before checkout.', 'error');
                    return;
                }
                
                const customerName = document.getElementById('customer-name').value;
                const customerPhone = document.getElementById('customer-phone').value;
                const customerEmail = document.getElementById('customer-email').value;
                const paymentMethod = document.getElementById('payment-method').value;
                
                if (!customerName || !customerPhone) {
                    showNotification('Please enter customer name and phone number', 'error');
                    return;
                }
                
                // Create order
                const order = {
                    id: Date.now(),
                    date: new Date().toLocaleString(),
                    customer: { name: customerName, phone: customerPhone, email: customerEmail },
                    items: [...cart],
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    paymentMethod: paymentMethod
                };
                
                orders.push(order);
                saveOrders();
                
                // Send notifications
                sendSMS(order);
                sendEmail(order);
                
                // Print receipt
                printReceipt(order);
                
                // Clear cart
                cart = [];
                renderCart();
                
                // Clear form
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-phone').value = '';
                document.getElementById('customer-email').value = '';
                
                showNotification('Order processed successfully! Receipt printed.', 'success');
            }

            // Send SMS notification
            function sendSMS(order) {
                // In a real implementation, this would connect to an SMS gateway API
                console.log(`SMS sent to ${order.customer.phone}: Your order #${order.id} has been received. Total: ₱${order.total.toFixed(2)}`);
                showNotification(`SMS sent to ${order.customer.phone}`, 'success');
            }

            // Send Email notification
            function sendEmail(order) {
                // In a real implementation, this would connect to an email service API
                if (order.customer.email) {
                    console.log(`Email sent to ${order.customer.email}: Your order #${order.id} has been received. Total: ₱${order.total.toFixed(2)}`);
                    showNotification(`Email sent to ${order.customer.email}`, 'success');
                }
            }

            // Print receipt
            function printReceipt(order) {
                // In a real implementation, this would format and print a receipt
                console.log('Printing receipt for order:', order);
                
                // For demo purposes, we'll show the receipt in a new window
                const receiptWindow = window.open('', '_blank');
                receiptWindow.document.write(`
                    <html>
                    <head>
                        <title>Receipt #${order.id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .order-info { margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                            .total { font-weight: bold; font-size: 18px; }
                            .footer { margin-top: 30px; text-align: center; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>PRE-ORDER RECEIPT</h1>
                            <p>Order #${order.id}</p>
                            <p>${order.date}</p>
                        </div>
                        
                        <div class="order-info">
                            <p><strong>Customer:</strong> ${order.customer.name}</p>
                            <p><strong>Phone:</strong> ${order.customer.phone}</p>
                            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        </div>
                        
                        <table>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td colspan="3" class="total">Total</td>
                                <td class="total">$${order.total.toFixed(2)}</td>
                            </tr>
                        </table>
                        
                        <div class="footer">
                            <p>Thank you for your order!</p>
                            <p>Please visit again</p>
                        </div>
                    </body>
                    </html>
                `);
                
                receiptWindow.document.close();
                receiptWindow.print();
            }

            // Export to Excel
            function exportToExcel() {
                if (orders.length === 0) {
                    showNotification('No orders to export', 'error');
                    return;
                }
                
                try {
                    // Format orders for Excel
                    const data = orders.map(order => ({
                        'Order ID': order.id,
                        'Date': order.date,
                        'Customer Name': order.customer.name,
                        'Customer Phone': order.customer.phone,
                        'Customer Email': order.customer.email || '',
                        'Total Amount': order.total,
                        'Payment Method': order.paymentMethod
                    }));
                    
                    // Create worksheet
                    const worksheet = XLSX.utils.json_to_sheet(data);
                    
                    // Create workbook
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
                    
                    // Generate Excel file and trigger download
                    XLSX.writeFile(workbook, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
                    
                    showNotification('Orders exported to Excel successfully', 'success');
                } catch (error) {
                    console.error('Error exporting to Excel:', error);
                    showNotification('Error exporting to Excel', 'error');
                }
            }

            // Save orders to localStorage
            function saveOrders() {
                localStorage.setItem('pos-orders', JSON.stringify(orders));
                loadOrders(); // Refresh order history
            }

            // Load orders from localStorage
            function loadOrders() {
                const savedOrders = localStorage.getItem('pos-orders');
                if (savedOrders) {
                    orders = JSON.parse(savedOrders);
                }
                
                renderOrderHistory();
            }

            // Render order history
            function renderOrderHistory() {
                const orderHistory = document.getElementById('order-history');
                orderHistory.innerHTML = '';
                
                // Show latest 5 orders
                const recentOrders = [...orders].reverse().slice(0, 5);
                
                if (recentOrders.length === 0) {
                    orderHistory.innerHTML = '<p class="text-center">No recent orders</p>';
                    return;
                }
                
                recentOrders.forEach(order => {
                    const orderItem = document.createElement('div');
                    orderItem.className = 'order-item';
                    orderItem.innerHTML = `
                        <div class="order-header">
                            <span class="order-id">Order #${order.id}</span>
                            <span class="order-date">${order.date}</span>
                        </div>
                        <div class="order-details">
                            <div>Customer: ${order.customer.name}</div>
                            <div>Total: ₱${order.total.toFixed(2)}</div>
                        </div>
                    `;
                    orderHistory.appendChild(orderItem);
                });
            }

            // Show notification
            function showNotification(message, type) {
                const notifications = document.getElementById('notifications');
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span>${message}</span>
                `;
                
                notifications.appendChild(notification);
                
                // Remove notification after 5 seconds
                setTimeout(() => {
                    notification.remove();
                }, 5000);
            }

            // Setup event listeners
            function setupEventListeners() {
                // Checkout button
                document.getElementById('checkout-btn').addEventListener('click', checkout);
                
                // Clear cart button
                document.getElementById('clear-cart').addEventListener('click', () => {
                    cart = [];
                    renderCart();
                    showNotification('Cart cleared', 'success');
                });
                
                // Save order button
                document.getElementById('save-order').addEventListener('click', () => {
                    if (cart.length === 0) {
                        showNotification('Cart is empty', 'error');
                        return;
                    }
                    
                    const order = {
                        id: Date.now(),
                        date: new Date().toLocaleString(),
                        items: [...cart],
                        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                    
                    orders.push(order);
                    saveOrders();
                    
                    cart = [];
                    renderCart();
                    
                    showNotification('Order saved successfully', 'success');
                });
                
                // Export to Excel button
                document.getElementById('export-excel').addEventListener('click', exportToExcel);
                
                // Print receipt button
                document.getElementById('print-receipt').addEventListener('click', () => {
                    if (cart.length === 0) {
                        showNotification('Cart is empty', 'error');
                        return;
                    }
                    
                    const order = {
                        id: Date.now(),
                        date: new Date().toLocaleString(),
                        items: [...cart],
                        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    };
                    
                    printReceipt(order);
                });
                
                // Test SMS button
                document.getElementById('test-sms').addEventListener('click', () => {
                    showNotification('SMS functionality would be implemented with a real SMS gateway API', 'success');
                });
                
                // Test Email button
                document.getElementById('test-email').addEventListener('click', () => {
                    showNotification('Email functionality would be implemented with a real email service API', 'success');
                });
                
                // QR Scanner button
                document.getElementById('scan-qr').addEventListener('click', () => {
                    showNotification('QR Scanner would open camera for payment scanning', 'success');
                });
                
                // Image upload
                document.getElementById('image-upload').addEventListener('click', () => {
                    document.getElementById('product-image').click();
                });
                
                // Save product button
                document.getElementById('save-product').addEventListener('click', () => {
                    const name = document.getElementById('product-name').value;
                    const price = parseFloat(document.getElementById('product-price').value);
                    const imageInput = document.getElementById('product-image');
                    
                    if (!name || !price) {
                        showNotification('Please enter product name and price', 'error');
                        return;
                    }
                    
                    // In a real implementation, we would upload the image and get a URL
                    const imageUrl = imageInput.files.length > 0 
                        ? URL.createObjectURL(imageInput.files[0]) 
                        : 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f18e1518-fa26-4b80-b65e-03f81919805a.png';
                    
                    const newProduct = {
                        id: Date.now(),
                        name: name,
                        price: price,
                        image: imageUrl
                    };
                    
                    products.push(newProduct);
                    renderProducts();
                    
                    // Clear form
                    document.getElementById('product-name').value = '';
                    document.getElementById('product-price').value = '';
                    imageInput.value = '';
                    
                    showNotification('Product added successfully', 'success');
                });
                
                // Tab switching
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Remove active class from all tabs
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        // Add active class to clicked tab
                        tab.classList.add('active');
                        
                        // Hide all tab content
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.classList.remove('active');
                        });
                        
                        // Show the corresponding tab content
                        const tabId = tab.dataset.tab;
                        document.getElementById(`${tabId}-tab`).classList.add('active');
                    });
                });
            }

            // Initialize the application
            init();
        });