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
      .adm-pass-container * { box-sizing: border-box; }
      
      .adm-header-title { font-size: 20px; font-weight: bold; color: var(--adm-cyan); margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid rgba(0, 180, 216, 0.2); padding-bottom: 10px; }
      
      .req-table-wrapper { overflow-x: auto; margin-top: 15px; }
      .req-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
      .req-table th { background: rgba(0, 180, 216, 0.1); color: var(--adm-cyan); padding: 12px; font-weight: 600; border-bottom: 2px solid rgba(0, 180, 216, 0.2); }
      .req-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e5e7eb; vertical-align: middle; }
      .req-table tr:hover { background: rgba(255,255,255,0.02); }
      
      .screenshot-thumb { width: 45px; height: 45px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.2s; }
      .screenshot-thumb:hover { transform: scale(1.08); border-color: var(--adm-cyan); }
      
      .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; text-transform: uppercase; }
      .status-pending { background: rgba(251, 191, 36, 0.15); color: var(--adm-yellow); border: 1px solid rgba(251, 191, 36, 0.3); }
      
      .action-btn { background: linear-gradient(135deg, var(--adm-cyan), #0077b6); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold; transition: 0.2s; }
      .action-btn:hover { opacity: 0.9; box-shadow: 0 0 10px rgba(0, 180, 216, 0.4); }
      
      /* মডাল ডিজাইন */
      .adm-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 99999; justify-content: center; align-items: center; padding: 15px; backdrop-filter: blur(8px); }
      .adm-modal-content { background: #0f172a; border: 1px solid rgba(0,180,216,0.3); width: 100%; max-width: 550px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: modalFade 0.3s ease; }
      
      @keyframes modalFade { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      
      .modal-header { background: rgba(0, 180, 216, 0.08); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,180,216,0.2); }
      .modal-header h3 { margin: 0; font-size: 16px; color: var(--adm-cyan); }
      .close-modal-btn { background: none; border: none; color: var(--adm-muted); font-size: 20px; cursor: pointer; }
      .close-modal-btn:hover { color: var(--adm-danger); }
      
      .modal-body { padding: 20px; max-height: 75vh; overflow-y: auto; }
      
      .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13.5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px; }
      .detail-label { color: var(--adm-muted); }
      .detail-value { color: #f3f4f6; font-weight: 500; text-align: right; }
      
      .modal-footer { padding: 15px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px; justify-content: flex-end; }
      .btn-secondary { background: rgba(255,255,255,0.05); color: var(--adm-muted); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
      .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .btn-success { background: var(--adm-success); color: #fff; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; }
      .btn-success:hover { opacity: 0.9; }

      /* গ্লোবাল পপআপ টোস্ট নোটিফিকেশন */
      .cyber-popup { position: fixed; bottom: 25px; right: 25px; padding: 12px 25px; border-radius: 8px; font-size: 13px; font-weight: bold; z-index: 100000; color: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: none; animation: slideIn 0.3s ease; }
      @keyframes slideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    </style>

    <div class="adm-pass-container">
      <div class="adm-header-title"><i class="fas fa-shield-alt"></i> Password Reset Verification Queue</div>
      <div id="loadingStatus" style="text-align: center; color: var(--adm-muted); font-size: 13px; padding: 20px 0;">অনুরোধের তালিকা লোড হচ্ছে...</div>
      
      <div class="req-table-wrapper" id="tableContainer" style="display:none;">
        <table class="req-table">
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>প্রমাণক স্ক্রিনশট</th>
              <th>ব্যবহারকারী নাম</th>
              <th>রোল</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody id="requestQueueTableBody"></tbody>
        </table>
      </div>
      <div id="emptyQueueMessage" style="display:none; text-align:center; padding:40px 10px; color:var(--adm-muted); font-size:14px;"><i class="fas fa-check-circle" style="color:var(--adm-success); font-size:24px; margin-bottom:10px;"></i><br>বর্তমানে কোনো পাসওয়ার্ড রিসেট অনুরোধ পেন্ডিং নেই।</div>
    </div>

    <div class="adm-modal" id="adminRequestDetailModal">
      <div class="adm-modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-shield"></i> ব্যবহারকারী তথ্য ও রিসেট লিঙ্ক যাচাইকরণ</h3>
          <button class="close-modal-btn" id="closeDetailModalBtn">&times;</button>
        </div>
        <div class="modal-body" id="detailModalBodyContent"></div>
        <div class="modal-footer">
          <button class="btn-secondary" id="cancelRequestBtn">অনুরোধ বাতিল</button>
          <button class="btn-success" id="submitNewPassBtn"><i class="fas fa-paper-plane"></i> রিসেট লিঙ্ক পাঠান</button>
        </div>
      </div>
    </div>

    <div id="cyberToastPopup" class="cyber-popup"></div>
  `;

  // এলিমেন্ট রেফারেন্স রিট্রিভাল
  const tableContainer = document.getElementById('tableContainer');
  const tbody = document.getElementById('requestQueueTableBody');
  const loadingStatus = document.getElementById('loadingStatus');
  const emptyQueueMessage = document.getElementById('emptyQueueMessage');
  
  const detailModal = document.getElementById('adminRequestDetailModal');
  const detailModalBody = document.getElementById('detailModalBodyContent');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const cancelRequestBtn = document.getElementById('cancelRequestBtn');
  const submitNewPassBtn = document.getElementById('submitNewPassBtn');

  let activeRequestData = null;
  let activeUserDocId = null;

  function showPopup(msg, type) {
    const toast = document.getElementById('cyberToastPopup');
    if(toast) {
      toast.innerText = msg;
      toast.style.background = type === 'success' ? 'var(--adm-success)' : type === 'warning' ? 'var(--adm-yellow)' : 'var(--adm-danger)';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }
  }

  async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;
    try {
      await fetch('https://ros-admin.github.io/Rajshahi-Olimpiad-Society/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      });
    } catch (e) { console.warn("Cloudinary delete error:", e); }
  }

  // 🎯 রিয়েল-টাইম লিসেনার (ক্রস কালেকশন অ্যাসিনক্রোনাস ফিক্সড লজিক)
  const q = query(collection(db, "password_resets"), where("status", "==", "pending"));
  onSnapshot(q, async (snapshot) => {
    if(loadingStatus) loadingStatus.style.display = 'none';
    tbody.innerHTML = "";

    if (snapshot.empty) {
      if(tableContainer) tableContainer.style.display = 'none';
      if(emptyQueueMessage) emptyQueueMessage.style.display = 'block';
      return;
    }

    if(emptyQueueMessage) emptyQueueMessage.style.display = 'none';
    if(tableContainer) tableContainer.style.display = 'block';

    // ১. প্রথমে লুপ শেষ হওয়া পর্যন্ত অপেক্ষা করার জন্য ডেটা প্রিপারেশন
    const docsArray = [];
    snapshot.forEach(d => docsArray.push({ id: d.id, data: d.data() }));

    // ২. এবার প্রতিটি রিকোয়েস্টের ইউজার প্রোফাইল লাইভ লোড করা হচ্ছে
    for (const item of docsArray) {
      const data = item.data;
      const dateStr = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('bn-BD') : 'অজানা';
      
      let finalName = data.fullName || "লোড হচ্ছে...";
      let finalRole = data.role || "user";
      
      try {
        // uid বা identifier দিয়ে users কালেকশন চেক করা হচ্ছে
        let uQuery = query(collection(db, "users"), where("uid", "==", data.uid || ""));
        let uSnap = await getDocs(uQuery);
        
        if(uSnap.empty && data.identifier) {
          uQuery = query(collection(db, "users"), where("memberId", "==", data.identifier));
          uSnap = await getDocs(uQuery);
        }

        if(!uSnap.empty) {
          const uData = uSnap.docs[0].data();
          finalName = uData.banglaName || uData.englishName || uData.fullName || finalName;
          finalRole = uData.role || finalRole;
        } else if (data.identifier) {
          finalName = data.identifier; // যদি মেম্বার আইডি থাকে তবে সেটাই নাম হিসেবে সাময়িক দেখাবে
        }
      } catch(e) { console.error(e); }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dateStr}</td>
        <td><img src="${data.proofUrl || data.liveImageUrl || '../placeholder.png'}" class="screenshot-thumb" onclick="window.open('${data.proofUrl || data.liveImageUrl}', '_blank')"></td>
        <td><strong>${finalName}</strong></td>
        <td><span style="font-size:12px; color:var(--adm-cyan); font-weight:bold;">${finalRole.toUpperCase()}</span></td>
        <td><span class="status-badge status-pending">পেন্ডিং</span></td>
        <td><button class="action-btn view-req-trigger" data-req-id="${item.id}" data-uid="${data.uid || ''}" data-identifier="${data.identifier || ''}" data-pubid="${data.publicId || data.cloudinaryPublicId || ''}">যাচাই করুন</button></td>
      `;
      tbody.appendChild(tr);
    }

    // ক্লিক ইভেন্ট লিসেনার সংযুক্তি (ক্লিন ও রিলায়েবল মেথড)
    document.querySelectorAll('.view-req-trigger').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reqId = btn.getAttribute('data-req-id');
        const uid = btn.getAttribute('data-uid');
        const identifier = btn.getAttribute('data-identifier');
        const pubId = btn.getAttribute('data-pubid');

        activeRequestData = { reqId, uid, identifier, pubId };

        try {
          let userQuery = query(collection(db, "users"), where("uid", "==", uid));
          let userSnap = await getDocs(userQuery);
          
          if (userSnap.empty && identifier) {
            userQuery = query(collection(db, "users"), where("memberId", "==", identifier));
            userSnap = await getDocs(userQuery);
          }

          if (userSnap.empty) {
            showPopup("এই ব্যবহারকারীর কোনো নিবন্ধিত প্রোফাইল প্রোফাইল পাওয়া যায়নি!", "error");
            return;
          }

          const uDoc = userSnap.docs[0];
          activeUserDocId = uDoc.id;
          const uData = uDoc.data();

          // মডাল কন্টেন্ট জেনারেশন (আপনার ডাটাবেসের লাইভ ফিল্ড নেম অনুসারে ম্যাপ করা)
          detailModalBody.innerHTML = `
            <div style="text-align:center; margin-bottom:15px;">
              <img src="${uData.profileImageUrl || uData.photoUrl || '../placeholder.png'}" style="width:75px; height:75px; border-radius:50%; border:2px solid var(--adm-cyan); object-fit:cover;">
              <h4 style="margin:8px 0 2px; font-size:15px; color:#fff;">${uData.banglaName || uData.englishName || uData.fullName || 'নাম পাওয়া যায়নি'}</h4>
              <p style="margin:0; font-size:12px; color:var(--adm-muted);">${(uData.role || 'USER').toUpperCase()}</p>
            </div>
            <div class="detail-row"><span class="detail-label">ইমেল অ্যাড্রেস</span><span class="detail-value" id="targetUserEmailHub">${uData.email || 'নাই'}</span></div>
            <div class="detail-row"><span class="detail-label">ফোন নম্বর</span><span class="detail-value">${uData.mobileNumber || uData.phone || 'নাই'}</span></div>
            <div class="detail-row"><span class="detail-label">রেজিস্ট্রেশন আইডি</span><span class="detail-value">${uData.memberId || uData.registrationId || 'নাই'}</span></div>
            
            <div style="background: rgba(251, 191, 36, 0.05); border: 1px dashed var(--adm-yellow); border-radius: 6px; padding: 10px; font-size: 12px; color: var(--adm-yellow); margin-top: 15px; line-height: 1.5;">
              <i class="fas fa-exclamation-triangle"></i> <strong>সতর্কতা:</strong> নিচের বাটনে ক্লিক করলে ফায়ারবেস অথেন্টিকেশন সার্ভার থেকে স্বয়ংক্রিয়ভাবে ব্যবহারকারীর অফিশিয়াল ইমেইলে একটি সিকিউর <strong>পাসওয়ার্ড রিসেট লিংক</strong> চলে যাবে। ব্যবহারকারী ওই লিংকে ক্লিক করে তার নিজের নতুন পাসওয়ার্ড সেট করে নিতে পারবেন।
            </div>
          `;

          detailModal.style.display = 'flex';
        } catch (err) { 
          console.error(err);
          showPopup("ইউজার ডাটা লোড ব্যর্থ হয়েছে!", "error"); 
        }
      });
    });
  });

  // মডাল ক্লোজ লজিক
  if(closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', () => detailModal.style.display = 'none');

  // রিসেট ইমেইল লিঙ্ক পাঠানো (পদ্ধতি ২ এর মূল রূপায়ন)
  if(submitNewPassBtn) {
    submitNewPassBtn.addEventListener('click', async () => {
      const userEmailEl = document.getElementById('targetUserEmailHub');
      const userEmail = userEmailEl ? userEmailEl.innerText.trim() : '';

      if (!userEmail || userEmail === 'নাই' || !userEmail.includes('@')) {
        return showPopup("ব্যবহারকারীর কোনো বৈধ ইমেইল অ্যাড্রেস পাওয়া যায়নি! লিঙ্ক পাঠানো অসম্ভব।", "error");
      }

      try {
        submitNewPassBtn.disabled = true;
        submitNewPassBtn.innerText = "পাঠানো হচ্ছে...";

        const firebaseAuthInstance = auth.app ? auth : (window.auth || auth);
        
        // ফায়ারবেস v10 মডিউলার সিনট্যাক্স অনুযায়ী ডাইনামিক রিলায়েবল ইম্পোর্ট
        const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
        await sendPasswordResetEmail(firebaseAuthInstance, userEmail);
        
        // ডাটাবেসে পাসওয়ার্ড ট্র্যাকিং রেকর্ড আপডেট
        await updateDoc(doc(db, "users", activeUserDocId), { password: "Reset Link Sent To Email" });
        await updateDoc(doc(db, "password_resets", activeRequestData.reqId), { status: "resolved" });
        
        // ক্লাউডিনারি থেকে প্রুф স্ক্রিনশট ইমেজ মুছে ফেলা
        await deleteCloudinaryImage(activeRequestData.pubId);

        showPopup("🔒 সফলভাবে ব্যবহারকারীর অফিশিয়াল ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!", "success");
        detailModal.style.display = 'none';
      } catch (e) { 
        console.error("Firebase Reset Email Error:", e);
        showPopup("লিঙ্ক পাঠাতে ব্যর্থ হয়েছে: " + (e.message || "সার্ভার এরর"), "error"); 
      } finally {
        submitNewPassBtn.disabled = false;
        submitNewPassBtn.innerHTML = `<i class="fas fa-paper-plane"></i> রিসেট লিঙ্ক পাঠান`;
      }
    });
  }

  // অনুরোধ প্রত্যাখ্যান করা
  if(cancelRequestBtn) {
    cancelRequestBtn.addEventListener('click', async () => {
      if (!confirm("আপনি কি নিশ্চিত যে এই পাসওয়ার্ড রিসেট আবেদনটি বাতিল করতে চান?")) return;
      try {
        cancelRequestBtn.disabled = true;
        await updateDoc(doc(db, "password_resets", activeRequestData.reqId), { status: "rejected" });
        await deleteCloudinaryImage(activeRequestData.pubId);

        showPopup("❌ আবেদনটি সফলভাবে বাতিল ও ডিলিট করা হয়েছে।", "warning");
        detailModal.style.display = 'none';
      } catch (e) { 
        showPopup("বাতিল করতে ব্যর্থ হয়েছে", "error"); 
      } finally {
        cancelRequestBtn.disabled = false;
      }
    });
  }
                        }
