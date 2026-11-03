
// =====================================
// SALSO NEWS DETAILS SYSTEM
// =====================================

const SUPABASE_URL = "https://pzmtaaliocqxnenfeagv.supabase.co";
const SUPABASE_KEY = "sb_publishable_OQYhWvHhZKaVg8QoXa3eFg_rWO7vDi-";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const newsDetails = document.getElementById("news-details");

async function loadNewsDetails() {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get("id");

    if (!newsId || !/^\d+$/.test(newsId)) {
        newsDetails.textContent = "News article not found.";
        return;
    }

    const { data, error } = await supabaseClient
        .from("news")
        .select("title, content, image_url, published_at")
        .eq("id", newsId)
        .eq("status", "published")
        .maybeSingle();

    if (error || !data) {
        newsDetails.textContent = "Unable to find this news article.";
        return;
    }

    const date = data.published_at
        ? new Date(data.published_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        : "";

    const article = document.createElement("article");
    article.className = "full-news-article";

    const heading = document.createElement("h1");
    heading.textContent = data.title;

    const dateElement = document.createElement("p");
    dateElement.className = "news-date";
    dateElement.textContent = date;

    article.appendChild(heading);
    article.appendChild(dateElement);

    if (data.image_url) {
        const image = document.createElement("img");
image.src = data.image_url;
image.alt = data.title;
image.className = "news-details-image";

image.style.width = "100%";
image.style.maxWidth = "550px";
image.style.height = "280px";
image.style.objectFit = "contain";
image.style.display = "block";
image.style.margin = "20px auto";

article.appendChild(image);
    }

    const content = document.createElement("p");
    content.className = "news-full-content";
    content.style.whiteSpace = "pre-wrap";
    content.textContent = data.content;

    article.appendChild(content);

    newsDetails.replaceChildren(article);

    document.title = data.title + " | SALSO";
}

document.getElementById("current-year").textContent =
    new Date().getFullYear();

loadNewsDetails();
