const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const write = (file, content) => {
  fs.writeFileSync(path.join(root, file), content, "utf8");
};

const navItems = [
  ["index.html", "الرئيسية", "home"],
  ["about.html", "من نحن", "about"],
  ["why-us.html", "لماذا نحن", "why"],
  ["services.html", "الخدمات", "services"],
  ["projects.html", "المشاريع", "projects"],
  ["clients.html", "العملاء", "clients"],
  ["certificates.html", "الشهادات", "certificates"],
  ["quote.html", "طلب عرض سعر", "quote"],
  ["contact.html", "تواصل معنا", "contact"],
];

const clientLogos = [
  ["assets/client-logos/amaala.png", "AMAALA"],
  ["assets/client-logos/red-sea-global.png", "Red Sea Global"],
  ["assets/client-logos/rcu.png", "Royal Commission for AlUla"],
  ["assets/client-logos/neom.png", "NEOM"],
  ["assets/client-logos/gaca.png", "GACA"],
  ["assets/client-logos/siac.png", "SIAC Construction"],
  ["assets/client-logos/hayyak.png", "Hayyak Lounge"],
  ["assets/client-logos/bec-arabia.png", "BEC Arabia"],
  ["assets/client-logos/six-senses.png", "Six Senses"],
  ["assets/client-logos/le-meridien.png", "Le Meridien"],
  ["assets/client-logos/house-express.png", "House Express"],
  ["assets/client-logos/rosewood.png", "Rosewood Hotel Group"],
  ["assets/client-logos/crowne-plaza.png", "Crowne Plaza Hotels and Resorts"],
];

const projects = [
  {
    title: "قاعة رويال",
    meta: "Auditorium / Fit-out",
    image: "assets/project-auditorium-clean.jpg",
    alt: "قاعة فعاليات بتشطيبات خشبية وإضاءة هادئة",
    text: "قاعة رسمية صممت لتجعل الحضور مركز المشهد: خشب دافئ، إضاءة دقيقة، ومسار ضيافة لا يترك التفاصيل للصدفة.",
  },
  {
    title: "حياك لاونج",
    meta: "Hospitality Lounge",
    image: "assets/project-hayyak-clean.jpg",
    alt: "منطقة ضيافة بكراسي ناعمة وطاولات رخامية",
    text: "لاونج ضيافة يوازن بين الراحة والانطباع الأول: مقاعد مطمئنة، خامات ناعمة، وحركة زيارة واضحة من لحظة الدخول.",
  },
  {
    title: "ليلاك بارك",
    meta: "Hotel Lobby",
    image: "assets/project-lica-clean.jpg",
    alt: "بهو فندقي مع مكتب استقبال بإضاءة دافئة",
    text: "استقبال فندقي بخطوط رأسية وضوء محسوب؛ مساحة تقود الضيف بهدوء وتمنح التشغيل اليومي واجهة أكثر اتزانا.",
  },
  {
    title: "مارفيلوس هوتيل",
    meta: "Hotel Interior",
    image: "assets/project-marvellous-clean.jpg",
    alt: "ردهة فندقية بأعمدة وتفاصيل إنارة زخرفية",
    text: "لغة فندقية هادئة تجمع الإضاءة المعمارية وتفاصيل الضيافة في مشهد واحد، بلا ازدحام ولا فراغ بارد.",
  },
  {
    title: "سويس إن تبوك",
    meta: "Suite Interior",
    image: "assets/project-swiss-clean.jpg",
    alt: "جناح فندقي بمقاعد وطاولة وتفاصيل جدارية",
    text: "جناح يرتب الإقامة كطقس يومي: جلسة، إضاءة، خامة، وتوزيع عملي يصلح للزيارة السريعة والإقامة الطويلة.",
  },
  {
    title: "هاوس إكسبرس",
    meta: "Commercial Interior",
    image: "assets/project-house-clean.jpg",
    alt: "مساحة تجارية حديثة بأرضيات فاتحة وأثاث مريح",
    text: "مساحة تجارية مباشرة وواثقة؛ كل تفصيل فيها يخدم العمل اليومي ويترك انطباعا مهنيا من أول خطوة.",
  },
];

const services = [
  ["تصميم داخلي", "نقرأ حركة المكان أولا، ثم نبني المخططات، التوجه البصري، ولوحات المواد على قرارات قابلة للتنفيذ."],
  ["تنفيذ وتشطيبات", "إدارة موقع دقيقة، تنسيق فرق العمل، ومعالجة التفاصيل حتى يصل المشروع إلى تسليم جاهز للتشغيل."],
  ["توريد وتجهيز", "أثاث، إنارة، خامات، وتجهيزات مختارة لطبيعة الاستخدام والميزانية ودرجة الانطباع المطلوبة."],
  ["تأثيث وفنشنغ", "اللمسة الأخيرة ليست زينة؛ هي اختيار القطع، الألوان، والملمس الذي يجعل تجربة الضيف مكتملة."],
  ["إدارة المشروع", "مسار واحد يربط الفكرة بالمورد والموقع، ويجعل القرار واضحا بدل أن يتشتت بين أكثر من جهة."],
  ["هوية المكان", "تفاصيل تجعل الفندق أو اللاونج أو المساحة التجارية قابلة للتذكر دون أن تفقد هدوءها."],
];

const certificates = [
  ["assets/certificates/certificate-commercial-registration.jpg", "السجل التجاري", "مستندات تسجيل تجاري رسمية"],
  ["assets/certificates/certificate-business-center.jpg", "المركز السعودي للأعمال", "بيانات كيان الأعمال"],
  ["assets/certificates/certificate-national-address.jpg", "العنوان الوطني", "إثبات العنوان الوطني"],
  ["assets/certificates/certificate-iso-45001.jpg", "ISO 45001:2018", "نظام إدارة الصحة والسلامة المهنية"],
  ["assets/certificates/certificate-fsc.jpg", "FSC", "مواد خشبية من مصادر مدارة بمسؤولية"],
];

const nav = (active) => navItems.map(([href, label, id]) =>
  `<a href="${href}"${id === active ? ` aria-current="page"` : ""}>${label}</a>`
).join("");

const logoFigures = (hidden = false) => clientLogos.map(([src, alt]) =>
  `<figure class="logo-tile"><img src="${src}" alt="${hidden ? "" : alt}"></figure>`
).join("");

const clientMarquee = () => `
<section class="logo-band" aria-label="Proud to have served">
  <div class="logo-band-inner">
    <p class="eyebrow">Proud to have served<span>نفخر بثقة جهات رائدة</span></p>
    <div class="logo-marquee">
      <div class="logo-track">
        <div class="logo-group">${logoFigures(false)}</div>
        <div class="logo-group" aria-hidden="true">${logoFigures(true)}</div>
      </div>
    </div>
  </div>
</section>`;

const pageHero = ({ label, title, text, image, alt = "" }) => `
<section class="page-hero">
  <img class="page-hero-media" src="${image}" alt="${alt}">
  <div class="page-hero-shade"></div>
  <div class="page-hero-content reveal">
    <p class="section-label">${label}</p>
    <h1>${title}</h1>
    <p>${text}</p>
  </div>
</section>`;

const shell = ({ id, title, description, body }) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${description}">
<title>${title}</title>
<script>document.documentElement.classList.add("js");</script>
<link rel="stylesheet" href="assets/site.css">
</head>
<body data-page="${id}">
<div class="progress" aria-hidden="true"><span></span></div>
<header class="topbar">
  <a class="brand" href="index.html" aria-label="ديفاني">
    <img src="assets/divani-logo.png" alt="">
    <span>ديفاني</span>
  </a>
  <nav class="navlinks" aria-label="التنقل الرئيسي">${nav(id)}</nav>
  <a class="command primary desktop-quote" href="quote.html">طلب عرض سعر</a>
  <button class="menu-button" type="button" aria-label="فتح القائمة" aria-controls="mobileDrawer" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</header>
<div class="mobile-drawer" id="mobileDrawer" aria-hidden="true" inert>
  <div class="mobile-panel">
    <button class="mobile-close" type="button" aria-label="إغلاق القائمة">×</button>
    <nav aria-label="تنقل الجوال">${nav(id)}</nav>
    <a class="command primary" href="quote.html">طلب عرض سعر</a>
  </div>
</div>
<main>
${body}
</main>
<a class="whatsapp-float" href="https://wa.me/966531100366" aria-label="واتساب مباشر">واتساب</a>
<footer class="footer">
  <div>
    <img src="assets/divani-logo.png" alt="ديفاني">
    <p>مساحات ضيافة وتجارية مصممة لتعمل بهدوء وتبقى في الذاكرة.</p>
  </div>
  <nav aria-label="روابط سريعة">
    <a href="projects.html">المشاريع</a>
    <a href="clients.html">العملاء</a>
    <a href="quote.html">طلب عرض سعر</a>
    <a href="contact.html">تواصل معنا</a>
  </nav>
  <small>© 2026 ديفاني</small>
</footer>
<script src="assets/site.js"></script>
</body>
</html>`;

const home = shell({
  id: "home",
  title: "ديفاني | تصميم وتنفيذ داخلي للمساحات الفندقية والتجارية",
  description: "ديفاني شركة تصميم وتنفيذ داخلي للمساحات الفندقية والتجارية في السعودية.",
  body: `
<section class="home-hero">
  <img class="home-hero-media" src="assets/magic-hero-rattan.jpg" alt="مشهد داخلي بتكوين خشبي منحني من أعمال ديفاني">
  <div class="home-hero-shade"></div>
  <div class="home-hero-content reveal">
    <p class="section-label">تصميم داخلي / تنفيذ / تأثيث</p>
    <h1>ديفاني</h1>
    <p>نصمم وننفذ مساحات ضيافة وتجارية هادئة، واضحة، وجاهزة للافتتاح من أول تفصيلة.</p>
    <div class="hero-actions">
      <a class="command primary" href="quote.html">ابدأ مشروعك</a>
      <a class="command" href="projects.html">استعرض الأعمال</a>
    </div>
  </div>
</section>
${clientMarquee()}
<section class="section intro-section">
  <div class="section-inner intro-focus reveal">
    <p class="section-label">نبذة عن الشركة</p>
    <h2>نصمم أماكن تستقبل الناس بوضوح وهدوء.</h2>
    <p class="lead">في ديفاني يبدأ المشروع من طريقة استخدام المكان: حركة الضيف، نقطة الضوء، ملمس الخامة، وسهولة التشغيل بعد التسليم.</p>
    <div class="proof-list">
      <div><strong>من 2009</strong><span>خبرة في مساحات ضيافة وتشغيل</span></div>
      <div><strong>Design</strong><span>تصميم جميل وقابل للتنفيذ</span></div>
      <div><strong>Fit-out</strong><span>تشطيب، توريد، وتأثيث تحت مسار واحد</span></div>
    </div>
  </div>
</section>
<section class="section project-reveal-section dark-section">
  <div class="section-inner">
    <div class="section-head reveal">
      <p class="section-label">المشاريع</p>
      <h2>المشروع هو المنتج.</h2>
      <a class="text-link" href="projects.html">كل المشاريع</a>
    </div>
    <div class="feature-project reveal">
      <img src="assets/project-lica-clean.jpg" alt="بهو فندقي مع مكتب استقبال بإضاءة دافئة">
      <div>
        <span class="project-kicker">Hotel Lobby</span>
        <h3>ليلاك بارك</h3>
        <p>بهو فندقي يوضح طريقة عمل ديفاني: خط نظر واضح، خامات دافئة، وإضاءة تجعل الوصول إلى الاستقبال بديهيا.</p>
      </div>
    </div>
  </div>
</section>
<section class="section paper-section">
  <div class="section-inner">
    <div class="section-head reveal">
      <p class="section-label">الخدمات</p>
      <h2>مسار واضح بدل قائمة طويلة.</h2>
      <a class="text-link" href="services.html">تفاصيل الخدمات</a>
    </div>
    <div class="service-rows">
      ${services.slice(0, 4).map(([name, text], i) => `<article class="service-row reveal"><small>0${i + 1}</small><h3>${name}</h3><p>${text}</p></article>`).join("")}
    </div>
  </div>
</section>
<section class="cta-band">
  <div class="section-inner split">
    <div>
      <p class="section-label">طلب عرض سعر</p>
      <h2>أرسل تفاصيل المساحة لنقترح بداية واضحة.</h2>
    </div>
    <div class="cta-actions">
      <a class="command primary" href="quote.html">اطلب قراءة أولية</a>
      <a class="command" href="https://wa.me/966531100366">تحدث مع ديفاني</a>
    </div>
  </div>
</section>`
});

const about = shell({
  id: "about",
  title: "من نحن | ديفاني",
  description: "نبذة عن شركة ديفاني للتصميم والتنفيذ الداخلي.",
  body: `
${pageHero({ label: "من نحن", title: "نصمم المساحة كما ستستخدم، لا كما ستصور فقط.", text: "ديفاني تعمل مع المساحات التي يجب أن تبدو راقية وتعمل بكفاءة في الوقت نفسه: فنادق، لاونجات، قاعات، ومشاريع تجارية تستقبل الناس كل يوم.", image: "assets/project-house-clean.jpg", alt: "مساحة تجارية حديثة بتشطيبات داخلية هادئة" })}
<section class="section">
  <div class="section-inner split">
    <div class="reveal">
      <p class="section-label">نبذة عن الشركة</p>
      <h2>نربط الشكل الجميل بطريقة استخدام المكان.</h2>
    </div>
    <div class="prose reveal">
      <p>نتعامل مع المشروع الداخلي كمنظومة واحدة: قراءة المساحة، ضبط التوجه البصري، اختيار الخامات، إدارة التنفيذ، وتجهيز المكان للتشغيل الفعلي.</p>
      <p>نريد للمكان أن يبدو متماسكا في الصور، وأن يظل مريحا وواضحا حين يبدأ الضيوف بالحركة ويبدأ الفريق بتشغيله كل يوم.</p>
    </div>
  </div>
</section>
<section class="section dark-section">
  <div class="section-inner values-grid">
    ${[
      ["وضوح", "نحول الذوق إلى قرارات يمكن قياسها وتنفيذها داخل الموقع."],
      ["هدوء", "نترك المساحة تتنفس، ونختار ما يخدم التجربة لا ما يملأ الفراغ."],
      ["مسؤولية", "نربط التصميم بالتوريد والتنفيذ حتى تبقى الصورة النهائية قابلة للتسليم."],
    ].map(([name, text]) => `<article class="value-card reveal"><h3>${name}</h3><p>${text}</p></article>`).join("")}
  </div>
</section>`
});

const why = shell({
  id: "why",
  title: "لماذا نحن | ديفاني",
  description: "أسباب اختيار ديفاني للتصميم والتنفيذ الداخلي.",
  body: `
${pageHero({ label: "لماذا نحن", title: "لأن الجمال وحده لا يكفي في مشروع يعمل كل يوم.", text: "المساحات الفندقية والتجارية تحتاج تصميما جميلا وسهل التشغيل. ديفاني تجمع القرار الجمالي والتنفيذي في مسار واحد واضح.", image: "assets/detail-ceiling.jpg", alt: "تفاصيل سقف وإنارة داخلية" })}
<section class="section paper-section">
  <div class="section-inner reason-grid">
    ${[
      ["جهة واحدة", "تصميم، تنفيذ، توريد، وتأثيث ضمن مسار لا يشتت المسؤولية."],
      ["خامات منضبطة", "مواد تناسب الاستخدام اليومي وتحافظ على أناقة المشهد بعد الافتتاح."],
      ["تنفيذ واضح", "قرارات قابلة للتطبيق في الموقع، وليست صورا جميلة يصعب بناؤها."],
      ["تجربة ضيافة", "نفكر في حركة الضيف، نقطة النظر، اللمسة الأولى، وسهولة الخدمة."],
    ].map(([name, text], i) => `<article class="reason reveal"><small>0${i + 1}</small><h3>${name}</h3><p>${text}</p></article>`).join("")}
  </div>
</section>
<section class="section">
  <div class="section-inner split">
    <img class="image-panel reveal" src="assets/detail-map-suite.jpg" alt="جدارية داخل جناح فندقي بتفاصيل محلية">
    <div class="reveal">
      <p class="section-label">طريقة العمل</p>
      <h2>نهدئ التفاصيل حتى تظهر الفخامة.</h2>
      <p class="lead">الفخامة ليست كثرة عناصر. هي ترتيب الضوء والخامة والحركة بحيث يشعر الزائر أن المكان مكتمل النية، ويشعر المشغل أن التفاصيل قابلة للإدارة.</p>
    </div>
  </div>
</section>`
});

const servicesPage = shell({
  id: "services",
  title: "الخدمات | ديفاني",
  description: "خدمات ديفاني في التصميم الداخلي والتنفيذ والتوريد والتأثيث.",
  body: `
${pageHero({ label: "الخدمات", title: "خدمات مترابطة من الفكرة إلى التسليم.", text: "نربط التصميم، التنفيذ، التوريد، التأثيث، وإدارة التفاصيل في مسار واحد يجعل المكان جاهزا للاستخدام والافتتاح.", image: "assets/detail-wood-auditorium.jpg", alt: "تفاصيل خشب وإنارة داخل قاعة" })}
<section class="section">
  <div class="section-inner service-grid">
    ${services.map(([name, text], i) => `<article class="service-card reveal"><small>${String(i + 1).padStart(2, "0")}</small><h3>${name}</h3><p>${text}</p></article>`).join("")}
  </div>
</section>
<section class="cta-band">
  <div class="section-inner split">
    <h2>لست متأكدا من نقطة البداية؟</h2>
    <a class="command primary" href="quote.html">أرسل تفاصيل المساحة</a>
  </div>
</section>`
});

const projectsPage = shell({
  id: "projects",
  title: "المشاريع | ديفاني",
  description: "معرض مشاريع ديفاني المنفذة في التصميم والتنفيذ الداخلي.",
  body: `
${pageHero({ label: "المشاريع", title: "مشاريع منفذة بهدوء وثقة.", text: "معرض مختار من أعمال الضيافة والقاعات والمساحات التجارية. كل صورة هنا دليل على قرار مكاني تم تنفيذه بعناية.", image: "assets/project-auditorium-clean.jpg", alt: "قاعة فعاليات بتشطيب خشبي وإضاءة مسرحية" })}
<section class="section">
  <div class="section-inner project-showcase">
    <figure class="project-stage reveal">
      <img id="projectImage" src="${projects[0].image}" alt="${projects[0].alt}">
      <figcaption><span id="projectMeta">${projects[0].meta}</span><strong id="projectTitle">${projects[0].title}</strong></figcaption>
    </figure>
    <div class="project-copy reveal">
      <p class="section-label">Project Gallery</p>
      <h2 id="projectPanelTitle">${projects[0].title}</h2>
      <p id="projectDescription">${projects[0].text}</p>
      <div class="project-picks" aria-label="اختيار مشروع">
        ${projects.map((project, i) => `<button class="project-pick" type="button" aria-pressed="${i === 0 ? "true" : "false"}" data-title="${project.title}" data-meta="${project.meta}" data-text="${project.text}" data-src="${project.image}" data-alt="${project.alt}"><small>${String(i + 1).padStart(2, "0")}</small><span>${project.title}</span></button>`).join("")}
      </div>
    </div>
  </div>
</section>
<section class="section dark-section">
  <div class="section-inner cards-grid">
    ${projects.map((project) => `<article class="project-card reveal"><img src="${project.image}" alt="${project.alt}"><div><span>${project.meta}</span><h3>${project.title}</h3><p>${project.text}</p></div></article>`).join("")}
  </div>
</section>`
});

const clientsPage = shell({
  id: "clients",
  title: "العملاء | ديفاني",
  description: "أبرز العملاء والشركاء الذين عملت معهم ديفاني.",
  body: `
${pageHero({ label: "العملاء", title: "ثقة جهات تحتاج مساحات تعمل كل يوم.", text: "الشعارات هنا دليل علاقة مهنية، لذلك نعرضها بوضوح واحترام: لا كخلفيات، ولا كقصاصات داخل صور المشروع.", image: "assets/magic-lobby.jpg", alt: "بهو داخلي هادئ من أعمال ديفاني" })}
${clientMarquee()}
<section class="section proof-section">
  <div class="section-inner logo-grid">
    ${clientLogos.map(([src, alt]) => `<figure class="logo-card reveal"><img src="${src}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`).join("")}
  </div>
</section>`
});

const certificatesPage = shell({
  id: "certificates",
  title: "الشهادات والاعتمادات | ديفاني",
  description: "عرض الشهادات والاعتمادات الخاصة بديفاني.",
  body: `
${pageHero({ label: "الشهادات والاعتمادات", title: "اعتمادات واضحة قبل أي اتفاق.", text: "نعرض المستندات والاعتمادات بصياغة نظيفة حتى تكون الثقة قابلة للمراجعة، لا مجرد عبارة داخل العرض.", image: "assets/detail-ceiling.jpg", alt: "تفاصيل إنارة وسقف داخلي" })}
<section class="section paper-section proof-section">
  <div class="section-inner certificate-grid">
    ${certificates.map(([src, title, text]) => `<article class="certificate-card reveal"><img src="${src}" alt="${title}"><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}
  </div>
</section>
<section class="cta-band">
  <div class="section-inner split">
    <h2>تحتاج نسخة رسمية ضمن ملف العرض؟</h2>
    <a class="command primary" href="contact.html">تواصل معنا</a>
  </div>
</section>`
});

const quoteForm = `
<form class="form-panel reveal" data-whatsapp-form data-form-title="طلب عرض سعر">
  <label>الاسم الكامل<input name="الاسم" required autocomplete="name"></label>
  <label>رقم الجوال<input type="tel" name="الجوال" required inputmode="tel" autocomplete="tel" minlength="9" placeholder="05xxxxxxxx"></label>
  <label>نوع المشروع<select name="نوع المشروع" required><option value="">اختر النوع</option><option>فندقي</option><option>تجاري</option><option>لاونج / ضيافة</option><option>قاعة / فعالية</option><option>أخرى</option></select></label>
  <label>المدينة<input name="المدينة" autocomplete="address-level2"></label>
  <label>الخدمة المطلوبة<select name="الخدمة"><option>تصميم وتنفيذ</option><option>تصميم داخلي</option><option>تنفيذ وتشطيبات</option><option>توريد وتأثيث</option><option>استشارة أولية</option></select></label>
  <label>الجدول الزمني<input name="الجدول الزمني" placeholder="مثال: خلال 3 أشهر"></label>
  <label class="full">تفاصيل مختصرة<textarea name="التفاصيل" rows="5" placeholder="المساحة، الهدف، المرحلة الحالية، وأي ملاحظات مهمة"></textarea></label>
  <button class="command primary full" type="submit">إرسال عبر واتساب</button>
</form>`;

const quotePage = shell({
  id: "quote",
  title: "طلب عرض سعر | ديفاني",
  description: "نموذج طلب عرض سعر لمشروع تصميم أو تنفيذ داخلي من ديفاني.",
  body: `
${pageHero({ label: "طلب عرض سعر", title: "صف لنا المساحة، وسنرتب الخطوة التالية.", text: "لا تحتاج ملفا كاملا كبداية. أرسل نوع المشروع، موقعه، المرحلة الحالية، وأي صور متاحة؛ وسنرتب الأسئلة التالية بوضوح.", image: "assets/project-lica-clean.jpg", alt: "مكتب استقبال فندقي بإضاءة دافئة" })}
<section class="section">
  <div class="section-inner form-layout">
    <div class="reveal">
      <p class="section-label">Quote Request</p>
      <h2>ما الذي يكفي كبداية؟</h2>
      <ul class="clean-list">
        <li>نوع المشروع وموقعه، حتى نفهم طبيعة التشغيل.</li>
        <li>هل تحتاج تصميم، تنفيذ، توريد، أو مسارا متكاملا؟</li>
        <li>الجدول الزمني التقريبي والمرحلة الحالية للمساحة.</li>
        <li>أي صور أو ملاحظات يمكن إرسالها لاحقا عبر واتساب.</li>
      </ul>
      <a class="command" href="https://wa.me/966531100366">واتساب مباشر</a>
    </div>
    ${quoteForm}
  </div>
</section>`
});

const contactForm = `
<form class="form-panel reveal" data-whatsapp-form data-form-title="رسالة تواصل">
  <label>الاسم<input name="الاسم" required autocomplete="name"></label>
  <label>رقم الجوال<input type="tel" name="الجوال" required inputmode="tel" autocomplete="tel" minlength="9" placeholder="05xxxxxxxx"></label>
  <label class="full">الرسالة<textarea name="الرسالة" rows="5" required></textarea></label>
  <button class="command primary full" type="submit">إرسال الرسالة عبر واتساب</button>
</form>`;

const contactPage = shell({
  id: "contact",
  title: "تواصل معنا | ديفاني",
  description: "تواصل مع ديفاني عبر واتساب أو الهاتف أو نموذج التواصل.",
  body: `
${pageHero({ label: "تواصل معنا", title: "أرسل رسالة قصيرة، ونرتب البداية.", text: "أرسل فكرة المشروع، صور المساحة، أو الموعد المتوقع. سنساعدك على تحويل البداية إلى قراءة واضحة للمكان والاحتياج.", image: "assets/project-hayyak-clean.jpg", alt: "مساحة ضيافة بمقاعد وطاولات هادئة" })}
<section class="section">
  <div class="section-inner form-layout">
    <div class="contact-stack reveal">
      <p class="section-label">Direct Contact</p>
      <h2>الطريقة الأسرع هي واتساب.</h2>
      <div class="contact-line"><small>واتساب</small><a class="ltr" href="https://wa.me/966531100366">wa.me/966531100366</a></div>
      <div class="contact-line"><small>الهاتف</small><a class="ltr" href="tel:+966531100366">+966 53 110 0366</a></div>
      <div class="contact-line"><small>الموقع</small><span>تبوك، المملكة العربية السعودية</span></div>
      <div class="contact-actions">
        <a class="command primary" href="https://wa.me/966531100366">واتساب مباشر</a>
        <a class="command" href="divani%20profile.pdf">تحميل البروفايل</a>
      </div>
    </div>
    ${contactForm}
  </div>
</section>`
});

write("assets/site.css", `:root{
  --black:#070706;--black-2:#0d0b09;--ink:#17120d;--bone:#f4eee4;--bone-soft:#d9cdbb;--paper:#e8dcc5;--gold:#d9b66f;--gold-soft:#efd99d;--line:rgba(244,238,228,.14);--dark-line:rgba(23,18,13,.16);--pad:64px;--wrap:1180px;--ease:cubic-bezier(.19,1,.22,1);--ease-out:cubic-bezier(.16,1,.3,1);--ease-soft:cubic-bezier(.22,.61,.36,1);--font:"SF Arabic","SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI","Dubai",Tahoma,sans-serif;
}
*{box-sizing:border-box}
@view-transition{navigation:auto}
html{scroll-behavior:smooth;background:var(--black)}
html,body{width:100%;max-width:100%;overflow-x:hidden}
body{margin:0;font-family:var(--font);color:var(--bone);background:linear-gradient(180deg,#070706,#0b0908 44%,#070706);line-height:1.72;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
main{animation:pageEnter .72s var(--ease-out) both;view-transition-name:page}
.is-leaving main{animation:pageLeave .32s var(--ease-soft) both}
body.menu-open{overflow:hidden}
a{color:inherit;text-decoration:none}
button,input,select,textarea{font:inherit}
button{color:inherit}
img{display:block;max-width:100%}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--gold-soft);outline-offset:4px}
.progress{position:fixed;z-index:100;inset-inline-start:0;top:0;width:100%;height:2px;background:rgba(244,238,228,.08);pointer-events:none}
.progress span{display:block;width:calc(var(--scroll-progress,0) * 100%);height:100%;background:linear-gradient(90deg,transparent,var(--gold-soft),transparent)}
.topbar{position:fixed;z-index:90;inset-inline:0;top:0;height:76px;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:22px;padding:0 var(--pad);background:linear-gradient(180deg,rgba(7,7,6,.92),rgba(7,7,6,.62));border-bottom:1px solid rgba(244,238,228,.08);backdrop-filter:blur(16px);view-transition-name:topbar}
.brand{display:inline-flex;align-items:center;gap:12px;min-width:max-content;font-weight:850}
.brand img{width:auto;height:40px;opacity:.94;view-transition-name:brand-mark}
.navlinks{justify-self:center;display:flex;align-items:center;gap:18px;font-size:.86rem;color:rgba(244,238,228,.68)}
.navlinks a{padding:10px 0;border-bottom:1px solid transparent;white-space:nowrap;transition:color .32s var(--ease-out),border-color .32s var(--ease-out)}
.navlinks a:hover,.navlinks a[aria-current="page"]{color:var(--bone);border-color:rgba(217,182,111,.75)}
.command{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:0 18px;border:1px solid rgba(244,238,228,.22);border-radius:999px;background:rgba(244,238,228,.02);color:var(--bone);cursor:pointer;transition:transform .34s var(--ease-out),border-color .34s var(--ease-out),background .34s var(--ease-out),box-shadow .34s var(--ease-out)}
.command:hover{transform:translateY(-2px);border-color:rgba(217,182,111,.65);background:rgba(217,182,111,.08)}
.command.primary{background:linear-gradient(135deg,var(--gold-soft),var(--gold));color:#151007;border-color:transparent;font-weight:800;box-shadow:0 16px 44px rgba(217,182,111,.12)}
.menu-button{display:none;width:46px;height:46px;border:1px solid rgba(244,238,228,.2);border-radius:50%;background:rgba(244,238,228,.03);place-items:center;gap:4px;padding:12px;cursor:pointer}
.menu-button span{width:18px;height:1px;background:var(--bone);display:block}
.mobile-drawer{position:fixed;z-index:110;inset:0;background:rgba(7,7,6,.78);opacity:0;pointer-events:none;transition:opacity .36s var(--ease-out)}
.mobile-drawer.open{opacity:1;pointer-events:auto}
.mobile-panel{position:absolute;inset-block:0;inset-inline-end:0;width:min(88vw,360px);padding:24px;background:#0b0908;border-inline-start:1px solid rgba(244,238,228,.14);transform:translate3d(-22px,0,0) scale(.985);transition:transform .46s var(--ease-out)}
.mobile-drawer.open .mobile-panel{transform:translateX(0)}
.mobile-close{width:46px;height:46px;border:1px solid rgba(244,238,228,.18);border-radius:50%;background:transparent;color:var(--bone);font-size:1.6rem;cursor:pointer}
.mobile-panel nav{display:grid;gap:4px;margin:34px 0}
.mobile-panel nav a{padding:14px 0;border-bottom:1px solid rgba(244,238,228,.1);color:rgba(244,238,228,.78)}
.mobile-panel nav a[aria-current="page"]{color:var(--gold-soft)}
.home-hero,.page-hero{position:relative;min-height:86svh;display:grid;align-items:end;padding:150px var(--pad) 84px;overflow:hidden;border-bottom:1px solid rgba(244,238,228,.08)}
.page-hero{min-height:58svh}
.home-hero-media,.page-hero-media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.015);animation:imageSettle 1.25s var(--ease-out) both;will-change:transform;view-transition-name:hero-media}
.home-hero-shade,.page-hero-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,7,6,.22),rgba(7,7,6,.72) 62%,#070706),linear-gradient(90deg,rgba(7,7,6,.16),rgba(7,7,6,.82))}
.home-hero-content,.page-hero-content{position:relative;z-index:1;width:min(100%,var(--wrap))}
.home-hero-content{max-width:600px;margin-left:auto;margin-right:0;text-align:right;transform:translateY(-34px)}
.page-hero-content{max-width:760px;margin-left:auto;margin-right:0;text-align:right;transform:translateY(-18px)}
.section-label,.eyebrow{margin:0 0 14px;color:var(--gold-soft);font-size:.78rem;font-weight:850;text-transform:uppercase;letter-spacing:0}
.eyebrow span{display:block;color:rgba(244,238,228,.64);font-size:.94rem;font-weight:650;text-transform:none;margin-top:7px}
h1,h2,h3,p{margin-top:0}
h1{font-size:3.65rem;line-height:1.05;margin-bottom:22px;font-weight:800}
.home-hero h1{font-size:5rem;line-height:1;font-weight:850}
h2{font-size:2.85rem;line-height:1.12;margin-bottom:20px;max-width:720px;font-weight:780}
h3{font-size:1.45rem;line-height:1.25;margin-bottom:10px}
.home-hero p,.page-hero p,.lead{font-size:1.1rem;color:rgba(244,238,228,.76);max-width:660px}
.hero-actions,.cta-actions,.contact-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.section{padding:112px var(--pad)}
.proof-section{padding-top:84px}
.dark-section{background:#050504}
.paper-section{background:var(--paper);color:var(--ink)}
.section-inner{width:min(100%,var(--wrap));margin:0 auto}
.split{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1fr);gap:64px;align-items:center}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:36px}
.text-link{color:var(--gold-soft);border-bottom:1px solid rgba(217,182,111,.55);padding-bottom:6px}
.intro-section{background:linear-gradient(180deg,#070706,#080706)}
.intro-focus{max-width:880px;text-align:center}
.intro-focus h2,.intro-focus .lead{margin-inline:auto}
.intro-focus .lead{max-width:720px}
.proof-list{display:grid;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:44px}
.proof-list div{display:grid;grid-template-columns:130px 1fr;gap:20px;padding:20px 0;border-bottom:1px solid var(--line)}
.proof-list div:last-child{border-bottom:0}
.proof-list strong{color:var(--gold-soft);direction:ltr}
.proof-list span,.prose p,.service-card p,.value-card p,.reason p,.project-card p,.certificate-card p,.contact-line span{color:rgba(244,238,228,.68)}
.paper-section .service-card p,.paper-section .reason p,.paper-section .certificate-card p{color:rgba(23,18,13,.66)}
.logo-band{padding:24px var(--pad);background:linear-gradient(180deg,#060605,#080706);border-block:1px solid rgba(244,238,228,.07);overflow:hidden}
.logo-band-inner{width:min(100%,var(--wrap));margin:0 auto;display:grid;grid-template-columns:190px minmax(0,1fr);gap:24px;align-items:center}
.logo-marquee{direction:ltr;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
.logo-track{display:flex;width:max-content;gap:8px;animation:logoMove 62s linear infinite;animation-delay:-12s}
.logo-group{display:flex;gap:8px}
.logo-tile{margin:0;width:132px;height:56px;flex:0 0 auto;display:grid;place-items:center;padding:10px 14px;border:1px solid rgba(244,238,228,.09);background:rgba(244,238,228,.022)}
.logo-tile img{max-height:34px;object-fit:contain;filter:saturate(.92) brightness(1.08);opacity:.78}
@keyframes logoMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.feature-project,.project-showcase{display:grid;grid-template-columns:1.08fr .92fr;gap:34px;align-items:stretch}
.project-showcase{gap:0;padding:12px;border:1px solid rgba(244,238,228,.1);background:linear-gradient(135deg,rgba(244,238,228,.035),rgba(244,238,228,.012));box-shadow:0 46px 120px rgba(0,0,0,.34)}
.project-reveal-section{background:radial-gradient(circle at 50% 0,rgba(217,182,111,.075),transparent 34%),#050504}
.feature-project{border:1px solid rgba(244,238,228,.1);padding:14px;background:rgba(244,238,228,.018);box-shadow:0 44px 120px rgba(0,0,0,.36)}
.feature-project img,.image-panel{width:100%;height:520px;object-fit:cover;border:1px solid rgba(244,238,228,.08);transition:transform .9s var(--ease-out),filter .9s var(--ease-out)}
.feature-project:hover img,.image-panel:hover{transform:scale(1.012);filter:saturate(1.04) contrast(1.03)}
.feature-project div{align-self:end;padding:34px 28px}
.project-kicker,.project-card span,.project-stage span{display:block;color:var(--gold-soft);font-size:.8rem;margin-bottom:8px}
.service-grid,.cards-grid,.logo-grid,.certificate-grid,.reason-grid,.values-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.service-grid.compact{grid-template-columns:repeat(4,minmax(0,1fr))}
.service-card,.value-card,.reason,.project-card,.logo-card,.certificate-card,.form-panel,.contact-stack{border:1px solid var(--line);background:rgba(244,238,228,.035);padding:24px;border-radius:6px;transition:transform .34s var(--ease-out),border-color .34s var(--ease-out),background .34s var(--ease-out)}
.service-rows{display:grid;border-top:1px solid var(--dark-line)}
.service-row{display:grid;grid-template-columns:64px minmax(160px,.34fr) minmax(0,1fr);gap:26px;align-items:start;padding:26px 0;border-bottom:1px solid var(--dark-line)}
.service-row small{direction:ltr;color:rgba(23,18,13,.52)}
.service-row h3{font-size:1.22rem;margin:0}
.service-row p{margin:0;color:rgba(23,18,13,.66)}
.service-card:hover,.value-card:hover,.reason:hover,.project-card:hover,.logo-card:hover,.certificate-card:hover{transform:translateY(-3px);border-color:rgba(217,182,111,.34);background:rgba(244,238,228,.052)}
.paper-section .service-card,.paper-section .reason,.paper-section .certificate-card{border-color:var(--dark-line);background:rgba(255,255,255,.24)}
.service-card small,.reason small{color:var(--gold);direction:ltr}
.cta-band{padding:72px var(--pad);background:linear-gradient(90deg,rgba(217,182,111,.14),rgba(244,238,228,.035));border-block:1px solid rgba(244,238,228,.1)}
.project-stage{margin:0;min-height:560px;position:relative;overflow:hidden;border:1px solid var(--line);background:#050504;box-shadow:0 38px 100px rgba(0,0,0,.28)}
.project-showcase .project-stage{min-height:620px;border:0;box-shadow:none}
.project-showcase .project-stage::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 46%,rgba(5,5,4,.62));pointer-events:none}
.project-stage img{width:100%;height:100%;object-fit:cover;transition:opacity .48s var(--ease-out),transform .62s var(--ease-out),filter .48s var(--ease-out);view-transition-name:project-image}
.project-stage.is-switching img{opacity:.26;transform:scale(1.028);filter:blur(8px) saturate(.84)}
.project-stage figcaption{position:absolute;z-index:2;inset-inline:22px;bottom:20px;padding:18px;background:rgba(7,7,6,.72);border:1px solid rgba(244,238,228,.13);backdrop-filter:blur(12px)}
.project-stage strong{font-size:1.35rem;view-transition-name:project-stage-title}
.project-copy{min-height:620px;display:flex;flex-direction:column;justify-content:center;border:0;padding:46px;background:linear-gradient(180deg,rgba(7,7,6,.92),rgba(7,7,6,.68))}
#projectPanelTitle{font-size:3.15rem;line-height:1.05;max-width:none;view-transition-name:project-title}
#projectDescription{max-width:520px;font-size:1.06rem;color:rgba(244,238,228,.74);view-transition-name:project-description}
.project-picks{display:grid;margin-top:34px;border-top:1px solid var(--line)}
.project-pick{display:grid;grid-template-columns:44px 1fr;gap:12px;text-align:right;padding:16px 0;border:0;border-bottom:1px solid var(--line);background:transparent;cursor:pointer;transition:padding .3s var(--ease-out),color .3s var(--ease-out)}
.project-pick small{direction:ltr;color:rgba(244,238,228,.48)}
.project-pick[aria-pressed="true"]{padding-inline-end:12px}
.project-pick[aria-pressed="true"] span,.project-pick[aria-pressed="true"] small,.project-pick:hover span{color:var(--gold-soft)}
.project-card{padding:0;overflow:hidden}
.project-card img{width:100%;height:240px;object-fit:cover;transition:transform .75s var(--ease-out),filter .75s var(--ease-out)}
.project-card:hover img{transform:scale(1.025);filter:saturate(1.04) contrast(1.03)}
.project-card div{padding:22px}
.logo-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
.logo-card{display:grid;place-items:center;text-align:center;min-height:150px}
.proof-section .logo-card{min-height:136px;background:linear-gradient(180deg,rgba(244,238,228,.04),rgba(244,238,228,.018))}
.logo-card img{max-height:54px;object-fit:contain;margin-bottom:16px;filter:saturate(.98) brightness(1.1)}
.logo-card figcaption{color:rgba(244,238,228,.68);font-size:.86rem}
.certificate-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.certificate-card{display:grid;grid-template-columns:180px 1fr;gap:22px;align-items:center}
.proof-section .certificate-card{background:rgba(255,255,255,.3);box-shadow:0 28px 80px rgba(23,18,13,.08)}
.certificate-card img{width:100%;max-height:220px;object-fit:contain;background:#fff;border:1px solid var(--dark-line)}
.form-layout{display:grid;grid-template-columns:.78fr 1.22fr;gap:50px;align-items:start}
.form-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;background:linear-gradient(180deg,rgba(244,238,228,.045),rgba(244,238,228,.018));box-shadow:0 34px 90px rgba(0,0,0,.24)}
.form-panel label{display:grid;gap:7px;color:rgba(244,238,228,.72);font-size:.92rem;transition:color .28s var(--ease-out)}
.form-panel label:focus-within{color:var(--gold-soft)}
.form-panel .full{grid-column:1/-1}
input,select,textarea{width:100%;min-height:52px;border:1px solid rgba(244,238,228,.16);background:rgba(244,238,228,.04);color:var(--bone);padding:13px 14px;border-radius:6px;transition:border-color .28s var(--ease-out),background .28s var(--ease-out),box-shadow .28s var(--ease-out)}
input:focus,select:focus,textarea:focus{border-color:rgba(239,217,157,.72);background:rgba(244,238,228,.065);box-shadow:0 0 0 4px rgba(217,182,111,.1)}
input:user-invalid,select:user-invalid,textarea:user-invalid{border-color:rgba(255,129,104,.72);box-shadow:0 0 0 4px rgba(255,129,104,.1)}
input::placeholder,textarea::placeholder{color:rgba(244,238,228,.36)}
select option{color:#151007}
textarea{resize:vertical}
.clean-list{padding:0;margin:24px 0;list-style:none;color:rgba(244,238,228,.7)}
.clean-list li{padding:12px 0;border-bottom:1px solid var(--line)}
.contact-line{display:grid;grid-template-columns:110px 1fr;gap:14px;padding:16px 0;border-bottom:1px solid var(--line)}
.contact-line small{color:var(--gold-soft)}
.ltr{direction:ltr;unicode-bidi:isolate}
.footer{display:grid;grid-template-columns:1fr auto auto;gap:34px;align-items:center;padding:34px var(--pad);border-top:1px solid rgba(244,238,228,.1);background:#050504;color:rgba(244,238,228,.62)}
.footer img{height:36px;width:auto;margin-bottom:10px}
.footer p{margin:0}
.footer nav{display:flex;gap:18px;flex-wrap:wrap}
.footer small{direction:ltr}
.whatsapp-float{position:fixed;z-index:70;inset-inline-start:22px;bottom:22px;min-height:42px;padding:0 15px;display:inline-flex;align-items:center;gap:8px;border-radius:999px;border:1px solid rgba(39,174,96,.42);background:rgba(7,7,6,.72);color:var(--bone);font-weight:800;box-shadow:0 18px 42px rgba(0,0,0,.32);backdrop-filter:blur(14px)}
.whatsapp-float::before{content:"";width:7px;height:7px;border-radius:50%;background:#27ae60;box-shadow:0 0 16px rgba(39,174,96,.62)}
body[data-page="quote"] .whatsapp-float,body[data-page="contact"] .whatsapp-float{display:none}
.reveal{opacity:1;transform:none}
.js .reveal{opacity:0;transform:translateY(16px);filter:blur(6px);transition:opacity .72s var(--ease-out),transform .72s var(--ease-out),filter .72s var(--ease-out)}
.js .reveal.in{opacity:1;transform:none;filter:blur(0);animation:contentLift .78s var(--ease-out) both}
@keyframes pageEnter{from{opacity:0}to{opacity:1}}
@keyframes pageLeave{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateY(10px) scale(.992);filter:blur(8px)}}
@keyframes vtPageOut{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateY(14px) scale(.992);filter:blur(10px)}}
@keyframes vtPageIn{from{opacity:0;transform:translateY(18px) scale(1.006);filter:blur(12px)}to{opacity:1;transform:none;filter:none}}
@keyframes vtHeroOut{from{opacity:1;filter:none}to{opacity:.18;filter:blur(14px) saturate(.8)}}
@keyframes vtHeroIn{from{opacity:0;transform:scale(1.025);filter:blur(12px) saturate(.9)}to{opacity:1;transform:none;filter:none}}
@keyframes vtProjectImageOut{from{opacity:1;transform:none;filter:none}to{opacity:.18;transform:scale(.985);filter:blur(14px) saturate(.82)}}
@keyframes vtProjectImageIn{from{opacity:0;transform:scale(1.035);filter:blur(14px) saturate(.86)}to{opacity:1;transform:none;filter:none}}
@keyframes vtTextOut{from{opacity:1;transform:none;filter:none}to{opacity:0;transform:translateY(8px);filter:blur(6px)}}
@keyframes vtTextIn{from{opacity:0;transform:translateY(10px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes imageSettle{from{transform:scale(1.045);filter:saturate(.9) brightness(.88)}to{transform:scale(1);filter:saturate(1) brightness(1)}}
@keyframes contentLift{from{opacity:0;transform:translateY(16px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
::view-transition-old(root),::view-transition-new(root){animation-duration:.78s;animation-timing-function:var(--ease-out);background:var(--black)}
::view-transition-old(page){animation:vtPageOut .42s var(--ease-soft) both}
::view-transition-new(page){animation:vtPageIn .78s var(--ease-out) both}
::view-transition-group(topbar),::view-transition-group(brand-mark){animation-duration:.5s;animation-timing-function:var(--ease-out)}
::view-transition-old(hero-media){animation:vtHeroOut .5s var(--ease-soft) both}
::view-transition-new(hero-media){animation:vtHeroIn .9s var(--ease-out) both}
::view-transition-group(project-image){animation-duration:.82s;animation-timing-function:var(--ease-out)}
::view-transition-old(project-image){animation:vtProjectImageOut .42s var(--ease-soft) both}
::view-transition-new(project-image){animation:vtProjectImageIn .82s var(--ease-out) both}
::view-transition-old(project-title),::view-transition-old(project-stage-title),::view-transition-old(project-description){animation:vtTextOut .28s var(--ease-soft) both}
::view-transition-new(project-title),::view-transition-new(project-stage-title),::view-transition-new(project-description){animation:vtTextIn .54s var(--ease-out) both}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;scroll-behavior:auto!important;transition:none!important}.js .reveal{opacity:1;transform:none;filter:none}main{animation:none}.home-hero-media,.page-hero-media{transform:none}::view-transition-old(root),::view-transition-new(root),::view-transition-old(page),::view-transition-new(page),::view-transition-old(hero-media),::view-transition-new(hero-media),::view-transition-old(project-image),::view-transition-new(project-image),::view-transition-old(project-title),::view-transition-new(project-title),::view-transition-old(project-stage-title),::view-transition-new(project-stage-title),::view-transition-old(project-description),::view-transition-new(project-description){animation:none!important}}
@media (max-width:1160px){:root{--pad:34px}.navlinks{display:none}.desktop-quote{display:none}.menu-button{display:grid}.topbar{grid-template-columns:auto 1fr auto}.brand{justify-self:start}}
@media (max-width:760px){:root{--pad:18px}.topbar{height:68px}.brand img{height:34px}.home-hero,.page-hero{min-height:76svh;padding-top:118px;padding-bottom:44px}.home-hero-content{transform:translateY(-18px)}.page-hero{min-height:50svh}.page-hero-content{transform:none}.page-hero h1{font-size:2.08rem;line-height:1.16}h1{font-size:2.38rem;line-height:1.1}.home-hero h1{font-size:3rem}h2{font-size:1.82rem;line-height:1.18}.home-hero p,.page-hero p,.lead{font-size:1rem}.section{padding:76px var(--pad)}.intro-focus{text-align:right}.intro-focus h2,.intro-focus .lead{margin-inline:0}.proof-list{margin-top:30px}.proof-list div{grid-template-columns:1fr;gap:4px;padding:16px 0}.split,.feature-project,.project-showcase,.form-layout,.footer{grid-template-columns:1fr;gap:26px}.section-head{display:grid;gap:10px}.logo-band-inner{grid-template-columns:1fr;gap:14px}.logo-band{padding-block:22px}.logo-marquee{margin-inline:calc(var(--pad) * -1);padding-inline:var(--pad)}.logo-tile{width:112px;height:52px}.logo-tile img{max-height:32px}.service-grid,.service-grid.compact,.cards-grid,.logo-grid,.certificate-grid,.reason-grid,.values-grid{grid-template-columns:1fr}.service-row{grid-template-columns:42px 1fr;gap:14px;padding:20px 0}.service-row p{grid-column:2}.feature-project{padding:10px}.feature-project img,.image-panel{height:320px}.feature-project div{padding:18px 6px 8px}.project-showcase{padding:0;border:0;background:transparent;box-shadow:none}.project-showcase .project-stage{min-height:360px}.project-copy{min-height:auto;padding:26px 18px}#projectPanelTitle{font-size:2.12rem;line-height:1.12}.project-stage{min-height:350px}.project-card img{height:220px}.certificate-card{grid-template-columns:1fr}.form-panel{grid-template-columns:1fr}.footer nav{display:grid}.whatsapp-float{display:none}body[data-page="quote"] .whatsapp-float,body[data-page="contact"] .whatsapp-float{display:none}.contact-line{grid-template-columns:1fr}}
`);

write("assets/site.js", `(() => {
  const drawer = document.getElementById("mobileDrawer");
  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.querySelector(".mobile-close");
  const drawerLinks = drawer ? Array.from(drawer.querySelectorAll("a")) : [];
  const focusables = [closeButton].concat(drawerLinks).filter(Boolean);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsViewTransitions = "startViewTransition" in document;

  function openDrawer(){
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
    drawer.removeAttribute("inert");
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded","true");
    window.setTimeout(() => closeButton.focus({preventScroll:true}), 120);
  }

  function closeDrawer(){
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
    drawer.setAttribute("inert","");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.focus({preventScroll:true});
  }

  if(drawer && menuButton && closeButton){
    menuButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", event => { if(event.target === drawer) closeDrawer(); });
    drawerLinks.forEach(link => link.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", event => {
      if(event.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
      if(event.key === "Tab" && drawer.classList.contains("open") && focusables.length){
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
        else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
      }
    });
  }

  function isTransitionableLink(link){
    if(!link || (link.target && link.target !== "_self")) return false;
    if(link.hasAttribute("download")) return false;
    const raw = link.getAttribute("href") || "";
    if(!raw || raw.startsWith("#")) return false;
    let url;
    try { url = new URL(raw, window.location.href); }
    catch { return false; }
    if(url.origin !== window.location.origin) return false;
    if(url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") return false;
    if(/\\.pdf($|[?#])/i.test(url.pathname)) return false;
    if(url.pathname === window.location.pathname && url.hash) return false;
    return true;
  }

  if(!supportsViewTransitions && !reduced){
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target ? target.closest("a[href]") : null;
      if(!isTransitionableLink(link)) return;
      event.preventDefault();
      document.documentElement.classList.add("is-leaving");
      window.setTimeout(() => { window.location.href = link.href; }, 260);
    });
  }

  const stage = document.querySelector(".project-stage");
  const pageMain = document.querySelector("main");
  const heroMedia = document.querySelector(".home-hero-media,.page-hero-media");
  const projectImage = document.getElementById("projectImage");
  const projectTitle = document.getElementById("projectTitle");
  const projectMeta = document.getElementById("projectMeta");
  const panelTitle = document.getElementById("projectPanelTitle");
  const projectDescription = document.getElementById("projectDescription");
  let projectTimer = 0;
  let projectToken = 0;

  function preloadProjectImage(src){
    return new Promise(resolve => {
      if(!src){ resolve(); return; }
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });
  }

  function applyProject(button){
    if(projectImage){ projectImage.src = button.dataset.src; projectImage.alt = button.dataset.alt; }
    if(projectTitle) projectTitle.textContent = button.dataset.title;
    if(projectMeta) projectMeta.textContent = button.dataset.meta;
    if(panelTitle) panelTitle.textContent = button.dataset.title;
    if(projectDescription) projectDescription.textContent = button.dataset.text;
    stage && stage.classList.remove("is-switching");
  }

  document.querySelectorAll(".project-pick").forEach(button => {
    button.addEventListener("click", async () => {
      if(button.getAttribute("aria-pressed") === "true") return;
      const token = ++projectToken;
      window.clearTimeout(projectTimer);
      document.querySelectorAll(".project-pick").forEach(item => item.setAttribute("aria-pressed","false"));
      button.setAttribute("aria-pressed","true");
      await preloadProjectImage(button.dataset.src);
      if(token !== projectToken) return;
      if(supportsViewTransitions && !reduced){
        const suspendedTransitions = [pageMain, heroMedia].filter(Boolean).map(element => ({
          element,
          value: element.style.getPropertyValue("view-transition-name")
        }));
        suspendedTransitions.forEach(({ element }) => element.style.setProperty("view-transition-name","none"));
        let transition;
        try {
          transition = document.startViewTransition(() => applyProject(button));
        } catch {
          suspendedTransitions.forEach(({ element, value }) => element.style.setProperty("view-transition-name", value));
          applyProject(button);
          return;
        }
        const restorePageTransition = () => {
          suspendedTransitions.forEach(({ element, value }) => element.style.setProperty("view-transition-name", value));
        };
        transition.ready.catch(() => {}).finally(restorePageTransition);
        transition.updateCallbackDone.catch(() => {});
        transition.finished.catch(() => {}).finally(() => stage && stage.classList.remove("is-switching"));
        return;
      }
      stage && stage.classList.add("is-switching");
      projectTimer = window.setTimeout(() => applyProject(button), 220);
    });
  });

  document.querySelectorAll("[data-whatsapp-form]").forEach(form => {
    const fields = Array.from(form.elements).filter(field => "setCustomValidity" in field);

    function fieldLabel(field){
      const label = field.closest("label");
      if(!label) return field.name || "هذا الحقل";
      const text = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).join(" ");
      return text || field.name || "هذا الحقل";
    }

    function validationText(field){
      const label = fieldLabel(field);
      if(field.validity.valueMissing) return "يرجى تعبئة " + label + ".";
      if(field.validity.tooShort) return label + " أقصر من المطلوب.";
      if(field.validity.typeMismatch) return "يرجى إدخال " + label + " بصيغة صحيحة.";
      if(field.validity.patternMismatch) return "يرجى مراجعة " + label + ".";
      return "";
    }

    fields.forEach(field => {
      field.addEventListener("invalid", () => {
        field.setCustomValidity("");
        field.setCustomValidity(validationText(field));
      });
      field.addEventListener("input", () => field.setCustomValidity(""));
      field.addEventListener("change", () => field.setCustomValidity(""));
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      fields.forEach(field => {
        field.setCustomValidity("");
        if(!field.validity.valid) field.setCustomValidity(validationText(field));
      });
      if(!form.checkValidity()) return;
      const title = form.dataset.formTitle || "رسالة من موقع ديفاني";
      const lines = [title];
      Array.from(form.elements).forEach(field => {
        if(!field.name || field.type === "submit" || !field.value.trim()) return;
        lines.push(field.name + ": " + field.value.trim());
      });
      window.open("https://wa.me/966531100366?text=" + encodeURIComponent(lines.join("\\n")), "_blank", "noopener");
    });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  function sync(){
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty("--scroll-progress", Math.min(1, Math.max(0, window.scrollY / maxScroll)).toFixed(4));
    if(reduced) return;
    const trigger = window.innerHeight * .9;
    revealItems.forEach((item, index) => {
      if(item.classList.contains("in")) return;
      const delay = Math.min(index % 3, 2) * 60 + "ms";
      item.style.transitionDelay = delay;
      item.style.animationDelay = delay;
      const rect = item.getBoundingClientRect();
      if(rect.top < trigger && rect.bottom > -80) item.classList.add("in");
    });
  }
  if(reduced) revealItems.forEach(item => item.classList.add("in"));
  else {
    window.addEventListener("scroll", sync, {passive:true});
    window.addEventListener("resize", sync);
    requestAnimationFrame(sync);
    window.setTimeout(() => revealItems.forEach(item => item.classList.add("in")), 900);
  }
})();`);

const pages = {
  "index.html": home,
  "Divani (1).html": home,
  "about.html": about,
  "why-us.html": why,
  "services.html": servicesPage,
  "projects.html": projectsPage,
  "clients.html": clientsPage,
  "certificates.html": certificatesPage,
  "quote.html": quotePage,
  "contact.html": contactPage,
};

for (const [file, content] of Object.entries(pages)) {
  write(file, content);
}

console.log(`Generated ${Object.keys(pages).length} HTML files plus shared CSS/JS.`);
