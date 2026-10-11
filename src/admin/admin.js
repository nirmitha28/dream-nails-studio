
const API_URL = "http://localhost:5000";


// ==================================================
// ADMIN LOGIN
// ==================================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const loginScreen = document.getElementById("loginScreen");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");


// ==================================================
// CHECK LOGIN
// ==================================================

function checkLogin() {

  const loggedIn = sessionStorage.getItem("adminLoggedIn");

  if (loggedIn === "true") {

    loginScreen.style.display = "none";
    adminDashboard.style.display = "block";

    loadBookings();
    loadFeedback();

  } else {

    loginScreen.style.display = "flex";
    adminDashboard.style.display = "none";

  }
}


// ==================================================
// LOGIN
// ==================================================

loginForm.addEventListener("submit", function (event) {

  event.preventDefault();

  const username =
    document.getElementById("adminUsername").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {

    sessionStorage.setItem(
      "adminLoggedIn",
      "true"
    );

    loginMessage.textContent =
      "Login successful!";

    loginMessage.style.color = "green";

    setTimeout(() => {

      loginScreen.style.display = "none";
      adminDashboard.style.display = "block";

      loadBookings();
      loadFeedback();

    }, 500);

  } else {

    loginMessage.textContent =
      "Invalid username or password.";

    loginMessage.style.color = "red";

  }

});


// ==================================================
// LOGOUT
// ==================================================

logoutBtn.addEventListener("click", function () {

  sessionStorage.removeItem("adminLoggedIn");

  adminDashboard.style.display = "none";
  loginScreen.style.display = "flex";

  loginForm.reset();

  loginMessage.textContent = "";

});


// ==================================================
// LOAD BOOKINGS
// ==================================================

async function loadBookings() {

  const table =
    document.getElementById("bookingTable");

  const message =
    document.getElementById("bookingMessage");

  table.innerHTML =
    "<tr><td colspan='6'>Loading bookings...</td></tr>";

  try {

    const response =
      await fetch(`${API_URL}/api/bookings`);

    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const bookings =
      await response.json();

    if (bookings.length === 0) {

      table.innerHTML =
        "<tr><td colspan='6'>No bookings found.</td></tr>";

      message.textContent = "";

      return;
    }

    table.innerHTML = "";

    bookings.forEach((booking) => {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${booking.name}</td>
        <td>${booking.phone}</td>
        <td>${booking.service}</td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td>${booking.status || "Pending"}</td>
      `;

      table.appendChild(row);

    });

    message.textContent =
      `${bookings.length} booking(s) found.`;

  } catch (error) {

    console.error("Booking error:", error);

    table.innerHTML =
      "<tr><td colspan='6'>Unable to load bookings.</td></tr>";

    message.textContent =
      "Make sure the backend server is running.";

  }
}


// ==================================================
// LOAD FEEDBACK
// ==================================================

async function loadFeedback() {

  const table =
    document.getElementById("feedbackTable");

  const message =
    document.getElementById("feedbackMessage");

  table.innerHTML =
    "<tr><td colspan='4'>Loading feedback...</td></tr>";

  try {

    const response =
      await fetch(`${API_URL}/api/feedback`);

    if (!response.ok) {
      throw new Error("Failed to fetch feedback");
    }

    const feedbackList =
      await response.json();

    if (feedbackList.length === 0) {

      table.innerHTML =
        "<tr><td colspan='4'>No feedback found.</td></tr>";

      message.textContent = "";

      return;
    }

    table.innerHTML = "";

    feedbackList.forEach((feedback) => {

      const row =
        document.createElement("tr");

      const stars =
        "⭐".repeat(feedback.rating);

      row.innerHTML = `
        <td>${feedback.name}</td>
        <td>${stars}</td>
        <td>${feedback.experience}</td>
        <td>Feedback</td>
      `;

      table.appendChild(row);

    });

    message.textContent =
      `${feedbackList.length} feedback item(s) found.`;

  } catch (error) {

    console.error("Feedback error:", error);

    table.innerHTML =
      "<tr><td colspan='4'>Unable to load feedback.</td></tr>";

    message.textContent =
      "Make sure the backend server is running.";

  }
}


// ==================================================
// REFRESH BUTTONS
// ==================================================

document
  .getElementById("refreshBookings")
  .addEventListener("click", loadBookings);

document
  .getElementById("refreshFeedback")
  .addEventListener("click", loadFeedback);


// ==================================================
// START
// ==================================================

checkLogin();
