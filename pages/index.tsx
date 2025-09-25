"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";

export default function Page(): JSX.Element {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const setRef = (el: HTMLElement | null, i: number) =>
    (sectionRefs.current[i] = el);

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
        {/* Hero Section - Reduced font sizes here */}
        <section
          ref={(el) => setRef(el, 0)}
          data-index={0}
          className="py-28 bg-white"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-10" // Adjusted space
              >
                <div className="space-y-8">
                  <p className="text-4xl text-gray-600 uppercase tracking-wider font-medium">
                    {" "}
                    {/* Reduced size */}
                    WELCOME TO
                  </p>

                  <h1 className="text-7xl lg:text-7xl font-bold text-gray-900 leading-tight">
                    {" "}
                    {/* Reduced size */}
                    <span className="text-red-600">EQUIPMENT</span>
                    <br />
                    <span className="text-gray-900">System</span>
                  </h1>

                  <div className="space-y-5 text-2xl text-gray-600">
                    {" "}
                    {/* Reduced size */}
                    <p>
                      Enjoy borrowing the equipment that is available in various
                      options.
                    </p>
                    <p>Easy communication with your friends!.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <a href="/auth">
                    <button className="px-14 py-5 bg-red-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg text-2xl">
                      {" "}
                      {/* Reduced size & padding */}
                      Borrow now
                    </button>
                  </a>
                </div>
              </motion.div>

              {/* Right Visual - Library Illustration (remains the same) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center"
              >
                <div className="relative w-full max-w-lg">
                  <div className="bg-gray-100 rounded-2xl p-8 shadow-lg">
                    {/* Library Scene */}
                    <div className="relative">
                      {/* Bookshelf */}
                      <div className="grid grid-cols-8 gap-1 mb-8">
                        {Array.from({ length: 32 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-12 rounded-sm ${
                              Math.random() > 0.5
                                ? "bg-red-400"
                                : Math.random() > 0.5
                                ? "bg-gray-600"
                                : "bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Table and Person */}
                      <div className="relative">
                        {/* Table */}
                        <div className="w-full h-4 bg-gray-800 rounded-lg mb-4"></div>

                        {/* Person sitting */}
                        <div className="absolute -bottom-8 left-8 w-16 h-16 bg-red-400 rounded-full"></div>
                        <div className="absolute -bottom-16 left-6 w-20 h-12 bg-red-300 rounded-lg"></div>

                        {/* Person standing */}
                        <div className="absolute -bottom-8 right-8 w-12 h-16 bg-gray-600 rounded-full"></div>
                        <div className="absolute -bottom-20 right-6 w-16 h-16 bg-gray-500 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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
        {/* CTA Section (remains large) */}
        <section
          ref={(el) => setRef(el, 3)}
          data-index={3}
          className="py-28 bg-red-600"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto text-center px-6"
          >
            <div className="space-y-12 text-white">
              <h2 className="text-4xl lg:text-8xl font-bold uppercase tracking-wide">
                เริ่มใช้งานระบบได้ทันที
              </h2>
              <p className="text-3xl opacity-90 max-w-3xl mx-auto">
                พร้อมให้บริการระบบจัดการอุปกรณ์ที่มีประสิทธิภาพ
                เพื่อองค์กรของคุณ
              </p>

              <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <a href="/auth">
                  <button className="px-16 py-6 bg-white text-red-600 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors duration-200 shadow-lg text-2xl">
                    BOOKING HERE
                  </button>
                </a>

                <a href="/table">
                  <button className="px-12 py-6 border-2 border-white text-white font-bold uppercase tracking-wider hover:bg-red-700 transition-colors duration-200 text-2xl">
                    VIEW SCHEDULE
                  </button>
                </a>
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
