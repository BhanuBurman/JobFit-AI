import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react"; // Added Send icon
import { useResume } from "../context/ResumeContext";
import ResumeUploader from "../components/ResumeUploader";
import { getChatMessages, type Message } from "../lib/api";

export function Agent() {
  const [messages, setMessages] = useState<Message[]>([]);

  const { currentResume } = useResume();
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Adjust height as user types
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset to calculate correct scrollHeight
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Cap at 200px
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    adjustHeight();
  };

  // Handle Enter key to submit, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Don't send empty messages

    console.log("Sending:", input);
    
    // Reset UI
    setInput("");
    // We need to reset height manually after submission
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; 
    }
  };

  // Reset height when input is cleared programmatically
  useEffect(() => {
    if (input === "") {
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }, [input]);



  useEffect(() => {
    if(!currentResume) return;
    getChatMessages(currentResume.id)
    .then((msgs) => {
      console.log(msgs);
      
      if(msgs) setMessages(msgs);
    }).catch((error) => {
      console.error("Error loading chat messages:", error);
    });
  }, [currentResume]);

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col relative">
      {currentResume?.id ? (
        <>
          {/* 1. SCROLLABLE MESSAGE AREA */}
          {/* flex-1 makes this take up all remaining space above the input */}
          <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {messages.map((msg, index) =>{
                return msg.role === "ai"? 
                <div className="flex items-start" key={index}>
                  <div className="bg-blue-100 text-blue-900 rounded-2xl rounded-tl-none px-5 py-3 max-w-md shadow-sm">
                    {msg.content}
                  </div>
                </div>
                :(
              <div className="flex items-end justify-end" key={index}>
                <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tr-none px-5 py-3 max-w-md shadow-sm">
                  {msg.content}
                </div>
              </div>
                )
              })}
            </div>
          </div>

          {/* 2. FIXED INPUT AREA */}
          {/* Stays at the bottom */}
          <div className="bg-transparent p-4 absolute bottom-0 w-full z-10">
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-2 bg-slate-100 rounded-2xl border border-slate-300 px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all"
              >
                <textarea
                  ref={textareaRef}
                  className="flex-1 max-h-[200px] min-h-[24px] w-full bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-900 placeholder-gray-500 py-1 px-2 leading-relaxed scrollbar-hide"
                  placeholder="Ask anything about your resume..."
                  rows={1}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                />
                
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-2 rounded-xl flex-shrink-0 transition-all duration-200 ${
                    input.trim() 
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="text-center text-xs text-gray-400 mt-2">
                AI can make mistakes. Please review generated advice.
              </div>
            </div>
          </div>
        </>
      ) : (
        <ResumeUploader />
      )}
    </div>
  );
}