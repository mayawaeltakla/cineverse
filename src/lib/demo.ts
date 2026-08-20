import type {
  CastMember,
  DiscoverParams,
  Genre,
  Movie,
  MovieDetails,
  Page,
} from "../types";

/** قائمة الأنواع بأسمائها العربية (مطابقة لمعرفات TMDB) */
export const GENRES: Genre[] = [
  { id: 28, name: "أكشن" },
  { id: 12, name: "مغامرة" },
  { id: 16, name: "أنيميشن" },
  { id: 35, name: "كوميديا" },
  { id: 80, name: "جريمة" },
  { id: 99, name: "وثائقي" },
  { id: 18, name: "دراما" },
  { id: 10751, name: "عائلي" },
  { id: 14, name: "فانتازيا" },
  { id: 36, name: "تاريخي" },
  { id: 27, name: "رعب" },
  { id: 10402, name: "موسيقى" },
  { id: 9648, name: "غموض" },
  { id: 10749, name: "رومانسية" },
  { id: 878, name: "خيال علمي" },
  { id: 53, name: "إثارة" },
  { id: 10752, name: "حرب" },
  { id: 37, name: "غربي" },
];

const P = {
  dunes:
    "https://image.qwenlm.ai/generated-images/f2b4e4eb-1e43-417d-8e3b-0884fb3b9605/_result.png",
  rain: "https://image.qwenlm.ai/generated-images/87266d1a-14e6-4255-b88d-e4711d857022/_result.png",
  ash: "https://image.qwenlm.ai/generated-images/1e0b4414-e2e1-4fc8-a2ed-3385aadbee7b/_result.png",
  platform:
    "https://image.qwenlm.ai/generated-images/ebe6a20a-b59e-4619-8659-615805410f45/_result.png",
  floor: "https://image.qwenlm.ai/generated-images/01d1621f-23b1-453d-8a78-f03df6dd71c3/_result.png",
  isles: "https://image.qwenlm.ai/generated-images/c154338f-5b9e-41bc-ba32-cd534a7d91a4/_result.png",
  simoom:
    "https://image.qwenlm.ai/generated-images/bcd493dd-6f2f-4d61-8843-27104f81f7eb/_result.png",
  vault: "https://image.qwenlm.ai/generated-images/c5014879-a472-4892-b737-2bdc4c775d65/_result.png",
  lighthouse:
    "https://image.qwenlm.ai/generated-images/cc812501-e137-4256-827a-1c94236f147d/_result.png",
  neon: "https://image.qwenlm.ai/generated-images/109ffc4d-dc7c-4379-a891-901124f7e992/_result.png",
};

interface DetailExtra {
  runtime: number;
  tagline: string;
  director: string;
  budget: number; // بالمليون دولار
  revenue: number; // بالمليون دولار
  cast: [string, string][];
}

const m = (
  id: number,
  title: string,
  originalTitle: string,
  overview: string,
  genreIds: number[],
  releaseDate: string,
  rating: number,
  votes: number,
  popularity: number,
  poster: string | null
): Movie => ({
  id,
  title,
  originalTitle,
  overview,
  genreIds,
  releaseDate,
  rating,
  votes,
  popularity,
  poster,
  backdrop: poster,
});

const toDetails = (movie: Movie, x: DetailExtra): MovieDetails => ({
  ...movie,
  runtime: x.runtime,
  tagline: x.tagline,
  director: x.director,
  budget: x.budget * 1_000_000,
  revenue: x.revenue * 1_000_000,
  originalLanguage: "ar",
  genres: movie.genreIds
    .map((gid) => GENRES.find((g) => g.id === gid))
    .filter((g): g is Genre => Boolean(g)),
  cast: x.cast.map(([name, character], i): CastMember => ({
    id: movie.id * 100 + i,
    name,
    character,
    profile: null,
  })),
  videos: [],
});

/* ===================== الأفلام العشرة المميزة (بوسترات مولّدة) ===================== */

const PREMIUM: [Movie, DetailExtra][] = [
  [
    m(
      101,
      "كثبان النار",
      "Dunes of Ember",
      "على كوكبٍ تلفظه الخرائط، تهبط رائدة الفضاء «ليال» بعد نداء استغاثة عمره أربعون عامًا. ما تجده ليس ناجين، بل مدينة كاملة تعيش على ضوء قمرين، وسرٌّ مدفون تحت الرمال المتوهجة قد يعيد رسم مستقبل الأرض نفسها.",
      [878, 12, 18],
      "2025-03-14",
      8.4,
      12840,
      96.4,
      P.dunes
    ),
    {
      runtime: 146,
      tagline: "تحت كل رملٍ مدينة، وتحت كل مدينة سؤال.",
      director: "ليان حدّاد",
      budget: 95,
      revenue: 412,
      cast: [
        ["ميرا سليمان", "ليال"],
        ["طارق العنزي", "قائد الحرس «جمر»"],
        ["هدى المزين", "عالمة اللغات «نوء»"],
        ["يوسف بركات", "الملاح الآلي صوتًا"],
        ["سلمى قنديل", "حاكمة المدينة"],
      ],
    },
  ],
  [
    m(
      102,
      "ظل المطر",
      "Shadow of Rain",
      "في مدينةٍ لا يتوقف مطرها، يحقق المفتش «غالب» في جرائم تُرتكب على إيقاع أغنية قديمة تذيعها محطة مهجورة. كل خيط يقوده إلى الماضي الذي حاول دفنه، وكل شاهد يغني اللحن نفسه.",
      [53, 80, 9648],
      "2024-11-08",
      7.9,
      8932,
      84.1,
      P.rain
    ),
    {
      runtime: 118,
      tagline: "المطر يغسل الشوارع… لا الذنوب.",
      director: "كريم نصّار",
      budget: 28,
      revenue: 96,
      cast: [
        ["عمر الديب", "المفتش غالب"],
        ["نادين خوري", "صاحبة المقهى «وردة»"],
        ["حسن مراد", "الرجل ذو المظلة"],
        ["ريتا عوض", "المذيعة المجهولة"],
      ],
    },
  ],
  [
    m(
      103,
      "عرش الرماد",
      "Throne of Ash",
      "حين احترق آخر تنين، ظنّت الممالك أن الحرب انتهت. لكن «آزر» حامل السيف الملتهب يكتشف أن الرماد نفسه يتذكر، وأن عرش أبيه لم يسقط… بل انتظر. ملحمة فانتازيا عن الوراثة والثمن الذي تفرضه.",
      [14, 28, 12],
      "2023-12-21",
      8.1,
      15218,
      91.7,
      P.ash
    ),
    {
      runtime: 152,
      tagline: "الرماد لا ينسى من أحرقه.",
      director: "باسل حمدان",
      budget: 140,
      revenue: 588,
      cast: [
        ["جواد الشامي", "آزر"],
        ["لينا مرعشلي", "كاهنة النار «وهج»"],
        ["قاسم ملحو", "الملك المنفي"],
        ["دانا سباعي", "قائدة الفرسان"],
        ["نبيل الأسعد", "حكيم الرماد"],
      ],
    },
  ],
  [
    m(
      104,
      "محطة ٧",
      "Platform Seven",
      "قطارٌ لا يتوقف إلا دقيقة واحدة في محطة مهجورة، وراكبان يلتقيان فيها صدفة كل عام. عبر عقدين من الرسائل والمواعيد المؤجلة، يسأل الفيلم: هل الحب ما نعيشه، أم ما ننتظره؟",
      [10749, 18],
      "2024-02-09",
      7.6,
      6410,
      62.3,
      P.platform
    ),
    {
      runtime: 104,
      tagline: "دقيقة واحدة تكفي لعمرٍ كامل.",
      director: "ريم الأنصاري",
      budget: 12,
      revenue: 54,
      cast: [
        ["أيمن زيدان الصغير", "«سامي»"],
        ["جنى قاسم", "«ليلى»"],
        ["فؤاد الحكيم", "ناظر المحطة"],
      ],
    },
  ],
  [
    m(
      105,
      "الطابق الأخير",
      "The Last Floor",
      "مصعد فندقٍ قديم يصعد دائمًا إلى طابق غير موجود في المخطط. حين تعلق «دانة» بين الطابقين الثاني عشر والثالث عشر، تكتشف أن النزلاء الذين سبقوها ما زالوا هناك… وأن الشمعة الوحيدة تضيء لهم لا لها.",
      [27, 53],
      "2023-10-31",
      6.8,
      4187,
      48.9,
      P.floor
    ),
    {
      runtime: 96,
      tagline: "بعض الأدوار لا تُبنى… بل تُستدعى.",
      director: "وسام طه",
      budget: 9,
      revenue: 41,
      cast: [
        ["سارة النجار", "دانة"],
        ["محمد الإبراهيمي", "عامل المصعد"],
        ["عليا حمادة", "نزيلة ١٩٧٤"],
      ],
    },
  ],
  [
    m(
      106,
      "جزر السماء",
      "Isles of the Sky",
      "حين بدأت جزر العالم تطفو نحو السماء، قررت الطفلة «نور» وجدها الطيّار العجوز أن يلحقا بها بمنطاد مرقّع. رحلة عائلية مدهشة عن الجذور حين تصير أجنحة، وعن البيوت التي نحملها معنا.",
      [16, 10751, 12],
      "2025-06-19",
      8.7,
      20315,
      99.2,
      P.isles
    ),
    {
      runtime: 101,
      tagline: "البيت هو المكان الذي يطير معك.",
      director: "هيا المنصوري",
      budget: 75,
      revenue: 630,
      cast: [
        ["لمى الخطيب", "نور (صوت)"],
        ["عبد الرحمن العقل", "الجد طيّار (صوت)"],
        ["زينب البحراني", "قائدة الأسطول (صوت)"],
        ["فارس الخالدي", "ساعي البريد الجوي (صوت)"],
      ],
    },
  ],
  [
    m(
      107,
      "ريح السموم",
      "Simoom",
      "في صيف ١٩١٦، يقود الفارس «ذياب» رتلًا من الفرقة عبر عاصفة رملية لا تنتهي، حاملًا رسالة قد توقف حربًا أو تشعل أخرى. ملحمة صحراوية مصوّرة على مدى ثلاث سنوات في قلب الربع الخالي.",
      [36, 28, 18],
      "2022-09-01",
      8.2,
      11470,
      77.5,
      P.simoom
    ),
    {
      runtime: 138,
      tagline: "الصحراء لا تنحاز… إلا لمن يصبر.",
      director: "ناصر القحطاني",
      budget: 60,
      revenue: 205,
      cast: [
        ["مشعل الرويلي", "ذياب"],
        ["عائشة بلقيس", "دليلة القوافل «مها»"],
        ["خالد الصاعدي", "الضابط العثماني"],
        ["تركي الدوسري", "الفارس الأصم"],
      ],
    },
  ],
  [
    m(
      108,
      "قبو الذهب",
      "The Gold Vault",
      "أربعة لصوص، خطة مستحيلة، وقبضٌ تحت بنكٍ مركزي تُضاء ممراته بأشعة تتحرك مع دقات القلب. لكن عضو الفريق الخامس الذي لا يعرفه أحد… هو من كتب الخطة أصلًا. سرقة القرن كما لم تُحكَ من قبل.",
      [80, 53, 28],
      "2024-07-25",
      7.4,
      7204,
      70.8,
      P.vault
    ),
    {
      runtime: 121,
      tagline: "الذهب ثقيل… والسر أثقل.",
      director: "زياد مهنا",
      budget: 45,
      revenue: 168,
      cast: [
        ["باسم ياخور الصغير", "«المهندس»"],
        ["رنا شميس", "«البهلوانة»"],
        ["أنس السباعي", "«السائق»"],
        ["كارلا حداد", "«الشبح»"],
        ["جهاد عبده", "مدير البنك"],
      ],
    },
  ],
  [
    m(
      109,
      "منارة الغربان",
      "Lighthouse of Crows",
      "عام ١٩٥٤، يصل حارس منارة جديد إلى جزيرة لا يزورها البريد، ويكتشف أن سلفه ترك دفترًا يحصي فيه الغربان… لا الطيور. كل يومٍ غراب ناقص، وكل غراب اسمٌ مفقود من سجل القرية. غموض قوطي يتنفس مع المدّ.",
      [9648, 18],
      "2023-04-13",
      8.0,
      9688,
      74.2,
      P.lighthouse
    ),
    {
      runtime: 112,
      tagline: "عدّها قبل أن تعدّك.",
      director: "إلياس خوري",
      budget: 18,
      revenue: 88,
      cast: [
        ["سمير العمري", "الحارس «إلياس»"],
        ["تيريز معلوف", "امرأة الشاطئ"],
        ["جورج قبرصي", "القسّ الأخرس"],
      ],
    },
  ],
  [
    m(
      110,
      "نيون ٢٠٩٩",
      "Neon 2099",
      "في مدينةٍ تسبح أسماكها الضوئية بين الأبراج، تعمل «ريم» سائقة توصيل للذكريات المهرّبة داخل شرائح نيون. حين تصلها شريحة تحمل ذاكرتها هي نفسها، تبدأ مطاردة عبر طوابق المدينة العمودية حتى قاعها المنسي.",
      [878, 28, 53],
      "2025-01-30",
      7.2,
      10233,
      88.6,
      P.neon
    ),
    {
      runtime: 127,
      tagline: "ذكرياتك ليست ملكك بعد الآن.",
      director: "دانا أبو لبن",
      budget: 80,
      revenue: 295,
      cast: [
        ["هيا عبد الغني", "ريم"],
        ["مازن الناطور", "سمسار الذاكرة «كاش»"],
        ["لينا شماميان", "المغنية الهولوغرامية (صوت)"],
        ["عماد حجازي", "شرطي الطابق صفر"],
      ],
    },
  ],
];

/* ===================== أربعة عشر فيلمًا إضافيًا (بوسترات تصميمية) ===================== */

const EXTRA: [Movie, DetailExtra][] = [
  [
    m(111, "مدينة الزجاج", "City of Glass",
      "معمارية شابة تعود لترميم برج جدها المتصدع، فتكتشف أن كل نافذة في المدينة تحتفظ بانعكاس يومٍ واحد من الماضي. دراما غموض عن المدن التي تتذكر سكانها أكثر مما يتذكرونها.",
      [9648, 18], "2022-05-12", 7.1, 3320, 41.2, null),
    { runtime: 108, tagline: "لكل نافذة يومٌ لا تريد نسيانه.", director: "غسان سلوم", budget: 14, revenue: 39,
      cast: [["مرح جبر", "المعمارية «جود»"], ["أنطوان شهيد", "حارس البرج"], ["لمى بدور", "الجارة العالمة"]] },
  ],
  [
    m(112, "قلب الصحراء", "Heart of the Desert",
      "طبيبة مدينة تَرِث بئرًا في قرية نائية، وتجد نفسها أمام خيارين: بيعه لشركة تنقيب، أو إنقاذ قرية كاملة عطشى. دراما إنسانية هادئة عن معنى أن تكون من مكانٍ ما.",
      [18], "2021-03-18", 7.8, 5214, 38.7, null),
    { runtime: 115, tagline: "الماء يعرف طريقه إلى البيت.", director: "أمينة بوشامة", budget: 8, revenue: 33,
      cast: [["صفاء سلطان الصغير", "الطبيبة «حنين»"], ["عبد الإله السناني", "شيخ القرية"], ["براء عادل", "مهندس الشركة"]] },
  ],
  [
    m(113, "رقصة القمر", "Moonlit Dance",
      "راقصة باليه تفقد سمعها ليلة افتتاح عرضها الأكبر، فتتعلم أن ترقص على اهتزازات خشبة المسرح ونبض الجمهور. قصة حبّ بين جسدٍ يصرّ وقلبٍ يترجم.",
      [10749, 18, 10402], "2023-08-24", 6.9, 2841, 33.5, null),
    { runtime: 99, tagline: "الموسيقى لا تُسمع دائمًا… لكنها تُرى.", director: "جودي كنعان", budget: 10, revenue: 27,
      cast: [["نايا فرنجية", "الراقصة «ألين»"], ["كريم الشاعر", "عازف التشيلو"], ["رولا عساف", "المخرجة الصارمة"]] },
  ],
  [
    m(114, "الغرفة ١٣", "Room Thirteen",
      "فريق تصوير يستأجر فندقًا مغلقًا لتصوير وثائقي عن نزلائه القدامى، لتكتشف المونتيرة أن اللقطات الليلية تُصوّر مشهدًا لم يخرجه أحد. رعب found-footage بروح محلية.",
      [27, 53], "2022-10-27", 6.5, 1990, 29.8, null),
    { runtime: 88, tagline: "الكاميرا رأت ما لم نجرؤ على رؤيته.", director: "فراس الخطيب", budget: 4, revenue: 18,
      cast: [["دلع نادر", "المونتيرة «سلمى»"], ["حيان ماضي", "المخرج"], ["وسن الخطيب", "المنتجة"]] },
  ],
  [
    m(115, "أجنحة الفجر", "Wings of Dawn",
      "عصفور صغير وُلد بلا ريش طيران يبني لنفسه جناحين من أوراق الرسائل المتروكة، ليكتشف أن كل رسالة تحمل قصة تستحق أن تُسلَّم. أنيميشن عائلي عن الكلمات التي تطير بنا.",
      [16, 10751], "2024-04-11", 8.3, 7412, 55.4, null),
    { runtime: 92, tagline: "كل رسالةٍ جناح.", director: "هيا المنصوري", budget: 40, revenue: 210,
      cast: [["طفل الأصوات «زين»", "العصفور «فجر» (صوت)"], ["رغد المهيري", "ساعية البريد (صوت)"], ["ماجد الفاسي", "البومة الحكيم (صوت)"]] },
  ],
  [
    m(116, "صيد الأشباح", "Ghost Hunt",
      "ثلاثة أصدقاء مفلسين يفتتحون وكالة لطرد الأشباح في حيّ لا يؤمن بالخرافات… حتى تظهر عروس الحي القديمة في كل حفلات الزفاف. كوميديا عائلية عن الخوف الذي نصنعه بأيدينا.",
      [35, 27], "2023-06-15", 6.7, 2410, 30.1, null),
    { runtime: 95, tagline: "الخرافة أفضل مشروعٍ تجاري في الحارة.", director: "معتز النمر", budget: 7, revenue: 24,
      cast: [["شادي الصفدي", "«أبو الفزعات»"], ["لميس عابد", "«المهندسة»"], ["عروة العربي", "«المؤثر»"]] },
  ],
  [
    m(117, "الساعة الصفر", "Hour Zero",
      "خبير متفجرات سابق يتلقى مكالمة: قنبلة في ملعب المدينة تنفجر مع صافرة النهاية ما لم يعترف الحكم بخطيئة ارتكبها قبل عشرين عامًا. إثارة لحظية تدور في ٩٠ دقيقة حقيقية.",
      [53, 28], "2025-02-20", 7.5, 4622, 66.9, null),
    { runtime: 94, tagline: "المباراة لم تبدأ بعد… والنهاية مقررة.", director: "زياد مهنا", budget: 22, revenue: 91,
      cast: [["جمال قبش الصغير", "الخبير «نادر»"], ["سامر إسماعيل الصغير", "الحكم"], ["هبة نور الصغير", "المفاوضة"]] },
  ],
  [
    m(118, "ملحمة الفرات", "Euphrates Saga",
      "ثلاثة أجيال من عائلة واحدة على ضفة النهر: الجد الذي زرع، والابن الذي هاجر، والحفيدة التي عادت لتبني سدًّا صغيرًا بالحجارة نفسها. بانوراما تاريخية عن الماء والذاكرة.",
      [36, 18], "2021-11-04", 8.0, 6105, 44.8, null),
    { runtime: 168, tagline: "النهر يغيّر مجراه… ولا يغيّر أبناءه.", director: "ناصر القحطاني", budget: 35, revenue: 120,
      cast: [["أسعد فضة الصغير", "الجد «خليل»"], ["ميسون أبو أسعد", "الحفيدة «فرات»"], ["باسل حيدر", "الابن"]] },
  ],
  [
    m(119, "ضحك في العتمة", "Laughter in the Dark",
      "كوميديان فاشل يرث دار سينما متهالكة بشرط واحد: أن يملأ مقاعدها كل ليلة لشهر كامل وإلا هُدمت. يبدأ بعروض ستاند-أب لجمهور لا يضحك… حتى يكتشف سرّ المقعد رقم ٤٠.",
      [35, 18], "2022-01-13", 7.0, 2755, 27.4, null),
    { runtime: 102, tagline: "الضحك آخر ضوءٍ يُطفأ.", director: "ريم الأنصاري", budget: 6, revenue: 21,
      cast: [["نضال حمادي", "الكوميديان «فواز»"], ["جيانا عيد الصغير", "عاملة التذاكر"], ["طوني عيسى الصغير", "المالك الغامض"]] },
  ],
  [
    m(120, "ما وراء النجوم", "Beyond the Stars",
      "تلسكوب مدرسي قديم يلتقط إشارة منتظمة من سديم يبعد ألف سنة ضوئية، ومعلمة العلوم الوحيدة التي تصدّق تلاميذها تخوض معركة لإقناع العالم. دراما خيال علمي عن الإيمان الصغير الذي يكبر.",
      [878, 18], "2024-09-05", 7.7, 5230, 51.6, null),
    { runtime: 119, tagline: "السماء تردّ… لمن يُحسن الإنصات.", director: "ليان حدّاد", budget: 25, revenue: 104,
      cast: [["كنده علوش الصغير", "المعلمة «أمل»"], ["ورد الخال الصغير", "التلميذ «يزن»"], ["عبد المنعم عمايري الصغير", "مدير المرصد"]] },
  ],
  [
    m(121, "وردة بغداد", "Rose of Baghdad",
      "في بغداد الخمسينيات، شاعرة شابة تخوض صالونات الأدب باسم مستعار، حتى يطلب الخليفة الشعري الأعظم لقاء «الشاعر» الذي هزّ قصائده المدينة. رومانسية تاريخية عن الصوت الذي لا جنس له.",
      [18, 10749], "2020-12-10", 7.9, 4480, 36.2, null),
    { runtime: 124, tagline: "القصيدة لا تعرف صاحبها… تعرف صدقه.", director: "أمينة بوشامة", budget: 15, revenue: 47,
      cast: [["شذى حسون الصغير", "الشاعرة «ورد»"], ["محمد هاشم الصغير", "الناقد «طه»"], ["إيناس طالب الصغير", "صاحبة الصالون"]] },
  ],
  [
    m(122, "القفص الذهبي", "The Golden Cage",
      "محامية جنائية لامعة تدافع عن رجل الأعمال الذي سجن شقيقها قبل سنوات، وتكتشف أن ملف القضية يحوي توقيعًا تعرفه جيدًا. جريمة درامية عن العدالة حين تجلس في المقعد الخطأ.",
      [80, 18], "2023-02-16", 7.3, 3690, 39.5, null),
    { runtime: 117, tagline: "كل قفصٍ ذهبي… بداخله سجين يعرف الباب.", director: "كريم نصّار", budget: 19, revenue: 62,
      cast: [["سلاف فواخرجي الصغير", "المحامية «ريما»"], ["جهاد سعد الصغير", "رجل الأعمال"], ["مصطفى المصطفى", "الشقيق"]] },
  ],
  [
    m(123, "همس الجدران", "Whisper of the Walls",
      "مهندسة صوت تسجل أصوات بيوت قديمة قبل هدمها للأرشيف، لتلتقط في بيتٍ دمشقي همسًا يكرر اسمها هي تحديدًا. غموض نفسي عن البيوت التي تسكننا قبل أن نسكنها.",
      [9648, 53], "2024-05-30", 6.8, 2214, 31.7, null),
    { runtime: 106, tagline: "الجدران لا تصمت… بل تنتظر أذنًا.", director: "وسام طه", budget: 8, revenue: 22,
      cast: [["نظلي الرواس الصغير", "مهندسة الصوت «جودي»"], ["فادي صبيح الصغير", "مالك البيت"], ["روبين عيسى الصغير", "الأرشيفية"]] },
  ],
  [
    m(124, "آخر قطار", "The Last Train",
      "قطار ليلي بين مدينتين يتعطل في نفق لا يظهر على الخرائط، ويجد الركاب السبعة أنفسهم أمام مقايضة: يعترف كل واحد بخطيئة، أو يبقى القطار واقفًا إلى الأبد. إثارة غرفة مغلقة بثمانين دقيقة مشدودة.",
      [53, 18], "2025-04-17", 7.6, 3905, 58.3, null),
    { runtime: 86, tagline: "الاعتراف تذكرة العبور الوحيدة.", director: "فراس الخطيب", budget: 11, revenue: 45,
      cast: [["باسم ياخور الصغير", "السائق «أبو النور»"], ["شكران مرتجى الصغير", "الراكبة الأولى"], ["ميلاد يوسف الصغير", "الطبيب"]] },
  ],
];

/* ===================== التجميع والفهارس ===================== */

const ALL: [Movie, DetailExtra][] = [...PREMIUM, ...EXTRA];

export const DEMO_DETAILS: Record<number, MovieDetails> = Object.fromEntries(
  ALL.map(([movie, extra]) => [movie.id, toDetails(movie, extra)])
);

export const DEMO_MOVIES: Movie[] = ALL.map(([movie]) => movie);

export const DEMO_TRENDING_ORDER = [102, 110, 106, 101, 108, 124, 104, 109, 117, 103, 107, 105];

export const DEMO_FEATURED = [106, 101, 109, 102, 110].map(
  (id) => DEMO_DETAILS[id]
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function demoTrending(): Promise<Movie[]> {
  await wait(420);
  return DEMO_TRENDING_ORDER.map((id) => DEMO_DETAILS[id]);
}

export async function demoTopRated(): Promise<Movie[]> {
  await wait(380);
  return [...DEMO_MOVIES].sort((a, b) => b.rating - a.rating || b.votes - a.votes);
}

export async function demoNowPlaying(): Promise<Movie[]> {
  await wait(360);
  return [...DEMO_MOVIES]
    .filter((mv) => mv.releaseDate >= "2024-09-01")
    .sort((a, b) => b.popularity - a.popularity);
}

export async function demoUpcoming(): Promise<Movie[]> {
  await wait(360);
  return [...DEMO_MOVIES]
    .filter((mv) => mv.releaseDate >= "2025-01-01")
    .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
}

export async function demoFeatured(): Promise<MovieDetails[]> {
  await wait(300);
  return DEMO_FEATURED;
}

export async function demoDetails(id: number): Promise<{
  details: MovieDetails;
  similar: Movie[];
}> {
  await wait(450);
  const details = DEMO_DETAILS[id];
  if (!details) throw new Error("not-found");
  const similar = DEMO_MOVIES.filter(
    (mv) =>
      mv.id !== id && mv.genreIds.some((g) => details.genreIds.includes(g))
  )
    .sort(
      (a, b) =>
        b.genreIds.filter((g) => details.genreIds.includes(g)).length -
          a.genreIds.filter((g) => details.genreIds.includes(g)).length ||
        b.rating - a.rating
    )
    .slice(0, 10);
  return { details, similar };
}

export async function demoDiscover(params: DiscoverParams): Promise<Page<Movie>> {
  await wait(500);
  let list = [...DEMO_MOVIES];
  if (params.genres.length)
    list = list.filter((mv) => params.genres.some((g) => mv.genreIds.includes(g)));
  if (params.year)
    list = list.filter((mv) => mv.releaseDate.startsWith(params.year));
  switch (params.sort) {
    case "vote_average.desc":
      list.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
      break;
    case "primary_release_date.desc":
      list.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
      break;
    case "revenue.desc":
      list.sort((a, b) => (DEMO_DETAILS[b.id]?.revenue ?? 0) - (DEMO_DETAILS[a.id]?.revenue ?? 0));
      break;
    default:
      list.sort((a, b) => b.popularity - a.popularity);
  }
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Math.min(params.page, totalPages);
  return {
    page,
    totalPages,
    totalResults: list.length,
    results: list.slice((page - 1) * pageSize, page * pageSize),
  };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "");

export async function demoSearch(query: string): Promise<Page<Movie>> {
  await wait(380);
  const q = norm(query.trim());
  if (!q)
    return { page: 1, totalPages: 0, totalResults: 0, results: [] };
  const results = DEMO_MOVIES.filter((mv) => {
    const d = DEMO_DETAILS[mv.id];
    const hay = norm(
      [
        mv.title,
        mv.originalTitle,
        d?.director ?? "",
        d?.tagline ?? "",
        ...(d?.cast.map((c) => c.name) ?? []),
        ...mv.genreIds
          .map((gid) => GENRES.find((g) => g.id === gid)?.name ?? "")
          .filter(Boolean),
      ].join(" ")
    );
    return q.split(/\s+/).every((part) => hay.includes(part));
  }).sort((a, b) => b.popularity - a.popularity);
  return { page: 1, totalPages: 1, totalResults: results.length, results };
}
