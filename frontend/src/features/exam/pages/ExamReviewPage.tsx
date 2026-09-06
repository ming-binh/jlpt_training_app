import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Award, BarChart3, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { QuestionItem } from "../components/QuestionItem";
import { QuestionMatrix } from "../components/QuestionMatrix";
import { AiExplanationDrawer } from "../components/AiExplanationDrawer";
import { examService, type ExamAttemptReview, type ExamQuestion, type ExamItem } from "@/services/exam.service";
import { formatMondaiTitle, formatExamTitle } from "../utils/examFormatters";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ExamReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [review, setReview] = useState<ExamAttemptReview | null>(null);
  const [examDetail, setExamDetail] = useState<ExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAiQuestion, setSelectedAiQuestion] = useState<ExamQuestion | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<number | undefined>(undefined);

  const numericAttemptId = Number(attemptId);

  useEffect(() => {
    if (!numericAttemptId) return;

    setLoading(true);
    examService.getAttemptReview(numericAttemptId)
      .then((data) => {
        setReview(data);
        if (data.questions && data.questions.length > 0) {
          setActiveQuestionId(data.questions[0].id);
        }
        if (data.examId) {
          examService.getExamDetail(data.examId)
            .then(setExamDetail)
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error("Failed to load attempt review:", err);
        toast.error("Không thể tải chi tiết bài làm.");
      })
      .finally(() => setLoading(false));
  }, [numericAttemptId]);

  const handleSelectQuestion = (questionId: number) => {
    setActiveQuestionId(questionId);
    const element = document.getElementById(`q-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Tính toán thống kê theo từng Mondai — MUST be called unconditionally before early return!
  const sectionStats = useMemo(() => {
    if (!review || !review.questions || review.questions.length === 0) return [];

    const groups: Record<number, ExamQuestion[]> = {};
    review.questions.forEach((q) => {
      const sId = q.sectionId || 0;
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(q);
    });

    return Object.entries(groups).map(([sIdStr, qList]) => {
      const sId = Number(sIdStr);
      const sectionInfo = examDetail?.sections?.find((s) => s.id === sId);
      const total = qList.length;
      const correct = qList.filter((q) => q.isCorrect).length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const rawTitle = sectionInfo?.title || (review.mondaiNumber ? `Mondai ${review.mondaiNumber}` : review.sectionTitle) || `Phần thi`;
      const title = formatMondaiTitle(rawTitle);
      const mondaiNumber = sectionInfo?.mondaiNumber || review.mondaiNumber;

      return {
        sectionId: sId,
        title,
        mondaiNumber,
        total,
        correct,
        percentage: pct,
      };
    });
  }, [review, examDetail]);

  const weakestSection = useMemo(() => {
    if (sectionStats.length <= 1) return null;
    const sorted = [...sectionStats].sort((a, b) => a.percentage - b.percentage);
    return sorted[0].percentage < 60 ? sorted[0] : null;
  }, [sectionStats]);

  if (loading || !review) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center gap-4">
          <div className="size-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải giải thích chi tiết...</p>
        </div>
      </div>
    );
  }

  const questions = review.questions || [];
  const answersMap: Record<number, number> = {};
  questions.forEach((q) => {
    if (q.userSelectedOption !== undefined && q.userSelectedOption !== null) {
      answersMap[q.id] = q.userSelectedOption;
    }
  });

  const minutesSpent = Math.floor(review.timeSpentSeconds / 60);
  const secondsSpent = review.timeSpentSeconds % 60;
  const isPassed = review.isPassed;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AppHeader />

      {/* Top Header Banner */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/luyen-de"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Danh sách đề</span>
            </Link>

            <div>
              <h2 className="text-sm font-bold text-foreground line-clamp-1">
                Xem lại bài làm · {formatExamTitle(review.examTitle)}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {formatMondaiTitle(review.sectionTitle)} · Nộp lúc: {review.submittedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border",
                isPassed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              )}
            >
              {isPassed ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
              <span>{isPassed ? "ĐẠT CHUẨN" : "CHƯA ĐẠT"}</span>
              <span className="font-mono">({review.score}/{review.maxScore}đ - {review.percentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left: Questions with Explanations */}
          <div className="space-y-6">
            {/* Score Summary Box */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Điểm số</p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {review.score} <span className="text-xs font-normal text-muted-foreground">/ {review.maxScore}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Câu đúng</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">
                  {review.correctCount} <span className="text-xs font-normal text-muted-foreground">/ {review.totalQuestions}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Tỷ lệ</p>
                <p className="text-2xl font-black text-accent mt-0.5">{review.percentage}%</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Thời gian</p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {minutesSpent}:{String(secondsSpent).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* Mondai Strengths & Weaknesses Analysis Card */}
            {sectionStats.length > 0 && (
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
                      <BarChart3 className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Phân tích điểm mạnh & điểm yếu theo Mondai</h3>
                      <p className="text-[11px] text-muted-foreground">Mức độ hoàn thành chính xác từng dạng bài thi</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {sectionStats.length} phần thi
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {sectionStats.map((sec, idx) => {
                    const isGreat = sec.percentage >= 75;
                    const isFair = sec.percentage >= 50 && sec.percentage < 75;

                    return (
                      <div
                        key={sec.sectionId || idx}
                        className="rounded-2xl border border-border/60 bg-secondary/20 p-3.5 space-y-2.5 transition-all hover:bg-secondary/35"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground truncate" title={sec.title}>
                            {sec.title}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                              isGreat
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : isFair
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            )}
                          >
                            {isGreat ? "Rất tốt" : isFair ? "Đạt" : "Cần ôn tập"}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isGreat ? "bg-emerald-500" : isFair ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${sec.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                            <span>{sec.correct}/{sec.total} câu đúng</span>
                            <span className="font-bold text-foreground">{sec.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {weakestSection && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                    <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-amber-300 font-bold">Khuyến nghị trọng tâm: </strong>
                      Bạn đang đạt kết quả thấp nhất ở <span className="font-bold text-amber-100 underline decoration-amber-400">{weakestSection.title}</span> ({weakestSection.percentage}%). Hãy ưu tiên luyện thêm dạng bài này để bứt phá điểm số thi thật!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Questions List with Explanations */}
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  selectedOption={q.userSelectedOption}
                  reviewMode
                  onAskAi={(question) => setSelectedAiQuestion(question)}
                />
              ))}
            </div>
          </div>

          {/* Right: Matrix Sidebar */}
          <div className="lg:sticky lg:top-20 lg:h-fit space-y-4">
            <QuestionMatrix
              questions={questions}
              answers={answersMap}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              reviewMode
            />

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Award className="size-3.5 text-accent" />
                <span>Thao tác tiếp theo</span>
              </div>

              {review.sectionId ? (
                <Link
                  to={`/luyen-de/${review.examId}/mondai/${review.sectionId}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Làm lại Mondai này</span>
                </Link>
              ) : (
                <Link
                  to={`/luyen-de/${review.examId}/take`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Làm lại toàn bộ đề thi</span>
                </Link>
              )}

              <Link
                to="/luyen-de"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <span>Xem danh sách các đề khác</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* AI Explanation Drawer */}
      <AiExplanationDrawer
        question={selectedAiQuestion}
        onClose={() => setSelectedAiQuestion(null)}
      />
    </div>
  );
}
