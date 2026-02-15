document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       Navigation & Mobile Menu
       ========================================== */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // Sticky Transparent Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('transparent-bg');
            header.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
            header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        } else {
            header.classList.remove('transparent-bg'); // Fix: Remove class at top
            header.style.backgroundColor = "transparent";
            header.style.boxShadow = "none";
        }
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    /* ==========================================
       Scroll Animations (Intersection Observer)
       ========================================== */
    const faders = document.querySelectorAll('.fade-in-scroll, .slide-in-left, .slide-in-right');

    const appearOptions = {
        threshold: 0.1, // Trigger sooner
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    /* ==========================================
       Menu Filtering
       ========================================== */
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            menuCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ==========================================
       Shopping Cart Logic
       ========================================== */
    let cart = [];
    const cartBtn = document.getElementById('cart-btn');
    const cartBtnDesktop = document.getElementById('cart-btn-desktop');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartCountElements = document.querySelectorAll('.cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Open/Close Cart
    function toggleCart() {
        cartOverlay.classList.toggle('show');
        cartSidebar.classList.toggle('show');
    }

    cartBtn.addEventListener('click', toggleCart);
    cartBtnDesktop.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Add Item to Cart
    const addButtons = document.querySelectorAll('.btn-add, .btn-order');

    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add')) {
                const card = e.target.closest('.menu-card');
                const title = card.querySelector('h3').textContent;
                const priceStr = card.querySelector('.price').textContent.replace('$', '');
                const price = parseFloat(priceStr);
                const imgSrc = card.querySelector('img').src;

                addItemToCart(title, price, imgSrc);

                // Animation feedback
                btn.textContent = "Added!";
                btn.style.background = "#28a745";
                setTimeout(() => {
                    btn.textContent = "Add to Cart";
                    btn.style.background = ""; // revert to CSS var
                }, 1000);
            }
            else if (e.target.classList.contains('btn-order')) {
                const card = e.target.closest('.offer-card');
                const title = card.querySelector('h3').textContent;
                const priceStr = card.querySelector('.discounted-price').textContent.replace('$', '');
                const price = parseFloat(priceStr);
                const imgSrc = card.querySelector('img').src;

                addItemToCart(title, price, imgSrc);
                toggleCart(); // Open cart to show it added
            }
        });
    });

    function addItemToCart(title, price, titleImg) {
        const existingItem = cart.find(item => item.title === title);

        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({
                title: title,
                price: price,
                img: titleImg,
                qty: 1
            });
        }
        updateCartUI();
    }

    function removeItemFromCart(title) {
        cart = cart.filter(item => item.title !== title);
        updateCartUI();
    }

    function changeQty(title, change) {
        const item = cart.find(item => item.title === title);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                removeItemFromCart(title);
            } else {
                updateCartUI();
            }
        }
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
        } else {
            cart.forEach(item => {
                total += item.price * item.qty;
                count += item.qty;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.title}">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <span class="item-price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-controls">
                            <button class="decrease-qty" data-title="${item.title}">-</button>
                            <span>${item.qty}</span>
                            <button class="increase-qty" data-title="${item.title}">+</button>
                        </div>
                    </div>
                    <span class="remove-item" data-title="${item.title}"><i class="fas fa-trash"></i></span>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalElement.textContent = '$' + total.toFixed(2);
        cartCountElements.forEach(el => el.textContent = count);

        // Re-attach event listeners for dynamic elements
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => changeQty(e.target.dataset.title, 1));
        });
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => changeQty(e.target.dataset.title, -1));
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.target.closest('.remove-item').dataset.title;
                removeItemFromCart(title);
            });
        });
    }

    /* ==========================================
       Payment Modal Logic
       ========================================== */
    const paymentModal = document.getElementById('payment-modal');
    const closeModal = document.querySelector('.close-modal');
    const paymentForm = document.getElementById('payment-form');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
        } else {
            toggleCart(); // Close sidebar
            paymentModal.style.display = 'flex';
        }
    });

    closeModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const payBtn = paymentForm.querySelector('button');
        const originalText = payBtn.textContent;

        payBtn.textContent = 'Processing...';
        payBtn.disabled = true;

        setTimeout(() => {
            alert('Payment Successful! Thank you for your order.');
            paymentModal.style.display = 'none';
            cart = [];
            updateCartUI();
            payBtn.textContent = originalText;
            payBtn.disabled = false;
            paymentForm.reset();
        }, 2000);
    });

    /* ==========================================
       Testimonials Carousel
       ========================================== */
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const dotsNav = document.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);

        const slideWidth = slides[0].getBoundingClientRect().width;

        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        const moveToSlide = (track, currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        }

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        }

        nextButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling || slides[0];
            const currentDot = dotsNav.querySelector('.current-slide');
            const nextDot = currentDot.nextElementSibling || dots[0];
            moveToSlide(track, currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
        });

        prevButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1];
            const currentDot = dotsNav.querySelector('.current-slide');
            const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];
            moveToSlide(track, currentSlide, prevSlide);
            updateDots(currentDot, prevDot);
        });

        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');
            if (!targetDot) return;
            const currentSlide = track.querySelector('.current-slide');
            const currentDot = dotsNav.querySelector('.current-slide');
            const targetIndex = dots.findIndex(dot => dot === targetDot);
            const targetSlide = slides[targetIndex];
            moveToSlide(track, currentSlide, targetSlide);
            updateDots(currentDot, targetDot);
        });

        setInterval(() => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling || slides[0];
            const currentDot = dotsNav.querySelector('.current-slide');
            const nextDot = currentDot.nextElementSibling || dots[0];
            moveToSlide(track, currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
        }, 5000);
    }

    /* ==========================================
       Form Handling (Remaining Order Form for Reservation)
       ========================================== */
    const orderForm = document.getElementById('order-form');

    // Order Form Submit -> Reservation alert or Hint
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('order-type').value;

        if (type === 'reservation') {
            const name = document.getElementById('name').value;
            alert(`Table Reservation request for ${name} submitted successfully! We will call you to confirm.`);
            orderForm.reset();
        } else {
            // For delivery/pickup, we now guide them to use the Cart for checkout
            alert('For Delivery or Pickup, please add items to your Cart and proceed to Checkout!');
        }
    });

    /* ==========================================
       Back to Top Button
       ========================================== */
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

});
