"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Page(): JSX.Element {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const setRef = (el: HTMLElement | null, i: number) =>
    (sectionRefs.current[i] = el);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
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
    <main className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-32 max-w-7xl mx-auto px-6 space-y-20">
        {/* Hero Section */}
        <section
          ref={(el) => setRef(el, 0)}
          data-index={0}
          className="min-h-[75vh] flex flex-col lg:flex-row items-center gap-8"
        >
          {/* Left Content */}
          <div className="lg:w-6/12 flex flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">
                Introducing
              </p>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-blue-600 leading-tight">
                TimeToUse
              </h1>
              <div className="space-y-3 text-gray-700 text-xl lg:text-2xl max-w-2xl pt-4">
                <p>
                  Access a variety of tools and equipment for your projects.
                </p>
                <p>Collaborate easily with friends and mentors.</p>
              </div>
              <div className="mt-8 flex gap-4">
                <Link href="/login">
                  <button className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold shadow-lg">
                    Start borrowing
                  </button>
                </Link>
                <a
                  href="#how"
                  className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium"
                >
                  How it works
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <div className="lg:w-6/12 flex justify-center">
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

        {/* Problem Section */}
        <section
          ref={(el) => setRef(el, 1)}
          data-index={1}
          className="min-h-[65vh] flex items-center bg-slate-50 rounded-3xl p-8"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
          >
            <motion.div variants={fadeUp} className="p-6">
              <h3 className="text-3xl font-bold">
                We fixed the problems teams face
              </h3>
              <p className="mt-4 text-slate-600">
                จากการสัมภาษณ์ผู้ดูแลและนิสิต
                เราพบปัญหาหลักสามข้อที่ทำให้ระบบยืมของเดิมไม่เวิร์ค
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  {
                    num: "1",
                    title: "ไม่มีระบบรวมศูนย์",
                    desc: "ข้อมูลกระจัดกระจาย ทำให้ค้นหาและตรวจสอบยาก",
                  },
                  {
                    num: "2",
                    title: "จองซ้ำและขัดแย้ง",
                    desc: "ไม่มีปฏิทินกลาง ทำให้เกิดการจองซ้อน",
                  },
                  {
                    num: "3",
                    title: "ยากต่อการตรวจสอบ",
                    desc: "ไม่มีประวัติชัดเจนและสถิติในการตัดสินใจจัดซื้อ",
                  },
                ].map((item) => (
                  <li key={item.num} className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">
                      {item.num}
                    </div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-slate-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="p-6 flex justify-center">
              <div className="w-[320px] h-[320px] rounded-2xl bg-gradient-to-br from-white to-indigo-50 shadow-lg border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-6xl">🔍</div>
                <div className="mt-4 text-lg font-semibold">
                  Inventory Insights
                </div>
                <div className="mt-2 text-slate-500 text-center">
                  สรุปข้อมูลการยืม รายการยอดนิยม และสถานะอุปกรณ์แบบเรียลไทม์
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* How it works */}
        <section
          ref={(el) => setRef(el, 2)}
          data-index={2}
          id="how"
          className="min-h-[65vh] grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { n: "01", t: "Choose", d: "ค้นหาอุปกรณ์จากหมวดหรือค้นหาโดยชื่อ" },
            { n: "02", t: "Book", d: "เลือกช่วงเวลาและยืนยันการจอง" },
            { n: "03", t: "Pickup", d: "รับอุปกรณ์ด้วย QR หรือรหัสที่ระบบให้" },
            { n: "04", t: "Return", d: "คืนตามเงื่อนไข พร้อมบันทึกสภาพ" },
          ].map((s) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition flex flex-col"
            >
              <div className="text-indigo-600 font-extrabold text-3xl">
                {s.n}
              </div>
              <h4 className="mt-4 text-xl font-semibold">{s.t}</h4>
              <p className="mt-2 text-slate-600 flex-1">{s.d}</p>
            </motion.div>
          ))}
        </section>

        {/* Final CTA */}
        <section
          ref={(el) => setRef(el, 3)}
          data-index={3}
          className="min-h-[55vh] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full p-10 bg-gradient-to-br from-indigo-700 to-pink-500 rounded-3xl text-white shadow-2xl"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-extrabold">Are you ready to use?</h2>
              <p className="mt-4 text-lg opacity-90">
                สมัครสมาชิกหรือเข้าสู่ระบบเพื่อเริ่มยืมอุปกรณ์ —
                ระบบพร้อมให้บริการในคณะของคุณ
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/auth">
                  <button className="px-8 py-4 rounded-full bg-white text-indigo-700 font-semibold shadow">
                    Get started
                  </button>
                </Link>
                <a
                  href="#how"
                  className="px-6 py-3 rounded-full border border-white/30 text-white/90"
                >
                  Explore features
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Scroll indicators */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col items-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <a
              key={i}
              href={`#${i}`}
              onClick={(e) => {
                e.preventDefault();
                sectionRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                activeIndex === i
                  ? "bg-indigo-600 scale-110 shadow-lg"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TimeToUse — Built with ❤️ for your
          faculty
        </div>
      </footer>
    </main>
  );
}
