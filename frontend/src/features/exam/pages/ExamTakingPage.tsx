import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, AlertCircle, FileText, Send } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { QuestionItem } from "../components/QuestionItem";
import { MondaiNavSidebar } from "../components/MondaiNavSidebar";
import { ExamResultModal } from "../components/ExamResultModal";
import { examService, type ExamItem, type ExamSection, type ExamQuestion, type ExamSubmitResponse } from "@/services/exam.service";
import { toast } from "@/components/ui/toast";

export function ExamTakingPage() {
  const { examId, sectionId } = useParams<{ examId: string; sectionId?: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamItem | null>(null);
  const [currentSection, setCurrentSection] = useState<ExamSection | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamSubmitResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  const numericExamId = Number(examId);
  const numericSectionId = sectionId ? Number(sectionId) : undefined;

  // Load Exam & Questions
  useEffect(() => {
    if (!numericExamId) return;

    setLoading(true);
    setAnswers({});
    setResult(null);

    // Fetch full exam details first (for sidebar & metadata)
    examService.getExamDetail(numericExamId)
      .then((examData) => {
        setExam(examData);

        if (numericSectionId) {
          // Specific Mondai mode
          return examService.getSectionQuestions(numericExamId, numericSectionId)
            .then((secData) => {
              setCurrentSection(secData);
              const qs = secData.questions || [];
              setQuestions(qs);
              if (qs.length > 0) setActiveQuestionId(qs[0].id);
            });
        } else {
          // Full exam mode
          return examService.getFullExamQuestions(numericExamId)
            .then((fullData) => {
              setCurrentSection(null);
              const allQs = fullData.sections?.flatMap((s) => s.questions || []) || [];
              setQuestions(allQs);
              if (allQs.length > 0) setActiveQuestionId(allQs[0].id);
            });
        }
      })
      .catch((err) => {
        console.error("Failed to load exam:", err);
        toast.error("Không thể tải đề thi. Vui lòng thử lại!");
      })
      .finally(() => setLoading(false));
  }, [numericExamId, numericSectionId]);

  // Track time spent
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleSelectOption = (questionId: number, option: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSelectQuestion = (questionId: number) => {
    setActiveQuestionId(questionId);
    const element = document.getElementById(`q-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return;

    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const response = await examService.submitExam(exam.id, {
        sectionId: numericSectionId,
        answers,
        timeSpentSeconds,
      });
      setResult(response);
      toast.success(response.isPassed ? "Chúc mừng! Bạn đã đạt điểm chuẩn." : "Đã nộp bài thành công.");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Không thể nộp bài. Vui lòng kiểm tra kết nối mạng!");
    } finally {
      setSubmitting(false);
    }
  }, [exam, numericSectionId, answers, timeSpentSeconds, submitting]);

  const handleRequestSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setShowConfirmModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleTimeUp = () => {
    toast.info("Hết giờ làm bài! Hệ thống đang tự động nộp bài thi.");
    handleSubmit();
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center gap-4">
          <div className="size-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải câu hỏi phòng thi...</p>
        </div>
      </div>
    );
  }

  const timeLimitMinutes = currentSection
    ? currentSection.timeLimitMinutes || 15
    : exam.totalTimeMinutes || 105;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AppHeader />

      {/* Top Breadcrumb & Action Banner */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/luyen-de"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Trở lại</span>
            </Link>

            <div>
              <h2 className="text-sm font-bold text-foreground line-clamp-1">
                {exam.title}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {currentSection ? currentSection.title : "Chế độ thi toàn diện"} · {questions.length} câu hỏi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">
              Làm đề ngay
            </span>
          </div>
        </div>
      </div>

      {/* Main Examination Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left Column: Instructions & Questions List */}
          <div className="space-y-6">
            {/* Instruction Box */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-bold text-accent text-xs uppercase tracking-wider mb-2">
                <FileText className="size-4" />
                <span>Hướng dẫn làm bài</span>
              </div>
              <p className="text-sm font-medium text-foreground jp leading-relaxed">
                {currentSection?.instruction || "問題 ( ) に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。"}
              </p>
            </div>

            {/* Reading Passage Box if available (Mondai 8 / Reading) */}
            {currentSection?.passageText && (
              <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 backdrop-blur-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-accent text-xs uppercase tracking-wider">
                  <BookOpen className="size-4" />
                  <span>Đoạn văn bài đọc (Passage)</span>
                </div>
                <div className="jp text-sm leading-loose text-foreground whitespace-pre-wrap pl-1 font-normal">
                  {currentSection.passageText}
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  selectedOption={answers[q.id]}
                  onSelectOption={(opt) => handleSelectOption(q.id, opt)}
                />
              ))}
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-6 flex justify-end">
              <button
                type="button"
                onClick={handleRequestSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-2xl bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
              >
                <Send className="size-4" />
                <span>{submitting ? "Đang nộp bài..." : "Nộp bài thi"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar with Timer, Matrix & Mondai links */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <MondaiNavSidebar
              exam={exam}
              currentSection={currentSection || undefined}
              allQuestions={questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              onSubmit={handleRequestSubmit}
              onTimeUp={handleTimeUp}
              timeLimitMinutes={timeLimitMinutes}
            />
          </div>
        </div>
      </main>

      {/* Confirm Incomplete Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertCircle className="size-6" />
            </div>

            <h3 className="text-lg font-bold text-foreground">Bạn vẫn còn câu chưa làm!</h3>
            <p className="text-xs text-muted-foreground">
              Bạn đã hoàn thành <strong className="text-foreground">{Object.keys(answers).length}</strong> trong tổng số <strong className="text-foreground">{questions.length}</strong> câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-2xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-2xl bg-accent py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 cursor-pointer"
              >
                Vẫn nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal upon submission */}
      {result && (
        <ExamResultModal
          result={result}
          onClose={() => navigate("/luyen-de")}
          onReview={() => navigate(`/luyen-de/review/${result.attemptId}`)}
          onRetry={() => {
            setResult(null);
            setAnswers({});
            setTimeSpentSeconds(0);
          }}
        />
      )}
    </div>
  );
}
