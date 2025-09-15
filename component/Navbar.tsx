import Link from 'next/link';

export default function () {
    return (
        <div className="flex justify-between bg-white/70 backdrop-blur-xl mt-0 items-center px-12 py-5 sticky top-0 z-50 border-b border-white/20 shadow-lg shadow-black/5">
            <div className="text-[2.2rem] font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                <Link href="/"><h1>Time2Use</h1></Link>
            </div>
            <div className="flex items-center space-x-10">
                <div className="flex space-x-8 text-gray-700 font-medium">
                    <Link href="/Equipment_Catalog" className="hover:text-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">Equipment Catalog</Link>
                    <Link href="/Borrow_Equipment" className="hover:text-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">Borrow Equipment</Link>
                    <Link href="/Borrowing_Policies" className="hover:text-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">Borrowing Policies</Link>
                    <Link href="/Borrowing_History" className="hover:text-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">My Borrowing History</Link>
                    <Link href="/ContactUs" className="hover:text-indigo-600 cursor-pointer transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">Contact Us</Link>
                </div>
                <Link href="/login">
                    <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-full hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 font-semibold tracking-wide">
                        Login
                    </button>
                </Link>
            </div>
        </div>
    )
}
