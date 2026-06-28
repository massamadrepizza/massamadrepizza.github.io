document.addEventListener('DOMContentLoaded', () => {
    // 1. Pizzas data map
    const PIZZAS = {
        margherita: {
            id: 'margherita',
            name: 'Margherita Especial',
            price: 45.00,
            img: 'assets/margherita.jpg',
            desc: 'Molho artesanal, mozzarella de búfala, manjericão fresco e azeite extra virgem.'
        },
        calabresa: {
            id: 'calabresa',
            name: 'Calabresa Artesanal',
            price: 48.00,
            img: 'assets/calabresa.jpg',
            desc: 'Molho da casa, calabresa defumada premium, cebola roxa e orégano fresco.'
        },
        quatro_queijos: {
            id: 'quatro_queijos',
            name: 'Quatro Queijos Premium',
            price: 52.00,
            img: 'assets/quatro_queijos.jpg',
            desc: 'Gorgonzola doce, provolone defumado, mozzarella e toque de mel silvestre.'
        }
    };

    // Extra toppings translation map
    const EXTRA_NAMES = {
        double_cheese: 'Mozzarella Extra',
        olives: 'Azeitonas Pretas',
        hot_honey: 'Mel Silvestre Picante',
        basil: 'Manjericão Extra'
    };

    // 2. Application State
    let cart = [];
    let deliveryMode = 'delivery'; // 'delivery' or 'pickup'
    const DELIVERY_FEE = 7.00;
    let currentPizza = null; // Pizza currently being customized

    // 3. DOM Elements
    // Cart Drawer Elements
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartDeliveryFeeEl = document.getElementById('cart-delivery-fee');
    const cartTotalEl = document.getElementById('cart-total');
    const deliveryFeeRow = document.getElementById('delivery-fee-row');
    const toggleDeliveryBtn = document.getElementById('toggle-delivery');
    const togglePickupBtn = document.getElementById('toggle-pickup');
    const cartCheckoutBtn = document.getElementById('checkout-btn');

    // Customizer Modal Elements
    const customizerModal = document.getElementById('customizer-modal');
    const customizerTitle = document.getElementById('customizer-title');
    const customizerDesc = document.getElementById('customizer-desc');
    const customizerImg = document.getElementById('customizer-img');
    const customizerForm = document.getElementById('customizer-form');
    const customizerTotalPriceEl = document.getElementById('customizer-total-price');
    const addToCartSubmitBtn = document.getElementById('add-to-cart-submit');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutAddressSection = document.getElementById('checkout-address-section');
    const checkoutPickupSection = document.getElementById('checkout-pickup-section');
    const cashChangeGroup = document.getElementById('cash-change-group');
    const checkoutTotalPriceEl = document.getElementById('checkout-total-price');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const summaryTotalLabel = document.getElementById('summary-total-label');

    // Success Modal Elements
    const successModal = document.getElementById('success-modal');
    const successOrderIdEl = document.getElementById('success-order-id');
    const successOrderTimeEl = document.getElementById('success-order-time');
    const successOrderModeEl = document.getElementById('success-order-mode');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    // Custom Order Modal Elements
    const customOrderBtn = document.getElementById('custom-order-btn');
    const customOrderModal = document.getElementById('custom-order-modal');
    const sendCustomWhatsappBtn = document.getElementById('send-custom-whatsapp-btn');
    const customOrderDetails = document.getElementById('custom-order-details');

    // 4. Cart Side Drawer Toggles
    const openCart = () => {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        renderCart();
    };

    const closeCart = () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // 5. General Modal Helper Functions
    const openModal = (modal) => {
        modal.classList.add('active');
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
    };

    // Close Modals on close button click or overlay click
    document.querySelectorAll('.close-modal-btn, .modal-overlay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target === btn || btn.tagName === 'BUTTON' || btn.closest('button')) {
                const targetModal = btn.closest('.modal-overlay');
                closeModal(targetModal);
            }
        });
    });

    // Prevent modal content click from closing the modal
    document.querySelectorAll('.modal-container').forEach(container => {
        container.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // 6. Customizer Modal Logic
    const openCustomizer = (pizzaId) => {
        currentPizza = PIZZAS[pizzaId];
        if (!currentPizza) return;

        // Reset form to defaults
        customizerForm.reset();
        
        // Remove active class on size cards, make media active
        document.querySelectorAll('.size-group .option-card').forEach(card => {
            card.classList.remove('active');
            const radio = card.querySelector('input[type="radio"]');
            if (radio.value === 'media') {
                card.classList.add('active');
                radio.checked = true;
            }
        });

        // Remove active class from checkboxes
        document.querySelectorAll('.customizer-section .checkbox-card').forEach(card => {
            card.classList.remove('active');
        });

        // Set content
        customizerTitle.textContent = `Customizar: ${currentPizza.name}`;
        customizerDesc.textContent = currentPizza.desc;
        customizerImg.src = currentPizza.img;
        customizerImg.alt = currentPizza.name;

        calculateCustomizerPrice();
        openModal(customizerModal);
    };

    // Size card selection styling and price calculation trigger
    document.querySelectorAll('.size-group .option-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.size-group .option-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            calculateCustomizerPrice();
        });
    });

    // Extras checkbox styling and price calculation trigger
    document.querySelectorAll('.customizer-section .checkbox-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const checkbox = this.querySelector('input[type="checkbox"]');
            // If they clicked the card but not directly the input, toggle it
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            if (checkbox.checked) {
                this.classList.add('active');
            } else {
                this.classList.remove('active');
            }
            calculateCustomizerPrice();
        });
    });

    // Calculate Customizer Price
    const calculateCustomizerPrice = () => {
        if (!currentPizza) return 0;

        let total = currentPizza.price;

        // Size price modifier
        const sizeInput = customizerForm.querySelector('input[name="pizza-size"]:checked');
        if (sizeInput) {
            total += parseFloat(sizeInput.getAttribute('data-price-mod'));
        }

        // Extras price additions
        const extrasInputs = customizerForm.querySelectorAll('input[name="pizza-extras"]:checked');
        extrasInputs.forEach(input => {
            total += parseFloat(input.getAttribute('data-price'));
        });

        customizerTotalPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        return total;
    };

    // Hook up changes in the form to trigger live calculations
    customizerForm.addEventListener('change', calculateCustomizerPrice);

    // Submit customization and add to cart
    addToCartSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const sizeInput = customizerForm.querySelector('input[name="pizza-size"]:checked');
        const size = sizeInput.value;
        const sizeLabel = sizeInput.closest('.option-card').querySelector('.option-title').textContent.split(' ')[0];

        const extras = [];
        const extrasInputs = customizerForm.querySelectorAll('input[name="pizza-extras"]:checked');
        extrasInputs.forEach(input => {
            extras.push({
                value: input.value,
                name: EXTRA_NAMES[input.value],
                price: parseFloat(input.getAttribute('data-price'))
            });
        });

        const notes = document.getElementById('pizza-notes').value.trim();
        const singlePrice = calculateCustomizerPrice();

        const cartItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            pizzaId: currentPizza.id,
            name: `${currentPizza.name} (${sizeLabel})`,
            basePrice: currentPizza.price,
            size: size,
            extras: extras,
            notes: notes,
            quantity: 1,
            singlePrice: singlePrice
        };

        // Check if an identical customized item is already in the cart
        const existingItem = cart.find(item => 
            item.pizzaId === cartItem.pizzaId &&
            item.size === cartItem.size &&
            JSON.stringify(item.extras.map(e => e.value).sort()) === JSON.stringify(cartItem.extras.map(e => e.value).sort()) &&
            item.notes === cartItem.notes
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(cartItem);
        }

        closeModal(customizerModal);
        openCart();
    });

    // Bind cardapio buttons to open customizer
    document.querySelectorAll('.pizza-card .buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.pizza-card');
            const pizzaId = card.getAttribute('data-pizza-id');
            openCustomizer(pizzaId);
        });
    });

    // 7. Cart Drawer Operations
    // Toggle Delivery vs Pickup
    const setDeliveryMode = (mode) => {
        deliveryMode = mode;
        if (mode === 'delivery') {
            toggleDeliveryBtn.classList.add('active');
            togglePickupBtn.classList.remove('active');
            deliveryFeeRow.style.display = 'flex';
            
            // Update Checkout Form
            checkoutAddressSection.style.display = 'block';
            checkoutPickupSection.style.display = 'none';
            document.getElementById('address-street').required = true;
            document.getElementById('address-neighborhood').required = true;
            summaryTotalLabel.textContent = 'Total com entrega:';
        } else {
            toggleDeliveryBtn.classList.remove('active');
            togglePickupBtn.classList.add('active');
            deliveryFeeRow.style.display = 'none';

            // Update Checkout Form
            checkoutAddressSection.style.display = 'none';
            checkoutPickupSection.style.display = 'flex';
            document.getElementById('address-street').required = false;
            document.getElementById('address-neighborhood').required = false;
            summaryTotalLabel.textContent = 'Total do pedido:';
        }
        renderCart();
    };

    toggleDeliveryBtn.addEventListener('click', () => setDeliveryMode('delivery'));
    togglePickupBtn.addEventListener('click', () => setDeliveryMode('pickup'));

    // Render Cart HTML
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        
        let subtotal = 0;
        let totalQuantity = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i data-lucide="shopping-bag" class="empty-icon"></i>
                    <p>Seu carrinho está vazio.</p>
                    <button class="btn-secondary close-cart-btn-link">Ver cardápio</button>
                </div>
            `;
            // Re-bind click event to close cart links inside the dynamic html
            cartItemsContainer.querySelector('.close-cart-btn-link').addEventListener('click', closeCart);

            cartSubtotalEl.textContent = 'R$ 0,00';
            cartTotalEl.textContent = 'R$ 0,00';
            cartCheckoutBtn.disabled = true;
            cartBadge.textContent = '0';
            cartBadge.style.transform = 'scale(0.8)';
            cartBadge.style.opacity = '0';
            return;
        }

        cartBadge.style.transform = 'scale(1)';
        cartBadge.style.opacity = '1';

        cart.forEach(item => {
            subtotal += item.singlePrice * item.quantity;
            totalQuantity += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            // Build extras list display
            let extrasText = '';
            if (item.extras.length > 0) {
                extrasText = item.extras.map(e => `+ ${e.name}`).join(', ');
            }

            // Build notes display
            let notesText = '';
            if (item.notes) {
                notesText = `Obs: "${item.notes}"`;
            }

            const pizzaData = PIZZAS[item.pizzaId];

            itemEl.innerHTML = `
                <img src="${pizzaData.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-customizations">
                        ${extrasText ? `<p>${extrasText}</p>` : ''}
                        ${notesText ? `<p style="font-style: italic;">${notesText}</p>` : ''}
                    </div>
                    <div class="cart-item-meta">
                        <div class="quantity-controller">
                            <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-price">R$ ${(item.singlePrice * item.quantity).toFixed(2).replace('.', ',')}</div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Remover</button>
                </div>
            `;

            // Setup buttons event listeners inside
            itemEl.querySelector('.inc-qty').addEventListener('click', () => {
                item.quantity += 1;
                renderCart();
            });

            itemEl.querySelector('.dec-qty').addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    cart = cart.filter(c => c.id !== item.id);
                }
                renderCart();
            });

            itemEl.querySelector('.remove-item-btn').addEventListener('click', () => {
                cart = cart.filter(c => c.id !== item.id);
                renderCart();
            });

            cartItemsContainer.appendChild(itemEl);
        });

        // Update badge
        cartBadge.textContent = totalQuantity;

        // Calculate Totals
        const fee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
        const total = subtotal + fee;

        cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        cartDeliveryFeeEl.textContent = `R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}`;
        cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartCheckoutBtn.disabled = false;

        // Make sure icons render correctly for the dynamically added items
        if (window.lucide) {
            lucide.createIcons();
        }
    };

    // 8. Checkout Modal Operations
    cartCheckoutBtn.addEventListener('click', () => {
        closeCart();
        
        // Calculate Total
        let subtotal = cart.reduce((acc, item) => acc + (item.singlePrice * item.quantity), 0);
        const fee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
        const total = subtotal + fee;

        checkoutTotalPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        openModal(checkoutModal);
    });

    // Payment method selector
    document.querySelectorAll('.payment-selector .payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-selector .payment-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Show cash change input if payment method is cash
            if (radio.value === 'cash') {
                cashChangeGroup.style.display = 'block';
            } else {
                cashChangeGroup.style.display = 'none';
            }
        });
    });

    // Handle Form Submission / Order Confirmation
    confirmOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Form validations
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        
        if (!name || !phone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (deliveryMode === 'delivery') {
            const street = document.getElementById('address-street').value.trim();
            const neighborhood = document.getElementById('address-neighborhood').value.trim();
            if (!street || !neighborhood) {
                alert('Por favor, preencha as informações do endereço de entrega.');
                return;
            }
        }

        // Generate Simulated Order ID
        const orderId = `#MM-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderTime = deliveryMode === 'delivery' ? '35-45 min' : '20-30 min';
        const modeLabel = deliveryMode === 'delivery' ? 'Delivery' : 'Retirada no Balcão';

        // Update Success Modal details
        successOrderIdEl.textContent = orderId;
        successOrderTimeEl.textContent = orderTime;
        successOrderModeEl.textContent = modeLabel;

        // Clear cart
        cart = [];
        checkoutForm.reset();
        renderCart();

        // Close checkout and show success
        closeModal(checkoutModal);
        openModal(successModal);
    });

    closeSuccessBtn.addEventListener('click', () => {
        closeModal(successModal);
    });

    // 9. Custom / Event Orders (WhatsApp integration)
    customOrderBtn.addEventListener('click', () => {
        openModal(customOrderModal);
    });

    sendCustomWhatsappBtn.addEventListener('click', () => {
        const details = customOrderDetails.value.trim();
        if (!details) {
            alert('Por favor, digite os detalhes da sua encomenda antes de enviar.');
            return;
        }

        const message = `Olá Massa Madre! Gostaria de fazer uma encomenda sob medida:\n\n${details}`;
        const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        closeModal(customOrderModal);
    });

    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
});
