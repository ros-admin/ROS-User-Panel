// ROS Nexus - Enterprise Member Request Status Module (with 14-day Auto-Cleanup)
function loadMyRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. মেম্বার রিকোয়েস্ট স্ট্যাটাস পেজের প্রিমিয়াম সাইবারপাঙ্ক ইউআই
  contentRoot.innerHTML = `
    <style>
      .my-req-container { max-width: 1000px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; }
      .my-req-title { font-size: 20px; color: #fff; margin-bottom: 20px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
      
      /* স্ট্যাটাস কার্ড গ্রিড */
      .req-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
      .req-status-card { padding: 20px; border-radius: 10px; background: rgba(17, 24, 39, 0.4); border: 1px solid var(--glass-border); position: relative; transition: 0.3s; }
      .req-status-card:hover { border-color: var(--neon-blue); box-shadow: 0 0 15px rgba(0, 180, 216, 0.1); }
      
      .req-type-badge { font-size: 12px; font-weight: 700; color: var(--neon-yellow); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
      .req-meta-row { font-size: 13px; color: var(--text-main); margin-bottom: 8px; display: flex; justify-content: space-between; }
      .req-meta-row span { color: var(--text-muted); }
      
      /* ডাইনামিক নিওন স্ট্যাটাস ব্যাজ */
      .status-node { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
      .status-pending { background: rgba(0, 180, 216, 0.15); color: var(--neon-blue); border: 1px solid var(--neon-blue); }
      .status-approved { background: rgba(46, 196, 182, 0.15); color: var(--neon-green); border: 1px solid var(--neon-green); }
      .status-rejected { background: rgba(230, 57, 70, 0.15); color: var(--neon-red); border: 1px solid var(--neon-red); }
      .status-waiting { background: rgba(255, 183, 3, 0.15); color: var(--neon-yellow); border: 1px solid var(--neon-yellow); }
      
      /* অ্যালার্ট বা রিজেক্টের কারণ বক্স */
      .reason-alert-box { margin-top: 15px; padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.5; background: rgba(230, 57, 70, 0.05); border: 1px solid rgba(230, 57, 70, 0.2); color: #ffb3b8; animation: pulseGlow 2s infinite; }
      .reason-alert-box.hold-style { background: rgba(255, 183, 3, 0.05); border-color: rgba(255, 183, 3, 0.2); color: #ffe399; }
      
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 5px rgba(230, 57, 70, 0.05); }
        50% { box-shadow: 0 0 10px rgba(230, 57, 70, 0.15); }
        100% { box-shadow: 0 0 5px rgba(230, 57, 70, 0.05); }
      }
      
      .no-req-placeholder { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; width: 100%; grid-column: span 2; }

      @media (max-width: 768px) { .req-status-grid { grid-template-columns: 1fr; } }
    </style>

    <div class="my-req-container">
      <h3 class="my-req-title"><i class="fas fa-file-invoice"></i> আমার আবেদন মডিউল</h3>
      <div class="req-status-grid" id="requestsGridRoot">
        <div class="no-req-placeholder">ডাটা লোড হচ্ছে...</div>
      </div>
    </div>
  `;

  const gridRoot = document.getElementById('requestsGridRoot');
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  // ২. ইউজারের লাইভ ডকুমেন্ট স্ন্যাপশট লুপ এবং অটো-ক্লিনআপ ইঞ্জিন
  onSnapshot(doc(db, "users", currentUser.uid), async (snapshot) => {
    if (!snapshot.exists()) return;
    const uData = snapshot.data();
    
    let gridHtml = "";
    let hasAnyRequest = false;
    const rightNow = new Date().getTime();
    const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000; // ১৪ দিন মিলিসেকেন্ডে

    // ক) ছবি পরিবর্তনের আবেদন প্রসেসিং ও টাইমার চেক
    if (uData.imageApprovalStatus) {
      let showPhotoCard = true;

      // যদি এপ্রুভ বা রিজেক্ট হয় এবং অ্যাকশন ডেট থাকে, তবে ১৪ দিন ট্র্যাক হবে
      if ((uData.imageApprovalStatus === "approved" || uData.imageApprovalStatus === "rejected") && uData.imageActionAt) {
        const actionTime = uData.imageActionAt.toDate ? uData.imageActionAt.toDate().getTime() : new Date(uData.imageActionAt).getTime();
        if (rightNow - actionTime >= fourteenDaysInMs) {
          showPhotoCard = false;
          // ডাটাবেজ থেকে ক্লিনআপ (অটো ডিলিট)
          await updateDoc(doc(db, "users", currentUser.uid), {
            imageApprovalStatus: null,
            imageRejectReason: null,
            imageActionAt: null,
            tempPendingPhoto: null
          });
        }
      }

      if (showPhotoCard) {
        hasAnyRequest = true;
        let statusBadge = `<span class="status-node status-pending">পেন্ডিং</span>`;
        if (uData.imageApprovalStatus === "approved") statusBadge = `<span class="status-node status-approved">অনুমোদিত</span>`;
        if (uData.imageApprovalStatus === "rejected") statusBadge = `<span class="status-node status-rejected">প্রত্যাখ্যাত</span>`;
        
        // তারিখ ফরম্যাটিং
        let reqDate = "চলতি সেশন";
        if (uData.imageRequestedAt) {
          const d = uData.imageRequestedAt.toDate ? uData.imageRequestedAt.toDate() : new Date(uData.imageRequestedAt);
          reqDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        gridHtml += `
          <div class="req-status-card">
            <div class="req-type-badge"><i class="fas fa-camera"></i> প্রোফাইল ছবি পরিবর্তন</div>
            <div class="req-meta-row"><span>আবেদনের তারিখ:</span> <strong>${reqDate}</strong></div>
            <div class="req-meta-row"><span>আবেদনের অবস্থা:</span> ${statusBadge}</div>
        `;

        // রিজেক্ট হলে নিচের লাইনে কারণ দেখাবে
        if (uData.imageApprovalStatus === "rejected" && uData.imageRejectReason) {
          gridHtml += `
            <div class="reason-alert-box">
              <strong>❌ রিজেক্টের কারণ:</strong> ${uData.imageRejectReason}
            </div>
          `;
        }
        gridHtml += `</div>`;
      }
    }

    // খ) তথ্য পরিবর্তনের আবেদন প্রসেসিং ও টাইমার চেক
    if (uData.infoApprovalStatus) {
      let showInfoCard = true;

      // যদি এপ্রুভ বা রিজেক্ট হয় (waiting/hold বাদে), তবে ১৪ দিন ট্র্যাক হবে
      if ((uData.infoApprovalStatus === "approved" || uData.infoApprovalStatus === "rejected") && uData.infoActionAt) {
        const actionTime = uData.infoActionAt.toDate ? uData.infoActionAt.toDate().getTime() : new Date(uData.infoActionAt).getTime();
        if (rightNow - actionTime >= fourteenDaysInMs) {
          showInfoCard = false;
          // ডাটাবেজ থেকে ক্লিনআপ (অটো ডিলিট)
          await updateDoc(doc(db, "users", currentUser.uid), {
            infoApprovalStatus: null,
            infoRejectReason: null,
            infoActionAt: null,
            tempPendingData: null
          });
        }
      }

      if (showInfoCard) {
        hasAnyRequest = true;
        let statusBadge = `<span class="status-node status-pending">পেন্ডিং</span>`;
        if (uData.infoApprovalStatus === "approved") statusBadge = `<span class="status-node status-approved">অনুমোদিত</span>`;
        if (uData.infoApprovalStatus === "rejected") statusBadge = `<span class="status-node status-rejected">প্রত্যাখ্যাত</span>`;
        if (uData.infoApprovalStatus === "waiting") statusBadge = `<span class="status-node status-waiting">হোল্ড (অপেক্ষমান)</span>`;
        
        let reqDate = "চলতি সেশন";
        if (uData.infoRequestedAt) {
          const d = uData.infoRequestedAt.toDate ? uData.infoRequestedAt.toDate() : new Date(uData.infoRequestedAt);
          reqDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        gridHtml += `
          <div class="req-status-card">
            <div class="req-type-badge" style="color:var(--neon-blue);"><i class="fas fa-user-edit"></i> প্রোফাইল তথ্য পরিবর্তন</div>
            <div class="req-meta-row"><span>আবেদনের তারিখ:</span> <strong>${reqDate}</strong></div>
            <div class="req-meta-row"><span>আবেদনের অবস্থা:</span> ${statusBadge}</div>
        `;

        // রিজেক্ট হলে কারণ দেখাবে
        if (uData.infoApprovalStatus === "rejected" && uData.infoRejectReason) {
          gridHtml += `
            <div class="reason-alert-box">
              <strong>❌ রিজেক্টের কারণ:</strong> ${uData.infoRejectReason}
            </div>
          `;
        }
        
        // হোল্ড বা ওয়েটিং হলে কারণ দেখাবে (হোল্ডের স্টাইল আলাদা)
        if (uData.infoApprovalStatus === "waiting" && uData.infoRejectReason) {
          gridHtml += `
            <div class="reason-alert-box hold-style">
              <strong>⚠️ হোল্ডে রাখার কারণ:</strong> ${uData.infoRejectReason}
              <br><small style="display:block; margin-top:5px; color:rgba(255,255,255,0.7);">* অনুগ্রহ করে প্রোফাইল এডিটে গিয়ে ভুল তথ্যটি সংশোধন করে পুনরায় সাবমিট করুন।</small>
            </div>
          `;
        }
        gridHtml += `</div>`;
      }
    }

    // গ) কোনো আবেদন না থাকলে প্লেসহোল্ডার মেসেজ
    if (!hasAnyRequest) {
      gridRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-folder-open" style="font-size:30px; display:block; margin-bottom:10px;"></i> বর্তমানে আপনার কোনো পরিবর্তন বা সংশোধনের আবেদন নেই।</div>`;
    } else {
      gridRoot.innerHTML = gridHtml;
    }
  });
}

