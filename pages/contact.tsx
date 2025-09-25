"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// --- Standardized Navbar Component ---
const ContactNavbar = () => {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white shadow-md border-b border-gray-200"
        : "bg-white/95 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <a href="/" className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-2xl">T2U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-gray-800 uppercase tracking-wide">
                Time2Use
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <a
              href="/table"
              className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
            >
              Schedule
            </a>
            <a
              href="/Equipment_Catalog"
              className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
            >
              Catalog
            </a>
            <a
              href="/contact"
              className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
            >
              Contact
            </a>
            <a
              href="/auth"
              className="px-6 py-3 bg-red-600 text-white font-medium uppercase tracking-wide rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              เข้าสู่ระบบ
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-5"
          >
            <div className="space-y-5">
              <a
                href="/table"
                className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                Schedule
              </a>
              <a
                href="Equipment_Catalog"
                className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                Equipment_Catalog
              </a>
              <a
                href="/contact"
                className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                Contact
              </a>
              <a
                href="/auth"
                className="px-6 py-3 bg-red-600 text-white font-medium uppercase tracking-wide rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-sm hover:shadow-md"
              >
                เข้าสู่ระบบ
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};


// Developer Card Component (Font sizes increased)
const DeveloperCard = ({
  name,
  role,
  description,
  skills,
  email,
  github,
  linkedin,
  imagePlaceholder,
}: {
  name: string;
  role: string;
  description: string;
  skills: string[];
  email: string;
  github?: string;
  linkedin?: string;
  imagePlaceholder: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-5xl text-gray-400 font-bold group-hover:scale-105 transition-transform duration-300">
        <span>{imagePlaceholder}</span>
        <div className="absolute inset-0 rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="text-center space-y-5"> {/* Increased space */}
        <div>
          <h3 className="text-4xl font-bold text-gray-900">{name}</h3> {/* text-3xl -> text-4xl */}
          <p className="text-xl text-red-600 font-semibold">{role}</p> {/* text-lg -> text-xl */}
        </div>

        <p className="text-lg text-gray-600 leading-relaxed">{description}</p> {/* text-base -> text-lg */}

        <div className="space-y-3 pt-2">
          <h4 className="text-lg font-semibold text-gray-500 uppercase tracking-wide"> {/* text-base -> text-lg */}
            Skills
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-full border border-red-200/50" // text-xs -> text-sm, increased padding
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 text-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"> {/* Increased icon size */}
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-lg font-medium">{email}</span> {/* text-base -> text-lg */}
          </div>

          <div className="flex gap-3 justify-center">
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group/link">
                <svg className="w-6 h-6 text-gray-600 group-hover/link:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group/link">
                <svg className="w-6 h-6 text-gray-600 group-hover/link:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
      <ContactNavbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 mb-20"
          >
            <h1 className="text-5xl lg:text-7xl font-black">
              <span className="text-red-600">Contact Us</span>
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-600 max-w-3xl mx-auto">
              พบกับทีมผู้จัดทำ TimeToUse
              ระบบยืม-คืนอุปกรณ์ที่ทันสมัยและมีประสิทธิภาพ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <DeveloperCard name="[Your Name Here]" role="Full Stack Developer" description="ผู้จัดทำหลักของระบบ TimeToUse รับผิดชอบทั้งการออกแบบ Frontend และพัฒนา Backend เพื่อให้ระบบทำงานได้อย่างราบรื่นและมีประสิทธิภาพ" skills={["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Next.js",]} email="developer1@example.com" github="https://github.com/your-username" linkedin="https://linkedin.com/in/your-profile" imagePlaceholder="Dev" />
            <DeveloperCard name="[Partner Name Here]" role="UI/UX Designer & Frontend Developer" description="ผู้ออกแบบประสบการณ์ผู้ใช้และพัฒนา Frontend Interface เพื่อให้ผู้ใช้สามารถใช้งานระบบได้อย่างสะดวกและเข้าใจง่าย" skills={["Figma", "React", "CSS", "JavaScript", "User Research", "Prototyping",]} email="developer2@example.com" github="https://github.com/partner-username" linkedin="https://linkedin.com/in/partner-profile" imagePlaceholder="Dev" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-12 bg-white rounded-3xl shadow-lg border border-gray-100 text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-red-600">About TimeToUse Project</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              TimeToUse
              เป็นโปรเจคที่พัฒนาขึ้นเพื่อแก้ไขปัญหาการจัดการอุปกรณ์ในองค์กร
              ด้วยการใช้เทคโนโลยีที่ทันสมัยและการออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง
              เรามุ่งหวังให้ระบบนี้ช่วยให้การยืม-คืนอุปกรณ์เป็นเรื่องง่ายและมีประสิทธิภาพมากยิ่งขึ้น
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-gray-100 rounded-full">
                <span className="text-gray-700 font-semibold text-base">
                  Made with Next.js
                </span>
              </div>
              <div className="px-6 py-3 bg-gray-100 rounded-full">
                <span className="text-gray-700 font-semibold text-base">
                  TypeScript
                </span>
              </div>
              <div className="px-6 py-3 bg-red-100 rounded-full">
                <span className="text-red-700 font-semibold text-base">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="text-red-600">
                มีคำถามหรือข้อเสนอแนะ?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              เรายินดีรับฟังความคิดเห็นและข้อเสนอแนะจากผู้ใช้งานเพื่อพัฒนาระบบให้ดีขึ้น
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-red-600 text-white font-bold shadow-xl hover:shadow-2xl hover:bg-red-700 transition-all duration-300 text-lg"
                >
                  กลับหน้าหลัก
                </motion.button>
              </Link>

              <Link href="/table">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  ดูปฏิทิน
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="py-8 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-base text-gray-300">
            © {new Date().getFullYear()} TimeToUse
            <span className="text-red-400"> — Professional Equipment Solutions</span>
          </p>
        </div>
      </footer>
    </main>
  );
}