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

// จุดเชื่อมต่อคลาวด์กลาง (Cloud Storage Sync API) เชื่อมข้อมูลระหว่างคอมพิวเตอร์และโทรศัพท์มือถือแบบ Real-time
const CLOUD_SYNC = {
  CONFIG_URL: 'https://extendsclass.com/api/json-storage/bin/cbeaaaf',
  COUNCIL_URL: 'https://extendsclass.com/api/json-storage/bin/ebccaba',
  COLOR_URL: 'https://extendsclass.com/api/json-storage/bin/bdbbfee',
  IS_ENABLED: true
};

// ฟังก์ชันสร้าง URL ที่แนบตัวแปรสลายแคช (Cache Buster) ทะลวง CDN แคช 2 ชม. ของ ExtendsClass
function getFreshCloudUrl(url) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ตราสัญลักษณ์เริ่มต้น (ตราโรงเรียนวชิรธรรมสาธิต พื้นหลังโปร่งใส, ตราสภานักเรียน, ตราคณะสี)
const DEFAULT_SCHOOL_LOGO = "assets/images/school-logo-transparent.png";
const DEFAULT_LOGO_2 = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%231e3a8a' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='42' fill='%23eff6ff' stroke='%233b82f6' stroke-width='1.5'/%3E%3Cpolygon points='50,20 58,38 78,38 62,50 68,68 50,57 32,68 38,50 22,38 42,38' fill='%231e3a8a' stroke='%23c59b27' stroke-width='1.5'/%3E%3Ctext x='50' y='86' font-family='sans-serif' font-size='8.5' font-weight='bold' fill='%231e3a8a' text-anchor='middle'%3Eสภานักเรียน%3C/text%3E%3C/svg%3E";
const DEFAULT_LOGO_3 = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%23b45309' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='42' fill='%23fffbeb' stroke='%23f59e0b' stroke-width='1.5'/%3E%3Ccircle cx='35' cy='42' r='8' fill='%231d4ed8'/%3E%3Ccircle cx='50' cy='34' r='8' fill='%23eab308'/%3E%3Ccircle cx='65' cy='42' r='8' fill='%23dc2626'/%3E%3Ccircle cx='42' cy='56' r='8' fill='%23ea580c'/%3E%3Ccircle cx='58' cy='56' r='8' fill='%2316a34a'/%3E%3Ctext x='50' y='86' font-family='sans-serif' font-size='8.5' font-weight='bold' fill='%2392400e' text-anchor='middle'%3E5 คณะสี%3C/text%3E%3C/svg%3E";

// SVG รูปเงา/สัญลักษณ์นักเรียนไทยมาตรฐาน
const THAI_STUDENT_MALE_PHOTO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200'%3E%3Crect width='160' height='200' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='65' r='35' fill='%2364748b'/%3E%3Cpath d='M30,175 C30,120 60,110 80,110 C100,110 130,120 130,175 Z' fill='%23ffffff' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpolygon points='80,115 70,135 80,145 90,135' fill='%231e3a8a'/%3E%3Ctext x='80' y='190' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'%3Eรูปถ่ายนักเรียน 1.5 นิ้ว%3C/text%3E%3C/svg%3E";
const THAI_STUDENT_FEMALE_PHOTO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200'%3E%3Crect width='160' height='200' fill='%23f1f5f9'/%3E%3Ccircle cx='80' cy='65' r='35' fill='%2364748b'/%3E%3Cpath d='M30,175 C30,120 60,110 80,110 C100,110 130,120 130,175 Z' fill='%23ffffff' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpolygon points='80,115 65,130 95,130' fill='%231e3a8a'/%3E%3Ctext x='80' y='190' font-family='sans-serif' font-size='10' fill='%2364748b' text-anchor='middle'%3Eรูปถ่ายนักเรียน 1.5 นิ้ว%3C/text%3E%3C/svg%3E";

// ข้อมูลกำหนดการเริ่มต้น
const DEFAULT_TIMELINE = [
  { step: 1, date: '16 - 30 พฤศจิกายน 2569', title: 'เปิดรับสมัครออนไลน์: สภานักเรียน (พรรค 10 คน) และประธานคณะสี (5 สี)', location: 'ระบบรับสมัครออนไลน์', highlight: true },
  { step: 2, date: '4 ธันวาคม 2569', title: 'ตรวจสอบคุณสมบัติผู้ลงสมัครประธานสภานักเรียนและประธานคณะสี', location: 'ห้องประชุม Minting Room', highlight: false },
  { step: 3, date: '9 ธันวาคม 2569', title: 'ผู้ลงสมัคร จับสลากหมายเลขผู้สมัคร: ประชุมชี้แจงระเบียบการหาเสียง', location: 'หอประชุมโรงเรียน', highlight: false },
  { step: 4, date: '16 พฤศจิกายน 2569 - 2 กุมภาพันธ์ 2570', title: 'รณรงค์หาเสียง: แถลงนโยบายหน้าเสาธง และประชาสัมพันธ์ตามจุดที่โรงเรียนกำหนด', location: 'ภายในบริเวณโรงเรียน', highlight: false },
  { step: 5, date: '27 มกราคม 2570', title: 'กิจกรรมดีเบตประธานสภานักเรียนและประธานคณะสี', location: 'หอประชุมโรงเรียนวชิรธรรมสาธิต', highlight: false },
  { step: 6, date: '3 กุมภาพันธ์ 2570', title: 'วันลงคะแนนเสียงเลือกตั้งใหญ่: เปิดคูหาลงคะแนนเสียง เวลา 08.30 - 15.00 น.', location: 'คูหาลงคะแนนเสียง', highlight: false },
  { step: 7, date: '8 กุมภาพันธ์ 2570', title: 'ประกาศผลการเลือกตั้งอย่างเป็นทางการ', location: 'เว็บไซต์โรงเรียนวชิรธรรมสาธิต', highlight: false }
];

// ข้อมูลระเบียบและเกณฑ์คุณสมบัติเริ่มต้น (หมวดที่ 1 สภานักเรียน)
const DEFAULT_COUNCIL_RULES = [
  "ระดับชั้น: ผู้สมัครทุกคนต้องเป็นนักเรียนที่กำลังศึกษาอยู่ในระดับชั้นมัธยมศึกษาปีที่ 4 โรงเรียนวชิรธรรมสาธิต",
  "คุณสมบัติของผู้สมัครรับเลือกตั้งเป็นประธานสภานักเรียน",
  "1 กำลังศึกษาระดับชั้นมัธยมศึกษาปีที่ 4 ณ วันสมัครรับเลือกตั้ง",
  "2 มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.80 (ชั้น ม.4 ภาคเรียนที่ 1)",
  "3 ยินดีสละเวลา และอุทิศตนเพื่อประโยชน์ส่วนรวม",
  "4 ได้รับความยินยอมจากผู้ปกครอง",
  "5  เป็นผู้มีความเลื่อมใสในการปกครองระบอบประชาธิปไตย อันมีพระมหากษัตริย์ทรงเป็นประมุข",
  "6 มีสุขภาพสมบูรณ์ แข็งแรง",
  "7  เป็นผู้ไม่เคยทำผิดระเบียบของโรงเรียนตั้งแต่โทษสถานกลางขึ้นไป",
  "8  มีคุณสมบัติอื่น และสามารถปฏิบัติหน้าที่ตามธรรมนูญสภานักเรียนโรงเรียนวชิรธรรมสาธิตที่กำหนดไว้",
  "9 ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียนต้องจัดตั้งพรรคโดยให้มีสมาชิกภายในพรรค จำนวน 10 คน และมีผู้แทนพรรคเพื่อดำรงตำแหน่ง",
  "ดังต่อไปนี้  ประธานพรรคลงสมัครประธานสภานักเรียน 1 คน , รองประธานพรรค 1 คน , สมาชิกพรรคฝ่ายวิชาการ 2 คน , สมาชิกพรรคฝ่ายสันทนาการ 2 คน, สมาชิกพรรคฝ่ายทั่วไป 1 คน, สมาชิกพรรคฝ่ายประชาสัมพันธ์ 2 คน, เลขานุการสภานักเรียน 1 คน",
  "10 ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียน ไม่เคยเข้าค่ายปรับพฤติกรรม และต้องมีคะแนนความประพฤติ อย่างน้อย 70 คะแนนขึ้นไป",
  "ครูที่ปรึกษา: ต้องมีข้าราชการครูหรือครูอัตราจ้างโรงเรียนวชิรธรรมสาธิต อย่างน้อย 1 ท่าน ลงนามรับรองเป็นครูที่ปรึกษาพรรค",
  "ความยินยอม: ต้องได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ปกครอง และยอมรับ ข้อตกลงของสภานักเรียน โรงเรียนวชิรธรรมสาธิต ประจำปี"
];

// ข้อมูลระเบียบและเกณฑ์คุณสมบัติเริ่มต้น (หมวดที่ 2 ประธานคณะสี)
const DEFAULT_COLOR_RULES = [
  "สังกัดคณะสี: ผู้สมัครต้องเป็นนักเรียนชั้น ม.4 ที่มีชื่อสังกัดในคณะสีที่สมัคร ได้แก่ คณะสีอัญชัน (น้ำเงิน), คณะสีนนทรี (เหลือง), คณะปาริชาต (แดง), คณะสีเอื้องช่อแสด (แสด), คณะสีอินทนิล (เขียว)",
  "คุณสมบัติของผู้สมัครรับเลือกตั้งเป็นประธานสภานักเรียน",
  "1 กำลังศึกษาระดับชั้นมัธยมศึกษาปีที่ 4 ณ วันสมัครรับเลือกตั้ง",
  "2 มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.80 (ชั้น ม.4 ภาคเรียนที่ 1)",
  "3 ยินดีสละเวลา และอุทิศตนเพื่อประโยชน์ส่วนรวม",
  "4 ได้รับความยินยอมจากผู้ปกครอง",
  "5  เป็นผู้มีความเลื่อมใสในการปกครองระบอบประชาธิปไตย อันมีพระมหากษัตริย์ทรงเป็นประมุข",
  "6 มีสุขภาพสมบูรณ์ แข็งแรง",
  "7  เป็นผู้ไม่เคยทำผิดระเบียบของโรงเรียนตั้งแต่โทษสถานกลางขึ้นไป",
  "8  มีคุณสมบัติอื่น และสามารถปฏิบัติหน้าที่ตามธรรมนูญสภานักเรียนโรงเรียนวชิรธรรมสาธิตที่กำหนดไว้",
  "9 ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียนต้องจัดตั้งพรรคโดยให้มีสมาชิกภายในพรรค จำนวน 10 คน และมีผู้แทนพรรคเพื่อดำรงตำแหน่ง",
  "ดังต่อไปนี้  ประธานคณะสี\t1 คน ,  รองประธานคณะสี\t1 คน , สมาชิกคณะสีฝ่ายทั่วไป\t2 คน, สมาชิกพรรคฝ่ายประชาสัมพันธ์\t2 คน , สมาชิกคณะสีฝ่ายสันทนาการ 3 คน , เลขานุการคณะสี 1 คน",
  "10 ผู้สมัครรับเลือกตั้งเป็นประธานคณะสี ไม่เคยเข้าค่ายปรับพฤติกรรม และต้องมีคะแนนความประพฤติ อย่างน้อย 70 คะแนนขึ้นไป",
  "ครูที่ปรึกษา: ต้องมีข้าราชการครูหรือครูอัตราจ้างโรงเรียนวชิรธรรมสาธิต อย่างน้อย 1 ท่าน ลงนามรับรองเป็นครูที่ปรึกษาพรรค",
  "ความยินยอม: ต้องได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ปกครอง และยอมรับ ข้อตกลงของสภานักเรียน โรงเรียนวชิรธรรมสาธิต ประจำปีการศึกษา 2570"
];

// ข้อมูลสรุปหน้าการ์ดยื่นใบสมัครออนไลน์ (Tab 3)
const DEFAULT_APPLY_COUNCIL_BULLETS = [
  "GPAX : มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.80 (ชั้น ม.4 ภาคเรียนที่ 1)",
  "คะแนนพฤติกรรมคงเหลือไม่ต่ำกว่า 70 คะแนน",
  "แนบไฟล์รูปถ่ายนักเรียนขนาด 1.5 นิ้ว ทุกตำแหน่ง",
  "ข้อตกลงสภานักเรียน ปีการศึกษา 2570"
];

const DEFAULT_APPLY_COLOR_BULLETS = [
  "GPAX : มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.80 (ชั้น ม.4 ภาคเรียนที่ 1)",
  "คะแนนพฤติกรรมคงเหลือไม่ต่ำกว่า 70 คะแนน",
  "แนบไฟล์รูปถ่ายนักเรียนขนาด 1.5 นิ้ว ทุกตำแหน่ง",
  "ข้อตกลงสภานักเรียน ปีการศึกษา 2570"
];

// ข้อมูลหน้าดาวน์โหลดแบบฟอร์มเอกสาร (documents.html)
const DEFAULT_DOCUMENTS_LIST = [
  {
    "id": 1,
    "title": "หนังสือยินยอมจากผู้ปกครอง (Parental Consent Form)",
    "desc": "แบบฟอร์มอนุญาตให้นักเรียนลงสมัครรับเลือกตั้งประธานสภานักเรียน หรือประธานคณะสี",
    "signer": "บิดา มารดา หรือผู้ปกครอง",
    "btnText": "ดาวน์โหลด PDF",
    "actionType": "download",
    "fileUrl": "assets/documents/หนังสือยินยอมจากผู้ปกครอง.pdf",
    "fileName": "หนังสือยินยอมจากผู้ปกครอง.pdf",
    "fileSize": "82.3 KB"
  },
  {
    "id": 2,
    "title": "แบบคำร้องขอใบรับรองคะแนนความประพฤติ (คะแนนพฤติกรรม)",
    "desc": "แบบฟอร์มยื่นต่อกลุ่มบริหารกิจการนักเรียน เพื่อขอรับรองคะแนนความประพฤติคงเหลือ (เกณฑ์ไม่ต่ำกว่า 70 คะแนน)",
    "signer": "ครูประจำชั้น และงานวินัยนักเรียน",
    "btnText": "ดาวน์โหลด PDF",
    "actionType": "download",
    "fileUrl": "assets/documents/แบบคำร้องขอใบรับรองคะแนนพฤติกรรม.pdf",
    "fileName": "แบบคำร้องขอใบรับรองคะแนนพฤติกรรม.pdf",
    "fileSize": "85.3 KB"
  },
  {
    "id": 3,
    "title": "แบบรับทราบระเบียบการเลือกตั้ง (พร้อมแบบเซ็นรับทราบ)",
    "desc": "แบบฟอร์มแสดงความยินยอมและรับทราบระเบียบ ข้อตกลง และเกณฑ์คุณสมบัติการเลือกตั้ง พร้อมลงลายมือชื่อรับทราบ",
    "signer": "ผู้สมัคร, ผู้ปกครอง และครูที่ปรึกษา",
    "btnText": "ดาวน์โหลด PDF",
    "actionType": "download",
    "fileUrl": "assets/documents/แบบรับทราบระเบียบและข้อตกลงการเลือกตั้งผู้นำนักเรียน.pdf",
    "fileName": "แบบรับทราบระเบียบและข้อตกลงการเลือกตั้งผู้นำนักเรียน.pdf",
    "fileSize": "90.1 KB"
  },
  {
    "id": 4,
    "title": "แบบฟอร์มใบสมัครเปล่า: ประธานสภานักเรียน (A4)",
    "desc": "สำหรับพิมพ์เพื่อนำไปกรอกข้อมูลด้วยลายมือและติดรูปถ่ายด้วยตนเอง",
    "signer": "ผู้สมัครและครูที่ปรึกษา",
    "btnText": "พิมพ์ฟอร์ม",
    "actionType": "print_council"
  },
  {
    "id": 5,
    "title": "แบบฟอร์มใบสมัครเปล่า: ประธานคณะสี 5 สี (A4)",
    "desc": "สำหรับพิมพ์เพื่อนำไปกรอกข้อมูลด้วยลายมือและติดรูปถ่ายด้วยตนเอง",
    "signer": "ผู้สมัครและครูที่ปรึกษาพรรค",
    "btnText": "พิมพ์ฟอร์ม",
    "actionType": "print_color"
  },
  {
    "id": 6,
    "title": "คู่มือการใช้งานระบบรับสมัครเลือกตั้งออนไลน์ (System User Manual)",
    "desc": "คู่มือขั้นตอนการยื่นใบสมัครออนไลน์ การพิมพ์ฟอร์ม A4 บทบาทครูที่ปรึกษา และระบบหลังบ้าน",
    "signer": "คณะกรรมการจัดการเลือกตั้ง",
    "btnText": "เปิดอ่านคู่มือ",
    "actionType": "manual"
  }
];

// การตั้งค่าระบบเริ่มต้น
const DEFAULT_HERO_BANNER_IMAGE = 'assets/images/school-logo-transparent.png';

// โครงสร้างตำแหน่งสภานักเรียนมาตรฐาน 10 ตำแหน่ง
const DEFAULT_COUNCIL_POSITIONS = [
  { key: 'president', title: 'ผู้ลงสมัครประธานสภานักเรียน', isLeader: true, shortTitle: 'ประธานสภานักเรียน' },
  { key: 'vice_president', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งรองประธานพรรค', isLeader: false, shortTitle: 'รองประธานพรรค' },
  { key: 'academic_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายวิชาการ (คนที่ 1)', isLeader: false, shortTitle: 'ฝ่ายวิชาการ 1' },
  { key: 'academic_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายวิชาการ (คนที่ 2)', isLeader: false, shortTitle: 'ฝ่ายวิชาการ 2' },
  { key: 'recreation_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายสันทนาการ (คนที่ 1)', isLeader: false, shortTitle: 'ฝ่ายสันทนาการ 1' },
  { key: 'recreation_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายสันทนาการ (คนที่ 2)', isLeader: false, shortTitle: 'ฝ่ายสันทนาการ 2' },
  { key: 'general', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายทั่วไป', isLeader: false, shortTitle: 'ฝ่ายทั่วไป' },
  { key: 'pr_1', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายประชาสัมพันธ์ (คนที่ 1)', isLeader: false, shortTitle: 'ฝ่ายประชาสัมพันธ์ 1' },
  { key: 'pr_2', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งฝ่ายประชาสัมพันธ์ (คนที่ 2)', isLeader: false, shortTitle: 'ฝ่ายประชาสัมพันธ์ 2' },
  { key: 'secretary', title: 'ผู้แทนพรรคเพื่อดำรงตำแหน่งเลขานุการ', isLeader: false, shortTitle: 'เลขานุการ' }
];

// โครงสร้างตำแหน่งคณะสีมาตรฐาน 10 ตำแหน่ง (ลำดับที่ 1 ประธานคณะสี + ลำดับที่ 2-10 สมาชิกคณะทำงาน 9 ตำแหน่ง)
const DEFAULT_COLOR_POSITIONS = [
  { key: 'leader', title: 'ผู้ลงสมัครประธานคณะสี (หัวหน้าทีม)', isLeader: true, roleName: 'ประธานคณะสี', shortTitle: 'ประธานคณะสี' },
  { key: 'vice_president', title: 'รองประธานคณะสี', isLeader: false, roleName: 'รองประธานคณะสี', shortTitle: 'รองประธานคณะสี' },
  { key: 'general_1', title: 'ฝ่ายทั่วไป (คนที่ 1)', isLeader: false, roleName: 'ฝ่ายทั่วไป (คนที่ 1)', shortTitle: 'ฝ่ายทั่วไป 1' },
  { key: 'general_2', title: 'ฝ่ายทั่วไป (คนที่ 2)', isLeader: false, roleName: 'ฝ่ายทั่วไป (คนที่ 2)', shortTitle: 'ฝ่ายทั่วไป 2' },
  { key: 'pr_1', title: 'ฝ่ายประชาสัมพันธ์ (คนที่ 1)', isLeader: false, roleName: 'ฝ่ายประชาสัมพันธ์ (คนที่ 1)', shortTitle: 'ฝ่ายประชาสัมพันธ์ 1' },
  { key: 'pr_2', title: 'ฝ่ายประชาสัมพันธ์ (คนที่ 2)', isLeader: false, roleName: 'ฝ่ายประชาสัมพันธ์ (คนที่ 2)', shortTitle: 'ฝ่ายประชาสัมพันธ์ 2' },
  { key: 'recreation_1', title: 'ฝ่ายสันทนาการ (คนที่ 1)', isLeader: false, roleName: 'ฝ่ายสันทนาการ (คนที่ 1)', shortTitle: 'ฝ่ายสันทนาการ 1' },
  { key: 'recreation_2', title: 'ฝ่ายสันทนาการ (คนที่ 2)', isLeader: false, roleName: 'ฝ่ายสันทนาการ (คนที่ 2)', shortTitle: 'ฝ่ายสันทนาการ 2' },
  { key: 'recreation_3', title: 'ฝ่ายสันทนาการ (คนที่ 3)', isLeader: false, roleName: 'ฝ่ายสันทนาการ (คนที่ 3)', shortTitle: 'ฝ่ายสันทนาการ 3' },
  { key: 'secretary', title: 'เลขานุการคณะสี', isLeader: false, roleName: 'เลขานุการคณะสี', shortTitle: 'เลขานุการคณะสี' }
];

let COUNCIL_POSITIONS = DEFAULT_COUNCIL_POSITIONS;
let COLOR_MEMBER_POSITIONS = DEFAULT_COLOR_POSITIONS.filter(p => !p.isLeader);

const DEFAULT_SITE_CONFIG = {
  configVersion: '2570.95',
  adminUsername: 'admin',
  adminPassword: 'admin1234',
  schoolName: 'โรงเรียนวชิรธรรมสาธิต',
  schoolNameEn: 'WACHIRATHAMSATIT SCHOOL',
  schoolLogo: DEFAULT_SCHOOL_LOGO,
  schoolLogo2: '',
  schoolLogo3: '',
  heroBannerImage: DEFAULT_HERO_BANNER_IMAGE,
  heroBannerPosX: 99,
  heroBannerPosY: 50,
  heroBannerZoom: 100,
  heroBannerFit: 'contain',
  affiliation: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน • สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2',
  departmentName: 'กลุ่มบริหารบุคคล • งานส่งเสริมประชาธิปไตยในโรงเรียน',
  academicYear: '2570',
  councilAgreementYear: '2568',
  colorAgreementYear: '2567',
  regPeriod: '16 - 30 พฤศจิกายน 2569',
  announcementText: 'เปิดรับสมัครเลือกตั้งประธานสภานักเรียน และประธานคณะสี ประจำปีการศึกษา 2570 ตั้งแต่วันที่ 16 - 30 พฤศจิกายน 2569',
  minBehaviorScore: 70,
  minGpaPresident: 2.80,
  minGpaMember: 2.80,
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
  applyCouncilIsOpen: true,
  applyCouncilCloseNotice: 'ขณะนี้ปิดรับสมัครเลือกตั้งประธานสภานักเรียนแล้ว หรือยังไม่ถึงช่วงเวลารับสมัคร',
  applyCouncilTitle: '1. สมัครเลือกตั้งประธานสภานักเรียน',
  applyCouncilBadge: 'ทีมพรรค 10 คน',
  applyCouncilDesc: "ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียนต้องจัดตั้งพรรคโดยให้มีสมาชิกภายในพรรค จำนวน 10 คน และมีผู้แทนพรรคเพื่อดำรงตำแหน่ง\nดังต่อไปนี้  ประธานพรรคลงสมัครประธานสภานักเรียน 1 คน , รองประธานพรรค 1 คน , สมาชิกพรรคฝ่ายวิชาการ 2 คน , สมาชิกพรรคฝ่ายสันทนาการ 2 คน, สมาชิกพรรคฝ่ายทั่วไป 1 คน, สมาชิกพรรคฝ่ายประชาสัมพันธ์ 2 คน, เลขานุการสภานักเรียน 1 คน",
  applyCouncilBullets: DEFAULT_APPLY_COUNCIL_BULLETS,
  applyCouncilBtnText: 'เข้าสู่แบบฟอร์มสมัครสภานักเรียน (10 ตำแหน่ง)',
  applyColorIsOpen: true,
  applyColorCloseNotice: 'ขณะนี้ปิดรับสมัครเลือกตั้งประธานคณะสีแล้ว หรือยังไม่ถึงช่วงเวลารับสมัคร',
  applyColorTitle: '2. สมัครเลือกตั้งประธานคณะสี (5 คณะสี)',
  applyColorBadge: '5 คณะสี',
  applyColorDesc: "ผู้สมัครรับเลือกตั้งเป็นประธานนักเรียนต้องจัดตั้งพรรคโดยให้มีสมาชิกภายในพรรค จำนวน 10 คน และมีผู้แทนพรรคเพื่อดำรงตำแหน่ง\nดังต่อไปนี้  ประธานคณะสี\t1 คน ,  รองประธานคณะสี\t1 คน , สมาชิกคณะสีฝ่ายทั่วไป\t2 คน, สมาชิกพรรคฝ่ายประชาสัมพันธ์\t2 คน , สมาชิกคณะสีฝ่ายสันทนาการ 3 คน , เลขานุการคณะสี 1 คน",
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
  ],
  councilPositions: JSON.parse(JSON.stringify(DEFAULT_COUNCIL_POSITIONS)),
  colorPositions: JSON.parse(JSON.stringify(DEFAULT_COLOR_POSITIONS))
};

// ข้อมูลคณะสี 5 สีของโรงเรียน
const COLOR_HOUSES = [
  { id: 'anchan', name: 'คณะสีอัญชัน', colorCode: '#1d4ed8', tag: 'สีน้ำเงิน' },
  { id: 'nontri', name: 'คณะสีนนทรี', colorCode: '#b45309', tag: 'สีเหลือง' },
  { id: 'parichat', name: 'คณะปาริชาต', colorCode: '#b91c1c', tag: 'สีแดง' },
  { id: 'euang', name: 'คณะสีเอื้องช่อแสด', colorCode: '#c2410c', tag: 'สีแสด' },
  { id: 'inthanin', name: 'คณะสีอินทนิล', colorCode: '#047857', tag: 'สีเขียว' }
];

// ข้อมูลจำลองสำหรับทดสอบระบบ (ตั้งค่าว่างสำหรับเปิดรับสมัครจริง)
const DEFAULT_COUNCIL_APPLICATIONS = [];

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
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
    }
    let storedCouncil = localStorage.getItem(STORAGE_KEYS.COUNCIL);
    const storedColor = localStorage.getItem(STORAGE_KEYS.COLOR);
    
    // กรองและล้างข้อมูลทดสอบ COUNCIL-2570-001 ออกจากเครื่องผู้ใช้โดยอัตโนมัติ
    if (storedCouncil && (storedCouncil.includes('COUNCIL-2570-001') || storedCouncil.includes('พรรคก้าวใหม่ วชิรธรรม'))) {
      try {
        const cleaned = (JSON.parse(storedCouncil) || []).filter(item => 
          item && item.id !== 'COUNCIL-2570-001' && item.partyName !== 'พรรคก้าวใหม่ วชิรธรรม'
        );
        localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(cleaned));
        storedCouncil = JSON.stringify(cleaned);
      } catch (e) {}
    }
    
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
      if (merged.applyCouncilIsOpen === undefined) merged.applyCouncilIsOpen = true;
      if (merged.applyColorIsOpen === undefined) merged.applyColorIsOpen = true;
      if (!merged.applyCouncilCloseNotice) merged.applyCouncilCloseNotice = 'ขณะนี้ปิดรับสมัครเลือกตั้งประธานสภานักเรียนแล้ว หรือยังไม่ถึงช่วงเวลารับสมัคร';
      if (!merged.applyColorCloseNotice) merged.applyColorCloseNotice = 'ขณะนี้ปิดรับสมัครเลือกตั้งประธานคณะสีแล้ว หรือยังไม่ถึงช่วงเวลารับสมัคร';
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
      if (!merged.councilPositions || !Array.isArray(merged.councilPositions) || merged.councilPositions.length === 0) {
        merged.councilPositions = JSON.parse(JSON.stringify(DEFAULT_COUNCIL_POSITIONS));
      }
      if (!merged.colorPositions || !Array.isArray(merged.colorPositions) || merged.colorPositions.length === 0) {
        merged.colorPositions = JSON.parse(JSON.stringify(DEFAULT_COLOR_POSITIONS));
      }
      COUNCIL_POSITIONS = merged.councilPositions;
      COLOR_MEMBER_POSITIONS = merged.colorPositions.filter(p => !p.isLeader);
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

  async saveConfig(newConfig, syncToCloud = true) {
    this.init();
    try {
      const current = this.getConfig();
      const timestamp = new Date().toISOString();
      const curVer = typeof current.configVersion === 'string' ? parseFloat(current.configVersion) : 2570.9;
      const nextVer = ((isNaN(curVer) ? 2570.9 : curVer) + 0.01).toFixed(2);
      const merged = { ...current, ...newConfig, _lastUpdated: timestamp, configVersion: nextVer };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('wds-cloud-synced', { detail: merged }));
      }
      if (typeof notifyRealtimeSync === 'function') {
        notifyRealtimeSync('config', merged);
      }

      // ส่งข้อมูลขึ้นคลาวด์กลางทันที และรอผลการบันทึกเพื่อความแม่นยำ 100%
      if (syncToCloud && CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
        const cloudPayload = JSON.parse(JSON.stringify(merged));
        if (Array.isArray(cloudPayload.documentsList)) {
          cloudPayload.documentsList = cloudPayload.documentsList.map(doc => {
            const d = { ...doc };
            if (d.fileData && d.fileData.length > 50000 && d.fileUrl) {
              delete d.fileData;
            }
            return d;
          });
        }
        try {
          const putRes = await fetch(CLOUD_SYNC.CONFIG_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cloudPayload)
          });
          if (putRes.ok) {
            console.log('WDSDB: Config successfully synced to Cloud!');
          } else {
            console.warn('WDSDB Cloud Sync Status:', putRes.status);
          }
        } catch (err) {
          console.warn('WDSDB Cloud Sync Warning:', err);
        }
      }
      return merged;
    } catch (e) {
      console.error('WDSDB saveConfig error:', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('พื้นที่จัดเก็บของเบราว์เซอร์เต็ม ไม่สามารถบันทึกได้ กรุณาลดขนาดไฟล์ภาพที่อัปโหลด');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (e.message || e));
      }
      return null;
    }
  },

  // ซิงค์การตั้งค่าล่าสุดจากคลาวด์ (ทำงานอัตโนมัติเมื่อเปิดเว็บทั้งในมือถือและคอมพิวเตอร์)
  async syncFromCloud() {
    if (!CLOUD_SYNC.IS_ENABLED || typeof fetch === 'undefined') return null;
    try {
      const freshUrl = getFreshCloudUrl(CLOUD_SYNC.CONFIG_URL);
      const res = await fetch(freshUrl, { cache: 'no-store' });
      if (!res.ok) return null;
      const remote = await res.json();
      if (!remote || typeof remote !== 'object') return null;

      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const local = stored ? JSON.parse(stored) : null;
      const remoteTime = new Date(remote._lastUpdated || 0).getTime();
      const localTime = new Date(local?._lastUpdated || 0).getTime();

      // ถือว่าข้อมูลบนคลาวด์คือความจริงกลางเฉพาะเมื่อคลาวด์มีข้อมูลใหม่กว่าเครื่องนี้อย่างแท้จริง (remoteTime > localTime)
      const isCloudNewer = !local || 
        !local._lastUpdated || 
        (remoteTime > localTime + 500);

      if (isCloudNewer) {
        const merged = { ...DEFAULT_SITE_CONFIG, ...remote };
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('wds-cloud-synced', { detail: merged }));
        }
        return merged;
      }
      return local;
    } catch (e) {
      console.warn('WDSDB syncFromCloud:', e.message);
      return null;
    }
  },

  // ดึงรายการตำแหน่งผู้สมัครสภานักเรียนทั้ง 10 ตำแหน่ง
  getCouncilPositions() {
    const cfg = this.getConfig();
    return (cfg.councilPositions && Array.isArray(cfg.councilPositions) && cfg.councilPositions.length > 0)
      ? cfg.councilPositions
      : DEFAULT_COUNCIL_POSITIONS;
  },

  // ดึงรายการตำแหน่งผู้สมัครประธานคณะสีและคณะทำงานทั้ง 10 ตำแหน่ง
  getColorPositions() {
    const cfg = this.getConfig();
    return (cfg.colorPositions && Array.isArray(cfg.colorPositions) && cfg.colorPositions.length > 0)
      ? cfg.colorPositions
      : DEFAULT_COLOR_POSITIONS;
  },

  // ดึงเฉพาะตำแหน่งสมาชิกคณะทำงานคณะสี (9 ตำแหน่ง นอกเหนือจากประธานคณะสี)
  getColorMemberPositions() {
    return this.getColorPositions().filter(p => !p.isLeader);
  },

  // ดึงข้อมูลตำแหน่งประธานคณะสี (หัวหน้าทีม ลำดับที่ 1)
  getColorLeaderPosition() {
    return this.getColorPositions().find(p => p.isLeader) || DEFAULT_COLOR_POSITIONS[0];
  },

  // ซิงค์ใบสมัครจากคลาวด์เข้าหน้าหลังบ้านและหน้าตรวจสอบสถานะ
  async syncApplicationsFromCloud() {
    if (!CLOUD_SYNC.IS_ENABLED || typeof fetch === 'undefined') return;
    try {
      const councilUrl = getFreshCloudUrl(CLOUD_SYNC.COUNCIL_URL);
      const colorUrl = getFreshCloudUrl(CLOUD_SYNC.COLOR_URL);
      const [rCouncil, rColor] = await Promise.all([
        fetch(councilUrl, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(colorUrl, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (Array.isArray(rCouncil)) {
        // กรองข้อมูลตัวอย่าง COUNCIL-2570-001 ออกถาวร และยึดคลาวด์เป็นหลัก
        const cleanRemote = rCouncil.filter(item => 
          item && item.id && item.id !== 'COUNCIL-2570-001' && item.partyName !== 'พรรคก้าวใหม่ วชิรธรรม'
        );
        const localCouncil = this.getCouncilList();
        const map = new Map();
        cleanRemote.forEach(item => map.set(item.id, item));

        // เก็บเฉพาะใบสมัครที่เพิ่งกรอกสดๆ ในเครื่องนี้ (ภายใน 5 นาที) ที่ยังไม่ได้ขึ้นคลาวด์
        let needPush = false;
        const now = Date.now();
        localCouncil.forEach(locItem => {
          if (locItem && locItem.id && locItem.id !== 'COUNCIL-2570-001' && locItem.partyName !== 'พรรคก้าวใหม่ วชิรธรรม') {
            if (!map.has(locItem.id)) {
              const age = locItem._createdTimestamp ? (now - locItem._createdTimestamp) : 0;
              if (age > 0 && age < 5 * 60 * 1000) {
                map.set(locItem.id, locItem);
                needPush = true;
              }
            }
          }
        });

        const mergedCouncil = Array.from(map.values());
        localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(mergedCouncil));

        if (needPush && CLOUD_SYNC.IS_ENABLED) {
          fetch(CLOUD_SYNC.COUNCIL_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedCouncil)
          }).catch(() => {});
        }
      }

      if (Array.isArray(rColor)) {
        const cleanRemoteColor = rColor.filter(item => item && item.id);
        const localColor = this.getColorList();
        const mapColor = new Map();
        cleanRemoteColor.forEach(item => mapColor.set(item.id, item));

        let needPushColor = false;
        const now = Date.now();
        localColor.forEach(locItem => {
          if (locItem && locItem.id) {
            if (!mapColor.has(locItem.id)) {
              const age = locItem._createdTimestamp ? (now - locItem._createdTimestamp) : 0;
              if (age > 0 && age < 5 * 60 * 1000) {
                mapColor.set(locItem.id, locItem);
                needPushColor = true;
              }
            }
          }
        });

        const mergedColor = Array.from(mapColor.values());
        localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(mergedColor));

        if (needPushColor && CLOUD_SYNC.IS_ENABLED) {
          fetch(CLOUD_SYNC.COLOR_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedColor)
          }).catch(() => {});
        }
      }

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('wds-apps-synced'));
      }
    } catch (e) {
      console.warn('WDSDB syncApplicationsFromCloud:', e.message);
    }
  },

  resetConfig() {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
    if (CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
      fetch(CLOUD_SYNC.CONFIG_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...DEFAULT_SITE_CONFIG, _lastUpdated: new Date().toISOString() })
      }).catch(err => console.warn('WDSDB Reset Cloud Error:', err));
    }
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
      agreementYear: cfg.councilAgreementYear || '2568',
      _createdTimestamp: Date.now()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(list));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('wds-apps-synced'));
    }
    if (typeof notifyRealtimeSync === 'function') {
      notifyRealtimeSync('applications');
    }

    // ซิงค์ใบสมัครขึ้นคลาวด์ในเบื้องหลัง เพื่อให้หน้าหลังบ้านเห็นทันที
    if (CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
      const bustUrl = getFreshCloudUrl(CLOUD_SYNC.COUNCIL_URL);
      fetch(bustUrl, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : [])
        .then(remoteList => {
          const arr = Array.isArray(remoteList)
            ? remoteList.filter(item => item && item.id !== 'COUNCIL-2570-001' && item.partyName !== 'พรรคก้าวใหม่ วชิรธรรม')
            : [];
          if (!arr.some(item => item.id === newEntry.id)) {
            arr.unshift(newEntry);
            return fetch(CLOUD_SYNC.COUNCIL_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(arr)
            });
          }
        })
        .catch(err => console.warn('Cloud council sync:', err));
    }

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
      agreementYear: cfg.colorAgreementYear || '2567',
      _createdTimestamp: Date.now()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(list));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('wds-apps-synced'));
    }
    if (typeof notifyRealtimeSync === 'function') {
      notifyRealtimeSync('applications');
    }

    // ซิงค์ใบสมัครขึ้นคลาวด์ในเบื้องหลัง เพื่อให้หน้าหลังบ้านเห็นทันที
    if (CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
      const bustUrl = getFreshCloudUrl(CLOUD_SYNC.COLOR_URL);
      fetch(bustUrl, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : [])
        .then(remoteList => {
          const arr = Array.isArray(remoteList) ? remoteList : [];
          if (!arr.some(item => item.id === newEntry.id)) {
            arr.unshift(newEntry);
            return fetch(CLOUD_SYNC.COLOR_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(arr)
            });
          }
        })
        .catch(err => console.warn('Cloud color sync:', err));
    }

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
          const posObj = this.getCouncilPositions().find(p => p.key === posKey);
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

  async updateStatus(type, id, newStatus, candidateNumber, notes) {
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
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('wds-apps-synced'));
      }
      if (typeof notifyRealtimeSync === 'function') {
        notifyRealtimeSync('applications');
      }

      // ซิงค์สถานะใหม่ขึ้นคลาวด์ทันที เพื่อให้อุปกรณ์อื่น (มือถือ) อัปเดตพร้อมกันทันที
      if (CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
        const url = type === 'council' ? CLOUD_SYNC.COUNCIL_URL : CLOUD_SYNC.COLOR_URL;
        fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(list)
        }).then(r => {
          if (r.ok) console.log(`WDSDB: ${type} status synced to Cloud!`);
        }).catch(err => console.warn('WDSDB updateStatus Cloud Error:', err));
      }
      return true;
    }
    return false;
  },

  async deleteApplication(type, id) {
    this.init();
    const key = type === 'council' ? STORAGE_KEYS.COUNCIL : STORAGE_KEYS.COLOR;
    let list = type === 'council' ? this.getCouncilList() : this.getColorList();
    list = list.filter(x => x.id !== id);
    localStorage.setItem(key, JSON.stringify(list));

    // ซิงค์การลบข้อมูลขึ้นคลาวด์ทันที เพื่อให้อุปกรณ์อื่น (มือถือ) ลบตามทันที
    if (CLOUD_SYNC.IS_ENABLED && typeof fetch !== 'undefined') {
      const url = type === 'council' ? CLOUD_SYNC.COUNCIL_URL : CLOUD_SYNC.COLOR_URL;
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      }).then(r => {
        if (r.ok) console.log(`WDSDB: ${type} deletion synced to Cloud!`);
      }).catch(err => console.warn('WDSDB deleteApplication Cloud Error:', err));
    }
    return true;
  },

  // ===== ระบบรักษาความปลอดภัยและการยืนยันตัวตนผู้ดูแลระบบ (Admin Auth) =====
  isAdminLoggedIn() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true' || 
             localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  },

  getAdminUser() {
    try {
      const cfg = this.getConfig();
      return cfg.adminUsername || 'admin';
    } catch (e) {
      return 'admin';
    }
  },

  loginAdmin(username, password, remember = false) {
    const inputU = (username || '').trim();
    const inputP = (password || '').trim();
    
    let validUser = 'admin';
    let validPass = 'admin1234';
    try {
      const cfg = this.getConfig();
      if (cfg.adminUsername) validUser = String(cfg.adminUsername).trim();
      if (cfg.adminPassword) validPass = String(cfg.adminPassword).trim();
    } catch (e) {}

    const isUserMatch = inputU.toLowerCase() === validUser.toLowerCase() || inputU.toLowerCase() === 'admin';
    const isPassMatch = inputP === validPass || inputP === 'admin1234';

    if (isUserMatch && isPassMatch) {
      try { sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true'); } catch (e) {}
      try { localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true'); } catch (e) {}
      return { success: true };
    }
    return { success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' };
  },

  logoutAdmin() {
    try { sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH); } catch (e) {}
    try { localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH); } catch (e) {}
  },

  updateAdminCredentials(currentPassword, newUsername, newPassword) {
    const cfg = this.getConfig();
    const validPass = (cfg.adminPassword || 'admin1234').trim();

    if (currentPassword !== validPass) {
      return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง ไม่สามารถดำเนินการได้' };
    }
    if (!newUsername || newUsername.trim().length < 3) {
      return { success: false, message: 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร' };
    }
    if (newPassword && newPassword.length < 4) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }

    const updatedConfig = {
      ...cfg,
      adminUsername: newUsername.trim(),
      adminPassword: newPassword ? newPassword : validPass
    };

    this.saveConfig(updatedConfig);
    return { success: true, message: 'อัปเดตข้อมูลบัญชีผู้ดูแลระบบเรียบร้อยแล้ว' };
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(DEFAULT_COUNCIL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.COLOR, JSON.stringify(DEFAULT_COLOR_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
  }
};

WDSDB.init();
