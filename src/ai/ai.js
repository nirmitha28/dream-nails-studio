
import "./ai.css";

const handPhoto = document.getElementById("handPhoto");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadText = document.getElementById("uploadText");
const suggestBtn = document.getElementById("suggestBtn");
const styleSelect = document.getElementById("style");
const result = document.getElementById("result");

handPhoto.addEventListener("change", () => {
  const file = handPhoto.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    result.textContent = "Please select a valid image.";
    handPhoto.value = "";
    return;
  }

  const imageURL = URL.createObjectURL(file);
  previewImage.src = imageURL;
  previewContainer.style.display = "block";
  uploadText.textContent = "✅ Hand photo selected";
  result.innerHTML = "";
});

suggestBtn.addEventListener("click", async () => {
  const file = handPhoto.files[0];

  if (!file) {
    result.textContent = "⚠️ Please upload a hand photo first.";
    return;
  }

  // Keep the image size reasonable for the API.
  if (file.size > 5 * 1024 * 1024) {
    result.textContent = "Please choose an image smaller than 5 MB.";
    return;
  }

  // Convert the selected photo to a Base64 data URL.
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  }).catch((error) => {
    result.textContent = error.message;
    return null;
  });

  if (!image) return;

  suggestBtn.disabled = true;
  suggestBtn.textContent = "🤖 Analysing your photo...";
  result.textContent = "Please wait while AI recommends your nail designs.";

  try {
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image,
        style: styleSelect.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "AI recommendation failed.");
    }

    if (!Array.isArray(data.recommendations)) {
      throw new Error("The AI returned an unexpected response.");
    }

    result.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "🤖 Your AI Nail Recommendations";
    result.appendChild(heading);

    const analysis = document.createElement("p");
    analysis.className = "result-subtitle";
    analysis.textContent = data.analysis || "Recommendations based on your selected style.";
    result.appendChild(analysis);

    const grid = document.createElement("div");
    grid.className = "design-grid";

    data.recommendations.forEach((design) => {
      const card = document.createElement("div");
      card.className = "design-card";

      const title = document.createElement("h3");
      title.textContent = design.name || "Nail Design";

      const shape = document.createElement("p");
      shape.textContent = `Shape: ${design.shape || "Not specified"}`;

      const length = document.createElement("p");
      length.textContent = `Length: ${design.length || "Not specified"}`;

      const description = document.createElement("p");
      description.textContent = design.description || "";

      const bookButton = document.createElement("button");
      bookButton.className = "book-design-btn";
      bookButton.textContent = "💅 Book This Design";

      bookButton.addEventListener("click", () => {
        sessionStorage.setItem(
          "selectedNailDesign",
          design.name || "AI Recommended Design"
        );
        window.location.href = "/booking.html";
      });

      card.append(title, shape, length, description, bookButton);
      grid.appendChild(card);
    });

    result.appendChild(grid);
  } catch (error) {
    result.textContent = `⚠️ ${error.message} Please try again.`;
  } finally {
    suggestBtn.disabled = false;
    suggestBtn.textContent = "🤖 Suggest Nail Design";
  }
});
