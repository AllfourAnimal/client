import { useEffect, useRef, useState } from "react";
import Navbar from "../components/layout/Navbar";
import AppFooter from "../components/layout/AppFooter";
import { sendChatMessage } from "../api/chatbot";

const MATCH_CARDS = [
  {
    name: "모승",
    breed: "Beagle • 2 years",
    match: 98,
    src: "https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/6P0U/image/1OWftaQcOlM1040OyU83hKxBmgs",
    offset: false,
  },
  {
    name: "똘똘",
    breed: "Corgi • 1 year",
    match: 94,
    src: "https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/722/2d9606f443d27267e4d45b15e624e9ed_res.jpeg",
    offset: true,
  },
  {
    name: "공주",
    breed: "Golden Retriever • 4 months",
    match: 91,
    src: "https://storage.enuri.info/pic_upload/knowbox2/202402/03494830920240229230d567a-153b-4806-8cc9-defc73434507.jpg",
    offset: false,
  },
];

const SAVED_ANIMALS = [
  {
    name: "모승",
    src: "https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/6P0U/image/1OWftaQcOlM1040OyU83hKxBmgs",
  },
  {
    name: "똘똘",
    src: "https://d2u3dcdbebyaiu.cloudfront.net/uploads/atch_img/722/2d9606f443d27267e4d45b15e624e9ed_res.jpeg",
  },
  {
    name: "메롱",
    src: "https://mblogthumb-phinf.pstatic.net/MjAyMjExMDRfNTQg/MDAxNjY3NTM1MjUwMTM5.UbGKNsQspu-mN4M3husNKIkqrjxTZVqDz495I1sOHxYg.mQRYtPom0sUssuJaI2SpRBwyTgMMxm-267qxjZq4jGQg.JPEG.babion_1/4.jpg?type=w800",
  },
  {
    name: "윙크",
    src: "https://img1.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202105/25/holapet/20210525051114398gyiz.jpg",
  },
];

const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "안녕하세요! 입양 절차, 동물 추천, 보호소 방문 준비처럼 입양과 관련된 질문을 도와드릴게요.\n\n입양과 관련 없는 질문은 정확한 답변이 어려울 수 있고, 이전 대화를 기억해 이어서 답변하지는 못해요. 궁금한 내용을 한 문장에 같이 적어주세요.",
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function HomePage({
  onNavigateAnimalList,
  onNavigatePreferences,
  onNavigateAnimalDetails,
  onNavigateProfile,
  onNavigateReviews,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 384, height: 448 });
  const chatBottomRef = useRef(null);
  const chatResizeRef = useRef(null);

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading, isChatOpen]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!chatResizeRef.current) {
        return;
      }

      const { startX, startY, startWidth, startHeight } = chatResizeRef.current;
      const maxWidth = window.innerWidth - 48;
      const maxHeight = window.innerHeight - 128;

      setChatSize({
        width: clamp(startWidth + startX - event.clientX, 320, maxWidth),
        height: clamp(startHeight + startY - event.clientY, 384, maxHeight),
      });
    };

    const handlePointerUp = () => {
      chatResizeRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleChatResizeStart = (event) => {
    event.preventDefault();
    chatResizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };
  };

  const getBotReplyText = (data) => {
    if (typeof data === "string") {
      return data;
    }

    return (
      data?.answer ||
      data?.message ||
      data?.reply ||
      data?.response ||
      "답변을 받았지만 표시할 내용이 없습니다."
    );
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = chatMessage.trim();

    if (!trimmedMessage || isChatLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setChatMessages((messages) => [...messages, userMessage]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const data = await sendChatMessage(trimmedMessage);
      const botReply = getBotReplyText(data);

      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (error) {
      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 1,
          sender: "bot",
          text:
            error.response?.data?.message ||
            error.message ||
            "챗봇 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body">
      <Navbar
        activePage="home"
        isCurrentPage
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <div className="flex pt-20">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-64 bg-[#edf4ff] rounded-r-[1.5rem] py-8 pl-4 sticky top-20">
          <div className="px-4 mb-10">
            <h3 className="text-xl font-bold text-on-surface font-headline">
              메뉴
            </h3>
          </div>
          <nav className="flex-1 space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 bg-white text-[#8e4e14] rounded-l-full shadow-sm transition-transform duration-200"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                dashboard
              </span>
              <span className="font-medium">개요</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 text-[#534439] hover:bg-white/50 hover:translate-x-1 rounded-l-full transition-all duration-200"
            >
              <span className="material-symbols-outlined">favorite</span>
              <span className="font-medium">나의 매칭 현황</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 py-3 px-6 text-[#534439] hover:bg-white/50 hover:translate-x-1 rounded-l-full transition-all duration-200"
            >
              <span className="material-symbols-outlined">bookmark</span>
              <span className="font-medium">찜한 동물</span>
            </a>
          </nav>
          <div className="px-4 mt-auto">
            <button
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:scale-95 transition-all shadow-lg shadow-primary/20"
              onClick={onNavigatePreferences}
            >
              설문 작성
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">
          {/* Hero */}
          <section className="mb-12">
            <h1 className="text-5xl font-extrabold text-on-background mb-2 tracking-tight font-headline">
              환영해요 예비 입양자님!
            </h1>
            <p className="text-on-surface-variant text-lg">
              캐치프레이즈 적으면 좋을 듯
            </p>
          </section>

          {/* 전국 구조 현황 Bento */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-2 bg-surface-container-high rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-tertiary font-bold text-sm mb-2">전국</h3>
                <h2 className="text-4xl font-bold text-on-background mb-6">
                  구조 현황
                </h2>
                <div className="flex items-end gap-2 text-primary">
                  <span className="text-6xl font-black">12.4k</span>
                  <span className="text-lg font-semibold mb-2">
                    올해 구조된 생명
                  </span>
                </div>
              </div>
              <div className="mt-8 h-32 flex items-end gap-1 relative z-10">
                <div className="w-full bg-primary-container h-1/2 rounded-t-lg group-hover:h-3/4 transition-all duration-500" />
                <div className="w-full bg-primary h-3/4 rounded-t-lg group-hover:h-1/2 transition-all duration-500" />
                <div className="w-full bg-primary-container h-2/3 rounded-t-lg group-hover:h-full transition-all duration-500" />
                <div className="w-full bg-primary h-1/2 rounded-t-lg group-hover:h-2/3 transition-all duration-500" />
                <div className="w-full bg-primary-container h-3/4 rounded-t-lg group-hover:h-1/2 transition-all duration-500" />
                <div className="w-full bg-primary h-full rounded-t-lg group-hover:h-3/4 transition-all duration-500" />
              </div>
              <div className="absolute -right-10 -bottom-10 text-[200px] text-primary/5 material-symbols-outlined rotate-12 select-none">
                analytics
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-tertiary font-bold text-sm uppercase tracking-widest mb-1">
                  이번 달 입양 건수
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-on-surface">28</span>
                  <div className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">
                      trending_up
                    </span>
                    +12%
                  </div>
                </div>
              </div>
              <div className="bg-primary rounded-[1.5rem] p-6 text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-center">
                <span className="text-on-primary/70 font-bold text-sm uppercase tracking-widest mb-1">
                  봉사 활동 건수
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">42</span>
                  <span className="material-symbols-outlined text-4xl opacity-50">
                    volunteer_activism
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Top Matches */}
          <section className="mb-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-on-background font-headline">
                  Top Matches for You
                </h2>
                <p className="text-on-surface-variant">
                  Personalized based on your lifestyle and preferences
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MATCH_CARDS.map((card) => (
                <button
                  key={card.name}
                  className={`group cursor-pointer block text-left w-full${card.offset ? " md:-mt-6" : ""}`}
                  onClick={() => onNavigateAnimalDetails(card.name)}
                >
                  <div className="relative mb-4 rounded-[1.5rem] overflow-hidden aspect-[4/5]">
                    <img
                      alt="pet photo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={card.src}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold text-xs">
                      {card.match}% Match
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{card.name}</h3>
                      <p className="text-sm opacity-90">{card.breed}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 찜한 동물 Carousel */}
          <section className="mb-20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-bold text-on-background font-headline">
                  찜한 동물
                </h2>
                <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
              </div>
              <button
                className="text-primary font-bold flex items-center gap-2 hover:underline ml-4"
                onClick={onNavigateAnimalList}
              >
                전체 보기
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {SAVED_ANIMALS.map((animal) => (
                <button
                  key={animal.name}
                  className="flex-shrink-0 w-48 group block"
                  onClick={() => onNavigateAnimalDetails(animal.name)}
                >
                  <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 transition-transform group-hover:scale-105">
                    <img
                      alt="animal"
                      className="w-full h-full object-cover"
                      src={animal.src}
                    />
                  </div>
                  <p className="text-center font-bold text-on-surface">
                    {animal.name}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
        {isChatOpen && (
          <section
            className="relative flex min-h-[24rem] min-w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 flex-col"
            style={{ width: chatSize.width, height: chatSize.height }}
          >
            <button
              type="button"
              className="absolute left-2 top-2 z-10 grid h-7 w-7 cursor-nwse-resize place-items-center rounded-full bg-white/90 text-primary shadow-sm ring-1 ring-black/10 hover:bg-white"
              onPointerDown={handleChatResizeStart}
              aria-label="채팅창 크기 조절"
            >
              <span className="material-symbols-outlined text-lg rotate-90">
                open_in_full
              </span>
            </button>

            <header className="flex items-center justify-between bg-primary px-5 py-4 pl-12 text-on-primary">
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  smart_toy
                </span>
                <div>
                  <h2 className="text-base font-bold">AI 펫봇</h2>
                  <p className="text-xs text-on-primary/75">
                    입양 관련 질문을 물어보세요
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15"
                onClick={() => setIsChatOpen(false)}
                aria-label="채팅 닫기"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-container-low px-5 py-5">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.sender === "user"
                      ? "ml-auto w-fit max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-on-primary shadow-sm"
                      : "w-fit max-w-[82%] whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-on-surface shadow-sm"
                  }
                >
                  {message.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="w-fit max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-on-surface-variant shadow-sm">
                  답변을 작성하는 중...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form
              className="flex items-center gap-2 border-t border-outline-variant/40 bg-white p-3"
              onSubmit={handleChatSubmit}
            >
              <input
                className="min-w-0 flex-1 rounded-full border border-outline-variant px-4 py-3 text-sm outline-none focus:border-primary"
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="메시지를 입력하세요"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-primary text-on-primary disabled:opacity-40"
                disabled={!chatMessage.trim() || isChatLoading}
                aria-label="메시지 보내기"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </section>
        )}

        <button
          type="button"
          className="flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 group"
          onClick={() => setIsChatOpen((isOpen) => !isOpen)}
          aria-expanded={isChatOpen}
          aria-label="AI 펫봇 채팅 열기"
        >
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {isChatOpen ? "close" : "smart_toy"}
          </span>
          <span className="font-bold">
            {isChatOpen ? "채팅 닫기" : "AI 펫봇 채팅"}
          </span>
        </button>
      </div>

      <AppFooter />
    </div>
  );
}

export default HomePage;
