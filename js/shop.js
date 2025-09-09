// Shop functionality with cart and balance system
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    if (!localStorage.getItem('userData')) {
        const initialUserData = {
            balance: 1000, // Starting balance
            cart: [],
            purchases: []
        };
        localStorage.setItem('userData', JSON.stringify(initialUserData));
    }
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Update balance display
    function updateBalanceDisplay() {
        const balanceElements = document.querySelectorAll('.balance-amount, .user-balance');
        balanceElements.forEach(el => {
            el.textContent = `${userData.balance} FL Coins`;
        });
    }
    
    // Update cart indicator
    function updateCartIndicator() {
        const cartIndicator = document.getElementById('cart-indicator');
        if (cartIndicator) {
            cartIndicator.textContent = userData.cart.length;
            cartIndicator.style.display = userData.cart.length > 0 ? 'flex' : 'none';
        }
    }
    
    // Category filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const shopItems = document.querySelectorAll('.shop-item');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            shopItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Add to cart functionality
    const buyBtns = document.querySelectorAll('.buy-btn');
    
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.shop-item');
            const itemId = Array.prototype.indexOf.call(shopItems, item);
            const title = item.querySelector('.item-title').textContent;
            const description = item.querySelector('.item-description').textContent;
            const price = parseInt(item.querySelector('.price-amount').textContent);
            const icon = item.querySelector('.item-icon').innerHTML;
            const category = item.dataset.category;
            
            // Check if item already in cart
            const existingItemIndex = userData.cart.findIndex(cartItem => cartItem.id === itemId);
            
            if (existingItemIndex === -1) {
                // Add new item to cart
                userData.cart.push({
                    id: itemId,
                    title,
                    description,
                    price,
                    icon,
                    category,
                    quantity: 1
                });
                
                // Show added notification
                showNotification(`"${title}" добавлен в корзину!`, 'success');
            } else {
                // Increase quantity
                userData.cart[existingItemIndex].quantity += 1;
                showNotification(`Количество "${title}" в корзине увеличено!`, 'info');
            }
            
            // Save updated data
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Update UI
            updateCartIndicator();
        });
    });
    
    // Purchase modal
    const modal = document.getElementById('purchase-modal');
    const closeModal = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    function openPurchaseModal(item) {
        const title = item.querySelector('.item-title').textContent;
        const description = item.querySelector('.item-description').textContent;
        const price = parseInt(item.querySelector('.price-amount').textContent);
        const icon = item.querySelector('.item-icon').innerHTML;
        
        // Update modal content
        document.querySelector('.modal .item-icon').innerHTML = icon;
        document.querySelector('.modal .item-title').textContent = title;
        document.querySelector('.modal .item-description').textContent = description;
        document.querySelector('.modal .price-amount').textContent = `${price} FL Coins`;
        document.querySelector('.modal .balance-amount').textContent = `${userData.balance} FL Coins`;
        
        // Check if user can afford
        const canAfford = userData.balance >= price;
        const confirmBtn = document.querySelector('.confirm-btn');
        
        if (canAfford) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Подтвердить покупку';
            document.querySelector('.balance-info').style.color = '';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Недостаточно средств';
            document.querySelector('.balance-info').style.color = 'var(--error-color, #ff4757)';
        }
        
        // Show modal
        modal.style.display = 'block';
    }
    
    // Close modal
    function closeModalFunc() {
        modal.style.display = 'none';
    }
    
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalFunc();
        }
    });
    
    // Confirm purchase
    const confirmBtn = document.querySelector('.confirm-btn');
    confirmBtn.addEventListener('click', function() {
        const priceText = document.querySelector('.modal .price-amount').textContent;
        const price = parseInt(priceText);
        const title = document.querySelector('.modal .item-title').textContent;
        
        if (userData.balance >= price) {
            // Process purchase
            userData.balance -= price;
            userData.purchases.push({
                title,
                price,
                date: new Date().toISOString()
            });
            
            // Save updated data
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Update UI
            updateBalanceDisplay();
            
            // Show success message
            showNotification(`Покупка "${title}" успешно завершена!`, 'success');
            
            // Close modal
            closeModalFunc();
        } else {
            showNotification('Недостаточно средств для покупки!', 'error');
        }
    });
    
    // Copy IP button
    const copyIpBtn = document.querySelector('.copy-ip');
    const ipCopied = document.querySelector('.ip-copied');
    
    if (copyIpBtn && ipCopied) {
        copyIpBtn.addEventListener('click', function() {
            navigator.clipboard.writeText('mc.federalleague.ru').then(() => {
                ipCopied.style.display = 'block';
                setTimeout(() => {
                    ipCopied.style.display = 'none';
                }, 2000);
            });
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Initialize UI
    updateBalanceDisplay();
    updateCartIndicator();
    
    // Accordion FAQ
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-item-header');
        
        header.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});