import type { SupportedLanguage } from '@/lib/i18n';

export const ADMIN_LANGUAGE_STORAGE_KEY = 'bg_admin_lang_v1';

export interface AdminPanelTranslations {
  groupDashboard: string;
  groupAccounts: string;
  groupMarketplace: string;
  groupTrade: string;
  groupOversight: string;
  navUsers: string;
  navSellerDirectory: string;
  navSellerApplications: string;
  navSuppliersFactories: string;
  navB2cOrders: string;
  navRfqs: string;
  navQuotations: string;
  navPurchaseOrders: string;
  navNotifications: string;
  navSupport: string;
  navAudit: string;
  navSettings: string;
  sellerId: string;
  noSellersMatch: string;
  selectLanguage: string;
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  chooseNewPassword: string;
  passwordSetupSubtitle: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  updatingPassword: string;
  saveNewPassword: string;
  returnToSignIn: string;
  signingIn: string;
  signIn: string;
  signOut: string;
  sendingResetEmail: string;
  resetPassword: string;
  resetEmailSent: string;
  enterEmailFirst: string;
  minimumPasswordLength: string;
  passwordsDoNotMatch: string;
  passwordUpdatedNotice: string;
  verifyingSession: string;
  resetLinkExpired: string;
  filterByStatus: string;
  filterByRole: string;
  reviewedBy: string;
  actionFailed: string;
  roleChangeFailed: string;
  applicationDecisionFailed: string;
  supabaseNotConfigured: string;
  liveConnected: string;
  localPersistentMode: string;
  verifying: string;
  checkHealth: string;
  connectSupabaseTitle: string;
  createEditEnv: string;
  securityModel: string;
  securityModelDescription: string;
  schemaScriptTitle: string;
  schemaScriptDescription: string;
  backupTitle: string;
  backupDescription: string;
  exportBackup: string;
  confirmResetDemo: string;
  signInFailed: string;
  profileVerificationFailed: string;
  missingAdminProfile: string;
  notAdministrator: string;
  inactiveAdministrator: string;
  pageSubtitle: string;
  suppliersSubtitle: string;
  titleUsers: string;
  titleApplications: string;
  titleSuppliers: string;
  titleNotifications: string;
  titleOrders: string;
  titleRfqs: string;
  titleQuotations: string;
  titlePurchaseOrders: string;
  titleSupport: string;
  titleAudit: string;
  loading: string;
  searchUsers: string;
  allAccountStatuses: string;
  allRoles: string;
  roleCustomer: string;
  roleSeller: string;
  roleSupplier: string;
  roleRetailer: string;
  roleBusinessBuyer: string;
  roleB2bRetailer: string;
  roleAdmin: string;
  roleSuperAdmin: string;
  noVisibleProfiles: string;
  colUser: string;
  colRole: string;
  colStatus: string;
  colBusinesses: string;
  colAction: string;
  unnamedProfile: string;
  reasonRequired: string;
  saveRole: string;
  reactivate: string;
  suspend: string;
  roleChangeRequiresSuperAdmin: string;
  searchApplications: string;
  allApplicationStatuses: string;
  noSupplierApplications: string;
  noSellerApplications: string;
  colBusiness: string;
  colApplicantContact: string;
  colApplicationStatus: string;
  colApplicationHistory: string;
  colReviewAction: string;
  unnamedBusiness: string;
  submitted: string;
  reviewed: string;
  administrator: string;
  decisionReason: string;
  approve: string;
  reject: string;
  requestChanges: string;
  enterSuspensionReason: string;
  enterRoleChangeReason: string;
  confirmSuspend: string;
  confirmReactivate: string;
  confirmRoleChange: string;
  reasonRequiredForDecision: string;
  confirmApprove: string;
  confirmReject: string;
  confirmRequestChanges: string;
  searchRecords: string;
  allStatuses: string;
  colOrderId: string;
  colCustomer: string;
  colSeller: string;
  colTotal: string;
  colPayment: string;
  colOrderStatus: string;
  colCreated: string;
  colRfqId: string;
  colBuyer: string;
  colSupplier: string;
  colRequestedItems: string;
  colRfqStatus: string;
  colSubmitted: string;
  colQuotationId: string;
  colLinkedRfq: string;
  colQuantity: string;
  colUnitPrice: string;
  colValidUntil: string;
  colTerms: string;
  colQuotationStatus: string;
  colPurchaseOrderId: string;
  colLinkedQuotation: string;
  colItems: string;
  colPurchaseOrderStatus: string;
  noItemDetails: string;
  noMatchingRecords: string;
  noLiveRecords: string;
  noRecords: string;
  colRecord: string;
  statusPending: string;
  statusActive: string;
  statusSuspended: string;
  statusApproved: string;
  statusRejected: string;
  statusChangesRequested: string;
  statusSubmitted: string;
  statusConfirmed: string;
  statusOpen: string;
  statusPaid: string;
  statusUnpaid: string;
  statusFailed: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
  statusDraft: string;
  statusSent: string;
  statusAccepted: string;
  statusExpired: string;
  statusAnswered: string;
  statusVerified: string;
  statusUnverified: string;
  statusArchived: string;
  statusOutOfStock: string;
  alertNew: string;
  missingProductSignals: string;
  adminName: string;
  adminLocation: string;
  dashboardRegion: string;
  dashboardAuditBody: string;
  reviewProducts: string;
  dashboardAiTitle: string;
  dashboardAiSubtitle: string;
  noLiveAiData: string;
  pendingCount: string;
  pendingApplications: string;
  pendingApprovalTitle: string;
  liveDatabase: string;
  needsReview: string;
  highTrust: string;
  reviewNeeded: string;
  sellerCount: string;
  productCount: string;
  noSellerRecords: string;
  mainBazaars: string;
  leadingSellerCities: string;
  recentSellerFallback: string;
  recentProductFallback: string;
  sellerRegisteredBadge: string;
  marketplaceProductBadge: string;
  statusPrefix: string;
  noProductsFound: string;
  confirmDeleteProduct: string;
  citiesAndBazaarsTitle: string;
  citiesAndBazaarsSubtitle: string;
  verifiedCount: string;
  mainBazaarsLabel: string;
  totalSellers: string;
  storeCount: string;
  marketplaceCategoriesTitle: string;
  marketplaceCategoriesSubtitle: string;
  addCategory: string;
  productCountLabel: string;
  categoryKurdishLabel: string;
  categoryEnglishLabel: string;
  categoryArabicLabel: string;
  newCategoryTitle: string;
  newCategorySubtitle: string;
  exampleCategoryKurdish: string;
  exampleCategoryEnglish: string;
  exampleCategoryArabic: string;
  slugLabel: string;
  iconLabel: string;
  saving: string;
  aiFill: string;
  trustScore: string;
  productDetailsThreeLanguages: string;
  translateEnglishArabic: string;
  autoTranslateHint: string;
  statusLabel: string;
  activeForPurchase: string;
  warrantyConditions: string;
  exampleWarrantyPeriod: string;
  exampleWarrantyConditions: string;
  deliveryTimeHours: string;
  returnConditions: string;
  exampleReturnConditions: string;
  translatingAndSaving: string;
  stockLabel: string;
  sellerProductsTitle: string;
  sellerNoProducts: string;
  whatsappContactSeller: string;
  physicalInspection: string;
  verificationNotesPlaceholder: string;
  phoneLabel: string;
  whatsappLabel: string;
  bazaarAddressLabel: string;
  translatingSaving: string;
  navigationLabel: string;
  newSellerSubtitle: string;
  sellerNameKurdish: string;
  sellerNameKurdishExample: string;
  sellerNameEnglish: string;
  ownerFullName: string;
  provinceCity: string;
  bazaarNeighborhood: string;
  bazaarExample: string;
  ownerNameExample: string;
  addressDetails: string;
  addressExample: string;
  whatsappWithoutPlus: string;
  uploadedPhotos: string;
  clickStarPrimary: string;
  selectPresetForTest: string;
  photos: string;
  addButton: string;
  iconGeneral: string;
  iconFood: string;
  iconKitchen: string;
  iconAppliances: string;
  iconTechnology: string;
  iconBeauty: string;
  iconBooks: string;
}

export const adminPanelTranslations: Record<SupportedLanguage, AdminPanelTranslations> = {
  ku: {
    groupDashboard: 'پوختە',
    groupAccounts: 'هەژمار و بازرگانییەکان',
    groupMarketplace: 'بازاڕ',
    groupTrade: 'داواکاری و B2B',
    groupOversight: 'چاودێری پلاتفۆرم',
    navUsers: 'بەکارهێنەران',
    navSellerDirectory: 'لیستی فرۆشیاران',
    navSellerApplications: 'داواکارییەکانی فرۆشیار',
    navSuppliersFactories: 'دابینکەر و کارگەکان',
    navB2cOrders: 'داواکارییەکانی B2C',
    navRfqs: 'داواکاری نرخ (RFQ)',
    navQuotations: 'نرخنامەکان',
    navPurchaseOrders: 'فەرمانی کڕین',
    navNotifications: 'ئاگادارییەکان',
    navSupport: 'پشتگیری',
    navAudit: 'تۆماری چاودێری',
    navSettings: 'ڕێکخستنەکان',
    sellerId: 'ناسنامەی فرۆشیار',
    noSellersMatch: 'هیچ فرۆشیارێک بە پێی ئەم فلتەرە نەدۆزرایەوە.',
    selectLanguage: 'زمان هەڵبژێرە',
    loginTitle: 'بەشی بەڕێوەبردنی بازاڕی گەورە',
    loginSubtitle: 'بە هەژماری ڕێپێدراوی بەڕێوەبەرەوە بچۆ ژوورەوە.',
    emailLabel: 'ئیمەیڵ',
    passwordLabel: 'وشەی نهێنی',
    chooseNewPassword: 'وشەیەکی نهێنی نوێ هەڵبژێرە',
    passwordSetupSubtitle: 'وشەی نهێنی نوێ بۆ هەژماری بەڕێوەبەری خۆت دابنێ.',
    newPasswordLabel: 'وشەی نهێنی نوێ',
    confirmPasswordLabel: 'دووبارە وشەی نهێنی بنووسە',
    updatingPassword: 'وشەی نهێنی نوێ دەکرێتەوە...',
    saveNewPassword: 'پاشەکەوتکردنی وشەی نهێنی نوێ',
    returnToSignIn: 'گەڕانەوە بۆ چوونەژوورەوە و داواکردنی بەستەرێکی نوێ',
    signingIn: 'چوونەژوورەوە...',
    signIn: 'چوونەژوورەوە',
    signOut: 'چوونەدەرەوە',
    sendingResetEmail: 'ئیمەیڵی گەڕاندنەوە دەنێردرێت...',
    resetPassword: 'گۆڕینی وشەی نهێنی',
    resetEmailSent: 'ئیمەیڵی گۆڕینی وشەی نهێنی نێردرا. پۆستی ئەلیکترۆنی خۆت بپشکنە.',
    enterEmailFirst: 'سەرەتا ناونیشانی ئیمەیڵەکەت بنووسە.',
    minimumPasswordLength: 'وشەی نهێنی دەبێت لانیکەم ٨ پیت بێت.',
    passwordsDoNotMatch: 'وشە نهێنییەکان یەک ناگرنەوە.',
    passwordUpdatedNotice: 'وشەی نهێنی نوێ کرایەوە. بە وشە نهێنییە نوێیەکەت بچۆ ژوورەوە.',
    verifyingSession: 'هەژماری بەڕێوەبەر دەپشکنرێت...',
    resetLinkExpired: 'بەستەری گۆڕینی وشەی نهێنی بەسەرچووە یان پێشتر بەکارهاتووە. داوای ئیمەیڵێکی نوێ بکە.',
    filterByStatus: 'پاڵاوتن بەپێی دۆخ',
    filterByRole: 'پاڵاوتن بەپێی ڕۆڵ',
    reviewedBy: 'پێداچوونەوەی کردووە:',
    actionFailed: 'کردارەکە سەرکەوتوو نەبوو.',
    roleChangeFailed: 'گۆڕینی ڕۆڵ سەرکەوتوو نەبوو.',
    applicationDecisionFailed: 'بڕیاری داواکاری سەرکەوتوو نەبوو.',
    supabaseNotConfigured: 'Supabase ڕێکنەخراوە.',
    liveConnected: 'بە ڕاستەوخۆ پەیوەستە',
    localPersistentMode: 'دۆخی هەمیشەیی ناوخۆیی',
    verifying: 'پشکنین دەکرێت...',
    checkHealth: 'پشکنینی پەیوەندی',
    connectSupabaseTitle: 'چۆن پەیوەندی بە پرۆژەی Supabase بکەیت:',
    createEditEnv: 'فایلی .env.local لە بوخچەی پرۆژە دروست بکە یان دەستکاری بکە و ئەمانەی تێدا دابنێ:',
    securityModel: 'مۆدێلی پاراستنی داتابەیس',
    securityModelDescription: 'RLS دەبێت چالاک بمێنێتەوە. کردارە هەستیارەکان پێویستیان بە هەژماری بەڕێوەبەری پشتڕاستکراو و پشکنینی لای سێرڤەر هەیە. ناچالاککردنی RLS ڕێگای پشتیوانی پەسەندکراو نییە.',
    schemaScriptTitle: 'سکیمای داتابەیسی PostgreSQL و سکریپتی مایگرەیشن',
    schemaScriptDescription: 'ڕاستەوخۆ لە SQL Editorی Supabase دایبنێ بۆ ئامادەکردنی خشتەکان و سیاسەتەکانی پاراستنی RLS',
    backupTitle: 'پاشەکەوت و چاودێری داتا',
    backupDescription: 'هەموو تۆمارەکانی پلاتفۆرم هەناردە بکە یان داتای نموونەیی سەرەتایی بگەڕێنەوە',
    exportBackup: 'هەناردەکردنی پاشەکەوتی تەواوی JSON',
    confirmResetDemo: 'کاتالۆگ بگەڕێندرێتەوە بۆ دۆخی نموونەیی سەرەتایی بازاڕی کوردی؟',
    signInFailed: 'چوونەژوورەوە سەرکەوتوو نەبوو.',
    profileVerificationFailed: 'نەتوانرا پرۆفایلی بەڕێوەبەری ئەم هەژمارە بپشکنرێت: {error}. مایگرەیشنی چاککردنەوەی سوپەر ئەدمین لە Supabase جێبەجێ بکە.',
    missingAdminProfile: 'چوونەژوورەوە سەرکەوتوو بوو، بەڵام ئەم هەژمارە پرۆفایلی بەڕێوەبەری نییە. مایگرەیشنی هەژمار لە Supabase جێبەجێ بکە.',
    notAdministrator: 'ئەم پرۆفایلە بەڕێوەبەر نییە. تەنها سوپەر ئەدمینی ڕێپێدراو دەتوانێت دەسەڵاتی بەڕێوەبەر بدات.',
    inactiveAdministrator: 'ئەم پرۆفایلی بەڕێوەبەر ناچالاکە. داوا لە سوپەر ئەدمینێکی ڕێپێدراو بکە چالاکی بکاتەوە.',
    pageSubtitle: 'تۆمارە ڕاستەقینەکانی پلاتفۆرم و کردارە ڕێپێدراوەکانی بەڕێوەبەر.',
    suppliersSubtitle: 'دابینکەر و کارگەکان لە هەمان تۆماری داواکاری دابینکەران بەڕێوەدەبرێن.',
    titleUsers: 'بەڕێوەبردنی بەکارهێنەران',
    titleApplications: 'داواکارییەکانی فرۆشیار و فرۆشگا',
    titleSuppliers: 'دابینکەر و کارگەکان',
    titleNotifications: 'ئاگادارییەکان',
    titleOrders: 'داواکارییەکانی B2C',
    titleRfqs: 'داواکارییەکانی نرخ (B2B)',
    titleQuotations: 'نرخنامەی دابینکەران',
    titlePurchaseOrders: 'فەرمانەکانی کڕینی B2B',
    titleSupport: 'چاودێری پشتگیری و ناکۆکی',
    titleAudit: 'تۆماری کردارەکانی بەڕێوەبەر',
    loading: 'تۆمارەکان بار دەکرێن...',
    searchUsers: 'گەڕان بەپێی ناو، ناسنامە، ڕۆڵ یان بازرگانی',
    allAccountStatuses: 'هەموو دۆخەکانی هەژمار',
    allRoles: 'هەموو ڕۆڵەکان',
    roleCustomer: 'کڕیار',
    roleSeller: 'فرۆشیار',
    roleSupplier: 'دابینکەر',
    roleRetailer: 'فرۆشیاری تاک',
    roleBusinessBuyer: 'کڕیاری بازرگانی',
    roleB2bRetailer: 'فرۆشیاری B2B',
    roleAdmin: 'بەڕێوەبەر',
    roleSuperAdmin: 'سوپەر ئەدمین',
    noVisibleProfiles: 'هیچ پرۆفایلێک بۆ ئەم بەڕێوەبەرە بەردەست نییە.',
    colUser: 'بەکارهێنەر',
    colRole: 'ڕۆڵ',
    colStatus: 'دۆخ',
    colBusinesses: 'بازرگانییە پەیوەندیدارەکان',
    colAction: 'کردار',
    unnamedProfile: 'پرۆفایلی بێ‌ناو',
    reasonRequired: 'هۆکار پێویستە',
    saveRole: 'پاشەکەوتکردنی ڕۆڵ',
    reactivate: 'چالاککردنەوە',
    suspend: 'ڕاگرتن',
    roleChangeRequiresSuperAdmin: 'گۆڕینی ڕۆڵ تەنها بۆ سوپەر ئەدمینە.',
    searchApplications: 'گەڕان بەپێی بازرگانی، داواکار یان ناسنامە',
    allApplicationStatuses: 'هەموو دۆخەکانی داواکاری',
    noSupplierApplications: 'هێشتا هیچ داواکارییەکی دابینکەر یان کارگە نەنێردراوە.',
    noSellerApplications: 'هێشتا هیچ داواکارییەکی فرۆشیار نەنێردراوە.',
    colBusiness: 'بازرگانی',
    colApplicantContact: 'داواکار / پەیوەندی',
    colApplicationStatus: 'دۆخی داواکاری',
    colApplicationHistory: 'مێژووی داواکاری',
    colReviewAction: 'کرداری پێداچوونەوە',
    unnamedBusiness: 'بازرگانی بێ‌ناو',
    submitted: 'نێردراوە:',
    reviewed: 'پێداچوونەوە:',
    administrator: 'بەڕێوەبەر',
    decisionReason: 'هۆکاری بڕیار',
    approve: 'پەسەندکردن',
    reject: 'ڕەتکردنەوە',
    requestChanges: 'داوای گۆڕانکاری',
    enterSuspensionReason: 'پێش ڕاگرتنی هەژمار هۆکارێک بنووسە.',
    enterRoleChangeReason: 'پێش گۆڕینی ڕۆڵ هۆکارێک بنووسە.',
    confirmSuspend: 'هەژماری {name} ڕابگیرێت؟',
    confirmReactivate: 'هەژماری {name} چالاک بکرێتەوە؟',
    confirmRoleChange: 'ڕۆڵی ئەم هەژمارە لە {oldRole} بگۆڕدرێت بۆ {newRole}؟ خانەی ڕۆڵ تەنها یەک ڕۆڵ هەڵدەگرێت.',
    reasonRequiredForDecision: 'بۆ ڕەتکردنەوە یان داوای گۆڕانکاری، هۆکار پێویستە.',
    confirmApprove: 'ئەم داواکارییە پەسەند بکرێت؟',
    confirmReject: 'ئەم داواکارییە ڕەت بکرێتەوە؟',
    confirmRequestChanges: 'داوای گۆڕانکاری بۆ ئەم داواکارییە بکرێت؟',
    searchRecords: 'گەڕان بە ناسنامە، کەس، کاڵا یان دۆخ',
    allStatuses: 'هەموو دۆخەکان',
    colOrderId: 'ناسنامەی داواکاری',
    colCustomer: 'کڕیار',
    colSeller: 'فرۆشیار',
    colTotal: 'کۆی گشتی',
    colPayment: 'پارەدان',
    colOrderStatus: 'دۆخی داواکاری',
    colCreated: 'دروستکراوە',
    colRfqId: 'ناسنامەی RFQ',
    colBuyer: 'کڕیار',
    colSupplier: 'دابینکەر',
    colRequestedItems: 'کاڵا و ژمارەی داواکراو',
    colRfqStatus: 'دۆخی RFQ',
    colSubmitted: 'نێردراوە',
    colQuotationId: 'ناسنامەی نرخنامە',
    colLinkedRfq: 'RFQی پەیوەندیدار',
    colQuantity: 'ژمارە',
    colUnitPrice: 'نرخی یەکە',
    colValidUntil: 'بەسەرچوون',
    colTerms: 'مەرجەکان',
    colQuotationStatus: 'دۆخی نرخنامە',
    colPurchaseOrderId: 'ناسنامەی فەرمانی کڕین',
    colLinkedQuotation: 'نرخنامەی پەیوەندیدار',
    colItems: 'کاڵا و ژمارە',
    colPurchaseOrderStatus: 'دۆخی فەرمانی کڕین',
    noItemDetails: 'هیچ وردەکارییەکی کاڵا نییە',
    noMatchingRecords: 'هیچ تۆمارێکی زیندووی هاوتا نەدۆزرایەوە.',
    noLiveRecords: 'هێشتا هیچ تۆمارێکی ڕاستەقینە نییە. دوای دروستکردنیان لە ئەپی کڕیار، داواکاری و RFQ و نرخنامە لێرە دەردەکەون.',
    noRecords: 'هیچ تۆمارێک بەردەست نییە. مایگرەیشنی بەڕێوەبردنی ناوەندی لە Supabase جێبەجێ بکە.',
    colRecord: 'تۆمار',
    statusPending: 'چاوەڕوان',
    statusActive: 'چالاک',
    statusSuspended: 'ڕاگیراو',
    statusApproved: 'پەسەندکراو',
    statusRejected: 'ڕەتکراوەتەوە',
    statusChangesRequested: 'گۆڕانکاری داواکراوە',
    statusSubmitted: 'نێردراو',
    statusConfirmed: 'پشتڕاستکراوەتەوە',
    statusOpen: 'کراوە',
    statusPaid: 'پارەدراو',
    statusUnpaid: 'پارە نەدراوە',
    statusFailed: 'سەرکەوتوو نەبوو',
    statusProcessing: 'لە پرۆسەدایە',
    statusShipped: 'نێردراوە',
    statusDelivered: 'گەیشتووە',
    statusCancelled: 'هەڵوەشێنراوەتەوە',
    statusDraft: 'ڕەشنووس',
    statusSent: 'نێردراو',
    statusAccepted: 'پەسەندکراو',
    statusExpired: 'بەسەرچوو',
    statusAnswered: 'وەڵامدراوەتەوە',
    statusVerified: 'پەسەندکراو',
    statusUnverified: 'پەسەندنەکراو',
    statusArchived: 'ئەرشیڤکراو',
    statusOutOfStock: 'لە کۆگا نەماوە',
    alertNew: 'نوێ',
    missingProductSignals: 'کاڵا پێویستی بە زانیاری گرەنتی یان گەیاندن هەیە.',
    adminName: 'بازاڕی گەورە',
    adminLocation: 'سلێمانی - ناوەندی سەرەکی',
    dashboardRegion: 'هەرێمی کوردستان',
    dashboardAuditBody: '{count} کاڵا پێویستیان بە دیاریکردنی زانیاری گرەنتی یان تێچووی گەیاندن هەیە.',
    reviewProducts: 'پشکنینی کاڵاکان',
    dashboardAiTitle: 'گەڕانەکانی زیرەکی دەستکرد',
    dashboardAiSubtitle: 'پرسیار و گەڕانی کڕیاران بە کوردی سۆرانی',
    noLiveAiData: 'هیچ داتای ژیندار بۆ گەڕانەکان و سکانی وێنەیی لە داتابەیسدا نەدۆزرایەوە.',
    pendingCount: 'چاوەڕوان',
    pendingApplications: 'داواکاری',
    pendingApprovalTitle: 'داواکاری پەسەندکردنی دووکان',
    liveDatabase: 'لە داتابەیسی ڕاستەقینە',
    needsReview: 'پێویستی بە پشکنین',
    highTrust: 'متمانەی بەرز',
    reviewNeeded: 'پێویستی بە وردبینییە',
    sellerCount: 'فرۆشیار',
    productCount: 'کاڵا',
    noSellerRecords: 'هێشتا هیچ فرۆشیارێک تۆمار نەکراوە.',
    mainBazaars: 'بازاڕە سەرەکییەکان',
    leadingSellerCities: 'ژمارەی فرۆشیارانی تۆمارکراو بەپێی شار',
    recentSellerFallback: 'دووکان',
    recentProductFallback: 'کاڵا',
    sellerRegisteredBadge: 'تۆمارکردنی دووکان',
    marketplaceProductBadge: 'کاڵای بازاڕ',
    statusPrefix: 'دۆخ',
    noProductsFound: 'هیچ کاڵایەک بەپێی ئەم فلتەرە نەدۆزرایەوە.',
    confirmDeleteProduct: 'دڵنیایت لە سڕینەوەی ئەم کاڵایە؟',
    citiesAndBazaarsTitle: 'پارێزگاکانی کوردستان و بازاڕە مێژووییەکان',
    citiesAndBazaarsSubtitle: 'ناوەندە چالاکە ناوخۆییەکان و بازاڕە پەسەندکراوەکان',
    verifiedCount: 'پەسەندکراو',
    mainBazaarsLabel: 'بازاڕە سەرەکییەکان:',
    totalSellers: 'کۆی فرۆشیاران:',
    storeCount: 'فرۆشگا',
    marketplaceCategoriesTitle: 'پۆلەکانی بازاڕی گەورە (بە سێ زمان)',
    marketplaceCategoriesSubtitle: 'پۆلێنکردنی فەرمی بە کوردی، ئینگلیزی و عەرەبی لە داتابەیس',
    addCategory: 'زیادکردنی پۆل',
    productCountLabel: 'کاڵا',
    categoryKurdishLabel: 'کوردی:',
    categoryEnglishLabel: 'ئینگلیزی:',
    categoryArabicLabel: 'عەرەبی:',
    newCategoryTitle: 'زیادکردنی پۆلی نوێ (بە ٣ زمان)',
    newCategorySubtitle: 'ناوی پۆلەکە بە کوردی، ئینگلیزی و عەرەبی داخڵ بکە',
    exampleCategoryKurdish: 'نموونە: ئامێری تەندروستی',
    exampleCategoryEnglish: 'Example: Health & Wellness',
    exampleCategoryArabic: 'مثال: الصحة والعافية',
    slugLabel: 'Slug / ناسێنەر',
    iconLabel: 'هێما (Icon)',
    saving: 'پاشەکەوت دەکرێت...',
    aiFill: 'پڕکردنەوە بە AI',
    trustScore: 'نمرەی متمانە',
    productDetailsThreeLanguages: 'زانیاری کاڵا بە سێ زمان',
    translateEnglishArabic: 'وەرگێڕان بۆ EN و AR',
    autoTranslateHint: 'وەرگێڕانی خۆکار بۆ ئینگلیزی و عەرەبی',
    statusLabel: 'دۆخی کاڵا',
    activeForPurchase: 'چالاک بۆ کڕین',
    warrantyConditions: 'مەرج و وردەکاری گرەنتی',
    exampleWarrantyPeriod: 'نموونە: ١٢ مانگ (١ ساڵ)',
    exampleWarrantyConditions: 'نموونە: گرەنتی گۆڕینەوە لە دووکان',
    deliveryTimeHours: 'ماوەی گەیاندن (بە کاتژمێر)',
    returnConditions: 'مەرجی تاقیکردنەوە و گەڕاندنەوە',
    exampleReturnConditions: 'نموونە: بە کارتۆن و پاکەتی خۆیەوە بێت',
    translatingAndSaving: 'وەرگێڕانی خۆکار و پاشەکەوتکردن...',
    stockLabel: 'لە کۆگا',
    sellerProductsTitle: 'کاڵاکانی فرۆشگا',
    sellerNoProducts: 'ئەم فرۆشیارە هێشتا هیچ کاڵایەکی نییە.',
    whatsappContactSeller: 'پەیوەندی بە فرۆشیار لە واتسئاپ',
    physicalInspection: 'پشکنینی فیزیایی دووکان',
    verificationNotesPlaceholder: 'تێبینیەکانی پشکنین، سەردانی مەیدانی، یان مۆڵەت بنووسە...',
    phoneLabel: 'ژمارەی مۆبایل',
    whatsappLabel: 'ژمارەی واتسئاپ',
    bazaarAddressLabel: 'ناونیشانی بازاڕ و شوێنی دووکان',
    translatingSaving: 'وەرگێڕانی خۆکار...',
    navigationLabel: 'ڕێنیشاندەری بەڕێوەبەر',
    newSellerSubtitle: 'تۆمارکردنی فرۆشگا و دووکانی فیزیایی لە بازاڕەکانی کوردستان',
    sellerNameKurdish: 'ناوی دووکان بە کوردی',
    sellerNameKurdishExample: 'نموونە: فرۆشگای مۆبایلی مەولەوی',
    sellerNameEnglish: 'ناوی دووکان بە ئینگلیزی (Store Name)',
    ownerFullName: 'ناوی تەواوی خاوەن کار',
    provinceCity: 'پارێزگا / شار',
    bazaarNeighborhood: 'بازاڕ / گەڕەک',
    bazaarExample: 'نموونە: شەقامی مەولەوی، قەیسەری',
    ownerNameExample: 'ناوی سیانی خاوەن کار',
    addressDetails: 'ناونیشانی وردی دووکان',
    addressExample: 'نموونە: نزیک مزگەوتی گەورە، دووکانی ١٨',
    whatsappWithoutPlus: 'ژمارەی واتسئاپ (بەبێ +)',
    uploadedPhotos: 'وێنە بارکراوەکان',
    clickStarPrimary: 'کلیک لە ئەستێرەکە بکە بۆ وێنەی سەرەکی',
    selectPresetForTest: 'هەڵبژاردنی وێنەی ئامادەکراو بۆ تاقیکردنەوە:',
    photos: 'وێنە',
    addButton: 'زیادکردن',
    iconGeneral: 'گشتی (Layers)',
    iconFood: 'خۆراک و میوە (Food/Apple)',
    iconKitchen: 'چێشتخانە (Kitchen)',
    iconAppliances: 'ئامێری ناوماڵ (Home Appliances)',
    iconTechnology: 'مۆبایل و تەکنەلۆژیا (Tech)',
    iconBeauty: 'جوانی و کەلەپوور (Beauty/Crafts)',
    iconBooks: 'کتێب و ڕۆشنبیری (Books)',
  },
  ar: {
    groupDashboard: 'لوحة المعلومات',
    groupAccounts: 'الحسابات والأعمال',
    groupMarketplace: 'السوق',
    groupTrade: 'الطلبات و B2B',
    groupOversight: 'إشراف المنصة',
    navUsers: 'المستخدمون',
    navSellerDirectory: 'دليل البائعين',
    navSellerApplications: 'طلبات البائعين',
    navSuppliersFactories: 'الموردون والمصانع',
    navB2cOrders: 'طلبات B2C',
    navRfqs: 'طلبات عروض الأسعار',
    navQuotations: 'عروض الأسعار',
    navPurchaseOrders: 'أوامر الشراء',
    navNotifications: 'الإشعارات',
    navSupport: 'الدعم',
    navAudit: 'سجل التدقيق',
    navSettings: 'الإعدادات',
    sellerId: 'معرّف البائع',
    noSellersMatch: 'لم يتم العثور على بائعين بهذه الفلاتر.',
    selectLanguage: 'اختر اللغة',
    loginTitle: 'إدارة بازاري گەورە',
    loginSubtitle: 'سجّل الدخول باستخدام حساب مسؤول مصرح به.',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    chooseNewPassword: 'اختر كلمة مرور جديدة',
    passwordSetupSubtitle: 'عيّن كلمة مرور جديدة لحساب المسؤول.',
    newPasswordLabel: 'كلمة المرور الجديدة',
    confirmPasswordLabel: 'تأكيد كلمة المرور الجديدة',
    updatingPassword: 'جارٍ تحديث كلمة المرور...',
    saveNewPassword: 'حفظ كلمة المرور الجديدة',
    returnToSignIn: 'العودة لتسجيل الدخول وطلب رابط جديد',
    signingIn: 'جارٍ تسجيل الدخول...',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    sendingResetEmail: 'جارٍ إرسال رسالة إعادة التعيين...',
    resetPassword: 'إعادة تعيين كلمة المرور',
    resetEmailSent: 'تم إرسال رسالة إعادة تعيين كلمة المرور. تحقق من بريدك.',
    enterEmailFirst: 'أدخل عنوان بريدك الإلكتروني أولاً.',
    minimumPasswordLength: 'يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل.',
    passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين.',
    passwordUpdatedNotice: 'تم تحديث كلمة المرور. سجّل الدخول باستخدام كلمة المرور الجديدة.',
    verifyingSession: 'جارٍ التحقق من حساب المسؤول...',
    resetLinkExpired: 'انتهت صلاحية رابط إعادة التعيين أو سبق استخدامه. اطلب رسالة جديدة.',
    filterByStatus: 'تصفية حسب الحالة',
    filterByRole: 'تصفية حسب الدور',
    reviewedBy: 'تمت المراجعة بواسطة:',
    actionFailed: 'تعذر إكمال الإجراء.',
    roleChangeFailed: 'تعذر تغيير الدور.',
    applicationDecisionFailed: 'تعذر اتخاذ قرار بشأن الطلب.',
    supabaseNotConfigured: 'لم يتم إعداد Supabase.',
    liveConnected: 'متصل مباشرة',
    localPersistentMode: 'الوضع المحلي الدائم',
    verifying: 'جارٍ التحقق...',
    checkHealth: 'فحص الاتصال',
    connectSupabaseTitle: 'كيفية الاتصال بمشروع Supabase:',
    createEditEnv: 'أنشئ ملف .env.local أو حرره في مجلد المشروع وأضف:',
    securityModel: 'نموذج أمان قاعدة البيانات',
    securityModelDescription: 'يجب إبقاء RLS مفعلاً. تتطلب الإجراءات الحساسة حساب مسؤول موثقاً والتحقق من الصلاحيات على الخادم. تعطيل RLS ليس إجراء صيانة مدعوماً.',
    schemaScriptTitle: 'مخطط PostgreSQL وسكربت الترحيل',
    schemaScriptDescription: 'انسخ والصق في محرر SQL في Supabase لإنشاء الجداول وسياسات أمان RLS',
    backupTitle: 'النسخ الاحتياطي وصيانة البيانات',
    backupDescription: 'صدّر سجلات المنصة أو استعد بيانات العرض الأولية',
    exportBackup: 'تصدير نسخة JSON كاملة',
    confirmResetDemo: 'هل تريد إعادة الكتالوج إلى بيانات سوق كردستان التجريبية الأولية؟',
    signInFailed: 'فشل تسجيل الدخول.',
    profileVerificationFailed: 'تعذر التحقق من ملف المسؤول لهذا الحساب: {error}. طبّق ترحيل إصلاح المسؤول الأعلى في Supabase.',
    missingAdminProfile: 'نجح تسجيل الدخول، لكن لا يوجد ملف مسؤول لهذا الحساب. طبّق ترحيل حساب المسؤول في Supabase.',
    notAdministrator: 'هذا الملف ليس لمسؤول. لا يمكن منح صلاحية المسؤول إلا بواسطة مسؤول أعلى مخول.',
    inactiveAdministrator: 'حساب المسؤول هذا غير نشط. اطلب من مسؤول أعلى مخول إعادة تفعيله.',
    pageSubtitle: 'سجلات المنصة الفعلية والإجراءات الإدارية المصرح بها.',
    suppliersSubtitle: 'تُدار الموردون والمصانع ضمن سجلات طلبات الموردين المشتركة.',
    titleUsers: 'إدارة المستخدمين',
    titleApplications: 'طلبات البائعين والمتاجر',
    titleSuppliers: 'الموردون والمصانع',
    titleNotifications: 'الإشعارات',
    titleOrders: 'طلبات B2C',
    titleRfqs: 'طلبات عروض الأسعار B2B',
    titleQuotations: 'عروض الموردين',
    titlePurchaseOrders: 'أوامر شراء B2B',
    titleSupport: 'إشراف الدعم والنزاعات',
    titleAudit: 'سجل إجراءات المسؤولين',
    loading: 'جارٍ تحميل السجلات...',
    searchUsers: 'ابحث بالاسم أو المعرّف أو الدور أو النشاط',
    allAccountStatuses: 'كل حالات الحساب',
    allRoles: 'كل الأدوار',
    roleCustomer: 'عميل',
    roleSeller: 'بائع',
    roleSupplier: 'مورد',
    roleRetailer: 'تاجر تجزئة',
    roleBusinessBuyer: 'مشتري أعمال',
    roleB2bRetailer: 'تاجر B2B',
    roleAdmin: 'مسؤول',
    roleSuperAdmin: 'مسؤول أعلى',
    noVisibleProfiles: 'لا توجد ملفات شخصية متاحة لهذا المسؤول.',
    colUser: 'المستخدم',
    colRole: 'الدور',
    colStatus: 'الحالة',
    colBusinesses: 'الأنشطة المرتبطة',
    colAction: 'الإجراء',
    unnamedProfile: 'ملف شخصي بلا اسم',
    reasonRequired: 'السبب مطلوب',
    saveRole: 'حفظ الدور',
    reactivate: 'إعادة التفعيل',
    suspend: 'تعليق',
    roleChangeRequiresSuperAdmin: 'تغيير الأدوار متاح للمسؤول الأعلى فقط.',
    searchApplications: 'ابحث عن النشاط أو مقدم الطلب أو المعرّف',
    allApplicationStatuses: 'كل حالات الطلبات',
    noSupplierApplications: 'لم يتم تقديم طلبات موردين أو مصانع بعد.',
    noSellerApplications: 'لم يتم تقديم طلبات بائعين بعد.',
    colBusiness: 'النشاط التجاري',
    colApplicantContact: 'مقدم الطلب / جهة الاتصال',
    colApplicationStatus: 'حالة الطلب',
    colApplicationHistory: 'سجل الطلب',
    colReviewAction: 'إجراء المراجعة',
    unnamedBusiness: 'نشاط تجاري بلا اسم',
    submitted: 'تاريخ التقديم:',
    reviewed: 'تمت المراجعة:',
    administrator: 'المسؤول',
    decisionReason: 'سبب القرار',
    approve: 'موافقة',
    reject: 'رفض',
    requestChanges: 'طلب تعديلات',
    enterSuspensionReason: 'أدخل سبباً قبل تعليق الحساب.',
    enterRoleChangeReason: 'أدخل سبباً قبل تغيير الدور.',
    confirmSuspend: 'هل تريد تعليق حساب {name}؟',
    confirmReactivate: 'هل تريد إعادة تفعيل حساب {name}؟',
    confirmRoleChange: 'تغيير دور الحساب من {oldRole} إلى {newRole}؟ حقل الدور يقبل دوراً واحداً فقط.',
    reasonRequiredForDecision: 'السبب مطلوب لرفض الطلب أو طلب تعديلات.',
    confirmApprove: 'هل تريد الموافقة على هذا الطلب؟',
    confirmReject: 'هل تريد رفض هذا الطلب؟',
    confirmRequestChanges: 'هل تريد طلب تعديلات على هذا الطلب؟',
    searchRecords: 'ابحث بالمعرّف أو الأشخاص أو المنتجات أو الحالة',
    allStatuses: 'كل الحالات',
    colOrderId: 'معرّف الطلب',
    colCustomer: 'العميل',
    colSeller: 'البائع',
    colTotal: 'الإجمالي',
    colPayment: 'الدفع',
    colOrderStatus: 'حالة الطلب',
    colCreated: 'تاريخ الإنشاء',
    colRfqId: 'معرّف RFQ',
    colBuyer: 'المشتري',
    colSupplier: 'المورد',
    colRequestedItems: 'المنتجات والكميات المطلوبة',
    colRfqStatus: 'حالة RFQ',
    colSubmitted: 'تاريخ التقديم',
    colQuotationId: 'معرّف عرض السعر',
    colLinkedRfq: 'طلب السعر المرتبط',
    colQuantity: 'الكمية',
    colUnitPrice: 'سعر الوحدة',
    colValidUntil: 'صالح حتى',
    colTerms: 'الشروط',
    colQuotationStatus: 'حالة عرض السعر',
    colPurchaseOrderId: 'معرّف أمر الشراء',
    colLinkedQuotation: 'عرض السعر المرتبط',
    colItems: 'المنتجات والكميات',
    colPurchaseOrderStatus: 'حالة أمر الشراء',
    noItemDetails: 'لا توجد تفاصيل للمنتجات',
    noMatchingRecords: 'لم يتم العثور على سجلات فعلية مطابقة.',
    noLiveRecords: 'لا توجد سجلات فعلية بعد. ستظهر الطلبات وطلبات الأسعار والعروض بعد إنشائها في تطبيق العميل.',
    noRecords: 'لا توجد سجلات متاحة. طبّق ترحيل الإدارة المركزية في Supabase.',
    colRecord: 'السجل',
    statusPending: 'قيد الانتظار',
    statusActive: 'نشط',
    statusSuspended: 'معلّق',
    statusApproved: 'موافق عليه',
    statusRejected: 'مرفوض',
    statusChangesRequested: 'التعديلات مطلوبة',
    statusSubmitted: 'مُقدّم',
    statusConfirmed: 'مؤكد',
    statusOpen: 'مفتوح',
    statusPaid: 'مدفوع',
    statusUnpaid: 'غير مدفوع',
    statusFailed: 'فشل',
    statusProcessing: 'قيد المعالجة',
    statusShipped: 'تم الشحن',
    statusDelivered: 'تم التسليم',
    statusCancelled: 'ملغي',
    statusDraft: 'مسودة',
    statusSent: 'مُرسل',
    statusAccepted: 'مقبول',
    statusExpired: 'منتهي الصلاحية',
    statusAnswered: 'تم الرد',
    statusVerified: 'معتمد',
    statusUnverified: 'غير معتمد',
    statusArchived: 'مؤرشف',
    statusOutOfStock: 'نفد المخزون',
    alertNew: 'جديد',
    missingProductSignals: 'منتجات تحتاج إلى معلومات الضمان أو التوصيل.',
    adminName: 'بازاري گەورە',
    adminLocation: 'السليمانية - المركز الرئيسي',
    dashboardRegion: 'إقليم كوردستان',
    dashboardAuditBody: '{count} منتج يحتاج إلى معلومات الضمان أو تكلفة التوصيل.',
    reviewProducts: 'مراجعة المنتجات',
    dashboardAiTitle: 'عمليات بحث الذكاء الاصطناعي',
    dashboardAiSubtitle: 'استفسارات وبحث العملاء باللغة الكردية السورانية',
    noLiveAiData: 'لا توجد بيانات مباشرة عن عمليات البحث أو مسح الصور في قاعدة البيانات.',
    pendingCount: 'قيد الانتظار',
    pendingApplications: 'طلبات',
    pendingApprovalTitle: 'طلبات اعتماد المتاجر',
    liveDatabase: 'من قاعدة البيانات الفعلية',
    needsReview: 'تحتاج إلى مراجعة',
    highTrust: 'موثوقية عالية',
    reviewNeeded: 'تحتاج إلى تدقيق',
    sellerCount: 'بائع',
    productCount: 'منتج',
    noSellerRecords: 'لم يتم تسجيل بائعين بعد.',
    mainBazaars: 'الأسواق الرئيسية',
    leadingSellerCities: 'عدد البائعين المسجلين حسب المدينة',
    recentSellerFallback: 'متجر',
    recentProductFallback: 'منتج',
    sellerRegisteredBadge: 'تسجيل متجر',
    marketplaceProductBadge: 'منتج في السوق',
    statusPrefix: 'الحالة',
    noProductsFound: 'لم يتم العثور على منتجات تطابق عوامل التصفية.',
    confirmDeleteProduct: 'هل أنت متأكد من حذف هذا المنتج؟',
    citiesAndBazaarsTitle: 'محافظات كوردستان وأسواقها التاريخية',
    citiesAndBazaarsSubtitle: 'المراكز المحلية النشطة والأسواق المعتمدة',
    verifiedCount: 'معتمد',
    mainBazaarsLabel: 'الأسواق الرئيسية:',
    totalSellers: 'إجمالي البائعين:',
    storeCount: 'متجر',
    marketplaceCategoriesTitle: 'فئات بازاري گەورە (بثلاث لغات)',
    marketplaceCategoriesSubtitle: 'تصنيفات موحدة بالكردية والإنجليزية والعربية في قاعدة البيانات',
    addCategory: 'إضافة فئة',
    productCountLabel: 'منتج',
    categoryKurdishLabel: 'الكردية:',
    categoryEnglishLabel: 'الإنجليزية:',
    categoryArabicLabel: 'العربية:',
    newCategoryTitle: 'إضافة فئة جديدة (بثلاث لغات)',
    newCategorySubtitle: 'أدخل اسم الفئة بالكردية والإنجليزية والعربية',
    exampleCategoryKurdish: 'مثال: أجهزة الصحة',
    exampleCategoryEnglish: 'Example: Health & Wellness',
    exampleCategoryArabic: 'مثال: الصحة والعافية',
    slugLabel: 'المعرّف (Slug)',
    iconLabel: 'الأيقونة',
    saving: 'جارٍ الحفظ...',
    aiFill: 'تعبئة بالذكاء الاصطناعي',
    trustScore: 'درجة الموثوقية',
    productDetailsThreeLanguages: 'تفاصيل المنتج بثلاث لغات',
    translateEnglishArabic: 'ترجمة إلى الإنجليزية والعربية',
    autoTranslateHint: 'ترجمة تلقائية إلى الإنجليزية والعربية',
    statusLabel: 'حالة المنتج',
    activeForPurchase: 'متاح للشراء',
    warrantyConditions: 'شروط وتفاصيل الضمان',
    exampleWarrantyPeriod: 'مثال: ١٢ شهراً (سنة واحدة)',
    exampleWarrantyConditions: 'مثال: ضمان الاستبدال في المتجر',
    deliveryTimeHours: 'مدة التوصيل (بالساعات)',
    returnConditions: 'شروط الفحص والإرجاع',
    exampleReturnConditions: 'مثال: يجب إرجاعه مع علبته وتغليفه الأصلي',
    translatingAndSaving: 'جارٍ الترجمة والحفظ...',
    stockLabel: 'في المخزون',
    sellerProductsTitle: 'منتجات المتجر',
    sellerNoProducts: 'لا توجد منتجات لهذا البائع بعد.',
    whatsappContactSeller: 'تواصل مع البائع عبر واتساب',
    physicalInspection: 'معاينة المتجر على أرض الواقع',
    verificationNotesPlaceholder: 'أدخل ملاحظات المراجعة أو الزيارة الميدانية أو الترخيص...',
    phoneLabel: 'رقم الهاتف',
    whatsappLabel: 'رقم واتساب',
    bazaarAddressLabel: 'عنوان السوق وموقع المتجر',
    translatingSaving: 'جارٍ الترجمة...',
    navigationLabel: 'التنقل الإداري',
    newSellerSubtitle: 'تسجيل المتاجر والمحلات الفعلية في أسواق كوردستان',
    sellerNameKurdish: 'اسم المتجر بالكردية',
    sellerNameKurdishExample: 'مثال: متجر مولوي للهواتف',
    sellerNameEnglish: 'اسم المتجر بالإنجليزية (Store Name)',
    ownerFullName: 'الاسم الكامل لصاحب العمل',
    provinceCity: 'المحافظة / المدينة',
    bazaarNeighborhood: 'السوق / الحي',
    bazaarExample: 'مثال: شارع مولوي، القيصرية',
    ownerNameExample: 'الاسم الكامل لصاحب العمل',
    addressDetails: 'العنوان التفصيلي للمتجر',
    addressExample: 'مثال: قرب الجامع الكبير، متجر ١٨',
    whatsappWithoutPlus: 'رقم واتساب (بدون +)',
    uploadedPhotos: 'الصور المرفوعة',
    clickStarPrimary: 'انقر على النجمة لتعيين الصورة الرئيسية',
    selectPresetForTest: 'اختر صوراً جاهزة للاختبار:',
    photos: 'صور',
    addButton: 'إضافة',
    iconGeneral: 'عام (Layers)',
    iconFood: 'طعام وفاكهة (Food/Apple)',
    iconKitchen: 'مطبخ (Kitchen)',
    iconAppliances: 'أجهزة منزلية (Home Appliances)',
    iconTechnology: 'هواتف وتقنية (Tech)',
    iconBeauty: 'جمال وحرف (Beauty/Crafts)',
    iconBooks: 'كتب وثقافة (Books)',
  },
  en: {
    groupDashboard: 'Dashboard',
    groupAccounts: 'Accounts & businesses',
    groupMarketplace: 'Marketplace',
    groupTrade: 'Orders & B2B',
    groupOversight: 'Platform oversight',
    navUsers: 'Users',
    navSellerDirectory: 'Seller directory',
    navSellerApplications: 'Seller applications',
    navSuppliersFactories: 'Suppliers & factories',
    navB2cOrders: 'B2C orders',
    navRfqs: 'RFQs',
    navQuotations: 'Quotations',
    navPurchaseOrders: 'Purchase orders',
    navNotifications: 'Notifications',
    navSupport: 'Support',
    navAudit: 'Audit logs',
    navSettings: 'Settings',
    sellerId: 'Seller ID',
    noSellersMatch: 'No sellers match these filters.',
    selectLanguage: 'Choose language',
    loginTitle: 'Bazary Gawra Admin',
    loginSubtitle: 'Sign in with an authorized administrator account.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    chooseNewPassword: 'Choose a new password',
    passwordSetupSubtitle: 'Set a new password for your administrator account.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    updatingPassword: 'Updating password...',
    saveNewPassword: 'Save new password',
    returnToSignIn: 'Return to sign in and request a new link',
    signingIn: 'Signing in...',
    signIn: 'Sign in',
    signOut: 'Sign out',
    sendingResetEmail: 'Sending reset email...',
    resetPassword: 'Reset password',
    resetEmailSent: 'A password-reset email has been sent. Check your inbox.',
    enterEmailFirst: 'Enter your email address first.',
    minimumPasswordLength: 'Password must be at least 8 characters long.',
    passwordsDoNotMatch: 'Passwords do not match.',
    passwordUpdatedNotice: 'Password updated. Sign in with your new password.',
    verifyingSession: 'Verifying administrator session...',
    resetLinkExpired: 'This reset link has expired or was already used. Request a new reset email.',
    filterByStatus: 'Filter by status',
    filterByRole: 'Filter by role',
    reviewedBy: 'Reviewed by:',
    actionFailed: 'Action failed.',
    roleChangeFailed: 'Role change failed.',
    applicationDecisionFailed: 'Application decision failed.',
    supabaseNotConfigured: 'Supabase is not configured.',
    liveConnected: 'Live connected',
    localPersistentMode: 'Local persistent mode',
    verifying: 'Verifying...',
    checkHealth: 'Check health',
    connectSupabaseTitle: 'How to connect to your Supabase project:',
    createEditEnv: 'Create or edit .env.local in the project directory and paste:',
    securityModel: 'Database Security Model',
    securityModelDescription: 'RLS must remain enabled. Sensitive actions require an authenticated administrator role and server-validated authorization. Disabling RLS is not a supported maintenance action.',
    schemaScriptTitle: 'PostgreSQL Database Schema & Migration Script',
    schemaScriptDescription: 'Copy and paste into the Supabase SQL Editor to set up tables and RLS security policies',
    backupTitle: 'Data Backup & Maintenance',
    backupDescription: 'Export platform records or restore initial demo data',
    exportBackup: 'Export Full JSON Backup',
    confirmResetDemo: 'Reset catalog to the initial Kurdish marketplace demo state?',
    signInFailed: 'Sign-in failed.',
    profileVerificationFailed: 'Could not verify this account’s administrator profile: {error}. Apply the Super Admin account repair migration in Supabase.',
    missingAdminProfile: 'Sign-in succeeded, but this account has no administrator profile. Apply the Super Admin account migration in Supabase.',
    notAdministrator: 'This profile is not an administrator. Only an authorized Super Admin can grant administrator access.',
    inactiveAdministrator: 'This administrator profile is inactive. Ask an authorized Super Admin to reactivate it.',
    pageSubtitle: 'Live platform records and authorized administrative actions.',
    suppliersSubtitle: 'Supplier and factory businesses use the shared supplier application records.',
    titleUsers: 'User Management',
    titleApplications: 'Seller & Store Applications',
    titleSuppliers: 'Suppliers & Factory Businesses',
    titleNotifications: 'Notifications',
    titleOrders: 'B2C Orders',
    titleRfqs: 'B2B RFQs',
    titleQuotations: 'Supplier Quotations',
    titlePurchaseOrders: 'B2B Purchase Orders',
    titleSupport: 'Support & Dispute Oversight',
    titleAudit: 'Administrator Audit Log',
    loading: 'Loading records...',
    searchUsers: 'Search name, ID, role, or business',
    allAccountStatuses: 'All account statuses',
    allRoles: 'All roles',
    roleCustomer: 'Customer',
    roleSeller: 'Seller',
    roleSupplier: 'Supplier',
    roleRetailer: 'Retailer',
    roleBusinessBuyer: 'Business buyer',
    roleB2bRetailer: 'B2B retailer',
    roleAdmin: 'Administrator',
    roleSuperAdmin: 'Super Admin',
    noVisibleProfiles: 'No user profiles are visible to this administrator.',
    colUser: 'User',
    colRole: 'Role',
    colStatus: 'Status',
    colBusinesses: 'Associated businesses',
    colAction: 'Action',
    unnamedProfile: 'Unnamed profile',
    reasonRequired: 'Reason required',
    saveRole: 'Save role',
    reactivate: 'Reactivate',
    suspend: 'Suspend',
    roleChangeRequiresSuperAdmin: 'Role changes require Super Admin permissions.',
    searchApplications: 'Search business, applicant, or ID',
    allApplicationStatuses: 'All application statuses',
    noSupplierApplications: 'No supplier or factory applications have been submitted yet.',
    noSellerApplications: 'No seller applications have been submitted yet.',
    colBusiness: 'Business',
    colApplicantContact: 'Applicant / Contact',
    colApplicationStatus: 'Application status',
    colApplicationHistory: 'Application history',
    colReviewAction: 'Review action',
    unnamedBusiness: 'Unnamed business',
    submitted: 'Submitted:',
    reviewed: 'Reviewed:',
    administrator: 'administrator',
    decisionReason: 'Decision reason',
    approve: 'Approve',
    reject: 'Reject',
    requestChanges: 'Request changes',
    enterSuspensionReason: 'Enter a reason before suspending an account.',
    enterRoleChangeReason: 'Enter a reason before changing a role.',
    confirmSuspend: 'Suspend {name}?',
    confirmReactivate: 'Reactivate {name}?',
    confirmRoleChange: 'Change this account role from {oldRole} to {newRole}? The role field is single-valued.',
    reasonRequiredForDecision: 'A reason is required to reject or request changes.',
    confirmApprove: 'Approve this application?',
    confirmReject: 'Reject this application?',
    confirmRequestChanges: 'Request changes for this application?',
    searchRecords: 'Search IDs, people, products, or status',
    allStatuses: 'All statuses',
    colOrderId: 'Order ID',
    colCustomer: 'Customer',
    colSeller: 'Seller',
    colTotal: 'Total',
    colPayment: 'Payment',
    colOrderStatus: 'Order status',
    colCreated: 'Created',
    colRfqId: 'RFQ ID',
    colBuyer: 'Buyer',
    colSupplier: 'Supplier',
    colRequestedItems: 'Requested products / quantity',
    colRfqStatus: 'RFQ status',
    colSubmitted: 'Submitted',
    colQuotationId: 'Quotation ID',
    colLinkedRfq: 'Linked RFQ',
    colQuantity: 'Quantity',
    colUnitPrice: 'Unit price',
    colValidUntil: 'Valid until',
    colTerms: 'Terms',
    colQuotationStatus: 'Quotation status',
    colPurchaseOrderId: 'Purchase order ID',
    colLinkedQuotation: 'Linked quotation',
    colItems: 'Items / quantity',
    colPurchaseOrderStatus: 'Order status',
    noItemDetails: 'No item details',
    noMatchingRecords: 'No matching live records found.',
    noLiveRecords: 'No live records yet. Orders, RFQs, quotations, and purchase orders will appear here after users create them in the client application.',
    noRecords: 'No records are available yet. Apply the central-management Supabase migration to create this section’s tables.',
    colRecord: 'Record',
    statusPending: 'Pending',
    statusActive: 'Active',
    statusSuspended: 'Suspended',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusChangesRequested: 'Changes requested',
    statusSubmitted: 'Submitted',
    statusConfirmed: 'Confirmed',
    statusOpen: 'Open',
    statusPaid: 'Paid',
    statusUnpaid: 'Unpaid',
    statusFailed: 'Failed',
    statusProcessing: 'Processing',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',
    statusDraft: 'Draft',
    statusSent: 'Sent',
    statusAccepted: 'Accepted',
    statusExpired: 'Expired',
    statusAnswered: 'Answered',
    statusVerified: 'Verified',
    statusUnverified: 'Unverified',
    statusArchived: 'Archived',
    statusOutOfStock: 'Out of stock',
    alertNew: 'new',
    missingProductSignals: 'products need warranty or delivery information.',
    adminName: 'Bazary Gawra',
    adminLocation: 'Sulaymaniyah - Main Office',
    dashboardRegion: 'Kurdistan Region',
    dashboardAuditBody: '{count} products need warranty or delivery cost details.',
    reviewProducts: 'Review products',
    dashboardAiTitle: 'AI search activity',
    dashboardAiSubtitle: 'Customer questions and searches in Sorani Kurdish',
    noLiveAiData: 'No live search or image-scan data was found in the database.',
    pendingCount: 'pending',
    pendingApplications: 'applications',
    pendingApprovalTitle: 'Store approval requests',
    liveDatabase: 'From the live database',
    needsReview: 'Needs review',
    highTrust: 'High trust',
    reviewNeeded: 'Review needed',
    sellerCount: 'sellers',
    productCount: 'products',
    noSellerRecords: 'No sellers have registered yet.',
    mainBazaars: 'Main bazaars',
    leadingSellerCities: 'Registered seller counts by city',
    recentSellerFallback: 'Store',
    recentProductFallback: 'Product',
    sellerRegisteredBadge: 'Store registered',
    marketplaceProductBadge: 'Marketplace product',
    statusPrefix: 'Status',
    noProductsFound: 'No products match these filters.',
    confirmDeleteProduct: 'Are you sure you want to delete this product?',
    citiesAndBazaarsTitle: 'Kurdistan provinces and historic bazaars',
    citiesAndBazaarsSubtitle: 'Active local centers and recognized marketplaces',
    verifiedCount: 'verified',
    mainBazaarsLabel: 'Main bazaars:',
    totalSellers: 'Total sellers:',
    storeCount: 'stores',
    marketplaceCategoriesTitle: 'Bazary Gawra categories (three languages)',
    marketplaceCategoriesSubtitle: 'Standard Kurdish, English, and Arabic taxonomy synchronized with the database',
    addCategory: 'Add category',
    productCountLabel: 'products',
    categoryKurdishLabel: 'Kurdish:',
    categoryEnglishLabel: 'English:',
    categoryArabicLabel: 'Arabic:',
    newCategoryTitle: 'Add a category in three languages',
    newCategorySubtitle: 'Enter the category name in Kurdish, English, and Arabic',
    exampleCategoryKurdish: 'Example: Health & Wellness',
    exampleCategoryEnglish: 'Example: Health & Wellness',
    exampleCategoryArabic: 'Example: الصحة والعافية',
    slugLabel: 'Slug / identifier',
    iconLabel: 'Icon',
    saving: 'Saving...',
    aiFill: 'Fill with AI',
    trustScore: 'Trust score',
    productDetailsThreeLanguages: 'Product details in three languages',
    translateEnglishArabic: 'Translate to EN and AR',
    autoTranslateHint: 'Auto-translate to English and Arabic',
    statusLabel: 'Product status',
    activeForPurchase: 'Active for purchase',
    warrantyConditions: 'Warranty terms and details',
    exampleWarrantyPeriod: 'Example: 12 months (1 year)',
    exampleWarrantyConditions: 'Example: Replacement warranty at the store',
    deliveryTimeHours: 'Delivery time (hours)',
    returnConditions: 'Inspection and return conditions',
    exampleReturnConditions: 'Example: Return with the original box and packaging',
    translatingAndSaving: 'Translating and saving...',
    stockLabel: 'in stock',
    sellerProductsTitle: 'Store products',
    sellerNoProducts: 'This seller has no products yet.',
    whatsappContactSeller: 'Contact seller on WhatsApp',
    physicalInspection: 'In-person store inspection',
    verificationNotesPlaceholder: 'Enter review, site-visit, or license notes...',
    phoneLabel: 'Phone number',
    whatsappLabel: 'WhatsApp number',
    bazaarAddressLabel: 'Bazaar address and store location',
    translatingSaving: 'Translating...',
    navigationLabel: 'Admin navigation',
    newSellerSubtitle: 'Register physical stores and shops in Kurdistan marketplaces',
    sellerNameKurdish: 'Store name in Kurdish',
    sellerNameKurdishExample: 'Example: Mawlawi Mobile Store',
    sellerNameEnglish: 'Store name in English',
    ownerFullName: 'Business owner full name',
    provinceCity: 'Province / city',
    bazaarNeighborhood: 'Bazaar / neighborhood',
    bazaarExample: 'Example: Mawlawi Street, Qaysari',
    ownerNameExample: 'Business owner full name',
    addressDetails: 'Detailed store address',
    addressExample: 'Example: Near the Grand Mosque, Shop 18',
    whatsappWithoutPlus: 'WhatsApp number (without +)',
    uploadedPhotos: 'Uploaded photos',
    clickStarPrimary: 'Click the star to set the primary image',
    selectPresetForTest: 'Select preset photos for testing:',
    photos: 'photos',
    addButton: 'Add',
    iconGeneral: 'General (Layers)',
    iconFood: 'Food and produce (Food/Apple)',
    iconKitchen: 'Kitchen',
    iconAppliances: 'Home appliances',
    iconTechnology: 'Mobile and technology',
    iconBeauty: 'Beauty and crafts',
    iconBooks: 'Books and culture',
  },
};

export function translateAdminStatus(status: string, copy: AdminPanelTranslations): string {
  const statusKey: Record<string, keyof AdminPanelTranslations> = {
    pending: 'statusPending',
    active: 'statusActive',
    suspended: 'statusSuspended',
    approved: 'statusApproved',
    rejected: 'statusRejected',
    changes_requested: 'statusChangesRequested',
    submitted: 'statusSubmitted',
    confirmed: 'statusConfirmed',
    open: 'statusOpen',
    paid: 'statusPaid',
    unpaid: 'statusUnpaid',
    failed: 'statusFailed',
    processing: 'statusProcessing',
    shipped: 'statusShipped',
    delivered: 'statusDelivered',
    cancelled: 'statusCancelled',
    canceled: 'statusCancelled',
    draft: 'statusDraft',
    verified: 'statusVerified',
    unverified: 'statusUnverified',
    archived: 'statusArchived',
    out_of_stock: 'statusOutOfStock',
    sent: 'statusSent',
    accepted: 'statusAccepted',
    expired: 'statusExpired',
    answered: 'statusAnswered',
  };
  const key = statusKey[status.toLowerCase()];
  return key ? copy[key] : status;
}

export function translateAdminRole(role: string, copy: AdminPanelTranslations): string {
  const roleKey: Record<string, keyof AdminPanelTranslations> = {
    customer: 'roleCustomer',
    seller: 'roleSeller',
    supplier: 'roleSupplier',
    retailer: 'roleRetailer',
    business_buyer: 'roleBusinessBuyer',
    b2b_retailer: 'roleB2bRetailer',
    admin: 'roleAdmin',
    super_admin: 'roleSuperAdmin',
    superadmin: 'roleSuperAdmin',
  };
  const key = roleKey[role.toLowerCase()];
  return key ? copy[key] : role;
}
