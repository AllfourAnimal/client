import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import AppFooter from "../components/layout/AppFooter";
import { useAuth } from "../context/AuthContext";
import { fetchProfile, updateProfile } from "../api/profile";
import { getPreferences } from "../api/preferences";

const EMPTY_EDIT_FORM = {
  location: "",
  housingType: "",
  emptyTime: "",
  isExperience: true,
};

const HOUSING_OPTIONS = [
  { value: "APARTMENT_VILLA", label: "아파트/빌라" },
  { value: "DETACHED_HOUSE", label: "단독주택" },
  { value: "HOUSE_WITH_YARD", label: "마당이 있는 집" },
];

const SURVEY_LABELS = {
  animalType: {
    DOG: "강아지",
    CAT: "고양이",
    ANY: "상관없음",
  },
  size: {
    SMALL: "소형",
    MEDIUM: "중형",
    LARGE: "대형",
    ANY: "상관없음",
  },
  gender: {
    MALE: "수컷",
    FEMALE: "암컷",
    ANY: "상관없음",
  },
  age: {
    YOUNG: "어린 개체",
    ADULT: "성체",
    OLD: "노령 개체",
    ANY: "상관없음",
  },
  personalities: {
    people_friendly: "사람을 좋아함",
    active_playful: "밝고 활기참",
    calm_quiet: "차분하고 편안함",
    adaptable: "새로운 환경에 잘 적응",
    outdoor_activity: "운동과 활동을 좋아함",
    animal_friendly: "다른 동물과 잘 지냄",
    beginner_possible: "반려동물 경험이 없는 보호자도 함께할 수 있음",
    family_friendly: "가족과 함께 지내기 좋음",
    slow_bonding_ok: "기다려주면 다가옴",
  },
};

function ProfileMenuItem({ icon, label, active, onClick }) {
  return (
    <button
      className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all ${active
          ? "translate-x-1 bg-white text-[#8e4e14] shadow-sm"
          : "text-[#534439] hover:bg-white/60"
        }`}
      onClick={onClick}
      type="button"
    >
      <span
        className="material-symbols-outlined text-3xl"
        style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
      >
        {icon}
      </span>
      <span className="text-lg font-bold">{label}</span>
    </button>
  );
}

function ProfileField({
  label,
  value,
  wide,
  editable,
  editMode,
  type = "text",
  name,
  onChange,
}) {
  const disabled = !editable || !editMode;

  return (
    <label className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <span className="ml-1 block text-sm font-bold text-[#534439]/60">
        {label}
      </span>
      <input
        className={`w-full rounded-2xl border-none px-5 py-4 text-lg font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-[#f4a261] ${disabled
            ? "cursor-not-allowed bg-[#e8f0fb] text-[#534439]/50"
            : "bg-white text-[#091d2e]"
          }`}
        disabled={disabled}
        name={name}
        onChange={onChange}
        readOnly={disabled}
        type={type}
        value={value}
      />
    </label>
  );
}

function HousingSelect({ value, editMode, onChange }) {
  return (
    <label className="space-y-2">
      <span className="ml-1 block text-sm font-bold text-[#534439]/60">
        주거 형태
      </span>
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-2xl border-none px-5 py-4 text-lg font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-[#f4a261] ${editMode
              ? "bg-white text-[#091d2e]"
              : "cursor-not-allowed bg-[#e8f0fb] text-[#534439]/50"
            }`}
          disabled={!editMode}
          name="housingType"
          onChange={onChange}
          value={value}
        >
          <option value="">주거 형태 선택</option>
          {HOUSING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ExperienceToggle({ value, editMode, onChange }) {
  return (
    <div className="space-y-2 md:col-span-2">
      <span className="ml-1 block text-sm font-bold text-[#534439]/60">
        반려동물 사육 경험 여부
      </span>
      <div className="grid grid-cols-2 rounded-2xl bg-[#e8f0fb] p-2">
        {[
          { value: true, label: "네, 있습니다" },
          { value: false, label: "아니요, 없습니다" },
        ].map((option) => {
          const selected = value === option.value;
          return (
            <button
              className={`rounded-xl px-5 py-4 text-lg font-extrabold transition ${selected
                  ? "bg-[#8e4e14] text-white shadow-sm"
                  : "text-[#534439]"
                } ${editMode ? "" : "cursor-not-allowed opacity-60"}`}
              disabled={!editMode}
              key={String(option.value)}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SurveyResultItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[#8e4e14]">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        <span className="text-sm font-extrabold">{label}</span>
      </div>
      <p className="text-xl font-extrabold text-[#091d2e]">{value}</p>
    </div>
  );
}

function normalizePersonalities(personalities) {
  if (Array.isArray(personalities)) {
    return personalities;
  }

  if (typeof personalities === "string") {
    return personalities
      .split(",")
      .map((personality) => personality.trim())
      .filter(Boolean);
  }

  return [];
}

function ProfilePage({
  onNavigateHome,
  onNavigateAnimalList,
  onNavigateReviews,
  onNavigatePreferences,
  onNavigateProfile,
}) {
  const { accessToken, username } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [preference, setPreference] = useState(null);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(false);
  const [preferenceError, setPreferenceError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileError("");

      try {
        const data = await fetchProfile(accessToken);
        if (!ignore) {
          setProfile(data);
          setEditForm({
            location: data.location || "",
            housingType: data.housingType || "",
            emptyTime: data.emptyTime ?? "",
            isExperience:
              typeof data.isExperience === "boolean"
                ? data.isExperience
                : true,
          });
        }
      } catch (error) {
        if (!ignore) {
          setProfileError(
            error.response?.data?.message ||
            error.message ||
            "프로필 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) {
          setIsProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (activeSection !== "survey") {
      return;
    }

    let ignore = false;

    const loadPreference = async () => {
      setIsPreferenceLoading(true);
      setPreferenceError("");

      try {
        const data = await getPreferences(accessToken);
        if (!ignore) {
          setPreference(data || null);
        }
      } catch (error) {
        const status = error.response?.status;
        const hasNoSavedPreference = status === 400 || status === 404;

        if (!ignore) {
          setPreference(null);
          if (!hasNoSavedPreference) {
            setPreferenceError("매칭 설문 결과를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!ignore) {
          setIsPreferenceLoading(false);
        }
      }
    };

    loadPreference();

    return () => {
      ignore = true;
    };
  }, [accessToken, activeSection]);

  const userProfile = profile || {};
  const displayName = userProfile.username || username || "프로필";
  const formatPhone = (phone) =>
    String(phone || "").replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
  const formatValue = (value, suffix = "") =>
    value || value === 0 ? `${value}${suffix}` : "-";
  const formatSurveyValue = (category, value) =>
    value ? SURVEY_LABELS[category]?.[value] || value : "-";
  const personalityValues = normalizePersonalities(preference?.personalities);
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: name === "emptyTime" ? value.replace(/[^\d]/g, "") : value,
    }));
  };

  const handleEditStart = () => {
    setEditForm({
      location: userProfile.location || "",
      housingType: userProfile.housingType || "",
      emptyTime: userProfile.emptyTime ?? "",
      isExperience:
        typeof userProfile.isExperience === "boolean"
          ? userProfile.isExperience
          : true,
    });
    setProfileError("");
    setProfileMessage("");
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    handleEditStart();
    setIsEditing(false);
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const payload = {
        location: editForm.location,
        housingType: editForm.housingType,
        emptyTime: Number(editForm.emptyTime),
        isExperience: editForm.isExperience,
      };
      const updatedProfile = await updateProfile(accessToken, payload);
      const nextProfile = { ...userProfile, ...payload, ...updatedProfile };
      setProfile(nextProfile);
      setEditForm({
        location: nextProfile.location || "",
        housingType: nextProfile.housingType || "",
        emptyTime: nextProfile.emptyTime ?? "",
        isExperience:
          typeof nextProfile.isExperience === "boolean"
            ? nextProfile.isExperience
            : true,
      });
      setIsEditing(false);
      setProfileMessage("프로필이 저장되었습니다.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
        error.message ||
        "프로필 저장에 실패했습니다.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#091d2e] font-body">
      <Navbar
        activePage="profile"
        onNavigateHome={onNavigateHome}
        onNavigateAnimalList={onNavigateAnimalList}
        onNavigateReviews={onNavigateReviews}
        onNavigateProfile={onNavigateProfile}
      />

      <div className="flex pt-20">
        <aside className="hidden lg:flex sticky top-20 h-[calc(100vh-80px)] w-72 shrink-0 flex-col rounded-r-[2rem] bg-[#edf4ff] px-6 py-8 shadow-[0_8px_32px_rgba(9,29,46,0.04)]">
          <div className="mb-12 flex items-center gap-4 px-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#8e4e14] ring-2 ring-white">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                account_circle
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-headline">
                {displayName}
              </h2>
              <p className="text-sm font-semibold text-[#534439]/70">
                Adopter Member
              </p>
            </div>
          </div>

          <nav className="space-y-4">
            <ProfileMenuItem
              active={activeSection === "profile"}
              icon="person"
              label="프로필 정보"
              onClick={() => {
                setActiveSection("profile");
                setIsEditing(false);
              }}
            />
            <ProfileMenuItem
              active={activeSection === "survey"}
              icon="pets"
              label="매칭 설문"
              onClick={() => {
                setActiveSection("survey");
                setIsEditing(false);
              }}
            />
          </nav>
        </aside>

        <main className="flex-1 px-6 py-10 lg:px-16 lg:py-14">
          <div className="mx-auto max-w-6xl space-y-10">
            <header className="flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-[18rem] flex-1 space-y-3">
                <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[#8e4e14]">
                  {activeSection === "survey" ? "Matching Survey" : "Your Sanctuary"}
                </p>
                <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-normal text-[#091d2e] font-headline md:text-7xl">
                  {activeSection === "survey"
                    ? "매칭 설문 결과"
                    : `환영합니다, ${displayName}님.`}
                </h1>
                {!isEditing && activeSection === "profile" && (
                  <p className="max-w-2xl text-xl font-medium leading-relaxed text-[#534439]">
                    새로운 가족을 찾는 여정을 함께하고 있어요. 내 정보와
                    매칭 준비 상태를 한눈에 확인해보세요.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {activeSection === "survey" ? (
                  <button
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#8e4e14] px-6 text-sm font-extrabold text-white transition hover:bg-[#6f3800]"
                    onClick={onNavigatePreferences}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                    설문 수정
                  </button>
                ) : isEditing ? (
                  <>
                    <button
                      className="inline-flex h-14 w-32 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[#79563c] transition hover:bg-[#fdcead]"
                      disabled={isSavingProfile}
                      onClick={handleEditCancel}
                      type="button"
                    >
                      취소
                    </button>
                    <button
                      className="inline-flex h-14 w-32 items-center justify-center gap-2 rounded-full bg-[#8e4e14] px-6 text-sm font-extrabold text-white transition hover:bg-[#6f3800] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSavingProfile}
                      onClick={handleProfileSave}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">
                        save
                      </span>
                      {isSavingProfile ? "저장 중" : "저장"}
                    </button>
                  </>
                ) : (
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fdcead] px-6 py-3 text-sm font-extrabold text-[#79563c] transition hover:bg-[#f4a261]/80"
                    disabled={isProfileLoading}
                    onClick={handleEditStart}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                    프로필 편집
                  </button>
                )}
              </div>
            </header>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
              {activeSection === "profile" ? (
                <section className="rounded-[2rem] bg-[#edf4ff] p-8 shadow-[0_16px_40px_rgba(9,29,46,0.04)] xl:col-span-8 lg:p-10">
                  <div className="mb-8 flex items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-[#8e4e14]">
                      contact_page
                    </span>
                    <h2 className="text-4xl font-extrabold font-headline">
                      개인정보
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                    <ProfileField
                      label="아이디"
                      value={formatValue(userProfile.loginId)}
                    />
                    <ProfileField
                      label="이름"
                      value={formatValue(userProfile.username)}
                    />
                    <ProfileField
                      label="전화번호"
                      value={formatValue(formatPhone(userProfile.phone))}
                    />
                    <ProfileField
                      label="출생연도"
                      value={formatValue(userProfile.birthYear, "년")}
                    />
                    <ProfileField
                      editable
                      editMode={isEditing}
                      label="거주 지역"
                      name="location"
                      onChange={handleEditFormChange}
                      value={
                        isEditing
                          ? editForm.location
                          : formatValue(userProfile.location)
                      }
                    />
                    <ProfileField
                      editable
                      editMode={isEditing}
                      label="하루 평균 집에 있는 시간"
                      name="emptyTime"
                      onChange={handleEditFormChange}
                      type="text"
                      value={
                        isEditing
                          ? editForm.emptyTime
                          : formatValue(userProfile.emptyTime, "시간")
                      }
                    />
                    <HousingSelect
                      editMode={isEditing}
                      onChange={handleEditFormChange}
                      value={
                        isEditing
                          ? editForm.housingType
                          : userProfile.housingType || ""
                      }
                    />
                    <ExperienceToggle
                      editMode={isEditing}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          isExperience: value,
                        }))
                      }
                      value={
                        isEditing
                          ? editForm.isExperience
                          : typeof userProfile.isExperience === "boolean"
                            ? userProfile.isExperience
                            : null
                      }
                    />
                  </div>

                  {isProfileLoading && (
                    <p className="mt-6 text-sm font-bold text-[#534439]/70">
                      프로필 정보를 불러오는 중입니다.
                    </p>
                  )}
                  {profileError && (
                    <p className="mt-6 text-sm font-bold text-red-700">
                      {profileError}
                    </p>
                  )}
                  {profileMessage && (
                    <p className="mt-6 text-sm font-bold text-[#006878]">
                      {profileMessage}
                    </p>
                  )}
                </section>
              ) : (
                <section className="rounded-[2rem] bg-[#edf4ff] p-8 shadow-[0_16px_40px_rgba(9,29,46,0.04)] xl:col-span-8 lg:p-10">
                  <div className="mb-8 flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-4xl text-[#8e4e14]"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      pets
                    </span>
                    <h2 className="text-4xl font-extrabold font-headline">
                      저장된 설문 결과
                    </h2>
                  </div>

                  {isPreferenceLoading ? (
                    <p className="text-sm font-bold text-[#534439]/70">
                      매칭 설문 결과를 불러오는 중입니다.
                    </p>
                  ) : preference ? (
                    <>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <SurveyResultItem
                          icon="pets"
                          label="동물 종류"
                          value={formatSurveyValue(
                            "animalType",
                            preference.animalType,
                          )}
                        />
                        <SurveyResultItem
                          icon="straighten"
                          label="동물 크기"
                          value={formatSurveyValue("size", preference.size)}
                        />
                        <SurveyResultItem
                          icon="wc"
                          label="동물 성별"
                          value={formatSurveyValue("gender", preference.gender)}
                        />
                        <SurveyResultItem
                          icon="cake"
                          label="동물 나이"
                          value={formatSurveyValue("age", preference.age)}
                        />
                      </div>

                      <div className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-[#8e4e14]">
                          <span className="material-symbols-outlined text-2xl">
                            psychology
                          </span>
                          <span className="text-sm font-extrabold">
                            선호 성격
                          </span>
                        </div>
                        {personalityValues.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {personalityValues.map((personality) => (
                              <span
                                className="rounded-full bg-[#edf4ff] px-4 py-2 text-sm font-bold text-[#534439]"
                                key={personality}
                              >
                                {SURVEY_LABELS.personalities[personality] ||
                                  personality}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-[#091d2e]">-</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-white p-7 shadow-sm">
                      <p className="text-xl font-extrabold text-[#091d2e]">
                        아직 작성된 매칭 설문이 없습니다.
                      </p>
                      <p className="mt-2 font-medium text-[#534439]">
                        설문을 작성하면 이곳에서 결과를 확인할 수 있어요.
                      </p>
                    </div>
                  )}

                  {preferenceError && (
                    <p className="mt-6 text-sm font-bold text-red-700">
                      {preferenceError}
                    </p>
                  )}
                </section>
              )}

              <aside className="space-y-6 xl:col-span-4">
                <section className="overflow-hidden rounded-[2rem] bg-[#8e4e14] p-7 text-white shadow-[0_18px_34px_rgba(142,78,20,0.22)]">
                  <div className="relative z-10 space-y-4">
                    <span
                      className="material-symbols-outlined text-5xl text-white/60"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      quiz
                    </span>
                    <h2 className="text-3xl font-extrabold leading-tight font-headline">
                      매칭 설문조사
                    </h2>
                    <p className="font-medium leading-relaxed text-[#ffdcc4]">
                      생활 패턴과 선호도를 업데이트하면 더 잘 맞는 동물을
                      추천받을 수 있어요.
                    </p>
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#8e4e14] transition hover:gap-4"
                      onClick={onNavigatePreferences}
                      type="button"
                    >
                      설문 수정
                      <span className="material-symbols-outlined text-xl">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  );
}

export default ProfilePage;
