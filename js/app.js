

// ── Product Catalog ──────────────────────────────────────────
const menProducts = [
    { id: "m1", name: "Classic Oxford Shirt",  type: "Formal Shirt",  price: 899,  original: 1499, file: "shirt1.jpg" },
    { id: "m2", name: "Slim Fit Polo",          type: "Casual Polo",   price: 649,  original: 999,  file: "shirt2.jpg" },
    { id: "m3", name: "Linen Summer Shirt",     type: "Casual Shirt",  price: 799,  original: 799,  file: "shirt3.jpg" },
    { id: "m4", name: "Denim Overshirt",        type: "Overshirt",     price: 1299, original: 1899, file: "shirt4.jpg" },
    { id: "m5", name: "Mandarin Collar Kurta",  type: "Ethnic Wear",   price: 1099, original: 1599, file: "shirt5.jpg" },
    { id: "m6", name: "Striped Button-Down",    type: "Casual Shirt",  price: 599,  original: 899,  file: "shirt6.jpg" },
    { id: "m7", name: "Formal Blazer Shirt",    type: "Formal Shirt",  price: 1599, original: 2499, file: "shirt7.jpg" },
];

const womenProducts = [
    { id: "w1",  name: "Floral Wrap Dress",    type: "Casual Dress",  price: 1199, original: 1799, file: "dress1.jpg"  },
    { id: "w2",  name: "A-Line Midi Dress",    type: "Formal Dress",  price: 1499, original: 2299, file: "dress2.jpg"  },
    { id: "w3",  name: "Boho Maxi Dress",      type: "Boho Dress",    price: 1099, original: 1599, file: "dress3.jpg"  },
    { id: "w4",  name: "Silk Evening Gown",    type: "Gown",          price: 3499, original: 4999, file: "dress4.jpg"  },
    { id: "w5",  name: "Kurti Co-ord Set",     type: "Ethnic Wear",   price: 999,  original: 1499, file: "dress5.jpg"  },
    { id: "w6",  name: "Denim Shirt Dress",    type: "Casual Dress",  price: 1299, original: 1299, file: "dress6.jpg"  },
    { id: "w7",  name: "Printed Palazzo Set",  type: "Ethnic Wear",   price: 849,  original: 1299, file: "dress7.jpg"  },
    { id: "w8",  name: "Off-Shoulder Bodycon", type: "Party Dress",   price: 1799, original: 2699, file: "dress8.jpg"  },
    { id: "w9",  name: "Linen Jumpsuit",       type: "Jumpsuit",      price: 1399, original: 1999, file: "dress9.jpg"  },
    { id: "w10", name: "Ruffle Saree Gown",    type: "Fusion Wear",   price: 2499, original: 3499, file: "dress10.jpg" },
];

// ── State ────────────────────────────────────────────────────
let selectedShirt   = null;
let selectedProduct = null;
let isWomen         = false;
let wishlist        = [];

// ── DOM Refs ─────────────────────────────────────────────────
const photoInput   = document.getElementById("photoInput");
const previewBox   = document.querySelector(".preview-box");
const userImage    = document.getElementById("userImage");
const generateBtn  = document.getElementById("generateBtn");
const loaderBox    = document.getElementById("loaderBox");
const slides       = document.querySelectorAll(".slide");
const statusText   = document.getElementById("statusText");
const progressFill = document.getElementById("progressFill");

// ── Build Card Grids ──────────────────────────────────────────
function buildGrids() {
    const menGrid   = document.querySelector("#menGrid .shirts-grid");
    const womenGrid = document.querySelector("#womenGrid .shirts-grid");
    menProducts.forEach(p   => menGrid.appendChild(makeCard(p, "man")));
    womenProducts.forEach(p => womenGrid.appendChild(makeCard(p, "women")));
}

function makeCard(p, folder) {
    const discPct = p.original > p.price
        ? Math.round((1 - p.price / p.original) * 100)
        : 0;

    const card = document.createElement("div");
    card.className  = "cloth-card";
    card.dataset.id = p.id;

    card.innerHTML = `
        <div class="cloth-card-img-wrap">
            <img src="assets/${folder}/${p.file}" alt="${p.name}" loading="lazy">
            ${discPct ? `<span class="card-discount-badge" style="display:block">${discPct}% OFF</span>` : ""}
            <button class="card-heart-btn" data-id="${p.id}" title="Add to wishlist"
                    onclick="event.stopPropagation(); cardToggleWishlist('${p.id}')">
                <svg viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                        a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                        1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
        </div>
        <div class="cloth-card-info">
            <span class="card-type">${p.type}</span>
            <p class="card-name">${p.name}</p>
            <div class="card-pricing">
                <span class="card-price-sale">₹${p.price.toLocaleString("en-IN")}</span>
                ${p.original > p.price
                    ? `<span class="card-price-orig">₹${p.original.toLocaleString("en-IN")}</span>`
                    : ""}
            </div>
        </div>
        <div class="card-selected-mark">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>`;

    card.addEventListener("click", () => selectShirt(card, p));
    return card;
}

// ── Gender Toggle ─────────────────────────────────────────────
function toggleGender() {
    isWomen = !isWomen;
    const slider    = document.getElementById("toggleSlider");
    const textMan   = document.getElementById("textMan");
    const textWomen = document.getElementById("textWomen");

    if (isWomen) {
        slider.style.transform = "translateX(125px)";
        textWomen.classList.add("active"); textMan.classList.remove("active");
        document.getElementById("menGrid").style.display   = "none";
        document.getElementById("womenGrid").style.display = "block";
        userImage.src = "assets/person/default_girl.jpg";
    } else {
        slider.style.transform = "translateX(0px)";
        textMan.classList.add("active"); textWomen.classList.remove("active");
        document.getElementById("menGrid").style.display   = "block";
        document.getElementById("womenGrid").style.display = "none";
        userImage.src = "assets/person/elon-musk.jpg";
    }

    selectedShirt = null; selectedProduct = null;
    generateBtn.style.display = "none";
    document.querySelectorAll(".cloth-card").forEach(c => c.classList.remove("selected"));
}

// ── Select Shirt (click card) ─────────────────────────────────
function selectShirt(card, product) {
    document.querySelectorAll(".cloth-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedShirt   = product.file;
    selectedProduct = product;
    generateBtn.style.display = "block";
}

// ── Wishlist (heart on card) ──────────────────────────────────
function cardToggleWishlist(id) {
    const product = [...menProducts, ...womenProducts].find(p => p.id === id);
    if (!product) return;

    const idx = wishlist.findIndex(w => w.id === id);
    if (idx > -1) {
        wishlist.splice(idx, 1);
    } else {
        wishlist.push(product);
    }

    // Update all heart buttons with this id (only one exists but keep it safe)
    document.querySelectorAll(`.card-heart-btn[data-id="${id}"]`).forEach(btn => {
        btn.classList.toggle("hearted", wishlist.some(w => w.id === id));
    });

    document.getElementById("wishlistCount").textContent = wishlist.length;
    renderWishlistDrawer();
}

function renderWishlistDrawer() {
    const container = document.getElementById("wishlistItems");
    if (!wishlist.length) {
        container.innerHTML = `
            <div class="empty-wishlist">
                <svg viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312
                        2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0
                        7.22 9 12 9 12s9-4.78 9-12Z"/>
                </svg>
                <p>No items saved yet.<br>Tap the heart on any outfit!</p>
            </div>`;
        return;
    }
    container.innerHTML = wishlist.map(p => {
        const folder  = p.file.startsWith("dress") ? "women" : "man";
        const origHTML = p.original > p.price
            ? `<span class="wishlist-item-orig">₹${p.original.toLocaleString("en-IN")}</span>`
            : "";
        return `
            <div class="wishlist-item">
                <img class="wishlist-item-thumb"
                     src="assets/${folder}/${p.file}" alt="${p.name}">
                <div class="wishlist-item-info">
                    <p class="wishlist-item-name">${p.name}</p>
                    <p class="wishlist-item-type">${p.type}</p>
                    <p class="wishlist-item-price">
                        ₹${p.price.toLocaleString("en-IN")}${origHTML}
                    </p>
                </div>
                <button class="wishlist-remove"
                        onclick="removeFromWishlist('${p.id}')"
                        title="Remove">&#x2715;</button>
            </div>`;
    }).join("");
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(w => w.id !== id);
    document.getElementById("wishlistCount").textContent = wishlist.length;
    renderWishlistDrawer();
    document.querySelectorAll(`.card-heart-btn[data-id="${id}"]`).forEach(btn => {
        btn.classList.remove("hearted");
    });
}

function openDrawer() {
    document.getElementById("wishlistDrawer").classList.add("open");
    document.getElementById("drawerOverlay").classList.add("open");
}
function closeDrawer() {
    document.getElementById("wishlistDrawer").classList.remove("open");
    document.getElementById("drawerOverlay").classList.remove("open");
}

// ── Photo Upload Preview ──────────────────────────────────────
previewBox.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => userImage.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

// ── Loader ────────────────────────────────────────────────────
let currentSlide = 0, progressValue = 0;
let slideTimer, progressTimer, statusTimer;

function showLoader() {
    loaderBox.style.display = "flex";
    startSlides(); startProgress(); startStatus();
}
function hideLoader() {
    loaderBox.style.display = "none";
    clearInterval(slideTimer); clearInterval(progressTimer); clearInterval(statusTimer);
    progressValue = 0; progressFill.style.width = "0%";
}
function startSlides() {
    slideTimer = setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }, 11000);
}
function startProgress() {
    progressTimer = setInterval(() => {
        progressValue++;
        progressFill.style.width = progressValue + "%";
    }, 900);
}
function startStatus() {
    const messages = [
        "Preparing your outfit...", "Fitting analysis...",
        "Adjusting clothing...",   "Rendering look...",
        "Optimizing output...",    "Almost Ready..."
    ];
    let i = 0;
    statusTimer = setInterval(() => {
        statusText.innerText = messages[i];
        i = (i + 1) % messages.length;
    }, 15000);
}

// ── Generate Try-On ───────────────────────────────────────────
// async function generateTryOn() {
//     const file = photoInput.files[0];
//     if (!selectedShirt) { alert("Please select a shirt first!"); return; }

//     generateBtn.innerText = "Generating...";
//     generateBtn.disabled  = true;
//     showLoader();

//     const form = new FormData();
//     if (file) {
//         form.append("image", file);
//     } else {
//         form.append("default_image", userImage.src.split("/").pop());
//     }
//     form.append("shirt",  selectedShirt);
//     form.append("gender", isWomen ? "female" : "male");

//     try {
//         const response = await fetch("upload.php", { method: "POST", body: form });
//         const result   = await response.text();
//         console.log(result);
//         hideLoader();
//         userImage.src = "results/result.png?t=" + new Date().getTime();
//     } catch (error) {
//         console.error(error);
//         hideLoader();
//         alert("Error generating image.");
//     }

//     generateBtn.innerText = "Generate Virtual Try-On";
//     generateBtn.disabled  = false;
// }
async function generateTryOn() {
    const file = photoInput.files[0];

    if (!selectedShirt) {
        alert("Please select a shirt first!");
        return;
    }

    generateBtn.innerText = "Generating...";
    generateBtn.disabled = true;
    showLoader();

    const form = new FormData();

    if (file) {
        form.append("image", file);
    } else {
        form.append("default_image", userImage.src.split("/").pop());
    }

    form.append("shirt", selectedShirt);
    form.append("gender", isWomen ? "female" : "male");

    try {
        const response = await fetch("upload.php", {
            method: "POST",
            body: form
        });

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const result = await response.json();

        console.log(result);

        if (result.success) {
            console.log('chal gya, ',result.success)
            console.log(document.getElementById("userImage"));

            // Display generated image
            userImage.src = result.image_url + "?t=" + Date.now();
            console.log(userImage.src);
        } else {
            alert(result.error || "Generation failed.");
        }

    } catch (error) {
        console.error(error);
        alert("Error generating image.");
    } finally {
        hideLoader();
        generateBtn.innerText = "Generate Virtual Try-On";
        generateBtn.disabled = false;
    }
}


// ── Init ──────────────────────────────────────────────────────
buildGrids();
