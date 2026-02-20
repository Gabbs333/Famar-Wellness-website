/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Technologies from './components/Technologies';
import About from './components/About';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Booking from './components/Booking';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Page Components
const HomePage = () => (
  <>
    <Hero />
    <Services />
    <Technologies />
    <About />
    <Testimonials />
    <Contact />
  </>
);

const ServicesPage = () => (
  <>
    <div className="pt-20">
      <Services />
    </div>
    <Contact />
  </>
);

const TechnologiesPage = () => (
  <>
    <div className="pt-20">
      <Technologies />
    </div>
    <Contact />
  </>
);

const GalleryPage = () => (
  <>
    <div className="pt-20">
      <Gallery />
    </div>
    <Contact />
  </>
);

const TestimonialsPage = () => (
  <>
    <div className="pt-20">
      <Testimonials />
    </div>
    <Contact />
  </>
);

const BookingPage = () => (
  <>
    <div className="pt-20">
      <Booking />
    </div>
  </>
);

const BlogPage = () => (
  <>
    <div className="pt-20">
      <Blog />
    </div>
    <Contact />
  </>
);

const ContactPage = () => (
  <>
    <div className="pt-20">
      <Contact />
    </div>
  </>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="font-sans antialiased text-gray-900 bg-white selection:bg-teal-100 selection:text-teal-900 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/temoignages" element={<TestimonialsPage />} />
            <Route path="/reservation" element={<BookingPage />} />
            <Route path="/actualites" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
