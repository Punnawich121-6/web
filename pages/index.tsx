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
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Library Navbar */}
      <LibraryNavbar />

      {/* Main Content */}
      <div className="pt-24">
        {" "}
        {/* Adjusted padding-top for taller navbar */}
        {/* Hero Section - Full Screen Welcome */}
        <section
          ref={(el) => setRef(el, 0)}
          data-index={0}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 relative"
        >
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-8">
                  <p className="text-2xl lg:text-3xl text-gray-600 uppercase tracking-wider font-medium">
                    WELCOME TO
                  </p>

                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    <span className="text-red-600">EQUIPMENT</span>
                    <br />
                    <span className="text-gray-900">System</span>
                  </h1>

                  <div className="space-y-4 text-lg lg:text-xl text-gray-600 leading-relaxed">
                    <p>
                      Enjoy borrowing the equipment that is available in various
                      options.
                    </p>
                    <p>Easy communication with your friends!</p>
                  </div>
                </div>

                <div className="pt-6">
                  <a href="/auth">
                    <button className="px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg text-lg transform hover:scale-105">
                      Borrow now
                    </button>
                  </a>
                </div>
              </motion.div>

              {/* Right Visual - Enhanced Library Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center"
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
                เลื่อนลงเพื่ออ่านข้อมูลเพิ่มเติม
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
        {/* Process Section (remains large) */}
        <section
          ref={(el) => setRef(el, 1)}
          data-index={1}
          className="py-28 bg-gray-100"
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-6xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
                ขั้นตอนการใช้งาน
              </h2>
              <p className="text-3xl text-gray-600 max-w-4xl mx-auto">
                กระบวนการยืม-คืนอุปกรณ์ที่เป็นระบบและโปร่งใส!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "เข้าสู่ระบบ",
                  desc: "ลงทะเบียนและเข้าสู่ระบบด้วยบัญชีผู้ใช้งาน",
                },
                {
                  step: "2",
                  title: "เลือกอุปกรณ์",
                  desc: "ค้นหาและเลือกอุปกรณ์ที่ต้องการใช้งาน",
                },
                {
                  step: "3",
                  title: "กรอกรายละเอียด",
                  desc: "ระบุวัตถุประสงค์และระยะเวลาการใช้งาน",
                },
                {
                  step: "4",
                  title: "ส่งคำขอ",
                  desc: "ยื่นคำขอและรอการอนุมัติจากผู้ดูแลระบบ",
                },
                {
                  step: "5",
                  title: "รับการอนุมัติ",
                  desc: "ตรวจสอบสถานะและรอการแจ้งเตือน",
                },
                {
                  step: "6",
                  title: "รับอุปกรณ์",
                  desc: "รับอุปกรณ์ที่คณะตามเวลาที่กำหนด",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-12 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 bg-red-600 text-white font-bold text-4xl flex items-center justify-center">
                      {item.step}
                    </div>
                    <div className="text-lg font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-5 py-3">
                      ขั้นตอนที่ {item.step}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Features Section (remains large) */}
        <section
          ref={(el) => setRef(el, 2)}
          data-index={2}
          className="py-28 bg-white"
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-6xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
                ความสามารถของระบบ
              </h2>
              <p className="text-3xl text-gray-600 max-w-4xl mx-auto">
                ระบบที่ครอบคลุมทุกความต้องการในการจัดการอุปกรณ์ขององค์กร
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "จัดการได้อย่างเป็นระบบ",
                  desc: "ระบบรวมศูนย์ที่ช่วยให้การจัดการอุปกรณ์เป็นไปอย่างมีประสิทธิภาพ",
                },
                {
                  title: "ปฏิทินแบบเรียลไทม์",
                  desc: "ป้องกันการจองซ้ำด้วยระบบปฏิทินที่อัปเดตทันที",
                },
                {
                  title: "รายงานและสถิติ",
                  desc: "ข้อมูลครบถ้วนสำหรับการตัดสินใจและวางแผนการจัดซื้อ",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center p-12 bg-gray-50 border border-gray-200"
                >
                  <div className="w-24 h-24 bg-red-600 text-white text-5xl font-bold flex items-center justify-center mx-auto mb-10">
                    {index + 1}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section - Redesigned */}
        <section
          ref={(el) => setRef(el, 3)}
          data-index={3}
          className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 48 }, (_, i) => (
                <div key={i} className="border-r border-gray-300"></div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto text-center px-6 relative z-10"
          >
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium uppercase tracking-wider">
                  Ready to Start
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  เริ่มใช้งานระบบ<span className="text-red-600">ได้ทันที</span>
                </h2>
                <a href="/auth" className="block">
                  <button className="w-half px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200">
                    เข้าสู่ระบบ
                  </button>
                </a>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  พร้อมให้บริการระบบจัดการอุปกรณ์ที่มีประสิทธิภาพและง่ายต่อการใช้งาน
                  เพื่อองค์กรของคุณ
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-8">
                {/* Primary Action */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mx-auto">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      ตรวจสอบอุปกรณ์
                    </h3>
                    <p className="text-gray-600">ตรวจสอบอุปกรณ์ที่มี</p>
                    <a href="/Equipment_Catalog" className="block">
                      <button className="w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200">
                        ทำการตรวจสอบ
                      </button>
                    </a>
                  </div>
                </motion.div>

                {/* Secondary Action */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mx-auto">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <h3 className="text-xl font-bold text-gray-900">
                      ดูตารางการใช้งาน
                    </h3>
                    <p className="text-gray-600">
                      ตรวจสอบความพร้อมของอุปกรณ์และวางแผนการใช้งาน
                    </p>
                    <a href="/table" className="block">
                      <button className="w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200">
                        ดูตารางเวลา
                      </button>
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Additional Info */}
              <div className="pt-8">
                <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>ระบบพร้อมใช้งาน 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>อุปกรณ์หลากหลายประเภท</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>จัดการง่าย ใช้งานสะดวก</span>
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

      {/* Footer (remains large) */}
      <footer className="py-12 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xl text-gray-300">
            © {new Date().getFullYear()} Equipment System
            <span className="text-red-400">
              {" "}
              — Professional Equipment Solutions
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
