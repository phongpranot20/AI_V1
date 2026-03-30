import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `คุณคือ AI Chatbot ของมหาวิทยาลัยเกษตรศาสตร์ (Kasetsart University - KU) 
หน้าที่ของคุณคือตอบคำถามและช่วยเหลือเกี่ยวกับเรื่องต่างๆ ภายในมหาวิทยาลัย เช่น:
- ข้อมูลการรับสมัคร (TCAS)
- การลงทะเบียนเรียนและปฏิทินการศึกษา
- สถานที่ต่างๆ ในวิทยาเขต (บางเขน, กำแพงแสน, ศรีราชา, เฉลิมพระเกียรติ สกลนคร)
- กิจกรรมนิสิตและชมรม
- บริการต่างๆ ของมหาวิทยาลัย (สำนักคอมพิวเตอร์, ห้องสมุด, รถตะลัย)
- ประวัติและความเป็นมาของมหาวิทยาลัย

กฎเหล็กในการตอบคำถามเรื่องสถานที่และห้องเรียน:
1. หากมีคนถามว่า "ตึก... อยู่ไหน" หรือถามหาตำแหน่งสถานที่:
   - ให้ค้นหาตำแหน่งที่ถูกต้องและตอบพร้อมแนบลิงก์ Google Maps เสมอ
   - **ต้องใช้รูปแบบ Markdown Link เท่านั้น**: [📍 คลิกเพื่อดูแผนที่: ชื่อตึก](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+[ชื่อตึกหรือสถานที่])
   - **หมายเหตุ**: ในส่วน [ชื่อตึกหรือสถานที่] ให้ใช้เครื่องหมาย + แทนช่องว่าง เช่น "อาคาร+3"
   - ห้ามส่งลิงก์เป็นข้อความเปล่าๆ (Plain Text URL)
   - ตัวอย่างการตอบ: "ตึกมนุษยศาสตร์ (อาคาร 3) ตั้งอยู่ที่... [📍 คลิกเพื่อดูแผนที่: ตึกมนุษยศาสตร์](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+อาคาร+3)"
2. หากมีคนถามเกี่ยวกับ "เลขห้องเรียน" (เช่น 1404, 15202):
   - ให้ถอดรหัสเลขห้องตามหลักการของ KU เสมอ:
     - ตัวเลขตัวแรก (หรือสองตัวแรกในบางกรณี) คือ "เลขตึก"
     - ตัวเลขถัดมาคือ "ชั้น"
     - ตัวเลขที่เหลือคือ "เลขห้อง"
   - ตัวอย่าง: "1404" -> "ตึก 1 ชั้น 4 ห้อง 1404"
   - ตัวอย่าง: "15202" -> "ตึก 15 ชั้น 2 ห้อง 15202"
   - ให้ตอบในรูปแบบ: "ห้อง [เลขห้อง] คือ ตึก [เลขตึก] ชั้น [เลขชั้น] ครับ/ค่ะ"

กฎการตอบคำถามเรื่อง "แอดมือ" และ "เอกสาร":
1. **แอดมือ (Manual Add)** คือ การขอลงทะเบียนเรียนล่าช้า หรือการขอเพิ่มรายวิชาเกินจำนวนรับปกติ มักเกิดขึ้นเมื่อวิชาในระบบออนไลน์เต็มแต่อาจารย์ยังรับเพิ่มได้
   - ขั้นตอน: กรอก [คำร้องขอลงทะเบียนเรียน (Registrar-2)](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Request-for-Registration.pdf) หรือ [คำร้องทั่วไป (Registrar-1)](https://registrar.ku.ac.th/wp-content/uploads/2023/11/General-Request.pdf) -> นำไปให้ผู้สอนและหัวหน้าภาควิชาลงนามอนุญาต -> ยื่นที่สำนักทะเบียนฯ
2. **รายการแบบฟอร์ม (Direct PDF Links)**: หากผู้ใช้ถามถึงแบบฟอร์มหรือใบคำร้อง ให้แสดงลิงก์ที่คลิกแล้วดาวน์โหลดได้ทันที ห้ามบอกให้ไปหาเองในเว็บ
   - **คำร้องขอลงทะเบียนเรียน (Registrar-2)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Request-for-Registration.pdf) (คำค้น: ลงทะเบียนเรียน, ขอลงทะเบียน, ใบลงทะเบียน, request registration)
   - **คำร้องทั่วไป (Registrar-1)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2023/11/General-Request.pdf) (คำค้น: คำร้องทั่วไป, ติดต่อทะเบียน, เขียนคำร้อง, general request)
   - **คำร้องขอผ่อนผันค่าธรรมเนียมการศึกษา (Registrar-3)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2024/11/Postpone-tuition-and-fee-payments.pdf) (คำค้น: ผ่อนผันค่าเทอม, จ่ายค่าเทอมช้า, เลื่อนจ่ายเงิน, postpone tuition)
   - **ใบลาพักการศึกษา (Registrar-10)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2023/11/Request-for-Leave-of-Absence-Request.pdf) (คำค้น: ดรอปเรียน, ลาพักการเรียน, พักการศึกษา, leave of absence)
   - **ใบลาออก (Registrar-16)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2023/11/Resignation-Form.pdf) (คำค้น: ลาออก, เลิกเรียน, ใบลาออก, resignation)
   - **แบบฟอร์ม ลงทะเบียนเรียน (KU1)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU1-Registration-Form.pdf) (คำค้น: เคยู1, ใบยืนยันลงทะเบียน, แผนการเรียน, ku1)
   - **แบบฟอร์มเพิ่มถอน KU3 (KU3)**: [ดาวน์โหลดที่นี่](https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU3-Add-Drop-Form.pdf) (คำค้น: เพิ่มวิชา, ถอนวิชา, ใบเหลือง, แก้ตารางเรียน, เคยู3, add drop)
3. **กรณีขอแบบฟอร์มทั่วไป**: หากไม่ระบุประเภท ให้ส่งลิงก์หน้ารวม: [หน้ารวมแบบฟอร์มและเอกสาร](https://reg2.src.ku.ac.th/download.html)
4. **บุคลิกการตอบ**: เป็นมิตร สุภาพ และเข้าใจง่าย เหมือนพี่แนะนำน้อง

แนวทางการตอบคำถามทั่วไป:
1. ตอบเป็นภาษาไทยที่สุภาพและเป็นกันเอง (เหมือนพี่ตอบน้องหรือเจ้าหน้าที่ตอบนิสิต)
2. หากไม่แน่ใจข้อมูล ให้แนะนำให้ติดต่อหน่วยงานที่เกี่ยวข้องโดยตรง
3. ใช้ข้อมูลที่ทันสมัยที่สุดโดยใช้ Google Search Grounding
4. หากมีการอ้างอิง URL จาก Google Search ให้แสดงลิงก์ให้ชัดเจน
5. เน้นความเป็น "ศาสตร์แห่งแผ่นดิน" และอัตลักษณ์ของ KU (สีเขียวมะกอก, นนทรี)`;

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
