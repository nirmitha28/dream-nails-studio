import "./ai.css";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin;

const handPhoto = document.getElementById("handPhoto");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadText = document.getElementById("uploadText");
const suggestBtn = document.getElementById("suggestBtn");
const styleSelect = document.getElementById("style");
const result = document.getElementById("result");

// Five built-in sample designs
const builtInDesigns = [
  {
    title: "Elegant French Tips",
    description: "Classic nude nails with clean white tips.",
    style: "french",
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Pink Glitter Glam",
    description: "Soft pink nails with a sparkling finish.",
    style: "glitter",
    imageUrl:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Floral Nail Art",
    description: "Delicate floral details for a cute look.",
    style: "floral",
    imageUrl:
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Red Party Nails",
    description: "Bold red nails for parties and special occasions.",
    style: "party",
    imageUrl:
      "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Minimal Nude Nails",
    description: "Simple nude shades for everyday elegance.",
    style: "simple",
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=85",
  },
];

function getImageUrl(image) {
  const path = image.imageUrl || image.url || "";

  if (!path) return "";
  if (path.startsWith("http")) return path;

  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function getGalleryImages() {
  try {
    const response = await fetch(`${API_URL}/api/gallery`);

    if (!response.ok) {
      console.warn("Gallery API returned an error.");
      return [];
    }

    const images = await response.json();

    if (!Array.isArray(images)) return [];

    return images
      .map((image, index) => ({
        title: image.title || `Gallery Design ${index + 1}`,
        description:
          image.description || "A design from our nail art gallery.",
        style: "gallery",
        imageUrl: getImageUrl(image),
      }))
      .filter((design) => design.imageUrl);
  } catch (error) {
    console.warn("Unable to load gallery images:", error);
    return [];
  }
}

function renderDesigns(designs) {
  result.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = "✨ Your Nail Design Suggestions";

  const subtitle = document.createElement("p");
  subtitle.className = "result-subtitle";
  subtitle.textContent = "Explore these nail design ideas.";

  const grid = document.createElement("div");
  grid.className = "design-grid";

  designs.forEach((design, index) => {
    const card = document.createElement("div");
    card.className = "design-card";

    const img = document.createElement("img");
    img.className = "design-gallery-image";
    img.src = design.imageUrl;
    img.alt = design.title;
    img.loading = "eager";

    img.onerror = () => {
      img.onerror = null;
      img.alt = "Image could not be loaded";
      img.style.display = "none";
    };

    const title = document.createElement("h3");
    title.textContent = design.title || `Nail Design ${index + 1}`;

    const description = document.createElement("p");
    description.textContent = design.description;

    const bookButton = document.createElement("button");
    bookButton.type = "button";
    bookButton.className = "book-design-btn";
    bookButton.textContent = "💅 Book This Design";

    bookButton.addEventListener("click", () => {
      sessionStorage.setItem(
        "selectedNailDesign",
        design.title || `Nail Design ${index + 1}`
      );
      window.location.href = "/booking.html";
    });

    card.append(img, title, description, bookButton);
    grid.appendChild(card);
  });

  result.append(heading, subtitle, grid);
}

if (
  handPhoto &&
  previewImage &&
  previewContainer &&
  uploadText &&
  suggestBtn &&
  styleSelect &&
  result
) {
  // Hand-photo upload and preview
  handPhoto.addEventListener("change", () => {
    const file = handPhoto.files?.[0];
    result.replaceChildren();

    if (!file) {
      uploadText.textContent = "📷 Click to upload your hand photo";
      previewContainer.style.display = "none";
      return;
    }

    if (!file.type.startsWith("image/")) {
      result.textContent = "⚠️ Please select a valid image.";
      handPhoto.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      result.textContent = "⚠️ Please choose an image smaller than 5 MB.";
      handPhoto.value = "";
      return;
    }

    if (previewImage.dataset.objectUrl) {
      URL.revokeObjectURL(previewImage.dataset.objectUrl);
    }

    const imageURL = URL.createObjectURL(file);
    previewImage.dataset.objectUrl = imageURL;
    previewImage.src = imageURL;

    previewContainer.style.display = "block";
    uploadText.textContent = "✅ Hand photo selected";
  });

  // Suggest designs button
  suggestBtn.addEventListener("click", async () => {
    const file = handPhoto.files?.[0];

    if (!file) {
      result.textContent = "⚠️ Please upload a hand photo first.";
      return;
    }

    if (!file.type.startsWith("image/")) {
      result.textContent = "⚠️ Please select a valid image.";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      result.textContent = "⚠️ Please choose an image smaller than 5 MB.";
      return;
    }

    suggestBtn.disabled = true;
    suggestBtn.textContent = "Loading designs...";
    result.replaceChildren();

    try {
      const galleryDesigns = await getGalleryImages();

      // Combine built-in designs and uploaded gallery designs
      let allDesigns = [...builtInDesigns, ...galleryDesigns];

      // Remove duplicate image URLs
      const uniqueDesigns = [];
      const usedImages = new Set();

      for (const design of allDesigns) {
        const imageKey = design.imageUrl.trim();

        if (imageKey && !usedImages.has(imageKey)) {
          usedImages.add(imageKey);
          uniqueDesigns.push(design);
        }
      }

      allDesigns = uniqueDesigns;

      // Apply selected style when matching designs are available
      const selectedStyle = (styleSelect.value || "any").toLowerCase();

      if (selectedStyle !== "any") {
        const matchingDesigns = allDesigns.filter((design) => {
          const searchableText =
            `${design.title} ${design.description} ${design.style}`.toLowerCase();

          return searchableText.includes(selectedStyle);
        });

        if (matchingDesigns.length > 0) {
          allDesigns = matchingDesigns;
        }
      }

      // Show up to 3 different designs—never repeat the first card
      const suggestions = allDesigns.slice(0, 3);

      if (suggestions.length === 0) {
        result.textContent =
          "No designs are available. Please check your gallery images.";
        return;
      }

      renderDesigns(suggestions);
    } catch (error) {
      console.error("Suggestion error:", error);
      result.textContent = "Unable to load designs. Please try again.";
    } finally {
      suggestBtn.disabled = false;
      suggestBtn.textContent = "🤖 Suggest Nail Design";
    }
  });
} else {
  console.error(
    "AI page elements were not found. Check the IDs in ai.html."
  );
}