import type { Locale } from "../translations";

export const componentsDict: Record<Locale, Record<string, any>> = {
  tr: {
    adSlideshow: {
      jobSeeker: {
        title: "İş mi Arıyorsun?",
        text: "Ücretsiz üye ol, mesleğine ve bölgene uygun ilanları keşfet.",
        cta: "Ücretsiz Kayıt Ol",
      },
      equipment: {
        title: "Ekipman mı Lazım?",
        text: "Kiralık iş makineleri ve ekipmanlar tek platformda.",
        cta: "Ekipmanlara Göz At",
      },
      wageIndex: {
        title: "Piyasa Nerede?",
        text: "Bölgesel işçilik ücret endeksini canlı olarak takip et.",
        cta: "Endeksi Gör",
      },
      siteRadar: {
        title: "Acil İhtiyaç mı Var?",
        text: "Haritada anlık usta ve ekipman çağrısı aç.",
        cta: "Şantiye Radarı",
      },
      materials: {
        title: "Malzeme Tedarikinde",
        text: "Tedarikçilerden güncel inşaat malzemesi ilanlarını incele.",
        cta: "Malzeme İlanları",
      },
      slideAriaLabel: "{{index}}. slayt",
    },
    favoriteButton: {
      add: "Favorilere ekle",
      remove: "Favorilerden çıkar",
    },
    indexChart: {
      insufficientData: "Bu filtre için yeterli veri yok (en az 3 veri girişi gerekir).",
      sampleSize: "Örneklem: {{count}}",
      expectationSampleSize: "Beklenti örneklemi: {{count}}",
      average: "Ortalama",
      median: "Medyan",
      marketExpectation: "Piyasa Beklentisi (Teklif)",
    },
    listingsTabs: {
      jobsTitle: "İş İlanları",
      jobsDesc: "Usta, işçi ve teknik personel ilanları",
      equipmentTitle: "Ekipman Arıyorum",
      equipmentDesc: "Kiralık iş makinesi ve ekipman ilanları",
      materialsTitle: "Malzeme İlanları",
      materialsDesc: "Tedarikçilerden inşaat malzemesi ilanları",
    },
    siteMap: {
      loading: "Harita yükleniyor...",
    },
    wageScaleCard: {
      title: "Maaş Pusulam",
      noData: "Bu meslek ve bölge için henüz yeterli veri yok. Ücret bilgini paylaşarak endeksi büyütebilirsin.",
      sampleCount: "{{count}} veri",
      min: "En Düşük",
      average: "Ortalama",
      max: "En Yüksek",
      marketExpectation: "Piyasa beklentisi (teklif ortalaması): {{amount}}",
    },
    weatherWidget: {
      loading: "Hava durumu yükleniyor...",
      yourLocation: "Konumunuz",
      weeklyForecast: "Haftalık tahmin",
      conditions: {
        clear: "Açık",
        partlyCloudy: "Parçalı bulutlu",
        cloudy: "Kapalı",
        fog: "Sisli",
        drizzle: "Çisenti",
        rain: "Yağmurlu",
        snow: "Kar yağışlı",
        storm: "Gök gürültülü fırtına",
      },
      frostWarningTitle: "Don Uyarısı:",
      frostWarningText: "Bugün sıcaklık 0°C'nin altına düşebilir — beton döküm ve sıva işlerini erteleyin.",
      heatWarningTitle: "Sıcak Hava Uyarısı:",
      heatWarningText: "Öğle saatlerinde çalışmaya ara verin, işçilerin bol su içtiğinden emin olun.",
      windWarningTitle: "Rüzgar Uyarısı:",
      windWarningText: "Vinç ve iskele işlerinde dikkatli olun.",
    },
    whatsappContactButton: {
      contact: "WhatsApp ile İletişime Geç",
      unavailable: "Şu an müsait değil",
    },
    whatsappShareButton: {
      share: "WhatsApp'ta Paylaş",
    },
    storeBadges: {
      appStore: {
        kicker: "App Store'dan",
        title: "İndirin",
      },
      googlePlay: {
        kicker: "EDİNİN",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Şurada keşfedin",
        title: "AppGallery",
      },
    },
  },
  en: {
    adSlideshow: {
      jobSeeker: {
        title: "Looking for a Job?",
        text: "Sign up for free and discover listings tailored to your trade and region.",
        cta: "Sign Up for Free",
      },
      equipment: {
        title: "Need Equipment?",
        text: "Rentable heavy machinery and equipment, all on one platform.",
        cta: "Browse Equipment",
      },
      wageIndex: {
        title: "Where's the Market?",
        text: "Track the regional labor wage index live.",
        cta: "View Index",
      },
      siteRadar: {
        title: "Urgent Need?",
        text: "Post a real-time request for workers or equipment on the map.",
        cta: "Site Radar",
      },
      materials: {
        title: "Sourcing Materials",
        text: "Browse fresh construction material listings from suppliers.",
        cta: "Material Listings",
      },
      slideAriaLabel: "Slide {{index}}",
    },
    favoriteButton: {
      add: "Add to favorites",
      remove: "Remove from favorites",
    },
    indexChart: {
      insufficientData: "Not enough data for this filter (at least 3 data entries required).",
      sampleSize: "Sample size: {{count}}",
      expectationSampleSize: "Expectation sample size: {{count}}",
      average: "Average",
      median: "Median",
      marketExpectation: "Market Expectation (Offer)",
    },
    listingsTabs: {
      jobsTitle: "Job Listings",
      jobsDesc: "Listings for skilled tradespeople, laborers, and technical staff",
      equipmentTitle: "Equipment Rentals",
      equipmentDesc: "Listings for rentable heavy machinery and equipment",
      materialsTitle: "Material Listings",
      materialsDesc: "Construction material listings from suppliers",
    },
    siteMap: {
      loading: "Loading map...",
    },
    wageScaleCard: {
      title: "My Wage Compass",
      noData: "Not enough data yet for this trade and region. Share your wage info to help grow the index.",
      sampleCount: "{{count}} data points",
      min: "Lowest",
      average: "Average",
      max: "Highest",
      marketExpectation: "Market expectation (average offer): {{amount}}",
    },
    weatherWidget: {
      loading: "Loading weather...",
      yourLocation: "Your Location",
      weeklyForecast: "Weekly forecast",
      conditions: {
        clear: "Clear",
        partlyCloudy: "Partly cloudy",
        cloudy: "Cloudy",
        fog: "Foggy",
        drizzle: "Drizzle",
        rain: "Rainy",
        snow: "Snowy",
        storm: "Thunderstorm",
      },
      frostWarningTitle: "Frost Warning:",
      frostWarningText: "The temperature may drop below 0°C today — postpone concrete pouring and plastering work.",
      heatWarningTitle: "Heat Warning:",
      heatWarningText: "Take breaks from work during midday hours and make sure workers drink plenty of water.",
      windWarningTitle: "Wind Warning:",
      windWarningText: "Use caution with crane and scaffolding work.",
    },
    whatsappContactButton: {
      contact: "Contact via WhatsApp",
      unavailable: "Not available right now",
    },
    whatsappShareButton: {
      share: "Share on WhatsApp",
    },
    storeBadges: {
      appStore: {
        kicker: "Download on the",
        title: "App Store",
      },
      googlePlay: {
        kicker: "GET IT ON",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Explore it on",
        title: "AppGallery",
      },
    },
  },
  de: {
    adSlideshow: {
      jobSeeker: {
        title: "Auf Jobsuche?",
        text: "Registriere dich kostenlos und entdecke Anzeigen passend zu deinem Beruf und deiner Region.",
        cta: "Kostenlos registrieren",
      },
      equipment: {
        title: "Geräte benötigt?",
        text: "Mietbare Baumaschinen und Geräte, alles auf einer Plattform.",
        cta: "Geräte durchsuchen",
      },
      wageIndex: {
        title: "Wo steht der Markt?",
        text: "Verfolge den regionalen Lohnindex live.",
        cta: "Index ansehen",
      },
      siteRadar: {
        title: "Dringender Bedarf?",
        text: "Stelle eine Echtzeitanfrage für Fachkräfte oder Geräte auf der Karte.",
        cta: "Baustellen-Radar",
      },
      materials: {
        title: "Materialbeschaffung",
        text: "Durchsuche aktuelle Materialanzeigen von Lieferanten.",
        cta: "Materialanzeigen",
      },
      slideAriaLabel: "Folie {{index}}",
    },
    favoriteButton: {
      add: "Zu Favoriten hinzufügen",
      remove: "Aus Favoriten entfernen",
    },
    indexChart: {
      insufficientData: "Für diesen Filter liegen nicht genügend Daten vor (mindestens 3 Dateneinträge erforderlich).",
      sampleSize: "Stichprobengröße: {{count}}",
      expectationSampleSize: "Stichprobengröße Erwartung: {{count}}",
      average: "Durchschnitt",
      median: "Median",
      marketExpectation: "Markterwartung (Angebot)",
    },
    listingsTabs: {
      jobsTitle: "Stellenanzeigen",
      jobsDesc: "Anzeigen für Fachkräfte, Arbeiter und technisches Personal",
      equipmentTitle: "Geräte gesucht",
      equipmentDesc: "Mietanzeigen für Baumaschinen und Geräte",
      materialsTitle: "Materialanzeigen",
      materialsDesc: "Materialanzeigen von Lieferanten",
    },
    siteMap: {
      loading: "Karte wird geladen...",
    },
    wageScaleCard: {
      title: "Mein Lohnkompass",
      noData:
        "Für diesen Beruf und diese Region liegen noch nicht genügend Daten vor. Teile deine Lohninformationen, um den Index zu erweitern.",
      sampleCount: "{{count}} Datensätze",
      min: "Niedrigster",
      average: "Durchschnitt",
      max: "Höchster",
      marketExpectation: "Markterwartung (durchschnittliches Angebot): {{amount}}",
    },
    weatherWidget: {
      loading: "Wetter wird geladen...",
      yourLocation: "Dein Standort",
      weeklyForecast: "Wochenvorhersage",
      conditions: {
        clear: "Klar",
        partlyCloudy: "Teilweise bewölkt",
        cloudy: "Bewölkt",
        fog: "Neblig",
        drizzle: "Nieselregen",
        rain: "Regnerisch",
        snow: "Schneefall",
        storm: "Gewitter",
      },
      frostWarningTitle: "Frostwarnung:",
      frostWarningText: "Die Temperatur kann heute unter 0 °C fallen — verschiebe Betonier- und Putzarbeiten.",
      heatWarningTitle: "Hitzewarnung:",
      heatWarningText:
        "Mache in den Mittagsstunden Arbeitspausen und achte darauf, dass die Arbeiter ausreichend Wasser trinken.",
      windWarningTitle: "Windwarnung:",
      windWarningText: "Sei bei Kran- und Gerüstarbeiten vorsichtig.",
    },
    whatsappContactButton: {
      contact: "Über WhatsApp kontaktieren",
      unavailable: "Momentan nicht verfügbar",
    },
    whatsappShareButton: {
      share: "Auf WhatsApp teilen",
    },
    storeBadges: {
      appStore: {
        kicker: "Laden im",
        title: "App Store",
      },
      googlePlay: {
        kicker: "JETZT BEI",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Entdecken auf",
        title: "AppGallery",
      },
    },
  },
  ru: {
    adSlideshow: {
      jobSeeker: {
        title: "Ищете работу?",
        text: "Зарегистрируйтесь бесплатно и найдите объявления по вашей профессии и региону.",
        cta: "Зарегистрироваться бесплатно",
      },
      equipment: {
        title: "Нужна техника?",
        text: "Аренда спецтехники и оборудования — всё на одной платформе.",
        cta: "Смотреть технику",
      },
      wageIndex: {
        title: "Где рынок?",
        text: "Следите за региональным индексом зарплат в реальном времени.",
        cta: "Смотреть индекс",
      },
      siteRadar: {
        title: "Срочная потребность?",
        text: "Разместите срочную заявку на мастеров или технику на карте.",
        cta: "Радар объектов",
      },
      materials: {
        title: "Поиск материалов",
        text: "Смотрите свежие объявления о материалах от поставщиков.",
        cta: "Объявления о материалах",
      },
      slideAriaLabel: "Слайд {{index}}",
    },
    favoriteButton: {
      add: "Добавить в избранное",
      remove: "Убрать из избранного",
    },
    indexChart: {
      insufficientData: "Недостаточно данных для этого фильтра (требуется не менее 3 записей).",
      sampleSize: "Выборка: {{count}}",
      expectationSampleSize: "Выборка ожиданий: {{count}}",
      average: "Среднее",
      median: "Медиана",
      marketExpectation: "Рыночное ожидание (предложение)",
    },
    listingsTabs: {
      jobsTitle: "Вакансии",
      jobsDesc: "Объявления для мастеров, рабочих и технического персонала",
      equipmentTitle: "Ищу технику",
      equipmentDesc: "Объявления об аренде спецтехники и оборудования",
      materialsTitle: "Объявления о материалах",
      materialsDesc: "Объявления о материалах от поставщиков",
    },
    siteMap: {
      loading: "Загрузка карты...",
    },
    wageScaleCard: {
      title: "Мой зарплатный компас",
      noData:
        "Пока недостаточно данных для этой профессии и региона. Поделитесь своей зарплатой, чтобы помочь пополнить индекс.",
      sampleCount: "{{count}} записей",
      min: "Минимум",
      average: "Среднее",
      max: "Максимум",
      marketExpectation: "Рыночное ожидание (среднее предложение): {{amount}}",
    },
    weatherWidget: {
      loading: "Загрузка погоды...",
      yourLocation: "Ваше местоположение",
      weeklyForecast: "Прогноз на неделю",
      conditions: {
        clear: "Ясно",
        partlyCloudy: "Переменная облачность",
        cloudy: "Облачно",
        fog: "Туман",
        drizzle: "Морось",
        rain: "Дождь",
        snow: "Снег",
        storm: "Гроза",
      },
      frostWarningTitle: "Предупреждение о заморозках:",
      frostWarningText: "Сегодня температура может опуститься ниже 0°C — отложите бетонные и штукатурные работы.",
      heatWarningTitle: "Предупреждение о жаре:",
      heatWarningText: "Делайте перерывы в работе в полуденные часы и следите, чтобы рабочие пили достаточно воды.",
      windWarningTitle: "Предупреждение о ветре:",
      windWarningText: "Соблюдайте осторожность при работе с краном и лесами.",
    },
    whatsappContactButton: {
      contact: "Связаться через WhatsApp",
      unavailable: "Сейчас недоступно",
    },
    whatsappShareButton: {
      share: "Поделиться в WhatsApp",
    },
    storeBadges: {
      appStore: {
        kicker: "Загрузите в",
        title: "App Store",
      },
      googlePlay: {
        kicker: "ДОСТУПНО В",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Загрузите в",
        title: "AppGallery",
      },
    },
  },
  ar: {
    adSlideshow: {
      jobSeeker: {
        title: "تبحث عن عمل؟",
        text: "سجّل مجانًا واكتشف الإعلانات المناسبة لمهنتك ومنطقتك.",
        cta: "سجّل مجانًا",
      },
      equipment: {
        title: "تحتاج معدات؟",
        text: "آليات ومعدات للإيجار، كلها في منصة واحدة.",
        cta: "تصفح المعدات",
      },
      wageIndex: {
        title: "أين يقف السوق؟",
        text: "تابع مؤشر الأجور الإقليمي مباشرة.",
        cta: "عرض المؤشر",
      },
      siteRadar: {
        title: "حاجة عاجلة؟",
        text: "أنشئ طلبًا فوريًا للحرفيين أو المعدات على الخريطة.",
        cta: "رادار الموقع",
      },
      materials: {
        title: "توريد المواد",
        text: "تصفح أحدث إعلانات مواد البناء من الموردين.",
        cta: "إعلانات المواد",
      },
      slideAriaLabel: "الشريحة {{index}}",
    },
    favoriteButton: {
      add: "أضف إلى المفضلة",
      remove: "أزل من المفضلة",
    },
    indexChart: {
      insufficientData: "لا توجد بيانات كافية لهذا الفلتر (يلزم 3 إدخالات بيانات على الأقل).",
      sampleSize: "حجم العينة: {{count}}",
      expectationSampleSize: "حجم عينة التوقعات: {{count}}",
      average: "المتوسط",
      median: "الوسيط",
      marketExpectation: "توقع السوق (العرض)",
    },
    listingsTabs: {
      jobsTitle: "إعلانات الوظائف",
      jobsDesc: "إعلانات للحرفيين والعمال والموظفين الفنيين",
      equipmentTitle: "أبحث عن معدات",
      equipmentDesc: "إعلانات تأجير الآليات الثقيلة والمعدات",
      materialsTitle: "إعلانات المواد",
      materialsDesc: "إعلانات مواد البناء من الموردين",
    },
    siteMap: {
      loading: "جارٍ تحميل الخريطة...",
    },
    wageScaleCard: {
      title: "بوصلة أجري",
      noData: "لا توجد بيانات كافية بعد لهذه المهنة والمنطقة. شارك معلومات أجرك للمساعدة في تنمية المؤشر.",
      sampleCount: "{{count}} بيانات",
      min: "الأدنى",
      average: "المتوسط",
      max: "الأعلى",
      marketExpectation: "توقع السوق (متوسط العرض): {{amount}}",
    },
    weatherWidget: {
      loading: "جارٍ تحميل الطقس...",
      yourLocation: "موقعك",
      weeklyForecast: "توقعات الأسبوع",
      conditions: {
        clear: "صافٍ",
        partlyCloudy: "غائم جزئيًا",
        cloudy: "غائم",
        fog: "ضبابي",
        drizzle: "رذاذ",
        rain: "ممطر",
        snow: "ثلجي",
        storm: "عاصفة رعدية",
      },
      frostWarningTitle: "تحذير من الصقيع:",
      frostWarningText: "قد تنخفض درجة الحرارة اليوم إلى ما دون 0 درجة مئوية — أجّل أعمال صب الخرسانة والملاط.",
      heatWarningTitle: "تحذير من الحر:",
      heatWarningText: "خذ فترات راحة من العمل خلال ساعات الظهيرة وتأكد من شرب العمال كميات كافية من الماء.",
      windWarningTitle: "تحذير من الرياح:",
      windWarningText: "كن حذرًا في أعمال الرافعات والسقالات.",
    },
    whatsappContactButton: {
      contact: "تواصل عبر واتساب",
      unavailable: "غير متاح حاليًا",
    },
    whatsappShareButton: {
      share: "شارك على واتساب",
    },
    storeBadges: {
      appStore: {
        kicker: "التحميل من",
        title: "App Store",
      },
      googlePlay: {
        kicker: "احصل عليه من",
        title: "Google Play",
      },
      appGallery: {
        kicker: "استكشفه على",
        title: "AppGallery",
      },
    },
  },
  es: {
    adSlideshow: {
      jobSeeker: {
        title: "¿Buscas trabajo?",
        text: "Regístrate gratis y descubre anuncios adaptados a tu oficio y tu región.",
        cta: "Regístrate gratis",
      },
      equipment: {
        title: "¿Necesitas maquinaria?",
        text: "Maquinaria pesada y equipos en alquiler, todo en una sola plataforma.",
        cta: "Ver maquinaria",
      },
      wageIndex: {
        title: "¿Dónde está el mercado?",
        text: "Sigue en directo el índice salarial regional.",
        cta: "Ver índice",
      },
      siteRadar: {
        title: "¿Necesidad urgente?",
        text: "Publica en el mapa una solicitud en tiempo real de personal o maquinaria.",
        cta: "Radar de obra",
      },
      materials: {
        title: "Búsqueda de materiales",
        text: "Explora los anuncios más recientes de materiales de construcción de proveedores.",
        cta: "Anuncios de materiales",
      },
      slideAriaLabel: "Diapositiva {{index}}",
    },
    favoriteButton: {
      add: "Añadir a favoritos",
      remove: "Quitar de favoritos",
    },
    indexChart: {
      insufficientData: "No hay datos suficientes para este filtro (se requieren al menos 3 registros).",
      sampleSize: "Tamaño de la muestra: {{count}}",
      expectationSampleSize: "Tamaño de la muestra de expectativa: {{count}}",
      average: "Promedio",
      median: "Mediana",
      marketExpectation: "Expectativa de mercado (oferta)",
    },
    listingsTabs: {
      jobsTitle: "Ofertas de empleo",
      jobsDesc: "Anuncios para oficiales, peones y personal técnico",
      equipmentTitle: "Alquiler de maquinaria",
      equipmentDesc: "Anuncios de maquinaria pesada y equipos en alquiler",
      materialsTitle: "Anuncios de materiales",
      materialsDesc: "Anuncios de materiales de construcción de proveedores",
    },
    siteMap: {
      loading: "Cargando mapa...",
    },
    wageScaleCard: {
      title: "Mi brújula salarial",
      noData:
        "Aún no hay datos suficientes para este oficio y región. Comparte tu información salarial para ayudar a ampliar el índice.",
      sampleCount: "{{count}} registros",
      min: "Mínimo",
      average: "Promedio",
      max: "Máximo",
      marketExpectation: "Expectativa de mercado (oferta media): {{amount}}",
    },
    weatherWidget: {
      loading: "Cargando el clima...",
      yourLocation: "Tu ubicación",
      weeklyForecast: "Pronóstico semanal",
      conditions: {
        clear: "Despejado",
        partlyCloudy: "Parcialmente nublado",
        cloudy: "Nublado",
        fog: "Niebla",
        drizzle: "Llovizna",
        rain: "Lluvioso",
        snow: "Nevado",
        storm: "Tormenta eléctrica",
      },
      frostWarningTitle: "Aviso de helada:",
      frostWarningText:
        "La temperatura podría bajar hoy de 0 °C — posponga el vertido de hormigón y los trabajos de enlucido.",
      heatWarningTitle: "Aviso de calor:",
      heatWarningText: "Haga descansos durante las horas de mediodía y asegúrese de que los trabajadores beban suficiente agua.",
      windWarningTitle: "Aviso de viento:",
      windWarningText: "Extreme la precaución en los trabajos con grúas y andamios.",
    },
    whatsappContactButton: {
      contact: "Contactar por WhatsApp",
      unavailable: "No disponible en este momento",
    },
    whatsappShareButton: {
      share: "Compartir en WhatsApp",
    },
    storeBadges: {
      appStore: {
        kicker: "Descárgalo en",
        title: "App Store",
      },
      googlePlay: {
        kicker: "DISPONIBLE EN",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Descúbrelo en",
        title: "AppGallery",
      },
    },
  },
  fr: {
    adSlideshow: {
      jobSeeker: {
        title: "Vous cherchez un emploi ?",
        text: "Inscrivez-vous gratuitement et découvrez des annonces adaptées à votre métier et à votre région.",
        cta: "Inscription gratuite",
      },
      equipment: {
        title: "Besoin de matériel ?",
        text: "Engins et équipements de chantier à louer, réunis sur une seule plateforme.",
        cta: "Voir le matériel",
      },
      wageIndex: {
        title: "Où en est le marché ?",
        text: "Suivez en direct l'indice régional des salaires.",
        cta: "Voir l'indice",
      },
      siteRadar: {
        title: "Besoin urgent ?",
        text: "Publiez sur la carte une demande en temps réel de personnel ou de matériel.",
        cta: "Radar de chantier",
      },
      materials: {
        title: "Approvisionnement en matériaux",
        text: "Parcourez les dernières annonces de matériaux de construction proposées par les fournisseurs.",
        cta: "Annonces de matériaux",
      },
      slideAriaLabel: "Diapositive {{index}}",
    },
    favoriteButton: {
      add: "Ajouter aux favoris",
      remove: "Retirer des favoris",
    },
    indexChart: {
      insufficientData: "Pas assez de données pour ce filtre (au moins 3 entrées de données sont requises).",
      sampleSize: "Taille de l'échantillon : {{count}}",
      expectationSampleSize: "Taille de l'échantillon des attentes : {{count}}",
      average: "Moyenne",
      median: "Médiane",
      marketExpectation: "Attente du marché (offre)",
    },
    listingsTabs: {
      jobsTitle: "Offres d'emploi",
      jobsDesc: "Annonces pour ouvriers qualifiés, manœuvres et personnel technique",
      equipmentTitle: "Location de matériel",
      equipmentDesc: "Annonces d'engins et d'équipements de chantier à louer",
      materialsTitle: "Annonces de matériaux",
      materialsDesc: "Annonces de matériaux de construction des fournisseurs",
    },
    siteMap: {
      loading: "Chargement de la carte...",
    },
    wageScaleCard: {
      title: "Ma boussole salariale",
      noData:
        "Pas encore assez de données pour ce métier et cette région. Partagez vos informations salariales pour aider à enrichir l'indice.",
      sampleCount: "{{count}} données",
      min: "Minimum",
      average: "Moyenne",
      max: "Maximum",
      marketExpectation: "Attente du marché (offre moyenne) : {{amount}}",
    },
    weatherWidget: {
      loading: "Chargement de la météo...",
      yourLocation: "Votre position",
      weeklyForecast: "Prévisions de la semaine",
      conditions: {
        clear: "Dégagé",
        partlyCloudy: "Partiellement nuageux",
        cloudy: "Nuageux",
        fog: "Brouillard",
        drizzle: "Bruine",
        rain: "Pluvieux",
        snow: "Neigeux",
        storm: "Orage",
      },
      frostWarningTitle: "Alerte gel :",
      frostWarningText:
        "La température pourrait descendre sous 0 °C aujourd'hui — reportez le coulage du béton et les travaux de plâtrage.",
      heatWarningTitle: "Alerte chaleur :",
      heatWarningText:
        "Faites des pauses pendant les heures de la mi-journée et veillez à ce que les ouvriers boivent suffisamment d'eau.",
      windWarningTitle: "Alerte vent :",
      windWarningText: "Soyez prudent lors des travaux de grue et d'échafaudage.",
    },
    whatsappContactButton: {
      contact: "Contacter via WhatsApp",
      unavailable: "Actuellement indisponible",
    },
    whatsappShareButton: {
      share: "Partager sur WhatsApp",
    },
    storeBadges: {
      appStore: {
        kicker: "Téléchargez sur",
        title: "App Store",
      },
      googlePlay: {
        kicker: "DISPONIBLE SUR",
        title: "Google Play",
      },
      appGallery: {
        kicker: "Découvrez-le sur",
        title: "AppGallery",
      },
    },
  },
};
