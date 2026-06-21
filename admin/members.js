let localMembersArray = []; // লোকাল ক্যাশ ভ্যারিয়েবল

// এক্সটার্নাল ডিপেন্ডেন্সি লাইব্রেরি স্বয়ংক্রিয়ভাবে ও সঠিকভাবে লোড করার ফাংশন
function injectRequiredLibraries() {
  if (!window.XLSX) {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    document.head.appendChild(xlsxScript);
  }
  
  // html2pdf এবং qrcode লাইব্রেরি ইজেক্ট করুন (আপনার থিমের সাথে মিল রেখে জেনারেশনের জন্য)
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
  // লাইব্রেরি সঠিকভাবে ইঞ্জেক্ট করুন
  injectRequiredLibraries();

  // ১. ড্যাশবোর্ড স্ট্রাকচার ও ইন্টারফেস রেন্ডারিং
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
        width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto;
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
      <button class="cyber-input" id="btnManualEntry" style="width:auto; margin:0; background:#fbbf24; color:#000; border:none; font-weight:bold; padding:9px 18px; border-radius:6px; cursor:pointer;">
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
        <button class="export-btn btn-excel" id="exportExcelBtn"><i class="fas fa-file-excel"></i> Excel ডাউনলোড</button>
        <button class="export-btn btn-pdf" id="exportPdfBtn"><i class="fas fa-file-pdf"></i> Directory PDF</button>
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

    <div id="hiddenPdfRenderArea" style="position: absolute; left: -9999px; top: -9999px;"></div>
  `;

  // এলিমেন্ট রেফারেন্সসমূহ
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');
  const tbody = document.getElementById('memberTableBody');
  const detailsModal = document.getElementById('memberDetailsModal');
  let selectedMemberForForm = null;

  // ২. রোল ডেফিনিশন ম্যাপিং লেবেল
  const roleLabels = {
    "general_member": "সদস্য (General Member)",
    "admin": "এডমিন (Admin)",
    "former_member": "সাবেক সদস্য",
    "president": "সভাপতি",
    "vice_president": "সহ সভাপতি",
    "general_secretary": "সাধারণ সম্পাদক",
    "joint_general_secretary": "যুগ্ম সাধারণ সম্পাদক",
    "organizing_secretary": "সাংগঠনিক সম্পাদক",
    "treasurer": "কোষაძক্ষ",
    "executive_member": "কার্যনির্বাহী সদস্য"
  };

  const roleLimits = { "president": 1, "vice_president": 1, "general_secretary": 1, "treasurer": 1 };

  // ৩. রিয়েল-টাইম ফায়ারবেস লিসেনার
  onSnapshot(collection(db, "users"), (snap) => {
    localMembersArray = [];
    snap.forEach(userDoc => {
      if (userDoc.data().role !== 'super_admin') {
        localMembersArray.push({ id: userDoc.id, ...userDoc.data() });
      }
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
      
      let statusColor = u.status === 'active' ? '#00b4d8' : (u.status === 'suspended' ? '#ff4d6d' : '#fbbf24');

      let roleOptionsHtml = "";
      for (const [key, val] of Object.entries(roleLabels)) {
        const selected = (u.role === key) ? "selected" : "";
        roleOptionsHtml += `<option value="${key}" ${selected}>${val}</option>`;
      }

      tr.innerHTML = `
        <td style="padding:14px 12px; color:#00b4d8; font-weight:bold;">${u.memberId || '⏳ Pending'}</td>
        <td style="padding:14px 12px; font-weight:600;">${u.englishName || 'N/A'}</td>
        <td style="padding:14px 12px;">${u.mobileNumber || 'N/A'}</td>
        <td style="padding:14px 12px;">
          <select class="cyber-input erp-role-changer" data-id="${u.id}" style="width:100%; max-width:180px; margin:0; padding:4px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:4px; font-size:12px;">
            ${roleOptionsHtml}
          </select>
        </td>
        <td style="padding:14px 12px;"><span style="color:${statusColor}; font-weight:bold;">● ${String(u.status || 'pending').toUpperCase()}</span></td>
        <td style="padding:14px 12px; text-align:right;">
          <div style="display:flex; gap:6px; justify-content:flex-end; align-items:center;">
            <button class="cyber-input btn-view" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:rgba(0,180,216,0.15); color:#00b4d8; border:1px solid #00b4d8; margin:0; border-radius:4px; cursor:pointer;"><i class="fas fa-eye"></i> বিস্তারিত</button>
            <select class="cyber-input erp-status-changer" data-id="${u.id}" style="width:auto; margin:0; padding:5px; font-size:12px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); height:30px; border-radius:4px;">
              <option value="">স্ট্যাটাস</option>
              <option value="active">Active</option>
              <option value="suspended">Suspend</option>
              <option value="inactive">Inactive</option>
            </select>
            <button class="cyber-input btn-delete-mem" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:#ff4d6d; color:#fff; border:none; margin:0; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // পপআপ ভিউ লজিক
    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const member = localMembersArray.find(m => m.id === id);
      if (!member) return;
      selectedMemberForForm = member;

      document.getElementById('modalMemberCardContent').innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${member.photoUrl || '../placeholder.png'}" style="width:90px; height:90px; object-fit:cover; border-radius:50%; border:2px solid #00b4d8;">
          <h4 style="margin:5px 0 0 0; color:#fff;">${member.englishName || 'N/A'}</h4>
        </div>
        <div class="grid-details">
          <div class="detail-cell"><small>Member ID</small><p>${member.memberId || '⏳ Pending'}</p></div>
          <div class="detail-cell"><small>মোবাইল নম্বর</small><p>${member.mobileNumber || 'N/A'}</p></div>
          <div class="detail-cell"><small>ইমেইল ایڈ্রেস</small><p>${member.email || 'N/A'}</p></div>
          <div class="detail-cell"><small>পেশা / পদবি</small><p>${roleLabels[member.role] || member.role}</p></div>
        </div>
      `;
      detailsModal.style.display = 'flex';
    }));

    // ফায়ারবেস অ্যাকশন বাটন হ্যান্ডলারস
    document.querySelectorAll('.btn-delete-mem').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("আপনি কি নিশ্চিত? প্রোফাইলটি চিরতরে মুছে যাবে!")) {
        await deleteDoc(doc(db, "users", id));
      }
    }));

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
  }

  // ৫. এক্সেল ফাইল এক্সপোর্ট লজিক
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    if (!window.XLSX) return;
    const excelRows = localMembersArray.map((m, index) => ({
      "Serial": index + 1, "Member ID": m.memberId || "Pending", "Name": m.englishName || "", "Mobile": m.mobileNumber || "", "Role": roleLabels[m.role] || m.role, "Status": m.status || "pending"
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, `ROS_Members_Database.xlsx`);
  });

  // ৬. ডিরেক্টরি পিডিএফ ডাউনলোড লজিক
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    alert("Directory PDF ডাউনলোডের জন্য মেম্বার ফরম ফিচারটি ব্যবহার করুন।");
  });

  // 💎 ৭. আলটিমেট ডার্ক সাইবারপাঙ্ক থিম ভিত্তিক "সদস্য ফরম ডাউনলোড" (PDF)
  document.getElementById('downloadFormPdfBtn').addEventListener('click', () => {
    if (!selectedMemberForForm) return;
    if (!window.html2pdf || !window.QRCode) {
      alert("ইঞ্জিন লাইব্রেরি লোড হচ্ছে, অনুগ্রহ করে ১ সেকেন্ড পর আবার ক্লিক করুন!");
      return;
    }
    
    const m = selectedMemberForForm;
    const renderTarget = document.getElementById('hiddenPdfRenderArea');

      // আলটিমেট পিডিএফ ডেমো টেমপ্লেটের হুবহু ডার্ক ক্লোন জেনারেশন কোড
    renderTarget.innerHTML = `
      <div id="captureContainer" style="width: 210mm; height: 297mm; background: linear-gradient(135deg, #020c1b, #08172d); color: #f1f5f9; font-family: 'Poppins', sans-serif; position: relative; padding: 20px; box-sizing: border-box;">
        <div style="position: absolute; inset: 6mm; border: 2px solid rgba(0,180,216,.5); border-radius: 12px; pointer-events: none;"></div>
        
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 1;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 65%; opacity: .06;">
        </div>

        <div style="position: relative; z-index: 2; padding: 10mm; height: 100%; box-sizing: border-box;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" style="height: 55px;">
            <h1 style="color: #ffd700; font-size: 24px; margin: 5px 0 0 0; font-weight: 700; letter-spacing: 1px;">Member Information Form</h1>
            <p style="color: #94a3b8; font-size: 12px; margin: 2px 0 0 0;">Rajshahi Olympiad Society</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 15px;">
            <div style="width: 78%;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px;">
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Member ID:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px; color:#fff; font-weight:bold;">${m.memberId || 'ROS-2026-PENDING'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">System Role:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${roleLabels[m.role] || m.role || 'N/A'}</span></div>
                
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">English Name:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.englishName || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">বাংলা নাম:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.banglaName || 'N/A'}</span></div>
                
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Father's Name:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.fatherName || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Mother's Name:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.motherName || 'N/A'}</span></div>
                
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Date of Birth:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.dob || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Gender Level:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.gender || 'N/A'}</span></div>
                
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Mobile No:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.mobileNumber || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">WhatsApp No:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.whatsappNumber || 'N/A'}</span></div>
                
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Email Node:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.email || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">NID / BRN:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.nidOrBrn || 'N/A'}</span></div>

                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Education:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.education || 'N/A'}</span></div>
                <div style="font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Academic Yr:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; min-width:120px;">${m.academicYear || 'N/A'}</span></div>
              </div>

              <div style="margin-top: 15px; font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Institution:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; width: 82%;">${m.institution || 'N/A'}</span></div>
              <div style="margin-top: 10px; font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Present Address:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; width: 78%;">${m.presentAddress || 'N/A'}</span></div>
              <div style="margin-top: 10px; font-size: 13px;"><span style="color: #00b4d8; font-weight:600;">Permanent Address:</span> <span style="border-bottom: 1px dotted rgba(255,255,255,.5); padding-left:5px; display:inline-block; width: 75%;">${m.permanentAddress || 'N/A'}</span></div>
            </div>

            <img src="${m.photoUrl || 'https://i.pravatar.cc/300'}" style="width: 110px; height: 135px; object-fit: cover; border: 2px solid #00b4d8; border-radius: 8px;">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 45px;">
            <div id="formQrCodeContainer" style="background:#fff; padding:5px; border-radius:4px;"></div>

            <div style="text-align: center; width: 220px;">
              <div style="color: #00b4d8; font-size:13px; font-weight:bold;">Signed Matrix</div>
              <div style="border-top: 2px solid #ffd700; margin: 6px 0;"></div>
              <div style="font-size: 11px; color:#94a3b8;">Authorized Authority</div>
            </div>
          </div>

          <div style="margin-top: 35px; border-top: 1px solid rgba(255,255,255,.15); padding-top: 10px; font-size: 11px; color: #94a3b8; line-height: 1.6;">
            This security authentication registry was securely generated by ROS Nexus database servers. All structural criteria match cryptographic protocols. No physical signature required.
          </div>

          <div style="position: absolute; left: 10mm; right: 10mm; bottom: 5mm; display: flex; justify-content: space-between; color: #94a3b8; font-size: 10px;">
            <div id="pdfTimestampArea"></div>
            <div>Developed By, Utsab Sarker</div>
          </div>
        </div>
      </div>
    `;

    // কিউআর কোড এবং টাইমস্ট্যাম্প জেনারেট করুন
    new QRCode(document.getElementById("formQrCodeContainer"), {
      text: `https://ros-user-panel.vercel.app/member/${m.memberId || 'Pending'}`,
      width: 80, height: 80
    });

    document.getElementById("pdfTimestampArea").innerText = "System Registry: " + new Date().toLocaleString();

    // সরাসরি ডাউনলোডের এক্সিকিউশন কম্যান্ড (নো প্রিভিউ শো)
    const element = document.getElementById('captureContainer');
    html2pdf().set({
      margin: 0,
      filename: `ROS_Form_${m.memberId || 'Pending'}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] }
    }).from(element).save().then(() => {
      renderTarget.innerHTML = ""; // জেনারেশন শেষে মেমোরি ক্লিন করুন
    });
  });

  // ম্যানুয়াল সদস্য তৈরি
  document.getElementById('btnManualEntry').addEventListener('click', async () => {
    const name = prompt("সদস্যের নাম (English):");
    if (!name) return;
    const mobile = prompt("মোবাইল নম্বর:");
    
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

    await addDoc(collection(db, "users"), {
      englishName: name, mobileNumber: mobile, status: "active", memberId: generatedId, role: "general_member", createdAt: new Date().toISOString()
    });
    alert("সফলভাবে সাধারণ মেম্বার তৈরি হয়েছে!");
  });

  const closeDetails = () => { detailsModal.style.display = 'none'; selectedMemberForForm = null; };
  document.getElementById('closeMemberModalBtn').addEventListener('click', closeDetails);
  document.getElementById('closeMemberModalBtnTop').addEventListener('click', closeDetails);

  searchInput.addEventListener('input', renderFilteredMembers);
  statusFilter.addEventListener('change', renderFilteredMembers);
                                                             }
