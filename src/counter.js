import './style.css';

import { bookingModule } from './modules/booking/booking.js';
import { contactModule } from './modules/contact/contact.js';
import { galleryModule } from './modules/gallery/gallery.js';
import { homeModule } from './modules/home/home.js';
import { serviceModule } from './modules/service/service.js';

document.querySelector('#app').innerHTML = `
  ${homeModule()}
  ${serviceModule()}
  ${galleryModule()}
  ${bookingModule()}
  ${contactModule()}
`;