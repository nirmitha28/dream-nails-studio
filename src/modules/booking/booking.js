
import './booking.css';

export function bookingModule() {
  return `
    <section class="booking-section">

      <h2>💅 Book Your Nail Appointment</h2>
      <p>Choose your service and preferred appointment time.</p>

      <form class="booking-form">

        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            required
          >
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter your phone number"
            required
          >
        </div>

        <div class="form-group">
          <label for="service">Select Service</label>
          <select id="service" name="service" required>
            <option value="">-- Select a service --</option>
            <option value="Classic Nail Art">Classic Nail Art</option>
            <option value="Gel Extensions">Gel Extensions</option>
            <option value="Temporary Extensions">Temporary Extensions</option>
            <option value="Custom Nail Art">Custom Nail Art</option>
          </select>
        </div>

        <div class="form-group">
          <label for="date">Appointment Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
          >
        </div>

        <div class="form-group">
          <label for="time">Preferred Time</label>
          <input
            type="time"
            id="time"
            name="time"
            required
          >
        </div>

        <div class="form-group">
          <label for="message">Special Request</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Tell us about your preferred nail design..."
          ></textarea>
        </div>

        <button type="submit" class="booking-btn">
          Book Appointment
        </button>

      </form>

    </section>
  `;
}

// Handle booking form submission
document.addEventListener("submit", async (event) => {

  if (!event.target.classList.contains("booking-form")) {
    return;
  }

  event.preventDefault();

  const form = event.target;

  const bookingData = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    date: form.date.value,
    time: form.time.value,
    message: form.message.value.trim()
  };

  console.log("Sending booking:", bookingData);

  try {

    const response = await fetch("http://localhost:5000/api/bookings",  {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    console.log("Backend response:", result);

    if (response.ok) {

      alert("✅ Appointment booked successfully!");

      form.reset();

    } else {

      alert("❌ " + (result.message || "Booking failed"));

    }

  } catch (error) {

    console.error("Backend connection error:", error);

    alert(
      "❌ Cannot connect to backend.\n\n" +
      "Please make sure the backend server is running on port 5000."
    );
  }
});

