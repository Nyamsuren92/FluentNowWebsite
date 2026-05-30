async function loadProducts() {
  const response = await fetch("/api/products");
  const products = await response.json();

  const productList = document.getElementById("product-list");

  productList.innerHTML = "";

  products.forEach(product => {
    productList.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>€${product.price}</p>

        <button onclick="addToBasket(${product.id})">
          Add to Basket
        </button>
      </div>
    `;
  });
}

async function addToBasket(productId) {
  await fetch("/api/basket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product_id: productId
    })
  });

  loadBasket();
}

async function loadBasket() {
  const response = await fetch("/api/basket");
  const basket = await response.json();

  const basketList = document.getElementById("basket-list");

  basketList.innerHTML = "";

  basket.forEach(item => {
    basketList.innerHTML += `
      <div class="basket-item">
        <h3>${item.name}</h3>
        <p>€${item.price}</p>

        <button onclick="removeItem(${item.id})">
          Remove
        </button>
      </div>
    `;
  });
}

async function removeItem(id) {
  await fetch(`/api/basket/${id}`, {
    method: "DELETE"
  });

  loadBasket();
}

async function checkout() {
  await fetch("/api/checkout", {
    method: "POST"
  });

  alert("Checkout successful!");

  loadBasket();
}

loadProducts();
loadBasket();