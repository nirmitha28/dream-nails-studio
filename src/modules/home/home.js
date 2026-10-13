
import './home.css';

export function homeModule() {
  return `
    <section class="home-page">

      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-logo">
          <img src="/images/naillogo.jpeg" alt="Dream Nails Studio Logo">
        </div>

        <div class="hero-content">
          <p class="welcome-text">WELCOME TO</p>
          <h1>DREAM NAILS STUDIO</h1>
          <h2>Your Nails, Your Dream ✨</h2>

          <p class="hero-description">
            Beautiful nail art, elegant extensions and creative designs
            made specially for you.
          </p>

          <div class="hero-buttons">
            <a href="/booking.html" class="home-btn primary-btn">
              💅 Book Appointment
            </a>
            <a href="/gallery.html" class="home-btn secondary-btn">
              🖼️ Explore Gallery
            </a>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <section class="about-home">
        <div class="about-content">
          <p class="section-small-title">ABOUT US</p>
          <h2>Where Beauty Meets Creativity 💖</h2>

          <p>
            At Dream Nails Studio, we believe every set of nails tells
            a story. From simple elegance to creative nail art, we create
            beautiful designs that match your personality and style.
          </p>

          <a href="/services.html" class="learn-btn">
            Explore Our Services →
          </a>
        </div>
      </section>

      <!-- Services Preview -->
      <section class="home-services">
        <p class="section-small-title">WHAT WE OFFER</p>
        <h2>Our Nail Services</h2>

        <div class="service-preview">
          <div class="service-box">
            <div class="service-icon">💅</div>
            <h3>Classic Nail Art</h3>
            <p>Simple and elegant designs for everyday beauty.</p>
          </div>

          <div class="service-box">
            <div class="service-icon">✨</div>
            <h3>Gel Extensions</h3>
            <p>Beautiful, stylish and long-lasting nail extensions.</p>
          </div>

          <div class="service-box">
            <div class="service-icon">🌸</div>
            <h3>Custom Nail Art</h3>
            <p>Unique designs created according to your style.</p>
          </div>
        </div>
      </section>

      <!-- NEW AI Nail Design Section -->
      <section style="
        text-align: center;
        padding: 50px 20px;
        margin: 30px auto;
        background: #fff0f6;
        border-radius: 16px;
        max-width: 1000px;
      ">
        <p style="color: #d63384; font-weight: bold;">
          SMART NAIL DESIGN ✨
        </p>

        <h2 style="color: #222;">
          Discover Your Perfect Nail Design 💅
        </h2>

        <p style="max-width: 650px; margin: 15px auto; line-height: 1.7;">
          Not sure which nail design suits you? Upload a photo of your
          nails, choose your preferred style, and let our AI suggest
          three creative nail design ideas.
        </p>

        <a href="/ai.html" style="
          display: inline-block;
          margin-top: 15px;
          padding: 14px 28px;
          background: #d63384;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        ">
          ✨ Try AI Nail Design
        </a>
      </section>

      <!-- Final CTA -->
      <section class="home-cta">
        <img src="/images/naillogo.jpeg" alt="Dream Nails Studio">

        <h2>Ready to Make Your Nails Dreamy? ✨</h2>
        <p>Book your appointment and let your nails shine.</p>

        <a href="/booking.html" class="cta-button">
          Book Your Appointment 💅
        </a>
      </section>

    </section>
  `;
}
