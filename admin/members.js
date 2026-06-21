let localMembersArray = []; // লোকাল ক্যাশ ভ্যারিয়েবল

// এক্সটার্নাল ডিপেন্ডেন্সি লাইব্রেরি স্বয়ংক্রিয়ভাবে লোড করার ফাংশন
function injectRequiredLibraries() {
  if (!window.XLSX) {
    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    document.head.appendChild(xlsxScript);
  }
  if (!window.jspdf) {
    const jspdfScript = document.createElement('script');
    jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(jspdfScript);
  }
  if (!window.jsPDFInvoiceTemplate) {
    const autoTableScript = document.createElement('script');
    autoTableScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js";
    document.head.appendChild(autoTableScript);
  }
}

function loadMembersModule(contentRoot, db, collection, onSnapshot, doc, getDocs, addDoc, updateDoc, deleteDoc) {
  // লাইব্রেরি ইঞ্জেক্ট করুন
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
      <input type="text" id="memberSearchInput" class="cyber-input" placeholder="নাম, আইডি, মোবাইল বা ইমেইল লিখে সদস্য খুঁজুন..." style="margin:0; flex:1; min-width:250px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
      
      <select id="memberStatusFilter" class="cyber-input" style="margin:0; width:160px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
        <option value="all">সকল স্ট্যাটাস</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>

      <div style="display:flex; gap:10px;">
        <button class="export-btn btn-excel" id="exportExcelBtn"><i class="fas fa-file-excel"></i> Excel ডাউনলোড</button>
        <button class="export-btn btn-pdf" id="exportPdfBtn"><i class="fas fa-file-pdf"></i> PDF ডাউনলোড</button>
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
  `;

  // এলিমেন্ট রেফারেন্সসমূহ
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');
  const tbody = document.getElementById('memberTableBody');
  const detailsModal = document.getElementById('memberDetailsModal');
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

  // ৩. রিয়েল-টাইম ফায়ারবেস লিসেনার (Super Admin বাদে বাকিদের ক্যাশ করবে)
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
      
      let statusColor = u.status === 'active' ? '#00b4d8' : (u.status === 'suspended' ? '#ff4d6d' : (u.status === 'pending' ? '#fbbf24' : '#9ca3af'));

      // ড্রপডাউন রোল অপশন স্ট্রিং জেনারেট করুন
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
            <button class="cyber-input btn-view" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:rgba(0,180,216,0.15); color:#00b4d8; border:1px solid #00b4d8; margin:0; border-radius:4px; cursor:pointer;" title="বিস্তারিত প্রোফাইল"><i class="fas fa-eye"></i> বিস্তারিত</button>
            
            <select class="cyber-input erp-status-changer" data-id="${u.id}" style="width:auto; margin:0; padding:5px; font-size:12px; background:#0b0f19; color:#fff; border:1px solid rgba(255,255,255,0.1); height:30px; border-radius:4px;">
              <option value="">স্ট্যাটাস পরিবর্তন</option>
              <option value="active" ${u.status === 'active' ? 'disabled':''}>Active / Approve</option>
              <option value="suspended" ${u.status === 'suspended' ? 'disabled':''}>Suspend</option>
              <option value="inactive" ${u.status === 'inactive' ? 'disabled':''}>Inactive</option>
              <option value="pending" ${u.status === 'pending' ? 'disabled':''}>Pending</option>
            </select>
            
            <button class="cyber-input btn-delete-mem" data-id="${u.id}" style="width:auto; padding:6px 12px; font-size:12px; background:#ff4d6d; color:#fff; border:none; margin:0; border-radius:4px; cursor:pointer;" title="মুছে ফেলুন"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // ইভেন্ট লিসেনার বাইন্ডিং - বিস্তারিত পপআপ ভিউ
    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const member = localMembersArray.find(m => m.id === id);
      if (!member) return;
      selectedMemberForForm = member;

      document.getElementById('modalMemberCardContent').innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${member.photoUrl || '../placeholder.png'}" style="width:100px; height:100px; object-fit:cover; border-radius:50%; border:2px solid #00b4d8; box-shadow:0 0 15px rgba(0,180,216,0.2);">
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

    // ইভেন্ট লিসেনার বাইন্ডিং - সরাসরি ইউজার ডিলিট
    document.querySelectorAll('.btn-delete-mem').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("🚨 আপনি কি নিশ্চিত? এই সদস্যের প্রোফাইল ডাটাবেজ থেকে চিরতরে মুছে যাবে!")) {
        try {
          await deleteDoc(doc(db, "users", id));
          alert("সদস্য সফলভাবে ডাটাবেজ থেকে ডিলিট হয়েছে।");
        } catch (err) {
          console.error(err);
          alert("ডিলিট করতে সমস্যা হয়েছে!");
        }
      }
    }));

    // ইভেন্ট লিসেনার বাইন্ডিং - রিয়েল-টাইম স্ট্যাটাস চেঞ্জার লজিক
    document.querySelectorAll('.erp-status-changer').forEach(s => s.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      if (!newStatus) return;

      if (confirm(`আপনি কি সদস্যের স্ট্যাটাস পরিবর্তন করে "${newStatus.toUpperCase()}" করতে চান?`)) {
        const updateData = { status: newStatus };
        const currentMem = localMembersArray.find(m => m.id === id);
        
        // অনুমোদন বা একটিভ করার সময় যদি অলরেডি কোনো মেম্বার আইডি না থাকে তবে অটো আইডি জেনারেশন
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

    // ইভেন্ট লিসেনার বাইন্ডিং - লিমিট ভ্যালিডেশন সহ রোল কন্ট্রোল
    document.querySelectorAll('.erp-role-changer').forEach(rc => rc.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const targetRole = e.target.value;
      const currentMem = localMembersArray.find(m => m.id === id);

      if (!targetRole) return;

      // লিমিটেড রোলের জন্য কাউন্ট চেক
      if (roleLimits[targetRole]) {
        const currentLimit = roleLimits[targetRole];
        const activeCount = localMembersArray.filter(m => m.role === targetRole && m.id !== id).length;

        if (activeCount >= currentLimit) {
          alert(`🚨 রোল পরিবর্তন ব্যর্থ! ডাটাবেজে "${roleLabels[targetRole]}" পদবিতে সর্বোচ্চ ${currentLimit} জন থাকতে পারবেন। ইতিমধ্যে সীমা পূর্ণ।`);
          e.target.value = currentMem.role || "general_member";
          return;
        }
      }

      if (confirm(`আপনি কি এই সদস্যের পদবি পরিবর্তন করে "${roleLabels[targetRole]}" করতে চান?`)) {
        try {
          await updateDoc(doc(db, "users", id), { role: targetRole });
          alert("পদবি সফলভাবে ফায়ারবেসে পরিবর্তন করা হয়েছে।");
        } catch (err) {
          console.error(err);
          alert("রোল আপডেট করতে ব্যর্থ!");
        }
      } else {
        e.target.value = currentMem.role || "general_member";
      }
    }));
  }

  // ৫. এক্সেল ফাইল এক্সপোর্ট লজিক (Excel ডাউনলোড)
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    if (!window.XLSX) {
      alert("এক্সেল লাইব্রেরি লোড হচ্ছে, ১ সেকেন্ড পর আবার চেষ্টা করুন!");
      return;
    }
    if (localMembersArray.length === 0) {
      alert("এক্সেল এক্সপোর্ট করার মত কোনো ডাটা নেই!");
      return;
    }

    const excelRows = localMembersArray.map((m, index) => ({
      "Serial": index + 1,
      "Member ID": m.memberId || "Pending",
      "Full Name (EN)": m.englishName || "",
      "Name (BN)": m.banglaName || "",
      "Mobile": m.mobileNumber || "",
      "WhatsApp": m.whatsappNumber || "",
      "Email": m.email || "",
      "Father Name": m.fatherName || "",
      "Mother Name": m.motherName || "",
      "DOB": m.dob || "",
      "Gender": m.gender || "",
      "NID or BRN": m.nidOrBrn || "",
      "Profession": m.profession || "",
      "Institution": m.institution || "",
      "Education": m.education || "",
      "Academic Year": m.academicYear || "",
      "Role Label": roleLabels[m.role] || m.role,
      "Status": m.status || "pending",
      "Present Address": m.presentAddress || "",
      "Permanent Address": m.permanentAddress || "",
      "Created At": m.createdAt || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Members");
    XLSX.writeFile(workbook, `ROS_All_Members_Database_${new Date().toISOString().slice(0,10)}.xlsx`);
  });

  // ৬. সকল সদস্যের টেবিল ভিত্তিক পিডিএফ এক্সপোর্ট (PDF ডাউনলোড)
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (!window.jspdf) {
      alert("পিডিএফ ইঞ্জিন লোড হচ্ছে, আবার চেষ্টা করুন!");
      return;
    }
    if (localMembersArray.length === 0) {
      alert("পিডিএফ জেনারেট করার মত কোনো ডাটা নেই!");
      return;
    }

    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF('l', 'mm', 'a4'); // Landscape মোড

    // টাইটেল ও হেডার টেক্সট
    docPdf.setFontSize(16);
    docPdf.text("Rajshahi Olympiad Society (ROS)", 14, 15);
    docPdf.setFontSize(11);
    docPdf.text(`All Members Directory Database - Exported at: ${new Date().toLocaleString('bn-BD')}`, 14, 21);

    const tableHeaders = [["Member ID", "Full Name (EN)", "Mobile Number", "Email Address", "Designation / Role", "Status"]];
    const tableRows = localMembersArray.map(m => [
      m.memberId || "⏳ Pending",
      m.englishName || "N/A",
      m.mobileNumber || "N/A",
      m.email || "N/A",
      roleLabels[m.role] || m.role,
      String(m.status || 'pending').toUpperCase()
    ]);

    docPdf.autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: 26,
      theme: 'grid',
      headStyles: { fillColor: [0, 141, 218], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      didDrawPage: function (data) {
        // ফুটার এডিশন
        docPdf.setFontSize(8);
        docPdf.text("Developed by, Utsab Sarker", 14, docPdf.internal.pageSize.height - 10);
        docPdf.text(`Page ${data.pageNumber}`, docPdf.internal.pageSize.width - 25, docPdf.internal.pageSize.height - 10);
      }
    });

    docPdf.save(`ROS_Members_Directory_${new Date().toISOString().slice(0,10)}.pdf`);
  });

  // ৭. একক সদস্য ফরম জেনারেশন পিডিএফ লজিক (ডাউনলোড ফর্ম)
  document.getElementById('downloadFormPdfBtn').addEventListener('click', () => {
    if (!selectedMemberForForm) return;
    const m = selectedMemberForForm;

    const { jsPDF } = window.jspdf;
    const docForm = new jsPDF('p', 'mm', 'a4'); // A4 Portrait

    // থিম বর্ডার এবং ডিজাইন লাইন
    docForm.setDrawColor(0, 180, 216);
    docForm.setLineWidth(0.5);
    docForm.rect(5, 5, docForm.internal.pageSize.width - 10, docForm.internal.pageSize.height - 10); // আউটার বর্ডার

    // অফিশিয়াল টাইটেল হেডার জোন
    docForm.setFillColor(11, 15, 25);
    docForm.rect(6, 6, docForm.internal.pageSize.width - 12, 28, 'F');
    
    docForm.setTextColor(0, 180, 216);
    docForm.setFontSize(18);
    docForm.text("RAJSHAHI OLYMPIAD SOCIETY (ROS)", docForm.internal.pageSize.width / 2, 16, { align: 'center' });
    
    docForm.setTextColor(255, 255, 255);
    docForm.setFontSize(10);
    docForm.text("OFFICIAL MEMBERSHIP REGISTRATION FORM", docForm.internal.pageSize.width / 2, 23, { align: 'center' });
    docForm.text(`REGISTRATION ID: ${m.memberId || 'PENDING'}`, docForm.internal.pageSize.width / 2, 29, { align: 'center' });

    // ডাটা টেবিল বা ফরম ফিল্ড ফরম্যাট জেনারেশন (ইংরেজি ডাটা প্রিন্ট সেফটি)
    const formFields = [
      [{ content: 'Personal Matrix (ব্যক্তিগত বিবরণ)', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0,0,0] } }],
      ['Full Name (English):', m.englishName || 'N/A'],
      ['Name (Bangla Name Note):', m.banglaName || 'N/A'],
      ['Father\'s Name:', m.fatherName || 'N/A'],
      ['Mother\'s Name:', m.motherName || 'N/A'],
      ['Date of Birth (DOB):', m.dob || 'N/A'],
      ['Gender / NID-BRN:', `${m.gender || 'N/A'}  /  NID: ${m.nidOrBrn || 'N/A'}`],
      
      [{ content: 'Academic & Role Matrix (শিক্ষা ও পেশা)', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0,0,0] } }],
      ['Institution / Workplace:', m.institution || 'N/A'],
      ['Education / Profession:', `${m.education || 'N/A'}  /  ${m.profession || 'N/A'}`],
      ['Academic Session / Year:', m.academicYear || 'N/A'],
      ['Assigned Gateway Role:', roleLabels[m.role] || m.role],
      ['Account Status Level:', String(m.status || 'ACTIVE').toUpperCase()],

      [{ content: 'Communication Matrix (যোগাযোগ মাধ্যম)', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0,0,0] } }],
      ['Mobile & WhatsApp:', `${m.mobileNumber || 'N/A'}  /  ${m.whatsappNumber || 'N/A'}`],
      ['Email Address:', m.email || 'N/A'],
      ['Present Address Info:', m.presentAddress || 'N/A'],
      ['Permanent Address Info:', m.permanentAddress || 'N/A']
    ];

    docForm.autoTable({
      body: formFields,
      startY: 38,
      margin: { left: 12, right: 12 },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3.5, color: [40, 40, 40] },
      columnStyles: { 0: { width: 50, fontStyle: 'bold', fillColor: [250, 250, 250] } }
    });

    let currentY = docForm.lastAutoTable.finalY + 12;

    // শর্তাবলী জোন (Terms & Conditions)
    docForm.setTextColor(0, 0, 0);
    docForm.setFontSize(10);
    docForm.text("Membership Terms & Regulatory Declarations:", 12, currentY);
    
    docForm.setFontSize(8.5);
    docForm.setTextColor(80, 80, 80);
    const rules = [
      "1. The Authority reserves the absolute right to suspend or cancel membership at any given time without prior notice.",
      "2. Members must comply with the rules, constitution, and core values of Rajshahi Olympiad Society (ROS).",
      "3. Any anti-social or non-disciplinary activities inside or associated with the node will lead to instant termination.",
      "4. All provided profiling credentials must be legit. Fabrication of documents will trigger immediate structural blocks."
    ];
    rules.forEach(r => {
      currentY += 5;
      docForm.text(r, 14, currentY);
    });

    // স্বাক্ষর ব্লক এরিয়া (Signatures Block)
    currentY += 28;
    docForm.setDrawColor(150, 150, 150);
    docForm.setLineWidth(0.3);
    
    // বামে মেম্বার সাইন লাইন
    docForm.line(14, currentY, 64, currentY);
    docForm.setFontSize(9);
    docForm.setTextColor(50, 50, 50);
    docForm.text("Applicant's Signature", 14, currentY + 4);

    // ডানে কর্তৃপক্ষের স্বাক্ষর ও উপরে ওভারলাইন
    docForm.line(docForm.internal.pageSize.width - 64, currentY, docForm.internal.pageSize.width - 14, currentY);
    docForm.text("Authorized Signature", docForm.internal.pageSize.width - 64, currentY + 4);
    docForm.setFontSize(8);
    docForm.text("Rajshahi Olympiad Society", docForm.internal.pageSize.width - 64, currentY + 8);

    // ফুটার কন্টেন্ট ম্যাপিং (তারিখ, সময় ও ডেভেলপার ক্রেডিট)
    docForm.setFontSize(7.5);
    docForm.setTextColor(120, 120, 120);
    const dateStr = `Downloaded: ${new Date().toLocaleString('bn-BD')}`;
    docForm.text(dateStr, 12, docForm.internal.pageSize.height - 10);
    docForm.text("Developed by, Utsab Sarker", docForm.internal.pageSize.width - 48, docForm.internal.pageSize.height - 10);

    // ফাইলটি মেম্বার আইডি নামে অটো সেভ হবে
    docForm.save(`ROS_Form_${m.memberId || 'Pending'}.pdf`);
  });

  // ম্যানুয়াল মেম্বার তৈরি বাটন ট্রিক
  document.getElementById('btnManualEntry').addEventListener('click', async () => {
    const name = prompt("সদস্যের পুরো নাম (English):");
    if (!name) return;
    const mobile = prompt("মোবাইল নম্বর:");
    const email = prompt("ইমেইল এড্রেস:");
    
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
        englishName: name, mobileNumber: mobile, email: email || "", status: "active", memberId: generatedId, role: "general_member", createdAt: new Date().toISOString()
      });
      alert("সফলভাবে নতুন সাধারণ মেম্বার তৈরি হয়েছে এবং আইডি ইস্যু করা হয়েছে!");
    } catch (e) {
      console.error(e);
      alert("তৈরি করতে সমস্যা হয়েছে!");
    }
  });

  // পপআপ ক্লোজ হ্যান্ডলার
  const closeDetails = () => { detailsModal.style.display = 'none'; selectedMemberForForm = null; };
  document.getElementById('closeMemberModalBtn').addEventListener('click', closeDetails);
  document.getElementById('closeMemberModalBtnTop').addEventListener('click', closeDetails);

  // লাইভ সার্চ এবং ফিল্টারিং ইভেন্ট লিসেনার
  searchInput.addEventListener('input', renderFilteredMembers);
  statusFilter.addEventListener('change', renderFilteredMembers);
}