import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Trophy, MapPin, Loader2 } from 'lucide-react';

// --- REAL DATA CONFIG (ESPN API) ---
const LEAGUES = [
  { id: 'eng.1', name: 'Ngoại Hạng Anh', country: 'Anh', color: 'bg-purple-600', order: 1 },
  { id: 'uefa.champions', name: 'UEFA Champions League (C1)', country: 'Châu Âu', color: 'bg-blue-800', order: 2 },
  { id: 'uefa.europa', name: 'UEFA Europa League (C2)', country: 'Châu Âu', color: 'bg-orange-500', order: 3 },
  { id: 'uefa.europa.conf', name: 'UEFA Conference League (C3)', country: 'Châu Âu', color: 'bg-teal-600', order: 4 },
  { id: 'esp.1', name: 'La Liga', country: 'Tây Ban Nha', color: 'bg-red-500', order: 5 },
  { id: 'ita.1', name: 'Serie A', country: 'Ý', color: 'bg-blue-600', order: 6 },
  { id: 'ger.1', name: 'Bundesliga', country: 'Đức', color: 'bg-red-600', order: 7 },
  { id: 'fra.1', name: 'Ligue 1', country: 'Pháp', color: 'bg-green-500', order: 8 },
  
  // --- CÁC GIẢI MỚI THÊM VÀO ---
  { id: 'fifa.friendly', name: 'Giao hữu Quốc tế', country: 'Thế giới', color: 'bg-blue-400', order: 9 },
  { id: 'club.friendly', name: 'Giao hữu Câu lạc bộ', country: 'Thế giới', color: 'bg-gray-500', order: 10 },
  { id: 'eng.w.1', name: 'Ngoại Hạng Anh Nữ (WSL)', country: 'Anh', color: 'bg-pink-600', order: 11 },
  { id: 'usa.nwsl', name: 'VĐQG Nữ Mỹ (NWSL)', country: 'Mỹ', color: 'bg-pink-500', order: 12 },
  { id: 'fifa.wwc', name: 'World Cup Nữ', country: 'Thế giới', color: 'bg-pink-700', order: 13 },
  { id: 'afc.champions', name: 'AFC Champions League', country: 'Châu Á', color: 'bg-indigo-600', order: 14 },
  
  // --- KHU VỰC ĐÔNG NAM Á ---
  { id: 'vie.1', name: 'V.League 1', country: 'Việt Nam', color: 'bg-red-600', order: 15 },
  { id: 'tha.1', name: 'Thai League 1', country: 'Thái Lan', color: 'bg-blue-700', order: 16 },
  { id: 'idn.1', name: 'Liga 1', country: 'Indonesia', color: 'bg-red-500', order: 17 },
  { id: 'mys.1', name: 'Super League', country: 'Malaysia', color: 'bg-yellow-500', order: 18 },
  { id: 'aff.championship', name: 'AFF Cup (Nam)', country: 'Đông Nam Á', color: 'bg-blue-600', order: 19 },
  { id: 'aff.womens.championship', name: 'AFF Cup (Nữ)', country: 'Đông Nam Á', color: 'bg-pink-600', order: 20 },
  { id: 'afc.sea_games', name: 'SEA Games (Nam)', country: 'Đông Nam Á', color: 'bg-yellow-600', order: 21 },
  { id: 'afc.sea_games.w', name: 'SEA Games (Nữ)', country: 'Đông Nam Á', color: 'bg-pink-500', order: 22 }
];

// Hàm lấy thời gian hiện tại ép buộc theo múi giờ Việt Nam (GMT+7)
const getVNTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
};

// --- UTILS ---
const formatDateToString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDisplayDate = (dateObj) => {
  const today = getVNTime();
  const tomorrow = getVNTime(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = getVNTime(); yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = formatDateToString(dateObj);
  if (dateStr === formatDateToString(today)) return 'Hôm nay';
  if (dateStr === formatDateToString(tomorrow)) return 'Ngày mai';
  if (dateStr === formatDateToString(yesterday)) return 'Hôm qua';
  
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${days[dateObj.getDay()]}, ${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
};

// --- COMPONENTS ---

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getVNTime());
  const [matchesData, setMatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tạo ra danh sách các ngày xung quanh ngày đang chọn để hiển thị trên thanh cuộn
  const dateStrip = useMemo(() => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDate]);

  useEffect(() => {
    // Fetch dữ liệu thực tế từ ESPN API
    const fetchMatches = async () => {
      setIsLoading(true);
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`; // Format YYYYMMDD cho API

      try {
        const results = await Promise.allSettled(
          LEAGUES.map(async (league) => {
            const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${dateStr}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            if (data.events && data.events.length > 0) {
              const matches = data.events.map(event => {
                const comp = event.competitions[0];
                const home = comp.competitors.find(c => c.homeAway === 'home');
                const away = comp.competitors.find(c => c.homeAway === 'away');

                // Convert giờ UTC sang giờ Việt Nam (GMT+7)
                const eventDate = new Date(event.date);
                const vnMatchTime = new Date(eventDate.getTime() + (eventDate.getTimezoneOffset() * 60000) + (7 * 3600000));
                const time = `${vnMatchTime.getHours().toString().padStart(2, '0')}:${vnMatchTime.getMinutes().toString().padStart(2, '0')}`;

                let status = 'Chưa diễn ra';
                let isLive = false;
                
                if (event.status.type.state === 'post') {
                  status = 'Đã kết thúc';
                } else if (event.status.type.state === 'in') {
                  status = event.status.displayClock ? `${event.status.displayClock}'` : 'Đang đá';
                  isLive = true;
                } else if (event.status.type.state === 'canceled') {
                  status = 'Hủy/Hoãn';
                }

                return {
                  id: event.id,
                  time: time,
                  homeTeam: home.team.displayName,
                  homeLogo: home.team.logo,
                  homeScore: home.score !== undefined ? home.score : null,
                  awayTeam: away.team.displayName,
                  awayLogo: away.team.logo,
                  awayScore: away.score !== undefined ? away.score : null,
                  status,
                  isLive
                };
              });
              
              matches.sort((a, b) => a.time.localeCompare(b.time));
              return { leagueInfo: league, matches };
            }
            return null;
          })
        );

        // Lọc ra các giải đấu có trận và sắp xếp theo thứ tự ưu tiên
        const validData = results
          .filter(r => r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value)
          .sort((a, b) => a.leagueInfo.order - b.leagueInfo.order);

        setMatchesData(validData);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatchesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-blue-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <h1 className="text-xl font-bold tracking-wide">Lịch Thi Đấu</h1>
          </div>
          
          {/* FIX: Sử dụng thẻ input ẩn thay vì dùng ref và showPicker() */}
          <div className="relative p-2 hover:bg-blue-700 rounded-full transition-colors cursor-pointer" title="Chọn ngày">
            <Calendar className="w-5 h-5" />
            <input 
              type="date" 
              value={formatDateToString(selectedDate)}
              onChange={handleDateChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* DATE SELECTOR STRIP */}
        <div className="bg-blue-700 border-t border-blue-500/30">
          <div className="max-w-3xl mx-auto px-2 py-2 flex items-center justify-between">
            <button onClick={handlePrevDay} className="p-1 hover:bg-blue-600 rounded-full text-blue-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex-1 flex justify-center gap-1 sm:gap-2 overflow-hidden">
              {dateStrip.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const vnToday = getVNTime();
                const isToday = date.toDateString() === vnToday.toDateString();
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] py-1.5 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-white text-blue-700 font-bold shadow-sm' 
                        : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider font-medium opacity-80">
                      {isToday ? 'H.Nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
                    </span>
                    <span className={`text-sm sm:text-base ${isSelected ? 'font-bold' : ''}`}>
                      {String(date.getDate()).padStart(2, '0')}/{String(date.getMonth() + 1).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            <button onClick={handleNextDay} className="p-1 hover:bg-blue-600 rounded-full text-blue-100">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              Các trận đấu: <span className="text-blue-600">{getDisplayDate(selectedDate)}</span>
            </h2>
          </div>
          <div className="text-sm bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Theo giờ Việt Nam (GMT+7)
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Đang tải dữ liệu thực tế...</p>
          </div>
        ) : matchesData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Không có lịch thi đấu</h3>
            <p className="text-gray-500 mt-1">Không có giải đấu lớn nào diễn ra vào ngày này.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {matchesData.map((leagueGroup) => (
              <div key={leagueGroup.leagueInfo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* League Header */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${leagueGroup.leagueInfo.color}`}>
                    {leagueGroup.leagueInfo.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{leagueGroup.leagueInfo.name}</h3>
                    <p className="text-xs text-gray-500">{leagueGroup.leagueInfo.country}</p>
                  </div>
                </div>

                {/* Matches List */}
                <div className="divide-y divide-gray-50">
                  {leagueGroup.matches.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Time & Status */}
                        <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 sm:w-24 shrink-0">
                          <div className="flex items-center gap-1.5 text-gray-800 font-semibold bg-gray-100 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            {match.time}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            match.isLive ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' :
                            match.status === 'Đã kết thúc' ? 'text-gray-500 border-gray-200 bg-gray-50' :
                            match.status === 'Hủy/Hoãn' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                            'text-green-600 border-green-200 bg-green-50'
                          }`}>
                            {match.status}
                          </span>
                        </div>

                        {/* Teams & Score */}
                        <div className="flex-1 flex items-center justify-between gap-3">
                          {/* Home Team */}
                          <div className="flex-1 flex items-center justify-end gap-3 text-right">
                            <span className="font-semibold text-gray-800 sm:text-lg">{match.homeTeam}</span>
                            {match.homeLogo && (
                              <img 
                                src={match.homeLogo} 
                                alt={match.homeTeam} 
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                          </div>
                          
                          {/* Score Box */}
                          <div className="shrink-0 flex items-center justify-center min-w-[70px]">
                            {match.status === 'Chưa diễn ra' || match.status === 'Hủy/Hoãn' ? (
                              <div className="px-3 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-sm">VS</div>
                            ) : (
                              <div className="px-4 py-1.5 bg-gray-800 text-white font-bold rounded-lg text-lg tracking-widest flex items-center gap-2 shadow-inner">
                                <span>{match.homeScore}</span>
                                <span className="text-gray-400 text-sm">-</span>
                                <span>{match.awayScore}</span>
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex-1 flex items-center justify-start gap-3 text-left">
                            {match.awayLogo && (
                              <img 
                                src={match.awayLogo} 
                                alt={match.awayTeam} 
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="font-semibold text-gray-800 sm:text-lg">{match.awayTeam}</span>
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