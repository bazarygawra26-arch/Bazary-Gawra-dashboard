export type SupportedLanguage = 'ku' | 'ar' | 'en';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  adminPortal: string;
  
  // Navigation
  navOverview: string;
  navSellers: string;
  navProducts: string;
  navAiInsights: string;
  navTaxonomy: string;
  navSettings: string;
  
  // Header & Global
  searchPlaceholder: string;
  quickAdd: string;
  exportCsv: string;
  refresh: string;
  notifications: string;
  verifiedSellersCount: string;
  databaseStatus: string;
  dbConnected: string;
  dbMock: string;
  languageSelect: string;
  
  // KPI Metrics
  kpiTotalProducts: string;
  kpiActiveProductsSubtitle: string;
  kpiVerifiedMerchants: string;
  kpiVerifiedMerchantsSubtitle: string;
  kpiAiQueries: string;
  kpiAiQueriesSubtitle: string;
  kpiTransparencyScore: string;
  kpiTransparencySubtitle: string;
  kpiVsLastMonth: string;
  
  // City Breakdown
  cityDistributionTitle: string;
  cityDistributionSubtitle: string;
  sulaymaniyah: string;
  erbil: string;
  duhok: string;
  halabja: string;
  kirkuk: string;
  
  // Categories
  categoryHealthTitle: string;
  categoryHealthSubtitle: string;
  catFood: string;
  catHeritage: string;
  catKitchen: string;
  catHomeAppliances: string;
  catTech: string;
  catBooks: string;
  
  // Recent Activity
  recentActivityTitle: string;
  recentActivitySubtitle: string;
  actNewSeller: string;
  actNewProduct: string;
  actAiSearch: string;
  actScanSearch: string;
  justNow: string;
  minsAgo: string;
  hoursAgo: string;

  // Merchant Management
  merchantsTitle: string;
  merchantsSubtitle: string;
  addMerchant: string;
  searchMerchants: string;
  filterByCity: string;
  filterByStatus: string;
  allCities: string;
  allStatuses: string;
  statusVerified: string;
  statusPending: string;
  statusUnverified: string;
  statusSuspended: string;
  merchantName: string;
  merchantCityBazaar: string;
  merchantContact: string;
  merchantProducts: string;
  merchantTrust: string;
  merchantActions: string;
  viewInventory: string;
  verifySeller: string;
  editSeller: string;
  directWhatsApp: string;
  callPhone: string;
  shopFacade: string;
  bazaarLocation: string;
  ownerName: string;
  verificationNotes: string;
  confirmVerify: string;
  confirmSuspend: string;
  verificationDetails: string;
  
  // Product Catalog
  productsTitle: string;
  productsSubtitle: string;
  addProduct: string;
  searchProducts: string;
  filterByCategory: string;
  allCategories: string;
  auditMissingSignals: string;
  allProducts: string;
  statusActive: string;
  statusDraft: string;
  statusArchived: string;
  statusOutOfStock: string;
  productTitleCol: string;
  productCategoryCol: string;
  productSellerCol: string;
  productPriceCol: string;
  productSignalsCol: string;
  productStockCol: string;
  productActionsCol: string;
  warranty: string;
  delivery: string;
  returnPolicy: string;
  transparencyScore: string;
  iqd: string;
  usd: string;
  stockUnits: string;
  quickEdit: string;
  fullEdit: string;
  deleteProduct: string;
  
  // Signals & Audit
  auditAlertTitle: string;
  auditAlertDesc: string;
  signalComplete: string;
  signalMissing: string;
  warrantyOfficial: string;
  warrantyShop: string;
  warrantyReplacement: string;
  warrantyNone: string;
  deliverySameDay: string;
  deliveryExpress: string;
  deliveryPickup: string;
  returnWindowDays: string;
  returnPolicyMoneyBack: string;
  returnPolicyExchange: string;
  returnPolicyNone: string;

  // Multilingual Editor
  editorTitleNew: string;
  editorTitleEdit: string;
  tabKurdish: string;
  tabEnglish: string;
  tabArabic: string;
  titleKurdishLabel: string;
  titleEnglishLabel: string;
  titleArabicLabel: string;
  descKurdishLabel: string;
  descEnglishLabel: string;
  descArabicLabel: string;
  pricingSection: string;
  priceIqdLabel: string;
  priceUsdLabel: string;
  stockQuantityLabel: string;
  sellerLabel: string;
  categoryLabel: string;
  transparencySection: string;
  warrantyTypeLabel: string;
  warrantyPeriodLabel: string;
  deliveryTypeLabel: string;
  deliveryCostLabel: string;
  returnWindowLabel: string;
  returnTypeLabel: string;
  imagesSection: string;
  imageUrlPlaceholder: string;
  saveChanges: string;
  cancel: string;
  
  // AI Insights
  aiInsightsTitle: string;
  aiInsightsSubtitle: string;
  liveAiSearches: string;
  visualScans: string;
  unmetDemandGap: string;
  queryText: string;
  userCity: string;
  matchedResults: string;
  scanConfidence: string;
  detectedObject: string;
  matchedMerchant: string;

  // Taxonomy & Settings
  taxonomyTitle: string;
  taxonomySubtitle: string;
  settingsTitle: string;
  settingsSubtitle: string;
  supabaseConfigTitle: string;
  copySqlScript: string;
  seedSampleData: string;
  copiedToClipboard: string;
  seedSuccess: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  ku: {
    appName: 'بازاڕی گەورە',
    appSubtitle: 'پلاتفۆرمی نیشتمانی بۆ بازاڕەکانی کوردستان',
    adminPortal: 'بەشی کۆنتڕۆڵ و بەڕێوەبردن',
    
    navOverview: 'پوختەی گشتی',
    navSellers: 'فرۆشیارەکان',
    navProducts: 'کاڵاکان و نرخەکان',
    navAiInsights: 'گەڕانی زیرەک و پێشبینی',
    navTaxonomy: 'شارەکان و پۆلەکان',
    navSettings: 'ڕێکخستن و سۆپابەیس',
    
    searchPlaceholder: 'بگەڕێ بۆ فرۆشیار، کاڵا یان گەڕانەکانی کڕیار...',
    quickAdd: 'زیادکردنی نوێ',
    exportCsv: 'دەرکردنی فایلی CSV',
    refresh: 'نوێکردنەوە',
    notifications: 'ئاگادارییەکان',
    verifiedSellersCount: 'فرۆشیاری پەسەندکراو',
    databaseStatus: 'دۆخی داتابەیس',
    dbConnected: 'پەیوەستە بە Supabase',
    dbMock: 'دۆخی تاقیکاری ناوخۆیی',
    languageSelect: 'زمان',
    
    kpiTotalProducts: 'کۆی گشتی کاڵا چالاکەکان',
    kpiActiveProductsSubtitle: 'لە کۆی ٦ پۆلی سەرەکی بازاڕ',
    kpiVerifiedMerchants: 'فرۆشیارانی پەسەندکراو',
    kpiVerifiedMerchantsSubtitle: 'فرۆشگای فیزیایی لە پارێزگاکان',
    kpiAiQueries: 'گەڕان و سکانی زیرەکی دەستکرد',
    kpiAiQueriesSubtitle: 'پرسیار و سکانی ڕۆژانەی کڕیاران',
    kpiTransparencyScore: 'نمرەی ڕوونی و متمانە',
    kpiTransparencySubtitle: 'تێکڕای ڕوونی گرەنتی و گەیاندن',
    kpiVsLastMonth: 'بەراورد بە مانگی ڕابردوو',
    
    cityDistributionTitle: 'دابەشبوونی جوگرافی لە کوردستان',
    cityDistributionSubtitle: 'ژمارەی فرۆشیاران و کاڵاکان بەپێی شارەکان',
    sulaymaniyah: 'سلێمانی',
    erbil: 'هەولێر',
    duhok: 'دهۆک',
    halabja: 'هەڵەبجە',
    kirkuk: 'کەرکووک',
    
    categoryHealthTitle: 'دۆخی کۆگای پۆلەکان',
    categoryHealthSubtitle: 'ژمارەی کاڵا بەردەستەکان بەپێی جۆری بەرهەم',
    catFood: 'خۆراکی خۆماڵی و بەرهەمی کوردی',
    catHeritage: 'دەستکرد و کەلەپوور',
    catKitchen: 'کەلوپەلی چێشتخانە و دەفر',
    catHomeAppliances: 'ئامێرەکانی ناوماڵ و کارەبایی',
    catTech: 'مۆبایل و تەکنەلۆژیا',
    catBooks: 'کتێب و بەرهەمی ئەدەبی',
    
    recentActivityTitle: 'دوایین جووڵە و ڕووداوەکان',
    recentActivitySubtitle: 'تۆمارکردنی فرۆشیار، کاڵای نوێ و گەڕانی کڕیاران',
    actNewSeller: 'فرۆشیاری نوێ خۆی تۆمارکرد',
    actNewProduct: 'کاڵای نوێ زیادکرا',
    actAiSearch: 'گەڕانی دەنگی/نووسراوی زیرەک',
    actScanSearch: 'سکانی وێنەی کاڵا لەلایەن کڕیارەوە',
    justNow: 'ئێستا',
    minsAgo: 'خولەک لەمەوبەر',
    hoursAgo: 'کاتژمێر لەمەوبەر',

    merchantsTitle: 'بەڕێوەبردنی فرۆشیارانی کوردستان',
    merchantsSubtitle: 'پەسەندکردنی دووکانە فیزیاییەکان، شوێنی بازاڕ، و پەیوەندی',
    addMerchant: 'زیادکردنی فرۆشیار',
    searchMerchants: 'بگەڕێ بەپێی ناوی دووکان، خاوەن کار، مۆبایل...',
    filterByCity: 'هەڵبژاردنی شار',
    filterByStatus: 'دۆخی متمانە',
    allCities: 'هەموو شارەکان',
    allStatuses: 'هەموو دۆخەکان',
    statusVerified: 'پەسەندکراو (متمانەدار)',
    statusPending: 'چاوەڕوانی پەسەندکردن',
    statusUnverified: 'پەسەندنەکراو',
    statusSuspended: 'ڕاگیراو',
    merchantName: 'فرۆشگا و بازاڕ',
    merchantCityBazaar: 'شار و ناونیشان',
    merchantContact: 'پەیوەندی و واتسئاپ',
    merchantProducts: 'کاڵاکان',
    merchantTrust: 'نمرەی متمانە',
    merchantActions: 'کردارەکان',
    viewInventory: 'بینینی کاڵاکانی',
    verifySeller: 'پەسەندکردنی فرۆشگا',
    editSeller: 'دەستکاری زانیاری',
    directWhatsApp: 'نامەی ڕاستەوخۆی واتسئاپ',
    callPhone: 'پەیوەندی تەلەفۆنی',
    shopFacade: 'وێنەی بەر ڕووی دووکان (دیزاین و تابلۆ)',
    bazaarLocation: 'بازاڕی ناوخۆیی',
    ownerName: 'ناوی خاوەن دووکان',
    verificationNotes: 'تێبینیەکانی وردبینی بەڕێوەبەر',
    confirmVerify: 'پەسەندکردن و بەخشینی نیشانەی باوەڕپێکراو',
    confirmSuspend: 'ڕاگرتنی فرۆشگا',
    verificationDetails: 'وردەکاری پەسەندکردنی فرۆشگای ناوخۆیی',
    
    productsTitle: 'کاتالۆگی کاڵاکان و ڕوونی زانیارییەکان',
    productsSubtitle: 'چاودێری گرەنتی ناوخۆیی، نرخی گەیاندن و ماوەی گەڕاندنەوە',
    addProduct: 'زیادکردنی کاڵا',
    searchProducts: 'بگەڕێ بەپێی ناوی کاڵا یان فرۆشیار...',
    filterByCategory: 'پۆلەکان',
    allCategories: 'هەموو پۆلەکان',
    auditMissingSignals: 'کەموکوڕی زانیاری (Audit)',
    allProducts: 'هەموو کاڵاکان',
    statusActive: 'چالاک بۆ کڕین',
    statusDraft: 'ڕەشنووس',
    statusArchived: 'ئەرشیڤکراو',
    statusOutOfStock: 'نەماوە لە کۆگا',
    productTitleCol: 'وێنە و ناوی کاڵا',
    productCategoryCol: 'پۆل',
    productSellerCol: 'فرۆشیار و شوێن',
    productPriceCol: 'نرخ (دینار - IQD)',
    productSignalsCol: 'نیشانەکانی ڕوونی (گرەنتی/گەیاندن/گەڕانەوە)',
    productStockCol: 'کۆگا',
    productActionsCol: 'کردار',
    warranty: 'گرەنتی',
    delivery: 'گەیاندن',
    returnPolicy: 'گەڕاندنەوە',
    transparencyScore: 'نمرەی ڕوونی',
    iqd: 'دینار',
    usd: 'دینار',
    stockUnits: 'دانە',
    quickEdit: 'دەستکاری خێرا',
    fullEdit: 'دەستکاری تەواو',
    deleteProduct: 'سڕینەوە',
    
    auditAlertTitle: 'ئاگاداری وردبینی: بەشێک لە کاڵاکان زانیاری متمانەیان کەمە!',
    auditAlertDesc: 'کڕیارانی کوردستان بەدوای گرەنتی لۆکاڵی، خێرایی گەیاندن و ماوەی تاقیکردنەوە دەگەڕێن. ئەو کاڵایانەی زانیارییان کەمە نیشانی کڕیار نادەین.',
    signalComplete: 'تەواو و ڕوون',
    signalMissing: 'زانیاری کەمە',
    warrantyOfficial: 'گرەنتی فەرمی بریکار',
    warrantyShop: 'گرەنتی ناوخۆیی دووکان',
    warrantyReplacement: 'گرەنتی گۆڕینەوە لە شوێنی خۆی',
    warrantyNone: 'بێ گرەنتی',
    deliverySameDay: 'گەیاندنی هەمان ڕۆژ لە شار',
    deliveryExpress: 'گەیاندنی ٢٤-٤٨ کاتژمێر لە کوردستان',
    deliveryPickup: 'وەرگرتنەوە تەنها لە دووکان',
    returnWindowDays: 'ڕۆژ ماوەی تاقیکردنەوە',
    returnPolicyMoneyBack: 'گەڕاندنەوەی پارە',
    returnPolicyExchange: 'تەنها گۆڕینەوە بە کاڵای تر',
    returnPolicyNone: 'ناگەڕێنرێتەوە',

    editorTitleNew: 'زیادکردنی کاڵای نوێ بە سێ زمان',
    editorTitleEdit: 'دەستکاری کاڵا و نیشانەکانی متمانە',
    tabKurdish: 'کوردی (سۆرانی)',
    tabEnglish: 'ئینگلیزی (English)',
    tabArabic: 'عەرەبی (العربية)',
    titleKurdishLabel: 'ناوی کاڵا بە کوردی',
    titleEnglishLabel: 'Product Name in English',
    titleArabicLabel: 'اسم المنتج بالعربية',
    descKurdishLabel: 'وەسف و تایبەتمەندی بە کوردی',
    descEnglishLabel: 'Description in English',
    descArabicLabel: 'الوصف والمواصفات بالعربية',
    pricingSection: 'نرخ و بڕی کۆگا',
    priceIqdLabel: 'نرخ بە دیناری عێراقی (IQD)',
    priceUsdLabel: 'نرخ بە دینار (IQD)',
    stockQuantityLabel: 'بڕی بەردەست لە کۆگا',
    sellerLabel: 'فرۆشیار (دووکان)',
    categoryLabel: 'پۆلی کاڵا',
    transparencySection: 'نیشانەکانی متمانەی کڕیار (Transparency Signals)',
    warrantyTypeLabel: 'جۆری گرەنتی',
    warrantyPeriodLabel: 'ماوەی گرەنتی (نموونە: ٦ مانگ، ١ ساڵ)',
    deliveryTypeLabel: 'شێوازی گەیاندن',
    deliveryCostLabel: 'تێچووی گەیاندن (IQD)',
    returnWindowLabel: 'ماوەی گەڕاندنەوە (ڕۆژ)',
    returnTypeLabel: 'مەرجی گەڕاندنەوە',
    imagesSection: 'وێنەی کاڵا',
    imageUrlPlaceholder: 'لینکی وێنە لێرە دابنێ (URL)',
    saveChanges: 'پاشەکەوتکردنی گۆڕانکارییەکان',
    cancel: 'پاشگەزبوونەوە',
    
    aiInsightsTitle: 'زانیاریەکانی زیرەکی دەستکرد و گەڕانی کڕیاران',
    aiInsightsSubtitle: 'تێگەیشتن لە داواکاری و پێداویستیەکانی خەڵکی کوردستان لە بازاڕەکاندا',
    liveAiSearches: 'دوایین گەڕانە زیرەکەکانی کڕیاران',
    visualScans: 'سکانی وێنەیی کاڵاکان لە مۆبایلەوە',
    unmetDemandGap: 'کاڵا داواکراوەکان کە لە بازاڕدا نین (Demand Gap)',
    queryText: 'دەقی پرسیار و گەڕان',
    userCity: 'شاری کڕیار',
    matchedResults: 'کاڵای دۆزراوە',
    scanConfidence: 'ڕێژەی دڵنیایی سکان',
    detectedObject: 'کاڵای ناسراوە',
    matchedMerchant: 'فرۆشگای دۆزراوە',

    taxonomyTitle: 'بەڕێوەبردنی شارەکان، بازاڕەکان و پۆلەکان',
    taxonomySubtitle: 'ڕێکخستنی جوگرافیای بازاڕەکانی کوردستان و هاوپۆلکردنی بەرهەمەکان',
    settingsTitle: 'ڕێکخستنەکان و داتابەیسی سۆپابەیس',
    settingsSubtitle: 'بەستنەوە بە Supabase PostgreSQL، خشتەکان، و تاقیکردنەوە',
    supabaseConfigTitle: 'ڕێکخستنی کلیل و دۆخی Supabase',
    copySqlScript: 'کۆپیکردنی کۆدی SQL بۆ دانانی خشتەکان',
    seedSampleData: 'داگرتنی داتای نموونەیی بازاڕ',
    copiedToClipboard: 'کۆدەکە لە کلیپبۆرد کۆپی کرا!',
    seedSuccess: 'داتاکان بە سەرکەوتوویی نوێکرانەوە!',
  },
  
  ar: {
    appName: 'بازاري گەورە (السوق الكبير)',
    appSubtitle: 'المنصة الرقمية لأسواق وتجار إقليم كوردستان',
    adminPortal: 'لوحة التحكم والإدارة المركزية',
    
    navOverview: 'نظرة عامة',
    navSellers: 'التجار والمحلات',
    navProducts: 'المنتجات والأسعار',
    navAiInsights: 'البحث الذكي وتحليلات AI',
    navTaxonomy: 'المدن والتصنيفات',
    navSettings: 'الإعدادات وقاعدة البيانات',
    
    searchPlaceholder: 'ابحث عن تاجر، منتج، أو استفسارات المشترين...',
    quickAdd: 'إضافة جديدة',
    exportCsv: 'تصدير ملف CSV',
    refresh: 'تحديث',
    notifications: 'الإشعارات',
    verifiedSellersCount: 'المتاجر المعتمدة',
    databaseStatus: 'حالة قاعدة البيانات',
    dbConnected: 'متصل بـ Supabase',
    dbMock: 'وضع تجريبي محلي',
    languageSelect: 'اللغة',
    
    kpiTotalProducts: 'إجمالي المنتجات النشطة',
    kpiActiveProductsSubtitle: 'عبر الفئات الرئيسية للأسواق',
    kpiVerifiedMerchants: 'التجار المعتمدون',
    kpiVerifiedMerchantsSubtitle: 'متاجر فعلية في المحافظات',
    kpiAiQueries: 'استفسارات ومسح الذكاء الاصطناعي',
    kpiAiQueriesSubtitle: 'عمليات البحث اليومية للمشترين',
    kpiTransparencyScore: 'مؤشر الشفافية والثقة',
    kpiTransparencySubtitle: 'متوسط توثيق الضمان والتوصيل',
    kpiVsLastMonth: 'مقارنة بالشهر السابق',
    
    cityDistributionTitle: 'التوزيع الجغرافي في كوردستان',
    cityDistributionSubtitle: 'توزيع التجار والمنتجات حسب المحافظات',
    sulaymaniyah: 'السليمانية',
    erbil: 'أربيل',
    duhok: 'دهوك',
    halabja: 'حلبجة',
    kirkuk: 'كركوك',
    
    categoryHealthTitle: 'حالة مخزون الفئات',
    categoryHealthSubtitle: 'عدد المنتجات المتاحة حسب التصنيف',
    catFood: 'المنتجات الغذائية والمحلية',
    catHeritage: 'الحرف اليدوية والتراثية',
    catKitchen: 'مستلزمات وأواني المطبخ',
    catHomeAppliances: 'الأجهزة المنزلية والكهربائية',
    catTech: 'الهواتف الذكية والتكنولوجيا',
    catBooks: 'الكتب والمطبوعات والأدب',
    
    recentActivityTitle: 'أحدث العمليات والأنشطة',
    recentActivitySubtitle: 'تسجيل التجار الجدد والمنتجات وبحث الزبائن',
    actNewSeller: 'تسجيل تاجر جديد',
    actNewProduct: 'إضافة منتج جديد',
    actAiSearch: 'بحث ذكي عبر AI',
    actScanSearch: 'مسح صورة منتج من الزبون',
    justNow: 'الآن',
    minsAgo: 'دقائق مضت',
    hoursAgo: 'ساعات مضت',

    merchantsTitle: 'إدارة تجار وأسواق كوردستان',
    merchantsSubtitle: 'اعتماد المتاجر ومراجعة العناوين ووسائل الاتصال',
    addMerchant: 'إضافة تاجر',
    searchMerchants: 'ابحث باسم المتجر أو المالك أو رقم الهاتف...',
    filterByCity: 'اختر المدينة',
    filterByStatus: 'حالة التوثيق',
    allCities: 'كل المدن',
    allStatuses: 'كل الحالات',
    statusVerified: 'معتمد وموثق',
    statusPending: 'قيد المراجعة',
    statusUnverified: 'غير موثق',
    statusSuspended: 'موقوف مؤقتاً',
    merchantName: 'المتجر والسوق',
    merchantCityBazaar: 'المدينة والعنوان',
    merchantContact: 'الاتصال والواتساب',
    merchantProducts: 'المنتجات',
    merchantTrust: 'درجة الموثوقية',
    merchantActions: 'الإجراءات',
    viewInventory: 'عرض بضائع المتجر',
    verifySeller: 'توثيق واعتماد',
    editSeller: 'تعديل البيانات',
    directWhatsApp: 'محادثة واتساب مباشرة',
    callPhone: 'اتصال هاتفي',
    shopFacade: 'واجهة المحل واللافتة',
    bazaarLocation: 'السوق التابع له',
    ownerName: 'اسم صاحب المحل',
    verificationNotes: 'ملاحظات فريق التدقيق',
    confirmVerify: 'اعتماد ومنح شارة الموثوقية',
    confirmSuspend: 'إيقاف مؤقت للمتجر',
    verificationDetails: 'تفاصيل توثيق المتجر المحلي',
    
    productsTitle: 'كتالوج المنتجات ومؤشرات الشفافية',
    productsSubtitle: 'مراقبة شروط الضمان وسرعة التوصيل وسياسة الاسترجاع',
    addProduct: 'إضافة منتج',
    searchProducts: 'ابحث باسم المنتج أو التاجر...',
    filterByCategory: 'الفئات',
    allCategories: 'جميع الفئات',
    auditMissingSignals: 'نواقص الشفافية (تدقيق)',
    allProducts: 'جميع المنتجات',
    statusActive: 'نشط ومتاح للطلب',
    statusDraft: 'مسودة',
    statusArchived: 'مؤرشف',
    statusOutOfStock: 'نفد من المخزن',
    productTitleCol: 'الصورة والمنتج',
    productCategoryCol: 'الفئة',
    productSellerCol: 'التاجر والمدينة',
    productPriceCol: 'السعر (دینار - IQD)',
    productSignalsCol: 'إشارات الشفافية (الضمان/التوصيل/الاسترجاع)',
    productStockCol: 'المخزون',
    productActionsCol: 'الإجراءات',
    warranty: 'الضمان',
    delivery: 'التوصيل',
    returnPolicy: 'الاسترجاع',
    transparencyScore: 'مؤشر الشفافية',
    iqd: 'دينار',
    usd: 'د.ع',
    stockUnits: 'قطعة',
    quickEdit: 'تعديل سريع',
    fullEdit: 'تعديل كامل',
    deleteProduct: 'حذف',
    
    auditAlertTitle: 'تنبيه التدقيق: بعض المنتجات تفتقر لمعلومات الضمان والتوصيل!',
    auditAlertDesc: 'يبحث المتسوقون عن الضمان المحلي ومدة التجربة وسرعة التوصيل. المنتجات الناقصة تحتاج إكمال بياناتها.',
    signalComplete: 'مكتمل وشفاف',
    signalMissing: 'معلومات ناقصة',
    warrantyOfficial: 'ضمان وكيل رسمي',
    warrantyShop: 'ضمان المحل المحلي',
    warrantyReplacement: 'ضمان استبدال فوري',
    warrantyNone: 'بدون ضمان',
    deliverySameDay: 'توصيل بنفس اليوم داخل المدينة',
    deliveryExpress: 'توصيل ٢٤-٤٨ ساعة لكل كوردستان',
    deliveryPickup: 'استلام من المحل فقط',
    returnWindowDays: 'أيام مهلة فحص وتجربة',
    returnPolicyMoneyBack: 'استرجاع نقدي',
    returnPolicyExchange: 'استبدال فقط',
    returnPolicyNone: 'غير قابل للإرجاع',

    editorTitleNew: 'إضافة منتج جديد بثلاث لغات',
    editorTitleEdit: 'تعديل المنتج وإشارات الثقة',
    tabKurdish: 'الكردية (سۆرانی)',
    tabEnglish: 'الإنجليزية (English)',
    tabArabic: 'العربية (العربية)',
    titleKurdishLabel: 'ناوی کاڵا بە کوردی',
    titleEnglishLabel: 'Product Name in English',
    titleArabicLabel: 'اسم المنتج بالعربية',
    descKurdishLabel: 'وەسف و تایبەتمەندی بە کوردی',
    descEnglishLabel: 'Description in English',
    descArabicLabel: 'الوصف والمواصفات بالعربية',
    pricingSection: 'الأسعار والمخزون',
    priceIqdLabel: 'السعر بالدينار العراقي (IQD)',
    priceUsdLabel: 'السعر بالدينار (IQD)',
    stockQuantityLabel: 'الكمية المتوفرة في المخزن',
    sellerLabel: 'التاجر (المحل)',
    categoryLabel: 'تصنيف المنتج',
    transparencySection: 'إشارات ثقة المشتري (Transparency Signals)',
    warrantyTypeLabel: 'نوع الضمان',
    warrantyPeriodLabel: 'مدة الضمان (مثال: ٦ أشهر، سنة واحدة)',
    deliveryTypeLabel: 'نوع التوصيل',
    deliveryCostLabel: 'أجور التوصيل (IQD)',
    returnWindowLabel: 'مدة الاسترجاع (بالأيام)',
    returnTypeLabel: 'سياسة الاسترجاع',
    imagesSection: 'صور المنتج',
    imageUrlPlaceholder: 'أدخل رابط الصورة (URL)',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    
    aiInsightsTitle: 'تحليلات الذكاء الاصطناعي وبحث المستهلكين',
    aiInsightsSubtitle: 'رصد اهتمامات المتسوقين وتحديد الفرص غير المتوفرة للتجار',
    liveAiSearches: 'أحدث استفسارات الذكاء الاصطناعي',
    visualScans: 'عمليات مسح صور المنتجات عبر الكاميرا',
    unmetDemandGap: 'السلع المطلوبة غير المتوفرة (فجوة السوق)',
    queryText: 'نص البحث',
    userCity: 'مدينة المشتري',
    matchedResults: 'النتائج المطابقة',
    scanConfidence: 'نسبة الدقة',
    detectedObject: 'العنصر المكتشف',
    matchedMerchant: 'المتجر المطابق',

    taxonomyTitle: 'إدارة المدن والأسواق والتصنيفات',
    taxonomySubtitle: 'هيكلة التوزيع الجغرافي وتصنيفات السلع في كوردستان',
    settingsTitle: 'إعدادات المنصة وقاعدة بيانات Supabase',
    settingsSubtitle: 'ربط قاعدة بيانات PostgreSQL وتجهيز الجداول',
    supabaseConfigTitle: 'حالة وإعدادات مفاتيح Supabase',
    copySqlScript: 'نسخ كود SQL لإنشاء الجداول والسياسات',
    seedSampleData: 'تحديث البيانات النموذجية',
    copiedToClipboard: 'تم نسخ كود SQL إلى الحافظة!',
    seedSuccess: 'تم تحديث البيانات بنجاح!',
  },

  en: {
    appName: 'Bazary Gawra',
    appSubtitle: 'National Local Marketplace Platform for Kurdistan',
    adminPortal: 'Operations & Management Admin Dashboard',
    
    navOverview: 'Overview',
    navSellers: 'Merchants & Stores',
    navProducts: 'Products & Pricing',
    navAiInsights: 'AI Search & Scans',
    navTaxonomy: 'Cities & Categories',
    navSettings: 'Settings & Supabase',
    
    searchPlaceholder: 'Search merchants, products, buyer inquiries (Ctrl+K)...',
    quickAdd: 'Quick Add',
    exportCsv: 'Export CSV',
    refresh: 'Refresh',
    notifications: 'Notifications',
    verifiedSellersCount: 'Verified Merchants',
    databaseStatus: 'Database Status',
    dbConnected: 'Connected to Supabase',
    dbMock: 'Local Mock Environment',
    languageSelect: 'Language',
    
    kpiTotalProducts: 'Total Active Products',
    kpiActiveProductsSubtitle: 'Across 6 primary local bazaar categories',
    kpiVerifiedMerchants: 'Verified Local Merchants',
    kpiVerifiedMerchantsSubtitle: 'Physical storefronts in Kurdistan cities',
    kpiAiQueries: 'AI Searches & Scans',
    kpiAiQueriesSubtitle: 'Buyer queries and visual search inquiries',
    kpiTransparencyScore: 'Avg. Transparency Score',
    kpiTransparencySubtitle: 'Listings with local warranty & clear delivery',
    kpiVsLastMonth: 'vs last month',
    
    cityDistributionTitle: 'Geographic Distribution in Kurdistan',
    cityDistributionSubtitle: 'Merchants and inventory across governorates',
    sulaymaniyah: 'Sulaymaniyah',
    erbil: 'Erbil',
    duhok: 'Duhok',
    halabja: 'Halabja',
    kirkuk: 'Kirkuk',
    
    categoryHealthTitle: 'Category Inventory Health',
    categoryHealthSubtitle: 'Available listings by marketplace category',
    catFood: 'Local Food & Kurdish Products',
    catHeritage: 'Handmade & Heritage Crafts',
    catKitchen: 'Kitchenware & Supplies',
    catHomeAppliances: 'Home Appliances & Electronics',
    catTech: 'Tech & Mobile Accessories',
    catBooks: 'Books & Literature',
    
    recentActivityTitle: 'Real-Time Activity Feed',
    recentActivitySubtitle: 'New merchant onboardings, catalog updates, and buyer AI queries',
    actNewSeller: 'New merchant registered',
    actNewProduct: 'New listing published',
    actAiSearch: 'AI buyer intent search',
    actScanSearch: 'Buyer photo camera scan',
    justNow: 'Just now',
    minsAgo: 'mins ago',
    hoursAgo: 'hours ago',

    merchantsTitle: 'Kurdistan Merchant Management',
    merchantsSubtitle: 'Verify physical bazaars, review shop facades, and manage contact channels',
    addMerchant: 'Add Merchant',
    searchMerchants: 'Search by store name, owner, phone, or WhatsApp...',
    filterByCity: 'Filter City',
    filterByStatus: 'Verification Status',
    allCities: 'All Governorates',
    allStatuses: 'All Statuses',
    statusVerified: 'Verified Merchant',
    statusPending: 'Pending Review',
    statusUnverified: 'Unverified',
    statusSuspended: 'Suspended',
    merchantName: 'Store & Bazaar',
    merchantCityBazaar: 'City & Address',
    merchantContact: 'Contact & WhatsApp',
    merchantProducts: 'Products',
    merchantTrust: 'Trust Score',
    merchantActions: 'Actions',
    viewInventory: 'View Inventory',
    verifySeller: 'Verify Store',
    editSeller: 'Edit Profile',
    directWhatsApp: 'Chat on WhatsApp',
    callPhone: 'Call Phone',
    shopFacade: 'Shop Front / Facade Photo',
    bazaarLocation: 'Bazaar Neighborhood',
    ownerName: 'Owner Name',
    verificationNotes: 'Auditor Internal Notes',
    confirmVerify: 'Approve & Grant Verified Badge',
    confirmSuspend: 'Suspend Store',
    verificationDetails: 'Local Merchant Verification Review',
    
    productsTitle: 'Catalog & Information Signal Moderation',
    productsSubtitle: 'Enforce local warranty, city delivery terms, and clear return windows',
    addProduct: 'Add Product',
    searchProducts: 'Search products by title, category, or merchant...',
    filterByCategory: 'Category',
    allCategories: 'All Categories',
    auditMissingSignals: 'Missing Signals (Audit)',
    allProducts: 'All Products',
    statusActive: 'Active',
    statusDraft: 'Draft',
    statusArchived: 'Archived',
    statusOutOfStock: 'Out of Stock',
    productTitleCol: 'Product Details',
    productCategoryCol: 'Category',
    productSellerCol: 'Merchant & City',
    productPriceCol: 'Price (IQD)',
    productSignalsCol: 'Information Signals (Warranty / Delivery / Return)',
    productStockCol: 'Stock',
    productActionsCol: 'Actions',
    warranty: 'Warranty',
    delivery: 'Delivery',
    returnPolicy: 'Returns',
    transparencyScore: 'Transparency',
    iqd: 'IQD',
    usd: 'IQD',
    stockUnits: 'units',
    quickEdit: 'Quick Edit',
    fullEdit: 'Full Editor',
    deleteProduct: 'Delete',
    
    auditAlertTitle: 'Transparency Audit: Some products lack essential buyer confidence signals!',
    auditAlertDesc: 'Kurdish buyers demand transparent local shop warranty, verified same-day delivery, and test-period return terms. Complete these listings to maximize conversion.',
    signalComplete: 'Complete Signals',
    signalMissing: 'Missing Info',
    warrantyOfficial: 'Official Agent Warranty',
    warrantyShop: 'Local Shop Warranty',
    warrantyReplacement: 'On-the-spot Replacement',
    warrantyNone: 'No Warranty',
    deliverySameDay: 'Same-day City Delivery',
    deliveryExpress: '24-48h All-Kurdistan Express',
    deliveryPickup: 'Store Pickup Only',
    returnWindowDays: 'days inspection window',
    returnPolicyMoneyBack: 'Money Back Guarantee',
    returnPolicyExchange: 'Item Exchange Only',
    returnPolicyNone: 'Non-returnable',

    editorTitleNew: 'Add New Multilingual Product',
    editorTitleEdit: 'Edit Product & Transparency Signals',
    tabKurdish: 'Kurdish (Sorani)',
    tabEnglish: 'English',
    tabArabic: 'Arabic',
    titleKurdishLabel: 'Product Name in Kurdish',
    titleEnglishLabel: 'Product Name in English',
    titleArabicLabel: 'Product Name in Arabic',
    descKurdishLabel: 'Description & Specs in Kurdish',
    descEnglishLabel: 'Description & Specs in English',
    descArabicLabel: 'Description & Specs in Arabic',
    pricingSection: 'Pricing & Inventory',
    priceIqdLabel: 'Price in Iraqi Dinar (IQD)',
    priceUsdLabel: 'Price (IQD)',
    stockQuantityLabel: 'Available Stock Quantity',
    sellerLabel: 'Merchant Store',
    categoryLabel: 'Product Category',
    transparencySection: 'Buyer Confidence & Transparency Signals',
    warrantyTypeLabel: 'Warranty Type',
    warrantyPeriodLabel: 'Warranty Period (e.g. 6 Months, 1 Year)',
    deliveryTypeLabel: 'Delivery Method',
    deliveryCostLabel: 'Delivery Fee (IQD)',
    returnWindowLabel: 'Return Window (Days)',
    returnTypeLabel: 'Return Policy',
    imagesSection: 'Product Photography',
    imageUrlPlaceholder: 'Paste image URL here...',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    
    aiInsightsTitle: 'AI Search & Market Demand Intelligence',
    aiInsightsSubtitle: 'Live buyer queries across Kurdistan, camera photo scans, and market demand gaps',
    liveAiSearches: 'Live AI Buyer Inquiries',
    visualScans: 'Visual Camera Scans',
    unmetDemandGap: 'Unmet Demand Gap (Zero-Result Searches)',
    queryText: 'Buyer Query',
    userCity: 'City',
    matchedResults: 'Matches',
    scanConfidence: 'Match Confidence',
    detectedObject: 'Detected Item',
    matchedMerchant: 'Matched Store',

    taxonomyTitle: 'Cities, Bazaars & Category Taxonomy',
    taxonomySubtitle: 'Manage geographical coverage across Kurdistan and category taxonomy',
    settingsTitle: 'Settings & Supabase Integration',
    settingsSubtitle: 'PostgreSQL connection, schema migrations, and sync operations',
    supabaseConfigTitle: 'Supabase Credentials & Health',
    copySqlScript: 'Copy SQL Migration Script',
    seedSampleData: 'Reset / Seed Demo Data',
    copiedToClipboard: 'SQL schema copied to clipboard!',
    seedSuccess: 'Data initialized successfully!',
  }
};
