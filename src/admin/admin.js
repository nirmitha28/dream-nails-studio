
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "DreamNails@2026";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin;

const $ = (id) => document.getElementById(id);

const loginBox = $("loginBox");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const loginMessage = $("loginMessage");
const dashboardMessage = $("dashboardMessage");
const bookingRows = $("bookingRows");

const galleryUploadForm = $("galleryUploadForm");
const galleryTitle = $("galleryTitle");
const galleryDescription = $("galleryDescription");
const galleryImage = $("galleryImage");
const galleryUploadButton = $("galleryUploadButton");
const galleryMessage = $("galleryMessage");
const adminGalleryGrid = $("adminGalleryGrid");
const adminGalleryEmptyMessage = $("adminGalleryEmptyMessage");

const refreshButton = $("refreshButton");
const refreshGalleryButton = $("refreshGalleryButton");

// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = $("username").value.trim();
  const password = $("password").value;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    loginMessage.textContent = "Incorrect username or password.";
    return;
  }

  loginMessage.textContent = "";
  loginBox.classList.add("hidden");
  dashboard.classList.remove("hidden");

  await Promise.all([loadBookings(), loadAdminGallery()]);
});

// REFRESH BOOKINGS
refreshButton.addEventListener("click", async () => {
  refreshButton.disabled = true;
  dashboardMessage.textContent = "Refreshing bookings...";

  await loadBookings();

  refreshButton.disabled = false;
});

// REFRESH GALLERY
refreshGalleryButton.addEventListener("click", async () => {
  refreshGalleryButton.disabled = true;
  adminGalleryEmptyMessage.textContent = "Refreshing gallery...";

  await loadAdminGallery();

  refreshGalleryButton.disabled = false;
});

// LOGOUT
$("logoutButton").addEventListener("click", () => {
  dashboard.classList.add("hidden");
  loginBox.classList.remove("hidden");
  loginForm.reset();
  bookingRows.replaceChildren();
  adminGalleryGrid.replaceChildren();
  dashboardMessage.textContent = "";
  galleryMessage.textContent = "";
  loginMessage.textContent = "";
});

// BOOKINGS
async function loadBookings() {
  dashboardMessage.textContent = "Loading bookings...";
  bookingRows.replaceChildren();

  try {
    const response = await fetch(`${API_URL}/api/bookings`);
    const bookings = await response.json();

    if (!response.ok) {
      throw new Error(bookings.message || "Unable to load bookings.");
    }

    if (!Array.isArray(bookings)) {
      throw new Error("Unexpected booking data received.");
    }

    if (bookings.length === 0) {
      dashboardMessage.textContent = "No bookings found.";
      return;
    }

    dashboardMessage.textContent = `${bookings.length} booking(s) found.`;

    bookings.forEach((booking) => {
      const row = document.createElement("tr");

      addCell(row, booking.name);
      addCell(row, booking.service);
      addCell(row, booking.date);
      addCell(row, booking.time);
      addCell(
        row,
        `Total: ₹${booking.totalPrice ?? "-"} | Advance: ₹${booking.advanceAmount ?? "-"} | Balance: ₹${booking.remainingBalance ?? "-"}`
      );

      const statusCell = document.createElement("td");
      const statusSelect = document.createElement("select");
      const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

      statuses.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
      });

      statusSelect.value = statuses.includes(booking.status)
        ? booking.status
        : "Pending";

      statusSelect.addEventListener("change", async () => {
        statusSelect.disabled = true;

        try {
          const response = await fetch(
            `${API_URL}/api/bookings/${encodeURIComponent(booking._id)}/status`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: statusSelect.value })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to update status.");
          }

          const updatedStatus = statusSelect.value;
          await loadBookings();
          dashboardMessage.textContent = `Status updated to ${updatedStatus}.`;
        } catch (error) {
          alert(`Status update failed: ${error.message}`);
          await loadBookings();
        }
      });

      statusCell.appendChild(statusSelect);
      row.appendChild(statusCell);

      const actionCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", async () => {
        if (!confirm("Permanently delete this booking?")) return;

        deleteButton.disabled = true;

        try {
          const response = await fetch(
            `${API_URL}/api/bookings/${encodeURIComponent(booking._id)}`,
            { method: "DELETE" }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to delete booking.");
          }

          await loadBookings();
          dashboardMessage.textContent = "Booking deleted successfully.";
        } catch (error) {
          alert(`Delete failed: ${error.message}`);
          deleteButton.disabled = false;
        }
      });

      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);
      bookingRows.appendChild(row);
    });
  } catch (error) {
    console.error("Bookings error:", error);
    dashboardMessage.textContent =
      `${error.message} Check that the backend is running.`;
  }
}

// GALLERY UPLOAD
galleryUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = galleryTitle.value.trim();
  const description = galleryDescription.value.trim();
  const file = galleryImage.files[0];

  if (!title || !file) {
    galleryMessage.textContent = "Enter a title and choose an image.";
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("image", file);

  galleryUploadButton.disabled = true;
  galleryMessage.textContent = "Uploading image...";

  try {
    const response = await fetch(`${API_URL}/api/gallery`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed.");
    }

    galleryUploadForm.reset();
    galleryMessage.textContent = "Image uploaded successfully!";
    await loadAdminGallery();
  } catch (error) {
    console.error("Gallery upload error:", error);
    galleryMessage.textContent = error.message;
  } finally {
    galleryUploadButton.disabled = false;
  }
});

// LOAD GALLERY
async function loadAdminGallery() {
  adminGalleryGrid.replaceChildren();
  adminGalleryEmptyMessage.textContent = "Loading gallery...";

  try {
    const response = await fetch(`${API_URL}/api/gallery`);
    const images = await response.json();

    if (!response.ok) {
      throw new Error(images.message || "Unable to load gallery.");
    }

    if (!Array.isArray(images) || images.length === 0) {
      adminGalleryEmptyMessage.textContent = "No uploaded images yet.";
      return;
    }

    adminGalleryEmptyMessage.textContent = "";

    images.forEach((image) => {
      const card = document.createElement("div");
      card.className = "gallery-card";

      const img = document.createElement("img");
      img.src = image.imageUrl.startsWith("http")
        ? image.imageUrl
        : `${API_URL}${image.imageUrl}`;
      img.alt = image.title || "Gallery image";
      img.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = image.title || "Untitled";

      const description = document.createElement("p");
      description.textContent = image.description || "";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete Image";

      deleteButton.addEventListener("click", async () => {
        if (!confirm(`Delete "${image.title || "this image"}"?`)) return;

        deleteButton.disabled = true;

        try {
          const response = await fetch(
            `${API_URL}/api/gallery/${encodeURIComponent(image._id)}`,
            { method: "DELETE" }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to delete image.");
          }

          galleryMessage.textContent = "Gallery image deleted.";
          await loadAdminGallery();
        } catch (error) {
          alert(`Delete failed: ${error.message}`);
          deleteButton.disabled = false;
        }
      });

      card.append(img, title, description, deleteButton);
      adminGalleryGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Gallery loading error:", error);
    adminGalleryEmptyMessage.textContent =
      `${error.message} Check the backend connection.`;
  }
}

// HELPER
function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "";
  row.appendChild(cell);
}
