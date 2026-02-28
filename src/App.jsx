import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Trophy, Loader2, Activity } from 'lucide-react';

// --- DANH SÁCH GIẢI ĐẤU (Có thêm thuộc tính order để sắp xếp giải) ---
const LEAGUES = [
  // Châu Âu (Top)
  { id: 'eng.1', name: 'Ngoại Hạng Anh', color: 'bg-purple-600', text: 'text-purple-700', order: 1 },
  { id: 'uefa.champions', name: 'Champions League', color: 'bg-blue-800', text: 'text-blue-800', order: 2 },
  { id: 'uefa.europa', name: 'Europa League', color: 'bg-orange-500', text: 'text-orange-600', order: 3 },
  { id: 'esp.1', name: 'La Liga', color: 'bg-red-500', text: 'text-red-600', order: 4 },
  { id: 'ita.1', name: 'Serie A', color: 'bg-blue-600', text: 'text-blue-700', order: 5 },
  { id: 'ger.1', name: 'Bundesliga', color: 'bg-red-600', text: 'text-red-700', order: 6 },
  { id: 'fra.1', name: 'Ligue 1', color: 'bg-green-500', text: 'text-green-600', order: 7 },
  
  // Hạng Nhì Châu Âu
  { id: 'eng.2', name: 'Championship (Anh)', color: 'bg-gray-700', text: 'text-gray-700', order: 8 },
  { id: 'esp.2', name: 'La Liga 2', color: 'bg-red-400', text: 'text-red-500', order: 9 },
  { id: 'ita.2', name: 'Serie B', color: 'bg-blue-400', text: 'text-blue-500', order: 10 },
  { id: 'ger.2', name: '2. Bundesliga', color: 'bg-red-500', text: 'text-red-600', order: 11 },

  // Châu Mỹ
  { id: 'bra.1', name: 'Serie A (Brazil)', color: 'bg-yellow-500', text: 'text-yellow-600', order: 12 },
  { id: 'arg.1', name: 'Liga Profesional (Arg)', color: 'bg-blue-400', text: 'text-blue-500', order: 13 },
  { id: 'mex.1', name: 'Liga MX', color: 'bg-green-600', text: 'text-green-700', order: 14 },
  { id: 'usa.1', name: 'MLS', color: 'bg-blue-500', text: 'text-blue-600', order: 15 },

  // Châu Á, Úc & Trung Đông
  { id: 'kor.1', name: 'K League 1', color: 'bg-blue-700', text: 'text-blue-800', order: 16 },
  { id: 'jpn.1', name: 'J1 League', color: 'bg-red-700', text: 'text-red-800', order: 17 },
  { id: 'tur.1', name: 'Süper Lig (Thổ)', color: 'bg-red-600', text: 'text-red-700', order: 18 },
  { id: 'chn.1', name: 'Super League (TQ)', color: 'bg-red-500', text: 'text-red-600', order: 19 },
  { id: 'aus.1', name: 'A-League (Úc)', color: 'bg-yellow-600', text: 'text-yellow-700', order: 20 },
  { id: 'ksa.1', name: 'Saudi Pro League', color: 'bg-green-700', text: 'text-green-800', order: 21 },
  { id: 'afc.champions', name: 'AFC Champions League', color: 'bg-indigo-600', text: 'text-indigo-700', order: 22 },

  // Đông Nam Á
  { id: 'vie.1', name: 'V.League 1', color: 'bg-red-600', text: 'text-red-700', order: 23 },
  { id: 'tha.1', name: 'Thai League 1', color: 'bg-blue-700', text: 'text-blue-800', order: 24 },
  { id: 'idn.1', name: 'Liga 1 (Indo)', color: 'bg-red-500', text: 'text-red-600', order: 25 },
  { id: 'aff.championship', name: 'AFF Cup', color: 'bg-blue-600', text: 'text-blue-700', order: 26 },
  
  // Trẻ, Nữ & Giao hữu
  { id: 'fifa.friendly', name: 'Giao hữu Quốc tế', color: 'bg-blue-400', text: 'text-blue-500', order: 27 },
  { id: 'club.friendly', name: 'Giao hữu CLB', color: 'bg-gray-500', text: 'text-gray-600', order: 28 },
  { id: 'afc.u23', name: 'U23 Châu Á', color: 'bg-indigo-500', text: 'text-indigo-600', order: 29 },
  { id: 'eng.w.1', name: 'Ngoại Hạng Anh (Nữ)', color: 'bg-pink-600', text: 'text-pink-700', order: 30 },
];

const getVNTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
};

const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getDisplayDate = (dateObj) => {
  const today = getVNTime();
  const tomorrow = getVNTime(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = getVNTime(); yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = dateObj.toDateString();
  if (dateStr === today.toDateString()) return 'Hôm nay';
  if (dateStr === tomorrow.toDateString()) return 'Ngày mai';
  if (dateStr === yesterday.toDateString()) return 'Hôm qua';
  
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${days[dateObj.getDay()]}, ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getVNTime());
  const [groupedMatches, setGroupedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const dateStrip = useMemo(() => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDate]);

  const fetchMatches = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const dateStr = formatDateToString(selectedDate);

    try {
      const results = await Promise.allSettled(
        LEAGUES.map(async (league) => {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${dateStr}`);
          if (!res.ok) return null;
          const data = await res.json();
          
          if (data.events && data.events.length > 0) {
            const matches = data.events.map(event => {
              const comp = event.competitions[0];
              const home = comp.competitors.find(c => c.homeAway === 'home');
              const away = comp.competitors.find(c => c.homeAway === 'away');

              // Tính giờ Việt Nam
              const eventDate = new Date(event.date);
              const vnDateObj = new Date(eventDate.getTime() + (eventDate.getTimezoneOffset() * 60000) + (7 * 3600000));
              const timeString = `${vnDateObj.getHours().toString().padStart(2, '0')}:${vnDateObj.getMinutes().toString().padStart(2, '0')}`;

              // Lấy điểm số từng hiệp (nếu có)
              let homeHT = null, awayHT = null;
              if (home.linescores && home.linescores.length > 0) homeHT = home.linescores[0].value;
              if (away.linescores && away.linescores.length > 0) awayHT = away.linescores[0].value;

              // Penalty Score
              const homePen = home.shootoutScore;
              const awayPen = away.shootoutScore;

              // Xử lý trạng thái chi tiết (Hiệp 1, Hiệp 2, Nghỉ, Hiệp phụ)
              let statusText = 'Chưa đá';
              let isLive = false;
              const period = event.status.period;
              const state = event.status.type.state;
              const detail = event.status.type.detail;

              if (state === 'post') {
                statusText = 'KT';
                if (detail.includes('Extra') || detail.includes('AET')) statusText = 'KT (Sau HP)';
                if (detail.includes('Pen')) statusText = 'KT (Luân lưu)';
              } else if (state === 'in') {
                isLive = true;
                const clock = event.status.displayClock;
                if (detail.includes('Half')) statusText = '⚽ Nghỉ HT';
                else if (period === 1) statusText = `🔴 H1 - ${clock}'`;
                else if (period === 2) statusText = `🔴 H2 - ${clock}'`;
                else if (period === 3) statusText = `🔴 HP1 - ${clock}'`;
                else if (period === 4) statusText = `🔴 HP2 - ${clock}'`;
                else if (period === 5) statusText = '🔴 Đang đá Pen';
                else statusText = clock ? `🔴 ${clock}'` : '🔴 Đang đá';
              } else if (state === 'canceled' || state === 'postponed') {
                statusText = 'Hoãn';
              }

              return {
                id: event.id,
                rawDate: vnDateObj, // Dùng để sắp xếp
                timeString,
                homeTeam: home.team.shortDisplayName || home.team.displayName,
                homeLogo: home.team.logo,
                homeScore: home.score,
                homeHT,
                homePen,
                awayTeam: away.team.shortDisplayName || away.team.displayName,
                awayLogo: away.team.logo,
                awayScore: away.score,
                awayHT,
                awayPen,
                statusText,
                isLive,
                state
              };
            });

            // SẮP XẾP TRẬN ĐẤU TRONG TỪNG GIẢI THEO THỜI GIAN
            matches.sort((a, b) => a.rawDate - b.rawDate);

            return { leagueInfo: league, matches };
          }
          return null;
        })
      );

      // GOM LẠI VÀ SẮP XẾP CÁC GIẢI ĐẤU THEO THỨ TỰ (order)
      const validData = results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)
        .sort((a, b) => a.leagueInfo.order - b.leagueInfo.order);

      setGroupedMatches(validData);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(true);

    const isToday = selectedDate.toDateString() === getVNTime().toDateString();
    let interval;

    if (isToday) {
      setIsAutoRefreshing(true);
      interval = setInterval(() => { fetchMatches(false); }, 60000);
    } else {
      setIsAutoRefreshing(false);
    }

    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-blue-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <h1 className="text-xl font-bold tracking-wide">LiveScore Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAutoRefreshing && (
              <span className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-100 px-2 py-1 rounded-full border border-green-500/30">
                <Activity className="w-3 h-3 animate-pulse" /> Trực tiếp
              </span>
            )}
            <div className="relative p-2 hover:bg-blue-700 rounded-full transition-colors cursor-pointer">
              <Calendar className="w-5 h-5" />
              <input 
                type="date" 
                value={formatDateToString(selectedDate).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
                onChange={(e) => { if(e.target.value) setSelectedDate(new Date(e.target.value)); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-700 border-t border-blue-500/30">
          <div className="max-w-3xl mx-auto px-2 py-2 flex items-center justify-between">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} className="p-1 hover:bg-blue-600 rounded-full text-blue-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 flex justify-center gap-1 sm:gap-2 overflow-hidden">
              {dateStrip.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === getVNTime().toDateString();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center min-w-[55px] sm:min-w-[70px] py-1.5 rounded-lg transition-all ${
                      isSelected ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-medium opacity-80">
                      {isToday ? 'H.Nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
                    </span>
                    <span className={`text-sm sm:text-base ${isSelected ? 'font-bold' : ''}`}>
                      {String(date.getDate()).padStart(2, '0')}/{String(date.getMonth() + 1).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} className="p-1 hover:bg-blue-600 rounded-full text-blue-100">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 py-6 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-gray-600 font-medium">Lịch thi đấu <span className="text-blue-600 font-bold">{getDisplayDate(selectedDate)}</span></h2>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">GMT+7</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : groupedMatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không có trận đấu nào trong danh sách.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groupedMatches.map((leagueGroup) => (
              <div key={leagueGroup.leagueInfo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Header Giải Đấu */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${leagueGroup.leagueInfo.color} shadow-inner`}>
                    {leagueGroup.leagueInfo.name.charAt(0)}
                  </div>
                  <h3 className={`font-bold uppercase tracking-wide ${leagueGroup.leagueInfo.text}`}>
                    {leagueGroup.leagueInfo.name}
                  </h3>
                </div>

                {/* Danh sách trận trong giải */}
                <div className="divide-y divide-gray-100">
                  {leagueGroup.matches.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Time & Status */}
                        <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 sm:w-28 shrink-0">
                          <div className="flex items-center gap-1.5 text-gray-800 font-bold bg-gray-100 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" /> {match.timeString}
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                            match.isLive ? 'text-red-600 border-red-200 bg-red-50 shadow-sm' :
                            match.state === 'post' ? 'text-gray-500 border-gray-200 bg-gray-50' :
                            match.state === 'canceled' || match.state === 'postponed' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                            'text-green-600 border-green-200 bg-green-50'
                          }`}>
                            {match.statusText}
                          </span>
                        </div>

                        {/* Main Score Area */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2">
                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end gap-2 text-right">
                              <span className={`font-bold sm:text-[17px] ${match.homeScore > match.awayScore && match.state === 'post' ? 'text-black' : 'text-gray-700'}`}>
                                {match.homeTeam}
                              </span>
                              {match.homeLogo && <img src={match.homeLogo} alt="" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }}/>}
                            </div>
                            
                            {/* Score/Penalties */}
                            <div className="shrink-0 flex flex-col items-center min-w-[80px]">
                              {match.state === 'pre' || match.state === 'canceled' || match.state === 'postponed' ? (
                                <span className="text-gray-400 font-bold text-lg">- : -</span>
                              ) : (
                                <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-inner">
                                  <span className={`text-xl font-bold ${match.isLive ? 'text-red-400' : ''}`}>{match.homeScore}</span>
                                  <span className="text-gray-500 text-sm">-</span>
                                  <span className={`text-xl font-bold ${match.isLive ? 'text-red-400' : ''}`}>{match.awayScore}</span>
                                </div>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center justify-start gap-2 text-left">
                              {match.awayLogo && <img src={match.awayLogo} alt="" className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }}/>}
                              <span className={`font-bold sm:text-[17px] ${match.awayScore > match.homeScore && match.state === 'post' ? 'text-black' : 'text-gray-700'}`}>
                                {match.awayTeam}
                              </span>
                            </div>
                          </div>

                          {/* Extra Details (HT Score, Pen Score) */}
                          <div className="flex justify-center mt-2 gap-2">
                            {(match.homeHT !== null && match.awayHT !== null && (match.state === 'post' || (match.isLive && (match.statusText.includes('H2') || match.statusText.includes('Nghỉ') || match.statusText.includes('HP'))))) && (
                              <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                HT: {match.homeHT}-{match.awayHT}
                              </span>
                            )}
                            
                            {(match.homePen !== undefined && match.awayPen !== undefined) && (
                              <span className="text-[11px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                Pen: ({match.homePen}) - ({match.awayPen})
                              </span>
                            )}
                          </div>
                          
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}