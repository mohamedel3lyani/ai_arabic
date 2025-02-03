import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Send, MessageSquare, Menu, X, Shield, Info, Book } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  references?: string[];
  isTyping?: boolean;
  typedText?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface IslamicCourseSection {
  id: string;
  title: string;
  content: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showIslamicCourse, setShowIslamicCourse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiKey = import.meta.env.VITE_API_KEY;

  const islamicCourseSections: IslamicCourseSection[] = [
    {
      id: 'allah-tawheed',
      title: 'من هو الله وما هو التوحيد',
      content: `# التوحيد في الإسلام

> "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾" - سورة الإخلاص

## تعريف التوحيد
التوحيد هو إفراد الله تعالى بما يختص به من الربوبية والألوهية والأسماء والصفات.

## أنواع التوحيد
### 1. توحيد الربوبية
هو الإيمان بأن الله وحده هو الخالق الرازق المدبر لجميع الأمور.

### 2. توحيد الألوهية
هو إفراد الله تعالى بالعبادة، فلا يُعبد إلا الله وحده لا شريك له.

### 3. توحيد الأسماء والصفات
هو الإيمان بما ورد في القرآن والسنة من أسماء الله وصفاته على الوجه اللائق به سبحانه.`
    },
    {
      id: 'islam-definition',
      title: 'تعريف الإسلام وأركانه',
      content: `# الإسلام وأركانه

## تعريف الإسلام
الإسلام هو الاستسلام لله بالتوحيد، والانقياد له بالطاعة، والبراءة من الشرك وأهله.

## أركان الإسلام
1. الشهادتان: شهادة أن لا إله إلا الله وأن محمداً رسول الله
2. إقام الصلاة
3. إيتاء الزكاة
4. صوم رمضان
5. حج البيت لمن استطاع إليه سبيلا`
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeMessage = async (message: Message, text: string) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, typedText: currentText, isTyping: true }
            : msg
        )
      );
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, text, typedText: text, isTyping: false }
          : msg
      )
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      const newMessage: Message = {
        id: Date.now().toString(),
        text: `تم رفع الملفات: ${fileNames}`,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
    }
  };

  const getAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are an AI assistant for Arabs and Muslims. Please provide a detailed, accurate response in Arabic to the following question. If the question involves Islamic topics, include relevant Quran verses, Hadith, or scholarly references. Format the response professionally with proper punctuation (commas, periods, question marks) and use Markdown-style formatting with headings (#, ##, ###) and blockquotes (>) where appropriate.

Question: ${userMessage}

Please structure your response as follows:
1. Main heading (# Main Topic)
2. Subheadings (## Subtopic) for different aspects
3. Further subdivisions (### Details) if needed
4. Use blockquotes (>) for important quotes or references
5. If applicable, include a "References/المراجع" section with:
   - Relevant Quran verses
   - Authentic Hadith
   - Scholarly opinions
   - Other credible sources

If the question is "How can you help me?" or similar, introduce yourself as:
"مرحباً بك! أنا مساعد ذكي تم تطويري بواسطة محمد مجدي العلياني، وأنا هنا لمساعدتك في مختلف المجالات. يمكنني الإجابة على أسئلتك المتعلقة بالدين الإسلامي، والثقافة العربية، والعلوم، والتكنولوجيا، وغيرها من المواضيع."`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ في معالجة طلبك';

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        typedText: '',
        isTyping: true
      };

      setMessages(prev => [...prev, aiMessage]);
      await typeMessage(aiMessage, aiResponse);

      if (currentChat) {
        const updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, aiMessage]
        };
        setCurrentChat(updatedChat);
        setChats(prev => prev.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        ));
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    if (!currentChat) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: inputMessage.slice(0, 30) + (inputMessage.length > 30 ? '...' : ''),
        messages: [newMessage],
        timestamp: new Date(),
      };
      setCurrentChat(newChat);
      setChats(prev => [newChat, ...prev]);
    } else {
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, newMessage]
      };
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
    }

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    await getAIResponse(inputMessage);
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
    setSidebarOpen(false);
  };

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const formatMessage = (text: string) => {
    const sections = text.split(/^(#+ .*$)/gm);
    return sections.map((section, index) => {
      if (section.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{section.replace('# ', '')}</h1>;
      } else if (section.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mb-3 mt-5">{section.replace('## ', '')}</h2>;
      } else if (section.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mb-2 mt-4">{section.replace('### ', '')}</h3>;
      } else if (section.startsWith('> ')) {
        return (
          <blockquote key={index} className="my-4 p-4 bg-gray-50 dark:bg-gray-700 border-r-4 border-emerald-500 rounded-lg shadow-sm">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="flex-1">
                {section.replace('> ', '')}
              </div>
            </div>
          </blockquote>
        );
      } else {
        return <p key={index} className="mb-4 leading-relaxed">{section}</p>;
      }
    });
  };

  const PrivacyPolicy = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showPrivacyPolicy ? 'animate-fadeIn' : 'hidden'}`}>
      <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl mx-4 rounded-lg shadow-xl overflow-hidden transform transition-all ${showPrivacyPolicy ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-arabic">سياسة الخصوصية</h2>
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 font-arabic text-right">
            <h3 className="text-xl font-bold">جمع المعلومات</h3>
            <p>نحن نجمع المعلومات التي تقدمها مباشرة عند استخدام خدماتنا.</p>
            
            <h3 className="text-xl font-bold">استخدام المعلومات</h3>
            <p>نستخدم المعلومات التي نجمعها لتقديم وتحسين خدماتنا وتجربة المستخدم.</p>
            
            <h3 className="text-xl font-bold">حماية المعلومات</h3>
            <p>نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به.</p>
            
            <h3 className="text-xl font-bold">مشاركة المعلومات</h3>
            <p>لا نشارك معلوماتك الشخصية مع أي طرف ثالث دون موافقتك.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const AboutUs = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showAboutUs ? 'animate-fadeIn' : 'hidden'}`}>
      <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl mx-4 rounded-lg shadow-xl overflow-hidden transform transition-all ${showAboutUs ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-arabic">من نحن</h2>
            <button
              onClick={() => setShowAboutUs(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 font-arabic text-right">
            <p className="leading-relaxed">
              نحن نقدم خدمة ذكاء اصطناعي متخصصة للعرب والمسلمين، مصممة خصيصاً لتلبية احتياجاتهم وتقديم إجابات دقيقة ومفيدة في مختلف المجالات، مع التركيز على الثقافة العربية والإسلامية.
            </p>
            <h3 className="text-xl font-bold">رؤيتنا</h3>
            <p>أن نكون المنصة الرائدة في تقديم حلول الذكاء الاصطناعي المتوافقة مع القيم العربية والإسلامية.</p>
            <h3 className="text-xl font-bold">مهمتنا</h3>
            <p>تقديم خدمة موثوقة وسهلة الاستخدام تساعد المستخدمين في الحصول على إجابات دقيقة ومفيدة.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const IslamicCourse = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showIslamicCourse ? 'animate-fadeIn' : 'hidden'}`}>
      <div className={`bg-white dark:bg-gray-800 w-full h-full md:h-[90vh] md:w-[90vw] mx-4 rounded-lg shadow-xl overflow-hidden transform transition-all ${showIslamicCourse ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold font-arabic">سنة أولى إسلام</h2>
            <button
              onClick={() => setShowIslamicCourse(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
              <nav className="p-4 space-y-2">
                {islamicCourseSections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-arabic text-right"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {islamicCourseSections.map(section => (
                <div key={section.id} id={section.id} className="mb-8">
                  {formatMessage(section.content)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Modals */}
      <PrivacyPolicy />
      <AboutUs />
      <IslamicCourse />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 md:w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-30`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-arabic">المحادثات السابقة</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={startNewChat}
              className="w-full mb-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-arabic"
            >
              محادثة جديدة
            </button>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full p-3 text-right rounded-lg transition-colors ${
                    currentChat?.id === chat.id
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } animate-fadeIn`}
                >
                  <p className="font-arabic truncate">{chat.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chat.timestamp.toLocaleDateString('ar-SA')}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer Buttons */}
          <div className="mt-auto p-4 space-y-3">
            <button
              onClick={() => setShowAboutUs(true)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-arabic flex items-center justify-between"
            >
              <span>من نحن</span>
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-arabic flex items-center justify-between"
            >
              <span>سياسة الخصوصية</span>
              <Shield className="w-5 h-5" />
            </button>
            <p className="text-center font-arabic text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
              تم التطوير بواسطة محمد مجدي العلياني
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md z-20`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowIslamicCourse(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Book className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold">
                <span className="font-mono">AI</span>
                <span className="font-arabic"> العرب والمسلمين</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} 
              transition-all duration-300 hover:scale-110`}
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 font-arabic">
                <span className="font-mono">AI</span>
                <span className="font-arabic"> العرب والمسلمين</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-arabic">
                مرحباً بكم في أول برنامج ذكاء اصطناعي عربي للعرب والمسلمين
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : darkMode
                      ? 'bg-gray-800'
                      : 'bg-white shadow-md'
                  }`}
                >
                  <div className="text-right font-arabic whitespace-pre-wrap">
                    {message.isTyping 
                      ? message.typedText 
                      : formatMessage(message.text)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && !messages[messages.length - 1]?.isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className={`rounded-2xl px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={`fixed bottom-0 w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالتك هنا..."
              className={`flex-1 p-2 rounded-full ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500 font-arabic text-right`}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;