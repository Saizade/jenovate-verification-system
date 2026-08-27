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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-ocean-50/20 to-surface-50">
      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-ocean-100/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-ocean-200/20 blur-[80px] pointer-events-none" />

      <div
        className={`relative z-10 text-center px-6 transition-all duration-500 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Large 404 */}
        <h1
          className="text-[160px] md:text-[200px] font-heading font-extrabold leading-none tracking-tighter select-none"
          style={{
            background: 'linear-gradient(135deg, #0c1e3a 0%, #0e6ba8 60%, #3fa7e8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-ocean-950 -mt-2 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="not-found-go-home-btn"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-sm rounded-lg transition-all duration-150 shadow-sm"
          >
            <HiHome className="w-4 h-4" />
            Go Home
          </button>
          <button
            id="not-found-go-back-btn"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-surface-200 hover:border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-all duration-150 shadow-sm"
          >
            <HiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
