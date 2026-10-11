require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const app = express();
const PORT = 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.send("Nail Art Booking Backend is running!");
});


// ==================================================
// BOOKING SCHEMA
// ==================================================

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    service: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model("Booking", bookingSchema);


// ==================================================
// CREATE BOOKING
// ==================================================

app.post("/api/bookings", async (req, res) => {
  try {
    const {
      name,
      phone,
      service,
      date,
      time
    } = req.body;

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({
        message: "Please fill all booking fields."
      });
    }

    const booking = new Booking({
      name,
      phone,
      service,
      date,
      time,
      status: "Pending"
    });

    await booking.save();

    res.status(201).json({
      message: "Booking successful!",
      booking
    });

  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Failed to save booking."
    });
  }
});


// ==================================================
// GET ALL BOOKINGS
// ==================================================

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1
    });

    res.json(bookings);

  } catch (error) {
    console.error("Error fetching bookings:", error);

    res.status(500).json({
      message: "Failed to fetch bookings."
    });
  }
});


// ==================================================
// UPDATE BOOKING STATUS
// ==================================================

app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status."
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: status
      },
      {
        new: true
      }
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
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Failed to update booking status."
    });
  }
});


// ==================================================
// DELETE BOOKING
// ==================================================

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    res.json({
      message: "Booking deleted successfully!"
    });

  } catch (error) {
    console.error("Delete booking error:", error);

    res.status(500).json({
      message: "Failed to delete booking."
    });
  }
});


// ==================================================
// CUSTOMER FEEDBACK SCHEMA
// ==================================================

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    experience: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Feedback = mongoose.model(
  "Feedback",
  feedbackSchema
);


// ==================================================
// CREATE FEEDBACK
// ==================================================

app.post("/api/feedback", async (req, res) => {
  try {
    const {
      name,
      rating,
      experience
    } = req.body;

    if (!name || !rating || !experience) {
      return res.status(400).json({
        message: "Please fill all feedback fields."
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5."
      });
    }

    const feedback = new Feedback({
      name,
      rating,
      experience
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback
    });

  } catch (error) {
    console.error("Feedback error:", error);

    res.status(500).json({
      message: "Failed to save feedback."
    });
  }
});


// ==================================================
// GET ALL FEEDBACK
// ==================================================

app.get("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({
      createdAt: -1
    });

    res.json(feedback);

  } catch (error) {
    console.error("Error fetching feedback:", error);

    res.status(500).json({
      message: "Failed to fetch feedback."
    });
  }
});


// ==================================================
// DELETE FEEDBACK
// ==================================================

app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(
      req.params.id
    );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found."
      });
    }

    res.json({
      message: "Feedback deleted successfully!"
    });

  } catch (error) {
    console.error("Delete feedback error:", error);

    res.status(500).json({
      message: "Failed to delete feedback."
    });
  }
});


// ==================================================
// GALLERY RATING SCHEMA
// ==================================================

const galleryRatingSchema = new mongoose.Schema(
  {
    design: {
      type: String,
      required: true,
      trim: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

const GalleryRating = mongoose.model(
  "GalleryRating",
  galleryRatingSchema
);


// ==================================================
// CREATE GALLERY RATING
// ==================================================

app.post("/api/ratings", async (req, res) => {
  try {
    const {
      design,
      rating
    } = req.body;

    if (!design || !rating) {
      return res.status(400).json({
        message: "Design and rating are required."
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5."
      });
    }

    const galleryRating = new GalleryRating({
      design,
      rating
    });

    await galleryRating.save();

    res.status(201).json({
      message: "Rating submitted successfully!",
      rating: galleryRating
    });

  } catch (error) {
    console.error(
      "Gallery rating error:",
      error
    );

    res.status(500).json({
      message: "Failed to save gallery rating."
    });
  }
});


// ==================================================
// GET GALLERY RATINGS
// ==================================================

app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await GalleryRating.find().sort({
      createdAt: -1
    });

    res.json(ratings);

  } catch (error) {
    console.error(
      "Error fetching gallery ratings:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch gallery ratings."
    });
  }
});


// ==================================================
// AI NAIL DESIGN ANALYSIS
// ==================================================

app.post("/api/ai/analyze", async (req, res) => {
  try {

    const {
      image,
      style
    } = req.body;

    if (!image) {
      return res.status(400).json({
        message: "Please upload a hand photo."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "OpenAI API key is missing."
      });
    }

    const selectedStyle = style || "Any";

    const response = await openai.responses.create({
      model: "gpt-6-luna",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",

              text: `
You are a professional nail design recommendation assistant.

Analyze only the visible features of the customer's uploaded hand photo.

Look at:
- apparent natural nail length
- visible nail shape
- finger proportions
- visible nail condition
- suitable nail shapes
- suitable nail lengths

The customer selected this preferred style:

${selectedStyle}

Recommend EXACTLY 3 different nail designs suitable for the visible features.

Return ONLY valid JSON.

Use exactly this format:

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

Important:
- Return exactly 3 recommendations.
- Do not identify the person.
- Do not guess age.
- Do not judge attractiveness.
- Do not provide medical advice.
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

    let resultText = response.output_text;

    resultText = resultText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(resultText);

    res.json(result);

  } catch (error) {

    console.error(
      "AI analysis error:",
      error
    );

    res.status(500).json({
      message: "AI analysis failed.",
      error: error.message
    });
  }
});


// ==================================================
// MONGODB CONNECTION
// ==================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "MongoDB connected successfully!"
    );

    app.listen(PORT, () => {

      console.log(
        `Backend server running at http://localhost:${PORT}`
      );

    });

  })
  .catch((error) => {

    console.error(
      "MongoDB connection failed:"
    );

    console.error(
      error.message
    );

  });