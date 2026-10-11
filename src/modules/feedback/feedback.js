import './feedback.css';

export function feedbackModule() {
  return `
    <section class="feedback-section">

      <!-- LOGO -->
      <div class="feedback-logo">
        <img
          src="/images/naillogo.jpeg"
          alt="Dream Nails Studio Logo"
        >
      </div>

      <!-- HEADING -->
      <h1>💖 Customer Feedback</h1>

      <p class="feedback-intro">
        We would love to hear about your experience at Dream Nails Studio.
      </p>


      <!-- FEEDBACK FORM -->
      <div class="feedback-form-container">

        <h2>Share Your Experience ✨</h2>

        <form id="feedbackForm">

          <!-- NAME -->
          <div class="form-group">

            <label for="customerName">
              Your Name
            </label>

            <input
              type="text"
              id="customerName"
              placeholder="Enter your name"
              required
            >

          </div>


          <!-- RATING -->
          <div class="form-group">

            <label>
              Your Rating
            </label>

            <div
              class="star-rating"
              id="starRating"
            >

              <span data-rating="1">★</span>
              <span data-rating="2">★</span>
              <span data-rating="3">★</span>
              <span data-rating="4">★</span>
              <span data-rating="5">★</span>

            </div>

            <input
              type="hidden"
              id="rating"
              value=""
            >

            <p
              id="ratingText"
              class="rating-text"
            >
              Select your rating
            </p>

          </div>


          <!-- EXPERIENCE -->
          <div class="form-group">

            <label for="experience">
              Your Experience
            </label>

            <textarea
              id="experience"
              rows="5"
              placeholder="Tell us about your nail art experience..."
              required
            ></textarea>

          </div>


          <!-- BUTTON -->
          <button
            type="submit"
            class="feedback-btn"
          >
            Submit Feedback 💖
          </button>

        </form>

      </div>


      <!-- CUSTOMER REVIEWS -->
      <div class="submitted-feedback">

        <h2>What Our Customers Say 💅</h2>

        <div id="feedbackList"></div>

      </div>

    </section>
  `;
}


/* =================================
   STAR RATING + FORM
   ================================= */

setTimeout(() => {

  const form =
    document.getElementById("feedbackForm");

  const feedbackList =
    document.getElementById("feedbackList");

  const stars =
    document.querySelectorAll(
      "#starRating span"
    );

  const ratingInput =
    document.getElementById("rating");

  const ratingText =
    document.getElementById("ratingText");


  /* STAR CLICK */

  stars.forEach((star) => {

    star.addEventListener("click", () => {

      const rating =
        Number(
          star.getAttribute("data-rating")
        );

      ratingInput.value = rating;


      stars.forEach((item) => {

        const itemRating =
          Number(
            item.getAttribute("data-rating")
          );

        if (itemRating <= rating) {

          item.classList.add("selected");

        } else {

          item.classList.remove("selected");

        }

      });


      ratingText.textContent =
        rating + " out of 5 stars";

    });

  });


  /* FORM SUBMIT */

  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const name =
        document
          .getElementById("customerName")
          .value
          .trim();


      const rating =
        Number(
          ratingInput.value
        );


      const experience =
        document
          .getElementById("experience")
          .value
          .trim();


      /* CHECK RATING */

      if (rating === 0) {

        alert(
          "Please select a star rating ⭐"
        );

        return;

      }


      /* CREATE STARS */

      const starsHTML =
        "★".repeat(rating) +
        "☆".repeat(5 - rating);


      /* CREATE REVIEW */

      const review =
        document.createElement("div");

      review.className =
        "customer-review";


      review.innerHTML = `

        <h3>
          ${name}
        </h3>

        <div class="review-stars">
          ${starsHTML}
        </div>

        <p>
          ${experience}
        </p>

      `;


      /* ADD REVIEW */

      feedbackList.prepend(review);


      /* RESET FORM */

      form.reset();

      ratingInput.value = "";

      ratingText.textContent =
        "Select your rating";


      stars.forEach((star) => {

        star.classList.remove(
          "selected"
        );

      });


      alert(
        "Thank you for your feedback! 💖"
      );

    }

  );

}, 0);