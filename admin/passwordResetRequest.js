// ROS Nexus - Enterprise Admin Password Control & Reset Request Module
function loadAdminPasswordManagementModule(contentRoot, db, auth, doc, collection, query, where, getDocs, updateDoc, onSnapshot) {
  
  // ১. প্রিমিয়াম ডার্ক-ম্যাট্রিক্স থিম এবং অ্যাডমিন কন্ট্রোল প্যানেল ইউআই
  contentRoot.innerHTML = `
    <style>
      :root {
        --adm-cyan: #00b4d8;
        --adm-yellow: #fbbf24;
        --adm-danger: #ff4d6d;
        --adm-success: #2ec4b6;
        --adm-muted: #9ca3af;
      }

      .adm-pass-container { 
        max-width: 1050px; width: 100%; margin: 0 auto; padding: 25px 15px; border-radius: 16px; 
        position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.95); 
        backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); 
        border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); 
        box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif; color: #fff; 
      }
      .adm-pass-container::before { 
        content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; 
        background: linear-gradient(90deg, transparent, var(--adm-danger), var(--adm-cyan), transparent); 
      }
      
      .adm-module-title { 
        font-size: 22px; color: #fff; margin-bottom: 25px; font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; 
        display: flex; align-items: center; gap: 12px; 
      }
      .adm-module-title i { color: var(--adm-cyan); text-shadow: 0 0 10px rgba(0, 180, 216, 0.4); }

      /* রিকোয়েস্ট গ্রিড লেআউট */
      .queue-grid { display: flex; flex-direction: column; gap: 14px; }
      
      .queue-card { 
        padding: 16px 20px; border-radius: 8px; 
        background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.06); 
        display: flex; justify-content: space-between; align-items: center; gap: 15px;
        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .queue-card:hover { 
        border-color: var(--adm-yellow); background: rgba(0, 0, 0, 0.5); 
        transform: translateX(4px); box-shadow: 0 4px 15px rgba(251, 191, 36, 0.1); 
      }
      
      .queue-left { display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; }
      .queue-icon { 
        width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 77, 109, 0.1); 
        border: 1px solid rgba(255, 77, 109, 0.3); display: flex; align-items: center; 
        justify-content: center; font-size: 16px; color: var(--adm-danger); flex-shrink: 0; 
      }
      
      .queue-info { flex: 1; min-width: 0; }
      .queue-info h4 { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 4px 0; }
      .queue-info p { font-size: 11px; color: var(--adm-muted); margin: 0; }
      
      .queue-action-btn {
        padding: 8px 16px; background: linear-gradient(135deg, #0077b6, var(--adm-cyan));
        border: none; border-radius: 4px; color: #fff; font-size: 12px; font-weight: 700;
        cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 6px;
      }
      .queue-action-btn:hover { box-shadow: 0 0 12px var(--adm-cyan); }

      /* অ্যাডভান্সড মেম্বার ডিটেইলস ওভারলে মডাল */
      .adm-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(10px);
        display: none; justify-content: center; align-items: center; z-index: 10000;
        padding: 20px; box-sizing: border-box;
      }
      .adm-modal-content {
        background: var(--card-bg); border: 1px solid rgba(0, 180, 216, 0.3);
        max-width: 500px; width: 100%; border-radius: 12px; padding: 25px;
        box-shadow: 0 0 30px rgba(0, 180, 216, 0.2); position: relative;
        animation: modalSlideUp 0.4s ease; color: #fff;
      }
      
      /* মেম্বার প্রোফাইল কার্ড স্টাইল */
      .member-profile-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 20px; }
      .member-avatar { 
        width: 90px; height: 90px; border-radius: 50%; object-fit: cover;
        border: 2px solid var(--adm-cyan); box-shadow: 0 0 15px rgba(0, 180, 216, 0.3); margin-bottom: 12px;
      }
      .member-avatar-placeholder {
        width: 90px; height: 90px; border-radius: 50%; background: rgba(255,255,255,0.05);
        border: 2px dashed var(--adm-muted); display: flex; align-items: center; justify-content: center;
        font-size: 32px; color: var(--adm-muted); margin-bottom: 12px;
      }
      .member-profile-header h3 { font-size: 18px; margin: 0 0 4px 0; color: #fff; }
      .member-profile-header p { font-size: 12px; color: var(--adm-cyan); margin: 0; font-family: monospace; font-weight: bold; }

      /* ডিটেইলস লিস্ট টেবিল */
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
      .detail-label { color: var(--adm-muted); }
      .detail-value { color: #fff; font-weight: 500; }

      /* পাসওয়ার্ড কন্ট্রোল এরিয়া */
      .pass-control-box { margin-top: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
      .pass-control-box h4 { font-size: 13px; color: var(--adm-yellow); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
      
      .adm-input {
        width: 100%; padding: 10px 14px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box; margin-bottom: 12px;
      }
      .adm-input:focus { outline: none; border-color: var(--adm-cyan); box-shadow: 0 0 8px rgba(0, 180, 216, 0.3); }

      .modal-actions { display: flex; gap: 10px; margin-top: 15px; }
      .btn-dismiss { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 1; font-weight: 600; }
      .btn-update-pass { background: linear-gradient(135deg, var(--adm-success), #1b9e91); border: none; color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 2; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 6px; }
      
      .empty-queue { text-align: center; padding: 40px; color: var(--adm-muted); font-size: 13px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; }

      @keyframes modalSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      /* রেসপন্সিভ মিডিয়া কোয়েরি ফিক্স */
      @media (max-width: 600px) {
        .queue-card { flex-direction: column; align-items: flex-start; gap: 12px; }
        .queue-action-btn { width: 100%; justify-content: center; }
        .adm-modal-content { padding: 15px; }
        .detail-row { flex-direction: column; gap: 2px; }
        .detail-value { text-align: left; word-break: break-all; }
      }
    </style>

    <div class="adm-pass-container">
      <h3 class="adm-module-title"><i class="fas fa-user-shield"></i> পাসওয়ার্ড রিসেট ও ইউজার ভেরিফিকেশন প্যানেল</h3>
      
      <div class="queue-grid" id="resetQueueRoot">
        <div class="empty-queue">রিকোয়েস্ট ডাটা লোড হচ্ছে...</div>
      </div>
    </div>

    <!-- মেম্বার ডিটেইলস এবং পাসওয়ার্ড চেঞ্জ পপআপ মোডাল -->
    <div id="admDetailModal" class="adm-modal-overlay">
      <div class="adm-modal-content">
        
        <div class="member-profile-header" id="modalProfileHeader">
          <!-- ডাইনামিক প্রোফাইল পিকচার এবং নাম আসবে এখানে -->
        </div>

        <div id="modalUserSpecs">
          <!-- ফায়ারস্টোর থেকে ডিটেইল ডাটা এখানে রেন্ডার হবে -->
        </div>

        <div class="pass-control-box">
          <h4><i class="fas fa-key"></i> অ্যাকশন: নতুন পাসওয়ার্ড সেট করুন</h4>
          <input type="text" id="targetNewPassword" class="adm-input" placeholder="নতুন পাসওয়ার্ড লিখুন (যেমন: ROS@2026)">
          
          <div class="modal-actions">
            <button type="button" class="btn-dismiss" id="admCloseModal">বন্ধ করুন</button>
            <button type="button" class="btn-update-pass" id="admSubmitNewPass"><i class="fas fa-save"></i> পাসওয়ার্ড আপডেট করুন</button>
          </div>
        </div>

      </div>
    </div>
  `;

  const queueRoot = document.getElementById('resetQueueRoot');
  const detailModal = document.getElementById('admDetailModal');
  const closeModalBtn = document.getElementById('admCloseModal');
  const submitNewPassBtn = document.getElementById('admSubmitNewPass');
  const targetNewPasswordInput = document.getElementById('targetNewPassword');

  let activeRequestData = null; // বর্তমানে ওপেন থাকা রিকোয়েস্ট ট্র্যাক মেমোরি
  let activeUserDocId = null;  // টার্গেট ইউজারের ফায়ারস্টোর ডকুমেন্ট আইডি

  // ৩ সেকেন্ডের স্বয়ংক্রিয় পপআপ নোটিফিকেশন ইঞ্জিন
  function showPopup(message, type = 'success') {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = "position:fixed; top:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:10px;";
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-popup toast-${type}`;
    
    let icon = '<i class="fas fa-check-circle" style="color: #00b4d8;"></i>';
    if (type === 'error') icon = '<i class="fas fa-times-circle" style="color: #ff4d6d;"></i>';
    if (type === 'warning') icon = '<i class="fas fa-exclamation-circle" style="color: #fbbf24;"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.4s ease forwards';
      setTimeout(() => { toast.remove(); }, 400);
    }, 3000);
  }

  // মোডাল ক্লোজ ইভেন্ট
  closeModalBtn.addEventListener('click', () => { detailModal.style.display = 'none'; });

  // ২. রিয়েল-টাইম পাসওয়ার্ড রিসেট কিউ লিসেনার লুপ
  const qResets = query(collection(db, "password_resets"), where("status", "==", "pending"));
  onSnapshot(qResets, (snapshot) => {
    if (snapshot.empty) {
      queueRoot.innerHTML = `<div class="empty-queue"><i class="fas fa-folder-open" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.15);"></i> বর্তমানে কোনো পাসওয়ার্ড রিসেট রিকোয়েস্ট পেন্ডিং নেই।</div>`;
      return;
    }

    let queueHtml = "";
    snapshot.forEach((reqDoc) => {
      const rData = reqDoc.data();
      const reqId = reqDoc.id;
      const dateObj = rData.requestedAt ? new Date(rData.requestedAt) : new Date();
      const timeString = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()} — ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;

      queueHtml += `
        <div class="queue-card" data-req-id="${reqId}" data-identifier="${rData.identifier}">
          <div class="queue-left">
            <div class="queue-icon"><i class="fas fa-unlock-alt"></i></div>
            <div class="queue-info">
              <h4>আইডেন্টিফায়ার: ${rData.identifier}</h4>
              <p><i class="far fa-clock"></i> রিকোয়েস্ট টাইম: ${timeString}</p>
            </div>
          </div>
          <button class="queue-action-btn inspect-btn" data-req-id="${reqId}" data-identifier="${rData.identifier}">
            <i class="fas fa-user-search"></i> প্রোফাইল ভেরিফাই করুন
          </button>
        </div>
      `;
    });
    queueRoot.innerHTML = queueHtml;
  });

  // ৩. প্রোফাইল ভেরিফাই এবং ডাইনামিক ইমেজ লোডার ইঞ্জিন ক্লিক ইভেন্ট
  contentRoot.addEventListener('click', async (e) => {
    const targetBtn = e.target.closest('.inspect-btn');
    if (!targetBtn) return;

    const reqId = targetBtn.getAttribute('data-req-id');
    const identifier = targetBtn.getAttribute('data-identifier');

    targetBtn.innerText = "ডাটা খোঁজা হচ্ছে...";
    targetBtn.disabled = true;

    try {
      // মেম্বার আইডি অথবা মোবাইল নম্বর দিয়ে ব্যবহারকারীকে ফায়ারস্টোর থেকে খুঁজে বের করা
      let userQuery = query(collection(db, "users"), where("memberId", "==", identifier));
      let userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        // মোবাইল নম্বর দিয়েও সেকেন্ডারি ট্রাই করা হচ্ছে
        userQuery = query(collection(db, "users"), where("mobile", "==", identifier));
        userSnap = await getDocs(userQuery);
      }

      if (userSnap.empty) {
        showPopup("এই আইডেন্টিফায়ারের বিপরীতে কোনো নিবন্ধিত মেম্বার প্রোফাইল খুঁজে পাওয়া যায়নি!", "error");
        targetBtn.innerText = "প্রোফাইল ভেরিফাই করুন";
        targetBtn.disabled = false;
        return;
      }

      const userDocSnapshot = userSnap.docs[0];
      const uData = userDocSnapshot.data();
      activeUserDocId = userDocSnapshot.id;
      activeRequestData = { reqId: reqId, identifier: identifier };

      // প্রোফাইল ছবি রেন্ডারিং (ফাইল বা ক্লাউড ইউআরএল বা বেস৬৪ সোর্স ডাইনামিক ডিটেকশন)
      let avatarHtml = `<div class="member-avatar-placeholder"><i class="fas fa-user"></i></div>`;
      const finalImgSrc = uData.profileImageUrl || uData.tempBase64Image;
      if (finalImgSrc && finalImgSrc !== "") {
        avatarHtml = `<img src="${finalImgSrc}" class="member-avatar" alt="Member Avatar" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'member-avatar-placeholder\'><i class=\'fas fa-user-times\'></i></div>'">`;
      }

      // হেডার ডাটা বসানো
      document.getElementById('modalProfileHeader').innerHTML = `
        ${avatarHtml}
        <h3>${uData.fullName || 'নাম পাওয়া যায়নি'}</h3>
        <p>${uData.memberId || 'ID Pending'}</p>
      `;

      // স্পেসিফিকেশন ডিটেইলস টেবিল রেন্ডার
      document.getElementById('modalUserSpecs').innerHTML = `
        <div class="detail-row"><span class="detail-label">ইমেইল এড্রেস</span><span class="detail-value">${uData.email || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">মোবাইল নম্বর</span><span class="detail-value">${uData.mobile || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">রোল / পদবি</span><span class="detail-value" style="color:var(--adm-yellow)">${uData.role || 'general_member'}</span></div>
        <div class="detail-row"><span class="detail-label">অ্যাকাউন্ট স্ট্যাটাস</span><span class="detail-value" style="color:${uData.status === 'approved' ? 'var(--adm-success)' : 'var(--adm-danger)'}">${uData.status || 'pending'}</span></div>
      `;

      targetNewPasswordInput.value = "ROS@1234"; // ডিফল্ট রিকোয়েস্টেড পাসওয়ার্ড সাজেস্ট করে রাখা হলো
      detailModal.style.display = 'flex';

    } catch (err) {
      showPopup("প্রোফাইল লোড করতে ব্যর্থ: " + err.message, "error");
    } finally {
      targetBtn.innerHTML = `<i class="fas fa-user-search"></i> প্রোফাইল ভেরিফাই করুন`;
      targetBtn.disabled = false;
    }
  });

  // ৪. পাসওয়ার্ড আপডেট এক্সিকিউশন মেকানিজম
  submitNewPassBtn.addEventListener('click', async () => {
    const newPassValue = targetNewPasswordInput.value.trim();
    if (!newPassValue || newPassValue.length < 6) {
      return showPopup("পাসওয়ার্ড অবশ্যই সর্বনিম্ন ৬ অক্ষরের হতে হবে!", "warning");
    }

    submitNewPassBtn.innerText = "আপডেট হচ্ছে...";
    submitNewPassBtn.disabled = true;

    try {
      // ১. মূল ইউজার ডকুমেন্টে পাসওয়ার্ড ফিল্ড আপডেট (অথবা অ্যাডমিন কমান্ড ফ্ল্যাগ ট্রিগার)
      await updateDoc(doc(db, "users", activeUserDocId), {
        password: newPassValue, // ফায়ারস্টোর ডাটাবেজ ট্র্যাকিং সিঙ্ক
        passwordUpdatedByAdminAt: new Date().toISOString()
      });

      // ২. পেন্ডিং রিকোয়েস্ট কিউটি সফল ও ক্লোজড হিসেবে স্ট্যাটাস আপডেট মার্কার দেওয়া
      await updateDoc(doc(db, "password_resets", activeRequestData.reqId), {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
        assignedPassword: newPassValue
      });

      showPopup(`পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড: ${newPassValue}`, "success");
      detailModal.style.display = 'none';

    } catch (error) {
      showPopup("পাসওয়ার্ড রিসেট ফেইল্ড: " + error.message, "error");
    } finally {
      submitNewPassBtn.innerHTML = `<i class="fas fa-save"></i> পাসওয়ার্ড আপডেট করুন`;
      submitNewPassBtn.disabled = false;
    }
  });

}