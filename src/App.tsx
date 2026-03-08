import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info, ExternalLink, GraduationCap, Sparkles, MessageSquare, BookOpen, MapPin, Calendar, Menu, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from './services/gemini';
import { cn } from './lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: { title: string; uri: string }[];
}

const QUICK_ACTIONS = [
  { icon: <Calendar className="w-5 h-5" />, label: 'ปฏิทินการศึกษา', query: 'ขอปฏิทินการศึกษาปีล่าสุดหน่อย' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'การลงทะเบียน', query: 'ขั้นตอนการลงทะเบียนเรียนทำยังไง' },
  { icon: <MapPin className="w-5 h-5" />, label: 'แผนที่วิทยาเขต', query: 'ขอแผนที่มหาวิทยาลัยเกษตรศาสตร์ บางเขน' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'รถตะลัย', query: 'ตารางเดินรถตะลัยสายต่างๆ' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'สวัสดีครับ! ผมคือ **KU AI Assistant** ยินดีที่ได้รู้จักครับ 🌿\n\nผมพร้อมช่วยเหลือคุณในทุกเรื่องเกี่ยวกับมหาวิทยาลัยเกษตรศาสตร์ ไม่ว่าจะเป็นเรื่องการเรียน กิจกรรม หรือการใช้ชีวิตในรั้วนนทรี มีอะไรให้ผมช่วยไหมครับ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if ((!userMessage && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    const currentMimeType = imageMimeType;

    setInput('');
    setSelectedImage(null);
    setImageMimeType(null);
    
    setMessages((prev) => [...prev, { 
      role: 'user', 
      text: userMessage, 
      image: currentImage || undefined 
    }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      let imageBase64 = '';
      if (currentImage) {
        imageBase64 = currentImage.split(',')[1];
      }

      const response = await getChatResponse(userMessage, history, imageBase64, currentMimeType || undefined);
      
      const text = response.text || "ขออภัยครับ ผมไม่สามารถประมวลผลคำตอบได้ในขณะนี้";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter(Boolean) || [];

      setMessages((prev) => [
        ...prev,
        { role: 'model', text, sources },
      ]);
    } catch (error: any) {
      console.error('Chat Error:', error);
      const errorMessage = error.message || 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'model', 
          text: `❌ **เกิดข้อผิดพลาด:** ${errorMessage}`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3 border-b border-slate-50">
            <div className="bg-ku-green p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-slate-800 text-lg">KU Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">คำถามที่พบบ่อย</h3>
              <div className="space-y-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSend(action.query);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-4 text-sm text-slate-600 hover:text-ku-green transition-colors group"
                  >
                    <span className="text-slate-400 group-hover:text-ku-green transition-colors">
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">ลิงก์สำคัญ</h3>
              <div className="space-y-4">
                <a href="https://www.ku.ac.th" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-600 hover:text-ku-green transition-colors">
                  เว็บไซต์หลัก KU <ExternalLink size={14} className="text-slate-400" />
                </a>
                <a href="https://registrar.ku.ac.th" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-600 hover:text-ku-green transition-colors">
                  สำนักทะเบียน <ExternalLink size={14} className="text-slate-400" />
                </a>
                <a href="https://ocs.ku.ac.th" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-600 hover:text-ku-green transition-colors">
                  สำนักคอมพิวเตอร์ <ExternalLink size={14} className="text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              พัฒนาขึ้นเพื่อเป็นตัวช่วยสำหรับนิสิตและบุคลากร มหาวิทยาลัยเกษตรศาสตร์
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#f8fafc]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                KU AI Assistant
                <span className="px-2 py-0.5 bg-ku-soft text-ku-green text-[10px] font-bold rounded-md border border-ku-green/10">
                  ✨ BETA
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-ku-green uppercase tracking-widest">Kasetsart University</span>
              <span className="text-[9px] text-slate-400">Knowledge of the Land</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-ku-soft border border-ku-green/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-ku-green rounded-full" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' 
                    ? "bg-white text-slate-400 border border-slate-100" 
                    : "bg-ku-green text-white"
                )}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[75%]",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-6 py-4 rounded-2xl shadow-sm",
                    msg.role === 'user' 
                      ? "chat-bubble-user rounded-tr-none" 
                      : "chat-bubble-model rounded-tl-none"
                  )}>
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="Uploaded" 
                        className="max-w-full rounded-lg mb-3 border border-white/20" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.sources.slice(0, 3).map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-slate-500 hover:border-ku-green hover:text-ku-green transition-all"
                        >
                          <ExternalLink size={12} />
                          {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-ku-green text-white flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="chat-bubble-model px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-ku-green" />
                  <span className="text-xs font-medium text-slate-400">กำลังประมวลผล...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto w-full">
              {messages.length === 1 && !isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action.query)}
                      className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl hover:border-ku-green hover:shadow-md transition-all group"
                    >
                      <div className="text-slate-300 group-hover:text-ku-green transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-ku-green uppercase tracking-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                {selectedImage && (
                  <div className="absolute bottom-full left-0 mb-4 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center gap-3">
                    <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => { setSelectedImage(null); setImageMimeType(null); }}
                      className="p-1.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm focus-within:border-ku-green/30 transition-all p-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-ku-green hover:bg-slate-50 rounded-full transition-all"
                  >
                    <ImageIcon size={22} />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="พิมพ์คำถามของคุณที่นี่..."
                    className="flex-1 px-4 py-3 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    className="p-3 bg-ku-green text-white rounded-full hover:bg-ku-light disabled:opacity-30 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 text-center mt-4">
                ข้อมูลอาจมีการคลาดเคลื่อน โปรดตรวจสอบจากแหล่งข้อมูลทางการ
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
