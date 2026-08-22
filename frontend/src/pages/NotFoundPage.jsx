import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiHome } from 'react-icons/hi2';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-primary-100/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary-100/40 blur-[80px] pointer-events-none" />

      <div
        className={`relative z-10 text-center px-6 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Large 404 */}
        <h1
          className="text-[180px] md:text-[220px] font-black leading-none tracking-tighter select-none"
          style={{
            background: 'linear-gradient(135deg, #2c6177 0%, #66a9c1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 -mt-4 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="not-found-go-home-btn"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <HiHome className="w-4 h-4" />
            Go Home
          </button>
          <button
            id="not-found-go-back-btn"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <HiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
