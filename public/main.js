// This script contains all the functionality for the KRYVE landing page.
// It handles search bar toggling, newsletter subscription, smooth scrolling, and new drops loading.

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    // Search bar elements
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    const closeSearch = document.getElementById('close-search');

    // Newsletter elements
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');
    const messageBox = document.getElementById('message-box');

    // Navigation links for smooth scrolling
    const navLinks = document.querySelectorAll('a[href^="#"]');

    // --- Functionality ---

    // 1. Search Bar Toggle
    // Adds a click event listener to the search icon.
    // Toggles the 'active' class on the search bar container to show or hide it with a CSS transition.
    searchIcon.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        // Focus on input when search bar opens
        if (searchBar.classList.contains('active')) {
            setTimeout(() => {
                searchBar.querySelector('input').focus();
            }, 300);
        }
    });

    // Adds a click event listener to the close button inside the search bar.
    // Removes the 'active' class to hide the search bar.
    closeSearch.addEventListener('click', () => {
        searchBar.classList.remove('active');
        // Clear search input when closing
        searchBar.querySelector('input').value = '';
    });

    // 2. Newsletter Subscription
    // Handles the form submission for the newsletter.
    // Prevents default form behavior, displays a custom message, and clears the input.
    newsletterForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const email = emailInput.value;

        // Check if the email input is not empty
        if (email) {
            console.log(`Subscribed with: ${email}`);
            messageBox.textContent = 'Thanks for subscribing!';
            messageBox.style.backgroundColor = '#00E6D2';
            messageBox.style.color = '#1C1C1C';
            messageBox.classList.add('show'); // Show the message box
            emailInput.value = ''; // Clear the input field

            // Automatically hide the message box after 3 seconds
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        } else {
            // Display an error message if the input is empty
            messageBox.textContent = 'Please enter a valid email address.';
            messageBox.style.backgroundColor = '#ef4444'; // red-500
            messageBox.style.color = '#ffffff'; // white
            messageBox.classList.add('show');

            // Automatically hide the message box after 3 seconds
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        }
    });

    // 3. Smooth Scrolling for Navigation
    // Iterates through all links with a '#' in their href attribute.
    // Adds a click event listener to each one to handle smooth scrolling to the target section.
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent the default anchor link behavior
            event.preventDefault();

            // Get the target element's ID from the href attribute
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // Check if the target element exists before scrolling
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Load New Drops on page load
    loadNewDrops();
});

// Enhanced New Drops Loading Function
async function loadNewDrops() {
    const newDropsGrid = document.querySelector('#new-drops .grid');
    
    if (!newDropsGrid) {
        console.error('New drops grid container not found');
        return;
    }

    // Show enhanced loading state
    newDropsGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p class="text-lg text-muted">Loading latest drops...</p>
        </div>
    `;

    try {
        // Try new-drops endpoint first, fallback to all products
        let response = await fetch('/api/new-drops');
        if (!response.ok) {
          response = await fetch('/api/products');
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        let products = await response.json();
        if (!Array.isArray(products)) throw new Error(products.error || 'Invalid response format');

        // If fallback, sort and slice to 4
        if (response.url.endsWith('/api/products')) {
          products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          products = products.slice(0, 4);
        }

        // Clear loading state
        newDropsGrid.innerHTML = '';

        // Render products with group class for hover effects
        products.forEach((product) => {
          const card = createProductCard(product);
          newDropsGrid.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading new drops:', err);
        newDropsGrid.innerHTML = `
            <p class="col-span-full text-center text-red-500 py-16">
                Failed to load new drops: ${err.message}. Please check your Printify API credentials or server logs.
            </p>
        `;
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'group relative';

    const productId = product.id;
    const productTitle = product.title;
    const productPrice = product.price;
    const productImage = product.image || product.defaultImage || '';

    const truncatedTitle = productTitle.length > 35 
        ? productTitle.substring(0, 32) + '...' 
        : productTitle;

    // Create the card HTML
    card.innerHTML = `
        <a href="/product.html?id=${encodeURIComponent(productId)}" class="block">
            <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                
                <!-- Image Container with Badge -->
                <div class="relative overflow-hidden aspect-square bg-gray-100">
                    ${productImage 
                        ? `<img src="${productImage}" 
                             alt="${productTitle}" 
                             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                             onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-400\\'>No Image Available</div>'">`
                        : `<div class="w-full h-full flex items-center justify-center text-gray-400">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                           </div>`
                    }
                    
                    <!-- "NEW" Badge -->
                    <div class="absolute top-4 left-4">
                        <span class="bg-primary text-dark text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                            NEW
                        </span>
                    </div>

                    <!-- Quick View Overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <p class="text-sm mb-2">Quick View</p>
                            <div class="w-8 h-0.5 bg-primary mx-auto"></div>
                        </div>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="p-6 text-center">
                    <!-- Product Name -->
                    <h3 class="font-bold text-lg text-dark uppercase tracking-wide font-heading mb-2 group-hover:text-primary transition-colors duration-300" title="${productTitle}">
                        ${truncatedTitle}
                    </h3>
                    
                    <!-- Price -->
                    <p class="text-dark font-extrabold text-xl mb-4">$${productPrice}</p>
                    
                    <!-- Add to Cart Button -->
                    <button class="w-full bg-dark text-white py-3 px-6 rounded-full font-semibold text-sm hover:bg-primary hover:text-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        ADD TO CART
                    </button>
                </div>
            </div>
        </a>
    `;

    return card;
}

// Add some enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
    /* Enhanced loading animation */
    .animate-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* Smooth hover transitions */
    .group:hover .group-hover\\:scale-110 {
        transform: scale(1.1);
    }

    .group:hover .group-hover\\:translate-y-0 {
        transform: translateY(0);
    }

    .group:hover .group-hover\\:opacity-100 {
        opacity: 1;
    }

    /* Enhanced card hover effects */
    .group:hover .group-hover\\:-translate-y-1 {
        transform: translateY(-4px);
    }

    /* Stagger animation for product cards */
    .grid > div {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    .grid > div:nth-child(1) { animation-delay: 0.1s; }
    .grid > div:nth-child(2) { animation-delay: 0.2s; }
    .grid > div:nth-child(3) { animation-delay: 0.3s; }
    .grid > div:nth-child(4) { animation-delay: 0.4s; }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);