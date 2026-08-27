import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { QuestionItem } from "../components/QuestionItem";
import { QuestionMatrix } from "../components/QuestionMatrix";
import { AiExplanationDrawer } from "../components/AiExplanationDrawer";
import { examService, type ExamAttemptReview, type ExamQuestion } from "@/services/exam.service";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ExamReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [review, setReview] = useState<ExamAttemptReview | null>(null);
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
                Xem lại bài làm · {review.examTitle}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {review.sectionTitle} · Nộp lúc: {review.submittedAt}
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
