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
        --card-bg: rgba(17, 24, 39, 0.95);
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

      /* রিকোয়েস্ট গ্রিড લેআউট */
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

      /* মডাল ওভারলে */
      .adm-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(10px);
        display: none; justify-content: center; align-items: center; z-index: 10000;
        padding: 20px; box-sizing: border-box;
      }
      .adm-modal-content {
        background: var(--card-bg); border: 1px solid rgba(0, 180, 216, 0.3);
        max-width: 520px; width: 100%; border-radius: 12px; padding: 25px;
        box-shadow: 0 0 30px rgba(0, 180, 216, 0.2); position: relative;
        animation: modalSlideUp 0.4s ease; color: #fff;
      }
      
      /* পাশাপাশি দুই ছবি দেখানোর কন্টেইনার */
      .verification-images-container {
        display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;
      }
      .image-block { text-align: center; flex: 1; }
      .image-block span { display: block; font-size: 11px; color: var(--adm-muted); margin-bottom: 6px; text-transform: uppercase; }
      .verify-img { width: 110px; height: 110px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.1); }
      .verify-img.live { border-color: var(--adm-danger); box-shadow: 0 0 10px rgba(255, 77, 109, 0.3); }
      .verify-img.id-pic { border-color: var(--adm-cyan); box-shadow: 0 0 10px rgba(0, 180, 216, 0.3); }
      .avatar-placeholder { width: 110px; height: 110px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--adm-muted); margin: 0 auto; border: 2px dashed rgba(255,255,255,0.1); }

      /* ডিটেইলস টেবিল */
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
      .detail-label { color: var(--adm-muted); }
      .detail-value { color: #fff; font-weight: 500; }

      /* পাসওয়ার্ড কন্ট্রোল এরিয়া */
      .pass-control-box { margin-top: 15px; }
      .pass-control-box h4 { font-size: 12px; color: var(--adm-yellow); margin: 0 0 8px 0; text-transform: uppercase; }
      
      .adm-input {
        width: 100%; padding: 10px 14px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box; margin-bottom: 15px;
      }
      .adm-input:focus { outline: none; border-color: var(--adm-cyan); box-shadow: 0 0 8px rgba(0, 180, 216, 0.3); }

      /* মডাল অ্যাকশন বাটনসমূহ */
      .modal-actions { display: flex; flex-direction: column; gap: 10px; }
      .action-row-buttons { display: flex; gap: 10px; }
      .btn-cancel-request { background: linear-gradient(135deg, var(--adm-danger), #c9184a); border: none; color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 1; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .btn-update-pass { background: linear-gradient(135deg, var(--adm-success), #1b9e91); border: none; color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 1.5; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .btn-dismiss-top { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; }
      
      .empty-queue { text-align: center; padding: 40px; color: var(--adm-muted); font-size: 13px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; }

      @keyframes modalSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @media (max-width: 600px) {
        .queue-card { flex-direction: column; align-items: flex-start; gap: 12px; }
        .queue-action-btn { width: 100%; justify-content: center; }
        .verification-images-container { gap: 10px; }
        .verify-img { width: 90px; height: 90px; }
      }
    </style>

    <div class="adm-pass-container">
      <h3 class="adm-module-title"><i class="fas fa-user-shield"></i> পাসওয়ার্ড রিসেট ও ইউজার ভেরিফিকেশন প্যানেল</h3>
      
      <div class="queue-grid" id="resetQueueRoot">
        <div class="empty-queue">রিকোয়েস্ট ডাটা লোড হচ্ছে...</div>
      </div>
    </div>

    <div id="admDetailModal" class="adm-modal-overlay">
      <div class="adm-modal-content">
        
        <div class="verification-images-container" id="modalVerifyImages">
           </div>

        <div id="modalUserSpecs" style="margin-bottom: 15px;">
          </div>

        <div class="pass-control-box">
          <h4><i class="fas fa-key"></i> নতুন পাসওয়ার্ড লিখুন</h4>
          <input type="text" id="targetNewPassword" class="adm-input" placeholder="পাসওয়ার্ড টাইপ করুন...">
          
          <div class="modal-actions">
            <div class="action-row-buttons">
              <button type="button" class="btn-cancel-request" id="admCancelRequest"><i class="fas fa-user-times"></i> আবেদন বাতিল করুন</button>
              <button type="button" class="btn-update-pass" id="admSubmitNewPass"><i class="fas fa-save"></i> পাসওয়ার্ড পরিবর্তন করুন</button>
            </div>
            <button type="button" class="btn-dismiss-top" id="admCloseModal">শুধুমাত্র উইন্ডোটি বন্ধ করুন</button>
          </div>
        </div>

      </div>
    </div>
  `;

  const queueRoot = document.getElementById('resetQueueRoot');
  const detailModal = document.getElementById('admDetailModal');
  const closeModalBtn = document.getElementById('admCloseModal');
  const submitNewPassBtn = document.getElementById('admSubmitNewPass');
  const cancelRequestBtn = document.getElementById('admCancelRequest');
  const targetNewPasswordInput = document.getElementById('targetNewPassword');

  let activeRequestData = null; 
  let activeUserDocId = null;  

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

  closeModalBtn.addEventListener('click', () => { detailModal.style.display = 'none'; });

  // ২. রিয়েল-টাইম পাসওয়ার্ড রিসেট কিউ লিসেনার
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
        <div class="queue-card" data-req-id="${reqId}">
          <div class="queue-left">
            <div class="queue-icon"><i class="fas fa-unlock-alt"></i></div>
            <div class="queue-info">
              <h4>আইডেন্টিফায়ার: ${rData.identifier}</h4>
              <p><i class="far fa-clock"></i> রিকোয়েস্ট টাইম: ${timeString}</p>
            </div>
          </div>
          <button class="queue-action-btn inspect-btn" data-req-id="${reqId}" data-identifier="${rData.identifier}" data-live-img="${rData.liveImageUrl || ''}">
            <i class="fas fa-user-search"></i> তথ্য ভেরিফাই করুন
          </button>
        </div>
      `;
    });
    queueRoot.innerHTML = queueHtml;
  });

  // ৩. তথ্য ভেরিফাই লজিক (সরাসরি ফিল্ড চেকিং ও পাশাপাশি ডাবল ইমেজ রেন্ডারিং)
  contentRoot.addEventListener('click', async (e) => {
    const targetBtn = e.target.closest('.inspect-btn');
    if (!targetBtn) return;

    const reqId = targetBtn.getAttribute('data-req-id');
    const identifier = targetBtn.getAttribute('data-identifier');
    const liveImgUrl = targetBtn.getAttribute('data-live-img');

    targetBtn.innerText = "ডাটা খোঁজা হচ্ছে...";
    targetBtn.disabled = true;

    try {
      let userDocSnapshot = null;
      let uData = null;

      // প্রথমে memberId দিয়ে সার্চ
      let userQuery = query(collection(db, "users"), where("memberId", "==", identifier));
      let userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        userDocSnapshot = userSnap.docs[0];
        uData = userDocSnapshot.data();
      } else {
        // না মিললে সরাসরি mobileNumber দিয়ে সার্চ
        let phoneQuery = query(collection(db, "users"), where("mobileNumber", "==", identifier));
        let phoneSnap = await getDocs(phoneQuery);
        
        if (!phoneSnap.empty) {
          userDocSnapshot = phoneSnap.docs[0];
          uData = userDocSnapshot.data();
        }
      }

      if (!userDocSnapshot) {
        showPopup("এই আইডেন্টিফায়ারের বিপরীতে কোনো নিবন্ধিত মেম্বার প্রোফাইল খুঁজে পাওয়া যায়নি!", "error");
        return;
      }

      activeUserDocId = userDocSnapshot.id;
      activeRequestData = { reqId: reqId, identifier: identifier };

      // পাশাপাশি লাইভ ছবি ও আইডির প্রোফাইল ছবি রেন্ডারিং
      let liveImageHtml = liveImgUrl 
        ? `<img src="${liveImgUrl}" class="verify-img live" alt="Live Face">`
        : `<div class="avatar-placeholder"><i class="fas fa-camera-home"></i></div>`;

      const idImgSrc = uData.profileImageUrl || uData.tempBase64Image;
      let idImageHtml = (idImgSrc && idImgSrc !== "")
        ? `<img src="${idImgSrc}" class="verify-img id-pic" alt="ID Profile">`
        : `<div class="avatar-placeholder"><i class="fas fa-user-shield"></i></div>`;

      document.getElementById('modalVerifyImages').innerHTML = `
        <div class="image-block"><span>লাইভ ছবি (Live Capture)</span>${liveImageHtml}</div>
        <div class="image-block"><span>আইডির ছবি (Profile Pic)</span>${idImageHtml}</div>
      `;

      // নিচে নাম, রেজিস্ট্রেশন নাম্বার, মোবাইল নাম্বার আর ইমেইল এড্রেস অপশন
      document.getElementById('modalUserSpecs').innerHTML = `
        <div class="detail-row"><span class="detail-label">নাম</span><span class="detail-value">${uData.fullName || 'নাম পাওয়া যায়নি'}</span></div>
        <div class="detail-row"><span class="detail-label">রেজিস্ট্রেশন নাম্বার</span><span class="detail-value">${uData.memberId || 'ID Pending'}</span></div>
        <div class="detail-row"><span class="detail-label">মোবাইল নাম্বার</span><span class="detail-value">${uData.mobileNumber || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">ইমেইল এড্রেস</span><span class="detail-value">${uData.email || 'নাই'}</span></div>
      `;

      targetNewPasswordInput.value = "ROS@1234"; // ডিফল্ট সাজেস্টেড পাসওয়ার্ড
      detailModal.style.display = 'flex';

    } catch (err) {
      showPopup("প্রোফাইল লোড করতে ব্যর্থ: " + err.message, "error");
    } finally {
      targetBtn.innerHTML = `<i class="fas fa-user-search"></i> তথ্য ভেরিফাই করুন`;
      targetBtn.disabled = false;
    }
  });

  // ৪. পাসওয়ার্ড পরিবর্তন করুন অ্যাকশন
  submitNewPassBtn.addEventListener('click', async () => {
    const newPassValue = targetNewPasswordInput.value.trim();
    if (!newPassValue || newPassValue.length < 6) {
      return showPopup("পাসওয়ার্ড অবশ্যই সর্বনিম্ন ৬ অক্ষরের হতে হবে!", "warning");
    }

    submitNewPassBtn.innerText = "পরিবর্তন হচ্ছে...";
    submitNewPassBtn.disabled = true;

    try {
      await updateDoc(doc(db, "users", activeUserDocId), {
        password: newPassValue,
        passwordUpdatedByAdminAt: new Date().toISOString()
      });

      await updateDoc(doc(db, "password_resets", activeRequestData.reqId), {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
        assignedPassword: newPassValue
      });

      showPopup(`পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড: ${newPassValue}`, "success");
      detailModal.style.display = 'none';

    } catch (error) {
      showPopup("পাসওয়ার্ড পরিবর্তন ব্যর্থ: " + error.message, "error");
    } finally {
      submitNewPassBtn.innerHTML = `<i class="fas fa-save"></i> পাসওয়ার্ড পরিবর্তন করুন`;
      submitNewPassBtn.disabled = false;
    }
  });

  // ৫. আবেদন বাতিল করুন অ্যাকশন
  cancelRequestBtn.addEventListener('click', async () => {
    if (!confirm("আপনি কি নিশ্চিত যে এই পাসওয়ার্ড রিসেট আবেদনটি বাতিল করতে চান?")) return;

    cancelRequestBtn.innerText = "বাতিল হচ্ছে...";
    cancelRequestBtn.disabled = true;

    try {
      await updateDoc(doc(db, "password_resets", activeRequestData.reqId), {
        status: "rejected",
        rejectedAt: new Date().toISOString()
      });

      showPopup("আবেদনটি সফলভাবে বাতিল করা হয়েছে।", "warning");
      detailModal.style.display = 'none';

    } catch (error) {
      showPopup("আবেদন বাতিল করতে সমস্যা হয়েছে: " + error.message, "error");
    } finally {
      cancelRequestBtn.innerHTML = `<i class="fas fa-user-times"></i> আবেদন বাতিল করুন`;
      cancelRequestBtn.disabled = false;
    }
  });

}
