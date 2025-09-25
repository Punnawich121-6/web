"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Contact Navbar (simplified)
const ContactNavbar = () => {
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

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/table"
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Calendar
            </Link>
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Login
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Developer Card Component
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
      className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100"
    >
      {/* Profile Image Placeholder */}
      <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
        <span>{imagePlaceholder}</span>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Developer Info */}
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
          <p className="text-lg text-blue-600 font-semibold">{role}</p>
        </div>

        <p className="text-slate-600 leading-relaxed">{description}</p>

        {/* Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Skills
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full border border-blue-200/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Links */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm font-medium">{email}</span>
          </div>

          <div className="flex gap-3 justify-center">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group/link"
              >
                <svg
                  className="w-5 h-5 text-slate-600 group-hover/link:text-slate-900 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group/link"
              >
                <svg
                  className="w-5 h-5 text-slate-600 group-hover/link:text-slate-900 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 transition-colors duration-300">
      {/* Navbar */}
      <ContactNavbar />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 mb-20"
          >
            <h1 className="text-4xl lg:text-6xl font-black">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto">
              พบกับทีมผู้จัดทำ TimeToUse
              ระบบยืม-คืนอุปกรณ์ที่ทันสมัยและมีประสิทธิภาพ
            </p>
          </motion.div>

          {/* Developers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Developer 1 */}
            <DeveloperCard
              name="[Your Name Here]"
              role="Full Stack Developer"
              description="ผู้จัดทำหลักของระบบ TimeToUse รับผิดชอบทั้งการออกแบบ Frontend และพัฒนา Backend เพื่อให้ระบบทำงานได้อย่างราบรื่นและมีประสิทธิภาพ"
              skills={[
                "React",
                "TypeScript",
                "Node.js",
                "PostgreSQL",
                "Tailwind CSS",
                "Next.js",
              ]}
              email="developer1@example.com"
              github="https://github.com/your-username"
              linkedin="https://linkedin.com/in/your-profile"
              imagePlaceholder="👨‍💻"
            />

            {/* Developer 2 */}
            <DeveloperCard
              name="[Partner Name Here]"
              role="UI/UX Designer & Frontend Developer"
              description="ผู้ออกแบบประสบการณ์ผู้ใช้และพัฒนา Frontend Interface เพื่อให้ผู้ใช้สามารถใช้งานระบบได้อย่างสะดวกและเข้าใจง่าย"
              skills={[
                "Figma",
                "React",
                "CSS",
                "JavaScript",
                "User Research",
                "Prototyping",
              ]}
              email="developer2@example.com"
              github="https://github.com/partner-username"
              linkedin="https://linkedin.com/in/partner-profile"
              imagePlaceholder="👩‍💻"
            />
          </div>

          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-12 bg-white rounded-3xl shadow-lg border border-slate-100 text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                About TimeToUse Project
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-4xl mx-auto">
              TimeToUse
              เป็นโปรเจคที่พัฒนาขึ้นเพื่อแก้ไขปัญหาการจัดการอุปกรณ์ในองค์กร
              ด้วยการใช้เทคโนโลยีที่ทันสมัยและการออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง
              เรามุ่งหวังให้ระบบนี้ช่วยให้การยืม-คืนอุปกรณ์เป็นเรื่องง่ายและมีประสิทธิภาพมากยิ่งขึ้น
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <span className="text-blue-700 font-semibold">
                  Made with Next.js
                </span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                <span className="text-emerald-700 font-semibold">
                  TypeScript
                </span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                <span className="text-pink-700 font-semibold">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                มีคำถามหรือข้อเสนอแนะ?
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              เรายินดีรับฟังความคิดเห็นและข้อเสนอแนะจากผู้ใช้งานเพื่อพัฒนาระบบให้ดีขึ้น
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  🏠 กลับหน้าหลัก
                </motion.button>
              </Link>

              <Link href="/table">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  📅 ดูปฏิทิน
                </motion.button>
              </Link>
            </div>
          </motion.div>
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
