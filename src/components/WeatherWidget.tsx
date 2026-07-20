import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Thermometer, 
  Wind, 
  Droplets,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherForecast {
  day: string;
  temp: string;
  icon: React.ReactNode;
  desc: string;
}

export default function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Custom weather states to make it interactive and fun!
  const [currentTemp, setCurrentTemp] = useState(25);
  const [condition, setCondition] = useState<'sunny' | 'partly' | 'cloudy' | 'rainy' | 'stormy'>('partly');

  const weatherData = {
    sunny: {
      text: 'Jasno',
      icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />,
      bgClass: 'from-amber-500/10 to-orange-500/10 border-amber-200/50',
      textClass: 'text-amber-700',
      description: 'Krásný slunečný den v Bohumíně. Ideální čas na rodinný výlet nebo bazén! ☀️'
    },
    partly: {
      text: 'Polojasno',
      icon: <CloudSun className="w-5 h-5 text-indigo-400 animate-bounce-slow" />,
      bgClass: 'from-sky-500/10 to-indigo-500/10 border-indigo-200/50',
      textClass: 'text-indigo-700',
      description: 'Příjemné počasí s občasnými mráčky. Vhodné na procházku podél Odry. 🌤️'
    },
    cloudy: {
      text: 'Zataženo',
      icon: <Cloud className="w-5 h-5 text-slate-400" />,
      bgClass: 'from-slate-500/10 to-slate-600/10 border-slate-200/50',
      textClass: 'text-slate-700',
      description: 'Slunce je dnes schované za mraky. Skvělý čas na deskovky s rodinou. ☁️'
    },
    rainy: {
      text: 'Déšť',
      icon: <CloudRain className="w-5 h-5 text-blue-400 animate-pulse" />,
      bgClass: 'from-blue-500/10 to-indigo-500/10 border-blue-200/50',
      textClass: 'text-blue-700',
      description: 'Venku prší. Nezapomeňte si vzít pláštěnky nebo deštníky při cestě na trénink! 🌧️'
    },
    stormy: {
      text: 'Bouřka',
      icon: <CloudLightning className="w-5 h-5 text-purple-500" />,
      bgClass: 'from-purple-500/10 to-fuchsia-500/10 border-purple-200/50',
      textClass: 'text-purple-700',
      description: 'Silná bouřka. Raději zůstaňte doma v bezpečí a uvařte si teplý čaj. ⚡'
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate random light changes in temperature
      setCurrentTemp(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const nextTemp = prev + delta;
        return nextTemp > 35 ? 35 : nextTemp < 10 ? 10 : nextTemp;
      });
      setIsRefreshing(false);
    }, 600);
  };

  const activeWeather = weatherData[condition];

  // 3-day forecast calculation based on condition
  const getForecast = (): WeatherForecast[] => {
    const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    // Let's get next 3 days starting tomorrow
    const tomorrowIdx = (new Date().getDay()) % 7;
    
    return [
      {
        day: 'Zítra',
        temp: `${currentTemp - 1}°C`,
        icon: <CloudSun className="w-4 h-4 text-sky-400" />,
        desc: 'Polojasno'
      },
      {
        day: days[tomorrowIdx],
        temp: `${currentTemp + 2}°C`,
        icon: <Sun className="w-4 h-4 text-amber-500" />,
        desc: 'Jasno'
      },
      {
        day: days[(tomorrowIdx + 1) % 7],
        temp: `${currentTemp - 2}°C`,
        icon: <CloudRain className="w-4 h-4 text-blue-400" />,
        desc: 'Přeháňky'
      }
    ];
  };

  return (
    <div className="relative">
      {/* Widget Trigger Capsule */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r ${activeWeather.bgClass} border border-slate-200/60 shadow-3xs cursor-pointer select-none transition`}
      >
        <div className="flex items-center justify-center">
          {activeWeather.icon}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
              Bohumín
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-black text-slate-800 tracking-tight">{currentTemp}°C</span>
            <span className="text-[10px] font-bold text-slate-500 leading-none">{activeWeather.text}</span>
          </div>
        </div>

        <div className="text-slate-400 shrink-0">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </motion.div>

      {/* Forecast & Simulator Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-3xl border border-slate-200 p-5 shadow-xl z-50 space-y-4 text-left"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Aktuální předpověď</span>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Počasí Bohumín – Dnes
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition ${isRefreshing ? 'animate-spin' : ''}`}
                title="Aktualizovat teplotu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weather status info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900">{currentTemp}°C</span>
                <div className="text-xs text-slate-500 font-semibold space-y-1">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Pocitová: {currentTemp + 1}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-400" /> Vítr: 4 m/s (S)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl leading-relaxed">
                {activeWeather.description}
              </p>
            </div>

            {/* 3-Day Forecast */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Předpověď na další dny</span>
              <div className="grid grid-cols-3 gap-2">
                {getForecast().map((f, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block leading-none">{f.day}</span>
                    <div className="flex justify-center my-1">{f.icon}</div>
                    <span className="text-xs font-black text-slate-800 block leading-none">{f.temp}</span>
                    <span className="text-[8px] font-bold text-slate-400 block truncate">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive simulator controls - Parent and kids friendly */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Simulátor počasí (Vyzkoušejte)
              </span>
              <div className="flex flex-wrap gap-1">
                {(['sunny', 'partly', 'cloudy', 'rainy', 'stormy'] as const).map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCondition(cond);
                      // Adjust typical temperatures
                      if (cond === 'sunny') setCurrentTemp(28);
                      if (cond === 'partly') setCurrentTemp(24);
                      if (cond === 'cloudy') setCurrentTemp(19);
                      if (cond === 'rainy') setCurrentTemp(16);
                      if (cond === 'stormy') setCurrentTemp(18);
                    }}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition border ${
                      condition === cond 
                        ? 'bg-indigo-600 text-white border-transparent' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {cond === 'sunny' && '☀️ Jasno'}
                    {cond === 'partly' && '🌤️ Polojasno'}
                    {cond === 'cloudy' && '☁️ Šero'}
                    {cond === 'rainy' && '🌧️ Déšť'}
                    {cond === 'stormy' && '⚡ Bouřka'}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
