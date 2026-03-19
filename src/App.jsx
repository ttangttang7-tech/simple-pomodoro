import { useState, useEffect, useRef } from 'react'

const MOTIVATIONAL_QUOTES = [
  "誘몃옒�� �꾩옱 �곕━媛� 臾댁뾿�� �섎뒗媛��� �щ젮 �덉뒿�덈떎.",
  "媛��� �� �곴킅�� �ㅽ뙣�섏� �딆쓬�� �꾨땲�� �ㅽ뙣�� �뚮쭏�� �ㅼ떆 �쇱뼱�섎뒗 �� �덉뒿�덈떎.",
  "�깃났�� 理쒖쥌�곸씤 寃껋씠 �꾨땲硫�, �ㅽ뙣�� 移섎챸�곸씤 寃껋씠 �꾨떃�덈떎. 以묒슂�� 寃껋� 怨꾩냽�섎젮�� �⑷린�낅땲��.",
  "�뱀떊�� �쒓컙�� ��퉬�섏� 留덉꽭��. 洹멸쾬�� �몄깮�� 援ъ꽦�섎뒗 �щ즺�낅땲��.",
  "�ㅻ뒛�� 紐곗엯�� �뱀떊�� 轅덉쓣 �꾩떎濡� 留뚮뱶�� �좎씪�� 湲몄엯�덈떎.",
  "�꾨꼍�섎젮怨� �섏� 留덉꽭��. �댁젣蹂대떎 議곌툑 �� �섏븘吏��ㅺ퀬 �몃젰�섏꽭��.",
  "�묒� �쇰��� �쒖옉�섏꽭��. 洹� �묒� �쇰뱾�� 紐⑥뿬 �꾨��� 寃곌낵瑜� 留뚮벊�덈떎.",
  "吏묒쨷�� �섎갚 媛쒖쓽 醫뗭� �꾩씠�붿뼱�� '�꾨땲��'�쇨퀬 留먰븯�� 寃껋엯�덈떎.",
  "湲곕떎由ъ� 留덉꽭��. �쒓컙�� �덈�濡� '�� 留욌뒗' �뚭� �ㅼ� �딆뒿�덈떎.",
  "紐곗엯�� �곕━ �띠쓽 吏덉쓣 寃곗젙�섎뒗 媛��� 媛뺣젰�� �댁뇿�낅땲��.",
  "�ㅻ뒛�� 怨좏넻�� �댁씪�� �섏씠 �⑸땲��.",
  "�쒓퀎�� �곕━媛� �ㅼ젙�섎뒗 寃껋엯�덈떎. �ㅼ뒪濡쒕� 誘우쑝�몄슂."
]

function App() {
  const [focusMin, setFocusMin] = useState(25)
  const [focusSec, setFocusSec] = useState(0)
  const [breakMin, setBreakMin] = useState(5)
  const [breakSec, setBreakSec] = useState(0)
  const [intervalAlertMin, setIntervalAlertMin] = useState(5)
  const [useIntervalAlert, setUseIntervalAlert] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState('Focus') 
  const [stats, setStats] = useState({})
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0])
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    const savedStats = localStorage.getItem('simple-pomodoro-stats'); if (savedStats) setStats(JSON.parse(savedStats))
    const savedSettings = localStorage.getItem('simple-pomodoro-settings')
    if (savedSettings) {
      const s = JSON.parse(savedSettings); 
      setFocusMin(s.fMin || 25); setFocusSec(s.fSec || 0);
      setBreakMin(s.bMin || 5); setBreakSec(s.bSec || 0);
      setIntervalAlertMin(s.interval || 5); setUseIntervalAlert(s.useInterval || false);
      setTimeLeft((s.fMin || 25) * 60 + (s.fSec || 0))
    }
    const savedTheme = localStorage.getItem('simple-theme'); if (savedTheme) setIsDarkMode(savedTheme === 'dark')
  }, [])

  useEffect(() => { 
    if (!isActive) {
        const total = sessionType === 'Focus' ? (focusMin * 60 + focusSec) : (breakMin * 60 + breakSec)
        setTimeLeft(total)
    }
  }, [focusMin, focusSec, breakMin, breakSec, sessionType, isActive])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1
          if (sessionType === 'Focus' && useIntervalAlert) {
            const totalFocus = (focusMin * 60 + focusSec)
            const elapsed = totalFocus - next
            if (elapsed > 0 && elapsed % (intervalAlertMin * 60) === 0 && next > 0) playBeep(440, 0.1)
          }
          return next
        })
      }, 1000)
    } else if (timeLeft === 0) handleSessionEnd()
    return () => clearInterval(timerRef.current)
  }, [isActive, timeLeft, sessionType, useIntervalAlert, intervalAlertMin, focusMin, focusSec])

  const playBeep = (freq = 440, duration = 0.1) => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioContextRef.current; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration)
    } catch (e) { console.error(e) }
  }

  const handleSessionEnd = () => {
    clearInterval(timerRef.current); setIsActive(false); playBeep(880, 0.5)
    setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
    if (sessionType === 'Focus') {
      const today = new Date().toISOString().split('T')[0]; const newStats = { ...stats }; 
      const focusedMins = focusMin + (focusSec / 60);
      newStats[today] = (newStats[today] || 0) + focusedMins; 
      setStats(newStats); localStorage.setItem('simple-pomodoro-stats', JSON.stringify(newStats)); 
      setSessionType('Break'); setTimeLeft(breakMin * 60 + breakSec)
    } else { setSessionType('Focus'); setTimeLeft(focusMin * 60 + focusSec) }
  }

  const toggleTimer = () => { if (audioContextRef.current && audioContextRef.current.state === 'suspended') audioContextRef.current.resume(); setIsActive(!isActive) }
  const resetTimer = () => { clearInterval(timerRef.current); setIsActive(false); setTimeLeft((sessionType === 'Focus' ? (focusMin * 60 + focusSec) : (breakMin * 60 + breakSec))) }
  const switchSession = (type) => { clearInterval(timerRef.current); setIsActive(false); setSessionType(type); setTimeLeft((type === 'Focus' ? (focusMin * 60 + focusSec) : (breakMin * 60 + breakSec))) }
  const formatTime = (seconds) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` }
  const progress = (timeLeft / ((sessionType === 'Focus' ? (focusMin * 60 + focusSec) : (breakMin * 60 + breakSec)))) * 100
  const saveSettings = (fm, fs, bm, bs, i, u) => localStorage.setItem('simple-pomodoro-settings', JSON.stringify({ fMin: fm, fSec: fs, bMin: bm, bSec: bs, interval: i, useInterval: u }))
  const toggleTheme = () => { const next = !isDarkMode; setIsDarkMode(next); localStorage.setItem('simple-theme', next ? 'dark' : 'light') }

  const adjustFocusMin = (d) => { const n = Math.max(0, Math.min(120, focusMin + d)); setFocusMin(n); saveSettings(n, focusSec, breakMin, breakSec, intervalAlertMin, useIntervalAlert) }
  const adjustFocusSec = (d) => { let n = focusSec + d; let m = focusMin; if (n >= 60) { n = 0; m = Math.min(120, m + 1) } else if (n < 0) { n = 50; m = Math.max(0, m - 1) } setFocusSec(n); setFocusMin(m); saveSettings(m, n, breakMin, breakSec, intervalAlertMin, useIntervalAlert) }
  const adjustBreakMin = (d) => { const n = Math.max(0, Math.min(60, breakMin + d)); setBreakMin(n); saveSettings(focusMin, focusSec, n, breakSec, intervalAlertMin, useIntervalAlert) }
  const adjustBreakSec = (d) => { let n = breakSec + d; let m = breakMin; if (n >= 60) { n = 0; m = Math.min(60, m + 1) } else if (n < 0) { n = 50; m = Math.max(0, m - 1) } setBreakSec(n); setBreakMin(m); saveSettings(focusMin, focusSec, m, n, intervalAlertMin, useIntervalAlert) }
  const adjustInterval = (d) => { const n = Math.max(1, Math.min(focusMin || 1, intervalAlertMin + d)); setIntervalAlertMin(n); saveSettings(focusMin, focusSec, breakMin, breakSec, n, useIntervalAlert) }
  const toggleUseInterval = () => { const n = !useIntervalAlert; setUseIntervalAlert(n); saveSettings(focusMin, focusSec, breakMin, breakSec, intervalAlertMin, n) }

  const handleMinInput = (val, setter, maxVal, isFocus) => {
    let n = parseInt(val) || 0; n = Math.max(0, Math.min(maxVal, n)); setter(n);
    if (isFocus) saveSettings(n, focusSec, breakMin, breakSec, intervalAlertMin, useIntervalAlert);
    else saveSettings(focusMin, focusSec, n, breakSec, intervalAlertMin, useIntervalAlert);
  }
  const handleSecInput = (val, setter, isFocus) => {
    let n = parseInt(val) || 0; n = Math.max(0, Math.min(59, n)); setter(n);
    if (isFocus) saveSettings(focusMin, n, breakMin, breakSec, intervalAlertMin, useIntervalAlert);
    else saveSettings(focusMin, focusSec, breakMin, n, intervalAlertMin, useIntervalAlert);
  }

  const getWeeklyStats = () => {
    const days = ['��', '��', '��', '紐�', '湲�', '��', '��']; const today = new Date(); const currentDay = today.getDay(); const diff = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1); const monday = new Date(today.setDate(diff))
    return days.map((day, index) => {
      const date = new Date(monday); date.setDate(monday.getDate() + index); const dateStr = date.toISOString().split('T')[0]
      return { label: day, minutes: stats[dateStr] || 0, isToday: dateStr === new Date().toISOString().split('T')[0] }
    })
  }

  const weeklyData = getWeeklyStats(); const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60)

  const steps = [
    {n:1, t:"�쒓컙�� 媛�移섎� 源⑥슦�� 由щ벉", d:"紐곗엯怨� �댁떇�� �뺥솗�� 諛섎났�� 吏�移섏� �딅뒗 �댁젙�� �먮룞�μ씠 �⑸땲��.", c: isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"}, 
    {n:2, t:"誘몃옒瑜� 二쇰룄�섎뒗 �쒓컙 議곗젅", d:"�ㅼ뒪濡� �쒓컙�� �듭젣�섎뒗 �λ젰�� �щ윭遺꾩쓽 �댁씪�� 二쇰룄�섎뒗 �섏씠 �⑸땲��.", c: isDarkMode ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-100 text-cyan-700"}, 
    {n:3, t:"�섏�瑜� 源⑥슦�� 以묎컙 �뚮엺", d:"�먮Ⅴ�� �쒓컙�� 紐몄쑝濡� �먮겮硫� �먭컖�� ��, 鍮꾨줈�� �댁븘�덈뒗 吏묒쨷�� �쒖옉�⑸땲��.", c: isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-700"}, 
    {n:4, t:"李④끝李④끝 �볦씠�� �깆옣�� 利앷굅", d:"留ㅼ씪 �볦씠�� 湲곕줉�� �뱀떊�� 硫덉텛吏� �딄퀬 �깆옣�섍퀬 �덈떎�� 媛��� �뺤떎�� 利앷굅�낅땲��.", c: isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"},
    {n:5, t:"湲곕줉�� 釉뚮씪�곗��� �뚯쨷�� 蹂닿��⑸땲��", d:"蹂꾨룄�� 濡쒓렇�� �놁씠�� 釉뚮씪�곗��� 湲곕줉�� �덉쟾�섍쾶 ���λ맗�덈떎. �덉떖�섍퀬 吏묒쨷�섏꽭��!", c: isDarkMode ? "bg-pink-500/10 text-pink-400" : "bg-pink-100 text-pink-700"}
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'} flex flex-col items-center py-12 px-6 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative`}>
      <div className="absolute top-8 left-8 z-50 flex items-center space-x-4">
        <button onClick={toggleTheme} className={`p-4 rounded-2xl shadow-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}>
          {isDarkMode ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
        </button>
        <div className={`px-4 py-2 rounded-xl text-sm font-black border tracking-tight ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
            <span className="opacity-60">{isDarkMode ? '�뙐 �ㅽ겕' : '��截� �쇱씠��'} 紐⑤뱶濡� 蹂�寃�</span>
        </div>
      </div>

      <h1 className="text-4xl lg:text-5xl font-black mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 tracking-tighter leading-tight px-4 w-full max-w-[1400px]">�뱀떊�� �뚯쨷�� 誘몃옒瑜� �꾩꽦�섎뒗 紐곗엯�� �쒓컙 ��</h1>
      
      <div className="max-w-[1536px] w-full grid grid-cols-1 xl:grid-cols-2 gap-16 items-start justify-center">
        <div className="flex flex-col items-center w-full space-y-10">
          <div className={`w-full border rounded-[4rem] p-12 shadow-2xl relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-200/10"><div className={`h-full transition-all duration-1000 ease-linear ${sessionType === 'Focus' ? 'bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]'}`} style={{ width: `${100 - progress}%` }} /></div>
            <div className="flex justify-center space-x-4 mb-14">
              <button onClick={() => switchSession('Focus')} className={`px-10 py-3 rounded-full text-xl font-black transition-all ${sessionType === 'Focus' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-white shadow-lg') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>吏묒쨷 (Focus)</button>
              <button onClick={() => switchSession('Break')} className={`px-10 py-3 rounded-full text-xl font-black transition-all ${sessionType === 'Break' ? (isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-500 text-white shadow-lg') : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>�댁떇 (Break)</button>
            </div>
            <div className="text-center mb-14"><div className={`text-[10rem] font-black tracking-tighter mb-4 font-mono leading-none drop-shadow-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatTime(timeLeft)}</div><p className={`text-2xl tracking-[0.5em] uppercase font-black ${sessionType === 'Focus' ? 'text-emerald-500' : 'text-amber-500'}`}>{sessionType === 'Focus' ? 'Deep Work Time' : 'Recharge Time'}</p></div>
            <div className="flex items-center justify-center space-x-8">
              <button onClick={toggleTimer} className={`flex-1 py-8 rounded-[2rem] font-black text-3xl transition-all shadow-2xl active:scale-95 ${isActive ? (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200') : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/30'}`}>{isActive ? 'STOP' : 'START'}</button>
              <button onClick={resetTimer} className={`p-8 rounded-[2rem] transition-all border group active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:rotate-180 duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className={`border rounded-[3rem] p-10 flex flex-col items-center justify-center shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-xl uppercase tracking-[0.2em] font-black text-slate-500">吏묒쨷 �쒓컙(FOCUS)</p>
                <div className="flex flex-row items-center justify-center gap-4 w-full">
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">遺�(MIN)</span>
                        <div className="flex items-center space-x-1.5">
                            <button onClick={() => adjustFocusMin(-1)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>-</button>
                            <input type="number" value={focusMin} onChange={(e) => handleMinInput(e.target.value, setFocusMin, 120, true)} className={`text-4xl font-black w-14 text-center bg-transparent border-none focus:outline-none focus:bg-emerald-500/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <button onClick={() => adjustFocusMin(1)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>+</button>
                        </div>
                    </div>
                    <div className="w-[1.5px] h-10 bg-slate-500/10 rounded-full shrink-0" />
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">珥�(SEC)</span>
                        <div className="flex items-center space-x-1.5">
                            <button onClick={() => adjustFocusSec(-10)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>-</button>
                            <input type="number" value={focusSec} onChange={(e) => handleSecInput(e.target.value, setFocusSec, true)} className={`text-4xl font-black w-14 text-center bg-transparent border-none focus:outline-none focus:bg-emerald-500/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <button onClick={() => adjustFocusSec(10)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>+</button>
                        </div>
                    </div>
                </div>
             </div>
             
             <div className={`border rounded-[3rem] p-8 flex flex-col items-center justify-center shadow-xl space-y-5 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-xl uppercase tracking-[0.2em] font-black text-slate-500">�댁떇 �쒓컙(BREAK)</p>
                <div className="flex flex-row items-center justify-center gap-4 w-full">
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">遺�(MIN)</span>
                        <div className="flex items-center space-x-1.5">
                            <button onClick={() => adjustBreakMin(-1)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>-</button>
                            <input type="number" value={breakMin} onChange={(e) => handleMinInput(e.target.value, setBreakMin, 60, false)} className={`text-4xl font-black w-14 text-center bg-transparent border-none focus:outline-none focus:bg-amber-500/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                            <button onClick={() => adjustBreakMin(1)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>+</button>
                        </div>
                    </div>
                    <div className="w-[1.5px] h-10 bg-slate-500/10 rounded-full shrink-0" />
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">珥�(SEC)</span>
                        <div className="flex items-center space-x-1.5">
                            <button onClick={() => adjustBreakSec(-10)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>-</button>
                            <input type="number" value={breakSec} onChange={(e) => handleSecInput(e.target.value, setBreakSec, false)} className={`text-4xl font-black w-14 text-center bg-transparent border-none focus:outline-none focus:bg-amber-500/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                            <button onClick={() => adjustBreakSec(10)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>+</button>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="w-full py-2">
            <div className={`w-full border-2 border-dashed rounded-[2.5rem] p-6 text-center ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Google AdSense Area (Inline)</p>
                <div className={`flex items-center justify-center h-28 rounded-2xl border ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <span className="text-sm text-slate-400 font-bold italic">Advertisement Space (Between settings and alert)</span>
                </div>
            </div>
          </div>

          <div className={`w-full border rounded-[3rem] p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-10 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-center sm:text-left"><p className="text-xl uppercase tracking-[0.2em] font-black text-slate-500 mb-1">以묎컙 �뚮┝(遺�) <span className="text-xs font-bold ml-1">BEEP</span></p><p className="text-base text-slate-400 font-medium tracking-tight">�뱀떊�� 紐곗엯�� �뺣뒗 �쇱젙�� 由щ벉</p></div>
            <div className="flex items-center space-x-6">
                <div className={`flex rounded-[1.5rem] p-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => adjustInterval(-1)} className="w-12 h-12 flex items-center justify-center text-slate-400 text-2xl font-black hover:text-emerald-500 transition-colors">-</button>
                    <input type="number" value={intervalAlertMin} onChange={(e) => {
                        const n = Math.max(1, Math.min(focusMin || 1, parseInt(e.target.value) || 1));
                        setIntervalAlertMin(n);
                        saveSettings(focusMin, focusSec, breakMin, breakSec, n, useIntervalAlert);
                    }} className={`w-14 bg-transparent text-center text-2xl font-black outline-none border-none focus:bg-emerald-500/5 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <button onClick={() => adjustInterval(1)} className="w-12 h-12 flex items-center justify-center text-slate-400 text-2xl font-black hover:text-emerald-500 transition-colors">+</button>
                </div>
                <button onClick={toggleUseInterval} className={`w-20 h-10 rounded-full transition-all relative ${useIntervalAlert ? 'bg-emerald-600 shadow-lg shadow-emerald-500/40' : (isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')}`}>
                    <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-md ${useIntervalAlert ? 'left-11' : 'left-1.5'}`} />
                </button>
            </div>
          </div>
          <div className={`w-full border rounded-[3.5rem] p-12 shadow-inner min-h-[18rem] transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-black mb-12 flex items-center gap-3 font-mono uppercase tracking-[0.3em] text-slate-400"><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>Weekly Activity</h2>
            <div className="flex justify-between items-end h-[240px] gap-4">{weeklyData.map((day, idx) => (<div key={idx} className="flex-1 flex flex-col items-center group"><div className={`w-full rounded-t-2xl transition-all duration-700 relative ${day.isToday ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : (isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-200 group-hover:bg-slate-300')}`} style={{ height: `${(day.minutes / maxMinutes) * 100}%`, minHeight: day.minutes > 0 ? '10px' : '0px' }}>{day.minutes > 0 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2">{Math.round(day.minutes)}m</div>}</div><span className={`text-base mt-6 font-black tracking-tighter ${day.isToday ? 'text-emerald-400' : 'text-slate-500'}`}>{day.label}</span></div>))}</div>
          </div>
        </div>

        <div className="w-full space-y-10 lg:sticky lg:top-8">
          <div className={`border rounded-[4rem] p-14 shadow-2xl space-y-12 transition-all ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="space-y-6">
              <h2 className={`text-3xl font-black leading-tight underline decoration-4 underline-offset-12 ${isDarkMode ? 'text-white decoration-emerald-500/30' : 'text-slate-900 decoration-emerald-500/50'}`}>�ㅻ뒛�� 1遺꾩씠 �뱀떊�� 鍮쏅굹�� �댁씪�� 寃곗젙�⑸땲�� ��</h2>
              <p className={`leading-relaxed font-bold text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>吏�湲� 留덉＜�� �� �쒓컙�� �⑥닚�� �レ옄媛� �꾨떃�덈떎. �뱀떊�� 轅덉쓣 �ν븳 寃ш퀬�� 踰쎈룎 �� �μ엯�덈떎. �ㅻ뒛�� �묒�留� �꾨��� 紐곗엯�쇰줈 �뱀떊留뚯쓽 �낅낫�곸씤 誘몃옒瑜� �꾩꽦�� 蹂댁꽭��.</p>
            </div>
            <div className="space-y-10">
              {steps.map((step) => (
                <div key={step.n} className="flex gap-8 group">
                  <div className={`w-16 h-16 rounded-2xl ${step.c} flex items-center justify-center flex-shrink-0 text-3xl font-black shadow-xl border transition-all group-hover:scale-110 border-white/5`}>{step.n}</div>
                  <div className="flex flex-col justify-center"><h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{step.t}</h3><p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{step.d}</p></div>
                </div>
              ))}
            </div>

            <div className={`rounded-[3rem] p-12 py-16 text-center relative shadow-2xl group border w-full ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
               <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-2xl text-sm font-black uppercase tracking-[0.4em] z-20 shadow-lg ${isDarkMode ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}>Motivation</div>
               <div className="transition-all duration-1000 min-h-[4rem] flex items-center justify-center px-4 overflow-hidden mt-2">
                  <p className={`text-2xl font-black leading-tight italic animate-in fade-in zoom-in-95 duration-1000 break-keep ${isDarkMode ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-emerald-700'}`}>"{currentQuote}"</p>
               </div>
               <div className={`absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] ${isDarkMode ? 'bg-gradient-to-b from-emerald-500/5 to-transparent' : 'bg-gradient-to-b from-emerald-500/10 to-transparent'}`}></div>
            </div>

            <div className="pt-6 border-t border-slate-200/10">
                <div className={`rounded-[2.5rem] p-10 border text-center relative overflow-hidden group transition-all ${isDarkMode ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-100'}`}>
                    <p className={`text-xl font-black mb-4 tracking-tight ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>�뮶 �� �섏씠吏�瑜� �ㅼ떆 李얘퀬 �띠쑝�좉���?</p>
                    <p className={`text-lg font-bold mb-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <kbd className={`px-2 py-1 border rounded text-xs mx-1 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>Ctrl</kbd> + <kbd className={`px-2 py-1 border rounded text-xs mx-1 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>D</kbd> 瑜� �뚮윭 利먭꺼李얘린�� 異붽��� 二쇱꽭��! �뜋
                    </p>
                </div>
            </div>

            <div className="pt-4"><div className={`w-full border-2 border-dashed rounded-3xl p-6 text-center ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}><p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">Google AdSense Area</p><div className={`flex items-center justify-center h-40 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100 border-slate-200'}`}><span className="text-base text-slate-400 font-bold italic">Advertisement Space</span></div></div></div>
          </div>
        </div>
      </div>
      <footer className="mt-28 text-slate-500 text-sm tracking-[0.5em] uppercase font-black opacity-50">Crafted with passion by <span className={isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}>Simple Pomodoro</span></footer>
      <div className={`fixed bottom-0 left-0 w-full backdrop-blur-xl border-t p-4 flex justify-center items-center z-50 transition-all ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}><div className={`max-w-[1200px] w-full h-24 rounded-2xl border-2 border-dashed flex items-center justify-center relative ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-300'}`}><span className="text-sm font-black text-slate-400 tracking-[0.6em] uppercase">Banner Ad Space (Bottom)</span></div></div>
    </div>
  )
}

export default App
Pressing key...Stopping...

Stop Agent
