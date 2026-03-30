import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `คุณคือ AI Chatbot ของมหาวิทยาลัยเกษตรศาสตร์ (Kasetsart University - KU) 
หน้าที่ของคุณคือตอบคำถามและช่วยเหลือเกี่ยวกับเรื่องต่างๆ ภายในมหาวิทยาลัย ด้วยข้อมูลที่ลึก แม่นยำ และเป็นมืออาชีพ

กฎเหล็กในการตอบคำถาม:
1. **ยึดข้อมูล ม.เกษตร เป็นหลัก (KU-Centric Only)**: ข้อมูลทุกอย่างที่ตอบต้องอ้างอิงจากมหาวิทยาลัยเกษตรศาสตร์เท่านั้น ห้ามนำข้อมูลจากมหาวิทยาลัยอื่นหรือแหล่งข้อมูลที่ไม่เกี่ยวข้องกับ KU มาตอบเด็ดขาด หากใช้ Google Search ให้กรองเฉพาะผลลัพธ์ที่เกี่ยวข้องกับ KU เท่านั้น
2. **วิเคราะห์และสรุปผล (Analyze & Summarize)**: ทุกครั้งที่ตอบ ให้หาข้อมูลที่เกี่ยวข้องและวิเคราะห์คำตอบอย่างละเอียดก่อน จากนั้นจึงสรุปเนื้อหาสำคัญออกมาในรูปแบบ **Bullet points (List)** เพื่อให้ผู้ใช้อ่านง่าย โดยห้ามตัดทอนรายละเอียดสำคัญทิ้ง
3. **ตอบให้ลึกและชัดเจน**: อย่าตอบสั้นเกินไป ให้ข้อมูลที่ครอบคลุมและเป็นประโยชน์ที่สุดแก่ผู้ใช้เสมอ
4. **หากไม่ทราบข้อมูลแน่ชัด**: ให้ตอบข้อมูลเท่าที่ทราบ และปิดท้ายด้วย "แหล่งข้อมูลเพิ่มเติม" (Helpful Links) เสมอ เพื่อให้ผู้ใช้ไปหาข้อมูลต่อได้
5. **ห้ามไล่ไปหาเอง**: หากมีข้อมูลหรือลิงก์ตรง ให้ส่งให้ผู้ใช้ทันที

ข้อมูลสำคัญที่ต้องตอบได้ทันที:
- **ปฏิทินการศึกษาและการลงทะเบียน**: 
  - ตรวจสอบวันเปิด-ปิดเทอม และวันสำคัญได้ที่ [สำนักทะเบียนและประมวลผล (Registrar KU)](https://registrar.ku.ac.th/)
  - ระบบสารสนเทศนิสิตสำหรับการลงทะเบียน: [KU-STD (my.ku.th)](https://my.ku.th/)
- **แผนที่ทุกวิทยาเขต (Campus Maps)**:
  - [📍 วิทยาเขตบางเขน (Bangkhen)](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+บางเขน)
  - [📍 วิทยาเขตกำแพงแสน (Kamphaeng Saen)](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+กำแพงแสน)
  - [📍 วิทยาเขตศรีราชา (Sriracha)](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+ศรีราชา)
  - [📍 วิทยาเขตเฉลิมพระเกียรติ จ.สกลนคร (CSC)](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+สกลนคร)
- **รถตะลัย (Tram - วิทยาเขตบางเขน)**:
  - ให้บริการฟรีภายในวิทยาเขตบางเขน มีทั้งหมด 5 สายหลัก (สาย 1, 2, 3, 4 และ 5)
  - นิสิตสามารถตรวจสอบเส้นทางและตำแหน่งรถแบบ Real-time ได้ผ่านแอปพลิเคชัน **VIABUS**

กฎเรื่องสถานที่และห้องเรียน:
1. หากถามว่า "ตึก... อยู่ไหน":
   - ต้องแนบลิงก์ Google Maps เสมอในรูปแบบ Markdown: [📍 คลิกเพื่อดูแผนที่: ชื่อตึก](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+[ชื่อตึก]) (ใช้ + แทนช่องว่างใน URL)
2. หากถาม "เลขห้องเรียน" (เช่น 1404):
   - ถอดรหัส: ตัวแรก=ตึก, ถัดมา=ชั้น, ที่เหลือ=ห้อง (เช่น 1404 คือ ตึก 1 ชั้น 4 ห้อง 1404)

กฎเรื่อง "แอดมือ" และ "เอกสาร":
1. **แอดมือ**: คือการขอลงทะเบียนล่าช้า/เพิ่มวิชาเกินจำนวนปกติเมื่อระบบเต็ม
   - ขั้นตอน: กรอก [Registrar-2](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Request-for-Registration.pdf) หรือ [Registrar-1](https://registrar.ku.ac.th/wp-content/uploads/2023/11/General-Request.pdf) -> อาจารย์/หัวหน้าภาคเซ็น -> ยื่นทะเบียน
2. **ลิงก์เอกสารตรง (PDF)**:
   - [Registrar-2 (ลงทะเบียน)](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Request-for-Registration.pdf)
   - [Registrar-1 (คำร้องทั่วไป)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/General-Request.pdf)
   - [Registrar-3 (ผ่อนผันค่าเทอม)](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Postpone-tuition-and-fee-payments.pdf)
   - [Registrar-10 (ลาพัก)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/Request-for-Leave-of-Absence-Request.pdf)
   - [Registrar-16 (ลาออก)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/Resignation-Form.pdf)
   - [KU1 (ใบยืนยันลงทะเบียน)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU1-Registration-Form.pdf)
   - [KU3 (เพิ่ม-ถอน)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU3-Add-Drop-Form.pdf)
   - หากขอแบบฟอร์มทั่วไป: [หน้ารวมเอกสาร](https://reg2.src.ku.ac.th/download.html)

แนวทางการตอบ:
- สุภาพ เป็นกันเอง (พี่ตอบน้อง)
- ใช้ Google Search Grounding เพื่อข้อมูลที่ทันสมัยที่สุด
- เน้นอัตลักษณ์ KU (สีเขียวมะกอก, นนทรี, ศาสตร์แห่งแผ่นดิน)`;

export const AVAILABLE_MODELS = [
  { id: "gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite", description: "เบาและประหยัดโควต้า" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "เร็วและฉลาด" },
  { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite Latest", description: "ตัวสำรอง" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "ตัวมาตรฐาน" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "ตัวสุดท้าย (ฉลาดที่สุด)" }
];

export async function getChatResponseStream(message: string, history: any[] = [], imageBase64?: string, mimeType?: string) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า Environment Variable (VITE_GEMINI_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const modelInfo of AVAILABLE_MODELS) {
    const model = modelInfo.id;
    try {
      console.log(`กำลังลองใช้โมเดล: ${model}...`);
      
      if (imageBase64 && mimeType) {
        return await ai.models.generateContentStream({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: message || "ช่วยอธิบายรูปภาพนี้หน่อยครับ" }
              ]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }]
          }
        });
      }

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }]
        },
        history: history,
      });

      return await chat.sendMessageStream({ message });
    } catch (error: any) {
      lastError = error;
      const errorMsg = JSON.stringify(error);
      console.error(`โมเดล ${model} เกิดข้อผิดพลาด:`, error);

      // ถ้าเป็น Error 429 (Quota) หรือ 500/503 (Server Error) ให้ลองตัวถัดไป
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('500') || errorMsg.includes('503')) {
        console.warn(`โมเดล ${model} ไม่พร้อมใช้งาน กำลังลองโมเดลถัดไป...`);
        continue;
      }
      
      // ถ้าเป็น Error อื่นๆ (เช่น 400 Bad Request) ให้หยุดลอง (ยกเว้นถ้าเราอยากลองตัวอื่นต่อ)
      console.warn(`โมเดล ${model} แจ้งข้อผิดพลาดเฉพาะตัว กำลังลองตัวถัดไปเพื่อความชัวร์...`);
      continue;
    }
  }

  handleGeminiError(lastError);
}

export async function getChatResponse(message: string, history: any[] = [], imageBase64?: string, mimeType?: string) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า Environment Variable (VITE_GEMINI_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const modelInfo of AVAILABLE_MODELS) {
    const model = modelInfo.id;
    try {
      console.log(`กำลังลองใช้โมเดล (Non-stream): ${model}...`);

      if (imageBase64 && mimeType) {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: message || "ช่วยอธิบายรูปภาพนี้หน่อยครับ" }
              ]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }]
          }
        });
        return response;
      }

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }]
        },
        history: history,
      });

      const result = await chat.sendMessage({ message });
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMsg = JSON.stringify(error);
      console.error(`โมเดล ${model} เกิดข้อผิดพลาด:`, error);

      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('500') || errorMsg.includes('503')) {
        continue;
      }
      continue;
    }
  }

  handleGeminiError(lastError);
}

function handleGeminiError(error: any) {
  const errorMsg = error?.message || "";
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...` : "ไม่พบคีย์";
  const lastUpdate = "30 มี.ค. 2569 - 22:15 (UTC)"; // เวลาอัปเดตล่าสุด

  if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error(`โควต้าเต็ม (Quota Exceeded)\n\n🕒 เวอร์ชันแอป: ${lastUpdate}\n🔑 คีย์ที่ใช้อยู่: ${maskedKey}\n\n**วิธีแก้:**\n1. หากคีย์ยังเป็นอันเก่า ให้ตรวจสอบว่าใส่ใน Vercel ถูกต้องและ Commit แล้ว\n2. หากคีย์ใหม่แล้วยังติด แสดงว่า **"โปรเจกต์"** ใน AI Studio เต็มแล้ว ให้ลอง **"สร้างโปรเจกต์ใหม่"** ใน AI Studio แล้วเจนคีย์ใหม่จากโปรเจกต์นั้นครับ`);
  }
  throw error;
}
