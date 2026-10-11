import './style.css';
import { bookingModule } from './modules/booking/booking.js';

const app = document.querySelector('#app');

app.innerHTML = bookingModule();