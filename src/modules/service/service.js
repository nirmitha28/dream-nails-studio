import './service.css';

export function serviceModule() {
  return `
    <section class="service-section">

      <div class="service-logo">
        <img src="/images/naillogo.jpeg" alt="Dream Nails Studio Logo">
      </div>

      <h2>💅 Our Nail Art Services</h2>
      <p>Choose the nail service you love.</p>

      <div class="service-grid">

        <div class="service-card">
          <h3>✨ Nail Extensions</h3>
          <p>Beautiful and stylish nail extensions.</p>
          <h4>Starting from ₹800</h4>
        </div>

        <div class="service-card">
          <h3>🎨 Nail Art</h3>
          <p>Creative nail art designs customized for you.</p>
          <h4>Starting from ₹300</h4>
        </div>

        <div class="service-card">
          <h3>💎 Premium Nail Art</h3>
          <p>Glitter, chrome, stones and premium designs.</p>
          <h4>Starting from ₹1000</h4>
        </div>

      </div>

    </section>
  `;
}