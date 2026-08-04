export type Level = "N5" | "N4" | "N3";

export type Vocab = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  type: string;
  level: Level;
  example: string;
  exampleVi: string;
};

export type Kanji = {
  id: string;
  char: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: number;
  level: Level;
  words: { jp: string; reading: string; vi: string }[];
};

export type Grammar = {
  id: string;
  pattern: string;
  romaji: string;
  meaning: string;
  level: Level;
  formation: string;
  note: string;
  examples: { jp: string; vi: string }[];
};

export const LEVELS: Level[] = ["N5", "N4", "N3"];

export const VOCAB: Vocab[] = [
  {
    id: "v1",
    word: "約束",
    reading: "やくそく",
    meaning: "lời hứa, hẹn ước",
    type: "Danh từ",
    level: "N4",
    example: "友達と約束をしました。",
    exampleVi: "Tôi đã hẹn với bạn.",
  },
  {
    id: "v2",
    word: "経験",
    reading: "けいけん",
    meaning: "kinh nghiệm, trải nghiệm",
    type: "Danh từ",
    level: "N3",
    example: "留学の経験があります。",
    exampleVi: "Tôi có kinh nghiệm du học.",
  },
  {
    id: "v3",
    word: "涼しい",
    reading: "すずしい",
    meaning: "mát mẻ",
    type: "Tính từ đuôi i",
    level: "N5",
    example: "秋は涼しいです。",
    exampleVi: "Mùa thu thì mát mẻ.",
  },
  {
    id: "v4",
    word: "遠慮",
    reading: "えんりょ",
    meaning: "sự khách sáo, e dè",
    type: "Danh từ",
    level: "N3",
    example: "遠慮しないで食べてください。",
    exampleVi: "Đừng khách sáo, hãy ăn đi.",
  },
  {
    id: "v5",
    word: "調べる",
    reading: "しらべる",
    meaning: "tra cứu, điều tra",
    type: "Động từ nhóm 2",
    level: "N4",
    example: "辞書で言葉を調べます。",
    exampleVi: "Tôi tra từ trong từ điển.",
  },
  {
    id: "v6",
    word: "便利",
    reading: "べんり",
    meaning: "tiện lợi",
    type: "Tính từ đuôi na",
    level: "N5",
    example: "この店は便利な場所にあります。",
    exampleVi: "Cửa hàng này ở vị trí tiện lợi.",
  },
  {
    id: "v7",
    word: "机",
    reading: "つくえ",
    meaning: "cái bàn",
    type: "Danh từ",
    level: "N5",
    example: "机の上に本があります。",
    exampleVi: "Trên bàn có quyển sách.",
  },
  {
    id: "v8",
    word: "準備",
    reading: "じゅんび",
    meaning: "sự chuẩn bị",
    type: "Danh từ",
    level: "N4",
    example: "試験の準備をしています。",
    exampleVi: "Tôi đang chuẩn bị cho kỳ thi.",
  },
  {
    id: "v9",
    word: "我慢",
    reading: "がまん",
    meaning: "sự chịu đựng, nhẫn nhịn",
    type: "Danh từ",
    level: "N3",
    example: "痛みを我慢しました。",
    exampleVi: "Tôi đã chịu đựng cơn đau.",
  },
  {
    id: "v10",
    word: "急ぐ",
    reading: "いそぐ",
    meaning: "vội vàng, gấp gáp",
    type: "Động từ nhóm 1",
    level: "N4",
    example: "早く急いでください。",
    exampleVi: "Hãy nhanh lên.",
  },
  {
    id: "v11",
    word: "景色",
    reading: "けしき",
    meaning: "phong cảnh",
    type: "Danh từ",
    level: "N3",
    example: "山の景色がきれいです。",
    exampleVi: "Phong cảnh núi rất đẹp.",
  },
  {
    id: "v12",
    word: "元気",
    reading: "げんき",
    meaning: "khỏe mạnh, tinh thần tốt",
    type: "Tính từ đuôi na",
    level: "N5",
    example: "お元気ですか。",
    exampleVi: "Bạn có khỏe không?",
  },
];

export const KANJI: Kanji[] = [
  {
    id: "k1",
    char: "日",
    meaning: "Nhật — ngày, mặt trời",
    onyomi: "ニチ・ジツ",
    kunyomi: "ひ・か",
    strokes: 4,
    level: "N5",
    words: [
      { jp: "日本", reading: "にほん", vi: "Nhật Bản" },
      { jp: "毎日", reading: "まいにち", vi: "mỗi ngày" },
    ],
  },
  {
    id: "k2",
    char: "生",
    meaning: "Sinh — sống, sinh ra",
    onyomi: "セイ・ショウ",
    kunyomi: "い(きる)・う(まれる)",
    strokes: 5,
    level: "N5",
    words: [
      { jp: "学生", reading: "がくせい", vi: "học sinh" },
      { jp: "生活", reading: "せいかつ", vi: "sinh hoạt" },
    ],
  },
  {
    id: "k3",
    char: "時",
    meaning: "Thời — thời gian, giờ",
    onyomi: "ジ",
    kunyomi: "とき",
    strokes: 10,
    level: "N5",
    words: [
      { jp: "時間", reading: "じかん", vi: "thời gian" },
      { jp: "時計", reading: "とけい", vi: "đồng hồ" },
    ],
  },
  {
    id: "k4",
    char: "駅",
    meaning: "Dịch — nhà ga",
    onyomi: "エキ",
    kunyomi: "—",
    strokes: 14,
    level: "N5",
    words: [
      { jp: "駅前", reading: "えきまえ", vi: "trước ga" },
      { jp: "東京駅", reading: "とうきょうえき", vi: "ga Tokyo" },
    ],
  },
  {
    id: "k5",
    char: "動",
    meaning: "Động — chuyển động",
    onyomi: "ドウ",
    kunyomi: "うご(く)",
    strokes: 11,
    level: "N4",
    words: [
      { jp: "運動", reading: "うんどう", vi: "vận động" },
      { jp: "自動車", reading: "じどうしゃ", vi: "ô tô" },
    ],
  },
  {
    id: "k6",
    char: "考",
    meaning: "Khảo — suy nghĩ",
    onyomi: "コウ",
    kunyomi: "かんが(える)",
    strokes: 6,
    level: "N4",
    words: [
      { jp: "考え方", reading: "かんがえかた", vi: "cách suy nghĩ" },
      { jp: "参考", reading: "さんこう", vi: "tham khảo" },
    ],
  },
  {
    id: "k7",
    char: "働",
    meaning: "Động — làm việc",
    onyomi: "ドウ",
    kunyomi: "はたら(く)",
    strokes: 13,
    level: "N4",
    words: [
      { jp: "労働", reading: "ろうどう", vi: "lao động" },
      { jp: "働き方", reading: "はたらきかた", vi: "cách làm việc" },
    ],
  },
  {
    id: "k8",
    char: "覚",
    meaning: "Giác — ghi nhớ, cảm giác",
    onyomi: "カク",
    kunyomi: "おぼ(える)",
    strokes: 12,
    level: "N4",
    words: [
      { jp: "感覚", reading: "かんかく", vi: "cảm giác" },
      { jp: "覚える", reading: "おぼえる", vi: "ghi nhớ" },
    ],
  },
  {
    id: "k9",
    char: "経",
    meaning: "Kinh — trải qua, kinh tế",
    onyomi: "ケイ",
    kunyomi: "へ(る)",
    strokes: 11,
    level: "N3",
    words: [
      { jp: "経済", reading: "けいざい", vi: "kinh tế" },
      { jp: "経験", reading: "けいけん", vi: "kinh nghiệm" },
    ],
  },
  {
    id: "k10",
    char: "識",
    meaning: "Thức — nhận biết, kiến thức",
    onyomi: "シキ",
    kunyomi: "—",
    strokes: 19,
    level: "N3",
    words: [
      { jp: "知識", reading: "ちしき", vi: "kiến thức" },
      { jp: "意識", reading: "いしき", vi: "ý thức" },
    ],
  },
  {
    id: "k11",
    char: "選",
    meaning: "Tuyển — lựa chọn",
    onyomi: "セン",
    kunyomi: "えら(ぶ)",
    strokes: 15,
    level: "N3",
    words: [
      { jp: "選手", reading: "せんしゅ", vi: "tuyển thủ" },
      { jp: "選択", reading: "せんたく", vi: "sự lựa chọn" },
    ],
  },
  {
    id: "k12",
    char: "静",
    meaning: "Tĩnh — yên tĩnh",
    onyomi: "セイ",
    kunyomi: "しず(か)",
    strokes: 14,
    level: "N3",
    words: [
      { jp: "静か", reading: "しずか", vi: "yên tĩnh" },
      { jp: "冷静", reading: "れいせい", vi: "bình tĩnh" },
    ],
  },
];

export const GRAMMAR: Grammar[] = [
  {
    id: "g1",
    pattern: "〜たことがある",
    romaji: "~ta koto ga aru",
    meaning: "Đã từng làm gì đó",
    level: "N4",
    formation: "V(thể た) + ことがある",
    note: "Diễn tả kinh nghiệm trong quá khứ, không dùng cho việc vừa mới xảy ra.",
    examples: [
      { jp: "日本へ行ったことがあります。", vi: "Tôi đã từng đi Nhật." },
      { jp: "寿司を食べたことがない。", vi: "Tôi chưa từng ăn sushi." },
    ],
  },
  {
    id: "g2",
    pattern: "〜なければならない",
    romaji: "~nakereba naranai",
    meaning: "Bắt buộc phải làm gì",
    level: "N4",
    formation: "V(thể ない bỏ ない) + なければならない",
    note: "Văn nói thường rút gọn thành 〜なきゃ hoặc 〜ないと.",
    examples: [
      { jp: "明日までに出さなければなりません。", vi: "Phải nộp trước ngày mai." },
      { jp: "薬を飲まなきゃ。", vi: "Phải uống thuốc thôi." },
    ],
  },
  {
    id: "g3",
    pattern: "〜ながら",
    romaji: "~nagara",
    meaning: "Vừa … vừa …",
    level: "N4",
    formation: "V(thể ます bỏ ます) + ながら",
    note: "Hành động chính luôn nằm ở vế sau.",
    examples: [
      { jp: "音楽を聞きながら勉強します。", vi: "Tôi vừa nghe nhạc vừa học." },
      { jp: "歩きながら話しましょう。", vi: "Vừa đi vừa nói chuyện nhé." },
    ],
  },
  {
    id: "g4",
    pattern: "〜てしまう",
    romaji: "~te shimau",
    meaning: "Lỡ làm, hoàn thành trọn vẹn",
    level: "N4",
    formation: "V(thể て) + しまう",
    note: "Mang sắc thái tiếc nuối hoặc nhấn mạnh việc đã xong hẳn.",
    examples: [
      { jp: "財布を落としてしまいました。", vi: "Tôi lỡ làm rơi mất ví." },
      { jp: "本を全部読んでしまった。", vi: "Tôi đã đọc xong hết sách." },
    ],
  },
  {
    id: "g5",
    pattern: "〜ば〜ほど",
    romaji: "~ba ~hodo",
    meaning: "Càng … càng …",
    level: "N3",
    formation: "V(thể ば) + V(từ điển) + ほど",
    note: "Lặp lại cùng một động từ hoặc tính từ ở hai vế.",
    examples: [
      { jp: "練習すればするほど上手になります。", vi: "Càng luyện tập càng giỏi." },
      { jp: "安ければ安いほどいい。", vi: "Càng rẻ càng tốt." },
    ],
  },
  {
    id: "g6",
    pattern: "〜わけではない",
    romaji: "~wake dewa nai",
    meaning: "Không hẳn là, không có nghĩa là",
    level: "N3",
    formation: "Thể thường + わけではない",
    note: "Phủ định một phần, thường đi kèm 別に hoặc すべて.",
    examples: [
      { jp: "嫌いなわけではありません。", vi: "Không hẳn là tôi ghét đâu." },
      { jp: "全部知っているわけではない。", vi: "Không phải là tôi biết hết mọi thứ." },
    ],
  },
  {
    id: "g7",
    pattern: "〜そうです",
    romaji: "~sou desu (truyền đạt)",
    meaning: "Nghe nói rằng",
    level: "N4",
    formation: "Thể thường + そうです",
    note: "Khác với 〜そう dự đoán (nối sau thể ます bỏ ます).",
    examples: [
      { jp: "明日は雨が降るそうです。", vi: "Nghe nói ngày mai trời mưa." },
      { jp: "彼は先生だそうです。", vi: "Nghe nói anh ấy là giáo viên." },
    ],
  },
  {
    id: "g8",
    pattern: "〜つもりです",
    romaji: "~tsumori desu",
    meaning: "Dự định làm gì",
    level: "N5",
    formation: "V(từ điển) + つもりです",
    note: "Ý chí đã cân nhắc kỹ, mạnh hơn 〜ようと思う.",
    examples: [
      { jp: "来年、日本語を勉強するつもりです。", vi: "Năm sau tôi định học tiếng Nhật." },
      { jp: "行かないつもりです。", vi: "Tôi dự định không đi." },
    ],
  },
];
