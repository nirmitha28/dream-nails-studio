import './gallery.css';

export function galleryModule() {
  return `
    <section class="gallery-section">

      <h2>💅 Our Nail Art Gallery</h2>
      <p>Click any design to view it larger and give your rating.</p>

      <div class="gallery-grid">

        <div class="gallery-item">
          <img src="/images/nailart5.jpeg" alt="Nail Art 1" class="gallery-image">
          <h3>Design 1</h3>
          <div class="rating">
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
          </div>
          <button class="rate-btn">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailarti4.jpeg" alt="Nail Art 2" class="gallery-image">
          <h3>Design 2</h3>
          <div class="rating">
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
          </div>
          <button class="rate-btn">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartiamge2.jpeg" alt="Nail Art 3" class="gallery-image">
          <h3>Design 3</h3>
          <div class="rating">
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
          </div>
          <button class="rate-btn">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartiamge3.jpeg" alt="Nail Art 4" class="gallery-image">
          <h3>Design 4</h3>
          <div class="rating">
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
          </div>
          <button class="rate-btn">Submit Rating</button>
        </div>

        <div class="gallery-item">
          <img src="/images/nailartimage.jpeg" alt="Nail Art 5" class="gallery-image">
          <h3>Design 5</h3>
          <div class="rating">
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
            <span>☆</span>
          </div>
          <button class="rate-btn">Submit Rating</button>
        </div>

      </div>

      <!-- Zoom viewer -->
      <div id="imageViewer" class="image-viewer">
        <span id="closeViewer">&times;</span>
        <img id="zoomedImage" src="" alt="Zoomed Nail Art">
      </div>

    </section>
  `;
}


/* Star rating */
document.addEventListener('click', function(event) {

  if (event.target.closest('.rating')) {

    const star = event.target;

    if (star.tagName === 'SPAN') {

      const stars = star.parentElement;
      const allStars = stars.querySelectorAll('span');
      const selected = [...allStars].indexOf(star) + 1;

      stars.dataset.rating = selected;

      allStars.forEach((item, index) => {
        item.textContent = index < selected ? '★' : '☆';
      });
    }
  }


  /* Zoom image */
  if (event.target.classList.contains('gallery-image')) {

    const viewer = document.getElementById('imageViewer');
    const zoomedImage = document.getElementById('zoomedImage');

    zoomedImage.src = event.target.src;

    viewer.classList.add('active');
  }


  /* Close zoom */
  if (
    event.target.id === 'closeViewer' ||
    event.target.id === 'imageViewer'
  ) {

    document
      .getElementById('imageViewer')
      .classList.remove('active');
  }

});