import "./ai.css";

const handPhoto = document.getElementById("handPhoto");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");
const uploadText = document.getElementById("uploadText");
const suggestBtn = document.getElementById("suggestBtn");
const styleSelect = document.getElementById("style");
const result = document.getElementById("result");

handPhoto.addEventListener("change", function () {
  const file = handPhoto.files[0];

  if (!file) return;

  const imageURL = URL.createObjectURL(file);

  previewImage.src = imageURL;
  previewContainer.style.display = "block";
  uploadText.textContent = "✅ Hand photo selected";
});

const designs = {
  Any: [
    {
      name: "Elegant Nude",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "Soft nude nails with a clean and elegant finish."
    },
    {
      name: "Modern French",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "Classic French-inspired nails for an elegant look."
    },
    {
      name: "Glossy Pink",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "Glossy pink nails for a simple and feminine style."
    }
  ],

  Simple: [
    {
      name: "Minimal Nude",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "A simple nude design suitable for everyday wear."
    },
    {
      name: "Natural Pink",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "Soft pink nails with a natural glossy finish."
    },
    {
      name: "Clean White",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A clean and elegant white nail design."
    }
  ],

  Glitter: [
    {
      name: "Glitter Glam",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "A glamorous glitter-inspired nail look."
    },
    {
      name: "Rose Gold Style",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "Soft pink combined with a glamorous finish."
    },
    {
      name: "Sparkle Nails",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A sparkling design for parties and special occasions."
    }
  ],

  French: [
    {
      name: "Classic French Tips",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A timeless French-tip inspired design."
    },
    {
      name: "Soft French",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "A soft and elegant French-inspired appearance."
    },
    {
      name: "Modern French",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "A modern interpretation of the classic French style."
    }
  ],

  Chrome: [
    {
      name: "Pearl Chrome",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "Glossy pearl-inspired chrome nails."
    },
    {
      name: "Silver Chrome",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A modern metallic-inspired nail style."
    },
    {
      name: "Glossy Chrome",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "A shiny and luxurious chrome-inspired finish."
    }
  ],

  Bridal: [
    {
      name: "Bridal Elegance",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "Elegant soft tones suitable for bridal occasions."
    },
    {
      name: "Bridal French",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A sophisticated French-inspired bridal look."
    },
    {
      name: "Soft Bridal Pink",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "A delicate pink design for a bridal appearance."
    }
  ],

  Floral: [
    {
      name: "Floral Elegance",
      image:
        "https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg",
      description: "A soft feminine look inspired by floral nail art."
    },
    {
      name: "Pastel Floral",
      image:
        "https://images.pexels.com/photos/3997383/pexels-photo-3997383.jpeg",
      description: "A gentle pastel-inspired floral style."
    },
    {
      name: "Delicate Flowers",
      image:
        "https://images.pexels.com/photos/939835/pexels-photo-939835.jpeg",
      description: "A delicate design inspired by floral details."
    }
  ]
};

suggestBtn.addEventListener("click", function () {
  if (!handPhoto.files[0]) {
    result.innerHTML = `
      <p class="error">
        ⚠️ Please upload a hand photo first.
      </p>
    `;
    return;
  }

  const selectedStyle = styleSelect.value;
  const selectedDesigns = designs[selectedStyle];

  result.innerHTML = `
    <h2>🤖 Recommended Nail Designs</h2>
    <p class="result-subtitle">
      Here are some designs matching your selected style.
    </p>

    <div class="design-grid">
      ${selectedDesigns
        .map(
          (design) => `
            <div class="design-card">

              <img
                src="${design.image}"
                alt="${design.name}"
                class="design-image"
              >

              <h3>${design.name}</h3>

              <p>${design.description}</p>

              <button
                class="book-design-btn"
                data-design="${design.name}"
              >
                💅 Book This Design
              </button>

            </div>
          `
        )
        .join("")}
    </div>
  `;

  document.querySelectorAll(".book-design-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const designName = this.dataset.design;

      sessionStorage.setItem("selectedNailDesign", designName);

      window.location.href = "/booking.html";
    });
  });
});