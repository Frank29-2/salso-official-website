
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

    // Without ID: display all published news
    if (!newsId) {
        await loadAllNews();
        return;
    }

    if (!/^\d+$/.test(newsId)) {
        showMessage("Invalid news article.");
        return;
    }

    const { data, error } = await supabaseClient
        .from("news")
        .select("title, content, image_url, published_at")
        .eq("id", newsId)
        .eq("status", "published")
        .maybeSingle();

    if (error || !data) {
        showMessage("This news article is currently unavailable.");
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

    article.append(heading, dateElement);

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

async function loadAllNews() {
    document.title = "News & Updates | SALSO";

    newsDetails.replaceChildren();

    const heading = document.createElement("h1");
    heading.textContent = "SALSO News & Updates";

    const intro = document.createElement("p");
    intro.textContent =
        "Stay informed about the latest news, announcements, activities and events of the SAUT Law Society.";

    newsDetails.append(heading, intro);

    const { data, error } = await supabaseClient
        .from("news")
        .select("id, title, content, image_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        showMessage("News are temporarily unavailable. Please try again later.");
        return;
    }

    if (!data || data.length === 0) {
        showMessage("There are currently no published news articles.");
        return;
    }

    data.forEach(item => {
        const card = document.createElement("article");
        card.className = "news-card";

        const title = document.createElement("h2");
        const link = document.createElement("a");
        link.href = `news.html?id=${encodeURIComponent(item.id)}`;
        link.textContent = item.title;
        title.appendChild(link);

        const excerpt = document.createElement("p");
        excerpt.textContent = (item.content || "").slice(0, 180);

        card.append(title, excerpt);

        if (item.published_at) {
            const date = document.createElement("p");
            date.className = "news-date";
            date.textContent = new Date(item.published_at)
                .toLocaleDateString("en-GB");
            card.appendChild(date);
        }

        newsDetails.appendChild(card);
    });
}

function showMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    newsDetails.replaceChildren(paragraph);
}

const yearElement = document.getElementById("current-year");
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

loadNewsDetails();
