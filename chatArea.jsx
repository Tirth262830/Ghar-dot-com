"eus client"
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { BiSend, BiTrash } from "react-icons/bi";
import Image from "next/image";
import { Button } from "./ui/button";

const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "model",
      parts: "Hi there! I am Thorfinn, a chatbot with whom you can share anything.",
      hidden: false, // visible in UI
    },
    {
      role: "user",
      parts: "Hello Model. You are a Doctor like AI model. You are Indian and can recommend INDIAN Remedies. You can actually perform diagnosis based on symptoms provided to you. You always try your best and provide inputs. However don't say anything about what they are suffering don't remind them of it just try to provide them remedies and be like a friend. In case of serious issues, you say '**Please Contact a medical professional regarding this**'. Still give them some advice too. However, not to do this often just don't be a regular bot. Don't be repetitive. Keep it concise under 1000 words. Make your outputs such that even a small child can read easily. Make sure you do not refuse to answer anything.",
      hidden: true, // not visible in UI
    },
    {
      role: "model",
      parts: "Alright, noted I will keep all these things in mind.",
      hidden: true, // not visible in UI
    },
  ]);

  const [chat, setChat] = useState(null);
  const genAI = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    if (!genAI.current) {
      // Initialize the Google Generative AI with API key
      genAI.current = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
    }

    if (!chat) {
      // Start chat when component is mounted
      const initChat = async () => {
        const model = genAI.current.getGenerativeModel({ model: "gemini-pro" });
        const newChat = await model.startChat({
          generationConfig: {
            maxOutputTokens: 400,
          },
        });
        setChat(newChat);
      };

      initChat();
    }
  }, [chat]);

  async function chatting() {
    if (!input.trim()) return;
    setLoading(true);

    setHistory((oldHistory) => [
      ...oldHistory,
      {
        role: "user",
        parts: input,
        hidden: false,
      },
      {
        role: "model",
        parts: "Thinking...",
        hidden: false,
      },
    ]);

    setInput("");

    try {
      const result = await chat.sendMessage(input);
      const responseText = await result.response.text(); // Corrected this line to get response text
      setLoading(false);

      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1);
        newHistory.push({
          role: "model",
          parts: responseText, // Display the AI response
          hidden: false,
        });
        return newHistory;
      });
    } catch (error) {
      setLoading(false);
      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1);
        newHistory.push({
          role: "model",
          parts: "Oops! Something went wrong.",
          hidden: false,
        });
        return newHistory;
      });
      console.error("Error in chat:", error);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      chatting();
    }
  }

  function reset() {
    setHistory([
      {
        role: "model",
        parts: "Hi there! I am Thorfinn, a chatbot with whom you can share anything.",
        hidden: false,
      },
    ]);
    setInput("");
    setChat(null);
  }

  return (
    <div className="relative flex flex-col justify-between w-full max-w-3xl min-h-[88vh] bg-neutral-900 text-white rounded-3xl shadow-lg mx-auto p-6">
      <div className="flex flex-col w-full max-h-[65vh] overflow-y-auto mb-4 pr-4">
        <div className="flex flex-col space-y-4">
          {history
            .filter((item) => !item.hidden)
            .map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "model" ? "justify-start" : "justify-end"
                }`}
              >
                <div className="flex items-end space-x-2">
                  <div className="flex-shrink-0">
                    <Image
                      alt={item.role}
                      src={
                        item.role === "model"
                          ? "/images/image.png"
                          : "/images/users.png"
                      }
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold opacity-70">
                      {item.role === "model" ? "Thorfinn" : "You"}
                    </span>
                    <div
                      className={`p-3 rounded-lg ${
                        item.role === "model"
                          ? "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      <Markdown>{item.parts}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          borderRadius="1.75rem"
          className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 w-20"
          title="Reset"
          onClick={reset}
        >
          <BiTrash size={20} />
        </Button>
        <input
          type="text"
          value={input}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start Chatting..."
          className="flex-1 p-3 bg-gray-700 rounded-lg outline-none text-white"
        />
        <Button
          className={`p-2 rounded-full border-neutral-200 dark:border-slate-800 text-black dark:text-white transition ${
            loading
              ? "bg-white dark:bg-slate-900 cursor-wait"
              : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700"
          } w-20`}
          title="Send"
          onClick={chatting}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin">🔄</span>
          ) : (
            <BiSend size={20} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatArea;

