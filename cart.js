// Warenkorb-Funktionalität
document.addEventListener('DOMContentLoaded', function() {
    // Warenkorb aus dem lokalen Speicher laden oder neu initialisieren
    let cart = JSON.parse(localStorage.getItem('tierliebe-cart')) || [];
    
    // Elemente im DOM finden
    const cartIcon = document.querySelector('.cart-icon');
    const navCartToggle = document.getElementById('nav-cart-toggle');
    const headerBadge = document.querySelector('.header-cart-badge');
    const cartBadge = document.querySelector('.cart-badge');
    
    // Warenkorb-Badge im Header aktualisieren
    function updateHeaderBadge() {
        if (headerBadge) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            headerBadge.textContent = totalItems;
        }
    }
    
    // Warenkorb-Badge im Footer aktualisieren
    function updateFooterBadge() {
        if (cartBadge) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartBadge.textContent = totalItems;
        }
    }
    
    // Badges aktualisieren, wenn die Seite geladen wird
    updateHeaderBadge();
    updateFooterBadge();
    
    // Event-Listener für Header-Warenkorb
    if (navCartToggle) {
        navCartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            // Bei Klick auf den Header-Warenkorb zur Shop-Seite navigieren, 
            // wenn wir nicht bereits auf der Shop-Seite sind
            if (!window.location.href.includes('shop.html')) {
                window.location.href = 'shop.html';
            } else if (cartWrapper && cartOverlay) {
                // Wenn wir auf der Shop-Seite sind, Warenkorb öffnen
                cartWrapper.classList.add('active');
                cartOverlay.classList.add('active');
            }
        });
    }
    
    // Wenn wir auf der Shop-Seite sind, weitere Funktionalität hinzufügen
    if (window.location.href.includes('shop.html')) {
        const cartWrapper = document.querySelector('.cart-wrapper');
        const cartOverlay = document.querySelector('.cart-overlay');
        const closeCart = document.querySelector('.close-cart');
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        const totalAmount = document.querySelector('.total-amount');
        
        // Footer-Warenkorb-Icon-Funktionalität
        if (cartIcon) {
            cartIcon.addEventListener('click', function() {
                cartWrapper.classList.add('active');
                cartOverlay.classList.add('active');
            });
        }
        
        // Warenkorb schließen
        if (closeCart) {
            closeCart.addEventListener('click', function() {
                cartWrapper.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', function() {
                cartWrapper.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
        }
        
        // Produkte zum Warenkorb hinzufügen
        addToCartButtons.forEach(button => {
            if (!button.classList.contains('disabled')) {
                button.addEventListener('click', function() {
                    const card = this.closest('.product-card');
                    const productTitle = card.querySelector('.product-title').textContent;
                    const productCategory = card.querySelector('.product-category').textContent;
                    const productPrice = card.querySelector('.current-price').textContent;
                    
                    // Produkt-Bild-Klasse extrahieren
                    const productImageEl = card.querySelector('.product-image');
                    const classes = productImageEl.className.split(' ');
                    const productImage = classes.find(cls => cls.startsWith('product-image-'));
                    
                    const product = {
                        id: Date.now().toString(),
                        title: productTitle,
                        category: productCategory,
                        price: productPrice,
                        image: productImage,
                        quantity: 1
                    };
                    
                    addToCart(product);
                    updateCartDisplay();
                    
                    // Feedback anzeigen
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = `${productTitle} zum Warenkorb hinzugefügt!`;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.classList.add('show');
                    }, 100);
                    
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            document.body.removeChild(notification);
                        }, 300);
                    }, 2000);
                });
            }
        });
        
        // Zum Warenkorb hinzufügen
        function addToCart(product) {
            const existingProduct = cart.find(item => item.title === product.title);
            
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push(product);
            }
            
            // Warenkorb im lokalen Speicher speichern
            localStorage.setItem('tierliebe-cart', JSON.stringify(cart));
            
            // Badges aktualisieren
            updateHeaderBadge();
            updateFooterBadge();
        }
        
        // Warenkorb-Anzeige aktualisieren
        function updateCartDisplay() {
            if (cart.length === 0) {
                emptyCart.style.display = 'block';
                return;
            }
            
            emptyCart.style.display = 'none';
            
            // Alle vorhandenen Einträge entfernen
            const cartProducts = cartItems.querySelectorAll('.cart-item');
            cartProducts.forEach(item => item.remove());
            
            // Neue Einträge erstellen
            let total = 0;
            
            cart.forEach(product => {
                const price = parseFloat(product.price.replace('€', '').replace(',', '.'));
                const itemTotal = price * product.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image ${product.image}"></div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${product.title}</div>
                        <div class="cart-item-category">${product.category}</div>
                        <div class="cart-item-price">${product.price} × ${product.quantity}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" title="Menge reduzieren">-</button>
                            <span class="quantity-value">${product.quantity}</span>
                            <button class="quantity-btn plus" title="Menge erhöhen">+</button>
                            <button class="remove-item" data-id="${product.id}" title="Entfernen">Entfernen</button>
                        </div>
                    </div>
                `;
                
                cartItems.appendChild(cartItem);
                
                // Event-Listener für Mengenänderung
                const minusBtn = cartItem.querySelector('.minus');
                const plusBtn = cartItem.querySelector('.plus');
                const removeBtn = cartItem.querySelector('.remove-item');
                
                minusBtn.addEventListener('click', function() {
                    decreaseQuantity(product.id);
                });
                
                plusBtn.addEventListener('click', function() {
                    increaseQuantity(product.id);
                });
                
                removeBtn.addEventListener('click', function() {
                    removeItem(product.id);
                });
            });
            
            // Gesamtsumme aktualisieren
            totalAmount.textContent = `€${total.toFixed(2).replace('.', ',')}`;
        }
        
        // Menge erhöhen
        function increaseQuantity(id) {
            const product = cart.find(item => item.id === id);
            if (product) {
                product.quantity++;
                localStorage.setItem('tierliebe-cart', JSON.stringify(cart));
                updateCartDisplay();
                updateHeaderBadge();
                updateFooterBadge();
            }
        }
        
        // Menge verringern
        function decreaseQuantity(id) {
            const product = cart.find(item => item.id === id);
            if (product) {
                product.quantity--;
                if (product.quantity === 0) {
                    removeItem(id);
                } else {
                    localStorage.setItem('tierliebe-cart', JSON.stringify(cart));
                    updateCartDisplay();
                    updateHeaderBadge();
                    updateFooterBadge();
                }
            }
        }
        
        // Produkt entfernen
        function removeItem(id) {
            cart = cart.filter(item => item.id !== id);
            localStorage.setItem('tierliebe-cart', JSON.stringify(cart));
            updateCartDisplay();
            updateHeaderBadge();
            updateFooterBadge();
        }
        
        // Anzeige beim Laden initialisieren
        updateCartDisplay();
    }
});
