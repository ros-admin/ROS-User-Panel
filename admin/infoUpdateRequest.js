// ROS Nexus - Enterprise Admin Request Approval Module
function loadAdminRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc, collection, query, where, serverTimestamp) {
  
  // ১. এডমিন রিকোয়েস্ট ড্যাশবোর্ডের আল্ট্রা-প্রিমিয়াম ইউআই স্টাইল ইনজেকশন
  contentRoot.innerHTML = `
    <style>
      .admin-req-container { max-width: 1200px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif; }
      
      /* প্রিমিয়াম নিয়ন ট্যাব লজিক */
      .req-tab-switcher { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; }
      .req-tab-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: #9ca3af; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
      .req-tab-btn:hover { background: rgba(0, 180, 216, 0.05); color: #fff; }
      .req-tab-btn.active { background: rgba(0, 180, 216, 0.1); border-color: #00b4d8; color: #00b4d8; box-shadow: 0 0 15px rgba(0, 180, 216, 0.2); }
      
      .req-panel-node { display: none; }
      .req-panel-node.active { display: block; animation: fadeIn 0.4s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      
      /* সাইপারপাঙ্ক রেসপনসিভ টেবিল কোর */
      .cyber-table-wrapper { width: 100%; overflow-x: auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(17, 24, 39, 0.4); backdrop-filter: blur(10px); }
      .cyber-req-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; min-width: 700px; }
      .cyber-req-table th { background: rgba(3, 7, 18, 0.8); color: #fbbf24; padding: 14px 16px; font-weight: 700; border-bottom: 2px solid rgba(255,255,255,0.08); text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
      .cyber-req-table td { padding: 14px 16px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
      .cyber-req-table tr:hover { background: rgba(255,255,255,0.02); }
      
      /* বিস্তারিত নিওন বাটন */
      .action-view-btn { background: rgba(0, 180, 216, 0.1); border: 1px solid #00b4d8; color: #00b4d8; padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
      .action-view-btn:hover { background: #00b4d8; color: #030712; box-shadow: 0 0 10px #00b4d8; }
      
      /* সাইড-বাই-সাইড কম্পারিসন উইন্ডো (মোডাল) */
      .matrix-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 7, 18, 0.9); backdrop-filter: blur(12px); z-index: 3000; display: none; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
      .matrix-modal-card { width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 30px; box-shadow: 0 0 40px rgba(0,0,0,0.6); position: relative; }
      .modal-close-trigger { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: #9ca3af; font-size: 20px; cursor: pointer; transition: 0.2s; }
      .modal-close-trigger:hover { color: #f87171; }
      
      .comparison-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
      .comparison-box { border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; }
      .comparison-box h5 { font-size: 14px; color: #fbbf24; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; width: 100%; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
      
      .comp-photo-frame { width: 180px; height: 180px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); object-fit: cover; box-shadow: 0 0 15px rgba(0,0,0,0.4); background: #020c1b; }
      
      /* ডাটা ফরম গ্রিড ইনসাইড মোডাল */
      .comp-data-stack { width: 100%; display: flex; flex-direction: column; gap: 10px; }
      .comp-data-field { display: flex; flex-direction: column; gap: 4px; width: 100%; }
      .comp-data-field label { font-size: 11px; color: #9ca3af; font-weight: 600; text-align: left; }
      
      /* অ্যাকশন বাটন কনসোল */
      .matrix-action-bar { display: flex; justify-content: center; gap: 12px; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }
      .btn-action-node { padding: 10px 24px; font-size: 13px; font-weight: 700; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
      .btn-action-red { background: rgba(239, 68, 68, 0.1); border-color: #f87171; color: #f87171; }
      .btn-action-red:hover { background: #f87171; color: #030712; box-shadow: 0 0 15px #f87171; }
      .btn-action-yellow { background: rgba(245, 158, 11, 0.1); border-color: #fbbf24; color: #fbbf24; }
      .btn-action-yellow:hover { background: #fbbf24; color: #030712; box-shadow: 0 0 15px #fbbf24; }
      .btn-action-green { background: rgba(16, 185, 129, 0.1); border-color: #34d399; color: #34d399; }
      .btn-action-green:hover { background: #34d399; color: #030712; box-shadow: 0 0 15px #34d399; }

      /* রিজেক্ট রিজন প্রোম্পট মোডাল */
      .reason-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 7, 18, 0.95); backdrop-filter: blur(5px); z-index: 4000; display: none; align-items: center; justify-content: center; padding: 20px; }
      .cyber-modal-card { background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 8px; color: #fff; }

      @media(max-width: 768px) {
        .comparison-split-grid { grid-template-columns: 1fr; }
        .matrix-action-bar { flex-direction: column; width: 100%; }
        .btn-action-node { width: 100%; justify-content: center; }
      }
    </style>

    <div class="admin-req-container">
      <div class="req-tab-switcher">
        <button class="req-tab-btn active" id="tabPhotoBtn"><i class="fas fa-camera"></i> ছবি পরিবর্তনের আবেদন (<span id="photoReqCount">0</span>)</button>
        <button class="req-tab-btn" id="tabInfoBtn"><i class="fas fa-user-edit"></i> তথ্য পরিবর্তনের আবেদন (<span id="infoReqCount">0</span>)</button>
      </div>

      <div class="req-panel-node active" id="panelPhotoRequest">
        <div class="cyber-table-wrapper">
          <table class="cyber-req-table">
            <thead>
              <tr>
                <th>ক্রমিক</th>
                <th>রেজিস্ট্রেশন নাম্বার</th>
                <th>সদস্য নাম</th>
                <th>সাবমিটের সময়</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="photoTableBody">
              <tr><td colspan="5" style="text-align:center; color:#9ca3af;">ডাটা লোড হচ্ছে...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="req-panel-node" id="panelInfoRequest">
        <div class="cyber-table-wrapper">
          <table class="cyber-req-table">
            <thead>
              <tr>
                <th>ক্রমিক</th>
                <th>রেজিস্ট্রেশন নাম্বার</th>
                <th>সদস্য নাম</th>
                <th>সাবমিটের সময়</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="infoTableBody">
              <tr><td colspan="5" style="text-align:center; color:#9ca3af;">ডাটা লোড হচ্ছে...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="matrix-modal-overlay" id="globalMatrixModal">
      <div class="matrix-modal-card">
        <button class="modal-close-trigger" id="closeMatrixModal"><i class="fas fa-times"></i></button>
        <h3 id="modalTitleNode" style="font-size:18px; color:#fff; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px; margin-top:0;">আবেদন যাচাইকরণ উইন্ডো</h3>
        
        <div id="modalDynamicContentBox"></div>
        
        <div class="matrix-action-bar" id="modalActionBar"></div>
      </div>
    </div>

    <div class="reason-modal-overlay" id="reasonPromptModal">
      <div class="cyber-modal-card" style="max-width:400px; width:100%;">
        <h3 id="reasonModalTitle" style="margin-top:0; font-size:16px;">⚠️ কারণ উল্লেখ করুন</h3>
        <div style="margin-top:15px; display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:13px; color:#9ca3af; text-align:left;">মেম্বার প্যানেলে প্রদর্শনের জন্য কারণটি বিস্তারিত লিখুন:</label>
          <textarea id="actionReasonText" rows="3" placeholder="উদাঃ ছবি ঝাপসা অথবা ভুল তথ্য প্রদান করা হয়েছে..." style="width:100%; padding:10px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:4px; outline:none; box-sizing:border-box; resize:none;"></textarea>
        </div>
        <div style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
          <button class="action-view-btn" id="reasonCancelBtn" style="border-color:#6b7280; color:#9ca3af; background:transparent;">বাতিল</button>
          <button class="action-view-btn" id="reasonSubmitBtn" style="border-color:#00b4d8; color:#030712; background:#00b4d8;">নিশ্চিত করুন</button>
        </div>
      </div>
    </div>
  `;

  // ২. ডম ও ভেরিয়েবল মেমোরি কনফিগারেশন
  const tabPhotoBtn = document.getElementById('tabPhotoBtn');
  const tabInfoBtn = document.getElementById('tabInfoBtn');
  const panelPhotoRequest = document.getElementById('panelPhotoRequest');
  const panelInfoRequest = document.getElementById('panelInfoRequest');
  
  const photoTableBody = document.getElementById('photoTableBody');
  const infoTableBody = document.getElementById('infoTableBody');
  const photoReqCount = document.getElementById('photoReqCount');
  const infoReqCount = document.getElementById('infoReqCount');

  const globalMatrixModal = document.getElementById('globalMatrixModal');
  const closeMatrixModal = document.getElementById('closeMatrixModal');
  const modalTitleNode = document.getElementById('modalTitleNode');
  const modalDynamicContentBox = document.getElementById('modalDynamicContentBox');
  const modalActionBar = document.getElementById('modalActionBar');

  const reasonPromptModal = document.getElementById('reasonPromptModal');
  const reasonModalTitle = document.getElementById('reasonModalTitle');
  const actionReasonText = document.getElementById('actionReasonText');
  const reasonCancelBtn = document.getElementById('reasonCancelBtn');
  const reasonSubmitBtn = document.getElementById('reasonSubmitBtn');

  let activeTargetUserId = "";
  let activeTargetActionType = ""; // "photo" বা "data"
  let activeTargetStatusDecision = ""; // "rejected" বা "waiting"
  let currentFetchedUserData = {}; 

  function getServerTime() {
    return (typeof serverTimestamp === 'function') ? serverTimestamp() : new Date();
  }

  // ৩. নিওন ট্যাব সুইচিং লজিক
  tabPhotoBtn.addEventListener('click', () => {
    tabPhotoBtn.classList.add('active'); tabInfoBtn.classList.remove('active');
    panelPhotoRequest.classList.add('active'); panelInfoRequest.classList.remove('active');
  });
  tabInfoBtn.addEventListener('click', () => {
    tabInfoBtn.classList.add('active'); tabPhotoBtn.classList.remove('active');
    panelInfoRequest.classList.add('active'); panelPhotoRequest.classList.remove('active');
  });

  // ৪. রিয়েল-টাইম ফায়ারস্টোর ডেটা সিংক্রোনাইজেশন
  const usersRef = collection(db, "users");
  
  onSnapshot(query(usersRef), (snapshot) => {
    let pCount = 0; let iCount = 0;
    let photoHtml = ""; let infoHtml = "";

    snapshot.forEach((userDoc) => {
      const uData = userDoc.data();
      const uid = userDoc.id;

      // ক) পেন্ডিং ছবি প্রসেসিং
      if (uData.imageApprovalStatus === "pending") {
        pCount++;
        let reqDate = "N/A";
        if (uData.imageActionAt) {
          const d = uData.imageActionAt.toDate ? uData.imageActionAt.toDate() : new Date(uData.imageActionAt);
          reqDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        photoHtml += `
          <tr>
            <td>${pCount}</td>
            <td style="font-weight:600; color:#00b4d8;">${uData.memberId || 'N/A'}</td>
            <td>${uData.englishName || 'No Name'}</td>
            <td style="font-size:12px; color:#9ca3af;">${reqDate}</td>
            <td>
              <button class="action-view-btn open-comp-btn" data-uid="${uid}" data-type="photo"><i class="fas fa-eye"></i> বিস্তারিত</button>
            </td>
          </tr>
        `;
      }

      // খ) পেন্ডিং তথ্য প্রসেসিং
      if (uData.infoApprovalStatus === "pending") {
        iCount++;
        let reqDate = "N/A";
        if (uData.infoActionAt) {
          const d = uData.infoActionAt.toDate ? uData.infoActionAt.toDate() : new Date(uData.infoActionAt);
          reqDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        infoHtml += `
          <tr>
            <td>${iCount}</td>
            <td style="font-weight:600; color:#00b4d8;">${uData.memberId || 'N/A'}</td>
            <td>${uData.englishName || 'No Name'}</td>
            <td style="font-size:12px; color:#9ca3af;">${reqDate}</td>
            <td>
              <button class="action-view-btn open-comp-btn" data-uid="${uid}" data-type="info"><i class="fas fa-eye"></i> বিস্তারিত</button>
            </td>
          </tr>
        `;
      }
    });

    photoReqCount.innerText = pCount;
    infoReqCount.innerText = iCount;

    photoTableBody.innerHTML = photoHtml ? photoHtml : `<tr><td colspan="5" style="text-align:center; color:#9ca3af;">কোনো ছবি পরিবর্তনের আবেদন নেই।</td></tr>`;
    infoTableBody.innerHTML = infoHtml ? infoHtml : `<tr><td colspan="5" style="text-align:center; color:#9ca3af;">কোনো তথ্য পরিবর্তনের আবেদন নেই।</td></tr>`;

    // অ্যাকশন বাটন ক্লিক ইভেন্ট বাইন্ডিং লুপ
    document.querySelectorAll('.open-comp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.getAttribute('data-uid');
        const mode = btn.getAttribute('data-type');
        triggerComparisonWindow(uid, mode);
      });
    });
  });

  // ৫. বিস্তারিত যাচাইকরণ উইন্ডো ওপেনিং এবং লাইভ কম্পারিসন মেকানিজম
  let currentUnsubscribe = null;

  async function triggerComparisonWindow(userId, mode) {
    activeTargetUserId = userId;
    activeTargetActionType = mode;

    if (currentUnsubscribe) currentUnsubscribe();

    currentUnsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
      if(!docSnap.exists()) return;
      const u = docSnap.data();
      currentFetchedUserData = u;

      modalDynamicContentBox.innerHTML = "";
      modalActionBar.innerHTML = "";

      if (mode === 'photo') {
        modalTitleNode.innerHTML = `🖼️ ছবি পরিবর্তনের আবেদন: <span style="color:#00b4d8;">${u.memberId || ''}</span>`;
        
        modalDynamicContentBox.innerHTML = `
          <div class="comparison-split-grid">
            <div class="comparison-box">
              <h5>পূর্বের ছবি</h5>
              <img src="${u.photoUrl || '../placeholder.png'}" class="comp-photo-frame">
            </div>
            <div class="comparison-box" style="border-color: #00b4d8; background: rgba(0, 180, 216, 0.02);">
              <h5>আবেদনকৃত ছবি</h5>
              <img src="${u.tempPendingPhoto || '../placeholder.png'}" class="comp-photo-frame" style="border-color: #00b4d8; box-shadow: 0 0 20px rgba(0, 180, 216, 0.2);">
            </div>
          </div>
        `;

        modalActionBar.innerHTML = `
          <button class="btn-action-node btn-action-red" id="actPhotoReject"><i class="fas fa-times-circle"></i> রিজেক্ট করুন</button>
          <button class="btn-action-node btn-action-green" id="actPhotoApprove"><i class="fas fa-check-circle"></i> এপ্রুভ করুন</button>
        `;

        document.getElementById('actPhotoApprove').onclick = approvePhotoRequest;
        document.getElementById('actPhotoReject').onclick = () => openReasonPrompt("rejected");
      } 
      
      else if (mode === 'info') {
        modalTitleNode.innerHTML = `📝 তথ্য পরিবর্তনের আবেদন: <span style="color:#fbbf24;">${u.memberId || ''}</span>`;
        const temp = u.tempPendingData || {};

        modalDynamicContentBox.innerHTML = `
          <div class="comparison-split-grid" style="max-height: 55vh; overflow-y: auto; padding-right: 5px;">
            <div class="comparison-box">
              <h5>পূর্বের রক্ষিত তথ্য</h5>
              <div class="comp-data-stack">
                <div class="comp-data-field"><label>English Name</label><input type="text" value="${u.englishName || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Bangla Name</label><input type="text" value="${u.banglaName || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Father's Name</label><input type="text" value="${u.fatherName || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Mother's Name</label><input type="text" value="${u.motherName || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>DOB</label><input type="text" value="${u.dob || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Gender</label><input type="text" value="${u.gender || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>NID/BRN</label><input type="text" value="${u.nidOrBrn || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Institution</label><input type="text" value="${u.institution || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Education</label><input type="text" value="${u.education || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Academic Year</label><input type="text" value="${u.academicYear || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Profession</label><input type="text" value="${u.profession || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Mobile</label><input type="text" value="${u.mobileNumber || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>WhatsApp</label><input type="text" value="${u.whatsappNumber || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Facebook Link</label><input type="text" value="${u.facebookLink || ''}" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px;"></div>
                <div class="comp-data-field"><label>Present Address</label><textarea rows="2" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px; resize:none; width:100%; box-sizing:border-box;">${u.presentAddress || ''}</textarea></div>
                <div class="comp-data-field"><label>Permanent Address</label><textarea rows="2" disabled style="padding:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#9ca3af; border-radius:4px; resize:none; width:100%; box-sizing:border-box;">${u.permanentAddress || ''}</textarea></div>
              </div>
            </div>

            <div class="comparison-box" style="border-color: #fbbf24; background: rgba(255, 183, 3, 0.01);">
              <h5>আবেদনকৃত তথ্য (সম্পাদনাযোগ্য)</h5>
              <div class="comp-data-stack">
                <div class="comp-data-field"><label style="color:#fbbf24;">English Name</label><input type="text" id="admEdEnglishName" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.englishName || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Bangla Name</label><input type="text" id="admEdBanglaName" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.banglaName || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Father's Name</label><input type="text" id="admEdFatherName" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.fatherName || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Mother's Name</label><input type="text" id="admEdMotherName" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.motherName || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">DOB</label><input type="text" id="admEdDob" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.dob || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Gender</label><input type="text" id="admEdGender" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.gender || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">NID/BRN</label><input type="text" id="admEdNidOrBrn" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.nidOrBrn || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Institution</label><input type="text" id="admEdInstitution" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.institution || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Education</label><input type="text" id="admEdEducation" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.education || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Academic Year</label><input type="text" id="admEdAcademicYear" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.academicYear || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Profession</label><input type="text" id="admEdProfession" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.profession || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Mobile</label><input type="text" id="admEdMobile" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.mobileNumber || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">WhatsApp</label><input type="text" id="admEdWhatsapp" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.whatsappNumber || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Facebook Link</label><input type="text" id="admEdFacebook" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none;" value="${temp.facebookLink || ''}"></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Present Address</label><textarea id="admEdPresent" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none; resize:none; width:100%; box-sizing:border-box;" rows="2">${temp.presentAddress || ''}</textarea></div>
                <div class="comp-data-field"><label style="color:#fbbf24;">Permanent Address</label><textarea id="admEdPermanent" style="padding:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:4px; outline:none; resize:none; width:100%; box-sizing:border-box;" rows="2">${temp.permanentAddress || ''}</textarea></div>
              </div>
            </div>
          </div>
        `;

        modalActionBar.innerHTML = `
          <button class="btn-action-node btn-action-red" id="actInfoReject"><i class="fas fa-times-circle"></i> রিজেক্ট করুন</button>
          <button class="btn-action-node btn-action-yellow" id="actInfoHold"><i class="fas fa-pause-circle"></i> হোল্ড করুন</button>
          <button class="btn-action-node btn-action-green" id="actInfoApprove"><i class="fas fa-check-circle"></i> এপ্রুভ করুন</button>
        `;

        document.getElementById('actInfoApprove').onclick = approveInfoRequest;
        document.getElementById('actInfoReject').onclick = () => openReasonPrompt("rejected");
        document.getElementById('actInfoHold').onclick = () => openReasonPrompt("waiting");
      }

      globalMatrixModal.style.display = "flex";
    });
  }

  closeMatrixModal.addEventListener('click', () => {
    globalMatrixModal.style.display = "none";
    if (currentUnsubscribe) { currentUnsubscribe(); currentUnsubscribe = null; }
  });

  // ৬. কোর ডাটাবেজ অ্যাকশন এক্সিকিউশন ইঞ্জিন (টাইমস্ট্যাম্পসহ)

  // ক) ছবি এপ্রুভ
  async function approvePhotoRequest() {
    if(!confirm("আপনি কি নিশ্চিতভাবে এই ছবিটি এপ্রুভ করতে চান?")) return;
    try {
      await updateDoc(doc(db, "users", activeTargetUserId), {
        photoUrl: currentFetchedUserData.tempPendingPhoto || "",
        imageApprovalStatus: "approved",
        imageRejectReason: "",
        imageActionAt: getServerTime() // সার্ভার টাইমস্ট্যাম্প বা লোকাল টাইমস্ট্যাম্প ট্র্যাক
      });
      alert("✅ প্রোফাইল ছবি সফলভাবে এপ্রুভ এবং আপডেট করা হয়েছে!");
      globalMatrixModal.style.display = "none";
    } catch (err) { 
      console.error(err);
      alert("ছবি এপ্রুভ করার অপারেশন ব্যর্থ হয়েছে!"); 
    }
  }

  // খ) তথ্য এপ্রুভ
  async function approveInfoRequest() {
    if(!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যগুলো এপ্রুভ করতে চান?")) return;
    
    try {
      const finalApprovedData = {
        englishName: document.getElementById('admEdEnglishName').value.trim(),
        banglaName: document.getElementById('admEdBanglaName').value.trim(),
        fatherName: document.getElementById('admEdFatherName').value.trim(),
        motherName: document.getElementById('admEdMotherName').value.trim(),
        dob: document.getElementById('admEdDob').value.trim(),
        gender: document.getElementById('admEdGender').value.trim(),
        nidOrBrn: document.getElementById('admEdNidOrBrn').value.trim(),
        institution: document.getElementById('admEdInstitution').value.trim(),
        education: document.getElementById('admEdEducation').value.trim(),
        academicYear: document.getElementById('admEdAcademicYear').value.trim(),
        profession: document.getElementById('admEdProfession').value.trim(),
        mobileNumber: document.getElementById('admEdMobile').value.trim(),
        whatsappNumber: document.getElementById('admEdWhatsapp').value.trim(),
        facebookLink: document.getElementById('admEdFacebook').value.trim(),
        presentAddress: document.getElementById('admEdPresent').value.trim(),
        permanentAddress: document.getElementById('admEdPermanent').value.trim(),
        
        infoApprovalStatus: "approved",
        infoRejectReason: "",
        infoActionAt: getServerTime() // টাইমার লকের ট্র্যাকিং সঠিক রাখা
      };

      await updateDoc(doc(db, "users", activeTargetUserId), finalApprovedData);
      alert("✅ সদস্যের তথ্যসমূহ সফলভাবে এপ্রুভ এবং আপডেট করা হয়েছে!");
      globalMatrixModal.style.display = "none";
    } catch (err) { 
      console.error(err);
      alert("তথ্য এপ্রুভ করার অপারেশন ব্যর্থ হয়েছে!"); 
    }
  }

  // গ) রিজেক্ট/হোল্ড অপ্টিমাইজড কারণ প্রোম্পট উইন্ডো ওপেন
  function openReasonPrompt(decisionType) {
    activeTargetStatusDecision = decisionType; 
    actionReasonText.value = "";
    
    if (decisionType === "rejected") {
      reasonModalTitle.innerHTML = "❌ আবেদনটি রিজেক্ট করার কারণ";
    } else if (decisionType === "waiting") {
      reasonModalTitle.innerHTML = "⚠️ আবেদনটি হোল্ডে রাখার কারণ";
    }
    
    reasonPromptModal.style.display = "flex";
  }

  reasonCancelBtn.addEventListener('click', () => reasonPromptModal.style.display = "none");

  // ঘ) কারণসহ রিজেক্ট অথবা হোল্ড সাবমিশন লুপ
  reasonSubmitBtn.onclick = async () => {
    const reason = actionReasonText.value.trim();
    if (!reason) { alert("অনুগ্রহ করে কারণটি লিখুন!"); return; }

    reasonPromptModal.style.display = "none";

    try {
      if (activeTargetActionType === "photo") {
        await updateDoc(doc(db, "users", activeTargetUserId), {
          imageApprovalStatus: activeTargetStatusDecision, // "rejected"
          imageRejectReason: reason,
          imageActionAt: getServerTime()
        });
        alert("❌ ছবি পরিবর্তনের আবেদনটি বাতিল করা হয়েছে।");
      } 
      else if (activeTargetActionType === "info") {
        const updatePayload = {
          infoApprovalStatus: activeTargetStatusDecision, // "rejected" বা "waiting"
          infoRejectReason: reason
        };

        // শর্তানুযায়ী: রিজেক্ট হলে ১৪ দিনের টাইমার ট্র্যাক হবে, কিন্তু হোল্ড (waiting) হলে টাইমার যুক্ত হবে না
        if (activeTargetStatusDecision === "rejected") {
          updatePayload.infoActionAt = getServerTime();
        } else if (activeTargetStatusDecision === "waiting") {
          updatePayload.infoActionAt = null; // হোল্ড করা অবস্থায় আনলিমিটেড টাইম থাকবে
        }

        await updateDoc(doc(db, "users", activeTargetUserId), updatePayload);
        
        if(activeTargetStatusDecision === "waiting") {
          alert("⚠️ তথ্য পরিবর্তনের আবেদনটি হোল্ড করা হয়েছে। ইউজার পুনরায় এডিট করতে পারবেন।");
        } else {
          alert("❌ তথ্য পরিবর্তনের আবেদনটি সম্পূর্ণ রিজেক্ট করা হয়েছে।");
        }
      }
      
      globalMatrixModal.style.display = "none";
    } catch (err) { 
      console.error(err);
      alert("ডাটাবেজ আপডেট ব্যর্থ হয়েছে!"); 
    }
  };
}
