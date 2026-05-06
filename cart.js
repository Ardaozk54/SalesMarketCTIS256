const quantityInputs = document.querySelectorAll(".quantity-input");
const removeButtons = document.querySelectorAll(".remove-cart-button");
const purchaseButton = document.querySelector("#purchase-button");
const messageBox = document.querySelector("#cart-message");

function showMessage(message, isError = false) {
  messageBox.textContent = message;
  messageBox.className = isError ? "error" : "success";
}

quantityInputs.forEach((input) => {
  input.addEventListener("change", async () => {
    const cartItemId = input.dataset.cartItemId;
    const quantity = Number(input.value);

    const response = await fetch(`/cart/update/${cartItemId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    const result = await response.json();

    if (!result.success) {
      showMessage(result.message, true);

      if (result.oldQuantity) {
        input.value = result.oldQuantity;
      }

      return;
    }

    input.value = result.quantity;

    document.querySelector(`#item-total-${cartItemId}`).textContent =
      result.itemTotal.toFixed(2);

    document.querySelector("#grand-total").textContent =
      result.grandTotal.toFixed(2);

    showMessage("Cart updated.");
  });
});

removeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const cartItemId = button.dataset.cartItemId;

    const response = await fetch(`/cart/remove/${cartItemId}`, {
      method: "POST",
    });

    const result = await response.json();

    if (!result.success) {
      showMessage(result.message, true);
      return;
    }

    document.querySelector(`#cart-item-${cartItemId}`).remove();

    document.querySelector("#grand-total").textContent =
      result.grandTotal.toFixed(2);

    showMessage("Item removed from cart.");

    if (result.cartIsEmpty) {
      document.querySelector("#cart-list").innerHTML = "<p>Your cart is empty.</p>";
      document.querySelector("#cart-total-box").remove();
    }
  });
});

if (purchaseButton) {
  purchaseButton.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to purchase these products?");

    if (!confirmed) {
      return;
    }

    const response = await fetch("/cart/purchase", {
      method: "POST",
    });

    const result = await response.json();

    if (!result.success) {
      showMessage(result.message, true);
      return;
    }

    document.querySelector("#cart-list").innerHTML = "<p>Your cart is empty.</p>";
    document.querySelector("#cart-total-box").remove();

    showMessage("Purchase completed successfully.");
  });
}