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
  // 🔐 পাসওয়ার্ড পরিবর্তনের ফাংশন ও পপআপ/নোটিশ যেকোনো উপায়ে সম্পূর্ণরূপে নিষ্ক্রিয় করার প্রোটোকল
  if (typeof window !== "undefined") {
    localStorage.setItem("passwordChanged", "true");
    localStorage.setItem("forcePasswordChange", "false");
    window.userNeedsPasswordChange = false;
    window.showPasswordChangeModal = function() { return false; };
    window.checkPasswordSecurity = function() { return false; };
  }
  
  injectRequiredLibraries();

  // ১. ড্যাশবোর্ড স্ট্রাকচার, মডালসমূহ ও সাইনিক ডার্ক থিম স্টাইল রেন্ডারিং
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
        background: rgba(4, 11, 26, 0.9); backdrop-filter: blur(10px);
      }
      .modal-body {
        width: 95%; max-width: 850px; max-height: 85vh; overflow-y: auto;
        border-radius: 16px; border: 1px solid rgba(0, 180, 216, 0.4); padding: 25px;
        box-shadow: 0 0 30px rgba(0, 180, 216, 0.2);
      }
      
      /* প্রোফাইল কার্ড ডিজাইন */
      .profile-card-container {
        display: flex; gap: 24px; background: rgba(255, 255, 255, 0.02);
        padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
        align-items: flex-start; flex-wrap: wrap;
      }
      .profile-avatar-zone {
        text-align: center; flex: 0 0 200px; display: flex; flex-direction: column; gap: 10px;
      }
      .profile-avatar-zone img {
        width: 100%; height: 200px; object-fit: cover; border-radius: 12px;
        border: 2px solid #00b4d8; box-shadow: 0 0 20px rgba(0,180,216,0.3);
      }
      .profile-avatar-meta {
        background: rgba(0, 180, 216, 0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(0, 180, 216, 0.2);
      }
      .profile-info-grid {
        flex: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; min-width: 280px;
      }
      @media (max-width: 650px) { 
        .profile-card-container { flex-direction: column; align-items: center; }
        .profile-info-grid { grid-template-columns: 1fr; width: 100%; }
        .profile-avatar-zone { flex: 1; width: 100%; max-width: 220px; }
      }
      .info-badge-item {
        background: rgba(11, 15, 25, 0.6); padding: 10px 14px; border-radius: 8px;
        border-left: 3px solid #00b4d8; box-shadow: inset 0 0 8px rgba(0,0,0,0.2);
      }
      .info-badge-item small { display: block; color: #8892b0; font-size: 10.5px; text-transform: uppercase; margin-bottom: 2px; font-weight: 600;}
      .info-badge-item p { margin: 0; font-size: 13.5px; font-weight: 600; color: #f1f5f9; word-break: break-all;}
      
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
    
    <!-- সার্চ ও ফিল্টার হাব -->
    <div class="cyber-glass" style="margin-bottom:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
      <input type="text" id="memberSearchInput" class="cyber-input" placeholder="নাম, নিবন্ধন নাম্বার, মোবাইল বা ইমেইল লিখে সদস্য খুঁজুন..." style="margin:0; flex:1; min-width:250px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
      
      <select id="memberStatusFilter" class="cyber-input" style="margin:0; width:160px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
        <option value="all">সকল স্ট্যাটাস</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="export-btn btn-excel" id="exportExcelBtn"><i class="fas fa-file-excel"></i> Excel ডাউনলোড (All Data)</button>
        <button class="export-btn btn-pdf" id="exportAllPdfBtn"><i class="fas fa-file-pdf"></i> PDF ডাউনলোড (Table Info)</button>
      </div>
    </div>

    <!-- ডাটা টেবিল কন্টেইনার -->
    <div class="cyber-glass" style="overflow-x:auto; padding:5px; border-radius:8px;">
      <table id="mainMembersDataTable" style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left; color:#e5e7eb;">
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

    <!-- সদস্য প্রোফাইলের সম্পূর্ণ বিবরণ পপআপ মডাল -->
    <div class="nexus-modal" id="memberDetailsModal" style="display:none;">
      <div class="modal-body cyber-glass">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,180,216,0.3); padding-bottom:12px; margin-bottom:20px;">
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

    <!-- নতুন সদস্য যুক্ত করার প্রিমিয়াম মডাল ফর্ম পপআপ -->
    <div class="nexus-modal" id="createMemberModal" style="display:none;">
      <div class="modal-body cyber-glass" style="max-width: 700px;">
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
            <div class="form-group"><label>হোয়াটসঅ্যাপ নম্বর</label><input type="text" id="fmWhatsapp" class="cyber-input" placeholder="017XXXXXXXX"></div>
            <div class="form-group"><label>ফেসবুক আইডি লিংক</label><input type="url" id="fmFacebook" class="cyber-input" placeholder="https://facebook.com/username"></div>
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

    <!-- ব্যাকগ্রাউন্ড হিডেন কন্টেইনার (পিডিএফ রেন্ডারিং এরিয়া) -->
    <div id="hiddenPdfRenderArea" style="position: absolute; left: -9999px; top: -9999px; width: 210mm; overflow: hidden;"></div>
  `;

  // এলিমেন্ট রেফারেন্সসমূহ
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');
  const tbody = document.getElementById('memberTableBody');
  const detailsModal = document.getElementById('memberDetailsModal');
  const createModal = document.getElementById('createMemberModal');
  const fmRoleSelect = document.getElementById('fmRole');
  let selectedMemberForForm = null;

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

  let roleOptionsHtml = "";
  for (const [key, val] of Object.entries(roleLabels)) {
    roleOptionsHtml += `<option value="${key}">${val}</option>`;
  }
  fmRoleSelect.innerHTML = roleOptionsHtml;

  // ৩. রিয়াল-টাইম ফায়ারবেস লিসেনার
  onSnapshot(collection(db, "users"), (snap) => {
    localMembersArray = [];
    snap.forEach(userDoc => {
      if (userDoc.data().role !== 'super_admin') {
        localMembersArray.push({ id: userDoc.id, ...userDoc.data() });
      }
    });

    localMembersArray.sort((a, b) => {
      const idA = a.memberId || "ZZZZ";
      const idB = b.memberId || "ZZZZ";
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });

    renderFilteredMembers();
  });

  // ৪. ড্যাশবোর্ড ডাটা টেবিল রেন্ডার
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

    // ৫. বিস্তারিত বোতাম অ্যাকশন পপআপ রেন্ডার
    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const member = localMembersArray.find(m => m.id === id);
      if (!member) return;
      selectedMemberForForm = member;

      let joiningDateTime = "N/A";
      if (member.createdAt) {
        joiningDateTime = new Date(member.createdAt).toLocaleString('bn-BD');
      }

      document.getElementById('modalMemberCardContent').innerHTML = `
        <div class="profile-card-container">
          <div class="profile-avatar-zone">
            <img src="${member.photoUrl || 'https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png'}">
            <div class="profile-avatar-meta">
              <div style="font-size: 13px; color: #fbbf24; font-weight: bold; font-family: monospace;">${member.memberId || '⏳ PENDING'}</div>
              <div style="font-size: 12px; color: #fff; font-weight: 600; margin-top: 3px; word-break: break-all;">${member.englishName || 'N/A'}</div>
            </div>
          </div>
          
          <div class="profile-info-grid">
            <div class="info-badge-item"><small>সদস্যের নাম (বাংলা)</small><p>${member.banglaName || 'N/A'}</p></div>
            <div class="info-badge-item"><small>মোবাইল নম্বর</small><p>${member.mobileNumber || 'N/A'}</p></div>
            <div class="info-badge-item"><small>হোয়াটসঅ্যাপ নম্বর</small><p>${member.whatsappNumber || 'N/A'}</p></div>
            <div class="info-badge-item"><small>লিঙ্গ (Gender)</small><p>${member.gender || 'N/A'}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>ইমেইল এড্রেস</small><p style="color:#00b4d8;">${member.email || 'N/A'}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>ফেসবুক আইডি লিংক</small><p>${member.facebookUrl ? `<a href="${member.facebookUrl}" target="_blank" style="color:#fbbf24; text-decoration:none;"><i class="fab fa-facebook"></i> ${member.facebookUrl}</a>` : 'N/A'}</p></div>
            <div class="info-badge-item"><small>সদস্য হওয়ার তারিখ ও সময়</small><p style="color:#1f804b; font-size:12.5px;">${joiningDateTime}</p></div>
            <div class="info-badge-item"><small>জন্ম তারিখ</small><p>${member.dob || 'N/A'}</p></div>
            <div class="info-badge-item"><small>পিতার নাম</small><p>${member.fatherName || 'N/A'}</p></div>
            <div class="info-badge-item"><small>মাতার নাম</small><p>${member.motherName || 'N/A'}</p></div>
            <div class="info-badge-item"><small>NID / জন্ম নিবন্ধন</small><p>${member.nidOrBrn || 'N/A'}</p></div>
            <div class="info-badge-item"><small>পেশা</small><p>${member.profession || 'N/A'}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>শিক্ষা প্রতিষ্ঠান / কর্মস্থল</small><p>${member.institution || 'N/A'}</p></div>
            <div class="info-badge-item"><small>শিক্ষাগত যোগ্যতা</small><p>${member.education || 'N/A'}</p></div>
            <div class="info-badge-item"><small>শিক্ষাবর্ষ (Academic Year)</small><p>${member.academicYear || 'N/A'}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>সিস্টেম পদবি (Current Role)</small><p style="color: #fbbf24; text-transform: uppercase;">${roleLabels[member.role] || member.role}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>বর্তমান ঠিকানা</small><p style="font-size:12.5px; line-height:1.4;">${member.presentAddress || 'N/A'}</p></div>
            <div class="info-badge-item" style="grid-template-columns: span 2;"><small>স্থায়ী ঠিকানা</small><p style="font-size:12.5px; line-height:1.4;">${member.permanentAddress || 'N/A'}</p></div>
          </div>
        </div>
      `;
      detailsModal.style.display = 'flex';
    }));

    // ডিলিট বোতাম হ্যান্ডলার
    document.querySelectorAll('.btn-delete-mem').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("🚨 আপনি কি নিশ্চিত? এই সদস্য ডাটাবেজ থেকে চিরতরে মুছে যাবে!")) {
        await deleteDoc(doc(db, "users", id));
        alert("সদস্য সফলভাবে ডিলিট হয়েছে।");
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
          updateData.memberId = await generateNextMemberId(getDocs, collection, db);
        }
        await updateDoc(doc(db, "users", id), updateData);
        alert("স্ট্যাটাস সফলভাবে আপডেট হয়েছে।");
      }
      e.target.value = "";
    }));

    // রোল চেঞ্জার হ্যান্ডলার
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

  async function generateNextMemberId(getDocs, collection, db) {
    const currentYear = new Date().getFullYear();
    const querySnapshot = await getDocs(collection(db, "users"));
    let maxSerial = 0;
    
    querySnapshot.forEach((doc) => {
      const mId = doc.data().memberId;
      if (mId && mId.startsWith(`ROS-${currentYear}-`)) {
        const parts = mId.split('-');
        if (parts.length === 3) {
          const serialNum = parseInt(parts[2], 10);
          if (!isNaN(serialNum) && serialNum > maxSerial) {
            maxSerial = serialNum;
          }
        }
      }
    });
    return `ROS-${currentYear}-${String(maxSerial + 1).padStart(4, '0')}`;
  }

  // 📊 ৬. এক্সেল ফাইল এক্সপোর্ট লজিক
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    if (!window.XLSX || localMembersArray.length === 0) return;
    const excelRows = localMembersArray.map((m, idx) => ({
      "SL": idx + 1,
      "Member ID": m.memberId || "Pending",
      "Full Name (English)": m.englishName || "",
      "Name (Bangla)": m.banglaName || "",
      "Mobile Number": m.mobileNumber || "",
      "WhatsApp Number": m.whatsappNumber || "",
      "Email Address": m.email || "",
      "Facebook Profile": m.facebookUrl || "",
      "Father's Name": m.fatherName || "",
      "Mother's Name": m.motherName || "",
      "Date of Birth": m.dob || "",
      "Gender": m.gender || "",
      "NID / BRN": m.nidOrBrn || "",
      "Profession": m.profession || "",
      "Institution": m.institution || "",
      "Education": m.education || "",
      "Academic Year": m.academicYear || "",
      "Assigned Role": roleLabels[m.role] || m.role,
      "Current Status": m.status || "pending",
      "Present Address": m.presentAddress || "",
      "Permanent Address": m.permanentAddress || "",
      "Joining Date Time": m.createdAt ? new Date(m.createdAt).toLocaleString() : ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ROS All Members");
    XLSX.writeFile(workbook, `ROS_Complete_Database.xlsx`);
  });

  // 📄 ৭. এক্সেল বাটনের ডানপাশের পিডিএফ বাটন হ্যান্ডলার (নির্দিষ্ট কলাম ফরম্যাটে টেবিল এক্সপোর্ট)
  document.getElementById('exportAllPdfBtn').addEventListener('click', () => {
    if (!window.html2pdf || localMembersArray.length === 0) return;
    
    const renderTarget = document.getElementById('hiddenPdfRenderArea');
    
    let tableRowsHtml = "";
    localMembersArray.forEach((m) => {
      const accountTime = m.createdAt ? new Date(m.createdAt).toLocaleString('bn-BD', {hour12: true}) : "N/A";
      tableRowsHtml += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center;"><input type="checkbox" style="transform: scale(1.1);"></td>
          <td style="padding: 8px; font-weight: bold; color: #0077b6;">${m.memberId || '⏳ Pending'}</td>
          <td style="padding: 8px; font-weight: 500;">${m.englishName || 'N/A'}</td>
          <td style="padding: 8px;">${m.mobileNumber || 'N/A'}</td>
          <td style="padding: 8px; font-size: 11px; max-width: 150px; word-break: break-all;">${m.email || 'N/A'}</td>
          <td style="padding: 8px; font-size: 11px; color: #555;">${accountTime}</td>
        </tr>
      `;
    });

    renderTarget.innerHTML = `
      <div id="tablePdfPrintWrapper" style="padding: 15px; font-family: 'Segoe UI', Roboto, sans-serif; color: #333; background: #fff;">
        <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #00b4d8; padding-bottom: 10px;">
          <h2 style="margin: 0; color: #0077b6; font-size: 20px;">Rajshahi Olympiad Society (ROS)</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666; font-weight: 600;">সদস্য ডাটাবেজ অফিশিয়াল রেকর্ড রিপোর্ট</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #f2f2f2; border-bottom: 2px solid #aaa;">
              <th style="padding: 10px 8px; text-align: center; width: 8%;">চেক বক্স</th>
              <th style="padding: 10px 8px; width: 18%;">নিবন্ধন নাম্বার</th>
              <th style="padding: 10px 8px; width: 22%;">ইংরেজি নাম</th>
              <th style="padding: 10px 8px; width: 16%;">মোবাইল নম্বর</th>
              <th style="padding: 10px 8px; width: 20%;">ইমেইল এড্রেস</th>
              <th style="padding: 10px 8px; width: 16%;">অ্যাকাউন্ট খোলার সময়</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 10px; color: #777; border-top: 1px dashed #ccc; padding-top: 8px;">
          <div>রিপোর্ট তৈরির সময়: ${new Date().toLocaleString('bn-BD')}</div>
          <div>Developed By, Utsab Sarker</div>
        </div>
      </div>
    `;

    const opt = {
      margin: 8,
      filename: `ROS_Members_Custom_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().from(document.getElementById('tablePdfPrintWrapper')).set(opt).save().then(() => {
      renderTarget.innerHTML = "";
    });
  });

  // 💎 ৮. একক মেম্বার ফর্ম পিডিএফ ডাউনলোড (অপ্টিমাইজড ওয়াটারমার্ক ও নতুন সাইন-লাইন লেআউট)
  document.getElementById('downloadFormPdfBtn').addEventListener('click', () => {
    if (!selectedMemberForForm || !window.html2pdf || !window.QRCode) return;
    
    const m = selectedMemberForForm;
    const renderTarget = document.getElementById('hiddenPdfRenderArea');
    
    // রেজিস্ট্রেশনের তারিখ ফরম্যাটিং
    let registrationDateStr = "N/A";
    if (m.createdAt) {
      registrationDateStr = new Date(m.createdAt).toLocaleDateString('bn-BD');
    }

    renderTarget.innerHTML = `
      <div id="pdfAbsoluteContainer" style="width: 210mm; height: 295mm; background: #ffffff; color: #0f172a; position: relative; box-sizing: border-box; overflow: hidden; padding: 0; margin: 0;">
        
        <!-- থিম ওরিয়েন্টেড গ্ল্যামারাস বর্ডার লাইন -->
        <div style="position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; border: 2px solid #00b4d8; border-radius: 10px; pointer-events: none; z-index: 5;"></div>
        <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 1px dashed #b45309; border-radius: 8px; pointer-events: none; z-index: 5;"></div>
        
        <!-- 🎯 ওয়াটারমার্ক লোগো (html2canvas কমপ্লায়েন্ট ইন্টিগ্রেটেড লেয়ার) -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-20%, -20%); width: 500px; height: 500px; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; opacity: 0.08;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 100%; height: auto; display: block;">
        </div>

        <div style="position: relative; z-index: 2; padding: 14mm 15mm; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          <div>
            <!-- হেডার এনভায়রনমেন্ট -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00b4d8; padding-bottom: 12px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="height: 55px; object-fit: contain;">
                <div style="text-align: left;">
                  <h1 style="color: #0077b6; font-size: 19px; margin: 0; font-weight: 700; letter-spacing: 0.5px; font-family: Arial, sans-serif;">MEMBER REGISTRATION REGISTRY</h1>
                  <p style="color: #00b4d8; font-size: 11px; margin: 1px 0 0 0; font-weight: 600; letter-spacing: 0.5px;">RAJSHAHI OLYMPIAD SOCIETY (ROS)</p>
                </div>
              </div>
              <img src="${m.photoUrl || 'https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png'}" style="width: 85px; height: 105px; object-fit: cover; border: 2px solid #00b4d8; border-radius: 5px; background: #f8fafc;">
            </div>

            <!-- সুবিন্যস্ত ডাটা টেবিল বক্স কন্টেইনার -->
            <div style="background: rgba(255, 255, 255, 0.85); border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: rgba(0, 180, 216, 0.08); padding: 6px 12px; font-weight: bold; color: #0077b6; font-size: 12px; border-bottom: 1px solid #cbd5e1; letter-spacing: 0.5px;">SECURE PROFILE CREDENTIALS DATA-NODE</div>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #334155;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; width: 32%; font-weight: 600; color: #0077b6;">Registration Date:</td>
                  <td style="padding: 7px 12px; font-weight: bold; color: #0f172a;">${registrationDateStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Registration ID:</td>
                  <td style="padding: 7px 12px; font-weight: bold; color: #b45309;">${m.memberId || 'ROS-PENDING'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Full Name (English):</td>
                  <td style="padding: 7px 12px; font-weight: bold;">${m.englishName || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">সদস্যের নাম (বাংলা):</td>
                  <td style="padding: 7px 12px; font-weight: 600;">${m.banglaName || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Mobile Number:</td>
                  <td style="padding: 7px 12px; font-weight: 600;">${m.mobileNumber || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">WhatsApp Number:</td>
                  <td style="padding: 7px 12px;">${m.whatsappNumber || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Email Address:</td>
                  <td style="padding: 7px 12px; font-weight: 600; color: #0077b6;">${m.email || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Facebook Profile Link:</td>
                  <td style="padding: 7px 12px; font-size: 10px; word-break: break-all; color: #1e40af;">${m.facebookUrl || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">পিতার নাম (Father's Name):</td>
                  <td style="padding: 7px 12px;">${m.fatherName || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">মাতার নাম (Mother's Name):</td>
                  <td style="padding: 7px 12px;">${m.motherName || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">জন্ম তারিখ & লিঙ্গ:</td>
                  <td style="padding: 7px 12px;">${m.dob || 'N/A'} | ${m.gender || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">NID / Birth Registration:</td>
                  <td style="padding: 7px 12px;">${m.nidOrBrn || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">পেশা ও শিক্ষা প্রতিষ্ঠান:</td>
                  <td style="padding: 7px 12px;">${m.profession || 'N/A'} - ${m.institution || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">যোগ্যতা & শিক্ষাবর্ষ:</td>
                  <td style="padding: 7px 12px;">${m.education || 'N/A'} (${m.academicYear || 'N/A'})</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">সংগঠন পদবি (Role):</td>
                  <td style="padding: 7px 12px; font-weight: bold; color: #0077b6; text-transform: uppercase;">${roleLabels[m.role] || m.role}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Present Address:</td>
                  <td style="padding: 7px 12px; line-height: 1.3;">${m.presentAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 12px; border-right: 1px solid #e2e8f0; color: #0077b6; font-weight: 600;">Permanent Address:</td>
                  <td style="padding: 7px 12px; line-height: 1.3;">${m.permanentAddress || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <!-- নিয়মাবলী ও অঙ্গীকারনামা ব্লক -->
            <div style="margin-top: 10px; background: rgba(248, 250, 252, 0.9); border: 1px dashed #cbd5e1; padding: 8px 12px; border-radius: 6px;">
              <h4 style="margin: 0 0 4px 0; font-size: 10.5px; color: #0f172a; font-weight: bold;"><i class="fas fa-gavel"></i> সাধারণ শর্তাবলী ও সদস্য অঙ্গীকারনামা:</h4>
              <ol style="margin: 0; padding-left: 14px; font-size: 9.5px; color: #475569; line-height: 1.35; text-align: justify;">
                <li>আমি সাক্ষ্য দিচ্ছি যে এই Forমে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য। কোনো তথ্য অসত্য প্রমাণিত হলে সংগঠন আমার মেম্বারশিপ বাতিল করার অধিকার রাখে।</li>
                <li>রাজশাহী অলিম্পিয়াড সোসাইটি (ROS)-এর সকল গঠনতান্ত্রিক নিয়ম, শৃঙ্খলা, আদর্শ এবং পরিচালনা পর্ষদের সিদ্ধান্তসমূহ সর্বদা মেনে চলতে আমি বাধ্য থাকব।</li>
                <li>সংগঠনের কোনো গোপন নথিপত্র, ডাটাবেজ কিংবা অভ্যন্তরীণ সিদ্ধান্ত কর্তৃপক্ষের অনুমতি ছাড়া বাহিরে প্রকাশ বা শেয়ার করা সম্পূর্ণ নিষিদ্ধ।</li>
                <li>সংগঠনের সুনাম ক্ষুণ্ন হয় এমন কোনো রাষ্ট্রবিরোধী বা শৃঙ্খলা পরিপন্থী কর্মকাণ্ডে লিপ্ত হলে তাৎক্ষণিকভাবে সদস্যপদ বাতিল করা হবে।</li>
              </ol>
            </div>
          </div>

          <!-- বটম কিউআর এবং সাইন জোন -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px;">
              <div>
                <div id="formQrCodeContainer" style="background: #fff; padding: 4px; border: 1px solid #cbd5e1; display: inline-block;"></div>
                <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;" id="pdfTimestampArea"></div>
              </div>
              

              <!-- ✍️ কর্তৃপক্ষের স্বাক্ষর (ডানপাশে) -->
              <div style="text-align: center; width: 150px;">
                <div style="border-top: 1.5px solid #475569; width: 100%;"></div>
                <div style="font-size: 10px; color: #0f172a; font-weight: bold; margin-top: 3px;">Authorized Signature</div>
                <div style="font-size: 8px; color: #64748b;">Rajshahi Olympiad Society</div>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #94a3b8;">
              <div>CRITICAL PRIVACY NODE // GENERATED VIA ROS NEXUS BACKEND</div>
              <div style="font-weight: 600; color: #00b4d8;">Developed By, Utsab Sarker</div>
            </div>
          </div>
        </div>
      </div>
    `;

    new QRCode(document.getElementById("formQrCodeContainer"), {
      text: `https://ros-user-panel.vercel.app/member/${m.memberId || 'Pending'}`,
      width: 65, height: 65
    });

    document.getElementById("pdfTimestampArea").innerText = "রেজিস্ট্রি লগ: " + new Date().toLocaleString('bn-BD');

    const element = document.getElementById('pdfAbsoluteContainer');
    html2pdf().set({
      margin: 0,
      filename: `ROS_Official_Form_${m.memberId || 'Pending'}.pdf`,
      html2canvas: { scale: 2.5, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(element).save().then(() => {
      renderTarget.innerHTML = "";
    });
  });

  // ৯. ম্যানুয়াল এন্ট্রি মডাল পপআপ কন্ট্রোল লজিক
  document.getElementById('openCreateMemberModalBtn').addEventListener('click', () => {
    document.getElementById('newMemberForm').reset();
    createModal.style.display = 'flex';
  });

  const closeCreateModal = () => { createModal.style.display = 'none'; };
  document.getElementById('closeCreateModalBtn').addEventListener('click', closeCreateModal);
  document.getElementById('closeCreateModalBtnTop').addEventListener('click', closeCreateModal);

  document.getElementById('newMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const generatedId = await generateNextMemberId(getDocs, collection, db);

    try {
      await addDoc(collection(db, "users"), {
        englishName: document.getElementById('fmName').value.trim(),
        mobileNumber: document.getElementById('fmMobile').value.trim(),
        email: document.getElementById('fmEmail').value.trim() || "",
        banglaName: document.getElementById('fmNameBn').value.trim() || "",
        whatsappNumber: document.getElementById('fmWhatsapp').value.trim() || "",
        facebookUrl: document.getElementById('fmFacebook').value.trim() || "",
        fatherName: document.getElementById('fmFather').value.trim() || "",
        motherName: document.getElementById('fmMother').value.trim() || "",
        dob: document.getElementById('fmDob').value || "",
        gender: document.getElementById('fmGender').value || "",
        nidOrBrn: document.getElementById('fmNid').value.trim() || "",
        profession: document.getElementById('fmProfession').value.trim() || "",
        institution: document.getElementById('fmInstitution').value.trim() || "",
        education: document.getElementById('fmEducation').value.trim() || "",
        academicYear: document.getElementById('fmAcademicYear').value.trim() || "",
        role: document.getElementById('fmRole').value || "general_member",
        status: "active",
        memberId: generatedId,
        presentAddress: document.getElementById('fmPresentAddr').value.trim() || "",
        permanentAddress: document.getElementById('fmPermanentAddr').value.trim() || "",
        createdAt: new Date().toISOString()
      });
      
      alert(`🎉 সফলভাবে নতুন সদস্য যুক্ত হয়েছে!\nমেম্বার আইডি: ${generatedId}`);
      closeCreateModal();
    } catch (err) {
      console.error(err);
      alert("ডাটা সংরক্ষণ করতে সমস্যা হয়েছে!");
    }
  });

  const closeDetails = () => { detailsModal.style.display = 'none'; selectedMemberForForm = null; };
  document.getElementById('closeMemberModalBtn').addEventListener('click', closeDetails);
  document.getElementById('closeMemberModalBtnTop').addEventListener('click', closeDetails);

  searchInput.addEventListener('input', renderFilteredMembers);
  statusFilter.addEventListener('change', renderFilteredMembers);
}
