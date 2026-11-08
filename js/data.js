/**
 * ระบบจัดการฐานข้อมูลสารสนเทศการเลือกตั้ง และการตั้งค่าระบบ (CMS)
 * โรงเรียนวชิรธรรมสาธิต
 */

const STORAGE_KEYS = {
  COUNCIL: 'wds_election_council_2570',
  COLOR: 'wds_election_color_2570',
  CONFIG: 'wds_election_config_2570',
  ADMIN_AUTH: 'wds_admin_logged_in'
};

// ตราสัญลักษณ์เริ่มต้น (ตราโรงเรียนวชิรธรรมสาธิต พื้นหลังโปร่งใส, ตราสภานักเรียน, ตราคณะสี)
const DEFAULT_SCHOOL_LOGO = "assets/images/school-logo-transparent.png";
const DEFAULT_LOGO_2 = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%231e3a8a' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='42' fill='%23eff6ff' stroke='%233b82f6' stroke-width='1.5'/%3E%3Cpolygon points='50,20 58,38 78,38 62,50 68,68 50,57 32,68 38,50 22,38 42,38' fill='%231e3a8a' stroke='%23c59b27' stroke-width='1.5'/%3E%3Ctext x='50' y='86' font-family='sans-serif' font-size='8.5' font-weight='bold' fill='%231e3a8a' text-anchor='middle'%3Eสภานักเรียน%3C/text%3E%3C/svg%3E";
const DEFAULT_LOGO_3 = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%23b45309' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='42' fill='%23fffbeb' stroke='%23f59e0b' stroke-width='1.5'/%3E%3Ccircle cx='35' cy='42' r='8' fill='%231d4ed8'/%3E%3Ccircle cx='50' cy='34' r='8' fill='%23eab308'/%3E%3Ccircle cx='65' cy='42' r='8' fill='%23dc2626'/%3E%3Ccircle cx='42' cy='56' r='8' fill='%23ea580c'/%3E%3Ccircle cx='58' cy='56' r='8' fill='%2316a34a'/%3E%3Ctext x='50' y='86' font-family='sans-serif' font-size='8.5' font-weight='bold' fill='%2392400e' text-anchor='middle'%3E5 คณะสี%3C/text%3E%3C/svg%3E";

// SVG รูปเงา/สัญลักษณ์นักเรียนไทยมาตรฐาน
const THAI_STUDENT_MALE_PHOTO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200'%3E%3Crect width='160' height='200' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='65' r='35' fill='%2364748b'/%3E%3Cpath d='M30,175 C30,120 60,110 80,110 C100,110 130,120 130,175 Z' fill='%23ffffff' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpolygon points='80,115 70,135 80,145 90,135' fill='%231e3a8a'/%3E%3Ctext x='80' y='190' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'%3Eรูปถ่ายนักเรียน 1.5 นิ้ว%3C/text%3E%3C/svg%3E";
const THAI_STUDENT_FEMALE_PHOTO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200'%3E%3Crect width='160' height='200' fill='%23f1f5f9'/%3E%3Ccircle cx='80' cy='65' r='35' fill='%2364748b'/%3E%3Cpath d='M30,175 C30,120 60,110 80,110 C100,110 130,120 130,175 Z' fill='%23ffffff' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpolygon points='80,115 65,130 95,130' fill='%231e3a8a'/%3E%3Ctext x='80' y='190' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'%3Eรูปถ่ายนักเรียน 1.5 นิ้ว%3C/text%3E%3C/svg%3E";

// ข้อมูลกำหนดการเริ่มต้น
const DEFAULT_TIMELINE = [
  { step: 1, date: '1 - 10 พฤศจิกายน 2569', title: 'เปิดรับสมัครออนไลน์: สภานักเรียน (พรรค 10 คน) และประธานคณะสี (5 สี)', location: 'ระบบรับสมัครออนไลน์', highlight: true },
  { step: 2, date: '12 พฤศจิกายน 2569', title: 'ตรวจสอบคุณสมบัติ & จับสลากหมายเลขผู้สมัคร: ประชุมชี้แจงระเบียบการหาเสียง', location: 'หอประชุมโรงเรียน', highlight: false },
  { step: 3, date: '13 - 25 พฤศจิกายน 2569', title: 'รณรงค์หาเสียง: แถลงนโยบายหน้าเสาธง และประชาสัมพันธ์ตามจุดที่โรงเรียนกำหนด', location: 'ภายในบริเวณโรงเรียน', highlight: false },
  { step: 4, date: '27 พฤศจิกายน 2569', title: 'วันลงคะแนนเสียงเลือกตั้งใหญ่: เปิดคูหาลงคะแนนเสียง เวลา 08.30 - 15.00 น.', location: 'คูหาลงคะแนนเสียง', highlight: true },
  { step: 5, date: '28 พฤศจิกายน 2569', title: 'ประกาศผลการเลือกตั้งอย่างเป็นทางการ: และกำหนดวันส่งมอบงาน', location: 'กลุ่มบริหารกิจการนักเรียน', highlight: false }
];

// ข้อมูลระเบียบและเกณฑ์คุณสมบัติเริ่มต้น (หมวดที่ 1 สภานักเรียน)
const DEFAULT_COUNCIL_RULES = [
  'ระดับชั้น: ผู้สมัครทุกคนต้องเป็นนักเรียนที่กำลังศึกษาอยู่ในระดับชั้นมัธยมศึกษาปีที่ 4 โรงเรียนวชิรธรรมสาธิต',
  'คุณสมบัติของผู้สมัครรับเลือกตั้งเป็นประธานสภานักเรียน',
  '๑.๑ กำลังศึกษาระดับชั้นมัธยมศึกษาปีที่ ๔ ณ วันสมัครรับเลือกตั้ง',
  '๑.๒ มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า ๒.๘๐ (ชั้น ม.๔ ภาคเรียนที่ ๑)',
  '๑.๓ ยินดีสละเวลา และอุทิศตนเพื่อประโยชน์ส่วนรวม',
  '๑.๔ ได้รับความยินยอมจากผู้ปกครอง',
  '๑.๕ เป็นผู้มีความเลื่อมใสในการปกครองระบอบประชาธิปไตย อันมีพระมหากษัตริย์ทรงเป็นประมุข',
  '๑.๖ มีสุขภาพสมบูรณ์ แข็งแรง',
  '๑.๗ เป็นผู้ไม่เคยทำผิดระเบียบของโรงเรียนตั้งแต่โทษสถานกลางขึ้นไป',
  '๑.๘ มีคุณสมบัติอื่น และสามารถปฏิบัติหน้าที่ตามธรรมนูญสภานักเรียนโรงเรียนวชิรธรรมสาธิตที่กำหนดไว้',
  '๑.๙ ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียนต้องจัดตั้งพรรคโดยให้มีสมาชิกภายในพรรค จำนวน ๑๐ คน และมีผู้แทนพรรคเพื่อดำรงตำแหน่ง',
  'ดังต่อไปนี้',
  '๑.๙.๑ ประธานพรรคลงสมัครประธานสภานักเรียน ๑ คน',
  '๑.๙.๒ รองประธานพรรค ๑ คน',
  '๑.๙.๓ สมาชิกพรรคฝ่ายวิชาการ ๒ คน',
  '๑.๙.๔ สมาชิกพรรคฝ่ายสันทนาการ ๒ คน',
  '๑.๙.๕ สมาชิกพรรคฝ่ายทั่วไป ๑ คน',
  '๑.๙.๖ สมาชิกพรรคฝ่ายประชาสัมพันธ์ ๒ คน',
  '๑.๙.๗ เลขานุการสภานักเรียน ๑ คน',
  '๑.๑๐ ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียน ไม่เคยเข้าค่ายปรับพฤติกรรม และต้องมีคะแนนความประพฤติ อย่างน้อย ๗๐ คะแนนขึ้นไป',
  'ครูที่ปรึกษา: ต้องมีข้าราชการครูหรือครูอัตราจ้างโรงเรียนวชิรธรรมสาธิต อย่างน้อย 1 ท่าน ลงนามรับรองเป็นครูที่ปรึกษาพรรค',
  'ความยินยอม: ต้องได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ปกครอง และยอมรับ ข้อตกลงของสภานักเรียน โรงเรียนวชิรธรรมสาธิต ประจำปีการศึกษา ๒๕๗๐'
];

// ข้อมูลระเบียบและเกณฑ์คุณสมบัติเริ่มต้น (หมวดที่ 2 ประธานคณะสี)
const DEFAULT_COLOR_RULES = [
  'สังกัดคณะสี: ผู้สมัครต้องเป็นนักเรียนชั้น ม.4 ที่มีชื่อสังกัดในคณะสีที่สมัคร ได้แก่ คณะสีอัญชัน (น้ำเงิน), คณะสีนนทรี (เหลือง), คณะปาริชาต (แดง), คณะสีเอื้องช่อแสด (แสด), คณะสีอินทนิล (เขียว)',
  'ผลการเรียนเฉลี่ยสะสม (GPAX ม.4 เทอม 1): ไม่ต่ำกว่า 2.50',
  'คะแนนความประพฤติ: มีคะแนนคงเหลือ ณ วันสมัคร ไม่ต่ำกว่า 80 คะแนน',
  'ครูที่ปรึกษา: มีครูที่ปรึกษาประจำคณะสีลงนามรับรองคุณสมบัติและความประพฤติ',
  'ความยินยอม: ได้รับความยินยอมจากผู้ปกครอง และยอมรับ ข้อตกลงของสภานักเรียน โรงเรียนวชิรธรรมสาธิต ประจำปีการศึกษา 2567'
];

// ข้อมูลสรุปหน้าการ์ดยื่นใบสมัครออนไลน์ (Tab 3)
const DEFAULT_APPLY_COUNCIL_BULLETS = [
  'GPAX ม.4 เทอม 1: ประธาน/เลขา ≥ 2.75, ตำแหน่งอื่น ≥ 2.50',
  'คะแนนพฤติกรรมคงเหลือไม่ต่ำกว่า 80 คะแนน',
  'แนบไฟล์รูปถ่ายนักเรียนขนาด 1.5 นิ้ว ทุกตำแหน่ง',
  'ข้อตกลงสภานักเรียน ปีการศึกษา 2568'
];

const DEFAULT_APPLY_COLOR_BULLETS = [
  'นักเรียนชั้น ม.4 ที่สังกัดในคณะสีนั้นๆ',
  'GPAX ม.4 เทอม 1 ไม่ต่ำกว่า 2.50',
  'คะแนนพฤติกรรมคงเหลือไม่ต่ำกว่า 80 คะแนน',
  'ข้อตกลงสภานักเรียน ปีการศึกษา 2567'
];

// ข้อมูลหน้าดาวน์โหลดแบบฟอร์มเอกสาร (documents.html)
const DEFAULT_DOCUMENTS_LIST = [
  {
    id: 1,
    title: 'หนังสือยินยอมจากผู้ปกครอง (Parental Consent Form)',
    desc: 'แบบฟอร์มอนุญาตให้นักเรียนลงสมัครรับเลือกตั้งประธานสภานักเรียน หรือประธานคณะสี',
    signer: 'บิดา มารดา หรือผู้ปกครอง',
    btnText: 'เปิดพิมพ์ A4',
    actionType: 'consent'
  },
  {
    id: 2,
    title: 'แบบคำร้องขอใบรับรองคะแนนความประพฤติ (คะแนนพฤติกรรม)',
    desc: 'แบบฟอร์มยื่นต่อกลุ่มบริหารกิจการนักเรียน เพื่อขอรับรองคะแนนความประพฤติคงเหลือ (เกณฑ์ไม่ต่ำกว่า 80 คะแนน)',
    signer: 'ครูประจำชั้น และงานวินัยนักเรียน',
    btnText: 'เปิดพิมพ์ A4',
    actionType: 'behavior'
  },
  {
    id: 3,
    title: 'แบบรับทราบระเบียบการเลือกตั้ง (พร้อมแบบเซ็นรับทราบ)',
    desc: 'แบบฟอร์มแสดงความยินยอมและรับทราบระเบียบ ข้อตกลง และเกณฑ์คุณสมบัติการเลือกตั้ง พร้อมลงลายมือชื่อรับทราบ',
    signer: 'ผู้สมัคร, ผู้ปกครอง และครูที่ปรึกษา',
    btnText: 'เปิดพิมพ์ A4',
    actionType: 'regulation'
  },
  {
    id: 4,
    title: 'แบบฟอร์มใบสมัครเปล่า: ประธานสภานักเรียน (A4)',
    desc: 'สำหรับพิมพ์เพื่อนำไปกรอกข้อมูลด้วยลายมือและติดรูปถ่ายด้วยตนเอง',
    signer: 'ผู้สมัครและครูที่ปรึกษา',
    btnText: 'พิมพ์ฟอร์ม',
    actionType: 'print_council'
  },
  {
    id: 5,
    title: 'แบบฟอร์มใบสมัครเปล่า: ประธานคณะสี 5 สี (A4)',
    desc: 'สำหรับพิมพ์เพื่อนำไปกรอกข้อมูลด้วยลายมือและติดรูปถ่ายด้วยตนเอง',
    signer: 'ผู้สมัครและครูที่ปรึกษาพรรค',
    btnText: 'พิมพ์ฟอร์ม',
    actionType: 'print_color'
  },
  {
    id: 6,
    title: 'คู่มือการใช้งานระบบรับสมัครเลือกตั้งออนไลน์ (System User Manual)',
    desc: 'คู่มือขั้นตอนการยื่นใบสมัครออนไลน์ การพิมพ์ฟอร์ม A4 บทบาทครูที่ปรึกษา และระบบหลังบ้าน',
    signer: 'คณะกรรมการจัดการเลือกตั้ง',
    btnText: 'เปิดอ่านคู่มือ',
    actionType: 'manual'
  }
];

// การตั้งค่าระบบเริ่มต้น
const DEFAULT_HERO_BANNER_IMAGE = 'assets/images/hero-bg-clean.jpg';

const DEFAULT_SITE_CONFIG = {
  configVersion: '2570.2',
  schoolName: 'โรงเรียนวชิรธรรมสาธิต',
  schoolNameEn: 'WACHIRATHAMSATIT SCHOOL',
  schoolLogo: DEFAULT_SCHOOL_LOGO,
  schoolLogo2: '',
  schoolLogo3: '',
  heroBannerImage: DEFAULT_HERO_BANNER_IMAGE,
  heroBannerPosX: 100,
  heroBannerPosY: 50,
  heroBannerZoom: 100,
  affiliation: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2',
  departmentName: 'กลุ่มบริหารบุคคล • งานส่งเสริมประชาธิปไตยในโรงเรียน',
  academicYear: '2570',
  councilAgreementYear: '2568',
  colorAgreementYear: '2567',
  regPeriod: '1 - 10 พฤศจิกายน 2569',
  announcementText: 'เปิดรับสมัครเลือกตั้งประธานสภานักเรียน และประธานคณะสี ประจำปีการศึกษา 2570 ตั้งแต่วันที่ 16 - 30 พฤศจิกายน 2569',
  minBehaviorScore: 80,
  minGpaPresident: 2.75,
  minGpaMember: 2.50,
  minGpaColor: 2.50,
  schoolAddress: 'เลขที่ 1253 ซอยวชิรธรรมสาธิต 57 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260',
  contactPerson: 'คุณครูสีวลี ยืนยาว',
  schoolPhone: '0990499597',
  councilOfficeHours: 'กรุณาติดต่อในวันและเวลาราชการ (วันจันทร์ ถึง วันศุกร์ | ตั้งแต่เวลา 08.30 - 16.30 น.)',
  councilEmail: 'wtstudentcouncil@gclass.wt.ac.th',
  councilPhone: '084-3530359 (ประธานสภานักเรียน)',
  schoolWebsite: 'https://www.wt.ac.th',
  rulesHeaderTitle: 'ประกาศและคุณสมบัติของผู้สมัครรับเลือกตั้ง ประจำปีการศึกษา 2570',
  rulesHeaderSubtitle: 'ข้อบังคับกลุ่มบริหารกิจการนักเรียน',
  rulesSection1Title: 'หมวดที่ 1: เกณฑ์คุณสมบัติผู้สมัครประธานสภานักเรียน',
  rulesCouncilList: DEFAULT_COUNCIL_RULES,
  rulesSection2Title: 'หมวดที่ 2: เกณฑ์คุณสมบัติผู้สมัครประธานคณะสี (5 คณะสี)',
  rulesColorList: DEFAULT_COLOR_RULES,
  applyHeaderTitle: 'เลือกประเภทตำแหน่งที่ต้องการยื่นใบสมัครออนไลน์ ประจำปีการศึกษา 2570',
  applyHeaderSubtitle: 'กรุณาเลือกประเภทการสมัครเพื่อเข้าสู่หน้ากรอกข้อมูลและแนบไฟล์รูปถ่าย',
  applyCouncilTitle: '1. สมัครเลือกตั้งประธานสภานักเรียน',
  applyCouncilBadge: 'ทีมพรรค 10 คน',
  applyCouncilDesc: 'สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 4 ที่รวมกลุ่มจัดตั้งพรรคการเมือง จำนวน 10 ตำแหน่ง (ประธาน, รองประธาน, วิชาการ 2 คน, สันทนาการ 2 คน, ฝ่ายทั่วไป, ประชาสัมพันธ์ 2 คน, เลขานุการ)',
  applyCouncilBullets: DEFAULT_APPLY_COUNCIL_BULLETS,
  applyCouncilBtnText: 'เข้าสู่แบบฟอร์มสมัครสภานักเรียน (10 ตำแหน่ง)',
  applyColorTitle: '2. สมัครเลือกตั้งประธานคณะสี (5 คณะสี)',
  applyColorBadge: '5 คณะสี',
  applyColorDesc: 'สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 4 ที่ประสงค์ลงสมัครเป็นผู้นำคณะสี เพื่อขับเคลื่อนกิจกรรมกีฬาภายใน กิจกรรมเชียร์ และสร้างความสามัคคี',
  applyColorHousesText: '1. คณะสีอัญชัน, 2. คณะสีนนทรี, 3. คณะปาริชาต, 4. คณะสีเอื้องช่อแสด, 5. คณะสีอินทนิล',
  applyColorBullets: DEFAULT_APPLY_COLOR_BULLETS,
  applyColorBtnText: 'เข้าสู่แบบฟอร์มสมัครประธานคณะสี (5 สี)',
  docsPageHeaderTitle: 'แบบฟอร์มเอกสารประกอบการรับสมัคร ประจำปีการศึกษา 2570',
  docsCardTitle: 'รายการแบบฟอร์มเอกสารทางการที่ต้องนำส่ง',
  docsCardSubtitle: 'ขนาดกระดาษ A4',
  documentsList: DEFAULT_DOCUMENTS_LIST,
  timeline: DEFAULT_TIMELINE,
  lineGroupUrl: 'https://line.me/ti/g/KhLtg2M7vA',
  lineGroupQr: 'assets/images/line-group-qr.jpg',
  lineGroupTitle: 'กรุณาเข้ากลุ่ม LINE ผู้สมัคร',
  lineGroupDesc: 'เพื่อติดตามประกาศหมายเลขผู้สมัคร กำหนดการประชุมชี้แจง และประสานงานกับคณะกรรมการจัดการเลือกตั้ง',
  councilSignatures: [
    {
      id: 1,
      headerText: '',
      hasStatusCheck: false,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ผู้สมัครประธาน',
      signerType: 'applicant',
      signerName: '',
      positionText: '',
      showDate: true,
      dateText: 'วันที่........เดือน...................พ.ศ. 2569'
    },
    {
      id: 2,
      headerText: '',
      hasStatusCheck: false,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ครูที่ปรึกษาพรรค',
      signerType: 'advisor',
      signerName: '',
      positionText: '',
      showDate: true,
      dateText: 'วันที่........เดือน...................พ.ศ. 2569'
    },
    {
      id: 3,
      headerText: 'สำหรับงานส่งเสริมประชาธิปไตย',
      hasStatusCheck: true,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ผู้ตรวจรับ',
      signerType: 'custom',
      signerName: '',
      positionText: 'หัวหน้ากลุ่มบริหารกิจการนักเรียน',
      showDate: false,
      dateText: ''
    }
  ],
  colorSignatures: [
    {
      id: 1,
      headerText: '',
      hasStatusCheck: false,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ผู้สมัครประธานสี',
      signerType: 'applicant',
      signerName: '',
      positionText: '',
      showDate: true,
      dateText: 'วันที่........เดือน...................พ.ศ. 2569'
    },
    {
      id: 2,
      headerText: '',
      hasStatusCheck: false,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ครูที่ปรึกษาคณะสี',
      signerType: 'advisor',
      signerName: '',
      positionText: '',
      showDate: true,
      dateText: 'วันที่........เดือน...................พ.ศ. 2569'
    },
    {
      id: 3,
      headerText: 'สำหรับงานส่งเสริมกิจกรรมคณะสี',
      hasStatusCheck: true,
      statusLabel: 'ผ่านคุณสมบัติ',
      signatureLabel: 'ลงชื่อ......................................................ผู้ตรวจรับ',
      signerType: 'custom',
      signerName: '',
      positionText: 'หัวหน้ากลุ่มบริหารกิจการนักเรียน',
      showDate: false,
      dateText: ''
    }
  ]
};

// ข้อมูลคณะสี 5 สีของโรงเรียน
const COLOR_HOUSES = [
  { id: 'anchan', name: 'คณะสีอัญชัน', colorCode: '#1d4ed8', tag: 'สีน้ำเงิน' },
  { id: 'nontri', name: 'คณะสีนนทรี', colorCode: '#b45309', tag: 'สีเหลือง' },
  { id: 'parichat', name: 'คณะปาริชาต', colorCode: '#b91c1c', tag: 'สีแดง' },
  { id: 'euang', name: 'คณะสีเอื้องช่อแสด', colorCode: '#c2410c', tag: 'สีแสด' },
  { id: 'inthanin', name: 'คณะสีอินทนิล', colorCode: '#047857', tag: 'สีเขียว' }
];

// โครงสร้างตำแหน่งสภานักเรียน 10 ตำแหน่ง
const COUNCIL_POSITIONS = [
  { key: 'president', title: 'ผู้ลงสมัครประธานสภานักเรียน', isLeader: true },
  { key: 'vice_president', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งรองประธานพรรค' },
  { key: 'academic_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายวิชาการ (คนที่ 1)' },
  { key: 'academic_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายวิชาการ (คนที่ 2)' },
  { key: 'recreation_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายสันทนาการ (คนที่ 1)' },
  { key: 'recreation_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายสันทนาการ (คนที่ 2)' },
  { key: 'general', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายทั่วไป' },
  { key: 'pr_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายประชาสัมพันธ์ (คนที่ 1)' },
  { key: 'pr_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายประชาสัมพันธ์ (คนที่ 2)' },
  { key: 'secretary', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งเลขานุการ' }
];

// โครงสร้างตำแหน่งสมาชิกคณะสี 9 ตำแหน่ง (นอกเหนือจากประธานคณะสี)
const COLOR_MEMBER_POSITIONS = [
  { key: 'vice_president', title: 'รองประธานคณะสี', roleName: 'รองประธานคณะสี' },
  { key: 'general_1', title: 'ฝ่ายทั่วไป (คนที่ 1)', roleName: 'ฝ่ายทั่วไป (คนที่ 1)' },
  { key: 'general_2', title: 'ฝ่ายทั่วไป (คนที่ 2)', roleName: 'ฝ่ายทั่วไป (คนที่ 2)' },
  { key: 'pr_1', title: 'ฝ่ายประชาสัมพันธ์ (คนที่ 1)', roleName: 'ฝ่ายประชาสัมพันธ์ (คนที่ 1)' },
  { key: 'pr_2', title: 'ฝ่ายประชาสัมพันธ์ (คนที่ 2)', roleName: 'ฝ่ายประชาสัมพันธ์ (คนที่ 2)' },
  { key: 'recreation_1', title: 'ฝ่ายสันทนาการ (คนที่ 1)', roleName: 'ฝ่ายสันทนาการ (คนที่ 1)' },
  { key: 'recreation_2', title: 'ฝ่ายสันทนาการ (คนที่ 2)', roleName: 'ฝ่ายสันทนาการ (คนที่ 2)' },
  { key: 'recreation_3', title: 'ฝ่ายสันทนาการ (คนที่ 3)', roleName: 'ฝ่ายสันทนาการ (คนที่ 3)' },
  { key: 'secretary', title: 'เลขานุการคณะสี', roleName: 'เลขานุการคณะสี' }
];

// ข้อมูลจำลองสำหรับทดสอบระบบ
const DEFAULT_COUNCIL_APPLICATIONS = [
  {
    id: 'COUNCIL-2570-001',
    partyName: 'พรรคก้าวใหม่ วชิรธรรม',
    slogan: 'สร้างสรรค์ พัฒนา พาสู่การเปลี่ยนแปลงที่จับต้องได้',
    candidateNumber: '1',
    status: 'approved',
    submittedAt: '1 พ.ย. 2569 10:30 น.',
    reviewedBy: 'ครูกิจการนักเรียน',
    notes: 'คุณสมบัติครบถ้วน เอกสารและรูปถ่ายถูกต้องตามระเบียบ',
    agreementAccepted: true,
    agreementYear: '2568',
    advisorName: 'นายสมชาย ใจดี',
    advisorPhone: '081-234-5678',
    members: {
      president: {
        fullname: 'นายธนกฤต ศิริวัฒนา',
        grade: 'ม.4',
        room: '1',
        studentId: '45101',
        behaviorScore: 98,
        gpax: '3.82',
        phone: '089-111-2233',
        photo: THAI_STUDENT_MALE_PHOTO,
        agreed: true
      },
      vice_president: {
        fullname: 'นางสาวกานต์พิชชา รัตนเรืองรอง',
        grade: 'ม.4',
        room: '2',
        studentId: '45115',
        behaviorScore: 95,
        gpax: '3.75',
        phone: '089-111-2234',
        photo: THAI_STUDENT_FEMALE_PHOTO,
        agreed: true
      },
      academic_1: {
        fullname: 'นายพงศกร วิริยะกิจ',
        grade: 'ม.4',
        room: '1',
        studentId: '45105',
        behaviorScore: 100,
        gpax: '3.94',
        phone: '089-111-2235',
        photo: THAI_STUDENT_MALE_PHOTO,
        agreed: true
      },
      academic_2: {
        fullname: 'นางสาวณิชาภา บุญประเสริฐ',
        grade: 'ม.4',
        room: '3',
        studentId: '45122',
        behaviorScore: 92,
        gpax: '3.65',
        phone: '089-111-2236',
        photo: THAI_STUDENT_FEMALE_PHOTO,
        agreed: true
      },
      recreation_1: {
        fullname: 'นายปภังกร เตชะวัฒน์',
        grade: 'ม.4',
        room: '4',
        studentId: '45140',
        behaviorScore: 88,
        gpax: '3.20',
        phone: '089-111-2237',
        photo: THAI_STUDENT_MALE_PHOTO,
        agreed: true
      },
      recreation_2: {
        fullname: 'นางสาวศศิธร วัฒนพาณิชย์',
        grade: 'ม.4',
        room: '5',
        studentId: '45155',
        behaviorScore: 90,
        gpax: '3.45',
        phone: '089-111-2238',
        photo: THAI_STUDENT_FEMALE_PHOTO,
        agreed: true
      },
      general: {
        fullname: 'นายกิตติภูมิ ทรัพย์เจริญ',
        grade: 'ม.4',
        room: '6',
        studentId: '45170',
        behaviorScore: 95,
        gpax: '3.15',
        phone: '089-111-2239',
        photo: THAI_STUDENT_MALE_PHOTO,
        agreed: true
      },
      pr_1: {
        fullname: 'นางสาวชัชชญา ศรีสุวรรณ',
        grade: 'ม.4',
        room: '2',
        studentId: '45118',
        behaviorScore: 96,
        gpax: '3.50',
        phone: '089-111-2240',
        photo: THAI_STUDENT_FEMALE_PHOTO,
        agreed: true
      },
      pr_2: {
        fullname: 'นายวรเมธ เกียรติสกุล',
        grade: 'ม.4',
        room: '3',
        studentId: '45129',
        behaviorScore: 89,
        gpax: '3.38',
        phone: '089-111-2241',
        photo: THAI_STUDENT_MALE_PHOTO,
        agreed: true
      },
      secretary: {
        fullname: 'นางสาวพิชชาพร แสงอรุณ',
        grade: 'ม.4',
        room: '1',
        studentId: '45109',
        behaviorScore: 99,
        gpax: '3.88',
        phone: '089-111-2242',
        photo: THAI_STUDENT_FEMALE_PHOTO,
        agreed: true
      }
    }
  }
];

const DEFAULT_COLOR_APPLICATIONS = [
  {
    id: 'COLOR-2570-001',
    colorId: 'anchan',
    colorName: 'คณะสีอัญชัน',
    partyName: 'อัญชันสามัคคี',
    candidateNumber: '1',
    status: 'approved',
    submittedAt: '1 พ.ย. 2569 11:15 น.',
    agreementAccepted: true,
    agreementYear: '2567',
    advisorName: 'นางวันทนา วงศ์วาน',
    advisorPhone: '082-345-6789',
    leader: {
      fullname: 'นายธีรภัทร ชาญวิชัย',
      grade: 'ม.4',
      room: '2',
      studentId: '45112',
      behaviorScore: 96,
      gpax: '3.55',
      phone: '081-333-4455',
      photo: THAI_STUDENT_MALE_PHOTO,
      agreed: true
    },
    members: [
      { fullname: 'นางสาวพิมพ์มาดา วงศ์ษา', grade: 'ม.4', room: '2', studentId: '45116', behaviorScore: 92, gpax: '3.40', role: 'รองประธานคณะสี' },
      { fullname: 'นายชินวัฒน์ สว่างจิต', grade: 'ม.4', room: '3', studentId: '45125', behaviorScore: 90, gpax: '3.10', role: 'ฝ่ายกีฬาและขบวนพาเหรด' },
      { fullname: 'นางสาวปรียาพร เกียรติกูล', grade: 'ม.4', room: '1', studentId: '45108', behaviorScore: 95, gpax: '3.62', role: 'ฝ่ายสวัสดิการและกองเชียร์' }
    ]
  },
  {
    id: 'COLOR-2570-002',
    colorId: 'nontri',
    colorName: 'คณะสีนนทรี',
    partyName: 'นนทรีเรืองรอง',
    candidateNumber: '1',
    status: 'approved',
    submittedAt: '1 พ.ย. 2569 13:40 น.',
    agreementAccepted: true,
    agreementYear: '2567',
    advisorName: 'นายประสิทธิ์ มีสุข',
    advisorPhone: '083-456-7890',
    leader: {
      fullname: 'นางสาวนภัสวรรณ ธนโกศล',
      grade: 'ม.4',
      room: '3',
      studentId: '45120',
      behaviorScore: 94,
      gpax: '3.68',
      phone: '082-444-5566',
      photo: THAI_STUDENT_FEMALE_PHOTO,
      agreed: true
    },
    members: [
      { fullname: 'นายกรวิชญ์ อารีชน', grade: 'ม.4', room: '4', studentId: '45145', behaviorScore: 89, gpax: '3.25', role: 'รองประธานคณะสี' },
      { fullname: 'นางสาวปัณฑิตา สมบัติ', grade: 'ม.4', room: '3', studentId: '45128', behaviorScore: 91, gpax: '3.42', role: 'ฝ่ายเชียร์และลีดเดอร์' }
    ]
  },
  {
    id: 'COLOR-2570-003',
    colorId: 'parichat',
    colorName: 'คณะปาริชาต',
    partyName: 'ปาริชาตพลังแดง',
    candidateNumber: '1',
    status: 'approved',
    submittedAt: '2 พ.ย. 2569 09:10 น.',
    agreementAccepted: true,
    agreementYear: '2567',
    advisorName: 'นางสุดารัตน์ พงษ์ไพศาล',
    advisorPhone: '084-567-8901',
    leader: {
      fullname: 'นายอัครวินท์ ภักดีชน',
      grade: 'ม.4',
      room: '1',
      studentId: '45103',
      behaviorScore: 97,
      gpax: '3.72',
      phone: '083-555-6677',
      photo: THAI_STUDENT_MALE_PHOTO,
      agreed: true
    },
    members: [
      { fullname: 'นายธนาธิป เจริญทรัพย์', grade: 'ม.4', room: '1', studentId: '45107', behaviorScore: 93, gpax: '3.30', role: 'รองประธานคณะสี' }
    ]
  },
  {
    id: 'COLOR-2570-004',
    colorId: 'euang',
    colorName: 'คณะสีเอื้องช่อแสด',
    partyName: 'เอื้องช่อแสดพัฒนา',
    candidateNumber: '1',
    status: 'pending',
    submittedAt: '2 พ.ย. 2569 14:20 น.',
    agreementAccepted: true,
    agreementYear: '2567',
    advisorName: 'นายสมปอง ยิ้มแย้ม',
    advisorPhone: '085-678-9012',
    leader: {
      fullname: 'นางสาวสุพิชชา เมธากุล',
      grade: 'ม.4',
      room: '4',
      studentId: '45142',
      behaviorScore: 91,
      gpax: '3.48',
      phone: '084-666-7788',
      photo: THAI_STUDENT_FEMALE_PHOTO,
      agreed: true
    },
    members: [
      { fullname: 'นายก้องภพ ปัญญารักษ์', grade: 'ม.4', room: '5', studentId: '45158', behaviorScore: 88, gpax: '3.12', role: 'รองประธานคณะสี' }
    ]
  },
  {
    id: 'COLOR-2570-005',
    colorId: 'inthanin',
    colorName: 'คณะสีอินทนิล',
    partyName: 'อินทนิลร่วมใจ',
    candidateNumber: '1',
    status: 'approved',
    submittedAt: '2 พ.ย. 2569 16:45 น.',
    agreementAccepted: true,
    agreementYear: '2567',
    advisorName: 'นางวิภา รัตนพงศ์',
    advisorPhone: '086-789-0123',
    leader: {
      fullname: 'นายพงษ์พิพัฒน์ อริยวรกุล',
      grade: 'ม.4',
      room: '5',
      studentId: '45151',
      behaviorScore: 98,
      gpax: '3.80',
      phone: '085-777-8899',
      photo: THAI_STUDENT_MALE_PHOTO,
      agreed: true
    },
    members: [
      { fullname: 'นางสาวดาริกา พิพัฒน์พล', grade: 'ม.4', room: '6', studentId: '45172', behaviorScore: 95, gpax: '3.58', role: 'รองประธานคณะสี' }
    ]
  }
];

// Helper Functions
const WDSDB = {
  init() {
    const CURRENT_CONFIG_VERSION = '2570.2';
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ ...DEFAULT_SITE_CONFIG, configVersion: CURRENT_CONFIG_VERSION }));
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.configVersion || parsed.configVersion !== CURRENT_CONFIG_VERSION) {
          // หากเป็นเวอร์ชันเก่า ให้อัปเดตข้อมูลระเบียบการล่าสุดให้ตรงกับระบบหลักทันที
          const updated = {
            ...DEFAULT_SITE_CONFIG,
            ...parsed,
            rulesCouncilList: DEFAULT_COUNCIL_RULES,
            rulesColorList: DEFAULT_COLOR_RULES,
            configVersion: CURRENT_CONFIG_VERSION
          };
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ ...DEFAULT_SITE_CONFIG, configVersion: CURRENT_CONFIG_VERSION }));
      }
    }
    const storedCouncil = localStorage.getItem(STORAGE_KEYS.COUNCIL);
    const storedColor = localStorage.getItem(STORAGE_KEYS.COLOR);
    
    if (!storedCouncil || storedCouncil.includes('unsplash.com')) {
      localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(DEFAULT_COUNCIL_APPLICATIONS));
    }
    if (!storedColor || storedColor.includes('unsplash.com')) {
      localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(DEFAULT_COLOR_APPLICATIONS));
    }
  },

  getConfig() {
    this.init();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG));
      const merged = { ...DEFAULT_SITE_CONFIG, ...saved };
      if (!merged.timeline || !Array.isArray(merged.timeline) || merged.timeline.length === 0) {
        merged.timeline = DEFAULT_TIMELINE;
      }
      if (!merged.rulesCouncilList || !Array.isArray(merged.rulesCouncilList) || merged.rulesCouncilList.length === 0) {
        merged.rulesCouncilList = DEFAULT_COUNCIL_RULES;
      } else {
        // ทำความสะอาดตัดเลขอาราบิกนำหน้า (1. , 2. ) ออกจากทุกข้อความ
        merged.rulesCouncilList = merged.rulesCouncilList.map(s => String(s || '').replace(/^\s*\d+[\.\)]\s*/, '').trim()).filter(Boolean);
      }
      if (!merged.rulesColorList || !Array.isArray(merged.rulesColorList) || merged.rulesColorList.length === 0) {
        merged.rulesColorList = DEFAULT_COLOR_RULES;
      } else {
        // ทำความสะอาดตัดเลขอาราบิกนำหน้า (1. , 2. ) ออกจากทุกข้อความ
        merged.rulesColorList = merged.rulesColorList.map(s => String(s || '').replace(/^\s*\d+[\.\)]\s*/, '').trim()).filter(Boolean);
      }
      if (!merged.applyCouncilBullets || !Array.isArray(merged.applyCouncilBullets) || merged.applyCouncilBullets.length === 0) {
        merged.applyCouncilBullets = DEFAULT_APPLY_COUNCIL_BULLETS;
      }
      if (!merged.applyColorBullets || !Array.isArray(merged.applyColorBullets) || merged.applyColorBullets.length === 0) {
        merged.applyColorBullets = DEFAULT_APPLY_COLOR_BULLETS;
      }
      if (!merged.documentsList || !Array.isArray(merged.documentsList) || merged.documentsList.length === 0) {
        merged.documentsList = DEFAULT_DOCUMENTS_LIST;
      } else {
        merged.documentsList = merged.documentsList.map(doc => {
          if (doc.actionType === 'regulation' && (!doc.title.includes('เซ็นรับทราบ') && !doc.title.includes('แบบรับทราบ'))) {
            return {
              ...doc,
              title: 'แบบรับทราบระเบียบการเลือกตั้ง (พร้อมแบบเซ็นรับทราบ)',
              desc: 'แบบฟอร์มแสดงความยินยอมและรับทราบระเบียบ ข้อตกลง และเกณฑ์คุณสมบัติการเลือกตั้ง พร้อมลงนามรับทราบ',
              signer: 'ผู้สมัคร, ผู้ปกครอง และครูที่ปรึกษา',
              btnText: 'เปิดพิมพ์ A4'
            };
          }
          return doc;
        });
        const hasManual = merged.documentsList.some(d => d.actionType === 'manual' || (d.title && d.title.includes('คู่มือ')));
        if (!hasManual) {
          merged.documentsList.push({
            id: 6,
            title: 'คู่มือการใช้งานระบบรับสมัครเลือกตั้งออนไลน์ (System User Manual)',
            desc: 'คู่มือขั้นตอนการยื่นใบสมัครออนไลน์ การพิมพ์ฟอร์ม A4 บทบาทครูที่ปรึกษา และระบบหลังบ้าน',
            signer: 'คณะกรรมการจัดการเลือกตั้ง',
            btnText: 'เปิดอ่านคู่มือ',
            actionType: 'manual'
          });
        }
      }
      if (!merged.lineGroupUrl) {
        merged.lineGroupUrl = 'https://line.me/ti/g/KhLtg2M7vA';
      }
      if (!merged.lineGroupQr) {
        merged.lineGroupQr = 'assets/images/line-group-qr.jpg';
      }
      if (!merged.schoolLogo || typeof merged.schoolLogo !== 'string' || merged.schoolLogo.includes('iVBORw0KGgoAAAANSUhEUgAAACgAAAAyCAYAAAAus5mQ') || (merged.schoolLogo.startsWith('data:image/png;base64,iVBORw') && merged.schoolLogo.length < 5000)) {
        merged.schoolLogo = DEFAULT_SCHOOL_LOGO;
      }
      if (!merged.councilSignatures || !Array.isArray(merged.councilSignatures) || merged.councilSignatures.length === 0) {
        merged.councilSignatures = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG.councilSignatures));
      }
      if (!merged.colorSignatures || !Array.isArray(merged.colorSignatures) || merged.colorSignatures.length === 0) {
        merged.colorSignatures = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG.colorSignatures));
      }
      if (!merged.contactPerson) {
        merged.contactPerson = 'คุณครูสีวลี ยืนยาว';
      }
      if (!merged.schoolPhone || merged.schoolPhone === '0990499557') {
        merged.schoolPhone = '0990499597';
      }
      return merged;
    } catch (e) {
      return { ...DEFAULT_SITE_CONFIG };
    }
  },

  saveConfig(newConfig) {
    this.init();
    const current = this.getConfig();
    const merged = { ...current, ...newConfig };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
    return merged;
  },

  resetConfig() {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
    return { ...DEFAULT_SITE_CONFIG };
  },

  getCouncilList() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNCIL)) || [];
    } catch (e) {
      return [];
    }
  },

  getColorList() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLOR)) || [];
    } catch (e) {
      return [];
    }
  },

  saveCouncilApplication(data) {
    this.init();
    const cfg = this.getConfig();
    const list = this.getCouncilList();
    const id = `COUNCIL-${cfg.academicYear}-` + String(list.length + 1).padStart(3, '0');
    const newEntry = {
      ...data,
      id,
      status: 'pending',
      candidateNumber: '',
      submittedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.',
      agreementYear: cfg.councilAgreementYear || '2568'
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(list));
    return newEntry;
  },

  saveColorApplication(data) {
    this.init();
    const cfg = this.getConfig();
    const list = this.getColorList();
    const id = `COLOR-${cfg.academicYear}-` + String(list.length + 1).padStart(3, '0');
    const colorObj = COLOR_HOUSES.find(c => c.id === data.colorId) || {};
    const newEntry = {
      ...data,
      id,
      colorName: colorObj.name || data.colorId,
      status: 'pending',
      candidateNumber: '',
      submittedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.',
      agreementYear: cfg.colorAgreementYear || '2567'
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(list));
    return newEntry;
  },

  getById(type, id) {
    this.init();
    const list = type === 'council' ? this.getCouncilList() : this.getColorList();
    return list.find(item => item.id === id);
  },

  searchStudent(query) {
    this.init();
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    
    const results = [];
    const councils = this.getCouncilList();
    councils.forEach(item => {
      let matched = false;
      let matchedRole = '';
      let student = null;
      
      Object.keys(item.members || {}).forEach(posKey => {
        const mem = item.members[posKey];
        if (mem && (mem.studentId.includes(q) || mem.fullname.toLowerCase().includes(q))) {
          matched = true;
          student = mem;
          const posObj = COUNCIL_POSITIONS.find(p => p.key === posKey);
          matchedRole = posObj ? posObj.title : posKey;
        }
      });

      if (matched || item.partyName.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) {
        results.push({
          type: 'council',
          typeLabel: 'ประธานสภานักเรียน',
          id: item.id,
          partyName: item.partyName,
          status: item.status,
          candidateNumber: item.candidateNumber,
          submittedAt: item.submittedAt,
          matchedRole: matchedRole || 'สมาชิกพรรค',
          student: student || item.members.president
        });
      }
    });

    const colors = this.getColorList();
    colors.forEach(item => {
      let matched = false;
      let matchedRole = '';
      let student = null;

      if (item.leader && (item.leader.studentId.includes(q) || item.leader.fullname.toLowerCase().includes(q))) {
        matched = true;
        student = item.leader;
        matchedRole = 'ผู้ลงสมัครประธานคณะสี';
      }

      (item.members || []).forEach(mem => {
        if (mem.studentId.includes(q) || mem.fullname.toLowerCase().includes(q)) {
          matched = true;
          student = mem;
          matchedRole = mem.role || 'คณะทำงาน';
        }
      });

      if (matched || item.colorName.includes(q) || item.partyName.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) {
        results.push({
          type: 'color',
          typeLabel: `ประธาน${item.colorName}`,
          id: item.id,
          colorName: item.colorName,
          partyName: item.partyName,
          status: item.status,
          candidateNumber: item.candidateNumber,
          submittedAt: item.submittedAt,
          matchedRole: matchedRole || 'คณะทำงาน',
          student: student || item.leader
        });
      }
    });

    return results;
  },

  updateStatus(type, id, newStatus, candidateNumber, notes) {
    this.init();
    const key = type === 'council' ? STORAGE_KEYS.COUNCIL : STORAGE_KEYS.COLOR;
    const list = type === 'council' ? this.getCouncilList() : this.getColorList();
    const idx = list.findIndex(x => x.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      if (candidateNumber !== undefined) list[idx].candidateNumber = candidateNumber;
      if (notes !== undefined) list[idx].notes = notes;
      list[idx].reviewedAt = new Date().toLocaleDateString('th-TH');
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteApplication(type, id) {
    this.init();
    const key = type === 'council' ? STORAGE_KEYS.COUNCIL : STORAGE_KEYS.COLOR;
    let list = type === 'council' ? this.getCouncilList() : this.getColorList();
    list = list.filter(x => x.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(DEFAULT_COUNCIL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(DEFAULT_COLOR_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
  }
};

WDSDB.init();
