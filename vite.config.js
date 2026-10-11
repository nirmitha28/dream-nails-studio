import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        resolve(process.cwd(), 'index.html'),
        resolve(process.cwd(), 'home.html'),
        resolve(process.cwd(), 'services.html'),
        resolve(process.cwd(), 'gallery.html'),
        resolve(process.cwd(), 'booking.html'),
        resolve(process.cwd(), 'contact.html'),
        resolve(process.cwd(), 'feedback.html'),
        resolve(process.cwd(), 'admin.html'),
        resolve(process.cwd(), 'ai.html')
      ]
    }
  }
});
