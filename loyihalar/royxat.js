/* ============================================
   LOYIHALAR RO'YXATI
   ============================================

   Yangi loyiha qo'shish (4 qadam):

   1) loyihalar/ papkasida yangi papka oching.
      Masalan:  loyihalar/ombor hisobi

   2) Loyiha rasmlarini shu papkaga tashlang. Nomlari quyidagicha bo'lsin:
        1.png  2.png  3.png ...              — o'zingiz raqamlasangiz
        1 (1).png  1 (2).png  1 (3).png ...  — Windows'da hammasini belgilab,
                                               bittasini "1" deb qayta nomlasangiz
      (12 tagacha; .jpg .jpeg .png .webp). Sayt ularni o'zi topadi.
      1-rasm kartada chiqadi, ustiga bosilganda hammasi katta oynada ochiladi.

   3) Havola bo'lsa (masalan Google Sheets), shu papkaga matn fayli qo'ying:
      link.txt yoki Windows bergan "Текстовый документ.txt" nomi bilan.
      Har qatorga bitta havola. Tugmaga o'z nomingizni bermoqchi bo'lsangiz:
        Jadvalni ochish | https://docs.google.com/spreadsheets/d/....
      Nom yozilmasa, Google Sheets havolasi uchun "Jadvalni ochish" chiqadi.
      Google Sheets jadvali hammaga ochilishi uchun jadvalda
      "Havolaga ega har kim ko'ra oladi" ruxsatini yoqing.

   4) Quyidagi ro'yxatga bitta yozuv qo'shing (papka nomi aynan bir xil bo'lsin):
        { papka: "ombor-hisobi", nomi: "Ombor hisobi", tavsif: "Qisqa izoh", teglar: ["Google Sheets"] },

   Ixtiyoriy maydonlar:
     video: "https://youtu.be/..."   — kartada "Videoni ko'rish" tugmasi chiqadi
                                       (video YouTube'da Ochiq yoki Havola orqali bo'lsin)
     rasmlar: ["a.png", "b.png"]     — rasm nomlari raqam bo'lmasa, nomlarini shu yerga
                                       tartib bilan yozing (masalan, "Снимок экрана ..." fayllar)

   Rus va ingliz tilidagi matn ham ixtiyoriy —
        ru: { nomi: "...", tavsif: "..." }, en: { nomi: "...", tavsif: "..." }
   Berilmasa, hamma tilda o'zbekcha matn ko'rinadi.

   Eslatma: har bir { ... } oxirida vergul (,) bo'lsin. Kartalar shu tartibda chiqadi.
   ============================================ */

window.LOYIHALAR = [
  {
    papka: "kirim-chiqim",
    nomi: "Kirim-Chiqim boshqaruv tizimi",
    tavsif: "Korxonaning kirim va chiqimlarini yuritish hamda natijani avtomatik hisoblash tizimi.",
    teglar: ["Google Sheets", "Apps Script"],
    ru: { nomi: "Система учёта прихода и расхода", tavsif: "Ведение доходов и расходов компании с автоматическим расчётом результата." },
    en: { nomi: "Income & Expense management system", tavsif: "Tracks a company's income and expenses and calculates the result automatically." }
  },
  {
    papka: "oquv markaz demo",
    nomi: "O'quv markaz boshqaruv tizimi",
    tavsif: "Guruhlar, o'quvchilar, to'lovlar, qarzdorlar va xarajatlar hisobi. Oylik hisobot, o'qituvchi ulushi va markaz daromadi avtomatik hisoblanadi.",
    teglar: ["Google Sheets", "Demo"],
    ru: { nomi: "Система управления учебным центром", tavsif: "Учёт групп, учеников, оплат, должников и расходов. Месячный отчёт, доля преподавателя и доход центра считаются автоматически." },
    en: { nomi: "Training center management system", tavsif: "Tracks groups, students, payments, debtors and expenses. The monthly report, teacher share and center income are calculated automatically." }
  },
  {
    papka: "klaster boshqaruvi demo",
    nomi: "Klaster boshqaruvi",
    tavsif: "Klasterlar bo'yicha kunlik ko'rsatkichlar, kirim-chiqim (prixod va rasxod) hisobi hamda tanlangan sana oralig'i bo'yicha jamlanma.",
    teglar: ["Google Sheets", "Demo"],
    ru: { nomi: "Управление кластером", tavsif: "Ежедневные показатели по кластерам, учёт прихода и расхода и сводка за выбранный период." },
    en: { nomi: "Cluster management", tavsif: "Daily figures per cluster, income and expense tracking, and a summary for any chosen date range." }
  },
  {
    papka: "zayavka demo",
    nomi: "Bog'chalar uchun zayavka tizimi",
    tavsif: "Tuman va bog'cha tanlanib, mahsulotlar bo'yicha buyurtma (zayavka) kiritiladi. Jami miqdor va hisobot avtomatik yig'iladi.",
    teglar: ["Google Sheets", "Demo"],
    ru: { nomi: "Система заявок для детских садов", tavsif: "Выбираете район и детский сад, вносите заявку по продуктам — итоговые объёмы и отчёт собираются автоматически." },
    en: { nomi: "Kindergarten order system", tavsif: "Pick a district and kindergarten, enter the product order, and totals and the report are compiled automatically." }
  },
  {
    papka: "optovik apteka demo",
    // rasm nomlari raqam emas, shuning uchun tartib bilan shu yerda yozilgan
    rasmlar: [
      "Снимок экрана 2026-10-04 232842.png",
      "Снимок экрана 2026-10-04 232906.png",
      "Снимок экрана 2026-10-04 232914.png",
      "Снимок экрана 2026-10-04 232923.png",
      "Снимок экрана 2026-10-04 232932.png"
    ],
    nomi: "Ulgurji dorixona boshqaruv tizimi",
    tavsif: "Dorilar bazasi va amal qilish muddati nazorati, dorixonalardan buyurtmalar, yuk xati, ombor qoldig'i, qarzdorlar va to'lovlar hisobi bitta jadvalda.",
    teglar: ["Google Sheets", "Demo"],
    ru: { nomi: "Система управления оптовой аптекой", tavsif: "База лекарств и контроль сроков годности, заказы от аптек, накладные, остатки на складе, должники и оплаты — в одной таблице." },
    en: { nomi: "Wholesale pharmacy management system", tavsif: "Medicine database with expiry tracking, pharmacy orders, delivery notes, stock levels, debtors and payments in one spreadsheet." }
  },
  {
    papka: "dars-ustaxonasi",
    nomi: "Dars ustaxonasi",
    tavsif: "O'qituvchilar va xodimlar uchun onlayn vositalar: krossvord, test va obyektivka tuzuvchi. PDF va Word'da yuklab olinadi.",
    teglar: ["HTML", "JavaScript"],
    ru: { nomi: "Мастерская уроков", tavsif: "Онлайн-инструменты для учителей и сотрудников: конструкторы кроссвордов, тестов и объективки. Скачивание в PDF и Word." },
    en: { nomi: "Lesson Workshop", tavsif: "Online tools for teachers and staff: crossword, test and obyektivka makers with PDF and Word export." }
  },
  {
    papka: "qarz-daftar",
    video: "https://youtu.be/I12czlbBVcY",
    nomi: "Qarz Daftar ilovasi",
    tavsif: "Mijozlar bilan ishlash, qarz va to'lovlarni nazorat qilish uchun mobil ilova.",
    teglar: ["AppSheet", "Google Drive"],
    ru: { nomi: "Приложение «Книга долгов»", tavsif: "Мобильное приложение для работы с клиентами и контроля долгов и платежей." },
    en: { nomi: "Debt Book app", tavsif: "A mobile app for working with customers and tracking debts and payments." }
  },
  {
    papka: "kichik ombor",
    nomi: "Ombor va savdo avtomatizatsiyasi",
    tavsif: "Tovarlar kirimi, sotuvi va qoldig'ining to'liq hisobi. Tanlangan sana bo'yicha qoldiq va jami hisobot avtomatik chiqadi.",
    teglar: ["Google Sheets", "Dashboard"],
    ru: { nomi: "Автоматизация склада и продаж", tavsif: "Полный учёт поступлений, продаж и остатков товаров. Остаток на выбранную дату и общий отчёт формируются автоматически." },
    en: { nomi: "Warehouse and sales automation", tavsif: "Complete tracking of stock received, sales and remaining stock. Balances for any chosen date and the summary report are produced automatically." }
  },
];
