function AppFooter() {
  return (
    <footer className="bg-[#091d2e] text-[#f4a261] mt-20 p-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 max-w-screen-2xl mx-auto">
        <div className="space-y-4">
          <div className="text-[#f7f9ff] font-bold text-3xl font-headline">All4Animal</div>
          <p className="text-slate-400 text-sm max-w-xs">
            반려동물 입양을 혁신하는 All4Animal과 함께 새로운 가족을 만나보세요. 우리의 AI 매칭 시스템이 당신과 완벽한 반려동물을 연결해드립니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
