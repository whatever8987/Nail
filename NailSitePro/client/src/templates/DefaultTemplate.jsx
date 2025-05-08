// src/templates/DefaultTemplate.js
import React from 'react';
// import './DefaultTemplate.css'; // Optional: specific styles

const SAMPLE_OPENING_HOURS_FALLBACK = "Monday - Friday: 9:00 AM - 7:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: Closed";

function DefaultTemplate({ salon, template }) {
    // Use template data for basic styling or fallback defaults
     const styles = {
        primaryColor: template?.primary_color || '#10b981', // Default green
        secondaryColor: template?.secondary_color || '#6ee7b7', // Default lighter green
        fontFamily: template?.font_family || "'Arial', sans-serif",
        backgroundColor: template?.background_color || '#f0f0f0',
        textColor: template?.text_color || '#333333',
     };

    return (
        <div className="salon-template-default p-6" style={{ fontFamily: styles.fontFamily, backgroundColor: styles.backgroundColor, color: styles.textColor, minHeight: 'calc(100vh - 60px)' }}> {/* Adjust minHeight if admin/preview bar is sticky */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-3xl font-bold mb-4" style={{ color: styles.primaryColor }}>{salon.name || 'Salon Name'}</h1>
                <p className="text-gray-600 mb-6">
                    {salon.description || 'Welcome to our salon! Providing quality services.'}
                </p>

                {salon.services && Array.isArray(salon.services) && salon.services.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3" style={{ color: styles.primaryColor }}>Services</h2>
                        <ul className="list-disc list-inside text-gray-700">
                            {salon.services.map((service, index) => (
                                <li key={index}>{service}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3" style={{ color: styles.primaryColor }}>Contact Info</h2>
                    <p className="text-gray-700"><strong>Location:</strong> {salon.location || 'Not specified'}</p>
                    {salon.address && <p className="text-gray-700"><strong>Address:</strong> {salon.address}</p>}
                    {salon.phone_number && <p className="text-gray-700"><strong>Phone:</strong> {salon.phone_number}</p>}
                    {salon.email && <p className="text-gray-700"><strong>Email:</strong> {salon.email}</p>}
                </div>

                 <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3" style={{ color: styles.primaryColor }}>Opening Hours</h2>
                    <div className="text-gray-700 whitespace-pre-line">{salon.opening_hours || SAMPLE_OPENING_HOURS_FALLBACK}</div>
                 </div>


                {/* Basic CTA */}
                 <div className="text-center mt-8">
                    <button
                        className="px-6 py-3 text-lg font-semibold text-white rounded-md"
                        style={{ backgroundColor: styles.primaryColor }}
                        onClick={() => alert('Booking not implemented in default template')}
                    >
                        Book Now
                    </button>
                 </div>

                {/* Add other sections as needed for a basic layout */}
            </div>
        </div>
    );
}

export default DefaultTemplate;