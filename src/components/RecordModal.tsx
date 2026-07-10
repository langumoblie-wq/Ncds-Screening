import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Activity, Heart, User, MapPin, Phone, Calendar, ClipboardList, 
  Trash2, Brain, Check, ShieldAlert, Sparkles, AlertCircle, Printer, Download 
} from "lucide-react";
import { ScreeningRecord } from "../types";

interface RecordModalProps {
  record: ScreeningRecord;
  onClose: () => void;
  onUpdateRecord: (updatedRecord: ScreeningRecord) => void;
  onDeleteRecord?: (id: number) => void;
}

// Simple Markdown-like Renderer for AI Advice
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n");
  
  return (
    <div className="space-y-3 text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Headers
        if (trimmed.startsWith("###")) {
          return (
            <h4 key={idx} className="text-md font-bold text-slate-800 mt-4 mb-2 border-b border-slate-100 pb-1">
              {trimmed.replace("###", "").trim()}
            </h4>
          );
        }
        if (trimmed.startsWith("##")) {
          return (
            <h3 key={idx} className="text-lg font-bold text-blue-700 mt-5 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              {trimmed.replace("##", "").trim()}
            </h3>
          );
        }
        if (trimmed.startsWith("#")) {
          return (
            <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-4">
              {trimmed.replace("#", "").trim()}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const listText = trimmed.substring(1).trim();
          // Bold matches
          const boldParts = listText.split("**");
          return (
            <div key={idx} className="flex items-start gap-2 pl-4 py-0.5">
              <span className="text-blue-500 font-bold mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500" />
              <p className="text-sm">
                {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-semibold">{part}</strong> : part)}
              </p>
            </div>
          );
        }

        // Bold text replacements in general paragraph
        const boldParts = trimmed.split("**");
        if (boldParts.length > 1) {
          return (
            <p key={idx} className="text-sm">
              {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 font-semibold">{part}</strong> : part)}
            </p>
          );
        }

        return <p key={idx} className="text-sm">{trimmed}</p>;
      })}
    </div>
  );
};

export const RecordModal: React.FC<RecordModalProps> = ({ record, onClose, onUpdateRecord, onDeleteRecord }) => {

  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isStaticMode, setIsStaticMode] = useState(() => {
    return window.location.hostname.includes("github.io") || 
           window.location.hostname.includes("vercel.app") || 
           window.location.hostname.includes("netlify.app") ||
           localStorage.getItem("static_mode_fallback") === "true";
  });
  const [clientApiKey, setClientApiKey] = useState(() => {
    return localStorage.getItem("client_gemini_api_key") || "";
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInputValue, setApiKeyInputValue] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const generateAiAdviceClientSide = async (apiKeyToUse: string) => {
    const riskHT = record.htResult?.label || "ปกติ";
    const riskDM = record.dmResult?.label || "ปกติ";
    const bpStr = `${record.bpSys}/${record.bpDia} mmHg`;
    const sugarStr = record.sugar ? `${record.sugar} mg/dL` : "ไม่ได้ตรวจ";
    const bmiStr = record.bmi || "ไม่ได้ระบุ";
    const age = record.age || "ไม่ระบุ";
    const gender = record.gender || "ไม่ระบุ";
    
    const smoking = record.smoking || "ไม่สูบ";
    const alcohol = record.alcohol || "ไม่ดื่ม";
    const exercise = record.exercise || "ไม่ได้ระบุ";
    const sleep = record.sleep || "ไม่ได้ระบุ";

    const sweetLevel = record.foodHabit?.sweet?.level || "ปกติ";
    const sweetScore = record.foodHabit?.sweet?.score || 0;
    const fatLevel = record.foodHabit?.fat?.level || "ปกติ";
    const fatScore = record.foodHabit?.fat?.score || 0;
    const saltLevel = record.foodHabit?.salt?.level || "ปกติ";
    const saltScore = record.foodHabit?.salt?.score || 0;

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการส่งเสริมสุขภาพและการจัดการโรคไม่ติดต่อเรื้อรัง (NCDs) ประจำสำนักงานสาธารณสุขจังหวัดและโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) 
ให้คำปรึกษาและวางแผนปรับพฤติกรรมสุขภาพให้กับผู้รับการคัดกรองอย่างเฉพาะเจาะจง อบอุ่น เป็นมิตร กระชับ เข้าใจง่าย และสามารถนำไปปฏิบัติได้จริงในชีวิตประจำวันในบริบทชุมชนไทยภาคใต้ (เช่น อำเภอละงู จังหวัดสตูล)
ใช้ภาษาไทยที่สุภาพ เป็นกันเอง มีการจัดหัวข้อที่อ่านง่าย ชัดเจนเป็นข้อๆ`;

    const userPrompt = `กรุณาประเมินผลและให้คำแนะนำสุขภาพและการปรับพฤติกรรมเฉพาะบุคคลแก่ผู้รับการตรวจ NCDs:

**ข้อมูลส่วนบุคคลและผลตรวจทางคลินิก:**
- เพศ: ${gender}
- อายุ: ${age} ปี
- ดัชนีมวลกาย (BMI): ${bmiStr}
- ความดันโลหิต: ${bpStr} (ความเสี่ยงโรคความดันโลหิตสูง: ${riskHT})
- ระดับน้ำตาลในเลือด (DTX): ${sugarStr} (ความเสี่ยงโรคเบาหวาน: ${riskDM})

**พฤติกรรมการบริโภค (หมวด หวาน มัน เค็ม):**
- หมวดหวาน (Sweet): ระดับความเสี่ยง ${sweetLevel} (คะแนน: ${sweetScore}/3)
- หมวดมัน (Fat): ระดับความเสี่ยง ${fatLevel} (คะแนน: ${fatScore}/3)
- หมวดเค็ม (Salt): ระดับความเสี่ยง ${saltLevel} (คะแนน: ${saltScore}/3)

**พฤติกรรมการใช้ชีวิตประจำวัน:**
- การสูบบุหรี่: ${smoking}
- เครื่องดื่มแอลกอฮอล์: ${alcohol}
- การออกกำลังกาย: ${exercise}
- การนอนหลับ: ${sleep}

กรุณาเขียนโครงสร้างรายงานคำแนะนำด้วย Markdown รูปแบบดังนี้:
## 🩺 การประเมินสุขภาพโดยรวมจาก AI
(สรุปสั้นๆ 2-3 บรรทัดเกี่ยวกับสุขภาพของเขาอย่างเป็นมิตร)

### 🥗 คำแนะนำด้านโภชนาการและการกิน
- เจาะลึกตามหมวด หวาน มัน หรือ เค็ม ที่เขามีความเสี่ยงสูงเป็นหลัก ให้คำแนะนำที่จับต้องได้จริง (เช่น หลีกเลี่ยงอาหารท้องถิ่นประเภทใด หรือแนะนำวัตถุดิบทดแทน)

### 🏃 แผนกิจกรรมและการออกกำลังกาย
- แนะนำประเภทและความถี่ที่เหมาะสมกับอายุและค่า BMI ของเขา

### 💤 การดูแลตนเองและการนอนหลับ
- แนะนำแนวทางลดละเลิกบุหรี่/แอลกอฮอล์ (ถ้ามีประวัติ) หรือหัวข้ออื่นๆ ที่เขายังบกพร่องอยู่

### 📌 เป้าหมายและคำสัญญาใจประจำวัน
- ระบุเป้าหมายสั้นๆ 2 ข้อที่คุณอยากให้เขาทำให้ได้เพื่อสุขภาพที่ดีขึ้น`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyToUse}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: userPrompt }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: systemPrompt }
          ]
        },
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
    }

    const resData = await response.json();
    const textResult = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResult) {
      return textResult;
    } else {
      throw new Error("ไม่สามารถวิเคราะห์ข้อมูลด้วย API Key ที่ระบุได้");
    }
  };

  const generateAiAdvice = async () => {
    setIsGeneratingAdvice(true);
    setApiError(null);

    // If already in static mode and have client API key, generate directly
    if (isStaticMode && clientApiKey) {
      try {
        const advice = await generateAiAdviceClientSide(clientApiKey);
        const updatedRecord = {
          ...record,
          aiAdvice: advice,
        };
        onUpdateRecord(updatedRecord);
        setIsGeneratingAdvice(false);
        return;
      } catch (err: any) {
        console.error("Client side generation failed:", err);
        setApiError(err.message || "เกิดข้อผิดพลาดในการเรียกใช้ Gemini API");
        setIsGeneratingAdvice(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/generate-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record }),
      });

      if (response.status === 404 || response.status === 405) {
        console.warn(`Server API route returned ${response.status}. Switching to static mode client-side fallback.`);
        setIsStaticMode(true);
        localStorage.setItem("static_mode_fallback", "true");
        
        if (clientApiKey) {
          const advice = await generateAiAdviceClientSide(clientApiKey);
          const updatedRecord = {
            ...record,
            aiAdvice: advice,
          };
          onUpdateRecord(updatedRecord);
        } else {
          setShowApiKeyInput(true);
        }
        setIsGeneratingAdvice(false);
        return;
      }

      const data = await response.json();
      if (data.advice) {
        const updatedRecord = {
          ...record,
          aiAdvice: data.advice,
        };
        onUpdateRecord(updatedRecord);
      } else {
        console.error("No advice returned from server:", data);
        setApiError(data.error || "ไม่พบผลการประเมินจากเซิร์ฟเวอร์");
      }
    } catch (err: any) {
      console.error("Error generating AI advice (attempting client-side fallback):", err);
      setIsStaticMode(true);
      localStorage.setItem("static_mode_fallback", "true");
      
      if (clientApiKey) {
        try {
          const advice = await generateAiAdviceClientSide(clientApiKey);
          const updatedRecord = {
            ...record,
            aiAdvice: advice,
          };
          onUpdateRecord(updatedRecord);
        } catch (clientErr: any) {
          setApiError(clientErr.message || "การเชื่อมต่อล้มเหลวและระบบ Fallback ขัดข้อง");
        }
      } else {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">สรุปข้อมูลการคัดกรองส่วนบุคคล</h3>
              <p className="text-xs text-slate-500">บันทึกรหัส: #{record.id} • ประเมินครั้งที่ {record.visitNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
              title="พิมพ์เอกสารรายงาน"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible" id="print-area">
          
          {/* Header Banner for Printing */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-slate-300 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">ระบบคัดกรองความเสี่ยง NCDs</h1>
                <p className="text-xs text-slate-500">สำนักงานสาธารณสุขอำเภอละงู จังหวัดสตูล</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>วันที่บันทึก: {record.date}</p>
              <p>รหัสอ้างอิง: #{record.id}</p>
            </div>
          </div>

          {/* Grid Layout: Profile & Clinical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Profile & Demographics */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" />
                ข้อมูลผู้รับการตรวจ
              </h4>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">ชื่อ-นามสกุล</span>
                  <span className="font-semibold text-slate-800">{record.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-xs">อายุ</span>
                    <span className="font-semibold text-slate-800">{record.age} ปี</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">เพศ</span>
                    <span className="font-semibold text-slate-800">{record.gender}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">เบอร์โทรศัพท์</span>
                  <span className="font-semibold text-slate-800">{record.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">บ้านเลขที่ / ชุมชน</span>
                  <span className="font-semibold text-slate-800 block leading-tight">{record.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {record.modelType && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-xs">โมเดล</span>
                      <span className="font-semibold text-slate-800 text-xs">{record.modelType}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block text-xs">อำเภอ</span>
                    <span className="font-semibold text-slate-800">{record.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">ตำบล</span>
                    <span className="font-semibold text-slate-800">{record.subdistrict || "ไม่ระบุ"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-xs">พื้นที่เป้าหมาย</span>
                    <span className="font-semibold text-slate-800 text-xs">{record.targetArea}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Clinical Data & Vitals */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 md:col-span-2">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-600" />
                ข้อมูลการตรวจทางคลินิก
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                
                {/* Weight / Height / BMI */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-xs">
                  <span className="text-xs text-slate-500">น้ำหนัก / ส่วนสูง</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {record.weight} <span className="text-xs font-normal">kg</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {record.height} <span className="text-[10px]">cm</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-xs">
                  <span className="text-xs text-slate-500">ดัชนีมวลกาย (BMI)</span>
                  <div className="font-bold text-blue-600 mt-1">
                    {record.bmi}
                  </div>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded-full font-medium mt-0.5 ${
                    parseFloat(record.bmi) >= 25 ? "bg-red-50 text-red-600" :
                    parseFloat(record.bmi) >= 23 ? "bg-amber-50 text-amber-600" :
                    parseFloat(record.bmi) >= 18.5 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {parseFloat(record.bmi) >= 25 ? "อ้วน" :
                     parseFloat(record.bmi) >= 23 ? "น้ำหนักเกิน" :
                     parseFloat(record.bmi) >= 18.5 ? "ปกติ" : "ผอม"}
                  </span>
                </div>

                {/* Blood Pressure */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-xs">
                  <span className="text-xs text-slate-500">ความดันโลหิต</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {record.bpSys}/{record.bpDia}
                  </div>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded-full font-medium mt-0.5 ${
                    record.htResult?.level === "danger" ? "bg-red-100 text-red-800" :
                    record.htResult?.level === "risk" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {record.htResult?.level === "danger" ? "สงสัยป่วย" :
                     record.htResult?.level === "risk" ? "กลุ่มเสี่ยง" : "ปกติ"}
                  </span>
                </div>

                {/* Blood Sugar DTX */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-xs">
                  <span className="text-xs text-slate-500">ระดับน้ำตาล (DTX)</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {record.sugar && record.sugar > 0 ? (
                      <>
                        {record.sugar} <span className="text-xs font-normal">mg/dL</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded-full font-medium mt-0.5 ${
                    !record.sugar || record.sugar === 0 ? "bg-slate-100 text-slate-500 border border-slate-200" :
                    record.dmResult?.level === "danger" ? "bg-red-100 text-red-800" :
                    record.dmResult?.level === "risk" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {!record.sugar || record.sugar === 0 ? "ไม่ได้ตรวจ" :
                     record.dmResult?.level === "danger" ? "สงสัยป่วย" :
                     record.dmResult?.level === "risk" ? "กลุ่มเสี่ยง" : "ปกติ"}
                  </span>
                </div>

                {/* Muscle Mass */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 text-center shadow-xs">
                  <span className="text-xs text-slate-500">มวลกล้ามเนื้อ</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {record.muscleMass && record.muscleMass > 0 ? (
                      <>
                        {record.muscleMass} <span className="text-xs font-normal">kg</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                  <span className="inline-block text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-full font-medium mt-0.5 border border-slate-200">
                    {record.muscleMass && record.muscleMass > 0 ? "มวลกายวิทยา" : "ไม่ได้ระบุ"}
                  </span>
                </div>

              </div>

              {/* Vitals Evaluation Banner */}
              <div className="p-3.5 rounded-xl border bg-slate-100 flex flex-col sm:flex-row justify-between gap-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">ผลวินิจฉัยความเสี่ยงหลัก</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${record.htResult.color}`}>
                      HT (ความดัน): {record.htResult.label.split(" ")[0]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${record.dmResult.color}`}>
                      DM (เบาหวาน): {record.dmResult.label.split(" ")[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">การจัดการหลัก</span>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4 text-blue-600" />
                    {record.followUpAction}
                  </div>
                  {record.followUpNote && (
                    <p className="text-xs text-slate-500 italic mt-0.5">Note: {record.followUpNote}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Family History & Lifestyle Habits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Family History */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                ประวัติสุขภาพในครอบครัว (โรคสายตรง)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {record.familyHistory && record.familyHistory.length > 0 ? (
                  record.familyHistory.map((disease, idx) => (
                    <span 
                      key={idx} 
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                        disease === "ไม่มีโรคประจำตัว" ? "bg-slate-50 text-slate-500 border-slate-200" :
                        disease === "ไม่ทราบ" ? "bg-slate-50 text-slate-500 border-slate-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {disease}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">ไม่ได้ระบุ</span>
                )}
              </div>
            </div>

            {/* Lifestyle Badges */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
                พฤติกรรมในชีวิตประจำวัน
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">การสูบบุหรี่</span>
                  <span className={`font-semibold mt-0.5 block ${
                    record.smoking.includes("สูบอยู่") ? "text-amber-600" : "text-emerald-700"
                  }`}>{record.smoking}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">เครื่องดื่มแอลกอฮอล์</span>
                  <span className={`font-semibold mt-0.5 block ${
                    record.alcohol.includes("ประจำ") ? "text-amber-600" : "text-emerald-700"
                  }`}>{record.alcohol}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">ออกกำลังกาย</span>
                  <span className="font-semibold text-indigo-700 mt-0.5 block">{record.exercise}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">การนอนหลับ</span>
                  <span className="font-semibold text-indigo-700 mt-0.5 block">{record.sleep}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Food Consumption Sweet, Fat, Salt detailed */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4 text-amber-500" />
              รายงานประเมินพฤติกรรมการกินอาหาร (หวาน มัน เค็ม)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Sweet */}
              <div className={`p-4 rounded-xl border ${record.foodHabit?.sweet?.class || "bg-slate-50"} flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-800">หมวดความหวาน (Sweet)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${record.foodHabit?.sweet?.class}`}>
                      {record.foodHabit?.sweet?.score} คะแนน
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">ระดับ: <span className={record.foodHabit?.sweet?.color}>{record.foodHabit?.sweet?.level}</span></p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed text-justify">
                    {record.foodHabit?.sweet?.description}
                  </p>
                </div>
              </div>

              {/* Fat */}
              <div className={`p-4 rounded-xl border ${record.foodHabit?.fat?.class || "bg-slate-50"} flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-800">หมวดความมัน (Fat)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${record.foodHabit?.fat?.class}`}>
                      {record.foodHabit?.fat?.score} คะแนน
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">ระดับ: <span className={record.foodHabit?.fat?.color}>{record.foodHabit?.fat?.level}</span></p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed text-justify">
                    {record.foodHabit?.fat?.description}
                  </p>
                </div>
              </div>

              {/* Salt */}
              <div className={`p-4 rounded-xl border ${record.foodHabit?.salt?.class || "bg-slate-50"} flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-800">หมวดความเค็ม (Salt)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${record.foodHabit?.salt?.class}`}>
                      {record.foodHabit?.salt?.score} คะแนน
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">ระดับ: <span className={record.foodHabit?.salt?.color}>{record.foodHabit?.salt?.level}</span></p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed text-justify">
                    {record.foodHabit?.salt?.description}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Personal Plan Evaluation */}
          {record.personalPlan && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                <ClipboardList className="w-4 h-4 text-emerald-500" />
                สรุปแผนปรับเปลี่ยนพฤติกรรม (Personal Plan)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <th className="py-2 px-3 w-1/4">หัวข้อ</th>
                      <th className="py-2 px-3 w-1/2">แผนที่ตั้งไว้</th>
                      <th className="py-2 px-3 w-1/4 text-center">ผลการทำตามแผนเดิม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: "sweet", label: "หวาน" },
                      { key: "fat", label: "มัน" },
                      { key: "salt", label: "เค็ม" },
                      { key: "sleep", label: "การนอน" },
                      { key: "water", label: "การดื่มน้ำ" },
                      { key: "exercise", label: "การออกกำลังกาย" },
                    ].map((item) => {
                      const planData = record.personalPlan?.[item.key as keyof typeof record.personalPlan];
                      return (
                        <tr key={item.key}>
                          <td className="py-2 px-3 font-semibold text-slate-700">{item.label}</td>
                          <td className="py-2 px-3 text-slate-600">{planData?.plan || "-"}</td>
                          <td className="py-2 px-3 text-center">
                            {planData?.achieved === true ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                                <Check className="w-3 h-3" /> ทำได้ (1)
                              </span>
                            ) : planData?.achieved === false ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                                <X className="w-3 h-3" /> ทำไม่ได้ (0)
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: AI Personalized Advice */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-white p-5 rounded-xl border border-blue-100 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-100 pb-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Brain className="w-5 h-5 text-blue-600" />
                <span>คำแนะนำสุขภาพเฉพาะบุคคลโดย AI (Gemini 3.1 Flash)</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2.5">
                {isStaticMode && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold" title="ทำงานในโหมด Client-Side (Static)">
                    Static Mode
                  </span>
                )}
                {isStaticMode && (
                  <button
                    onClick={() => {
                      setApiKeyInputValue(clientApiKey);
                      setShowApiKeyInput(true);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    title="ตั้งค่า API Key"
                  >
                    ตั้งค่า API Key
                  </button>
                )}
                {record.aiAdvice && !isGeneratingAdvice && (
                  <button
                    onClick={generateAiAdvice}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>วิเคราะห์ใหม่</span>
                  </button>
                )}
              </div>
            </div>

            {apiError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">เกิดข้อผิดพลาดจากบริการ AI:</p>
                  <p className="mt-0.5 text-rose-600">{apiError}</p>
                  <button
                    onClick={() => {
                      setApiError(null);
                      setApiKeyInputValue(clientApiKey);
                      setShowApiKeyInput(true);
                    }}
                    className="mt-2 text-blue-600 font-bold hover:underline cursor-pointer block"
                  >
                    แก้ไข API Key หรือเปลี่ยนคีย์ใหม่
                  </button>
                </div>
              </div>
            )}

            {showApiKeyInput ? (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      กรอก Gemini API Key เพื่อวิเคราะห์ AI
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      เนื่องจากเว็บไซต์นี้ติดตั้งแบบ Static (เช่น GitHub Pages) ซึ่งไม่มีระบบเซิร์ฟเวอร์คอยเชื่อมต่อหลังบ้าน 
                      แต่คุณยังสามารถเข้าถึงระบบ AI วิเคราะห์ได้ฟรีโดยการระบุ **Gemini API Key** ส่วนตัวของคุณ (ข้อมูลคีย์จะเก็บอยู่บนบราวเซอร์ของคุณอย่างปลอดภัยสูงสุด)
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowApiKeyInput(false);
                      setApiError(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Gemini API Key ของคุณ:</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      placeholder="กรอกคีย์ของคุณขึ้นต้นด้วย AIzaSy..."
                      value={apiKeyInputValue}
                      onChange={(e) => setApiKeyInputValue(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={() => {
                        const trimmed = apiKeyInputValue.trim();
                        localStorage.setItem("client_gemini_api_key", trimmed);
                        setClientApiKey(trimmed);
                        setShowApiKeyInput(false);
                        setApiError(null);
                        
                        // Automatically trigger analysis if key was entered
                        if (trimmed) {
                          setIsGeneratingAdvice(true);
                          generateAiAdviceClientSide(trimmed)
                            .then((advice) => {
                              const updatedRecord = {
                                ...record,
                                aiAdvice: advice,
                              };
                              onUpdateRecord(updatedRecord);
                            })
                            .catch((err) => {
                              setApiError(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์");
                            })
                            .finally(() => {
                              setIsGeneratingAdvice(false);
                            });
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shrink-0 cursor-pointer text-center"
                    >
                      บันทึกและวิเคราะห์
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    *ไม่มี API Key? ท่านสามารถขอรับ Gemini API Key ฟรีได้ทันทีจากหน้า <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">Google AI Studio</a>
                  </p>
                </div>
              </div>
            ) : isGeneratingAdvice ? (
              <div className="py-12 text-center space-y-4 bg-white rounded-xl border border-slate-100">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                  <Brain className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">กำลังประมวลผลวิเคราะห์ด้วย Gemini 3.1 Flash...</p>
                  <p className="text-xs text-slate-400 mt-1">ระบบกำลังตรวจสอบประวัติสุขภาพ ผลความดัน ระดับน้ำตาล และพฤติกรรมการกิน</p>
                </div>
              </div>
            ) : record.aiAdvice ? (
              <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-2xs">
                <SimpleMarkdown content={record.aiAdvice} />
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-xl border border-dashed border-blue-200 p-4">
                <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-pulse" />
                <h5 className="text-sm font-semibold text-slate-800 mb-1">ผลตรวจยังไม่ได้รับการวิเคราะห์ด้วย AI</h5>
                <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto px-4">
                  ช่วยให้ผู้รับการตรวจได้ปฏิบัติตัวอย่างถูกต้องตามหลักวิชาการ ด้วยการใช้ AI วิเคราะห์ประวัติและพฤติกรรม Sweet, Fat, Salt เฉพาะบุคคล
                </p>
                <button
                  onClick={generateAiAdvice}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm cursor-pointer"
                >
                  <Brain className="w-4 h-4 animate-bounce" />
                  วิเคราะห์ด้วย Gemini 3.1 Flash
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center print:hidden">
          {onDeleteRecord && (
            <div className="flex items-center gap-2">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-1.5 px-3 rounded-xl animate-in fade-in slide-in-from-left-2 duration-150">
                  <span className="text-xs text-rose-700 font-semibold">ยืนยันการลบ?</span>
                  <button
                    onClick={() => {
                      onDeleteRecord(record.id);
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] py-1 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    ลบเลย
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบรายงานนี้
                </button>
              )}
            </div>
          )}
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors ml-auto"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </div>
  );
};
