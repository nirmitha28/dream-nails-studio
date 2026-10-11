import './contact.css';

export function contactModule() {
  return `
    <section class="contact-section">

      <div class="contact-logo">
        <img src="/images/naillogo.jpeg" alt="Dream Nails Studio Logo">
      </div>

      <h2>📞 Contact Us</h2>

      <p>Have questions? We'd love to hear from you!</p>

      <div class="contact-info">
        <p><strong>📱 Phone:</strong> +91 7259772915</p>
        <p><strong>📧 Email:</strong> nailartstudio@gmail.com</p>
        <p><strong>📍 Location:</strong> Bengaluru, Karnataka</p>
      </div>

      <form class="contact-form">

        <input
          type="text"
          placeholder="Your Name"
          required
        >

        <input
          type="email"
          placeholder="Your Email"
          required
        >

        <textarea
          placeholder="Your Message"
          rows="5"
          required
        ></textarea>

        <button type="submit">
          Send Message
        </button>

      </form>

    </section>
  `;
}