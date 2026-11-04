
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

// Display text while making web links clickable
function renderContent(container, text) {
    const urlPattern = /https?:\/\/[^\s<>"']+/gi;
    const parts = text.split(urlPattern);
    const urls = text.match(urlPattern) || [];

    parts.forEach((part, index) => {
        container.appendChild(document.createTextNode(part));

        if (urls[index]) {
            let url = urls[index];
            let trailing = "";

            while (/[.,!?;:)]$/.test(url)) {
                trailing = url.slice(-1) + trailing;
                url = url.slice(0, -1);
            }

            const link = document.createElement("a");
            link.href = url;
            link.textContent = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            container.appendChild(link);
            container.appendChild(document.createTextNode(trailing));
        }
    });
}

async function loadNewsDetails() {
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get("id");

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

    const article = document.createElement("article");
    article.className = "full-news-article";

    const heading = document.createElement("h1");
    heading.textContent = data.title;

    const date = document.createElement("p");
    date.className = "news-date";
    date.textContent = data.published_at
        ? new Date(data.published_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        : "";

    article.append(heading, date);

    if (data.image_url) {
        const image = document.createElement("img");
        image.src = data.image_url;
        image.alt = data.title;
        image.className = "news-details-image";
        article.appendChild(image);
    }

    const content = document.createElement("div");
    content.className = "news-full-content";
    content.style.whiteSpace = "pre-wrap";

    renderContent(content, data.content || "");

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
        const titleLink = document.createElement("a");

        titleLink.href = `news.html?id=${encodeURIComponent(item.id)}`;
        titleLink.textContent = item.title;

        title.appendChild(titleLink);
        card.appendChild(title);

        if (item.image_url) {
            const image = document.createElement("img");
            image.src = item.image_url;
            image.alt = item.title;
            image.className = "news-card-image";
            card.appendChild(image);
        }

        const excerpt = document.createElement("p");
        const fullText = item.content || "";

        excerpt.textContent = fullText.length > 180
            ? fullText.slice(0, 180).trim() + "..."
            : fullText;

        card.appendChild(excerpt);

        const readMore = document.createElement("a");
        readMore.href = `news.html?id=${encodeURIComponent(item.id)}`;
        readMore.textContent = "Read More →";
        readMore.className = "read-more";

        card.appendChild(readMore);

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

