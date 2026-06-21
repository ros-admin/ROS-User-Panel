let localMembersArray = []; // লোকাল ক্যাশ ভ্যারিয়েবল

// এক্সটার্নাল ডিপেন্ডেন্সি লাইব্রেরি স্বয়ংক্রিয়ভাবে ও সঠিকভাবে লোড করার ফাংশন
function injectRequiredLibraries() {
  if (!window.XLSX) {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    document.head.appendChild(xlsxScript);
  }
  
  if (!window.html2pdf) {
    const html2pdfScript = document.createElement('script');
    html2pdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    document.head.appendChild(html2pdfScript);
  }

  if (!window.QRCode) {
    const qrScript = document.createElement('script');
    qrScript.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    document.head.appendChild(qrScript);
  }
}

function loadMembersModule(contentRoot, db, collection, onSnapshot, doc, getDocs, addDoc, updateDoc, deleteDoc) {
  injectRequiredLibraries();

  // ১. ড্যাশবোর্ড স্ট্রাকচার, মডালসমূহ ও সাইবার ডার্ক থিম স্টাইল রেন্ডারিং
  contentRoot.innerHTML = `
    <style>
      .cyber-glass {
        background: rgba(17, 24, 39, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 180, 216, 0.2);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      .nexus-modal {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; justify-content: center; align-items: center; z-index: 9999;
        background: rgba(4, 11, 26, 0.85); backdrop-filter: blur(8px);
      }
      .modal-body {
        width: 90%; max-width: 750px; max-height: 85vh; overflow-y: auto;
        border-radius: 14px; border: 1px solid #00b4d8; padding: 25px;
      }
      .grid-details {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;
      }
      @media (max-width: 600px) { .grid-details { grid-template-columns: 1fr; } }
      .detail-cell {
        background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .detail-cell small { display: block; color: #9ca3af; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;}
      .detail-cell p { margin: 0; font-size: 14px; font-weight: 600; color: #fff; word-break: break-all;}
      
      /* ফর্ম ইনপুট গ্রিড স্টাইল */
      .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
      @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
      .form-group { display: flex; flex-direction: column; }
      .form-group label { font-size: 12px; color: #00b4d8; margin-bottom: 4px; font-weight: 600; }
      
      .export-btn {
        padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;
        display: inline-flex; align-items: center; gap: 8px; border: none; font-size: 13px; transition: all 0.3s;
      }
      .btn-excel { background: #1f804b; color: #fff; }
      .btn-excel:hover { background: #176339; box-shadow: 0 0 15px rgba(31,128,75,0.4); }
      .btn-pdf { background: #e63946; color: #fff; }
      .btn-pdf:hover { background: #c12c37; box-shadow: 0 0 15px rgba(230,57,70,0.4); }
    </style>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
      <h2 style="font-size:22px; color:#00b4d8; margin:0; font-weight:700; text-shadow: 0 0 10px rgba(0,180,216,0.3);">
        <i class="fas fa-users-cog"></i> সদস্য ডাটাবেজ কন্ট্রোল প্যানেল
      </h2>
      <button class="cyber-input" id="openCreateMemberModalBtn" style="width:auto; margin:0; background:#fbbf24; color:#000; border:none; font-weight:bold; padding:9px 18px; border-radius:6px; cursor:pointer;">
        <i class="fas fa-user-plus"></i> ম্যানুয়াল মেম্বার তৈরি করুন
      </button>
    </div>
    
    <div class="cyber-glass" style="margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
      <input type="text" id="memberSearchInput" class="cyber-input" placeholder="নাম, নিবন্ধন নাম্বার, মোবাইল বা ইমেইল লিখে সদস্য খুঁজুন..." style="margin:0; flex:1; min-width:250px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
      
      <select id="memberStatusFilter" class="cyber-input" style="margin:0; width:160px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
        <option value="all">সকল স্ট্যাটাস</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>

      <div style="display:flex; gap:10px;">
        <button class="export-btn btn-excel" id="exportExcelBtn"><i class="fas fa-file-excel"></i> Excel دانلود</button>
      </div>
    </div>

    <div class="cyber-glass" style="overflow-x:auto; padding:5px; border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left; color:#e5e7eb;">
        <thead style="background:rgba(0, 180, 216, 0.15); color:#00b4d8; border-bottom:2px solid rgba(0, 180, 216, 0.3);">
          <tr>
            <th style="padding:14px 12px;">নিবন্ধন নাম্বার</th>
            <th style="padding:14px 12px;">সদস্যের নাম</th>
            <th style="padding:14px 12px;">মোবাইল নম্বর</th>
            <th style="padding:14px 12px;">বর্তমান পদবি (Role)</th>
            <th style="padding:14px 12px;">স্ট্যাটাস</th>
            <th style="padding:14px 12px; text-align:right;">ব্যবস্থাপনা পদক্ষেপ</th>
          </tr>
        </thead>
        <tbody id="memberTableBody"></tbody>
      </table>
    </div>

    <div class="nexus-modal" id="memberDetailsModal" style="display:none;">
      <div class="modal-body cyber-glass">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,180,216,0.3); padding-bottom:12px; margin-bottom:15px;">
          <h3 style="color:#00b4d8; margin:0; font-size:18px;"><i class="fas fa-id-card"></i> সদস্য প্রোফাইলের সম্পূর্ণ বিবরণ</h3>
          <button id="closeMemberModalBtnTop" style="background:none; border:none; color:#ff4d6d; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        
        <div id="modalMemberCardContent"></div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:25px; border-top:1px solid rgba(255,255,255,0.08); padding-top:15px;">
          <button type="button" class="export-btn" id="downloadFormPdfBtn" style="background:linear-gradient(135deg, #0077b6, #00b4d8); color:#fff;">
            <i class="fas fa-file-invoice"></i> সদস্য ফরম ডাউনলোড (PDF)
          </button>
          <button type="button" class="cyber-input" id="closeMemberModalBtn" style="width:auto; margin:0; background:#374151; color:#fff; border:none; font-weight:bold; padding:8px 16px; border-radius:6px; cursor:pointer;">বন্ধ করুন</button>
        </div>
      </div>
    </div>

    <div class="nexus-modal" id="createMemberModal" style="display:none;">
      <div class="modal-body cyber-glass" style="max-width: 650px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(251,191,36,0.3); padding-bottom:12px; margin-bottom:15px;">
          <h3 style="color:#fbbf24; margin:0; font-size:18px;"><i class="fas fa-user-plus"></i> নতুন সদস্য ডাটাবেজে যুক্ত করুন</h3>
          <button id="closeCreateModalBtnTop" style="background:none; border:none; color:#ff4d6d; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        
        <form id="newMemberForm">
          <div class="form-grid">
            <div class="form-group"><label>সদস্যের নাম (English) *</label><input type="text" id="fmName" class="cyber-input" required placeholder="John Doe"></div>
            <div class="form-group"><label>মোবাইল নম্বর *</label><input type="text" id="fmMobile" class="cyber-input" required placeholder="017XXXXXXXX"></div>
            <div class="form-group"><label>ইমেইল এড্রেস</label><input type="email" id="fmEmail" class="cyber-input" placeholder="example@mail.com"></div>
            <div class="form-group"><label>সদস্যের নাম (বাংলা)</label><input type="text" id="fmNameBn" class="cyber-input" placeholder="জন ডো"></div>
            <div class="form-group"><label>পিতার নাম</label><input type="text" id="fmFather" class="cyber-input"></div>
            <div class="form-group"><label>মাতার নাম</label><input type="text" id="fmMother" class="cyber-input"></div>
            <div class="form-group"><label>জন্ম তারিখ</label><input type="date" id="fmDob" class="cyber-input" style="color:#fff;"></div>
            <div class="form-group">
              <label>লিঙ্গ (Gender)</label>
              <select id="fmGender" class="cyber-input" style="background:#0b0f19; color:#fff;"><option value="">সিলেক্ট করুন</option><option value="Male">Male</option><option value="Female">Female</option></select>
            </div>
            <div class="form-group"><label>NID / জন্ম নিবন্ধন নম্বর</label><input type="text" id="fmNid" class="cyber-input"></div>
            <div class="form-group"><label>পেশা</label><input type="text" id="fmProfession" class="cyber-input" placeholder="Student / Employee"></div>
            <div class="form-group"><label>শিক্ষা প্রতিষ্ঠান / কর্মস্থল</label><input type="text" id="fmInstitution" class="cyber-input"></div>
            <div class="form-group"><label>শিক্ষাগত যোগ্যতা</label><input type="text" id="fmEducation" class="cyber-input"></div>
            <div class="form-group"><label>শিক্ষাবর্ষ (Academic Year)</label><input type="text" id="fmAcademicYear" class="cyber-input" placeholder="2023-24"></div>
            <div class="form-group">
              <label>সিস্টেম পদবি (Role)</label>
              <select id="fmRole" class="cyber-input" style="background:#0b0f19; color:#fff;"></select>
            </div>
          </div>
          <div style="margin-top:12px;" class="form-group"><label>বর্তমান ঠিকানা</label><input type="text" id="fmPresentAddr" class="cyber-input"></div>
          <div style="margin-top:12px;" class="form-group"><label>স্থায়ী ঠিকানা</label><input type="text" id="fmPermanentAddr" class="cyber-input"></div>
          
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; border-top:1px solid rgba(255,255,255,0.08); padding-top:15px;">
            <button type="button" id="closeCreateModalBtn" class="cyber-input" style="width:auto; margin:0; background:#374151; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">বাতিল</button>
            <button type="submit" class="export-btn" style="background:#fbbf24; color:#000;"><i class="fas fa-save"></i> সদস্য সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="hiddenPdfRenderArea" style="position: absolute; left: -9999px; top: -9999px; width: 210mm; height: 297mm; overflow: hidden;"></div>
  `;

  // এলিমেন্ট রেফারেন্সসমূহ
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');
  const tbody = document.getElementById('memberTableBody');
  const detailsModal = document.getElementById('memberDetailsModal');
  const createModal = document.getElementById('createMemberModal');
  const fmRoleSelect = document.getElementById('fmRole');
  let selectedMemberForForm = null;

  // ২. রোল ডেফিনিশন ম্যাপিং লেবেল এবং লিমিট অবজেক্ট
  const roleLabels = {
    "general_member": "সদস্য (General Member)",
    "admin": "এডমিন (Admin)",
    "former_member": "সাবেক সদস্য",
    "president": "সভাপতি",
    "vice_president": "সহ সভাপতি",
    "general_secretary": "সাধারণ সম্পাদক",
    "joint_general_secretary": "যুগ্ম সাধারণ সম্পাদক",
    "organizing_secretary": "সাংগঠনিক সম্পাদক",
    "treasurer": "কোষাধ্যক্ষ",
    "education_secretary": "শিক্ষা সম্পাদক",
    "event_secretary": "অনুষ্ঠান সম্পাদক",
    "publicity_secretary": "প্রচার ও যোগাযোগ সম্পাদক",
    "it_secretary": "তথ্য ও প্রযুক্তি সম্পাদক",
    "executive_member": "কার্যনির্বাহী সদস্য",
    "chief_convenor": "প্রধান আহ্বায়ক",
    "joint_convenor": "যুগ্ম আহ্বায়ক",
    "member_secretary": "সদস্য সচিব"
  };

  const roleLimits = {
    "president": 1, "vice_president": 1, "general_secretary": 1, "joint_general_secretary": 1,
    "organizing_secretary": 1, "treasurer": 1, "education_secretary": 1, "event_secretary": 1,
    "publicity_secretary": 1, "it_secretary": 1, "chief_convenor": 1, "joint_convenor": 1,
    "member_secretary": 1, "executive_member": 5
  };

  // অ্যাডমিন ফর্মের ড্রপডাউনে রোলসমূহ পুশ করা
  let roleOptionsHtml = "";
  for (const [key, val] of Object.entries(roleLabels)) {
    roleOptionsHtml += `<option value="${key}">${val}</option>`;
  }
  fmRoleSelect.innerHTML = roleOptionsHtml;

  // ৩. রিয়েল-টাইম ফায়ারবেস লিসেনার (সিরিয়াল বা মেম্বার আইডি ক্রমানুসারে ডাটা সর্ট)
  onSnapshot(collection(db, "users"), (snap) => {
    localMembersArray = [];
    snap.forEach(userDoc => {
      if (userDoc.data().role !== 'super_admin') {
        localMembersArray.push({ id: userDoc.id, ...userDoc.data() });
      }
    });

    // সিরিয়াল নাম্বার বা মেম্বার আইডি ক্রমানুসারে অ্যালফানিউমেরিক সর্টিং লজিক
    localMembersArray.sort((a, b) => {
      const idA = a.memberId || "ZZZZ";
      const idB = b.memberId || "ZZZZ";
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });

    renderFilteredMembers();
  });

  // ৪. রেন্ডারিং ফিল্টারড মেম্বারস তালিকা
  function renderFilteredMembers() {
    tbody.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = statusFilter.value;

    const filtered = localMembersArray.filter(u => {
      const matchesSearch = 
        (u.englishName && u.englishName.toLowerCase().includes(searchTerm)) || 
        (u.memberId && u.memberId.toLowerCase().includes(searchTerm)) || 
        (u.mobileNumber && u.mobileNumber.includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm));
      return matchesSearch && (filterValue === 'all' || u.status === filterValue);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#9ca3af;">কোনো সদস্যের রেকর্ড পাওয়া যায়নি।</td></tr>`;
      return;
    }

    filtered.forEach(u => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";
      tr.style.background = "rgba(0,0,0,0.1)";
      
      let statusColor = u.status === 'active' ? '#00b4d8' : (u.status === 'suspended' ? '#ff4d6d' : (u.status === 'pending' ? '#fbbf24' : '#9ca3af'));

      let roleChangerHtml = "";
      for (const [key, val] of Object.entries(roleLabels)) {
        const selected = (u.role === key) ? "selected" : "";
        roleChangerHtml += `<option value="${key}" ${selected}>${val}</option>`;
      }

      tr.innerHTML = `
        <td style="padding:14px 12px; color:#00b4d8; font-weight:bold;">${u.memberId || '⏳ Pending'}</td>
        <td style="padding:14px 12px; font-weight:600;">${u.englishName || 'N/A'}</td>
        <td style="padding:14px 12px;">${u.mobileNumber || 'N/A'}</td>
        <td style="padding:14px 12px;">
          <select class="cyber-input erp-role-changer" data-id="${u.id}" style="width:100%; max-width:180px; margin:0; padding:4px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:4px; font-size:12px;">
            ${roleChangerHtml}
          </select>
        </td>
        <td style="padding:14px 12px;"><span style="color:${statusColor}; font-weight:bold;">● ${String(u.status || 'pending').toUpperCase()}</span></td>
        <td style="padding:14px 12px; text-align:right;">
          <div style="display:flex; gap:6px; justify-content:flex-end; align-items:center;">
            <button class="cyber-input btn-view" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:rgba(0,180,216,0.15); color:#00b4d8; border:1px solid #00b4d8; margin:0; border-radius:4px; cursor:pointer;"><i class="fas fa-eye"></i> বিস্তারিত</button>
            <select class="cyber-input erp-status-changer" data-id="${u.id}" style="width:auto; margin:0; padding:5px; font-size:12px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); height:30px; border-radius:4px;">
              <option value="">স্ট্যাটাস</option>
              <option value="active" ${u.status === 'active'?'disabled':''}>Active</option>
              <option value="suspended" ${u.status === 'suspended'?'disabled':''}>Suspend</option>
              <option value="inactive" ${u.status === 'inactive'?'disabled':''}>Inactive</option>
            </select>
            <button class="cyber-input btn-delete-mem" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:#ff4d6d; color:#fff; border:none; margin:0; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // বিস্তারিত বাটন লিসেনার - পূর্বের থিমের মতো সম্পূর্ণ ও সুন্দর ইনফো গ্রিড রেন্ডারিং
    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const member = localMembersArray.find(m => m.id === id);
      if (!member) return;
      selectedMemberForForm = member;

      document.getElementById('modalMemberCardContent').innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${member.photoUrl || 'https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png'}" style="width:100px; height:100px; object-fit:cover; border-radius:50%; border:2px solid #00b4d8; box-shadow:0 0 15px rgba(0,180,216,0.2);">
          <h4 style="margin:8px 0 2px 0; font-size:18px; color:#fff;">${member.englishName || 'N/A'}</h4>
          <span style="color:#fbbf24; font-size:13px; font-weight:600;">${member.banglaName || ''}</span>
        </div>
        <div class="grid-details">
          <div class="detail-cell"><small>নিবন্ধন আইডি (Member ID)</small><p>${member.memberId || '⏳ Pending'}</p></div>
          <div class="detail-cell"><small>মোবাইল নম্বর</small><p>${member.mobileNumber || 'N/A'}</p></div>
          <div class="detail-cell"><small>হোয়াটসঅ্যাপ নম্বর</small><p>${member.whatsappNumber || 'N/A'}</p></div>
          <div class="detail-cell"><small>ইমেইল এড্রেস</small><p>${member.email || 'N/A'}</p></div>
          <div class="detail-cell"><small>পিতার নাম</small><p>${member.fatherName || 'N/A'}</p></div>
          <div class="detail-cell"><small>মাতার নাম</small><p>${member.motherName || 'N/A'}</p></div>
          <div class="detail-cell"><small>জন্ম তারিখ</small><p>${member.dob || 'N/A'}</p></div>
          <div class="detail-cell"><small>লিঙ্গ (Gender)</small><p>${member.gender || 'N/A'}</p></div>
          <div class="detail-cell"><small>NID / জন্ম নিবন্ধন</small><p>${member.nidOrBrn || 'N/A'}</p></div>
          <div class="detail-cell"><small>পেশা</small><p>${member.profession || 'N/A'}</p></div>
          <div class="detail-cell"><small>শিক্ষা প্রতিষ্ঠান/কর্মস্থল</small><p>${member.institution || 'N/A'}</p></div>
          <div class="detail-cell"><small>শিক্ষাগত যোগ্যতা</small><p>${member.education || 'N/A'}</p></div>
          <div class="detail-cell"><small>শিক্ষাবর্ষ (Academic Year)</small><p>${member.academicYear || 'N/A'}</p></div>
          <div class="detail-cell"><small>সিস্টেম রোল (Role)</small><p style="text-transform:uppercase; color:#00b4d8;">${roleLabels[member.role] || member.role}</p></div>
          <div class="detail-cell" style="grid-column: span 2;"><small>বর্তমান ঠিকানা</small><p>${member.presentAddress || 'N/A'}</p></div>
          <div class="detail-cell" style="grid-column: span 2;"><small>স্থায়ী ঠিকানা</small><p>${member.permanentAddress || 'N/A'}</p></div>
        </div>
      `;
      detailsModal.style.display = 'flex';
    }));

    // ডাটাবেজ ডিলিট হ্যান্ডলার
    document.querySelectorAll('.btn-delete-mem').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("🚨 আপনি কি নিশ্চিত? এই সদস্য ডাটাবেজ থেকে চিরতরে মুছে যাবে!")) {
        await deleteDoc(doc(db, "users", id));
        alert("সদস্য ডিলিট হয়েছে।");
      }
    }));

    // স্ট্যাটাস চেঞ্জার হ্যান্ডলার
    document.querySelectorAll('.erp-status-changer').forEach(s => s.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      if (!newStatus) return;

      if (confirm(`স্ট্যাটাস পরিবর্তন করতে চান?`)) {
        const updateData = { status: newStatus };
        const currentMem = localMembersArray.find(m => m.id === id);
        
        if (newStatus === 'active' && !currentMem.memberId) {
          const currentYear = new Date().getFullYear();
          const querySnapshot = await getDocs(collection(db, "users"));
          let maxSerial = 0;
          querySnapshot.forEach((doc) => {
            const memberId = doc.data().memberId;
            if (memberId && memberId.startsWith(`ROS-${currentYear}-`)) {
              const serialNum = parseInt(memberId.split('-')[2], 10);
              if (serialNum > maxSerial) maxSerial = serialNum;
            }
          });
          updateData.memberId = `ROS-${currentYear}-${String(maxSerial + 1).padStart(4, '0')}`;
        }
        await updateDoc(doc(db, "users", id), updateData);
        alert("স্ট্যাটাস সফলভাবে আপডেট হয়েছে।");
      }
      e.target.value = "";
    }));

    // রোল এবং লিমিট চেঞ্জার হ্যান্ডলার
    document.querySelectorAll('.erp-role-changer').forEach(rc => rc.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const targetRole = e.target.value;
      const currentMem = localMembersArray.find(m => m.id === id);
      if (!targetRole) return;

      if (roleLimits[targetRole]) {
        const activeCount = localMembersArray.filter(m => m.role === targetRole && m.id !== id).length;
        if (activeCount >= roleLimits[targetRole]) {
          alert(`🚨 রোল পরিবর্তন ব্যর্থ! এই পদবিতে সর্বোচ্চ ${roleLimits[targetRole]} জন থাকতে পারবেন।`);
          e.target.value = currentMem.role || "general_member";
          return;
        }
      }

      if (confirm(`পদবি পরিবর্তন করতে চান?`)) {
        await updateDoc(doc(db, "users", id), { role: targetRole });
        alert("পদবি সফলভাবে পরিবর্তন করা হয়েছে।");
      } else {
        e.target.value = currentMem.role || "general_member";
      }
    }));
  }

  // ৫. এক্সেল ফাইল এক্সপোর্ট লজিক
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    if (!window.XLSX || localMembersArray.length === 0) return;
    const excelRows = localMembersArray.map((m, idx) => ({
      "SL": idx + 1, "Member ID": m.memberId || "Pending", "Name": m.englishName || "", "Mobile": m.mobileNumber || "", "Role": roleLabels[m.role] || m.role, "Status": m.status || "pending"
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sorted Members");
    XLSX.writeFile(workbook, `ROS_Sorted_Database.xlsx`);
  });

  // 💎 ৬. সাইবার ডার্ক আলটিমেট কোডেড পিডিএফ জেনারেশন (১০০% কোডিং লেআউট, জিরো-ব্লিড ফিট সিস্টেম)
  document.getElementById('downloadFormPdfBtn').addEventListener('click', () => {
    if (!selectedMemberForForm || !window.html2pdf || !window.QRCode) return;
    
    const m = selectedMemberForForm;
    const renderTarget = document.getElementById('hiddenPdfRenderArea');

    // একদম পিওর এইচটিএমএল/সিএসএস কোডিং ভিত্তিক জিরো-ব্লিড ডিজাইন ফ্রেম (নো ইমেজ কনভার্ট ট্রিক)
    renderTarget.innerHTML = `
      <div id="pdfAbsoluteContainer" style="width: 210mm; height: 297mm; background: linear-gradient(135deg, #020c1b, #07162b); color: #f1f5f9; position: relative; box-sizing: border-box; overflow: hidden; padding: 0; margin: 0;">
        
        <div style="position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; border: 2px solid rgba(0, 180, 216, 0.6); border-radius: 10px; pointer-events: none; box-shadow: inset 0 0 15px rgba(0,180,216,0.15);"></div>
        <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 1px dashed rgba(255, 215, 0, 0.25); border-radius: 8px; pointer-events: none;"></div>
        
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 60%; opacity: .045; filter: grayscale(100%);">
        </div>

        <div style="position: relative; z-index: 2; padding: 16mm; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          
          <div>
            <div style="display: flex; align-items: center; gap: 20px; border-bottom: 2px solid rgba(0, 180, 216, 0.4); padding-bottom: 15px; margin-bottom: 20px;">
              <img src="${m.photoUrl || 'https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png'}" style="width: 100px; height: 120px; object-fit: cover; border: 2px solid #00b4d8; border-radius: 6px; background: rgba(0,0,0,0.4);">
              
              <div style="flex: 1; text-align: left;">
                <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" style="height: 48px; margin-bottom: 2px;">
                <h1 style="color: #ffd700; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 0.5px; font-family: 'Poppins', sans-serif;">MEMBER REGISTRATION REGISTRY</h1>
                <p style="color: #00b4d8; font-size: 12px; margin: 2px 0 0 0; font-weight: 600; letter-spacing: 1px;">RAJSHAHI OLYMPIAD SOCIETY (ROS)</p>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(0, 180, 216, 0.2); border-radius: 6px; overflow: hidden;">
              <div style="background: rgba(0, 180, 216, 0.15); padding: 8px 12px; font-weight: bold; color: #ffd700; font-size: 13px; border-bottom: 1px solid rgba(0, 180, 216, 0.2); letter-spacing: 0.5px;">SECURE PROFILE CREDENTIALS DATA-NODE</div>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; color: #f1f5f9;">
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); width: 28%; color: #00b4d8; font-weight: 600;">Registration ID:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: bold; color: #fff;">${m.memberId || 'ROS-PENDING'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Full Name (English):</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600;">${m.englishName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">সদস্যের নাম (বাংলা):</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.banglaName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Father's Name:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.fatherName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Mother's Name:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.motherName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Mobile & WhatsApp:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.mobileNumber || 'N/A'} ${m.whatsappNumber ? ' / '+m.whatsappNumber : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Email Address:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #ffd700;">${m.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Date of Birth / Gender:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.dob || 'N/A'} (${m.gender || 'N/A'})</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">NID / Birth Registration:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.nidOrBrn || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Institution / Workplace:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.institution || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Education / Session:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);">${m.education || 'N/A'} ${m.academicYear ? ' (Sess: '+m.academicYear+')' : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Assigned Role & Status:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; color: #00b4d8; font-weight: bold;">${roleLabels[m.role] || m.role} - <span style="color:#ffd700;">${m.status || 'ACTIVE'}</span></td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Present Address:</td>
                  <td style="padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px;">${m.presentAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; border-right: 1px solid rgba(255,255,255,0.06); color: #00b4d8; font-weight: 600;">Permanent Address:</td>
                  <td style="padding: 9px 12px; font-size: 11px;">${m.permanentAddress || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 18px; background: rgba(230, 57, 70, 0.05); border: 1px dashed rgba(0, 180, 216, 0.3); padding: 10px 14px; border-radius: 6px;">
              <div style="font-size: 11.5px; color: #ffd700; font-weight: bold; margin-bottom: 5px; font-family: 'Poppins'; text-transform: uppercase; letter-spacing: 0.5px;">Membership Terms & Regulatory Declarations:</div>
              <ul style="margin: 0; padding-left: 15px; font-size: 10px; color: #94a3b8; line-height: 1.5;">
                <li>1. The Authority reserves the absolute right to suspend or cancel membership at any given time without prior notice.</li>
                <li>2. Members must comply with the rules, constitution, and core values of Rajshahi Olympiad Society (ROS).</li>
                <li>3. Any anti-social or non-disciplinary activities inside or associated with the node will lead to instant termination.</li>
                <li>4. All provided profiling credentials must be legit. Fabrication of documents will trigger immediate structural blocks.</li>
              </ul>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px;">
              <div>
                <div id="formQrCodeContainer" style="background: #fff; padding: 5px; border-radius: 4px; display: inline-block; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;" id="pdfTimestampArea"></div>
              </div>

              <div style="text-align: center; width: 200px;">
                <div style="height: 40px;"></div> <div style="border-top: 1.5px solid #00b4d8; width: 100%;"></div>
                <div style="font-size: 11px; color: #ffd700; font-weight: bold; margin-top: 5px; font-family: 'Poppins';">Authorized Signature</div>
                <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">Rajshahi Olympiad Society</div>
              </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8;">
              <div>CRITICAL PRIVACY NODE // SECURE REGISTRY GENERATED VIA ROS NEXUS BACKEND</div>
              <div style="font-weight: 600; color: #00b4d8;">Developed By, Utsab Sarker</div>
            </div>
          </div>

        </div>
      </div>
    `;

    // কিউআর কোড রেন্ডার
    new QRCode(document.getElementById("formQrCodeContainer"), {
      text: `https://ros-user-panel.vercel.app/member/${m.memberId || 'Pending'}`,
      width: 75, height: 75
    });

    document.getElementById("pdfTimestampArea").innerText = "Registry Log: " + new Date().toLocaleString();

    // সরাসরি ডাউনলোডের এক্সিকিউশন কম্যান্ড (ফিট ইন ওয়ান পেজ জিরো-ব্লিড পলিসি)
    const element = document.getElementById('pdfAbsoluteContainer');
    html2pdf().set({
      margin: 0,
      filename: `ROS_Form_${m.memberId || 'Pending'}.pdf`,
      html2canvas: { scale: 2.5, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] }
    }).from(element).save().then(() => {
      renderTarget.innerHTML = ""; // মেমোরি ফ্লাশ
    });
  });

  // ৭. ম্যানুয়াল এন্ট্রি মডাল পপআপ কন্ট্রোল লজিক
  document.getElementById('openCreateMemberModalBtn').addEventListener('click', () => {
    document.getElementById('newMemberForm').reset();
    createModal.style.display = 'flex';
  });

  const closeCreateModal = () => { createModal.style.display = 'none'; };
  document.getElementById('closeCreateModalBtn').addEventListener('click', closeCreateModal);
  document.getElementById('closeCreateModalBtnTop').addEventListener('click', closeCreateModal);

  // ম্যানুয়াল এন্ট্রি ফর্ম সাবমিশন হ্যান্ডলার (নাম + মোবাইল দিয়ে অ্যাকাউন্ট খোলা যাবে, বাকি সব অপশনাল)
  document.getElementById('newMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('fmName').value.trim();
    const mobile = document.getElementById('fmMobile').value.trim();
    const email = document.getElementById('fmEmail').value.trim();
    const nameBn = document.getElementById('fmNameBn').value.trim();
    const father = document.getElementById('fmFather').value.trim();
    const mother = document.getElementById('fmMother').value.trim();
    const dob = document.getElementById('fmDob').value;
    const gender = document.getElementById('fmGender').value;
    const nid = document.getElementById('fmNid').value.trim();
    const profession = document.getElementById('fmProfession').value.trim();
    const institution = document.getElementById('fmInstitution').value.trim();
    const education = document.getElementById('fmEducation').value.trim();
    const academicYear = document.getElementById('fmAcademicYear').value.trim();
    const role = document.getElementById('fmRole').value;

    // মেম্বার আইডি জেনারেশন প্রোটোকল
    const currentYear = new Date().getFullYear();
    const querySnapshot = await getDocs(collection(db, "users"));
    let maxSerial = 0;
    querySnapshot.forEach((doc) => {
      const memberId = doc.data().memberId;
      if (memberId && memberId.startsWith(`ROS-${currentYear}-`)) {
        const serialNum = parseInt(memberId.split('-')[2], 10);
        if (serialNum > maxSerial) maxSerial = serialNum;
      }
    });
    const generatedId = `ROS-${currentYear}-${String(maxSerial + 1).padStart(4, '0')}`;

    try {
      await addDoc(collection(db, "users"), {
        englishName: name,
        mobileNumber: mobile,
        email: email || "",
        banglaName: nameBn || "",
        fatherName: father || "",
        motherName: mother || "",
        dob: dob || "",
        gender: gender || "",
        nidOrBrn: nid || "",
        profession: profession || "",
        institution: institution || "",
        education: education || "",
        academicYear: academicYear || "",
        role: role || "general_member",
        status: "active",
        memberId: generatedId,
        presentAddress: document.getElementById('fmPresentAddr').value.trim() || "",
        permanentAddress: document.getElementById('fmPermanentAddr').value.trim() || "",
        createdAt: new Date().toISOString()
      });
      
      alert(`🎉 সফলভাবে নতুন সদস্য যুক্ত করা হয়েছে!\nমেম্বার আইডি: ${generatedId}`);
      closeCreateModal();
    } catch (err) {
      console.error(err);
      alert("সদস্য ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে!");
    }
  });

  // বিস্তারিত প্রোফাইল মডাল ক্লোজ
  const closeDetails = () => { detailsModal.style.display = 'none'; selectedMemberForForm = null; };
  document.getElementById('closeMemberModalBtn').addEventListener('click', closeDetails);
  document.getElementById('closeMemberModalBtnTop').addEventListener('click', closeDetails);

  // লাইভ ফিল্টারিং ও সার্চ হ্যান্ডলার
  searchInput.addEventListener('input', renderFilteredMembers);
  statusFilter.addEventListener('change', renderFilteredMembers);
                                                             }
