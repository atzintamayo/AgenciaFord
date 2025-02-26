export function setupEventListeners() {
    // Aseguramos que el código se ejecuta en el navegador
    if (typeof window === "undefined") return;
  
    const jsFilter = document.querySelector(".jsFilter");
    const filterMenu = document.querySelector(".filter-menu");
  
    const gridButton = document.querySelector(".grid");
    const listButton = document.querySelector(".list");
    const productsWrapper = document.querySelector(".products-area-wrapper");
  
    const modeSwitch = document.querySelector(".mode-switch");
  
    if (jsFilter && filterMenu) {
      jsFilter.addEventListener("click", () => {
        filterMenu.classList.toggle("active");
      });
    }
  
    if (gridButton && listButton && productsWrapper) {
      gridButton.addEventListener("click", () => {
        listButton.classList.remove("active");
        gridButton.classList.add("active");
        productsWrapper.classList.add("gridView");
        productsWrapper.classList.remove("tableView");
      });
  
      listButton.addEventListener("click", () => {
        listButton.classList.add("active");
        gridButton.classList.remove("active");
        productsWrapper.classList.remove("gridView");
        productsWrapper.classList.add("tableView");
      });
    }
  
    if (modeSwitch) {
      modeSwitch.addEventListener("click", () => {
        document.documentElement.classList.toggle("light");
        modeSwitch.classList.toggle("active");
      });
    }
  }
  