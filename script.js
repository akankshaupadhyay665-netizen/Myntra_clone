
const products = [
    { id: 1, brand: "Style Studio", name: "Women's Casual Outfit", price: 899, originalPrice: 1499, category: "women", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=500&q=80" },
    { id: 2, brand: "Urban Basics", name: "Men's Classic T-Shirt", price: 699, originalPrice: 999, category: "men", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80" },
    { id: 3, brand: "Pretty Picks", name: "Women's Summer Dress", price: 1299, originalPrice: 1999, category: "women", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80" },
    { id: 4, brand: "Trend Theory", name: "Everyday Fashion Wear", price: 1499, originalPrice: 1999, category: "men", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80" },
    { id: 5, brand: "Chic Avenue", name: "Women's Fashion Wear", price: 799, originalPrice: 999, category: "women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80" },
    { id: 6, brand: "Street Mode", name: "Men's Casual Wear", price: 1049, originalPrice: 1499, category: "men", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=500&q=80" },
    { id: 7, brand: "Daily Glam", name: "Weekend Outfit", price: 1199, originalPrice: 1999, category: "women", image: "https://images.unsplash.com/photo-1548624149-fbd4a5e3c6b6?auto=format&fit=crop&w=500&q=80" },
    { id: 8, brand: "Modern Man", name: "Men's Everyday Style", price: 1499, originalPrice: 1999, category: "men", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=500&q=80" }
];

const formatPrice = amount =>
    "₹" + amount.toLocaleString("en-IN");

// Restore saved cart safely.
function loadBag() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("fashionBag") || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved.filter(item => {
            const product = products.find(p => p.id === item.id);

            return product &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0;
        }).map(item => {
            const product = products.find(p => p.id === item.id);

            return { ...product, quantity: item.quantity };
        });
    } catch {
        return [];
    }
}

let bag = loadBag();
let activeCategory = "all";

const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll(".product-card");
const productCount = document.getElementById("productCount");
const noResults = document.getElementById("noResults");
const bagItems = document.getElementById("bagItems");
const bagCount = document.getElementById("bagCount");
const totalItems = document.getElementById("totalItems");
const totalAmount = document.getElementById("totalAmount");

// Save cart to browser storage.
function saveBag() {
    try {
        localStorage.setItem("fashionBag", JSON.stringify(bag));
    } catch (error) {
        console.error("Unable to save the shopping bag:", error);
    }
}

// Update product visibility according to search and category.
function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    productCards.forEach(card => {
        const id = Number(card.dataset.id);
        const product = products.find(item => item.id === id);

        if (!product) return;

        const matchesCategory =
            activeCategory === "all" ||
            product.category === activeCategory;

        const searchableText =
            `${product.brand} ${product.name} ${product.category}`.toLowerCase();

        const matchesSearch = searchableText.includes(query);
        const visible = matchesCategory && matchesSearch;

        card.hidden = !visible;

        if (visible) visibleCount++;
    });

    productCount.textContent =
        `${visibleCount} Product${visibleCount === 1 ? "" : "s"}`;

    noResults.hidden = visibleCount !== 0;
}

searchInput.addEventListener("input", filterProducts);

// Category filter buttons.
document.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;

        document.querySelectorAll(".category-button").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        filterProducts();
    });
});

// Navbar category links.
document.querySelectorAll(".nav-links [data-filter]").forEach(link => {
    link.addEventListener("click", () => {
        activeCategory = link.dataset.filter;

        document.querySelectorAll(".category-button").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeCategory
            );
        });

        filterProducts();
    });
});

// Add product to bag.
function addToBag(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existing = bag.find(item => item.id === productId);

    if (existing) {
        existing.quantity++;
    } else {
        bag.push({ ...product, quantity: 1 });
    }

    saveBag();
    renderBag();
}

// Change product quantity.
function changeQuantity(productId, change) {
    const item = bag.find(product => product.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        bag = bag.filter(product => product.id !== productId);
    }

    saveBag();
    renderBag();
}

// Remove a product completely.
function removeFromBag(productId) {
    bag = bag.filter(product => product.id !== productId);

    saveBag();
    renderBag();
}

// Render the shopping bag and totals.
function renderBag() {
    const count = bag.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const total = bag.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    bagCount.textContent = `Bag (${count})`;
    totalItems.textContent = count;
    totalAmount.textContent = formatPrice(total);

    bagItems.replaceChildren();

    if (bag.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-bag";
        emptyMessage.textContent =
            "Your bag is empty. Add some styles you love!";
        bagItems.appendChild(emptyMessage);
        return;
    }

    bag.forEach(item => {
        const row = document.createElement("article");
        row.className = "bag-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;

        const info = document.createElement("div");
        info.className = "bag-item-info";

        const brand = document.createElement("h3");
        brand.textContent = item.brand;

        const name = document.createElement("p");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(item.price) + " each";

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const decrease = document.createElement("button");
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", "Decrease quantity");
        decrease.addEventListener("click", () =>
            changeQuantity(item.id, -1)
        );

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.textContent = "+";
        increase.setAttribute("aria-label", "Increase quantity");
        increase.addEventListener("click", () =>
            changeQuantity(item.id, 1)
        );

        controls.append(decrease, quantity, increase);

        const remove = document.createElement("button");
        remove.className = "remove-button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () =>
            removeFromBag(item.id)
        );

        info.append(brand, name, price, controls, remove);

        const subtotal = document.createElement("div");
        subtotal.className = "item-subtotal";
        subtotal.textContent =
            formatPrice(item.price * item.quantity);

        row.append(image, info, subtotal);
        bagItems.appendChild(row);
    });
}

// Demo-only checkout; no real payment is made.
document.getElementById("checkoutButton").addEventListener("click", () => {
    if (bag.length === 0) {
        alert("Your bag is empty. Add a product first!");
        return;
    }

    const confirmed = confirm(
        `Demo order total: ${totalAmount.textContent}\n\n` +
        "This is a college project. No real payment will be taken.\n\n" +
        "Place this demo order?"
    );

    if (confirmed) {
        alert("Demo order placed successfully!");

        bag = [];
        saveBag();
        renderBag();
    }
});

// Initial page setup.
filterProducts();
renderBag();
