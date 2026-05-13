import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AppFooter from "../components/layout/AppFooter";
import LoadingSpinner from "../components/LoadingSpinner";
import { getRecommendedAnimals } from "../api/animals";
import { sendChatMessage } from "../api/chatbot";
import {
  fetchShelterCount,
  fetchThisYearRescueCount,
} from "../api/abandonmentStats";
import { useAuth } from "../context/AuthContext";
import { useAdoptions } from "../context/AdoptionContext";
import { useAnimals } from "../context/AnimalContext";
import { getAnimalSexLabel } from "../animalSex";

const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "안녕하세요! 입양 절차, 동물 추천, 보호소 방문 준비처럼 입양과 관련된 질문을 도와드릴게요.\n\n입양과 관련 없는 질문은 정확한 답변이 어려울 수 있고, 이전 대화를 기억해 이어서 답변하지는 못해요. 궁금한 내용을 한 문장에 같이 적어주세요.",
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatStatNumber = (value) => (
  typeof value === "number" ? value.toLocaleString("ko-KR") : "-"
);

function ConcentricLoader({ className = "" }) {
  return (
    <span
      className={`relative inline-flex h-12 w-12 items-center justify-center ${className}`}
      aria-label="데이터 로딩 중"
      role="status"
    >
      <span className="absolute h-12 w-12 animate-spin rounded-full border-4 border-current/20 border-t-current" />
    </span>
  );
}

const getAdoptionAnimalId = (adoption) => {
  const animalId = adoption?.animalId ?? adoption?.animal_id;
  return animalId === undefined || animalId === null || animalId === ""
    ? null
    : Number(animalId);
};

const getAdoptionImageSrc = (adoption, cachedImageSrc) => (
  cachedImageSrc ||
  adoption?.thumbnailImageUrl ||
  adoption?.thumbnail_image_url ||
  adoption?.imageUrl ||
  adoption?.image_url ||
  adoption?.animalImageUrl ||
  adoption?.animal_image_url ||
  null
);

const normalizeAnimalImage = (image) => {
  if (typeof image === "string") {
    return {
      imageUrl: image,
      isAiImage: false,
    };
  }

  return {
    imageUrl: image?.imageUrl ?? image?.image_url ?? image?.url ?? image?.fileUrl ?? image?.src ?? null,
    isAiImage: Boolean(image?.is_ai_image ?? image?.isAiImage),
  };
};

const getEmbeddedAnimalImageSrc = (animal) => {
  const imageList = [
    ...(Array.isArray(animal?.images) ? animal.images : []),
    ...(Array.isArray(animal?.imageUrls) ? animal.imageUrls : []),
    ...(Array.isArray(animal?.animalImages) ? animal.animalImages : []),
  ]
    .map(normalizeAnimalImage)
    .filter((image) => image.imageUrl);

  return (
    imageList.find((image) => image.isAiImage)?.imageUrl ||
    imageList[0]?.imageUrl ||
    null
  );
};

const getAnimalImageSrc = (animal, cachedImageSrc) => (
  cachedImageSrc ||
  getEmbeddedAnimalImageSrc(animal) ||
  animal?.thumbnailImageUrl ||
  animal?.thumbnail_image_url ||
  animal?.imageUrl ||
  animal?.image_url ||
  null
);

const getAnimalAgeText = (animalAge) => {
  const birthYear = Number(animalAge);

  if (!birthYear || Number.isNaN(birthYear)) {
    return "";
  }

  const age = new Date().getFullYear() - birthYear;
  return age > 0 ? `${age}살` : "1살 미만";
};

const getRecommendedAnimalsFromResponse = (data) => (
  Array.isArray(data?.animals) ? data.animals : []
);

const toRecommendedAnimalCacheItem = (animal) => ({
  ...animal,
  thumbnailImageUrl: getAnimalImageSrc(animal),
});

const toRecommendedCard = (animal, index, cachedImageSrc) => {
  const ageText = getAnimalAgeText(animal.animalAge);
  const sexText = getAnimalSexLabel(animal.animalSex ?? animal.animal_sex ?? animal.animlSex);

  return {
    animalId: animal.animalId,
    title: `${animal.species || "동물"}`,
    breed: [ageText, sexText].filter(Boolean).join(" • "),
    match: Math.max(91, 98 - index * 4),
    src: getAnimalImageSrc(animal, cachedImageSrc),
    offset: index === 1,
  };
};

function RecommendedCardImage({ src, title }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgLoaded(false);
    if (imgRef.current?.complete) setImgLoaded(true);
  }, [src]);

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-container-high">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 animate-pulse">pets</span>
      </div>
    );
  }

  return (
    <>
      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-high">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 animate-pulse">pets</span>
        </div>
      )}
      <img
        ref={imgRef}
        alt={`${title} 사진`}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? '' : 'opacity-0'}`}
        src={src}
        onLoad={() => setImgLoaded(true)}
      />
    </>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { accessToken, username } = useAuth();
  const { adoptions, loading: adoptionsLoading, error: adoptionsError } = useAdoptions();
  const { cacheAnimals, imagesByAnimalId } = useAnimals();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatLoadingDotCount, setChatLoadingDotCount] = useState(0);
  const [chatSize, setChatSize] = useState({ width: 384, height: 448 });
  const [recommendedAnimals, setRecommendedAnimals] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("overview");
  const [rescueCount, setRescueCount] = useState(null);
  const [shelterCount, setShelterCount] = useState(null);
  const [isRescueCountLoading, setIsRescueCountLoading] = useState(true);
  const [isShelterCountLoading, setIsShelterCountLoading] = useState(true);
  const overviewSectionRef = useRef(null);
  const matchesSectionRef = useRef(null);
  const adoptionSectionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const chatResizeRef = useRef(null);
  const sidebarRef = useRef(null);
  const footerRef = useRef(null);

  const adoptionCarouselAnimals = useMemo(() => (
    adoptions
      .map((adoption) => {
        const animalId = getAdoptionAnimalId(adoption);
        if (!animalId || Number.isNaN(animalId)) {
          return null;
        }

        return {
          animalId,
          species: adoption.animalSpecies || "",
          imageSrc: getAdoptionImageSrc(adoption, imagesByAnimalId[animalId]),
        };
      })
      .filter(Boolean)
  ), [adoptions, imagesByAnimalId]);

  const recommendedCards = useMemo(() => (
    recommendedAnimals.map((animal, index) => (
      toRecommendedCard(animal, index, imagesByAnimalId[animal.animalId])
    ))
  ), [imagesByAnimalId, recommendedAnimals]);

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading, isChatOpen]);

  useEffect(() => {
    if (!isChatLoading) {
      setChatLoadingDotCount(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setChatLoadingDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isChatLoading]);

  useEffect(() => {
    if (!accessToken) {
      setRecommendedAnimals([]);
      setRecommendationsError("");
      setIsRecommendationsLoading(false);
      return;
    }

    let isMounted = true;

    const loadRecommendations = async () => {
      setIsRecommendationsLoading(true);
      setRecommendationsError("");

      try {
        const data = await getRecommendedAnimals(accessToken);
        const animals = getRecommendedAnimalsFromResponse(data);
        const cacheItems = animals.map(toRecommendedAnimalCacheItem);

        if (isMounted) {
          setRecommendedAnimals(animals);
          cacheAnimals(cacheItems);
        }
      } catch (error) {
        console.error("[HomePage] getRecommendedAnimals error:", error);
        if (isMounted) {
          setRecommendedAnimals([]);
          setRecommendationsError("추천 동물을 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsRecommendationsLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [accessToken, cacheAnimals]);

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

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setIsRescueCountLoading(true);
      setIsShelterCountLoading(true);

      const [rescueResult, shelterResult] = await Promise.allSettled([
        fetchThisYearRescueCount(),
        fetchShelterCount(),
      ]);

      if (!isMounted) {
        return;
      }

      if (rescueResult.status === "fulfilled") {
        setRescueCount(rescueResult.value);
      } else {
        console.error("[HomePage] fetchThisYearRescueCount error:", rescueResult.reason);
        setRescueCount(null);
      }

      if (shelterResult.status === "fulfilled") {
        setShelterCount(shelterResult.value);
      } else {
        console.error("[HomePage] fetchShelterCount error:", shelterResult.reason);
        setShelterCount(null);
      }

      setIsRescueCountLoading(false);
      setIsShelterCountLoading(false);
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    const sections = [
      { item: "overview", ref: overviewSectionRef },
      { item: "matches", ref: matchesSectionRef },
      { item: "adoptions", ref: adoptionSectionRef },
    ];

    const updateActiveSidebarItem = () => {
      const activationLine = 140;
      const activeSection = sections.reduce((current, section) => {
        const element = section.ref.current;

        if (!element) {
          return current;
        }

        const top = element.getBoundingClientRect().top;

        if (top <= activationLine) {
          return { item: section.item, top };
        }

        return current;
      }, sections[0]);

      setActiveSidebarItem(activeSection.item);
    };

    updateActiveSidebarItem();
    window.addEventListener("scroll", updateActiveSidebarItem, { passive: true });
    window.addEventListener("resize", updateActiveSidebarItem);

    return () => {
      window.removeEventListener("scroll", updateActiveSidebarItem);
      window.removeEventListener("resize", updateActiveSidebarItem);
    };
  }, []);

  useEffect(() => {
    const navbarHeight = 80;
    const minSidebarHeight = 320;

    const updateSidebarHeight = () => {
      if (!sidebarRef.current) {
        return;
      }

      const footerTop = footerRef.current?.getBoundingClientRect().top ?? window.innerHeight;
      const viewportSidebarHeight = window.innerHeight - navbarHeight;
      const availableHeight = footerTop - navbarHeight;
      const nextHeight = Math.max(
        minSidebarHeight,
        Math.min(viewportSidebarHeight, availableHeight),
      );

      sidebarRef.current.style.height = `${nextHeight}px`;
    };

    updateSidebarHeight();
    window.addEventListener("scroll", updateSidebarHeight, { passive: true });
    window.addEventListener("resize", updateSidebarHeight);

    return () => {
      window.removeEventListener("scroll", updateSidebarHeight);
      window.removeEventListener("resize", updateSidebarHeight);
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

  const getSidebarButtonClass = (item) => (
    activeSidebarItem === item
      ? "flex w-full items-center gap-3 py-3 px-6 bg-white text-[#8e4e14] rounded-l-full shadow-sm transition-all duration-200"
      : "flex w-full items-center gap-3 py-3 px-6 text-[#534439] hover:bg-white/50 hover:translate-x-1 rounded-l-full transition-all duration-200"
  );

  const scrollToSection = (sectionRef, item) => {
    setActiveSidebarItem(item);
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

    if (!accessToken) {
      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now(),
          sender: "bot",
          text: "로그인 후 챗봇을 이용할 수 있습니다.",
        },
      ]);
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
      const data = await sendChatMessage(accessToken, trimmedMessage);
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
      <Navbar />

      <div className="pt-20 grid grid-cols-1 lg:grid-cols-[256px_1fr]">
        {/* 사이드NavBar */}
        <aside
          ref={sidebarRef}
          className="hidden lg:sticky lg:top-20 lg:flex flex-col py-8 pl-4 self-start overflow-hidden bg-[#edf4ff] rounded-r-[1.5rem]"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="px-4 mb-10">
            <h3 className="text-xl font-bold text-on-surface font-headline">
              메뉴
            </h3>
          </div>
          <nav className="space-y-2">
            <button
              type="button"
              className={getSidebarButtonClass("overview")}
              onClick={() => scrollToSection(overviewSectionRef, "overview")}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                space_dashboard
              </span>
              <span className="font-medium">개요</span>
            </button>
            <button
              type="button"
              className={getSidebarButtonClass("matches")}
              onClick={() => scrollToSection(matchesSectionRef, "matches")}
            >
              <span className="material-symbols-outlined">search</span>
              <span className="font-medium">나의 매칭 현황</span>
            </button>
            <button
              type="button"
              className={getSidebarButtonClass("adoptions")}
              onClick={() => scrollToSection(adoptionSectionRef, "adoptions")}
            >
              <span className="material-symbols-outlined">contact_support</span>
              <span className="font-medium">입양 문의 중</span>
            </button>
          </nav>
          <div className="px-4 mt-auto">
            <button
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:scale-95 transition-all shadow-lg shadow-primary/20"
              onClick={() => navigate('/preferences')}
            >
              설문 작성
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="px-8 py-8 lg:px-12 max-w-7xl mx-auto overflow-hidden w-full">
          {/* Hero */}
          <section ref={overviewSectionRef} className="mb-12 scroll-mt-28">
            <h1 className="text-5xl font-extrabold text-on-background mb-2 tracking-tight font-headline">
              환영해요 {username || "예비 입양자"}님!
            </h1>
            <p className="pt-2 text-on-surface-variant text-lg">
              모든 동물을 위해 All4Animal이 함께합니다.
            </p>
          </section>

          {/* 전국 구조 현황 Bento */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <div className="md:col-span-2 bg-surface-container-high rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-tertiary font-bold text-sm mb-2">전국</h3>
                <h2 className="text-4xl font-bold text-on-background mb-6">
                  구조 현황
                </h2>
                <div className="flex items-end gap-2 text-primary">
                  <span className="flex min-h-[4.5rem] min-w-28 items-center text-6xl font-black">
                    {isRescueCountLoading ? (
                      <ConcentricLoader />
                    ) : (
                      formatStatNumber(rescueCount)
                    )}
                  </span>
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
                  이번 달 입양 연결 건수
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-on-surface">0</span>
                  <div className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">
                      trending_up
                    </span>
                    +0%
                  </div>
                </div>
              </div>
              <div className="bg-primary rounded-[1.5rem] p-6 text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-center">
                <span className="text-on-primary/70 font-bold text-sm uppercase tracking-widest mb-1">
                  전국 보호소 수
                </span>
                <div className="flex items-center justify-between">
                  <span className="flex min-h-12 min-w-20 items-center text-4xl font-bold">
                    {isShelterCountLoading ? (
                      <ConcentricLoader className="scale-75 text-on-primary" />
                    ) : (
                      formatStatNumber(shelterCount)
                    )}
                  </span>
                  <span className="material-symbols-outlined text-4xl opacity-50">
                    home_work
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Top Matches */}
          <section ref={matchesSectionRef} className="mb-24 scroll-mt-28">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-on-background font-headline">
                  당신과 찰떡인 아이들
                </h2>
                <p className="pt-2 text-on-surface-variant">
                  All4Animal만의 매칭 알고리즘으로 당신과 가장 잘 맞는 아이들을 소개해드립니다.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedCards.map((card, index) => (
                <button
                  key={card.animalId}
                  className={`group cursor-pointer block text-left w-full${card.offset ? " md:-mt-6" : ""}`}
                  onClick={() => navigate(`/animals/${card.animalId}`, { state: { recommendationRank: index + 1 } })}
                  aria-label={`동물 ${card.animalId} 상세페이지로 이동`}
                >
                  <div className="relative mb-4 rounded-[1.5rem] overflow-hidden aspect-[4/5]">
                    <RecommendedCardImage src={card.src} title={card.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className={`${['rank-badge', 'rank-badge-silver', 'rank-badge-bronze'][index]} absolute top-4 left-4 inline-flex items-center px-4 py-1.5 rounded-full text-black font-bold text-sm shadow-xl ring-4 ring-white/20`}>
                      {index + 1}순위 적합
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{card.title}</h3>
                      <p className="text-sm opacity-90">{card.breed}</p>
                    </div>
                  </div>
                </button>
              ))}
              {isRecommendationsLoading && (
                <div className="col-span-full flex min-h-64 items-center justify-center text-primary">
                  <ConcentricLoader />
                </div>
              )}
              {!isRecommendationsLoading && recommendedCards.length === 0 && (
                <div className="col-span-full rounded-2xl bg-surface-container-low px-6 py-8 text-center text-on-surface-variant">
                  {recommendationsError || "추천 동물이 아직 없습니다."}
                </div>
              )}
            </div>
          </section>

          {/* 입양 문의 중 Carousel */}
          <section ref={adoptionSectionRef} className="mb-40 scroll-mt-28">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-bold text-on-background font-headline">
                  입양 문의 중
                </h2>
                <div className="h-[1px] flex-1 bg-outline-variant opacity-20" />
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {adoptionCarouselAnimals.map((animal) => (
                <button
                  key={animal.animalId}
                  className="flex-shrink-0 w-48 group block text-center"
                  onClick={() => navigate(`/animals/${animal.animalId}`)}
                  aria-label={`동물 ${animal.animalId} 상세페이지로 이동`}
                >
                  <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 transition-transform group-hover:scale-105 bg-surface-container-high">
                    {animal.imageSrc ? (
                      <img
                        alt={`동물 ${animal.animalId}`}
                        className="w-full h-full object-cover"
                        src={animal.imageSrc}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-5xl">
                          pets
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-on-surface">
                    {animal.species || "동물"}
                  </p>
                </button>
              ))}
              {adoptionsLoading && (
                <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                  <LoadingSpinner size="md" />
                </div>
              )}
              {!adoptionsLoading && adoptionCarouselAnimals.length === 0 && (
                <div className="w-full rounded-2xl bg-surface-container-low px-6 py-8 text-center text-on-surface-variant">
                  {adoptionsError || "아직 입양 문의 중인 동물이 없습니다."}
                </div>
              )}
            </div>
          </section>
        </main>
        <div ref={footerRef} className="col-span-full relative z-10">
          <AppFooter />
        </div>
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
                  답변을 작성하는 중
                  <span className="inline-block w-4">
                    {".".repeat(chatLoadingDotCount)}
                  </span>
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

    </div>
  );
}

export default HomePage;
