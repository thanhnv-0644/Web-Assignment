// script.js — phiên bản có lưu localStorage + render lại danh sách
document.addEventListener("DOMContentLoaded", () => {
  const LS_KEY = "abcbook.products";

  // --- Phần tử DOM ---
  const searchInput = document.querySelector("#searchInput");
  const searchBtn = document.querySelector("#searchBtn");
  const addProductBtn = document.querySelector("#addProductBtn");
  const productList = document.querySelector("#productList");

  // Advanced filters
  const priceRange = document.querySelector("#priceRange");
  const clearFilters = document.querySelector("#clearFilters");

  const addProductForm = document.querySelector("#addProductForm");
  const newNameEl = document.querySelector("#newName");
  const newPriceEl = document.querySelector("#newPrice");
  const newImageEl = document.querySelector("#newImage");
  const newDescEl = document.querySelector("#newDesc");
  const cancelBtn = document.querySelector("#cancelBtn");
  const errorMsg = document.querySelector("#errorMsg");

  // Debug: Kiểm tra xem các phần tử có được tìm thấy không
  console.log("Form elements found:", {
    addProductForm: !!addProductForm,
    newNameEl: !!newNameEl,
    newPriceEl: !!newPriceEl,
    newImageEl: !!newImageEl,
    newDescEl: !!newDescEl,
    cancelBtn: !!cancelBtn,
    errorMsg: !!errorMsg,
  });

  // --- Utils ---
  const toVND = (n) => Number(n).toLocaleString("vi-VN") + "₫";
  const normalizeNumber = (s) => {
    if (s == null) return 0;
    // chấp nhận gõ 120.000 hoặc 120,000 hoặc kèm chữ
    const cleaned = String(s).replaceAll(",", "").replace(/[^\d]/g, "");
    return Number(cleaned || 0);
  };

  // --- LocalStorage helpers ---
  const loadProducts = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // Chưa có trong LS -> lấy từ HTML sẵn có làm dữ liệu khởi tạo
    const seed = [];
    productList.querySelectorAll(".product-item").forEach((item) => {
      const name =
        item.querySelector(".product-name")?.textContent?.trim() || "";
      const img = item.querySelector("img")?.src || "";
      // lấy đoạn <p> không phải "Giá:"
      const pTags = Array.from(item.querySelectorAll("p"));
      const descEl = pTags.find((p) => !p.textContent.trim().startsWith("Giá"));
      const desc = descEl ? descEl.textContent.trim() : "";
      const priceText = (
        pTags.find((p) => p.textContent.includes("Giá"))?.textContent || ""
      ).replace(/[^0-9]/g, "");
      const price = Number(priceText || 0);
      if (name) seed.push({ name, img, desc, price });
    });
    // Lưu seed lần đầu để lần sau còn dữ liệu
    saveProducts(seed);
    return seed;
  };

  const saveProducts = (arr) => {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  };

  // State chính
  let products = loadProducts();

  // --- Render list từ dữ liệu ---
  function renderProducts(list) {
    productList.innerHTML = "";
    list.forEach((p) => {
      const article = document.createElement("article");
      article.className = "product-item";

      const h3 = document.createElement("h3");
      h3.className = "product-name";
      h3.textContent = p.name;
      article.appendChild(h3);

      if (p.img) {
        const img = document.createElement("img");
        img.src = p.img;
        img.alt = p.name;
        article.appendChild(img);
      }

      if (p.desc) {
        const d = document.createElement("p");
        d.textContent = p.desc;
        article.appendChild(d);
      }

      const priceP = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Giá:";
      priceP.appendChild(strong);
      priceP.insertAdjacentText("beforeend", " " + toVND(p.price));
      article.appendChild(priceP);

      productList.appendChild(article);
    });
  }

  // Lần đầu vào trang: render từ localStorage (bao gồm cả seed đã lấy từ HTML)
  renderProducts(products);

  // --- Tìm kiếm / Lọc ---
  function applyFilter() {
    const kw = (searchInput?.value || "").trim().toLowerCase();
    const selectedPriceRange = priceRange?.value || "";

    let filtered = products;

    // Lọc theo từ khóa tìm kiếm
    if (kw) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(kw));
    }

    // Lọc theo khoảng giá
    if (selectedPriceRange) {
      filtered = filtered.filter((p) => {
        const price = p.price;
        switch (selectedPriceRange) {
          case "0-50000":
            return price < 50000;
          case "50000-100000":
            return price >= 50000 && price <= 100000;
          case "100000-150000":
            return price > 100000 && price <= 150000;
          case "150000+":
            return price > 150000;
          default:
            return true;
        }
      });
    }

    renderProducts(filtered);
  }

  searchBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    applyFilter();
  });
  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFilter();
      }
    });
  }

  // Event listeners cho advanced filters
  priceRange?.addEventListener("change", applyFilter);

  clearFilters?.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    priceRange.value = "";
    applyFilter();
  });

  // --- Toggle form ---
  addProductBtn?.addEventListener("click", () => {
    addProductForm.classList.toggle("hidden");
    if (!addProductForm.classList.contains("hidden")) {
      errorMsg.textContent = "";
      newNameEl.focus();
    }
  });

  cancelBtn?.addEventListener("click", () => {
    addProductForm.classList.add("hidden");
    errorMsg.textContent = "";
    // addProductForm.reset(); // nếu muốn clear luôn
  });

  // --- Submit form: validate + lưu + render lại + giữ filter hiện tại ---
  addProductForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Kiểm tra xem các phần tử có tồn tại không
    if (!newNameEl || !newPriceEl) {
      console.error("Thiếu ô Tên hoặc Giá trong form.");
      if (errorMsg) errorMsg.textContent = "Form thiếu ô Tên hoặc Giá.";
      return;
    }

    const name = newNameEl.value.trim();
    const desc = newDescEl?.value.trim() || "";
    const img = newImageEl?.value.trim() || "";
    const price = normalizeNumber(newPriceEl.value);

    // Validate
    if (!name) {
      if (errorMsg) errorMsg.textContent = "Vui lòng nhập tên sản phẩm.";
      newNameEl.focus();
      return;
    }
    if (!price || price <= 0) {
      if (errorMsg)
        errorMsg.textContent = "Giá phải là số hợp lệ và lớn hơn 0.";
      newPriceEl.focus();
      return;
    }
    if (desc && desc.length < 10) {
      if (errorMsg)
        errorMsg.textContent = "Mô tả nên có ít nhất 10 ký tự (tuỳ chọn).";
      if (newDescEl) newDescEl.focus();
      return;
    }
    if (errorMsg) errorMsg.textContent = "";

    // Thêm vào đầu danh sách dữ liệu
    products.unshift({ name, desc, img, price });
    saveProducts(products);

    // Render lại theo keyword hiện tại (để tương thích chức năng lọc)
    applyFilter();

    // Reset & ẩn form
    addProductForm.reset();
    addProductForm.classList.add("hidden");
  });
});
