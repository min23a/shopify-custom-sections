let formData = { items: [] };
let variant = false;
const itemCache = new Map(); // Cache for quick item access

const increment = (e) => {
    const qtyInput = e.target.parentNode.querySelector('[name="qty"]');
    qtyInput.value = parseInt(qtyInput.value) + 1;
    qtyUpdate(qtyInput);
};

const decrement = (e) => {
    const qtyInput = e.target.parentNode.querySelector('[name="qty"]');
    if (qtyInput.value > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        qtyUpdate(qtyInput);
    }
};

const variantSelector = (e) => {
    const pid = e.target.id.replace("ps-", "").trim();
    const qtyInput = document.getElementById(`qty-${pid}`);
    const selectedItem = formData.items.find(({ id }) => id === pid);
    if (selectedItem) {
        selectedItem.id = e.target.value;
    } else {
        formDataUpdate(e.target.value, qtyInput.value);
    }
    variant = true;
};

const setValue = (e) => {
    const value = e.target.value;
    const qtyInput = document.getElementById(`qty-${value}`);
    if (e.target.checked) {
        variant ? findItem(value, qtyInput.value) : formDataUpdate(value, qtyInput.value);
    } else {
        removeItem(value);
    }
};

const qtyUpdate = (qtyInput) => {
    const pid = qtyInput.id.replace("qty-", "").trim();
    const existingItem = formData.items.find(({ id }) => id === pid);

    if (existingItem) {
        existingItem.quantity = qtyInput.value;
    } else {
        const variantSelect = document.getElementById(`ps-${pid}`);
        if (variantSelect) findVariant(variantSelect.children, qtyInput.value);
    }
};

const findVariant = (options, qty) => {
    const selectedOption = Array.from(options).find((opt) => formData.items.some(({ id }) => id === opt.value));
    if (selectedOption) {
        const cachedItem = formData.items.find(({ id }) => id === selectedOption.value);
        cachedItem.quantity = qty;
    } else {
        console.log("Not added to cart");
    }
};

const findItem = (vid, qty) => {
    const existingItem = formData.items.find(({ id }) => id === vid);
    if (!existingItem) {
        formDataUpdate(vid, qty);
    }
};

const removeItem = (vid) => {
    formData.items = formData.items.filter(({ id }) => id !== vid);
};

const formDataUpdate = (id, qty = 1) => {
    const newItem = { id, quantity: qty };
    formData.items.push(newItem);
};

const getSection = async () => {
    try {
        const [cartDrawer, cartIconBubble] = await Promise.all([
            fetch("/?section_id=cart-drawer").then((res) => res.text()),
            fetch("/?section_id=cart-icon-bubble").then((res) => res.text())
        ]);
        return { t: cartDrawer, t2: cartIconBubble };
    } catch (error) {
        console.error("Error fetching sections:", error);
        return { t: "", t2: "" };
    }
};

const bundleAddToCart = async (e) => {
    e.preventDefault();
    const button = document.querySelector(".bundle_cta")
    button.children.add_cart.classList.add("hidden")
    button.children.spinner.classList.remove("hidden")
    try {
        if (formData.items.length >= 2) {
            const response = await fetch(window.Shopify.routes.root + "cart/add.js", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            const cartDrawer = document.querySelector("cart-drawer");

            if (!cartDrawer) {
                console.error("Cart drawer element not found");
                return;
            }

            const cartData = await getSection();
            const cartState = await fetch(window.Shopify.routes.root + "cart.js").then((res) => res.json());

            cartState.items = data.items;
            cartState.sections = {
                "cart-drawer": cartData.t,
                "cart-icon-bubble": cartData.t2
            };

            const parser = new DOMParser();
            const cartContent = parser.parseFromString(cartData.t, "text/html").querySelector("cart-drawer").innerHTML;

            cartDrawer.innerHTML = cartContent;
            cartDrawer.classList.remove("is-empty");
            cartDrawer.renderContents(cartState);
        } else {
            alert("Please Select Atleast 2 Products")
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
    }
    button.children.add_cart.classList.remove("hidden")
    button.children.spinner.classList.add("hidden")
};
