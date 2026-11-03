
// =====================================
// SALSO OFFICIAL WEBSITE - ADMIN SYSTEM
// =====================================

// 1. SUPABASE CONNECTION
const SUPABASE_URL = "https://pzmtaaliocqxnenfeagv.supabase.co";
const SUPABASE_KEY = "sb_publishable_OQYhWvHhZKaVg8QoXa3eFg_rWO7vDi-";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// 2. PAGE ELEMENTS
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const newsForm = document.getElementById("news-form");
const newsList = document.getElementById("news-list");

let editingNewsId = null;
let currentImageUrl = null;

// 3. CHECK WHETHER USER IS AN APPROVED ADMIN
async function verifyAdmin() {
    const { data: { user }, error } =
        await supabaseClient.auth.getUser();

    if (error || !user) {
        showLogin();
        return false;
    }

    const { data, error: adminError } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !data) {
        await supabaseClient.auth.signOut();
        showLogin();
        loginError.textContent =
            "Access denied. This account is not an authorised SALSO administrator.";
        return false;
    }

    showDashboard();
    await loadNews();
    return true;
}

// 4. SHOW LOGIN OR DASHBOARD
function showLogin() {
    loginSection.style.display = "block";
    dashboard.style.display = "none";
}

function showDashboard() {
    loginSection.style.display = "none";
    dashboard.style.display = "block";
}

// 5. ADMIN LOGIN
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    loginError.style.display = "block";
    loginError.textContent = "Signing in...";

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.textContent = "Login failed. Check your email and password.";
        return;
    }

    const isAdmin = await verifyAdmin();

    if (isAdmin) {
        loginError.textContent = "";
    }
});

// 6. LOAD NEWS AND DRAFTS
async function loadNews() {
    newsList.textContent = "Loading news...";

    const { data, error } = await supabaseClient
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        newsList.textContent = "Unable to load news: " + error.message;
        return;
    }

    if (!data || data.length === 0) {
        newsList.textContent = "No news or drafts available yet.";
        return;
    }

    newsList.innerHTML = data.map(item => `
        <div class="news-item">
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.content)}</p>
            <p><strong>Status:</strong> ${escapeHTML(item.status)}</p>
            <button class="admin-btn" data-action="edit" data-id="${item.id}">
                Edit
            </button>
            <button class="admin-btn" data-action="delete" data-id="${item.id}">
                Delete
            </button>
        </div>
    `).join("");
}

// 7. PROTECT NEWS DISPLAY FROM HTML INJECTION
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// 8. SAVE OR UPDATE NEWS
newsForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("news-title").value.trim();
    const content = document.getElementById("news-content").value.trim();
    const imageFile = document.getElementById("news-image").files[0];
    const status = document.getElementById("news-status").value;

    if (!title || !content) {
        alert("Please enter the news title and content.");
        return;
    }

    const saveButton = document.getElementById("save-news-btn");
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    let image_url = currentImageUrl;

    // Upload selected image to Supabase Storage
    if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
            alert("Please select a valid image.");
            saveButton.disabled = false;
            saveButton.textContent = "Save News";
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            alert("Image must not exceed 5MB.");
            saveButton.disabled = false;
            saveButton.textContent = "Save News";
            return;
        }

        const extension = imageFile.name.split(".").pop()
            .toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

        const filePath = `${Date.now()}.${extension}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("news-images")
            .upload(filePath, imageFile);

        if (uploadError) {
            alert("Image upload failed: " + uploadError.message);
            saveButton.disabled = false;
            saveButton.textContent = "Save News";
            return;
        }

        const { data: publicData } = supabaseClient
            .storage
            .from("news-images")
            .getPublicUrl(filePath);

        image_url = publicData.publicUrl;
    }

    const newsData = {
        title,
        content,
        image_url,
        status
    };

    let result;

    if (editingNewsId) {
        result = await supabaseClient
            .from("news")
            .update(newsData)
            .eq("id", editingNewsId);
    } else {
        result = await supabaseClient
            .from("news")
            .insert([newsData]);
    }

    saveButton.disabled = false;
    saveButton.textContent = "Save News";

    if (result.error) {
        alert("Could not save news: " + result.error.message);
        return;
    }

    alert("News saved successfully.");
    resetNewsForm();
    await loadNews();
});



// 9. EDIT AND DELETE NEWS
newsList.addEventListener("click", async function(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        const { data, error } = await supabaseClient
            .from("news")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            alert("Unable to open news for editing.");
            return;
        }

        editingNewsId = data.id;

        document.getElementById("news-title").value = data.title;
        document.getElementById("news-content").value = data.content;
        currentImageUrl = data.image_url || null;
        document.getElementById("news-status").value = data.status;

        document.getElementById("form-heading").textContent = "Edit News";
        document.getElementById("save-news-btn").textContent = "Update News";
        document.getElementById("cancel-edit-btn").style.display = "inline-block";

        newsForm.scrollIntoView({ behavior: "smooth" });
    }

    if (action === "delete") {
        if (!confirm("Are you sure you want to delete this news?")) return;

        const { error } = await supabaseClient
            .from("news")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Unable to delete news: " + error.message);
            return;
        }

        alert("News deleted successfully.");
        await loadNews();
    }
});

// 10. RESET FORM
function resetNewsForm() {currentImageUrl = null;
    newsForm.reset();
    editingNewsId = null;

    document.getElementById("form-heading").textContent = "Publish News";
    document.getElementById("save-news-btn").textContent = "Save News";
    document.getElementById("cancel-edit-btn").style.display = "none";
}

// 11. CANCEL EDITING
document.getElementById("cancel-edit-btn").addEventListener("click", resetNewsForm);

// 12. LOGOUT
document.getElementById("logout-btn").addEventListener("click", async function() {
    await supabaseClient.auth.signOut();
    resetNewsForm();
    showLogin();
});

// 13. CHECK EXISTING LOGIN SESSION
verifyAdmin();
