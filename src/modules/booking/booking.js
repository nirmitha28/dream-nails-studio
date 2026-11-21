
import "./booking.css";

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : window.location.origin;

const QR_IMAGE = "/images/phone%20pay.jpeg";

const SERVICE_PRICES = {
  "Classic Nail Art": 300,
  "Gel Extensions": 800,
  "Temporary Extensions": 800,
  "Custom Nail Art": 1000
};

const TIME_SLOTS = [
  { value: "09:00", label: "9:00 AM – 12:00 PM" },
  { value: "12:00", label: "12:00 PM – 3:00 PM" },
  { value: "15:00", label: "3:00 PM – 6:00 PM" },
  { value: "18:00", label: "6:00 PM – 9:00 PM" }
];

export function bookingModule() {
  return `
    <section class="booking-section">
      <h2>💅 Book Your Nail Appointment</h2>
      <p>Choose your service and preferred appointment time.</p>
      <p>Working hours: 9:00 AM – 9:00 PM</p>
      <p>Each appointment takes 3 hours.</p>

      <form class="booking-form" id="bookingForm">

        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name"
            placeholder="Enter your full name" required />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone"
            placeholder="Enter your phone number" required />
        </div>

        <div class="form-group">
          <label for="service">Select Service</label>
          <select id="service" name="service" required>
            <option value="">Choose a service</option>
            <option value="Classic Nail Art">Classic Nail Art - ₹300</option>
            <option value="Gel Extensions">Gel Extensions - ₹800</option>
            <option value="Temporary Extensions">Temporary Extensions - ₹800</option>
            <option value="Custom Nail Art">Custom Nail Art - ₹1000</option>
          </select>
        </div>

        <!-- Payment details -->
        <div id="paymentSection" style="display:none; margin:20px 0; padding:18px; border:1px solid #ddd; border-radius:12px;">

          <h3>💳 Advance Payment</h3>

          <p>Total Service Price:
            <strong id="totalPrice">₹0</strong>
          </p>

          <p>Advance Payment (20%):
            <strong id="advanceAmount">₹0</strong>
          </p>

          <p>Remaining Balance (80%):
            <strong id="remainingBalance">₹0</strong>
          </p>

          <p>Scan this PhonePe QR code to pay your advance.</p>

          <img
            src="${QR_IMAGE}"
            alt="Dream Nails Studio PhonePe UPI QR Code"
            style="display:block; width:220px; max-width:100%; height:auto; margin:15px auto; border-radius:10px;"
          />

          <p style="text-align:center;">
            <strong>Scan and pay the exact advance amount.</strong>
          </p>

          <div class="form-group">
            <label for="transactionId">UPI Transaction ID / UTR Number</label>
            <input
              type="text"
              id="transactionId"
              name="transactionId"
              placeholder="Enter your payment transaction ID"
              required
            />
          </div>

          <p style="font-size:13px;">
            Your payment will be verified by the studio admin.
            Please keep your PhonePe payment receipt.
          </p>
        </div>

        <div class="form-group">
          <label for="date">Appointment Date</label>
          <input type="date" id="date" name="date"
            min="${getToday()}" required />
        </div>

        <div class="form-group">
          <label for="time">Available Appointment Time</label>
          <select id="time" name="time" required disabled>
            <option value="">Select a date first</option>
          </select>
          <p id="availabilityMessage" role="status">
            Select a date to view available timings.
          </p>
        </div>

        <div class="form-group">
          <label for="message">Additional Requirements (Optional)</label>
          <textarea id="message" name="message"
            placeholder="Describe your preferred nail design"></textarea>
        </div>

        <button type="submit" id="bookingSubmit" disabled>
          Submit Booking & Payment Details
        </button>

        <p id="bookingMessage" role="status"></p>
      </form>
    </section>
  `;
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Display payment calculation when service changes.
function updatePaymentDetails(form) {
  const service = form.querySelector("#service").value;
  const paymentSection = form.querySelector("#paymentSection");
  const transactionInput = form.querySelector("#transactionId");

  const total = SERVICE_PRICES[service];

  if (!total) {
    paymentSection.style.display = "none";
    transactionInput.required = false;
    return;
  }

  const advance = Math.round(total * 0.20);
  const remaining = total - advance;

  form.querySelector("#totalPrice").textContent = `₹${total}`;
  form.querySelector("#advanceAmount").textContent = `₹${advance}`;
  form.querySelector("#remainingBalance").textContent = `₹${remaining}`;

  paymentSection.style.display = "block";
  transactionInput.required = true;
}

if (!window.__dreamNailsBookingEventsAttached) {
  window.__dreamNailsBookingEventsAttached = true;

  document.addEventListener("change", async (event) => {
    const form = event.target.closest("#bookingForm");
    if (!form) return;

    if (event.target.id === "date") {
      await updateAvailableSlots(form);
    }

    if (event.target.id === "service") {
      updatePaymentDetails(form);
    }
  });

  document.addEventListener("submit", async (event) => {
    if (event.target.id !== "bookingForm") return;

    event.preventDefault();
    await submitBooking(event.target);
  });
}

async function updateAvailableSlots(form) {
  const dateInput = form.querySelector("#date");
  const timeSelect = form.querySelector("#time");
  const availabilityMessage =
    form.querySelector("#availabilityMessage");
  const submitButton = form.querySelector("#bookingSubmit");

  const date = dateInput.value;

  timeSelect.replaceChildren();
  timeSelect.disabled = true;
  submitButton.disabled = true;

  if (!date) {
    timeSelect.add(new Option("Select a date first", ""));
    availabilityMessage.textContent =
      "Select a date to view available timings.";
    return;
  }

  if (date < getToday()) {
    timeSelect.add(new Option("Choose a future date", ""));
    availabilityMessage.textContent = "Past dates cannot be booked.";
    return;
  }

  timeSelect.add(new Option("Checking availability...", ""));
  availabilityMessage.textContent =
    "Checking available appointments...";

  try {
    const response = await fetch(
      `${API_URL}/api/bookings/availability?date=${encodeURIComponent(date)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not check appointment availability."
      );
    }

    timeSelect.replaceChildren();

    if (!data.availableSlots || data.availableSlots.length === 0) {
      timeSelect.add(new Option("No slots available", ""));
      availabilityMessage.textContent =
        "All appointment slots are booked for this date.";
      return;
    }

    timeSelect.add(new Option("Choose an available time", ""));

    data.availableSlots.forEach((slot) => {
      const timeSlot = TIME_SLOTS.find(
        (item) => item.value === slot
      );

      if (timeSlot) {
        timeSelect.add(
          new Option(timeSlot.label, timeSlot.value)
        );
      }
    });

    timeSelect.disabled = false;
    availabilityMessage.textContent =
      `${data.availableSlots.length} appointment slot(s) available.`;

    submitButton.disabled = false;
  } catch (error) {
    console.error("Availability error:", error);

    timeSelect.replaceChildren(
      new Option("Unable to load timings", "")
    );

    availabilityMessage.textContent =
      `${error.message} Please try again.`;
  }
}

async function submitBooking(form) {
  const message = form.querySelector("#bookingMessage");
  const submitButton = form.querySelector("#bookingSubmit");
  const timeSelect = form.querySelector("#time");

  if (!form.reportValidity()) return;

  if (!timeSelect.value) {
    message.textContent =
      "Please select an available appointment time.";
    return;
  }

  const service = form.querySelector("#service").value;
  const totalPrice = SERVICE_PRICES[service];

  if (!totalPrice) {
    message.textContent = "Please select a valid service.";
    return;
  }

  const advanceAmount = Math.round(totalPrice * 0.20);
  const remainingBalance = totalPrice - advanceAmount;

  const payload = {
    name: form.querySelector("#name").value.trim(),
    phone: form.querySelector("#phone").value.trim(),
    service,
    date: form.querySelector("#date").value,
    time: timeSelect.value,
    message: form.querySelector("#message").value.trim(),

    totalPrice,
    advanceAmount,
    remainingBalance,

    transactionId: form
      .querySelector("#transactionId")
      .value.trim()
  };

  if (!payload.transactionId) {
    message.textContent =
      "Please enter your UPI transaction ID.";
    return;
  }

  submitButton.disabled = true;
  message.textContent = "Submitting your booking details...";

  try {
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to book the appointment."
      );
    }

    const selectedDate = payload.date;

    message.textContent =
      `Booking submitted successfully! Advance: ₹${advanceAmount}. ` +
      `Remaining balance: ₹${remainingBalance}. ` +
      "Your payment and booking are pending admin verification.";

    form.reset();

    form.querySelector("#paymentSection").style.display = "none";

    form.querySelector("#date").value = selectedDate;
    form.querySelector("#date").min = getToday();

    await updateAvailableSlots(form);
  } catch (error) {
    console.error("Booking error:", error);
    message.textContent = error.message;

    await updateAvailableSlots(form);
  } finally {
    submitButton.disabled = !timeSelect.value;
  }
}
