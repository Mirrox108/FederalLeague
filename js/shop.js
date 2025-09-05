// Shop functionality
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Purchase modal
    const buyBtns = document.querySelectorAll('.buy-btn');
    const modal = document.getElementById('purchase-modal');
    const closeModal = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.shop-item');
            const title = item.querySelector('.item-title').textContent;
            const description = item.querySelector('.item-description').textContent;
            const price = item.querySelector('.price-amount').textContent;
            const icon = item.querySelector('.item-icon').innerHTML;
            
            // Update modal content
            document.querySelector('.modal .item-icon').innerHTML = icon;
            document.querySelector('.modal .item-title').textContent = title;
            document.querySelector('.modal .item-description').textContent = description;
            document.querySelector('.modal .price-amount').textContent = price + ' FL Coins';
            
            // Show modal
            modal.style.display = 'block';
        });
    });
    
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
        alert('Покупка успешно завершена! Предметы будут доставлены в ближайшее время.');
        closeModalFunc();
    });
    
    // Copy IP button
    const copyIpBtn = document.querySelector('.copy-ip');
    const ipCopied = document.querySelector('.ip-copied');
    
    copyIpBtn.addEventListener('click', function() {
        navigator.clipboard.writeText('mc.federalleague.ru').then(() => {
            ipCopied.style.display = 'block';
            setTimeout(() => {
                ipCopied.style.display = 'none';
            }, 2000);
        });
    });
});