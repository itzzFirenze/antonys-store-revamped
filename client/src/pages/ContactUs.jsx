import React, { useState, useEffect } from "react";
import Layout from "../layouts/Layouts";
import { useLocation } from 'react-router-dom';
import { BASE_URL } from "../Redux/Constants/BASE_URL";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";

const Toast = ({ message, type }) => (
  <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center w-full z-50">
    <div className={`w-auto max-w-sm px-6 py-3 rounded-lg shadow-lg text-center ${
      type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
    } text-white text-sm font-medium`}>
      {message}
    </div>
  </div>
);

const ContactUs = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
    sendCopy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        showToast("Message sent successfully!", "success");
        setFormData({ name: "", email: "", mobile: "", message: "", sendCopy: false });
      } else {
        showToast(data.error || "Failed to send message", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen bg-gray-50 mt-8">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Map Section */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3932.2765013485487!2d76.60893327461169!3d9.742629890350056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07d1208c7c25db%3A0x998443bdbbb0d0ff!2sAntony&#39;s%20Boutique!5e0!3m2!1sen!2sin!4v1735269279546!5m2!1sen!2sin"
                className="w-full h-96"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Location map"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
                <p className="text-gray-600">We'd love to hear from you. Please fill out this form or use our contact information below.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-fuchsia-800" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">Pallikkettidam, Pala - Marangattupilly</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-fuchsia-800" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+91 974-745-1884</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-fuchsia-800" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">Antonyshiny1@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-700 focus:border-fuchsia-700"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-fuchsia-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-fuchsia-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;