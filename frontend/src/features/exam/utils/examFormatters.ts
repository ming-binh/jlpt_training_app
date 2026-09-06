/**
 * Utility formatters for JLPT Exam feature
 * Ensures all Vietnamese titles and descriptions are properly accented and displayed cleanly.
 */

export function formatMondaiTitle(title?: string | null): string {
  if (!title) return "";
  let t = title.trim();

  // Replace common unaccented section names
  t = t
    .replace(/Doc chu Han/gi, "Đọc chữ Hán")
    .replace(/Viet chu Han/gi, "Viết chữ Hán")
    .replace(/Dien tu vao cho trong/gi, "Điền từ vào chỗ trống")
    .replace(/Tu dong nghia/gi, "Từ đồng nghĩa")
    .replace(/Cach dung tu/gi, "Cách dùng từ")
    .replace(/Dien ngu phap thich hop cho cau/gi, "Điền ngữ pháp thích hợp cho câu")
    .replace(/Sap xep thu tu (?:tu )?trong cau \(sao\)/gi, "Sắp xếp thứ tự trong câu (★)")
    .replace(/Sap xep thu tu trong cau/gi, "Sắp xếp thứ tự trong câu (★)")
    .replace(/Ngu phap trong doan van/gi, "Ngữ pháp trong đoạn văn")
    .replace(/Doc hieu doan van ngan/gi, "Đọc hiểu đoạn văn ngắn")
    .replace(/Doc hieu doan van trung/gi, "Đọc hiểu đoạn văn trung")
    .replace(/Doc hieu tim kiem thong tin/gi, "Đọc hiểu tìm kiếm thông tin");

  // Fix corrupted mojibake characters if any legacy DB records have them
  t = t
    .replace(/[?]+c ch[?_]+ H[A]+n/gi, "Đọc chữ Hán")
    .replace(/CA[]+ch vi[]+t ch[?_]+ H[A]+n/gi, "Cách viết chữ Hán")
    .replace(/[?]+i[?]+n t[?]+ v[A]+o ch[?]+ tr[?]+ng/gi, "Điền từ vào chỗ trống")
    .replace(/T[?]+ [?]+[?]+ng ngh[?]+a/gi, "Từ đồng nghĩa")
    .replace(/[?]+i[?]+n ng[?_]+ ph[A]+p th[A-]+ch h[?]+p cho c[A]+u/gi, "Điền ngữ pháp thích hợp cho câu")
    .replace(/S[?_]+p x[?]+p th[?]+c t[?]+ c[A]+u.*/gi, "Sắp xếp thứ tự trong câu (★)");

  return t;
}

export function formatExamTitle(title?: string | null): string {
  if (!title) return "";
  let t = title.trim();
  t = t
    .replace(/^De thi/gi, "Đề thi")
    .replace(/Thang/gi, "Tháng")
    .replace(/dot thang/gi, "đợt tháng")
    .replace(/[?]+ thi/gi, "Đề thi")
    .replace(/Th[A]+ng/gi, "Tháng");
  return t;
}

export function formatExamDescription(desc?: string | null): string {
  if (!desc) return "";
  let d = desc.trim();
  d = d
    .replace(/De thi chinh thuc ky thi Nang luc Nhat ngu/gi, "Đề thi chính thức kỳ thi Năng lực Nhật ngữ")
    .replace(/Cap do nhap mon tieng Nhat/gi, "Cấp độ nhập môn tiếng Nhật")
    .replace(/dot thang/gi, "đợt tháng")
    .replace(/Trinh do so-trung cap tieng Nhat/gi, "Trình độ sơ-trung cấp tiếng Nhật")
    .replace(/Trinh do trung cap/gi, "Trình độ trung cấp")
    .replace(/doc hieu van ban thong thuong/gi, "đọc hiểu văn bản thông thường")
    .replace(/kem dap an va giai thich chi tiet/gi, "kèm đáp án và giải thích chi tiết");
  return d;
}
