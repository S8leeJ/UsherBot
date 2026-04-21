'use client';

import { useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showReservation, setShowReservation] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const utid = formData.get('utid');
    console.log('UT ID submitted:', utid);
    setIsLoggedIn(true);
  };

  const handleReservationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reservationData = {
      id: formData.get('reservationId'),
      datetime: formData.get('datetime'),
      seat: formData.get('seat'),
    };
    console.log('Reservation submitted:', reservationData);
    setShowReservation(false);
  };

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="w-[90%] max-w-[420px] p-12 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 className="text-[2rem] font-semibold text-center mb-2" style={{ color: '#667eea' }}>
            Welcome
          </h1>
          <p className="text-[#666] text-center mb-8 text-[0.95rem]">
            Please enter your UT ID to continue
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="utid"
                className="block text-[#333] text-[0.9rem] font-medium mb-2"
              >
                UT ID
              </label>
              <input
                type="text"
                id="utid"
                name="utid"
                placeholder="Enter your UT ID"
                required
                className="w-full p-4 border-2 border-[#e0e0e0] rounded-[12px] text-base outline-none transition-all duration-300 focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            </div>
            <button
              type="submit"
              className="w-full p-4 text-white border-none rounded-[12px] text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Home Page with Navbar
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
                UT Home
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReservation(true)}
                className="px-6 py-2 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                Make a Reservation
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#667eea' }}>
            Welcome to UT Portal
          </h2>
          <p className="text-gray-600 text-lg">
            You have successfully logged in. Use the navigation bar above to make a reservation.
          </p>
        </div>
      </div>

      {/* Centered Reservation Modal */}
      {showReservation && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowReservation(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-[420px] p-8 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: '#667eea' }}>
                  Make a Reservation
                </h2>
                <button
                  onClick={() => setShowReservation(false)}
                  className="text-3xl text-gray-500 hover:text-gray-700 transition-colors leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleReservationSubmit}>
                <div className="mb-5">
                  <label
                    htmlFor="reservationId"
                    className="block text-[#333] text-[0.9rem] font-medium mb-2"
                  >
                    ID
                  </label>
                  <input
                    type="text"
                    id="reservationId"
                    name="reservationId"
                    placeholder="Enter your ID"
                    required
                    className="w-full p-4 border-2 border-[#e0e0e0] rounded-xl text-base outline-none transition-all duration-300 focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                  />
                </div>
                <div className="mb-5">
                  <label
                    htmlFor="datetime"
                    className="block text-[#333] text-[0.9rem] font-medium mb-2"
                  >
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="datetime"
                    name="datetime"
                    required
                    className="w-full p-4 border-2 border-[#e0e0e0] rounded-xl text-base outline-none transition-all duration-300 focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="seat"
                    className="block text-[#333] text-[0.9rem] font-medium mb-2"
                  >
                    Seat Number
                  </label>
                  <input
                    type="text"
                    id="seat"
                    name="seat"
                    placeholder="Enter seat number"
                    required
                    className="w-full p-4 border-2 border-[#e0e0e0] rounded-xl text-base outline-none transition-all duration-300 focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full p-4 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  Submit Reservation
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
