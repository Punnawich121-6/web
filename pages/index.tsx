import Image from "next/image";
import Navbar from "@/component/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Left Content */}
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-10">
          <div className="text-left space-y-8 max-w-4xl">
            {/* Welcome Text and Title */}
            <div className="space-y-6">
              <p className="text-2xl lg:text-3xl text-gray-600 font-medium tracking-wide">
                WELCOME TO
              </p>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-blue-600 leading-tight">
                TimeToUse
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-3 text-gray-700 text-xl lg:text-2xl max-w-2xl pt-4">
              <p>Access a variety of tools and equipment for your projects.</p>
              <p>Collaborate easily with friends and mentors.</p>
            </div>

            {/* Button */}
            <div className="pt-8">
              <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-12 py-4 rounded-full hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 font-semibold tracking-wide text-xl">
                BORROW NOW
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <Image
            src="/img3.png"
            width={650}
            height={650}
            alt="TimeToUse illustration"
            className="object-contain"
          />
        </div>
      </div>

      {/* Second Section - เนื้อหาส่วนที่ 2 */}
      <div className="min-h-screen bg-gray-50 flex items-center">
        <div className="container mx-auto px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Another Image or Content */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center text-blue-600">
                  <div className="text-6xl mb-4">🔧</div>
                  <p className="text-xl font-semibold">Equipment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Section - Features */}
      <div className="min-h-screen bg-white flex items-center">
        <div className="container mx-auto px-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              Our Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to make your projects successful
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-6">⚙️</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Professional Tools
              </h3>
              <p className="text-gray-600 text-lg">
                Access high-quality tools and equipment for your projects
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Easy Collaboration
              </h3>
              <p className="text-gray-600 text-lg">
                Work together with friends and mentors seamlessly
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-6">📅</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Simple Booking
              </h3>
              <p className="text-gray-600 text-lg">
                Book equipment and spaces with just a few clicks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
