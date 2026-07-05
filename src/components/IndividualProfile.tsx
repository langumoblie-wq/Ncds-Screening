import React, { useState, useMemo } from "react";
import { 
  Search, ArrowRight, Activity, Calendar, MapPin, 
  Heart, User, Phone, Sparkles, TrendingUp, ChevronRight,
  Info, AlertCircle, Droplet, History
} from "lucide-react";
import { ScreeningRecord } from "../types";
import { 
  getHTPingPong, getDMPingPong, getCombinedPingPong, 
  PING_PONG_COLORS, PingPongColorInfo 
} from "../utils";

interface IndividualProfileProps {
  records: ScreeningRecord[];
  onSelectRecord?: (record: ScreeningRecord) => void;
  onFollowUpRecord?: (record: ScreeningRecord) => void;
}

// Sparkline/Line Chart component using plain responsive SVGs
const CustomTrendChart: React.FC<{
  data: { label: string; value: number; value2?: number; date: string }[];
  title: string;
  unit: string;
  minVal: number;
  maxVal: number;
  color: string;
  color2?: string;
  label1: string;
  label2?: string;
  thresholds?: { value: number; label: string; color: string }[];
}> = ({ data, title, unit, minVal, maxVal, color, color2, label1, label2, thresholds }) => {
  const width = 500;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = useMemo(() => {
    if (data.length === 0) return [];
    
    return data.map((d, i) => {
      const x = paddingLeft + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
      
      // Map value 1
      const val1 = Math.max(minVal, Math.min(maxVal, d.value));
      const y1 = paddingTop + chartHeight - ((val1 - minVal) / (maxVal - minVal)) * chartHeight;

      // Map value 2 if exists
      let y2 = undefined;
      if (d.value2 !== undefined) {
        const val2 = Math.max(minVal, Math.min(maxVal, d.value2));
        y2 = paddingTop + chartHeight - ((val2 - minVal) / (maxVal - minVal)) * chartHeight;
      }

      return { x, y1, y2, raw1: d.value, raw2: d.value2, label: d.label, date: d.date };
    });
  }, [data, minVal, maxVal, chartWidth, chartHeight]);

  // Construct SVG paths
  const pathD1 = useMemo(() => {
    if (points.length < 2) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y1}`).join(" ");
  }, [points]);

  const pathD2 = useMemo(() => {
    if (points.length < 2 || !color2) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y2}`).join(" ");
  }, [points, color2]);

  // Generate ticks for Y axis
  const yTicks = useMemo(() => {
    const ticks = [];
    const step = (maxVal - minVal) / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(minVal + step * i));
    }
    return ticks;
  }, [minVal, maxVal]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col h-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h5>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">
            หน่วย: {unit}
          </span>
        </div>
        
        {/* Legends */}
        <div className="flex gap-4 mb-4 text-[10px] font-semibold text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span>{label1}</span>
          </div>
          {color2 && label2 && (
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color2 }} />
              <span>{label2}</span>
            </div>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-400 text-xs">
          ไม่มีข้อมูลการตรวจวัดสำหรับกราฟ
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Threshold reference lines if provided */}
            {thresholds?.map((t, idx) => {
              if (t.value < minVal || t.value > maxVal) return null;
              const y = paddingTop + chartHeight - ((t.value - minVal) / (maxVal - minVal)) * chartHeight;
              return (
                <g key={idx} className="opacity-30">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke={t.color} 
                    strokeWidth="1" 
                    strokeDasharray="3 3" 
                  />
                  <text 
                    x={width - paddingRight - 5} 
                    y={y - 4} 
                    fill={t.color} 
                    fontSize="8" 
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {t.label} ({t.value})
                  </text>
                </g>
              );
            })}

            {/* Grid horizontal lines */}
            {yTicks.map((tick, i) => {
              const y = paddingTop + chartHeight - ((tick - minVal) / (maxVal - minVal)) * chartHeight;
              return (
                <line
                  key={i}
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis Y lines & Ticks */}
            {yTicks.map((tick, i) => {
              const y = paddingTop + chartHeight - ((tick - minVal) / (maxVal - minVal)) * chartHeight;
              return (
                <text
                  key={i}
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick}
                </text>
              );
            })}

            {/* Path lines */}
            {points.length >= 2 && (
              <>
                <path
                  d={pathD1}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {color2 && pathD2 && (
                  <path
                    d={pathD2}
                    fill="none"
                    stroke={color2}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </>
            )}

            {/* Data points markers */}
            {points.map((p, i) => (
              <g key={i}>
                {/* Dot 1 */}
                <circle
                  cx={p.x}
                  cy={p.y1}
                  r="5"
                  fill="white"
                  stroke={color}
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={p.y1 - 10}
                  fill={color}
                  fontSize="9"
                  fontWeight="black"
                  textAnchor="middle"
                >
                  {p.raw1}
                </text>

                {/* Dot 2 if exists */}
                {p.y2 !== undefined && color2 && (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y2}
                      r="5"
                      fill="white"
                      stroke={color2}
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={p.y2 + 15}
                      fill={color2}
                      fontSize="9"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      {p.raw2}
                    </text>
                  </>
                )}

                {/* Date / Label at bottom */}
                <text
                  x={p.x}
                  y={height - 18}
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="semibold"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
                <text
                  x={p.x}
                  y={height - 6}
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};

export const IndividualProfile: React.FC<IndividualProfileProps> = ({ 
  records, 
  onSelectRecord,
  onFollowUpRecord
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // Group records by unique patient (Key: name + phone)
  const uniquePatients = useMemo(() => {
    const patientsMap: Record<string, { name: string; phone: string; latestRecord: ScreeningRecord; count: number }> = {};
    
    // Process backwards or forwards to get count and latest
    records.forEach((r) => {
      const key = `${r.name}_${r.phone || ""}`;
      if (!patientsMap[key]) {
        patientsMap[key] = {
          name: r.name,
          phone: r.phone || "ไม่มีเบอร์โทร",
          latestRecord: r,
          count: 1
        };
      } else {
        patientsMap[key].count += 1;
        // Keep the record with latest date/visitNumber as latest
        if (r.visitNumber > patientsMap[key].latestRecord.visitNumber) {
          patientsMap[key].latestRecord = r;
        }
      }
    });

    return Object.entries(patientsMap).map(([id, info]) => ({
      id,
      ...info
    }));
  }, [records]);

  // Filter patients based on query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return uniquePatients;
    return uniquePatients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  }, [uniquePatients, searchQuery]);

  // Set first patient as default when selectedPatientId is empty and patients exist
  useState(() => {
    if (uniquePatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(uniquePatients[0].id);
    }
  });

  // Ensure we select something if nothing is selected but patients are available
  const activePatientId = useMemo(() => {
    if (selectedPatientId && uniquePatients.some(p => p.id === selectedPatientId)) {
      return selectedPatientId;
    }
    return uniquePatients.length > 0 ? uniquePatients[0].id : "";
  }, [selectedPatientId, uniquePatients]);

  // Get all visits of the active patient sorted by visitNumber
  const patientVisits = useMemo(() => {
    if (!activePatientId) return [];
    const patientInfo = uniquePatients.find(p => p.id === activePatientId);
    if (!patientInfo) return [];

    return records
      .filter(r => r.name === patientInfo.name && r.phone === patientInfo.phone)
      .sort((a, b) => a.visitNumber - b.visitNumber);
  }, [activePatientId, uniquePatients, records]);

  // Latest record for the active patient
  const latestVisit = useMemo(() => {
    if (patientVisits.length === 0) return null;
    return patientVisits[patientVisits.length - 1];
  }, [patientVisits]);

  // 7-Color Ping Pong calculations for latest visit
  const pingPongInfo = useMemo(() => {
    if (!latestVisit) return null;
    const ht = getHTPingPong(latestVisit.bpSys, latestVisit.bpDia, latestVisit.familyHistory);
    const dm = getDMPingPong(latestVisit.sugar, latestVisit.familyHistory);
    const combined = getCombinedPingPong(latestVisit.bpSys, latestVisit.latestVisit?.bpDia || latestVisit.bpDia, latestVisit.sugar, latestVisit.familyHistory);

    return { ht, dm, combined };
  }, [latestVisit]);

  // Format data for Blood Pressure Chart
  const bpChartData = useMemo(() => {
    return patientVisits.map(v => ({
      label: `ครั้งที่ ${v.visitNumber}`,
      value: v.bpSys, // Systolic
      value2: v.bpDia, // Diastolic
      date: v.date
    }));
  }, [patientVisits]);

  // Format data for Blood Sugar Chart
  const dmChartData = useMemo(() => {
    return patientVisits.map(v => ({
      label: `ครั้งที่ ${v.visitNumber}`,
      value: v.sugar,
      date: v.date
    }));
  }, [patientVisits]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT: Patient list and search selector (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 h-[640px] flex flex-col justify-between">
        <div className="space-y-3.5 flex-1 flex flex-col overflow-hidden">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ค้นหาประวัติรายบุคคล</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">ค้นหาและเลือกผู้รับการตรวจเพื่อวิเคราะห์พฤติกรรมสะสม</p>
          </div>

          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อหรือเบอร์โทร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-250 pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>

          {/* List of Patients */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ไม่พบรายชื่อผู้รับการตรวจ
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isActive = p.id === activePatientId;
                const latestCombinedPingPong = getCombinedPingPong(
                  p.latestRecord.bpSys, 
                  p.latestRecord.bpDia, 
                  p.latestRecord.sugar, 
                  p.latestRecord.familyHistory
                );

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? "bg-blue-50/50 border-blue-200 shadow-2xs" 
                        : "bg-white hover:bg-slate-50/80 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* MoPH Ping Pong dot indicator */}
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 border border-slate-200/50 block relative ${latestCombinedPingPong.glowClass}`} style={{
                        backgroundColor: 
                          latestCombinedPingPong.color === "white" ? "#ffffff" :
                          latestCombinedPingPong.color === "light_green" ? "#a7f3d0" :
                          latestCombinedPingPong.color === "dark_green" ? "#059669" :
                          latestCombinedPingPong.color === "yellow" ? "#fcd34d" :
                          latestCombinedPingPong.color === "orange" ? "#fb923c" :
                          latestCombinedPingPong.color === "red" ? "#f87171" : "#18181b"
                      }}>
                        {latestCombinedPingPong.color === "white" && (
                          <span className="absolute inset-1 rounded-full bg-slate-300" />
                        )}
                      </span>
                      
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-700 truncate">{p.name}</div>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" /> {p.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                        {p.count} ครั้ง
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-blue-500 translate-x-0.5" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info legend */}
        <div className="border-t border-slate-100 pt-3.5 shrink-0 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="text-[9px] text-slate-500 leading-relaxed font-medium">
              * เกณฑ์สีปิงปองวัดจากระดับค่าประเมินสุขภาพที่รุนแรงที่สุดของบุคคลนั้นระหว่าง <strong>โรคความดันโลหิตสูง (HT)</strong> และ <strong>โรคเบาหวาน (DM)</strong> เพื่อเฝ้าระวังสูงสุด
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Individual Dashboard View (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {latestVisit && pingPongInfo ? (
          <>
            {/* Header Profiler Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-slate-50/50 rounded-full -z-10" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{latestVisit.name}</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                      {latestVisit.gender} • อายุ {latestVisit.age} ปี
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {latestVisit.address} {latestVisit.subdistrict ? `ต.${latestVisit.subdistrict} ` : ""}อ.{latestVisit.district} ({latestVisit.targetArea})
                  </p>
                </div>
              </div>

              {/* Combined Status Banner */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                {onFollowUpRecord && (
                  <button
                    onClick={() => onFollowUpRecord(latestVisit)}
                    className="bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <History className="w-4 h-4" />
                    บันทึกการติดตามตรวจครั้งถัดไป
                  </button>
                )}
                
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 rounded-2xl p-3.5 w-full sm:w-[220px] justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">สถานะกลุ่มสีปิงปองโดยรวม</span>
                    <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{pingPongInfo.combined.label}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full border border-slate-200/45 shrink-0 flex items-center justify-center ${pingPongInfo.combined.glowClass}`} style={{
                    backgroundColor: 
                      pingPongInfo.combined.color === "white" ? "#ffffff" :
                      pingPongInfo.combined.color === "light_green" ? "#34d399" :
                      pingPongInfo.combined.color === "dark_green" ? "#059669" :
                      pingPongInfo.combined.color === "yellow" ? "#fbbf24" :
                      pingPongInfo.combined.color === "orange" ? "#f97316" :
                      pingPongInfo.combined.color === "red" ? "#ef4444" : "#18181b"
                  }}>
                    {pingPongInfo.combined.color === "white" && (
                      <span className="w-3 h-3 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Double Ping Pong Status Columns (HT & DM) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* HT Ping Pong Gauge Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-500" />
                      ความดันโลหิตสูง (HT)
                    </h4>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${pingPongInfo.ht.badgeClass}`}>
                      {pingPongInfo.ht.nameTh}
                    </span>
                  </div>

                  {/* Highlighting Number */}
                  <div className="my-4 text-center py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl relative overflow-hidden">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ค่าตรวจวัดความดันล่าสุด</div>
                    <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                      {latestVisit.bpSys} / {latestVisit.bpDia} <span className="text-xs font-semibold text-slate-500">mmHg</span>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {pingPongInfo.ht.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400 flex justify-between font-bold">
                  <span>ประวัติครอบครัว: {latestVisit.familyHistory.includes("ความดันโลหิตสูง") ? "มีประวัติครอบครัว" : "ไม่มี"}</span>
                  <span>ความถี่ปัสสาวะ/วัดเคม: {latestVisit.sodium}</span>
                </div>
              </div>

              {/* DM Ping Pong Gauge Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      เบาหวาน (DM)
                    </h4>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${pingPongInfo.dm.badgeClass}`}>
                      {pingPongInfo.dm.nameTh}
                    </span>
                  </div>

                  {/* Highlighting Number */}
                  <div className="my-4 text-center py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl relative overflow-hidden">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ค่าระดับน้ำตาลในเลือดล่าสุด (FBS)</div>
                    <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                      {latestVisit.sugar} <span className="text-xs font-semibold text-slate-500">mg/dL</span>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {pingPongInfo.dm.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400 flex justify-between font-bold">
                  <span>ประวัติครอบครัว: {latestVisit.familyHistory.includes("เบาหวาน") ? "มีประวัติครอบครัว" : "ไม่มี"}</span>
                  <span>บริโภคอาหารหวานจัด: {latestVisit.water}</span>
                </div>
              </div>

            </div>

            {/* Individual Clinical Trend Graphs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* BP Trend Graph */}
              <CustomTrendChart 
                data={bpChartData}
                title="แนวโน้มความดันโลหิตสะสม"
                unit="mmHg"
                minVal={60}
                maxVal={210}
                color="#f87171" // red-400 for Systolic
                color2="#fb7185" // pink-400 for Diastolic
                label1="Systolic (ความดันบน)"
                label2="Diastolic (ความดันล่าง)"
                thresholds={[
                  { value: 120, label: "เกณฑ์ปกติ", color: "#10b981" },
                  { value: 140, label: "เกณฑ์ป่วยเริ่มต้น", color: "#f59e0b" },
                  { value: 180, label: "วิกฤต", color: "#ef4444" }
                ]}
              />

              {/* Sugar Trend Graph */}
              <CustomTrendChart 
                data={dmChartData}
                title="แนวโน้มระดับน้ำตาลในเลือด (FBS)"
                unit="mg/dL"
                minVal={70}
                maxVal={250}
                color="#3b82f6" // blue-500
                label1="น้ำตาลในเลือด (FBS)"
                thresholds={[
                  { value: 100, label: "เกณฑ์ปกติ", color: "#10b981" },
                  { value: 126, label: "เกณฑ์ป่วยเริ่มต้น", color: "#f59e0b" },
                  { value: 183, label: "วิกฤต", color: "#ef4444" }
                ]}
              />

            </div>

            {/* Legend sheet for Ministry of Public Health's 7-Color Ping Pong */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">ตารางคู่มือและเกณฑ์ประเมิน "ปิงปอง 7 สี" กระทรวงสาธารณสุข</h4>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">รายละเอียดเกณฑ์จัดกลุ่มเพื่อติดตามสุขภาพและให้สุขศึกษาชุมชน</p>
                </div>
                <span className="text-[9px] bg-slate-50 text-slate-400 border border-slate-150 font-bold px-2 py-1 rounded-xl">
                  MoPH Thailand
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(PING_PONG_COLORS).map((info, idx) => {
                  const isHTActive = pingPongInfo.ht.color === info.color;
                  const isDMActive = pingPongInfo.dm.color === info.color;
                  const isAnyActive = isHTActive || isDMActive;

                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isAnyActive 
                          ? "border-blue-300 bg-blue-50/10 shadow-2xs" 
                          : "border-slate-150 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${info.badgeClass}`}>
                            {info.nameTh}
                          </span>
                          
                          {/* Indicator label */}
                          {isAnyActive && (
                            <span className="text-[8px] font-black text-blue-600 bg-blue-50/80 px-1 py-0.5 rounded-sm">
                              {isHTActive && isDMActive ? "HT+DM" : isHTActive ? "HT" : "DM"}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed mt-1 font-semibold">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient Visit Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-150 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">บันทึกตรวจสุขภาพสะสม ({patientVisits.length} ครั้ง)</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">รหัสผู้ป่วย #{latestVisit.id}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/20 border-b border-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                      <th className="py-3 px-5">ครั้งที่</th>
                      <th className="py-3 px-5">วันที่ตรวจ</th>
                      <th className="py-3 px-5 text-center">BMI / น้ำหนัก</th>
                      <th className="py-3 px-5 text-center">ความดัน (HT)</th>
                      <th className="py-3 px-5 text-center">ระดับน้ำตาล (DM)</th>
                      <th className="py-3 px-5">ผลการจัดการเบื้องต้น / บันทึก</th>
                      <th className="py-3 px-5 text-center">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientVisits.map((v, index) => {
                      const vHt = getHTPingPong(v.bpSys, v.bpDia, v.familyHistory);
                      const vDm = getDMPingPong(v.sugar, v.familyHistory);
                      
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-800">ครั้งที่ {v.visitNumber}</td>
                          <td className="py-3.5 px-5 font-semibold text-slate-500">{v.date}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="font-bold text-slate-700">{v.bmi}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">{v.weight} kg</span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${vHt.badgeClass}`}>
                              {v.bpSys}/{v.bpDia} • {vHt.nameTh}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${vDm.badgeClass}`}>
                              {v.sugar} • {vDm.nameTh}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-700 block">{v.followUpAction}</span>
                            {v.followUpNote && (
                              <span className="text-[9.5px] text-slate-400 block max-w-[200px] truncate" title={v.followUpNote}>
                                {v.followUpNote}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {onSelectRecord && (
                              <button
                                onClick={() => onSelectRecord(v)}
                                className="bg-blue-50 hover:bg-blue-100/70 text-blue-600 font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                รายงาน
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-12 text-center text-slate-400 font-medium">
            โปรดเพิ่มข้อมูลหรือนำเข้าบันทึกคัดกรองเบื้องต้นเพื่อเปิดใช้งานเครื่องมือวิเคราะห์สะสมรายบุคคล
          </div>
        )}

      </div>

    </div>
  );
};
