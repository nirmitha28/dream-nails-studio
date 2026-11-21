
import './gallery.css';

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin;

export function galleryModule() {
  const html = `
    <section class="gallery-section">
      <h2>💅 Our Nail Art Gallery</h2>
      <p>Click any design to view it larger and give your rating.</p>

      <div class="gallery-grid" id="customerGalleryGrid">
        <div class="gallery-item">
          <img src="/images/nailart5.jpeg" alt="Nail Art 1" class="gallery-image">
          <h3>Design 1</h3>
          <div class="rating">
            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <button class="rate-btn" type="button">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailarti4.jpeg" alt="Nail Art 2" class="gallery-image">
          <h3>Design 2</h3>
          <div class="rating">
            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <button class="rate-btn" type="button">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartiamge2.jpeg" alt="Nail Art 3" class="gallery-image">
          <h3>Design 3</h3>
          <div class="rating">
            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <button class="rate-btn" type="button">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartiamge3.jpeg" alt="Nail Art 4" class="gallery-image">
          <h3>Design 4</h3>
          <div class="rating">
            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <button class="rate-btn" type="button">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartimage.jpeg" alt="Nail Art 5" class="gallery-image">
          <h3>Design 5</h3>
          <div class="rating">
            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <button class="rate-btn" type="button">Submit Rating</button>
        </div>
      </div>

      <p id="uploadedGalleryMessage"></p>

      <div id="imageViewer" class="image-viewer">
        <span id="closeViewer">&times;</span>
        <img id="zoomedImage" src="" alt="Zoomed Nail Art">
      </div>
    </section>
  `;

  // Run after the page inserts this returned HTML.
  setTimeout(() => {
    loadUploadedGallery();
  }, 0);

  return html;
}

// Load images uploaded through the Admin page
async function loadUploadedGallery() {
  const grid = document.getElementById("customerGalleryGrid");
  const message = document.getElementById("uploadedGalleryMessage");

  if (!grid) return;

  try {
    const response = await fetch(`${API_URL}/api/gallery`);
    const images = await response.json();

    if (!response.ok) {
      throw new Error(images.message || "Unable to load uploaded images.");
    }

    if (!Array.isArray(images) || images.length === 0) {
      if (message) message.textContent = "";
      return;
    }

    // Remove previously added uploaded images before refreshing.
    grid.querySelectorAll(".uploaded-gallery-item").forEach((item) => {
      item.remove();
    });

    images.forEach((image, index) => {
      const card = document.createElement("div");
      card.className = "gallery-item uploaded-gallery-item";

      const img = document.createElement("img");
      const imagePath = image.imageUrl || "";

      img.src = imagePath.startsWith("http")
        ? imagePath
        : `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;

      img.alt = image.title || `Uploaded Nail Art ${index + 1}`;
      img.className = "gallery-image";
      img.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = image.title || `Uploaded Design ${index + 1}`;

      const description = document.createElement("p");
      description.textContent = image.description || "";

      const rating = document.createElement("div");
      rating.className = "rating";

      for (let i = 0; i < 5; i++) {
        const star = document.createElement("span");
        star.textContent = "☆";
        rating.appendChild(star);
      }

      const rateButton = document.createElement("button");
      rateButton.className = "rate-btn";
      rateButton.type = "button";
      rateButton.textContent = "Submit Rating";

      card.append(img, title, description, rating, rateButton);
      grid.appendChild(card);
    });

    if (message) message.textContent = "";
  } catch (error) {
    console.error("Customer gallery loading error:", error);

    if (message) {
      message.textContent =
        "Unable to load uploaded images. Please check the backend connection.";
    }
  }
}

// Star rating, zoom and rating feedback
document.addEventListener("click", (event) => {
  const ratingContainer = event.target.closest(".rating");

  if (ratingContainer && event.target.tagName === "SPAN") {
    const stars = [...ratingContainer.querySelectorAll("span")];
    const selected = stars.indexOf(event.target) + 1;

    ratingContainer.dataset.rating = selected;

    stars.forEach((star, index) => {
      star.textContent = index < selected ? "★" : "☆";
    });
  }

  if (event.target.classList.contains("gallery-image")) {
    const viewer = document.getElementById("imageViewer");
    const zoomedImage = document.getElementById("zoomedImage");

    if (viewer && zoomedImage) {
      zoomedImage.src = event.target.src;
      viewer.classList.add("active");
    }
  }

  if (
    event.target.id === "closeViewer" ||
    event.target.id === "imageViewer"
  ) {
    document.getElementById("imageViewer")?.classList.remove("active");
  }

  if (event.target.classList.contains("rate-btn")) {
    const card = event.target.closest(".gallery-item");
    const rating = card?.querySelector(".rating")?.dataset.rating;

    if (!rating) {
      alert("Please select a star rating first.");
      return;
    }

    alert(`Thank you! You rated this design ${rating}/5.`);
  }
});