
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const DIST_PATH = path.join(__dirname, "../dist");

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize OpenAI only when an API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ==================================================
// FRONTEND PAGE ROUTES
// ==================================================

app.use(express.static(DIST_PATH));

// Serve the home page
app.get("/", (req, res) => {
  const indexPath = path.join(DIST_PATH, "index.html");
  const homePath = path.join(DIST_PATH, "home.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  if (fs.existsSync(homePath)) {
    return res.sendFile(homePath);
  }

  return res.status(404).send(
    "Frontend build not found. Run npm run build in the project folder."
  );
});

// Support the separate HTML pages
const pages = [
  "home",
  "services",
  "gallery",
  "booking",
  "contact",
  "admin",
  "ai"
];

pages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    const pagePath = path.join(DIST_PATH, `${page}.html`);

    if (fs.existsSync(pagePath)) {
      return res.sendFile(pagePath);
    }

    return res.status(404).send(
      `${page}.html was not found in the dist folder.`
    );
  });
});

// ==================================================
// BOOKING SCHEMA
// ==================================================

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

// CREATE BOOKING
app.post("/api/bookings", async (req, res) => {
  try {
    const { name, phone, service, date, time } = req.body;

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({
        message: "Please fill all booking fields."
      });
    }

    const booking = await Booking.create({
      name,
      phone,
      service,
      date,
      time
    });

    res.status(201).json({
      message: "Booking successful!",
      booking
    });
  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).json({
      message: "Failed to save booking."
    });
  }
});

// GET ALL BOOKINGS
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error.message);
    res.status(500).json({
      message: "Failed to fetch bookings."
    });
  }
});

// UPDATE BOOKING STATUS
app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status."
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    res.json({
      message: "Booking status updated successfully!",
      booking
    });
  } catch (error) {
    console.error("Status update error:", error.message);
    res.status(500).json({
      message: "Failed to update booking status."
    });
  }
});

// DELETE BOOKING
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    res.json({
      message: "Booking deleted successfully!"
    });
  } catch (error) {
    console.error("Delete booking error:", error.message);
    res.status(500).json({
      message: "Failed to delete booking."
    });
  }
});

// ==================================================
// CUSTOMER FEEDBACK
// ==================================================

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    experience: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

// CREATE FEEDBACK
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, rating, experience } = req.body;
    const numericRating = Number(rating);

    if (
      !name ||
      !experience ||
      rating === undefined ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Enter your name, experience, and a rating from 1 to 5."
      });
    }

    const feedback = await Feedback.create({
      name,
      rating: numericRating,
      experience
    });

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback
    });
  } catch (error) {
    console.error("Feedback error:", error.message);
    res.status(500).json({
      message: "Failed to save feedback."
    });
  }
});

// GET ALL FEEDBACK
app.get("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error("Fetch feedback error:", error.message);
    res.status(500).json({
      message: "Failed to fetch feedback."
    });
  }
});

// DELETE FEEDBACK
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found."
      });
    }

    res.json({
      message: "Feedback deleted successfully!"
    });
  } catch (error) {
    console.error("Delete feedback error:", error.message);
    res.status(500).json({
      message: "Failed to delete feedback."
    });
  }
});

// ==================================================
// GALLERY RATINGS
// ==================================================

const galleryRatingSchema = new mongoose.Schema(
  {
    design: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);

const GalleryRating = mongoose.model(
  "GalleryRating",
  galleryRatingSchema
);

// CREATE GALLERY RATING
app.post("/api/ratings", async (req, res) => {
  try {
    const { design, rating } = req.body;
    const numericRating = Number(rating);

    if (
      !design ||
      rating === undefined ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Provide a design name and rating from 1 to 5."
      });
    }

    const galleryRating = await GalleryRating.create({
      design,
      rating: numericRating
    });

    res.status(201).json({
      message: "Rating submitted successfully!",
      rating: galleryRating
    });
  } catch (error) {
    console.error("Gallery rating error:", error.message);
    res.status(500).json({
      message: "Failed to save gallery rating."
    });
  }
});

// GET GALLERY RATINGS
app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await GalleryRating.find().sort({
      createdAt: -1
    });

    res.json(ratings);
  } catch (error) {
    console.error("Fetch ratings error:", error.message);
    res.status(500).json({
      message: "Failed to fetch gallery ratings."
    });
  }
});

// ==================================================
// AI NAIL DESIGN RECOMMENDATIONS
// ==================================================

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { image, style } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        message: "Please upload a hand photo."
      });
    }

    if (!openai) {
      return res.status(503).json({
        message: "AI is not configured. Check OPENAI_API_KEY."
      });
    }

    const selectedStyle = style || "Any";

    const response = await openai.responses.create({
      // Use a vision-capable model available to your API account.
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are a professional nail design recommendation assistant.

Analyze only visible features in the uploaded hand photo.

Consider:
- Apparent natural nail length
- Visible nail shape
- Finger proportions
- Visible nail condition
- Suitable nail shapes and lengths

Preferred style: ${selectedStyle}

Recommend exactly 3 different nail designs.

Return only valid JSON using this structure:
{
  "analysis": "short explanation",
  "recommendations": [
    {
      "name": "design name",
      "shape": "recommended nail shape",
      "length": "recommended length",
      "description": "short description"
    },
    {
      "name": "design name",
      "shape": "recommended nail shape",
      "length": "recommended length",
      "description": "short description"
    },
    {
      "name": "design name",
      "shape": "recommended nail shape",
      "length": "recommended length",
      "description": "short description"
    }
  ]
}

Return exactly 3 recommendations.
Do not identify the person, guess their age, judge attractiveness,
or provide medical advice.
`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    const resultText = response.output_text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(resultText);

    if (
      !result ||
      !Array.isArray(result.recommendations) ||
      result.recommendations.length !== 3
    ) {
      throw new Error("AI returned an unexpected response format.");
    }

    res.json(result);
  } catch (error) {
    console.error("AI analysis error:", error.message);
    res.status(500).json({
      message: "AI analysis failed. Please try again."
    });
  }
});

// ==================================================
// UNKNOWN API ROUTES
// ==================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found."
  });
});

// ==================================================
// DATABASE AND SERVER START
// ==================================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the backend .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Dream Nails Studio running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();