import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';
import { motion, AnimatePresence } from 'framer-motion';

// Import images
import slide1 from '../assets/login-slide-1.png';
import slide2 from '../assets/login-slide-2.png';
import slide3 from '../assets/login-slide-3.png';

const slides = [
  { id: 1, src: slide1, title: "Smart Energy Management", desc: "Monitor your home's energy consumption in real-time." },
  { id: 2, src: slide2, title: "Eco-Friendly Living", desc: "Optimize renewable energy sources for a greener future." },
  { id: 3, src: slide3, title: "Advanced Analytics", desc: "Gain insights with AI-powered usage analysis." }
];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { login, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e, credentials = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    // Use credentials if provided, otherwise fallback to state
    const loginUser = credentials?.username || username;
    const loginPass = credentials?.password || password;

    setIsLoading(true);

    try {
      await login(loginUser, loginPass);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Link to="/" className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md group">
        <ArrowRightIcon className="h-4 w-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Home</span>
      </Link>
      <div className="flex w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mx-4 min-h-[600px]">

        {/* Left Side - Image Carousel */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-gray-900">
          <AnimatePresence initial={false} custom={1}>
            <motion.div
              key={currentSlide}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 w-full h-full"
            >
              <OptimizedImage
                src={slides[currentSlide].src}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Content Overlay */}
          <div className="absolute bottom-12 left-0 right-0 p-8 text-center text-white z-10">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-2">{slides[currentSlide].title}</h2>
              <p className="text-lg text-gray-200">{slides[currentSlide].desc}</p>
            </motion.div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <motion.div

          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-800"
        >
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h3>
              <p className="text-gray-500 dark:text-gray-400">Access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-gray-900 dark:text-white"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  {/* <a href="#" className="text-xs text-primary hover:text-primary-dark">Forgot password?</a> */}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-gray-900 dark:text-white pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUsername('demo@shem.pro');
                  setPassword('demo123');
                  handleLogin({ preventDefault: () => { } }, { username: 'demo@shem.pro', password: 'demo123' });
                }}
                className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
              >
                Let me try a Demo
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div >
  );
};

export default LoginPage;