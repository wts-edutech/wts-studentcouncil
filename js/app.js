/**
 * สคริปต์หลักสำหรับการทำงานส่วนกลาง และระบบผูกค่าการตั้งค่าแบบไดนามิก (Dynamic CMS Binding)
 */

// ฟังก์ชัน Escape HTML ป้องกัน XSS
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// จัดรูปแบบข้อความกิจกรรมให้เน้นคำนำหน้า เช่น "เปิดรับสมัครออนไลน์:"
function formatTimelineTitle(title) {
  if (!title) return '';
  const idx = title.indexOf(':');
  if (idx !== -1) {
    const boldPart = title.substring(0, idx + 1);
    const restPart = title.substring(idx + 1);
    return `<strong>${escapeHTML(boldPart)}</strong>${escapeHTML(restPart)}`;
  }
  return escapeHTML(title);
}

// ฟังก์ชันแทนที่ข้อมูลการตั้งค่าเว็บไซต์ในทุกหน้าโดยอัตโนมัติ
function applySiteConfig() {
  if (typeof WDSDB === 'undefined') return;
  const cfg = WDSDB.getConfig();

  // 1. แทนที่ข้อความตาม data-cfg attribute ทั้งหมด
  document.querySelectorAll('[data-cfg]').forEach(el => {
    const key = el.getAttribute('data-cfg');
    if (cfg[key] !== undefined && cfg[key] !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = cfg[key];
      } else {
        el.innerText = cfg[key];
      }
    }
  });

  // 2. แทนที่รูปตราโรงเรียนและตราสัญลักษณ์ทั้งหมด (และลบพื้นหลังสีขาวของตราให้อัตโนมัติ)
  const fallbackLogo = 'assets/images/school-logo-transparent.png';
  let logo1 = cfg.schoolLogo || fallbackLogo;
  if (!logo1 || typeof logo1 !== 'string' || logo1.includes('iVBORw0KGgoAAASUhEUgAAACgAAAAyCAYAAAAus5mQ') || (logo1.startsWith('data:image/png;base64,iVBORw') && logo1.length < 5000)) {
    logo1 = fallbackLogo;
  }
  const logo2 = cfg.schoolLogo2 !== undefined ? cfg.schoolLogo2 : (typeof DEFAULT_LOGO_2 !== 'undefined' ? DEFAULT_LOGO_2 : '');
  const logo3 = cfg.schoolLogo3 !== undefined ? cfg.schoolLogo3 : (typeof DEFAULT_LOGO_3 !== 'undefined' ? DEFAULT_LOGO_3 : '');

  const applyTransparentLogoToNodes = (selector, src, altText) => {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;
    if (!src) {
      nodes.forEach(el => el.classList.add('hidden'));
      return;
    }
    const renderImg = (cleanSrc) => {
      nodes.forEach(el => {
        el.classList.remove('hidden');
        if (el.tagName === 'IMG') {
          el.src = cleanSrc;
          el.onerror = function() {
            this.onerror = null;
            this.src = fallbackLogo;
          };
        } else {
          el.innerHTML = `<img src="${cleanSrc}" class="w-full h-full object-contain" alt="${altText}" onerror="this.onerror=null; this.src='${fallbackLogo}';">`;
        }
      });
    };

    // หากเป็นไฟล์ PNG โปร่งใสอยู่แล้ว หรือเป็นไฟล์ Asset ไม่ต้องนำไปเข้า Canvas เพื่อป้องกันปัญหา CORS บนมือถือ
    if (src.includes('transparent') || src.endsWith('.png') || src.startsWith('data:image/svg')) {
      renderImg(src);
      return;
    }

    removeImageBackground(src, renderImg);
  };

  applyTransparentLogoToNodes('[data-cfg-logo]', logo1, 'ตราประจำโรงเรียน');
  applyTransparentLogoToNodes('[data-cfg-logo2]', logo2, 'ตราสัญลักษณ์ที่ 2');
  applyTransparentLogoToNodes('[data-cfg-logo3]', logo3, 'ตราสัญลักษณ์ที่ 3');

  // 2.5 อัปเดตรูปภาพพื้นหลังแบนเนอร์ส่วนหัว (Hero Banner Background & Position/Zoom)
  const heroBg = cfg.heroBannerImage || (typeof DEFAULT_HERO_BANNER_IMAGE !== 'undefined' ? DEFAULT_HERO_BANNER_IMAGE : 'assets/images/hero-bg-clean.jpg');
  const posX = cfg.heroBannerPosX !== undefined ? cfg.heroBannerPosX : 100;
  const posY = cfg.heroBannerPosY !== undefined ? cfg.heroBannerPosY : 50;
  const zoom = cfg.heroBannerZoom !== undefined ? cfg.heroBannerZoom : 100;
  document.querySelectorAll('.hero-banner-bg').forEach(el => {
    el.style.backgroundColor = '#0b2444';
    el.style.backgroundImage = `url('${heroBg}')`;
    if (window.innerWidth > 768) {
      el.style.backgroundPosition = `${posX}% ${posY}%`;
      el.style.backgroundSize = zoom == 100 ? 'cover' : `${zoom}% auto`;
    } else {
      el.style.backgroundPosition = `85% center`;
      el.style.backgroundSize = `cover`;
    }
  });

  // 3. อัปเดต Title ของแท็บเบราว์เซอร์
  if (cfg.schoolName) {
    if (document.title.includes('โรงเรียน')) {
      document.title = document.title.replace(/โรงเรียน[^\s|]+/g, cfg.schoolName);
    } else {
      document.title = `${document.title} | ${cfg.schoolName}`;
    }
  }

  // 4. อัปเดตปีการศึกษาในจุดที่ระบุ
  document.querySelectorAll('.cfg-year').forEach(el => {
    el.innerText = cfg.academicYear;
  });

  // 5. เรนเดอร์การ์ดและตารางกำหนดการปฏิทินการเลือกตั้งหน้าแรก (index.html)
  const list = (cfg.timeline && Array.isArray(cfg.timeline) && cfg.timeline.length > 0)
    ? cfg.timeline
    : (typeof DEFAULT_TIMELINE !== 'undefined' ? DEFAULT_TIMELINE : []);

  const timelineCardsContainer = document.getElementById('timelineCardsGrid');
  if (timelineCardsContainer) {
    const stepIcons = [
      'fa-laptop',
      'fa-clipboard-check',
      'fa-bullhorn',
      'fa-check-to-slot',
      'fa-chart-simple'
    ];

    // ตรวจสอบว่าครู/ผู้ดูแลระบบกำหนดให้ขั้นตอนใดเป็นช่วงเวลาสำคัญ (highlight)
    const hasAnyHighlight = list.some(item => Boolean(item.highlight));

    timelineCardsContainer.innerHTML = list.map((item, index) => {
      const stepNum = item.step !== undefined ? item.step : (index + 1);
      // แสดงการ์ดสีเขียวตามขั้นตอนที่ครูกำหนดไว้ หากยังไม่มีการกำหนดให้เริ่มต้นที่ขั้นตอนแรก
      const isHighlightStep = hasAnyHighlight ? Boolean(item.highlight) : (index === 0);
      const iconClass = stepIcons[index % stepIcons.length];

      // แยกหัวข้อหลัก และรายละเอียด (คั่นด้วย :)
      let mainTitle = item.title || '';
      let subDesc = '';
      const colonIdx = mainTitle.indexOf(':');
      if (colonIdx !== -1) {
        subDesc = mainTitle.substring(colonIdx + 1).trim();
        mainTitle = mainTitle.substring(0, colonIdx).trim();
      } else if (item.location) {
        subDesc = item.location;
      }

      const connectorHtml = index < list.length - 1
        ? `<div class="hidden lg:flex items-center justify-center w-4 flex-shrink-0">
             <div class="w-full h-[2px] bg-emerald-700/30"></div>
           </div>`
        : '';

      if (isHighlightStep) {
        return `
          <div class="flex-1 min-w-[180px] rounded-lg sm:rounded-xl bg-gradient-to-b from-[#065f46] to-[#064e3b] text-white p-2.5 sm:p-4 md:p-5 shadow-sm sm:shadow-md border border-emerald-800 flex flex-col justify-between relative transition-all">
            <div>
              <div class="flex items-start justify-between mb-1.5 sm:mb-2 md:mb-3">
                <span class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-white text-[#064e3b] font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center shadow-sm">${stepNum}</span>
                <i class="fa-solid ${iconClass} text-white/90 text-sm sm:text-xl md:text-2xl"></i>
              </div>
              <div class="text-[10.5px] sm:text-xs md:text-sm font-bold text-[#fbbf24] mb-1 sm:mb-1.5">${escapeHTML(item.date || '')}</div>
              <div class="font-bold text-xs sm:text-sm md:text-base lg:text-[16.5px] leading-snug text-white mb-0.5 sm:mb-1">${escapeHTML(mainTitle)}</div>
              <div class="text-[10px] sm:text-xs md:text-[13.5px] lg:text-sm text-emerald-100 leading-normal sm:leading-relaxed">${escapeHTML(subDesc)}</div>
            </div>
          </div>
          ${connectorHtml}
        `;
      }

      return `
        <div class="flex-1 min-w-[180px] rounded-lg sm:rounded-xl bg-[#f8faf9] hover:bg-white transition p-2.5 sm:p-4 md:p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between relative">
          <div>
            <div class="flex items-start justify-between mb-1.5 sm:mb-2 md:mb-3">
              <span class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-[#0f2942] text-white font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center">${stepNum}</span>
              <i class="fa-solid ${iconClass} text-[#156548] text-sm sm:text-xl md:text-2xl"></i>
            </div>
            <div class="text-[10.5px] sm:text-xs md:text-sm font-bold text-[#b4690e] mb-1 sm:mb-1.5">${escapeHTML(item.date || '')}</div>
            <div class="font-bold text-xs sm:text-sm md:text-base lg:text-[16.5px] leading-snug text-slate-900 mb-0.5 sm:mb-1">${escapeHTML(mainTitle)}</div>
            <div class="text-[10px] sm:text-xs md:text-[13.5px] lg:text-sm text-slate-600 leading-normal sm:leading-relaxed">${escapeHTML(subDesc)}</div>
          </div>
        </div>
        ${connectorHtml}
      `;
    }).join('');
  }

  const timelineTbody = document.getElementById('timelineTableBody');
  if (timelineTbody) {
    timelineTbody.innerHTML = list.map((item, index) => {
      const stepNum = item.step !== undefined ? item.step : (index + 1);
      const isHighlight = Boolean(item.highlight);
      const rowClass = isHighlight ? 'bg-emerald-50/80 font-medium' : '';
      const dateClass = isHighlight ? 'font-bold text-[#065f46]' : 'text-slate-800';

      return `
        <tr class="${rowClass}">
          <td class="p-2.5 text-center font-bold text-slate-800">${stepNum}</td>
          <td class="p-2.5 ${dateClass}">
            ${escapeHTML(item.date || '')}
            ${isHighlight ? '<span class="hidden sm:inline-block ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">★ ช่วงสำคัญ</span>' : ''}
          </td>
          <td class="p-2.5 text-slate-800 leading-relaxed">${formatTimelineTitle(item.title || '')}</td>
          <td class="p-2.5 text-slate-700">${escapeHTML(item.location || '')}</td>
        </tr>
      `;
    }).join('');
  }

  // 6. เรนเดอร์รายการระเบียบและเกณฑ์การรับสมัคร (Tab 2) และหน้าการ์ดยื่นใบสมัคร (Tab 3)
  renderRulesAndApplyContent(cfg);
}

function renderRulesAndApplyContent(cfg) {
  // ฟังก์ชันจัดรูปแบบบรรทัดระเบียบการและตัดเลขอาราบิกนำหน้า (1. , 2. ) ออก พร้อมปรับขนาดและระยะบรรทัดให้อ่านง่ายบนจอคอม
  const formatRuleItem = (line) => {
    // ตัดเลขอาราบิกนำหน้า เช่น "1. ", "2. ", "10) " ออก
    const cleanLine = String(line || '').replace(/^\s*\d+[\.\)]\s*/, '').trim();
    if (!cleanLine) return '';

    // จัดการระดับการย่อหน้าตามโครงสร้างหัวข้อย่อยแบบไทย และขนาดตัวอักษรให้อ่านง่าย ชัดเจนบนจอคอม
    let indentClass = '';
    let extraClass = '';
    if (/^[๑-๙0-9]\.[๑-๙0-9]\.[๑-๙0-9]/.test(cleanLine)) {
      // ข้อย่อยระดับ 3 (เช่น ๑.๙.๑, ๑.๙.๒)
      indentClass = 'pl-6 sm:pl-9 md:pl-12 text-slate-700 text-xs sm:text-sm md:text-[15.5px] lg:text-[16px] py-1';
    } else if (/^[๑-๙0-9]\.[๑-๙0-9]/.test(cleanLine)) {
      // ข้อย่อยระดับ 2 (เช่น ๑.๑, ๑.๒)
      indentClass = 'pl-3 sm:pl-5 md:pl-7 text-slate-800 text-xs sm:text-sm md:text-base lg:text-[16.5px] py-1 font-normal';
    } else if (cleanLine.startsWith('ดังต่อไปนี้')) {
      indentClass = 'pl-6 sm:pl-9 md:pl-12 text-slate-600 font-medium italic text-xs sm:text-sm md:text-base lg:text-[16px] py-0.5';
    } else if (cleanLine.includes('คุณสมบัติของผู้สมัคร') || cleanLine.includes('เกณฑ์คุณสมบัติ')) {
      extraClass = 'font-bold text-slate-900 text-sm sm:text-base md:text-lg lg:text-xl pt-3 pb-1.5 border-t border-slate-200 mt-2.5';
    } else {
      // หัวข้อหลักทั่วไป (เช่น ระดับชั้น:, ครูที่ปรึกษา:, ความยินยอม:)
      extraClass = 'text-xs sm:text-sm md:text-base lg:text-[16.5px] text-slate-800 py-1';
    }

    return `<div class="leading-relaxed md:leading-[1.85] ${indentClass} ${extraClass}">${formatTimelineTitle(cleanLine)}</div>`;
  };

  // หมวดที่ 1: สภานักเรียน
  const councilRulesOl = document.getElementById('rulesCouncilOl');
  if (councilRulesOl && Array.isArray(cfg.rulesCouncilList)) {
    councilRulesOl.innerHTML = cfg.rulesCouncilList.map(formatRuleItem).filter(Boolean).join('');
  }

  // หมวดที่ 2: ประธานคณะสี
  const colorRulesOl = document.getElementById('rulesColorOl');
  if (colorRulesOl && Array.isArray(cfg.rulesColorList)) {
    colorRulesOl.innerHTML = cfg.rulesColorList.map(formatRuleItem).filter(Boolean).join('');
  }

  // รายการสรุปในการ์ดยื่นใบสมัครสภานักเรียน (Tab 3)
  const applyCouncilBulletsEl = document.getElementById('applyCouncilBulletsBox');
  if (applyCouncilBulletsEl && Array.isArray(cfg.applyCouncilBullets)) {
    applyCouncilBulletsEl.innerHTML = cfg.applyCouncilBullets.map(b => `<div>• ${escapeHTML(b)}</div>`).join('');
  }

  // ป้ายรายชื่อคณะสีในการ์ดยื่นใบสมัครคณะสี (Tab 3)
  const applyColorTagsEl = document.getElementById('applyColorTagsBox');
  if (applyColorTagsEl && cfg.applyColorHousesText) {
    const tagStyles = [
      'bg-blue-50 text-blue-800 border-blue-200',
      'bg-yellow-50 text-yellow-800 border-yellow-300',
      'bg-red-50 text-red-800 border-red-200',
      'bg-orange-50 text-orange-800 border-orange-200',
      'bg-green-50 text-green-800 border-green-200'
    ];
    const items = cfg.applyColorHousesText.split(',').map(s => s.trim()).filter(Boolean);
    applyColorTagsEl.innerHTML = items.map((t, i) => {
      const style = tagStyles[i % tagStyles.length];
      return `<span class="px-2 py-0.5 ${style} border rounded">${escapeHTML(t)}</span>`;
    }).join('');
  }

  // รายการสรุปในการ์ดยื่นใบสมัครคณะสี (Tab 3)
  const applyColorBulletsEl = document.getElementById('applyColorBulletsBox');
  if (applyColorBulletsEl && Array.isArray(cfg.applyColorBullets)) {
    applyColorBulletsEl.innerHTML = cfg.applyColorBullets.map(b => `<div>• ${escapeHTML(b)}</div>`).join('');
  }
}

// รายชื่อโรงเรียนในสหวิทยาเขตนวสิรินครินทร์ พร้อมไอคอนตราสัญลักษณ์จำลองสีประจำโรงเรียน
const CONSORTIUM_SCHOOLS = [
  { name: 'โรงเรียนเตรียมอุดมศึกษาพัฒนาการ', color: '#db2777', sub: '#1d4ed8', url: 'https://www.tup.ac.th' },
  { name: 'โรงเรียนสายน้ำผึ้ง ในพระอุปถัมภ์ฯ', color: '#92400e', sub: '#f59e0b', url: 'https://www.sainampeung.ac.th' },
  { name: 'โรงเรียนมัธยมวัดธาตุทอง', color: '#ca8a04', sub: '#ffffff', url: 'https://www.mtt.ac.th' },
  { name: 'โรงเรียนพระโขนงพิทยาลัย', color: '#eab308', sub: '#1e3a8a', url: 'https://www.pkp.ac.th' },
  { name: 'โรงเรียนสิริรัตนาธร', color: '#dc2626', sub: '#2563eb', url: 'https://www.srt.ac.th' },
  { name: 'โรงเรียนปทุมคงคา', color: '#1e40af', sub: '#f43f5e', url: 'https://www.patumkongka.ac.th' },
  { name: 'โรงเรียนศรีพฤฒา', color: '#f59e0b', sub: '#10b981', url: 'https://www.sripruetta.ac.th' },
  { name: 'โรงเรียนราชดำริ', color: '#eab308', sub: '#3b82f6', url: 'https://www.rajdamri.ac.th' }
];

function renderSchoolInfoFooter(cfg) {
  const container = document.getElementById('schoolNetworkAndMapSection');
  if (!container) return;

  const schoolName = cfg.schoolName || 'โรงเรียนวชิรธรรมสาธิต';
  const address = cfg.schoolAddress || 'เลขที่ 1253 ซอยวชิรธรรมสาธิต 57 ถนนสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260';
  const officeHours = cfg.councilOfficeHours || 'กรุณาติดต่อในวันและเวลาราชการ (วันจันทร์ ถึง วันศุกร์ | ตั้งแต่เวลา 08.30 - 16.30 น.)';
  const email = cfg.councilEmail || 'wtstudentcouncil@gclass.wt.ac.th';
  const councilPhone = cfg.councilPhone || '084-3530359 (ประธานสภานักเรียน)';
  const schoolPhone = cfg.schoolPhone || '02-7462834 (กลุ่มบริหารกิจการนักเรียน)';
  const website = cfg.schoolWebsite || 'https://www.wt.ac.th';
  const mapQuery = encodeURIComponent(schoolName + ' ซอยวชิรธรรมสาธิต 57 บางจาก พระโขนง');

  const schoolsHtml = CONSORTIUM_SCHOOLS.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer"
       class="flex items-center space-x-3 py-2 px-1 border-b border-slate-300/80 hover:bg-white/70 transition group">
      <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-300 bg-white overflow-hidden">
        <svg viewBox="0 0 40 40" class="w-6 h-6">
          <circle cx="20" cy="20" r="18" fill="${s.color}" opacity="0.15"/>
          <circle cx="20" cy="20" r="14" fill="none" stroke="${s.color}" stroke-width="2"/>
          <path d="M20,6 L24,16 L20,24 L16,16 Z" fill="${s.color}"/>
          <path d="M11,24 C11,31 29,31 29,24 Z" fill="${s.sub === '#ffffff' ? s.color : s.sub}"/>
        </svg>
      </div>
      <span class="text-xs sm:text-[13px] font-medium text-slate-700 group-hover:text-[#0019d4] transition">${escapeHTML(s.name)}</span>
    </a>
  `).join('');

  container.innerHTML = `
    <div class="bg-[#efefef] border-t border-slate-300 py-8 px-4 sm:px-6 text-slate-800">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- คอลัมน์ซ้าย: สหวิทยาเขตนวสิรินครินทร์ (4 cols) -->
        <div class="lg:col-span-4">
          <div class="border-b-2 border-teal-700 mb-3">
            <div class="inline-block bg-[#0014d6] text-white font-bold text-sm sm:text-base px-5 py-1.5 tracking-wide">
              สหวิทยาเขตนวสิรินครินทร์
            </div>
          </div>
          <div class="divide-y divide-slate-300/60">
            ${schoolsHtml}
          </div>
        </div>

        <!-- คอลัมน์ขวา: ตำแหน่งที่ตั้ง แผนที่ และข้อมูลการติดต่อ (8 cols) -->
        <div class="lg:col-span-8">
          <div class="border-b-2 border-teal-700 mb-4 max-w-md">
            <div class="inline-block bg-[#0014d6] text-white font-bold text-sm sm:text-base px-6 py-1.5 tracking-wide">
              ตำแหน่งที่ตั้ง
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <!-- Google Maps Embed -->
            <div class="md:col-span-6 bg-white border border-slate-300 shadow-sm overflow-hidden rounded-sm">
              <iframe
                title="แผนที่ที่ตั้ง ${escapeHTML(schoolName)}"
                src="https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="270"
                style="border:0; display:block;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <!-- ข้อมูลที่อยู่และสำนักงานสภานักเรียน -->
            <div class="md:col-span-6 space-y-4 text-xs sm:text-[13px] leading-relaxed">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-[#0014d6] mb-1">${escapeHTML(schoolName)}</h3>
                <p class="text-slate-700">${escapeHTML(address)}</p>
              </div>

              <div>
                <h4 class="text-sm sm:text-base font-bold text-[#0014d6] mb-1">สำนักงานสภานักเรียน</h4>
                <p class="text-slate-700">${escapeHTML(officeHours)}</p>
                <p class="text-slate-700 mt-1">Email : <a href="mailto:${escapeHTML(email)}" class="hover:underline text-slate-800">${escapeHTML(email)}</a></p>
                <p class="text-slate-700">Tel : ${escapeHTML(councilPhone)}</p>
                <p class="text-slate-700">Tel : ${escapeHTML(schoolPhone)}</p>
              </div>

              <div class="pt-1">
                <a href="${escapeHTML(website)}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center space-x-2.5 bg-[#e63956] hover:bg-[#d02845] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-md shadow-sm transition">
                  <span class="tracking-wider">WEBSITE</span>
                  <span class="w-6 h-6 rounded-full bg-white text-[#e63956] flex items-center justify-center text-xs">
                    <i class="fa-solid fa-globe"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// รับฟังการเปลี่ยนแปลงการตั้งค่าข้ามหน้าต่าง (Cross-Tab Live Sync)
// ทำให้เมื่อเปิดหน้าบ้านและหลังบ้านคู่กัน พอหลังบ้านกดบันทึก หน้าบ้านจะเปลี่ยนทันทีโดยไม่ต้องรีเฟรช!
window.addEventListener('storage', (e) => {
  if (e.key === (typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.CONFIG : 'wds_election_config_2570')) {
    applySiteConfig();
    showToast('ข้อมูลเว็บไซต์ได้รับการอัปเดตจากระบบหลังบ้านแล้ว', 'info');
  }
});

// ฟังก์ชันลบพื้นหลังสีขาวหรือสีพื้นหลังรอบตราสัญลักษณ์ให้อัตโนมัติ (Transparent PNG)
function removeImageBackground(dataUrl, callback) {
  if (!dataUrl || dataUrl.startsWith('data:image/svg') || dataUrl.includes('transparent') || dataUrl.endsWith('.png')) {
    callback(dataUrl);
    return;
  }
  try {
    const img = new Image();
    if (!dataUrl.startsWith('data:')) {
      img.crossOrigin = 'Anonymous';
    }
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // ตรวจจับสีมุมภาพและสีขาวจัดเพื่อลบพื้นหลังออกให้โปร่งใส
        const r0 = d[0], g0 = d[1], b0 = d[2], a0 = d[3];
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const isNearWhite = (r > 235 && g > 235 && b > 235);
          const isNearCornerBg = a0 > 200 && Math.abs(r - r0) < 22 && Math.abs(g - g0) < 22 && Math.abs(b - b0) < 22;
          if (isNearWhite || isNearCornerBg) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        callback(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Canvas background removal skipped:', e);
        callback(dataUrl);
      }
    };
    img.onerror = function() {
      callback(dataUrl);
    };
    img.src = dataUrl;
  } catch (err) {
    callback(dataUrl);
  }
}

// แปลงไฟล์รูปภาพเป็น Base64
function handleImageUpload(inputElement, previewImgElement, hiddenInputElement, callback, autoRemoveBg = false) {
  if (inputElement.files && inputElement.files[0]) {
    const file = inputElement.files[0];
    
    if (file.size > 3 * 1024 * 1024) {
      alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 3MB');
      inputElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const rawData = e.target.result;
      const applyResult = (finalData) => {
        if (previewImgElement) {
          previewImgElement.src = finalData;
          previewImgElement.classList.remove('hidden');
        }
        if (hiddenInputElement) {
          hiddenInputElement.value = finalData;
        }
        if (typeof callback === 'function') {
          callback(finalData);
        }
      };

      if (autoRemoveBg) {
        removeImageBackground(rawData, applyResult);
      } else {
        applyResult(rawData);
      }
    };
    reader.readAsDataURL(file);
  }
}

// ฟังก์ชันแสดง Toast Notification ทางการ
function showToast(message, type = 'success') {
  const oldToast = document.getElementById('govToast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.id = 'govToast';
  const bgColor = type === 'success' ? 'bg-[#15803d]' : (type === 'error' ? 'bg-red-800' : 'bg-[#1e3a8a]');
  toast.className = `fixed bottom-4 right-4 z-50 text-white px-5 py-2.5 rounded shadow-lg text-xs sm:text-sm flex items-center space-x-2 transition-all duration-200 transform translate-y-6 opacity-0 ${bgColor} font-formal`;
  
  const icon = type === 'success' ? 'fa-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-6', 'opacity-0');
  }, 30);

  setTimeout(() => {
    toast.classList.add('translate-y-6', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// การดาวน์โหลดไฟล์ข้อมูลเป็น CSV ภาษาไทย UTF-8
function exportToCSV(filename, rows) {
  const processRow = function (row) {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0)
        result = '"' + result + '"';
      if (j > 0)
        finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\uFEFF';
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// รันผูกค่าการตั้งค่าอัตโนมัติเมื่อเอกสารโหลด
window.addEventListener('DOMContentLoaded', () => {
  applySiteConfig();
});
