"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Minimal Navbar Component - Only Calendar & Login with Contact
const MinimalNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-1 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-black text-lg">T</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TimeToUse
              </span>
              <span className="text-xs text-slate-500 -mt-1">
                Equipment Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/table"
              className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-all duration-300 hover:scale-105"
            >
              <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">📅</span>
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                ดูปฏิทิน
              </span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-all duration-300 hover:scale-105 font-semibold text-slate-700"
            >
              Contact Us
            </Link>

            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative">เข้าสู่ระบบ</span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-all duration-300"
            >
              <motion.svg
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                )}
              </motion.svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-6 space-y-4">
            <Link
              href="/table"
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm">📅</span>
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                ดูปฏิทิน
              </span>
            </Link>

            <Link
              href="/contact"
              className="block p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-all font-semibold text-slate-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white font-bold shadow-lg">
                เข้าสู่ระบบ
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 transition-colors duration-300">
      {/* Minimal Navbar */}
      <MinimalNavbar />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section
          ref={(el) => setRef(el, 0)}
          data-index={0}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">
                    Smart Equipment Management
                  </span>
                </motion.div>

                <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Time
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ToUse
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-slate-600 max-w-2xl leading-relaxed">
                  ระบบยืม-คืนอุปกรณ์อัจฉริยะ
                  ที่ช่วยให้การจัดการทรัพยากรในองค์กรเป็นเรื่องง่าย
                  <span className="text-blue-600 font-semibold">
                    {" "}
                    ทันสมัย
                  </span>{" "}
                  และ
                  <span className="text-purple-600 font-semibold">
                    {" "}
                    มีประสิทธิภาพ
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center gap-2">
                      🚀 เริ่มใช้งานเลย
                    </span>
                  </motion.button>
                </Link>

                <Link href="/table">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                  >
                    <span className="flex items-center gap-2">
                      📅 ดูปฏิทินการใช้งาน
                    </span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative w-[380px] h-[380px]"
            >
              <Image
                src="/img3.png"
                width={650}
                height={650}
                alt="TimeToUse illustration"
                className="object-contain"
              />
            </motion.div>
          </div>
        </section>

        {/* How to Use Section */}
        <section
          ref={(el) => setRef(el, 1)}
          data-index={1}
          className="min-h-screen flex items-center justify-center px-6 bg-white/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-4xl lg:text-6xl font-black">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  วิธีการใช้งาน
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                ใช้งานง่ายเพียง 6 ขั้นตอน
                เริ่มต้นจากการเข้าสู่ระบบจนถึงการรับอุปกรณ์
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "เข้าสู่ระบบ",
                  desc: "ลงทะเบียนหรือเข้าสู่ระบบด้วยบัญชีของคุณ",
                  icon: "🔐",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  step: "02",
                  title: "ค้นหาอุปกรณ์",
                  desc: "เลือกอุปกรณ์ที่ต้องการจากรายการหรือค้นหาตามชื่อ",
                  icon: "🔍",
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  step: "03",
                  title: "กรอกข้อมูล",
                  desc: "ระบุวัตถุประสงค์ ระยะเวลา และข้อมูลที่จำเป็น",
                  icon: "📝",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  step: "04",
                  title: "ยื่นคำขอ",
                  desc: "ส่งคำขอยืมและรอการอนุมัติจากเจ้าหน้าที่",
                  icon: "📨",
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  step: "05",
                  title: "รอการอนุมัติ",
                  desc: "ติดตามสถานะคำขอผ่านระบบและรอการแจ้งเตือน",
                  icon: "⏳",
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  step: "06",
                  title: "รับที่คณะ",
                  desc: "นำหลักฐานไปรับอุปกรณ์ที่คณะตามเวลาที่กำหนด",
                  icon: "🎯",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group p-6 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      STEP {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section
          ref={(el) => setRef(el, 2)}
          data-index={2}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <div className="max-w-7xl mx-auto space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-4xl lg:text-6xl font-black">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ทำไมต้อง TimeToUse?
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                เราออกแบบระบบที่ตอบโจทย์ปัญหาจริงของการยืม-คืนอุปกรณ์ในองค์กร
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎯",
                  title: "จัดการได้ง่าย",
                  desc: "ระบบรวมศูนย์ครบจบในที่เดียว ไม่ต้องค้นหาข้อมูลกระจัดกระจาย",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: "📅",
                  title: "ไม่มีการจองซ้อน",
                  desc: "ปฏิทินแบบเรียลไทม์ป้องกันการจองซ้ำและความขัดแย้ง",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: "📊",
                  title: "ข้อมูลชัดเจน",
                  desc: "รายงานและสถิติครบถ้วนสำหรับการตัดสินใจจัดซื้ออุปกรณ์",
                  gradient: "from-emerald-500 to-teal-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          ref={(el) => setRef(el, 3)}
          data-index={3}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-8 p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black">
                พร้อมเริ่มต้นแล้วหรือยัง?
              </h2>
              <p className="text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto">
                เข้าร่วมกับเรา
                และสัมผัสประสบการณ์การจัดการอุปกรณ์ที่ไม่เหมือนใคร
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-4 bg-white text-blue-600 font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative">🚀 เริ่มใช้งานทันที</span>
                  </motion.button>
                </Link>

                <Link href="/table">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all duration-300"
                  >
                    📅 ดูปฏิทิน
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => {
                sectionRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-125 shadow-lg"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-white/80 backdrop-blur-sm border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600">
            © {new Date().getFullYear()} TimeToUse —
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Built with ❤️ for modern teams
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
