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
            ? `<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.title)}" class="news-image">`
            : "";

        return `
            <article class="news-card">
                ${image}
                <div class="news-card-content">
                    <p class="news-date">${escapeHTML(date)}</p>
                    <h3>${escapeHTML(item.title)}</h3>
                    <p>${escapeHTML(item.content)}</p>
                </div>
            </article>
        `;
    }).join("");
}

loadHomepageNews();

