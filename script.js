// SUPABASE CONNECTION
const SUPABASE_URL = "https://pzmtaaliocqxnenfeagv.supabase.co";
const SUPABASE_KEY = "sb_publishable_OQYhWvHhZKaVg8QoXa3eFg_rWO7vDi-";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
/* =================================
   SALSO OFFICIAL WEBSITE
   JavaScript Functionality
================================= */

// Automatically update the copyright year
const yearElement = document.getElementById("current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Highlight navigation links when clicked
const navigationLinks = document.querySelectorAll(
  ".main-header nav a"
);

navigationLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navigationLinks.forEach((item) => {
      item.classList.remove("active");
    });

    this.classList.add("active");
  });
});

// Log website readiness
console.log("SALSO Official Website is running.");

// =====================================
// LOAD OFFICIAL SALSO NEWS
// =====================================

async function loadHomepageNews() {
    const newsGrid = document.getElementById("news-grid");

    if (!newsGrid) return;

    newsGrid.innerHTML = "<p>Loading latest news...</p>";

    const { data, error } = await supabaseClient
        .from("news")
        .select("id, title, content, image_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        newsGrid.innerHTML = "<p>Unable to load news at the moment.</p>";
        console.error("News loading error:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        newsGrid.innerHTML = "<p>No news published yet.</p>";
        return;
    }

    const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

    newsGrid.innerHTML = data.map(item => {
        const date = item.published_at
            ? new Date(item.published_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })
            : "";

        const image = item.image_url
    ? `<img src="${item.image_url}" alt="${escapeHTML(item.title)}" class="news-image" style="width:100%; height:220px; object-fit:cover; display:block;">`
    : "";

        

const preview = (item.content || "").length > 160
    ? (item.content || "").slice(0, 160).trim() + "..."
    : (item.content || "");

return `
    <article class="news-card">
        ${image}
        <div class="news-card-content">
            <p class="news-date">${escapeHTML(date)}</p>
            <h3>
                <a href="news.html?id=${encodeURIComponent(item.id)}"
                   class="news-title-link">
                    ${escapeHTML(item.title)}
                </a>
            </h3>
            <p>${escapeHTML(preview)}</p>
            <a href="news.html?id=${encodeURIComponent(item.id)}"
               class="read-more">
                Read Full Story →
            </a>
        </div>
    </article>
`;

    }).join("");
}


async function loadHomepageNews() {
    const newsGrid = document.getElementById("news-grid");
    if (!newsGrid) return;

    newsGrid.innerHTML = "<p>Loading latest news...</p>";

    const { data, error } = await supabaseClient
        .from("news")
        .select("id, title, content, image_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
        newsGrid.textContent = error
            ? "Unable to load news at the moment."
            : "No news published yet.";
        return;
    }

    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

    newsGrid.classList.add("news-slider");

    newsGrid.innerHTML = data.map((item, index) => {
        const date = item.published_at
            ? new Date(item.published_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })
            : "";

        const image = item.image_url
            ? `<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.title)}" class="news-image">`
            : "";

        const content = item.content || "";
        const preview = content.length > 160
            ? content.slice(0, 160).trim() + "..."
            : content;

        return `
            <article class="news-card news-slide ${index === 0 ? "active" : ""}">
                <a href="news.html?id=${encodeURIComponent(item.id)}"
                   class="news-title-link">
                    ${image}
                    <div class="news-card-content">
                        <p class="news-date">${escapeHTML(date)}</p>
                        <h3>${escapeHTML(item.title)}</h3>
                        <p>${escapeHTML(preview)}</p>
                        <span class="read-more">Read Full Story →</span>
                    </div>
                </a>
            </article>
        `;
    }).join("");

    let currentSlide = 0;
    const slides = newsGrid.querySelectorAll(".news-slide");

    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }, 3000);
    }
}

loadHomepageNews();



// =====================================
// SALSO SCROLL-AWARE NAVIGATION
// =====================================

const pageSections = document.querySelectorAll(
  "section[id]"
);

const navLinks = document.querySelectorAll(
  '.main-header nav a[href*="#"]'
);

window.addEventListener("scroll", () => {
  let currentSection = "";

  pageSections.forEach((section) => {
    const sectionTop = section.offsetTop - 130;

    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (
      currentSection &&
      link.getAttribute("href").endsWith("#" + currentSection)
    ) {
      link.classList.add("active");
    }
  });
});

// =====================================
// SALSO MOBILE MENU FUNCTIONALITY
// =====================================

const menuToggle = document.getElementById("menu-toggle");
const mainNavigation = document.getElementById("main-navigation");

if (menuToggle && mainNavigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNavigation.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  mainNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNavigation.classList.remove("open");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}
