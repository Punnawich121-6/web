"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";

export default function Page(): JSX.Element {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const setRef = (el: HTMLElement | null, i: number) => {
    sectionRefs.current[i] = el;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) setActiveIndex(idx);
        });
      },
      { root: null, rootMargin: "-30% 0px -30% 0px", threshold: 0.2 }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-800">
      {/* Library Navbar */}
      <LibraryNavbar />

      {/* Main Content */}
      <div className="pt-24">
        {/* Hero Section - Full Screen Welcome */}
        <section
          ref={(el) => setRef(el, 0)}
          data-index={0}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50/30 relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-100/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-50/40 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 sm:space-y-10 text-center lg:text-left"
              >
                <div className="space-y-6 sm:space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-block px-4 py-2 bg-red-50 border border-red-200/50 rounded-full"
                  >
                    <p className="text-sm sm:text-base text-red-600 uppercase tracking-wider font-semibold">
                      WELCOME TO TIME2USE
                    </p>
                  </motion.div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      EQUIPMENT
                    </span>
                    <br />
                    <span className="text-gray-900">Booking System</span>
                  </h1>

                  <div className="space-y-4 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    <p className="font-medium">
                      Enjoy borrowing the equipment that is available in various
                      options.
                    </p>
                    <p className="text-gray-500">Easy communication with your friends!</p>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.a
                    href="/auth"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl opacity-30 blur group-hover:opacity-50 transition-all duration-300"></div>
                    <button className="relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold uppercase tracking-wider rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-xl hover:shadow-2xl text-base sm:text-lg flex items-center justify-center gap-3">
                      <span>Borrow Now</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </motion.a>
                  <motion.a
                    href="/equipment/catalog"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold uppercase tracking-wider rounded-xl hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg">
                      View Catalog
                    </button>
                  </motion.a>
                </div>
              </motion.div>

              {/* Right Visual - Enhanced Library Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center hidden lg:flex"
              >
                <div className="relative w-full max-w-lg">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200">
                    {/* Library Scene */}
                    <div className="relative">
                      {/* Bookshelf */}
                      <div className="grid grid-cols-8 gap-1 mb-8">
                        {Array.from({ length: 32 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-12 rounded ${
                              Math.random() > 0.5
                                ? "bg-red-500"
                                : Math.random() > 0.5
                                ? "bg-gray-700"
                                : "bg-gray-500"
                            } shadow-sm`}
                          />
                        ))}
                      </div>

                      {/* Table and Person */}
                      <div className="relative">
                        {/* Table */}
                        <div className="w-full h-4 bg-gray-800 rounded-lg mb-4 shadow-md"></div>

                        {/* Person sitting */}
                        <div className="absolute -bottom-8 left-8 w-16 h-16 bg-red-500 rounded-full shadow-lg"></div>
                        <div className="absolute -bottom-16 left-6 w-20 h-12 bg-red-400 rounded-lg shadow-md"></div>

                        {/* Person standing */}
                        <div className="absolute -bottom-8 right-8 w-12 h-16 bg-gray-700 rounded-full shadow-lg"></div>
                        <div className="absolute -bottom-20 right-6 w-16 h-16 bg-gray-600 rounded-lg shadow-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
          >
            <div className="flex flex-col items-center space-y-3">
              <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">
                Scroll down for more information
              </p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-5 h-8 border-2 border-gray-400 rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-0.5 h-2 bg-gray-400 rounded-full mt-1.5"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>
        {/* Process Section */}
        <section
          ref={(el) => setRef(el, 1)}
          data-index={1}
          className="py-28 bg-gradient-to-b from-white to-gray-50 relative"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-100 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <div className="inline-block px-4 py-2 bg-red-50 border border-red-200/50 rounded-full mb-6">
                <p className="text-sm sm:text-base text-red-600 uppercase tracking-wider font-semibold">
                  HOW IT WORKS
                </p>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                <span className="text-gray-900">How to</span>
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {" "}Use the System
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A systematic and transparent equipment borrowing and returning process!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {[
                {
                  step: "1",
                  title: "Sign In",
                  desc: "Register and sign in with your user account",
                },
                {
                  step: "2",
                  title: "Select Equipment",
                  desc: "Search and select the equipment you need",
                },
                {
                  step: "3",
                  title: "Fill in Details",
                  desc: "Specify the purpose and duration of use",
                },
                {
                  step: "4",
                  title: "Submit Request",
                  desc: "Submit your request and wait for admin approval",
                },
                {
                  step: "5",
                  title: "Get Approval",
                  desc: "Check status and wait for notification",
                },
                {
                  step: "6",
                  title: "Pick Up Equipment",
                  desc: "Collect the equipment at the faculty at the scheduled time",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-red-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all"></div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center rounded-2xl shadow-xl flex-shrink-0">
                          {item.step}
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-red-600 uppercase tracking-wide bg-red-50 px-4 py-2 rounded-full border border-red-200/50">
                        Step {item.step}
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 uppercase tracking-wide group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section
          ref={(el) => setRef(el, 2)}
          data-index={2}
          className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <div className="inline-block px-4 py-2 bg-red-50 border border-red-200/50 rounded-full mb-6">
                <p className="text-sm sm:text-base text-red-600 uppercase tracking-wider font-semibold">
                  FEATURES
                </p>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  System
                </span>
                <span className="text-gray-900"> Features</span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A comprehensive system that covers all your organization's equipment management needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {[
                {
                  title: "Systematic Management",
                  desc: "A centralized system that helps manage equipment efficiently",
                },
                {
                  title: "Real-Time Calendar",
                  desc: "Prevent double bookings with an instantly updated calendar system",
                },
                {
                  title: "Reports and Statistics",
                  desc: "Comprehensive data for decision-making and procurement planning",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group relative text-center p-10 sm:p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-red-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/80 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  <div className="relative z-10">
                    <div className="relative inline-block mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl blur opacity-40 group-hover:opacity-60 transition-all"></div>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white text-4xl sm:text-5xl font-bold flex items-center justify-center rounded-3xl shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 uppercase tracking-wide group-hover:text-red-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section
          ref={(el) => setRef(el, 3)}
          data-index={3}
          className="py-28 bg-gradient-to-br from-white via-red-50/20 to-white relative overflow-hidden"
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-red-100/40 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 h-full">
                {Array.from({ length: 48 }, (_, i) => (
                  <div key={i} className="border-r border-gray-300"></div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto text-center px-4 sm:px-6 relative z-10"
          >
            <div className="space-y-10 sm:space-y-12">
              {/* Header */}
              <div className="space-y-6">
                <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 text-red-600 rounded-full text-sm sm:text-base font-semibold uppercase tracking-wider shadow-sm">
                  Ready to Start
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Start Using the System</span>
                  <br />
                  <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    Right Now
                  </span>
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Ready to provide an efficient and easy-to-use equipment management system for your organization
                </p>
                <motion.a
                  href="/auth"
                  className="inline-block group relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl opacity-30 blur group-hover:opacity-50 transition-all duration-300"></div>
                  <button className="relative px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-xl text-lg flex items-center gap-3">
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </motion.a>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Primary Action */}
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:border-red-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  <div className="relative z-10 space-y-5">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        Check Equipment
                      </h3>
                      <p className="text-gray-600">Check available equipment</p>
                    </div>
                    <a href="/Equipment_Catalog" className="block">
                      <button className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Check Now
                      </button>
                    </a>
                  </div>
                </motion.div>

                {/* Secondary Action */}
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:border-red-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-50/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                  <div className="relative z-10 space-y-5">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        View Usage Schedule
                      </h3>
                      <p className="text-gray-600">
                        Check equipment availability and plan usage
                      </p>
                    </div>
                    <a href="/table" className="block">
                      <button className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                        View Schedule
                      </button>
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 sm:pt-8">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-500 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>System available 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>Various types of equipment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span>Easy to manage and convenient to use</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Navigation Dots (remains large) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col gap-5">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => {
                sectionRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className={`w-5 h-5 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "bg-red-600 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base lg:text-xl text-gray-300">
            © {new Date().getFullYear()} Equipment System
            <span className="text-red-400 block sm:inline">
              {" "}
              — Professional Equipment Solutions
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
