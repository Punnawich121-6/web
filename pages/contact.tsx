"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";

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
  avatarUrl,
}: {
  name: string;
  role: string;
  description: string;
  skills: string[];
  email: string;
  github?: string;
  linkedin?: string;
  imagePlaceholder: string;
  avatarUrl?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center text-4xl sm:text-5xl text-gray-400 font-bold group-hover:scale-105 transition-transform duration-300 overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{imagePlaceholder}</span>
        )}
        <div className="absolute inset-0 rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="text-center space-y-3 sm:space-y-4 lg:space-y-5">
        <div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{name}</h3>
          <p className="text-base sm:text-lg lg:text-xl text-red-600 font-semibold">{role}</p>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">{description}</p>
        <div className="space-y-2 sm:space-y-3 pt-2">
          <h4 className="text-base sm:text-lg font-semibold text-gray-500 uppercase tracking-wide">
            Skills
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-red-100 text-red-700 rounded-full border border-red-200/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl bg-gray-100 text-gray-700">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-medium break-all">{email}</span>
          </div>

          <div className="flex gap-3 justify-center">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group/link"
              >
                <svg
                  className="w-6 h-6 text-gray-600 group-hover/link:text-gray-900 transition-colors"
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
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group/link"
              >
                <svg
                  className="w-6 h-6 text-gray-600 group-hover/link:text-gray-900 transition-colors"
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

interface GitHubProfile {
  name: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
}

export default function ContactPage() {
  const [githubProfile1, setGithubProfile1] = useState<GitHubProfile | null>(null);
  const [githubProfile2, setGithubProfile2] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGithubProfiles = async () => {
      try {
        // Fetch both profiles in parallel
        const [response1, response2] = await Promise.all([
          fetch('/api/github-profile?username=DolDolPeeradol'),
          fetch('/api/github-profile?username=Punnawich121-6')
        ]);

        if (response1.ok) {
          const result1 = await response1.json();
          if (result1.success && result1.data) {
            setGithubProfile1(result1.data);
          }
        }

        if (response2.ok) {
          const result2 = await response2.json();
          if (result2.success && result2.data) {
            setGithubProfile2(result2.data);
          }
        }
      } catch (error) {
        console.error('Error fetching GitHub profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGithubProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
      <LibraryNavbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-20 sm:pt-24 lg:pt-36 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-20"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-black">
              <span className="text-red-600">Contact Us</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-600 max-w-3xl mx-auto px-4">
              Meet the TimeToUse team,
              a modern and efficient equipment borrowing and returning system
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {loading ? (
              <div className="lg:col-span-2 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : (
              <>
                <DeveloperCard
                  name={githubProfile1?.name || "Name1"}
                  role="Full Stack"
                  description="Full Stack Developer"
                  skills={[
                    "Next.js",
                    "HTML",
                    "CSS",
                    "Javascript",
                    "Git",
                    "Python",
                    "Java"
                  ]}
                  email="dolpeeradol@gmail.com"
                  github={githubProfile1?.html_url || "https://github.com/DolDolPeeradol"}
                  linkedin="https://www.linkedin.com/in/peeradol-thanyatheeraphong-0b74b7377/?originalSubdomain=th"
                  imagePlaceholder="1"
                  avatarUrl={githubProfile1?.avatar_url}
                />
                <DeveloperCard
                  name={githubProfile2?.name || "Name2"}
                  role="Frontend"
                  description="Web development assistant"
                  skills={[
                    "HTML",
                    "CSS",
                  ]}
                  email="email"
                  github={githubProfile2?.html_url || "https://github.com/Punnawich121-6"}
                  linkedin="https://linkedin.com/in/partner-profile"
                  imagePlaceholder="2"
                  avatarUrl={githubProfile2?.avatar_url}
                />
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 lg:mt-20 p-6 sm:p-8 lg:p-12 bg-white rounded-3xl shadow-lg border border-gray-100 text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              <span className="text-red-600">About TimeToUse Project</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              TimeToUse is a project developed to solve equipment management problems in organizations
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-full">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">
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
            className="mt-12 sm:mt-16 lg:mt-20 text-center space-y-6 sm:space-y-8"
          >


            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-red-600 text-white font-bold shadow-xl hover:shadow-2xl hover:bg-red-700 transition-all duration-300 text-base sm:text-lg"
                >
                  Back to Home
                </motion.button>
              </Link>

              <Link href="/table">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg"
                >
                  View Calendar
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="py-6 sm:py-8 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base text-gray-300">
            © {new Date().getFullYear()} TimeToUse
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
