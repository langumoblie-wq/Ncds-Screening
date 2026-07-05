export interface HabitQuestion {
  id: string;
  text: string;
  // Map option choice (0 = daily, 1 = weekly, 2 = rarely) to its corresponding score value
  scoreMapping: [number, number, number]; 
}

export interface HabitCategory {
  key: "sweet" | "fat" | "salt";
  title: string;
  themeColor: string; // for tailwind borders / accents
  headerBg: string;
  accentText: string;
  questions: HabitQuestion[];
}

export const FOOD_HABIT_QUESTIONS: HabitCategory[] = [
  {
    key: "sweet",
    title: "หมวดความหวาน (Sweet)",
    themeColor: "border-pink-200 focus-within:ring-pink-500",
    headerBg: "bg-pink-50 text-pink-700",
    accentText: "text-pink-600",
    questions: [
      {
        id: "sweet_1",
        text: "1. ดื่มน้ำเปล่า กาแฟดำ ชาไม่ใส่น้ำตาล โซดา",
        scoreMapping: [1, 2, 3]
      },
      {
        id: "sweet_2",
        text: "2. ดื่มน้ำอัดลม กาแฟ 3in1 กาแฟเย็น กาแฟปั่น เครื่องดื่มชง น้ำหวาน นมเปรี้ยว",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "sweet_3",
        text: "3. ดื่มน้ำผัก ผลไม้สำเร็จรูป",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "sweet_4",
        text: "4. กินไอศกรีม เบเกอรี่ หรือขนมหวานไทย",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "sweet_5",
        text: "5. เติมน้ำตาล น้ำผึ้ง น้ำเชื่อม เพิ่มลงในอาหาร",
        scoreMapping: [3, 2, 1]
      }
    ]
  },
  {
    key: "fat",
    title: "หมวดความมัน (Fat)",
    themeColor: "border-amber-200 focus-within:ring-amber-500",
    headerBg: "bg-amber-50 text-amber-700",
    accentText: "text-amber-600",
    questions: [
      {
        id: "fat_1",
        text: "1. เลือกกินเนื้อสัตว์ติดมัน ติดหนัง มีไขมันแทรก",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "fat_2",
        text: "2. กินอาหารทอด อาหารฟาสต์ฟู้ด อาหารผัดน้ำมัน",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "fat_3",
        text: "3. กินอาหารจานเดียว ไขมันสูงหรืออาหารประเภทแกงกะทิ",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "fat_4",
        text: "4. ดื่มเครื่องดื่มที่ชงผสม นมข้นหวาน ครีมเทียม วิปปิ้งครีม",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "fat_5",
        text: "5. ซดน้ำผัด น้ำแกงหรือราดน้ำผัด น้ำแกงลงในข้าว",
        scoreMapping: [3, 2, 1]
      }
    ]
  },
  {
    key: "salt",
    title: "หมวดความเค็ม (Salt)",
    themeColor: "border-blue-200 focus-within:ring-blue-500",
    headerBg: "bg-blue-50 text-blue-700",
    accentText: "text-blue-600",
    questions: [
      {
        id: "salt_1",
        text: "1. ชิมอาหารก่อนปรุง น้ำปลา ซีอิ๊ว ซอส ปรุงน้อยหรือไม่ปรุงเพิ่ม",
        scoreMapping: [1, 2, 3]
      },
      {
        id: "salt_2",
        text: "2. ใช้สมุนไพรหรือเครื่องเทศ เป็นส่วนประกอบอาหาร แทนเครื่องปรุง",
        scoreMapping: [1, 2, 3]
      },
      {
        id: "salt_3",
        text: "3. กินเนื้อสัตว์แปรรูป ไส้กรอก หมูยอ แหนม ปลาเค็ม กุ้งแห้ง ปลาร้า",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "salt_4",
        text: "4. กินบะหมี่ โจ๊กกึ่งสำเร็จรูป หรืออาหารกล่องแช่แข็ง",
        scoreMapping: [3, 2, 1]
      },
      {
        id: "salt_5",
        text: "5. กินผักผลไม้ดอง หรือ ผลไม้แช่อิ่ม จิ้มพริกเกลือ น้ำปลาหวาน",
        scoreMapping: [3, 2, 1]
      }
    ]
  }
];
