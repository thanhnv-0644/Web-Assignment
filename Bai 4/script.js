// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Lấy các phần tử DOM
  const searchInput = document.querySelector("#searchInput");
  const searchBtn = document.querySelector("#searchBtn");
  const addProductBtn = document.querySelector("#addProductBtn");
  const addProductForm = document.querySelector("#addProductForm");
  const productList = document.querySelector("#productList");

  // --- 1) LỌC SẢN PHẨM ---
  function filterProducts() {
    const keyword = (searchInput.value || "").trim().toLowerCase();
    const items = productList.querySelectorAll(".product-item");

    items.forEach((item) => {
      const nameEl = item.querySelector(".product-name");
      const nameText = (nameEl?.textContent || "").toLowerCase();
      // Hiển thị nếu tên chứa keyword, ngược lại ẩn
      if (!keyword || nameText.includes(keyword)) {
        item.style.display = ""; // trở về trạng thái mặc định của CSS
      } else {
        item.style.display = "none";
      }
    });
  }

  // Click nút Tìm
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    filterProducts();
  });

  // Lọc realtime khi gõ (keyup hoặc input đều được)
  searchInput.addEventListener("keyup", filterProducts);
  searchInput.addEventListener("input", filterProducts);

  // Nhấn Enter trong input = hành vi Tìm
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      filterProducts();
    }
  });

  // --- 2) TOGGLE FORM THÊM SẢN PHẨM ---
  addProductBtn.addEventListener("click", () => {
    // Cách dùng classList.toggle theo yêu cầu
    addProductForm.classList.toggle("hidden");
  });

  // --- 3) SUBMIT FORM ĐỂ THÊM VÀO DANH SÁCH ---
  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.querySelector("#title").value.trim();
    const image = document.querySelector("#image").value.trim();
    const desc = document.querySelector("#desc").value.trim();
    const price = document.querySelector("#price").value.trim();

    if (!title || !price) {
      alert("Vui lòng nhập tối thiểu Tên sách và Giá.");
      return;
    }

    // Tạo article mới bằng DOM API
    const article = document.createElement("article");
    article.className = "product-item";

    // Ảnh (nếu có)
    const imgHTML = image ? `<img src="${image}" alt="${title}">` : "";

    article.innerHTML = `
      <h3 class="product-name">${title}</h3>
      ${imgHTML}
      ${desc ? `<p>${desc}</p>` : ""}
      <p><strong>Giá:</strong> ${Number(price).toLocaleString("vi-VN")}₫</p>
    `;

    productList.appendChild(article);

    // Dọn form + ẩn form + cập nhật lọc đang có (nếu người dùng đang dùng keyword)
    addProductForm.reset();
    addProductForm.classList.add("hidden");
    filterProducts();
  });
});
