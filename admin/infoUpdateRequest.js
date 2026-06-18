// ROS Nexus - Enterprise Admin Request Approval Module (With Cloudinary Engine & Server Timestamp)
function loadAdminRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc, collection, query, where, serverTimestamp) {
  
  // ১. এডমিন রিকোয়েস্ট ড্যাশবোর্ডের আল্ট্রা-প্রিমিয়াম সাইবারপাঙ্ক ইউআই স্টাইল ইনজেকশন
  contentRoot.innerHTML = `
    <style>
      .admin-req-container { max-width: 1200px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif; }
      
      /* প্রিমিয়াম নিয়ন ট্যাব লজিক */
      .req-tab-switcher { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid rgba(0, 180, 216, 0.2); padding-bottom: 10px; }
      .req-tab-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(0, 180, 216, 0.2); color: var(--text-muted); padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
      .req-tab-btn:hover { background: rgba(0, 180, 216, 0.05); color: #fff; }
      .req-tab-btn.active { background: rgba(0, 180, 216, 0.15); color: var(--secondary); border-color: var(--secondary); box-shadow: 0 0 15px rgba(0, 180, 216, 0.15); }
      
      /* রিকোয়েস্ট গ্রিড ও নোড কার্ড */
      .req-matrix-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; display: none; }
      .req-matrix-grid.active { display: grid; }
      
      .req-node-card { background: rgba(10, 25, 47, 0.6); border: 1px solid rgba(0, 180, 216, 0.15); border-radius: 12px; padding: 20px; position: relative; overflow: hidden; transition: 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: space-between; }
      .req-node-card:hover { border-color: var(--secondary); box-shadow: 0 0 20px rgba(0, 180, 216, 0.2); transform: translateY(-2px); }
      
      /* প্রোফাইল প্রাক-দর্শন জোন */
      .req-user-profile { display: flex; align-items: center; gap: 15px; margin-bottom: 18px; }
      .req-profile-avatar { width: 65px; height: 65px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary); background: #020c1b; padding: 3px; }
      .req-user-meta h4 { margin: 0 0 4px 0; font-size: 16px; color: #fff; font-weight: 600; }
      .req-user-meta p { margin: 0; font-size: 12.5px; color: var(--text-muted); font-weight: 500; }
      
      /* পেন্ডিং ছবি প্রিভিউ গ্রিড */
      .req-photo-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); }
      .photo-compare-box { text-align: center; }
      .photo-compare-box p { font-size: 11px; color: var(--text-muted); margin: 0 0 6px 0; text-transform: uppercase; font-weight: bold; }
      .compare-img { width: 100%; height: 110px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
      .compare-img.new-target { border-color: var(--secondary); box-shadow: 0 0 10px rgba(0, 180, 216, 0.1); }
      
      /* ডেটা টেবিল প্রিভিউ */
      .req-data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
      .req-data-table tr { border-bottom: 1px solid rgba(255,255,255,0.03); }
      .req-data-table td { padding: 8px 4px; color: #fff; }
      .req-data-table td.field-lbl { color: var(--text-muted); width: 40%; font-weight: 500; }
      .req-data-table td i { color: var(--accent); font-size: 11px; }
      
      /* অ্যাকশন বাটন প্যানেল */
      .req-action-hub { display: flex; gap: 10px; margin-top: auto; }
      .action-nexus-btn { flex: 1; padding: 10px 14px; font-size: 13px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.2s; border: none; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .btn-approve { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
      .btn-approve:hover { background: #10b981; color: #020c1b; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
      .btn-reject { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      .btn-reject:hover { background: #ef4444; color: #fff; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
      .btn-hold { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
      .btn-hold:hover { background: #f59e0b; color: #020c1b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
      
      /* এম্পটি ডাটা নোটিশ */
      .req-void-notice { grid-column: span 3; text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 15px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(0, 180, 216, 0.15); border-radius: 10px; }
      .req-void-notice i { font-size: 32px; color: var(--secondary); margin-bottom: 12px; display: block; opacity: 0.7; }

      /* গ্লোবাল মডার্ন রিজেক্ট পপ-আপ মোডাল */
      .reject-prompt-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 12, 0.85); backdrop-filter: blur(10px); z-index: 4000; display: none; align-items: center; justify-content: center; padding: 20px; }
      .reject-prompt-card { width: 100%; max-width: 440px; background: #06152d; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 25px; box-shadow: 0 0 35px rgba(239, 68, 68, 0.15); animation: nexusPop 0.25s ease-out; }
      @keyframes nexusPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .reject-prompt-card h4 { margin: 0 0 12px 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px; }
      .reject-prompt-card h4 i { color: #f87171; }
      .reject-textarea { width: 100%; height: 95px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; color: #fff; font-size: 14px; resize: none; box-sizing: border-box; margin-bottom: 20px; }
      .reject-textarea:focus { outline: none; border-color: #f87171; box-shadow: 0 0 10px rgba(239, 68, 68, 0.15); }
      .reject-modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      
      /* গ্লোবাল ডিটেইলস পপ-আপ মোডাল */
      .details-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 12, 0.85); backdrop-filter: blur(12px); z-index: 3500; display: none; align-items: center; justify-content: center; padding: 20px; }
      .details-matrix-card { width: 100%; max-width: 650px; background: #051329; border: 1px solid rgba(0, 180, 216, 0.25); border-radius: 14px; padding: 30px; box-shadow: 0 0 40px rgba(0, 180, 216, 0.15); max-height: 85vh; overflow-y: auto; box-sizing: border-box; }
      .details-matrix-card h3 { color: #fff; margin: 0 0 20px 0; border-bottom: 1px solid rgba(0, 180, 216, 0.15); padding-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
      .details-matrix-card h3 i { color: var(--secondary); }
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 25px; }
      .details-data-node { background: rgba(0,0,0,0.2); padding: 12px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); }
      .details-data-node .lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
      .details-data-node .val { font-size: 14px; color: #fff; font-weight: 600; line-height: 1.4; }
      .details-data-node .val.changed-highlight { color: var(--secondary); text-shadow: 0 0 8px rgba(0, 180, 216, 0.2); }
      .details-span-2 { grid-column: span 2; }
      .details-close-wrapper { display: flex; justify-content: flex-end; }
    </style>

    <div class="admin-req-container">
      <div class="req-tab-switcher">
        <button class="req-tab-btn active" id="tabPhotoBtn"><i class="fas fa-camera"></i> ছবি পরিবর্তনের আবেদন (<span id="photoCountLbl">0</span>)</button>
        <button class="req-tab-btn" id="tabInfoBtn"><i class="fas fa-user-edit"></i> তথ্য পরিবর্তনের আবেদন (<span id="infoCountLbl">0</span>)</button>
      </div>

      <div class="req-matrix-grid active" id="photoRequestsContainer"></div>

      <div class="req-matrix-grid" id="infoRequestsContainer"></div>
    </div>

    <div class="reject-prompt-overlay" id="globalRejectPromptModal">
      <div class="reject-prompt-card">
        <h4 id="rejectModalHeader"><i class="fas fa-exclamation-triangle"></i> আবেদন বাতিলের কারণ</h4>
        <textarea class="reject-textarea" id="rejectReasonInput" placeholder="ইউজার কেন এই আবেদনটি বাতিল করা হয়েছে তা জানতে পারবেন..."></textarea>
        <div class="reject-modal-actions">
          <button class="action-nexus-btn btn-approve" style="background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.1);" id="rejectCancelBtn">বন্ধ করুন</button>
          <button class="action-nexus-btn btn-reject" id="rejectSubmitConfirmBtn">নিশ্চিত করুন</button>
        </div>
      </div>
    </div>

    <div class="details-overlay" id="globalMatrixModal">
      <div class="details-matrix-card">
        <h3><i class="fas fa-id-card-alt"></i> পরিবর্তনসমূহের বিস্তারিত তুলনা</h3>
        <div class="details-grid" id="detailsModalGrid"></div>
        <div class="details-close-wrapper">
          <button class="action-nexus-btn btn-approve" style="max-width: 150px;" id="detailsCloseBtn">বন্ধ করুন</button>
        </div>
      </div>
    </div>
  `;

  // ২. গ্লোবাল নোড রেফারেন্স ও স্টেট ট্র্যাকিং
  const tabPhotoBtn = document.getElementById('tabPhotoBtn');
  const tabInfoBtn = document.getElementById('tabInfoBtn');
  const photoRequestsContainer = document.getElementById('photoRequestsContainer');
  const infoRequestsContainer = document.getElementById('infoRequestsContainer');
  
  const globalRejectPromptModal = document.getElementById('globalRejectPromptModal');
  const rejectModalHeader = document.getElementById('rejectModalHeader');
  const rejectReasonInput = document.getElementById('rejectReasonInput');
  const rejectCancelBtn = document.getElementById('rejectCancelBtn');
  const rejectSubmitConfirmBtn = document.getElementById('rejectSubmitConfirmBtn');

  const globalMatrixModal = document.getElementById('globalMatrixModal');
  const detailsModalGrid = document.getElementById('detailsModalGrid');
  const detailsCloseBtn = document.getElementById('detailsCloseBtn');

  let activeTargetUserId = null;
  let activeTargetActionType = null; 
  let activeTargetStatusDecision = null; 

  // Cloudinary credentials ইঞ্জিন
  async function uploadImageToCloudinary(base64Image) {
    const unsignedUploadPreset = 'Ros_uploads'; 
    const cloudinaryCloudName = 'dcmu3hius'; 
    
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`;
    
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', unsignedUploadPreset);

    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
      throw new Error('Cloudinary Upload Failed');
    }
    const data = await response.json();
    return data.secure_url; 
  }

  // ৩. নিয়ন ট্যাব সুইচিং ইভেন্ট লজিক
  tabPhotoBtn.addEventListener('click', () => {
    tabPhotoBtn.classList.add('active'); tabInfoBtn.classList.remove('active');
    photoRequestsContainer.classList.add('active'); infoRequestsContainer.classList.remove('active');
  });

  tabInfoBtn.addEventListener('click', () => {
    tabInfoBtn.classList.add('active'); tabPhotoBtn.classList.remove('active');
    infoRequestsContainer.classList.add('active'); photoRequestsContainer.classList.remove('active');
  });

  // ৪. রিয়েল-টাইম ফায়ারস্টোরে প্যারালাল কুয়েরি লুপ (Snapshot Engine)
  const usersRef = collection(db, "users");
  
  onSnapshot(query(usersRef, where("imageApprovalStatus", "==", "pending")), (snapshot) => {
    document.getElementById('photoCountLbl').innerText = snapshot.size;
    photoRequestsContainer.innerHTML = "";

    if (snapshot.empty) {
      photoRequestsContainer.innerHTML = `<div class="req-void-notice"><i class="fas fa-folder-open"></i> কোনো পেন্ডিং ছবি পরিবর্তনের আবেদন পাওয়া যায়নি।</div>`;
      return;
    }

    snapshot.forEach((userDoc) => {
      const u = userDoc.data();
      const userId = userDoc.id;

      const card = document.createElement('div');
      card.className = "req-node-card";
      card.innerHTML = `
        <div>
          <div class="req-user-profile">
            <img src="${u.photoUrl || '../placeholder.png'}" class="req-profile-avatar">
            <div class="req-user-meta">
              <h4>${u.englishName || "ROS User"}</h4>
              <p>ID: ${u.memberId || "N/A"} | Role: ${(u.role || "member").toUpperCase()}</p>
            </div>
          </div>
          <div class="req-photo-comparison">
            <div class="photo-compare-box">
              <p>বর্তমান ছবি</p>
              <img src="${u.photoUrl || '../placeholder.png'}" class="compare-img">
            </div>
            <div class="photo-compare-box">
              <p>নতুন ছবি</p>
              <img src="${u.tempPendingPhoto || '../placeholder.png'}" class="compare-img new-target">
            </div>
          </div>
        </div>
        <div class="req-action-hub">
          <button class="action-nexus-btn btn-reject btn-photo-reject" data-id="${userId}"><i class="fas fa-times"></i> বাতিল</button>
          <button class="action-nexus-btn btn-approve btn-photo-approve" data-id="${userId}"><i class="fas fa-check"></i> অনুমোদন করুন</button>
        </div>
      `;
      photoRequestsContainer.appendChild(card);
    });

    // ছবি অনুমোদন ও বাতিল হ্যান্ডলিং বাইন্ডিং
    document.querySelectorAll('.btn-photo-approve').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.target.closest('button').getAttribute('data-id');
        const userSnapshot = snapshot.docs.find(d => d.id === uid);
        if(!userSnapshot) return;
        
        const userData = userSnapshot.data();
        const base64Image = userData.tempPendingPhoto;

        if (!base64Image) {
          alert("পেন্ডিং ছবি ডাটাবেজে খুঁজে পাওয়া যায়নি!");
          return;
        }

        e.target.closest('button').innerHTML = `<i class="fas fa-spinner fa-spin"></i> আপলোড হচ্ছে...`;
        e.target.closest('button').disabled = true;

        try {
          // ব্যাকগ্রাউন্ডে Cloudinary তে আপলোড রান করা হলো
          const cloudinaryUrl = await uploadImageToCloudinary(base64Image);

          // ফায়ারবেস ডাটাবেজে ক্লাউডিনারি লিংক ও এপ্রুভ করার সার্ভার টাইমস্ট্যাম্প সহ সেভ
          await updateDoc(doc(db, "users", uid), {
            photoUrl: cloudinaryUrl,
            tempPendingPhoto: null,
            imageApprovalStatus: "approved",
            imageActionAt: serverTimestamp() // ফটো এপ্রুভ করার নির্দিষ্ট সময়
          });
          alert("🎉 ছবি সফলভাবে Cloudinary তে সেভ হয়েছে এবং প্রোফাইল আপডেট হয়েছে!");
        } catch (err) {
          console.error(err);
          alert("❌ Cloudinary-তে ছবি সংরক্ষণ করা যায়নি!");
          e.target.closest('button').innerHTML = `<i class="fas fa-check"></i> অনুমোদন করুন`;
          e.target.closest('button').disabled = false;
        }
      });
    });

    document.querySelectorAll('.btn-photo-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTargetUserId = e.target.closest('button').getAttribute('data-id');
        activeTargetActionType = "photo";
        activeTargetStatusDecision = "rejected";
        rejectModalHeader.innerHTML = `<i class="fas fa-camera"></i> ছবি পরিবর্তনের আবেদন বাতিলের কারণ`;
        rejectReasonInput.value = "";
        globalRejectPromptModal.style.display = "flex";
      });
    });
  });

  // ৫. তথ্য (Info) পরিবর্তন রিকোয়েস্ট লুপ ট্র্যাকিং
  onSnapshot(query(usersRef, where("infoApprovalStatus", "==", "pending")), (snapshot) => {
    document.getElementById('infoCountLbl').innerText = snapshot.size;
    infoRequestsContainer.innerHTML = "";

    if (snapshot.empty) {
      infoRequestsContainer.innerHTML = `<div class="req-void-notice"><i class="fas fa-folder-open"></i> কোনো পেন্ডিং তথ্য পরিবর্তনের আবেদন পাওয়া যায়নি।</div>`;
      return;
    }

    snapshot.forEach((userDoc) => {
      const u = userDoc.data();
      const userId = userDoc.id;
      const pending = u.tempPendingData || {};

      const card = document.createElement('div');
      card.className = "req-node-card";
      card.innerHTML = `
        <div>
          <div class="req-user-profile">
            <img src="${u.photoUrl || '../placeholder.png'}" class="req-profile-avatar">
            <div class="req-user-meta">
              <h4>${u.englishName || "ROS User"}</h4>
              <p>ID: ${u.memberId || "N/A"} | Mobile: ${u.mobileNumber || "N/A"}</p>
            </div>
          </div>
          <table class="req-data-table">
            ${pending.englishName && pending.englishName !== u.englishName ? `<tr><td class="field-lbl">নাম (EN)</td><td>${u.englishName || "<i>খালি</i>"} <i class="fas fa-arrow-right"></i> <b style="color:var(--secondary);">${pending.englishName}</b></td></tr>` : ''}
            ${pending.banglaName && pending.banglaName !== u.banglaName ? `<tr><td class="field-lbl">নাম (বাং)</td><td>${u.banglaName || "<i>খালি</i>"} <i class="fas fa-arrow-right"></i> <b style="color:var(--secondary);">${pending.banglaName}</b></td></tr>` : ''}
            ${pending.mobileNumber && pending.mobileNumber !== u.mobileNumber ? `<tr><td class="field-lbl">মোবাইল</td><td>${u.mobileNumber || "<i>খালি</i>"} <i class="fas fa-arrow-right"></i> <b style="color:var(--secondary);">${pending.mobileNumber}</b></td></tr>` : ''}
          </table>
          <button class="action-nexus-btn btn-photo-approve btn-info-details" data-id="${userId}" style="background:rgba(0,180,216,0.05); color:var(--secondary); border:1px solid rgba(0,180,216,0.2); margin-bottom:15px; width:100%;"><i class="fas fa-eye"></i> সমস্ত পরিবর্তন দেখুন</button>
        </div>
        <div class="req-action-hub">
          <button class="action-nexus-btn btn-reject btn-info-reject" data-id="${userId}"><i class="fas fa-times"></i> বাতিল</button>
          <button class="action-nexus-btn btn-hold btn-info-hold" data-id="${userId}"><i class="fas fa-pause"></i> হোল্ড</button>
          <button class="action-nexus-btn btn-approve btn-info-approve" data-id="${userId}"><i class="fas fa-check"></i> এপ্রুভ</button>
        </div>
      `;
      infoRequestsContainer.appendChild(card);
    });

    // তথ্য অ্যাকশন বাটন হ্যান্ডলার বাইন্ডিং
    document.querySelectorAll('.btn-info-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = e.target.closest('button').getAttribute('data-id');
        const userSnapshot = snapshot.docs.find(d => d.id === uid);
        if(!userSnapshot) return;

        const u = userSnapshot.data();
        const p = u.tempPendingData || {};
        detailsModalGrid.innerHTML = "";

         const fieldsMeta = [
          { key: 'englishName', label: 'English Name' }, { key: 'banglaName', label: 'Bangla Name' },
          { key: 'fatherName', label: "Father's Name" }, { key: 'motherName', label: "Mother's Name" },
          { key: 'dob', label: 'Date of Birth' }, { key: 'gender', label: 'Gender' },
          { key: 'nidOrBrn', label: 'NID / BRN' }, { key: 'institution', label: 'Institution' },
          { key: 'education', label: 'Education' }, { key: 'academicYear', label: 'Academic Year' },
          { key: 'profession', label: 'Profession' }, { key: 'mobileNumber', label: 'Mobile Number' },
          { key: 'whatsappNumber', label: 'WhatsApp Number' }, { key: 'facebookLink', label: 'Facebook Profile' },
          { key: 'presentAddress', label: 'Present Address', fullWidth: true }, { key: 'permanentAddress', label: 'Permanent Address', fullWidth: true }
        ];

        fieldsMeta.forEach(f => {
          if (p[f.key] !== undefined) {
            const isChanged = p[f.key] !== u[f.key];
            const node = document.createElement('div');
            node.className = `details-data-node ${f.fullWidth ? 'details-span-2' : ''}`;
            node.innerHTML = `
              <div class="lbl">${f.label} ${isChanged ? '<span style="color:var(--accent); font-size:10px;">(পরিবর্তিত)</span>' : ''}</div>
              <div class="val ${isChanged ? 'changed-highlight' : ''}">
                ${isChanged ? `<span style="opacity:0.5; font-size:12px; text-decoration:line-through;">${u[f.key] || 'খালি'}</span> <i class="fas fa-chevron-right" style="font-size:10px; color:var(--accent); margin:0 5px;"></i>` : ''}
                ${p[f.key] || '<i>খালি</i>'}
              </div>
            `;
            detailsModalGrid.appendChild(node);
          }
        });
        globalMatrixModal.style.display = "flex";
      });
    });

    // তথ্য এপ্রুভ (Approve) করার বাটন এবং সার্ভার টাইমস্ট্যাম্প সেভ
    document.querySelectorAll('.btn-info-approve').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.target.closest('button').getAttribute('data-id');
        const userSnapshot = snapshot.docs.find(d => d.id === uid);
        if(!userSnapshot) return;

        const u = userSnapshot.data();
        if (!u.tempPendingData) return;

        if (confirm("আপনি কি নিশ্চিতভাবে এই মেম্বারের তথ্যসমূহ আপডেট করতে চান?")) {
          try {
            await updateDoc(doc(db, "users", uid), {
              ...u.tempPendingData,
              tempPendingData: null,
              infoApprovalStatus: "approved",
              infoActionAt: serverTimestamp() // তথ্য এপ্রুভ করার অফিশিয়াল সার্ভার টাইমস্ট্যাম্প
            });
            alert("🎉 প্রোফাইলের সমস্ত তথ্য সফলভাবে আপডেট ও এপ্রুভ করা হয়েছে!");
          } catch(err) { alert("ডাটাবেজ আপডেট করতে সমস্যা হয়েছে!"); }
        }
      });
    });

    document.querySelectorAll('.btn-info-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTargetUserId = e.target.closest('button').getAttribute('data-id');
        activeTargetActionType = "info";
        activeTargetStatusDecision = "rejected";
        rejectModalHeader.innerHTML = `<i class="fas fa-user-times"></i> তথ্য পরিবর্তনের আবেদন বাতিলের কারণ`;
        rejectReasonInput.value = "";
        globalRejectPromptModal.style.display = "flex";
      });
    });

    document.querySelectorAll('.btn-info-hold').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTargetUserId = e.target.closest('button').getAttribute('data-id');
        activeTargetActionType = "info";
        activeTargetStatusDecision = "waiting"; // "waiting" মানে হলো হোল্ড স্টেট
        rejectModalHeader.innerHTML = `<i class="fas fa-pause-circle"></i> তথ্য পরিবর্তনের আবেদন হোল্ড করার কারণ`;
        rejectReasonInput.value = "";
        globalRejectPromptModal.style.display = "flex";
      });
    });
  });

  // ৬. মোডাল ক্লোজ ইভেন্ট লিসেনারস
  detailsCloseBtn.addEventListener('click', () => { globalMatrixModal.style.display = "none"; });
  rejectCancelBtn.addEventListener('click', () => { globalRejectPromptModal.style.display = "none"; });

  // ৭. রিজেক্ট (Reject) এবং হোল্ড (Hold) কনফার্মেশনের সময় সার্ভার টাইমস্ট্যাম্প সেভ মেকানিজম
  rejectSubmitConfirmBtn.addEventListener('click', async () => {
    const reason = rejectReasonInput.value.trim();
    if (reason === "") { alert("অনুগ্রহ করে একটি সুনির্দিষ্ট কারণ উল্লেখ করুন!"); return; }

    globalRejectPromptModal.style.display = "none";

    try {
      if (activeTargetActionType === "photo") {
        await updateDoc(doc(db, "users", activeTargetUserId), {
          imageApprovalStatus: activeTargetStatusDecision, 
          imageRejectReason: reason,
          imageActionAt: serverTimestamp() // ফটো রিজেক্ট করার সার্ভার টাইমস্ট্যাম্প
        });
        alert("❌ ছবি পরিবর্তনের আবেদনটি বাতিল করা হয়েছে।");
      } 
      else if (activeTargetActionType === "info") {
        const updatePayload = {
          infoApprovalStatus: activeTargetStatusDecision, // "rejected" বা "waiting" (হোল্ড)
          infoRejectReason: reason,
          infoActionAt: serverTimestamp() // তথ্য রিজেক্ট বা হোল্ড করার অফিশিয়াল সার্ভার টাইমস্ট্যাম্প
        };

        await updateDoc(doc(db, "users", activeTargetUserId), updatePayload);
        
        if(activeTargetStatusDecision === "waiting") {
          alert("⚠️ তথ্য পরিবর্তনের আবেদনটি হোল্ড করা হয়েছে। ইউজার পুনরায় এডিট করতে পারবেন।");
        } else {
          alert("❌ তথ্য পরিবর্তনের আবেদনটি সম্পূর্ণ রিজেক্ট করা হয়েছে।");
        }
      }
    } catch (err) { alert("ডাটাবেজ আপডেট ব্যর্থ হয়েছে!"); }
  });
    }
