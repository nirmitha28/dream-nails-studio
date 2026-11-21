require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;
const DIST_PATH = path.join(__dirname, "../dist");
const GALLERY_UPLOAD_DIR = path.join(__dirname, "uploads", "gallery");

fs.mkdirSync(GALLERY_UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ==================================================
// APPOINTMENT SCHEDULE
// ==================================================

const TIME_SLOTS = ["09:00", "12:00", "15:00", "18:00"];
const MAX_DAILY_BOOKINGS = 4;

const SERVICE_PRICES = {
  "Classic Nail Art": 300,
  "Gel Extensions": 800,
  "Temporary Extensions": 800,
  "Custom Nail Art": 1000
};

// ==================================================
// FRONTEND PAGE ROUTES
// ==================================================

app.use(express.static(DIST_PATH));
app.use("/uploads/gallery", express.static(GALLERY_UPLOAD_DIR));

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
    message: {
      type: String,
      default: ""
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    advanceAmount: {
      type: Number,
      default: 0
    },
    remainingBalance: {
      type: Number,
      default: 0
    },
    slotKey: {
      type: String,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

// ==================================================
// CHECK APPOINTMENT AVAILABILITY
// ==================================================

app.get("/api/bookings/availability", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Please provide a valid appointment date."
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Invalid appointment date."
      });
    }

    const bookings = await Booking.find({
      date,
      status: { $ne: "Cancelled" }
    }).select("time");

    const bookedTimes = new Set(
      bookings.map((booking) => booking.time)
    );

    const availableSlots =
      bookings.length >= MAX_DAILY_BOOKINGS
        ? []
        : TIME_SLOTS.filter((slot) => !bookedTimes.has(slot));

    return res.json({
      success: true,
      date,
      availableSlots,
      bookingsCount: bookings.length,
      dailyLimit: MAX_DAILY_BOOKINGS,
      appointmentDurationHours: 3,
      openingTime: "9:00 AM",
      closingTime: "9:00 PM",
      message: availableSlots.length
        ? "Available appointment times loaded."
        : "No appointment times are available for this date."
    });
  } catch (error) {
    console.error("Availability error:", error.message);

    return res.status(500).json({
      message: "Unable to check appointment availability."
    });
  }
});

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
      time,
      message = ""
    } = req.body;

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({
        message: "Please fill all required booking fields."
      });
    }

    if (!SERVICE_PRICES[service]) {
      return res.status(400).json({
        message: "Please select a valid nail service."
      });
    }

    if (!TIME_SLOTS.includes(time)) {
      return res.status(400).json({
        message: "Please select a valid available appointment time."
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Please provide a valid appointment date."
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Invalid appointment date."
      });
    }

    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    if (date < indiaDate) {
      return res.status(400).json({
        message: "Past dates cannot be booked."
      });
    }

    if (date === indiaDate) {
      const currentTimeParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }).format(new Date()).split(":");

      const currentMinutes =
        Number(currentTimeParts[0]) * 60 +
        Number(currentTimeParts[1]);

      const [slotHour, slotMinute] = time.split(":").map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;

      if (slotMinutes <= currentMinutes) {
        return res.status(400).json({
          message: "This appointment time has already passed."
        });
      }
    }

    const slotKey = `${date}_${time}`;

    const existingBooking = await Booking.findOne({
      date,
      time,
      status: { $ne: "Cancelled" }
    });

    if (existingBooking) {
      return res.status(409).json({
        message:
          "This appointment time is already booked. Please select another time."
      });
    }

    const dailyBookings = await Booking.countDocuments({
      date,
      status: { $ne: "Cancelled" }
    });

    if (dailyBookings >= MAX_DAILY_BOOKINGS) {
      return res.status(409).json({
        message:
          "This date already has four bookings. Please choose another date."
      });
    }

    const totalPrice = SERVICE_PRICES[service];
    const advanceAmount = Math.round(totalPrice * 0.2);
    const remainingBalance = totalPrice - advanceAmount;

    const booking = await Booking.create({
      name: name.trim(),
      phone: phone.trim(),
      service,
      date,
      time,
      message: String(message || "").trim(),
      totalPrice,
      advanceAmount,
      remainingBalance,
      slotKey,
      status: "Pending"
    });

    return res.status(201).json({
      message: "Booking successful!",
      booking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This appointment time was just booked. Please select another time."
      });
    }

    console.error("Booking error:", error.message);

    return res.status(500).json({
      message: "Failed to save booking."
    });
  }
});

// ==================================================
// GET ALL BOOKINGS
// ==================================================

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch bookings."
    });
  }
});

// ==================================================
// UPDATE BOOKING STATUS
// ==================================================

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

    const currentBooking = await Booking.findById(req.params.id);

    if (!currentBooking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    if (status !== "Cancelled") {
      const duplicate = await Booking.findOne({
        _id: { $ne: currentBooking._id },
        date: currentBooking.date,
        time: currentBooking.time,
        status: { $ne: "Cancelled" }
      });

      if (duplicate) {
        return res.status(409).json({
          message:
            "Cannot reactivate this booking because its time is already occupied."
        });
      }

      if (currentBooking.status === "Cancelled") {
        const dailyBookings = await Booking.countDocuments({
          _id: { $ne: currentBooking._id },
          date: currentBooking.date,
          status: { $ne: "Cancelled" }
        });

        if (dailyBookings >= MAX_DAILY_BOOKINGS) {
          return res.status(409).json({
            message: "The daily booking limit has already been reached."
          });
        }
      }
    }

    currentBooking.status = status;

    if (status === "Cancelled") {
      currentBooking.slotKey = undefined;
    } else {
      currentBooking.slotKey =
        `${currentBooking.date}_${currentBooking.time}`;
    }

    await currentBooking.save({ validateBeforeSave: false });

    return res.json({
      message: "Booking status updated successfully!",
      booking: currentBooking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "That appointment time is already booked."
      });
    }

    console.error("Status update error:", error.message);

    return res.status(500).json({
      message: "Failed to update booking status."
    });
  }
});

// ==================================================
// DELETE BOOKING
// ==================================================

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    return res.json({
      message: "Booking deleted successfully!"
    });
  } catch (error) {
    console.error("Delete booking error:", error.message);

    return res.status(500).json({
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

    return res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback
    });
  } catch (error) {
    console.error("Feedback error:", error.message);

    return res.status(500).json({
      message: "Failed to save feedback."
    });
  }
});

app.get("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return res.json(feedback);
  } catch (error) {
    console.error("Fetch feedback error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch feedback."
    });
  }
});

app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found."
      });
    }

    return res.json({
      message: "Feedback deleted successfully!"
    });
  } catch (error) {
    console.error("Delete feedback error:", error.message);

    return res.status(500).json({
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

    return res.status(201).json({
      message: "Rating submitted successfully!",
      rating: galleryRating
    });
  } catch (error) {
    console.error("Gallery rating error:", error.message);

    return res.status(500).json({
      message: "Failed to save gallery rating."
    });
  }
});

app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await GalleryRating.find().sort({
      createdAt: -1
    });

    return res.json(ratings);
  } catch (error) {
    console.error("Fetch ratings error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch gallery ratings."
    });
  }
});

// ==================================================
// ADMIN GALLERY IMAGE UPLOAD AND DELETE
// ==================================================

const galleryImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const GalleryImage = mongoose.model(
  "GalleryImage",
  galleryImageSchema
);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, GALLERY_UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    callback(null, uniqueName);
  }
});

const imageFileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  return callback(
    new Error("Only JPG, PNG, WEBP, and GIF images are allowed.")
  );
};

const galleryUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Get uploaded gallery images
app.get("/api/gallery", async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    return res.json(images);
  } catch (error) {
    console.error("Fetch gallery images error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch gallery images."
    });
  }
});

// Upload a gallery image
app.post("/api/gallery", galleryUpload.single("image"), async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload."
      });
    }

    if (!title) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "Please enter an image title."
      });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    const galleryImage = await GalleryImage.create({
      title,
      description,
      filename: req.file.filename,
      imageUrl
    });

    return res.status(201).json({
      message: "Gallery image uploaded successfully!",
      image: galleryImage
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    console.error("Gallery upload error:", error.message);

    return res.status(500).json({
      message: "Failed to upload gallery image."
    });
  }
});

// Delete a gallery image
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        message: "Gallery image not found."
      });
    }

    const imagePath = path.join(GALLERY_UPLOAD_DIR, image.filename);

    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (error) => {
        if (error) {
          console.error("Gallery file delete error:", error.message);
        }
      });
    }

    return res.json({
      message: "Gallery image deleted successfully!"
    });
  } catch (error) {
    console.error("Gallery delete error:", error.message);

    return res.status(500).json({
      message: "Failed to delete gallery image."
    });
  }
});

// Handle upload errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Image must be 5MB or smaller."
      });
    }

    return res.status(400).json({
      message: error.message
    });
  }

  if (error && error.message) {
    return res.status(400).json({
      message: error.message
    });
  }

  next(error);
});

// ==================================================
// AI NAIL DESIGN RECOMMENDATIONS
// ==================================================

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { image, style } = req.body || {};

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        message: "Please upload a hand photo."
      });
    }

    const imageMatch = image.match(
      /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i
    );

    if (!imageMatch) {
      return res.status(400).json({
        message:
          "Invalid image format. Please upload a JPG, PNG, or WEBP photo."
      });
    }

    if (!openai) {
      return res.status(503).json({
        message:
          "AI is not configured. Check OPENAI_API_KEY in backend/.env."
      });
    }

    const selectedStyle =
      typeof style === "string" && style.trim()
        ? style.trim().slice(0, 100)
        : "Any";

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are a professional nail-art recommendation assistant.

Analyze the uploaded hand photo and recommend designs suitable for the visible nails.
Only describe visible features. Do not identify the person, guess age, judge attractiveness,
or provide medical advice.

Preferred nail-art style: ${selectedStyle}

Return exactly 3 distinct nail design recommendations.
Each recommendation must include name, shape, length, and description.

Return JSON in this structure:
{
  "analysis": "short explanation",
  "recommendations": [
    {
      "name": "Design name",
      "shape": "Nail shape",
      "length": "Nail length",
      "description": "Design description"
    },
    {
      "name": "Design name",
      "shape": "Nail shape",
      "length": "Nail length",
      "description": "Design description"
    },
    {
      "name": "Design name",
      "shape": "Nail shape",
      "length": "Nail length",
      "description": "Design description"
    }
  ]
}
`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const resultText = response.output_text;

    if (!resultText || !resultText.trim()) {
      console.error("AI returned no output text.");

      return res.status(502).json({
        message: "AI returned an empty response. Please try another photo."
      });
    }

    const result = JSON.parse(resultText);

    if (
      !result ||
      typeof result.analysis !== "string" ||
      !Array.isArray(result.recommendations) ||
      result.recommendations.length !== 3
    ) {
      console.error("Unexpected AI response structure:", resultText);

      return res.status(502).json({
        message: "AI did not return 3 valid designs. Please try again."
      });
    }

    const recommendations = result.recommendations.map((design) => ({
      name: String(design.name || "Nail Design"),
      shape: String(design.shape || "Not specified"),
      length: String(design.length || "Not specified"),
      description: String(
        design.description || "A custom nail design recommendation."
      )
    }));

    return res.json({
      analysis: result.analysis,
      recommendations
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);

    if (error.status === 401) {
      return res.status(503).json({
        message:
          "OpenAI API key is invalid. Check OPENAI_API_KEY in backend/.env."
      });
    }

    if (error.status === 429) {
      return res.status(503).json({
        message:
          "OpenAI API quota or rate limit reached. Check your OpenAI API account."
      });
    }

    return res.status(500).json({
      message: "AI analysis failed. Check the backend terminal for details."
    });
  }
});

// ==================================================
// UNKNOWN API ROUTES
// ==================================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    message: "API endpoint not found."
  });
});

// ==================================================
// DATABASE AND SERVER START
// ==================================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from the backend .env file."
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    await Booking.init();
    console.log("Booking slot index is ready.");

    app.listen(PORT, () => {
      console.log(`Dream Nails Studio running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();