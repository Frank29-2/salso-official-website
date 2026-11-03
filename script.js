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
