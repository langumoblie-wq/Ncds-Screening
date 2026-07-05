-- ==============================================================================
-- Supabase Setup Script for NCDs Screening System
-- ==============================================================================

-- 1. Create the main table for NCDs records
CREATE TABLE IF NOT EXISTS public.ncd_records (
    id BIGINT PRIMARY KEY,
    name TEXT,
    visit_number INTEGER,
    age INTEGER,
    gender TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.ncd_records ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Allow all for easy testing as requested)
DROP POLICY IF EXISTS "Allow Select" ON public.ncd_records;
CREATE POLICY "Allow Select" ON public.ncd_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Insert" ON public.ncd_records;
CREATE POLICY "Allow Insert" ON public.ncd_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Update" ON public.ncd_records;
CREATE POLICY "Allow Update" ON public.ncd_records FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Delete" ON public.ncd_records;
CREATE POLICY "Allow Delete" ON public.ncd_records FOR DELETE USING (true);

-- 4. Create a Storage Bucket for file uploads (e.g., patient documents, images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ncd_files', 'ncd_files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS on Storage objects (Supabase handles this automatically)
-- Removed: ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for Storage
-- **หมายเหตุสำคัญ**: หากรันแล้วติด Error "must be owner of table objects"
-- แนะนำให้ไปตั้งค่า Policy ของ Storage ผ่านหน้าเว็บ Supabase UI แทน:
-- (ไปที่เมนู Storage -> เลือก Bucket "ncd_files" -> Policies -> สร้าง Policy แบบ Public)
-- DROP POLICY IF EXISTS "Allow Public Select Storage" ON storage.objects;
-- CREATE POLICY "Allow Public Select Storage" ON storage.objects FOR SELECT USING (bucket_id = 'ncd_files');

-- DROP POLICY IF EXISTS "Allow Authenticated Insert Storage" ON storage.objects;
-- CREATE POLICY "Allow Authenticated Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ncd_files');

-- DROP POLICY IF EXISTS "Allow Authenticated Update Storage" ON storage.objects;
-- CREATE POLICY "Allow Authenticated Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'ncd_files');

-- DROP POLICY IF EXISTS "Allow Authenticated Delete Storage" ON storage.objects;
-- CREATE POLICY "Allow Authenticated Delete Storage" ON storage.objects FOR DELETE USING (bucket_id = 'ncd_files');

-- ==============================================================================
-- 7. Insert Sample Data
-- ==============================================================================
INSERT INTO public.ncd_records (id, name, visit_number, age, gender, created_at, data)
VALUES 
(
  1719800000000, 
  'สมชาย ใจดี', 
  1, 
  45, 
  'ชาย', 
  NOW(), 
  '{
    "id": 1719800000000,
    "name": "สมชาย ใจดี",
    "age": 45,
    "gender": "ชาย",
    "phone": "0812345678",
    "visitNumber": 1,
    "district": "เมืองสตูล",
    "subdistrict": "พิมาน",
    "targetArea": "ชุมชนบ้านเหนือ",
    "modelType": "ปิงปอง 7 สี",
    "weight": 75,
    "height": 170,
    "bmi": 25.95,
    "bpSys": 135,
    "bpDia": 85,
    "htResult": {"label": "กลุ่มเสี่ยง", "color": "bg-green-300", "textColor": "text-green-800"},
    "sugar": 110,
    "dmResult": {"label": "กลุ่มเสี่ยง", "color": "bg-green-300", "textColor": "text-green-800"},
    "htPingPong": "สีเขียวอ่อน",
    "dmPingPong": "สีเขียวอ่อน",
    "combinedPingPong": "สีเขียวอ่อน",
    "foodHabit": {
      "sweet": {"score": 2, "level": "เสี่ยงปานกลาง"},
      "fat": {"score": 3, "level": "เสี่ยงสูง"},
      "salt": {"score": 1, "level": "เสี่ยงน้อย"}
    },
    "familyHistory": ["ความดันโลหิตสูง"],
    "smoking": "ไม่สูบ",
    "alcohol": "ไม่ดื่ม",
    "water": "6-8 แก้ว",
    "exercise": "สัปดาห์ละ 1-2 วัน",
    "sleep": "6-8 ชั่วโมง",
    "sodium": "ปรุงเพิ่มบางครั้ง",
    "createdAt": "2024-07-01T00:00:00.000Z"
  }'::jsonb
),
(
  1719800000001, 
  'สมศรี มีสุข', 
  2, 
  52, 
  'หญิง', 
  NOW(), 
  '{
    "id": 1719800000001,
    "name": "สมศรี มีสุข",
    "age": 52,
    "gender": "หญิง",
    "phone": "0898765432",
    "visitNumber": 2,
    "district": "ควนโดน",
    "subdistrict": "ควนโดน",
    "targetArea": "ชุมชนควนโดนใน",
    "modelType": "ปิงปอง 7 สี",
    "weight": 60,
    "height": 155,
    "bmi": 24.97,
    "bpSys": 120,
    "bpDia": 80,
    "htResult": {"label": "กลุ่มปกติ", "color": "bg-white", "textColor": "text-slate-800"},
    "sugar": 95,
    "dmResult": {"label": "กลุ่มปกติ", "color": "bg-white", "textColor": "text-slate-800"},
    "htPingPong": "สีขาว",
    "dmPingPong": "สีขาว",
    "combinedPingPong": "สีขาว",
    "foodHabit": {
      "sweet": {"score": 1, "level": "เสี่ยงน้อย"},
      "fat": {"score": 1, "level": "เสี่ยงน้อย"},
      "salt": {"score": 1, "level": "เสี่ยงน้อย"}
    },
    "familyHistory": [],
    "smoking": "ไม่สูบ",
    "alcohol": "ไม่ดื่ม",
    "water": "มากกว่า 8 แก้ว",
    "exercise": "สัปดาห์ละ 3-5 วัน",
    "sleep": "6-8 ชั่วโมง",
    "sodium": "ไม่ปรุงเพิ่ม",
    "createdAt": "2024-07-01T00:05:00.000Z"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
