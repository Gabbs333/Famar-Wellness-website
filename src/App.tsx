/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
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

// Admin Imports
import { AuthProvider } from './admin/context/AuthContext';
import Login from './admin/pages/Login';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Contacts from './admin/pages/Contacts';
import Bookings from './admin/pages/Bookings';
import Posts from './admin/pages/Posts';

// Public Layout Component
const PublicLayout = () => (
  <div className="font-sans antialiased text-gray-900 bg-white selection:bg-teal-100 selection:text-teal-900 flex flex-col min-h-screen">
    <ScrollToTop />
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Page Components
const HomePage = () => (
  <Home />
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

const AboutPage = () => (
  <>
    <div className="pt-20">
      <About />
    </div>
    <Contact />
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="posts" element={<Posts />} />
          </Route>

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/temoignages" element={<TestimonialsPage />} />
            <Route path="/reservation" element={<BookingPage />} />
            <Route path="/actualites" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
