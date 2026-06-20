// ROS Nexus - Enterprise Admin Password Control & Reset Request Module
export function loadAdminPasswordManagementModule(contentRoot, db, auth, doc, collection, query, where, getDocs, updateDoc, onSnapshot) {
  
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
      
      .adm-module-title { font-size: 22px; color: #fff; margin-bottom: 25px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; display: flex; align-items: center; gap: 12px; }
      .adm-module-title i { color: var(--adm-cyan); text-shadow: 0 0 10px rgba(0, 180, 216, 0.4); }

      .queue-grid { display: flex; flex-direction: column; gap: 14px; }
      .queue-card { padding: 16px 20px; border-radius: 8px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 15px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .queue-card:hover { border-color: var(--adm-yellow); background: rgba(0, 0, 0, 0.5); transform: translateX(4px); box-shadow: 0 4px 15px rgba(251, 191, 36, 0.1); }
      
      .queue-left { display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; }
      .queue-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 77, 109, 0.1); border: 1px solid rgba(255, 77, 109, 0.3); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--adm-danger); flex-shrink: 0; }
      .queue-info { flex: 1; min-width: 0; }
      .queue-info h4 { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 4px 0; }
      .queue-info p { font-size: 11px; color: var(--adm-muted); margin: 0; }
      
      .queue-action-btn { padding: 8px 16px; background: linear-gradient(135deg, #0077b6, var(--adm-cyan)); border: none; border-radius: 4px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 6px; }
      .queue-action-btn:hover { box-shadow: 0 0 12px var(--adm-cyan); }

      .adm-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box; }
      .adm-modal-content { background: var(--card-bg); border: 1px solid rgba(0, 180, 216, 0.3); max-width: 520px; width: 100%; border-radius: 12px; padding: 25px; box-shadow: 0 0 30px rgba(0, 180, 216, 0.2); position: relative; animation: modalSlideUp 0.4s ease; color: #fff; }
      
      .verification-images-container { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; }
      .image-block { text-align: center; flex: 1; }
      .image-block span { display: block; font-size: 11px; color: var(--adm-muted); margin-bottom: 6px; text-transform: uppercase; }
      .verify-img { width: 110px; height: 110px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.1); }
      .verify-img.live { border-color: var(--adm-danger); box-shadow: 0 0 10px rgba(255, 77, 109, 0.3); }
      .verify-img.id-pic { border-color: var(--adm-cyan); box-shadow: 0 0 10px rgba(0, 180, 216, 0.3); }
      .avatar-placeholder { width: 110px; height: 110px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--adm-muted); margin: 0 auto; border: 2px dashed rgba(255,255,255,0.1); }

      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
      .detail-label { color: var(--adm-muted); }
      .detail-value { color: #fff; font-weight: 500; }

      .pass-control-box { margin-top: 15px; }
      .pass-control-box h4 { font-size: 12px; color: var(--adm-yellow); margin: 0 0 8px 0; text-transform: uppercase; }
      .adm-input { width: 100%; padding: 10px 14px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #fff; font-size: 13px; box-sizing: border-box; margin-bottom: 15px; }
      .adm-input:focus { outline: none; border-color: var(--adm-cyan); box-shadow: 0 0 8px rgba(0, 180, 216, 0.3); }

      .modal-actions { display: flex; flex-direction: column; gap: 10px; }
      .action-row-buttons { display: flex; gap: 10px; }
      .btn-cancel-request { background: linear-gradient(135deg, var(--adm-danger), #c9184a); border: none; color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 1; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .btn-update-pass { background: linear-gradient(135deg, var(--adm-success), #1b9e91); border: none; color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; flex: 1.5; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .btn-dismiss-top { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer; text-align: center; }
      .empty-queue { text-align: center; padding: 40px; color: var(--adm-muted); font-size: 13px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; }

      @keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>

    <div class="adm-pass-container">
      <h3 class="adm-module-title"><i class="fas fa-user-shield"></i> পাসওয়ার্ড রিসেট ও ইউজার ভেরিফিকেশন প্যানেল</h3>
      <div class="queue-grid" id="resetQueueRoot">
        <div class="empty-queue">রিকোয়েস্ট ডাটা লোড হচ্ছে...</div>
      </div>
    </div>

    <div id="admDetailModal" class="adm-modal-overlay">
      <div class="adm-modal-content">
        <div class="verification-images-container" id="modalVerifyImages"></div>
        <div id="modalUserSpecs" style="margin-bottom: 15px;"></div>

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
    let container = document.getElementById('notification-container') || document.createElement('div');
    if (!container.id) { container.id = 'notification-container'; container.style.cssText = "position:fixed; top:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:10px;"; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `toast-popup toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  }

  // Cloudinary থেকে লাইভ ইমেজ চিরতরে মুছে ফেলার ইঞ্জিন
  async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;
    try {
      const tokenUrl = `https://api.cloudinary.com/v1_1/dcmu3hius/delete_by_token`;
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("upload_preset", "ros_uploads");
      await fetch(tokenUrl, { method: "POST", body: formData });
    } catch (e) {
      console.warn("Cloudinary cleanup trace skipped:", e);
    }
  }

  closeModalBtn.addEventListener('click', () => { detailModal.style.display = 'none'; });

  const qResets = query(collection(db, "password_resets"), where("status", "==", "pending"));
  onSnapshot(qResets, (snapshot) => {
    if (snapshot.empty) {
      queueRoot.innerHTML = `<div class="empty-queue"><i class="fas fa-folder-open"></i> বর্তমানে কোনো পাসওয়ার্ড রিসেট রিকোয়েস্ট পেন্ডিং নেই।</div>`;
      return;
    }

    let queueHtml = "";
    snapshot.forEach((reqDoc) => {
      const rData = reqDoc.data();
      queueHtml += `
        <div class="queue-card">
          <div class="queue-left">
            <div class="queue-icon"><i class="fas fa-unlock-alt"></i></div>
            <div class="queue-info">
              <h4>আইডেন্টিফায়ার: ${rData.identifier}</h4>
            </div>
          </div>
          <button class="queue-action-btn inspect-btn" data-req-id="${reqDoc.id}" data-identifier="${rData.identifier}" data-live-img="${rData.liveImageUrl || ''}" data-pub-id="${rData.cloudinaryPublicId || ''}">
            <i class="fas fa-user-search"></i> তথ্য ভেরিফাই করুন
          </button>
        </div>
      `;
    });
    queueRoot.innerHTML = queueHtml;
  });

  contentRoot.addEventListener('click', async (e) => {
    const targetBtn = e.target.closest('.inspect-btn');
    if (!targetBtn) return;

    const reqId = targetBtn.getAttribute('data-req-id');
    const identifier = targetBtn.getAttribute('data-identifier');
    const liveImgUrl = targetBtn.getAttribute('data-live-img');
    const pubId = targetBtn.getAttribute('data-pub-id');

    try {
      let userDocSnapshot = null;
      let uData = null;

      let userQuery = query(collection(db, "users"), where("memberId", "==", identifier));
      let userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        userDocSnapshot = userSnap.docs[0];
        uData = userDocSnapshot.data();
      } else {
        let phoneQuery = query(collection(db, "users"), where("mobileNumber", "==", identifier));
        let phoneSnap = await getDocs(phoneQuery);
        if (!phoneSnap.empty) {
          userDocSnapshot = phoneSnap.docs[0];
          uData = userDocSnapshot.data();
        }
      }

      if (!userDocSnapshot) return showPopup("কোনো নিবন্ধিত মেম্বার প্রোফাইল খুঁজে পাওয়া যায়নি!", "error");

      activeUserDocId = userDocSnapshot.id;
      activeRequestData = { reqId: reqId, identifier: identifier, pubId: pubId };

      let liveImageHtml = liveImgUrl ? `<img src="${liveImgUrl}" class="verify-img live">` : `<div class="avatar-placeholder"><i class="fas fa-camera"></i></div>`;
      const idImgSrc = uData.profileImageUrl || uData.tempBase64Image;
      let idImageHtml = idImgSrc ? `<img src="${idImgSrc}" class="verify-img id-pic">` : `<div class="avatar-placeholder"><i class="fas fa-user-shield"></i></div>`;

      document.getElementById('modalVerifyImages').innerHTML = `
        <div class="image-block"><span>লাইভ সেলফি</span>${liveImageHtml}</div>
        <div class="image-block"><span>আইডির ছবি</span>${idImageHtml}</div>
      `;

      document.getElementById('modalUserSpecs').innerHTML = `
        <div class="detail-row"><span class="detail-label">নাম</span><span class="detail-value">${uData.fullName || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">রেজিস্ট্রেশন নাম্বার</span><span class="detail-value">${uData.memberId || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">মোবাইল নাম্বার</span><span class="detail-value">${uData.mobileNumber || 'নাই'}</span></div>
        <div class="detail-row"><span class="detail-label">ইমেইল এড্রেস</span><span class="detail-value">${uData.email || 'নাই'}</span></div>
      `;

      targetNewPasswordInput.value = "ROS@2026";
      detailModal.style.display = 'flex';
    } catch (err) { showPopup("লোড ব্যর্থ", "error"); }
  });

  submitNewPassBtn.addEventListener('click', async () => {
    const newPassValue = targetNewPasswordInput.value.trim();
    if (newPassValue.length < 6) return showPopup("পাসওয়ার্ড সর্বনিম্ন ৬ অক্ষরের হতে হবে!", "warning");

    try {
      await updateDoc(doc(db, "users", activeUserDocId), { password: newPassValue });
      await updateDoc(doc(db, "password_resets", activeRequestData.reqId), { status: "resolved" });
      
      // ক্লাউডিনারি ইমেজ রিমুভাল ট্রিগার
      await deleteCloudinaryImage(activeRequestData.pubId);

      showPopup("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");
      detailModal.style.display = 'none';
    } catch (e) { showPopup("ব্যর্থ হয়েছে", "error"); }
  });

  cancelRequestBtn.addEventListener('click', async () => {
    if (!confirm("আপনি কি আবেদনটি বাতিল করতে চান?")) return;
    try {
      await updateDoc(doc(db, "password_resets", activeRequestData.reqId), { status: "rejected" });
      
      // ক্লাউডিনারি ইমেজ রিমুভাল ট্রিগার
      await deleteCloudinaryImage(activeRequestData.pubId);

      showPopup("আবেদনটি বাতিল করা হয়েছে।", "warning");
      detailModal.style.display = 'none';
    } catch (e) { showPopup("ব্যর্থ হয়েছে", "error"); }
  });
}
