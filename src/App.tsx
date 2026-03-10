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
import Contact from './components/Contact';
import LegalNotice from './components/LegalNotice';
import PrivacyPolicy from './components/PrivacyPolicy';
import Sitemap from './components/Sitemap';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Admin Imports
import { AuthProvider } from './admin/context/AuthContext';
import { ThemeProvider } from './admin/context/ThemeContext';
import Login from './admin/pages/Login';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Contacts from './admin/pages/Contacts';
import Bookings from './admin/pages/Bookings';
import Posts from './admin/pages/Posts';
import Media from './admin/pages/Media';
import Pages from './admin/pages/Pages';
import BlogCategories from './admin/pages/BlogCategories';
import BlogTags from './admin/pages/BlogTags';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';

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

const LegalNoticePage = () => (
  <>
    <div className="pt-20">
      <LegalNotice />
    </div>
  </>
);

const PrivacyPolicyPage = () => (
  <>
    <div className="pt-20">
      <PrivacyPolicy />
    </div>
  </>
);

const SitemapPage = () => (
  <>
    <div className="pt-20">
      <Sitemap />
    </div>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pages" element={<Pages />} />
              <Route path="posts" element={<Posts />} />
              <Route path="posts/categories" element={<BlogCategories />} />
              <Route path="posts/tags" element={<BlogTags />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="media" element={<Media />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
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
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/mentions-legales" element={<LegalNoticePage />} />
              <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
              <Route path="/plan-site" element={<SitemapPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
