// ROS Nexus - Enterprise Member Request Status Module (Fully Upgraded with Serialization, Multi-Timestamp Tracking & Fixes)
function loadMyRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. মেম্বার রিকোয়েস্ট স্ট্যাটাস পেজের প্রিমিয়াম সাইবারপাঙ্ক ইউআই এবং অ্যানিমেশন স্টাইল
  contentRoot.innerHTML = `
    <style>
      .my-req-container { max-width: 1000px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; }
      .my-req-title { font-size: 20px; color: #fff; margin-bottom: 25px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
      
      .req-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin: 25px 0 12px 0; display: flex; align-items: center; gap: 8px; }
      .req-section-title span { color: var(--neon-blue); font-weight: bold; }

      /* কম্প্যাক্ট লিস্ট ভিউ গ্রিড */
      .req-status-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
      
      .req-compact-card { 
        padding: 16px 20px; border-radius: 8px; 
        background: rgba(17, 24, 39, 0.4); border: 1px solid var(--glass-border); 
        display: flex; justify-content: space-between; align-items: center; 
        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
      }
      .req-compact-card:hover { border-color: var(--neon-blue); background: rgba(17, 24, 39, 0.6); transform: translateX(4px); }
      
      .card-left { display: flex; align-items: center; gap: 15px; }
      .card-serial { font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 800; color: var(--neon-blue); background: rgba(0, 180, 216, 0.1); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 180, 216, 0.3); }
      .card-icon { width: 36px; height: 36px; border-radius: 6px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text-main); }
      .card-details h4 { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 4px 0; }
      .card-details p { font-size: 11px; color: var(--text-muted); margin: 0; }
      
      /* ডাইনামিক নিওন স্ট্যাটাস ব্যাজ */
      .status-node { padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; display: flex; align-items: center; gap: 6px; }
      .status-submitted { background: rgba(0, 119, 182, 0.15); color: #0077b6; border-color: #0077b6; }
      .status-pending { background: rgba(0, 180, 216, 0.15); color: var(--neon-blue); border-color: var(--neon-blue); }
      .status-approved { background: rgba(46, 196, 182, 0.15); color: var(--neon-green); border-color: var(--neon-green); }
      .status-rejected { background: rgba(230, 57, 70, 0.15); color: var(--neon-red); border-color: var(--neon-red); }
      .status-waiting { background: rgba(255, 183, 3, 0.15); color: var(--neon-yellow); border-color: var(--neon-yellow); }
      
      /* এক্সপ্যান্ডেবল ড্রপডাউন প্যানেল (Smooth Expand) */
      .req-expanded-panel { 
        max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
        background: rgba(10, 17, 31, 0.6); border: 0 solid var(--glass-border); border-top: none; 
        border-radius: 0 0 8px 8px; margin-top: -14px; margin-bottom: 15px; padding: 0 20px; box-sizing: border-box;
      }
      .req-expanded-panel.open { max-height: 1000px; padding: 25px 20px; border-width: 0 1px 1px 1px; }

      /* প্রোগ্রেস ট্র্যাকার */
      .progress-tracker-container { margin-bottom: 30px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); }
      .progress-info-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
      .progress-info-row span b { color: var(--neon-blue); }
      .progress-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; position: relative; }
      .progress-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #0077b6, var(--neon-blue)); border-radius: 10px; transition: width 0.6s ease; }
      .progress-bar-fill.approved-fill { background: linear-gradient(90deg, var(--neon-blue), var(--neon-green)); }
      .progress-bar-fill.rejected-fill { background: linear-gradient(90deg, var(--neon-blue), var(--neon-red)); }
      .progress-bar-fill.hold-fill { background: linear-gradient(90deg, var(--neon-blue), var(--neon-yellow)); }

      /* প্রফেশনাল টাইমলাইন সিস্টেম */
      .timeline-axis { position: relative; padding-left: 30px; margin-left: 10px; border-left: 2px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 20px; }
      .timeline-node { position: relative; animation: fadeInUp 0.4s ease; }
      .timeline-bullet { position: absolute; left: -37px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: #1f2937; border: 2px solid #4b5563; box-shadow: 0 0 0 4px #0b111f; transition: 0.3s; }
      
      .node-active .timeline-bullet { background: var(--cyber-bg); border-color: var(--neon-blue); box-shadow: 0 0 10px var(--neon-blue), 0 0 0 4px #0b111f; }
      .node-submitted .timeline-bullet { border-color: #0077b6; }
      .node-pending .timeline-bullet { border-color: var(--neon-blue); }
      .node-approved .timeline-bullet { border-color: var(--neon-green); box-shadow: 0 0 10px var(--neon-green), 0 0 0 4px #0b111f; }
      .node-rejected .timeline-bullet { border-color: var(--neon-red); box-shadow: 0 0 10px var(--neon-red), 0 0 0 4px #0b111f; }
      .node-hold .timeline-bullet { border-color: var(--neon-yellow); box-shadow: 0 0 10px var(--neon-yellow), 0 0 0 4px #0b111f; }

      .timeline-content h5 { font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #fff; display: flex; align-items: center; gap: 6px; }
      .timeline-content p { font-size: 12px; color: var(--text-muted); margin: 0 0 4px 0; line-height: 1.4; }
      .timeline-content time { font-size: 11px; color: var(--neon-blue); font-family: monospace; font-weight: 600; display: block; margin-top: 4px; }
      
      /* অ্যাকশন বাটন এরিয়া */
      .action-trigger-area { margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; }
      .edit-redirect-btn { padding: 10px 18px; border-radius: 6px; background: var(--neon-yellow); border: none; color: #030712; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 10px rgba(255, 183, 3, 0.2); transition: 0.2s; }
      .edit-redirect-btn:hover { transform: translateY(-1px); box-shadow: 0 0 15px rgba(255, 183, 3, 0.4); }

      /* অ্যালার্ট রিজেক্ট বক্স ইন্টারনাল */
      .inner-reason-box { background: rgba(230, 57, 70, 0.05); border: 1px solid rgba(230, 57, 70, 0.15); padding: 10px 12px; border-radius: 5px; font-size: 12px; margin-top: 6px; color: #ffb3b8; }
      .inner-reason-box.hold-style { background: rgba(255, 183, 3, 0.05); border-color: rgba(255, 183, 3, 0.15); color: #ffe399; }

      .no-req-placeholder { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; border: 1px dashed var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.01); }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="my-req-container">
      <h3 class="my-req-title"><i class="fas fa-file-invoice"></i> আমার আবেদন মডিউল</h3>
      
      <div class="req-section-title"><i class="fas fa-satellite-dish"></i> রানিং অ্যাপ্লিকেশন <span>(Current Application)</span></div>
      <div class="req-status-grid" id="currentRequestsRoot">
        <div class="no-req-placeholder">ডাটা লোড হচ্ছে...</div>
      </div>

      <div class="req-section-title"><i class="fas fa-history"></i> পূর্ববর্তী আর্কাইভ <span>(Previous Application)</span></div>
      <div class="req-status-grid" id="previousRequestsRoot">
        <div class="no-req-placeholder">ডাটা লোড হচ্ছে...</div>
      </div>
    </div>
  `;

  const currentRoot = document.getElementById('currentRequestsRoot');
  const previousRoot = document.getElementById('previousRequestsRoot');
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  // তারিখ ও সময় ফরম্যাটার হেল্পার ফাংশন (সেকেন্ড ট্র্যাকিং সহ নিখুঁত সময়)
  const formatFullDateTime = (timestampField) => {
    if (!timestampField) return "প্রসেসিং সেশন";
    const d = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
    return `📅 ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} — 🕒 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const formatDateOnly = (timestampField) => {
    if (!timestampField) return "চলতি সেশন";
    const d = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // ২. রিয়েল-টাইম ডাটা সিঙ্ক ও ৩ মাসের অটো-ক্লিনআপ ইঞ্জিন
  onSnapshot(doc(db, "users", currentUser.uid), async (snapshot) => {
    if (!snapshot.exists()) return;
    const uData = snapshot.data();
    
    let currentCards = [];
    let previousCards = [];
    
    const rightNow = new Date().getTime();
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000; // ৩ মাস (৯০ দিন)

    // ==========================================
    // ক) প্রোফাইল তথ্য পরিবর্তন (INFO REQUEST)
    // ==========================================
    if (uData.infoApprovalStatus) {
      let isCurrent = uData.infoApprovalStatus === "pending" || uData.infoApprovalStatus === "waiting";
      let showInfoCard = true;

      // আর্কাইভড ডাটা ৯০ দিন পার হলে অটো-ক্লিনআপ করবে
      if (!isCurrent && uData.infoActionAt) {
        const actionTime = uData.infoActionAt.toDate ? uData.infoActionAt.toDate().getTime() : new Date(uData.infoActionAt).getTime();
        if (rightNow - actionTime >= ninetyDaysInMs) {
          showInfoCard = false;
          await updateDoc(doc(db, "users", currentUser.uid), {
            infoApprovalStatus: null,
            infoRejectReason: null,
            infoActionAt: null,
            tempPendingData: null
          });
        }
      }

      if (showInfoCard) {
        let statusText = "পেন্ডিং";
        let badgeClass = "status-pending";
        let progressPercent = 50;
        let progressColorClass = "hold-fill";

        if (uData.infoApprovalStatus === "waiting") {
          statusText = "হোল্ড (স্থগিত)";
          badgeClass = "status-waiting";
          progressPercent = 65;
          progressColorClass = "hold-fill";
        } else if (uData.infoApprovalStatus === "approved") {
          statusText = "অনুমোদিত";
          badgeClass = "status-approved";
          progressPercent = 100;
          progressColorClass = "approved-fill";
        } else if (uData.infoApprovalStatus === "rejected") {
          statusText = "প্রত্যাখ্যাত";
          badgeClass = "status-rejected";
          progressPercent = 100;
          progressColorClass = "rejected-fill";
        }

        // টাইমলাইন ও প্রত্যেকটি ধাপের সুনির্দিষ্ট সময়
        let timelineNodesHtml = `
          <div class="timeline-node node-submitted">
            <div class="timeline-bullet"></div>
            <div class="timeline-content">
              <h5><i class="fas fa-check-circle" style="color:#0077b6;"></i> Submitted</h5>
              <p>আপনার তথ্য পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে।</p>
              <time>${formatFullDateTime(uData.infoRequestedAt)}</time>
            </div>
          </div>
        `;

        if (uData.infoApprovalStatus === "pending" || uData.infoApprovalStatus === "waiting" || !isCurrent) {
          let pendingMsg = "Your profile update request is currently under review by system admin.";
          if (uData.infoRejectReason && uData.infoApprovalStatus === "pending") {
             pendingMsg = "আপনার আবেদনটি পুনরায় সাবমিট (Resubmitted) করা হয়েছে এবং অ্যাডমিন পর্যালোচনার অপেক্ষায় আছে।";
          }
          timelineNodesHtml += `
            <div class="timeline-node node-pending ${uData.infoApprovalStatus === 'pending' ? 'node-active' : ''}">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-clock" style="color:var(--neon-blue);"></i> Pending Evaluation</h5>
                <p>${pendingMsg}</p>
                <time>${formatFullDateTime(uData.infoRequestedAt)}</time>
              </div>
            </div>
          `;
        }

        if (uData.infoApprovalStatus === "approved") {
          timelineNodesHtml += `
            <div class="timeline-node node-approved node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-check-double" style="color:var(--neon-green);"></i> Approved</h5>
                <p>Your profile modification has been officially approved.</p>
                <time>${formatFullDateTime(uData.infoActionAt)}</time>
              </div>
            </div>
          `;
        } else if (uData.infoApprovalStatus === "rejected") {
          timelineNodesHtml += `
            <div class="timeline-node node-rejected node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-times-circle" style="color:var(--neon-red);"></i> Rejected</h5>
                <p>আপনার তথ্য পরিবর্তনের আবেদন বাতিল করা হয়েছে।</p>
                <div class="inner-reason-box"><strong>Reject Reason:</strong> ${uData.infoRejectReason || "সুনির্দিষ্ট কারণ জানানো হয়নি।"}</div>
                <time>${formatFullDateTime(uData.infoActionAt)}</time>
              </div>
            </div>
          `;
        } else if (uData.infoApprovalStatus === "waiting") {
          timelineNodesHtml += `
            <div class="timeline-node node-hold node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-pause-circle" style="color:var(--neon-yellow);"></i> Hold</h5>
                <p>আপনার আবেদন সাময়িকভাবে স্থগিত রাখা হয়েছে।</p>
                <div class="inner-reason-box hold-style"><strong>Hold Reason:</strong> ${uData.infoRejectReason || "তথ্য অসঙ্গতি।"}</div>
                <time>${formatFullDateTime(uData.infoActionAt || uData.infoRequestedAt)}</time>
              </div>
            </div>
          `;
        }

        let editActionHtml = "";
        if (uData.infoApprovalStatus === "waiting") {
          editActionHtml = `
            <div class="action-trigger-area">
              <button class="edit-redirect-btn" class="profile-fix-trigger-class">
                <i class="fas fa-user-cog"></i> তথ্য সংশোধন করুন
              </button>
            </div>
          `;
        }

        const infoCardObj = {
          type: 'info',
          date: formatDateOnly(uData.infoRequestedAt),
          badgeClass: badgeClass,
          statusText: statusText,
          progressPercent: progressPercent,
          progressColorClass: progressColorClass,
          timeline: timelineNodesHtml,
          actionHtml: editActionHtml,
          title: "প্রোফাইল তথ্য পরিবর্তন"
        };

        if (isCurrent) currentCards.push(infoCardObj);
        else previousCards.push(infoCardObj);
      }
    }

    // ==========================================
    // খ) প্রোফাইল ছবি পরিবর্তন (IMAGE REQUEST)
    // ==========================================
    if (uData.imageApprovalStatus) {
      let isCurrent = uData.imageApprovalStatus === "pending";
      let showPhotoCard = true;

      if (!isCurrent && uData.imageActionAt) {
        const actionTime = uData.imageActionAt.toDate ? uData.imageActionAt.toDate().getTime() : new Date(uData.imageActionAt).getTime();
        if (rightNow - actionTime >= ninetyDaysInMs) {
          showPhotoCard = false;
          await updateDoc(doc(db, "users", currentUser.uid), {
            imageApprovalStatus: null,
            imageRejectReason: null,
            imageActionAt: null,
            tempPendingPhoto: null
          });
        }
      }

      if (showPhotoCard) {
        let statusText = "পেন্ডিং";
        let badgeClass = "status-pending";
        let progressPercent = 50;
        let progressColorClass = "hold-fill";

        if (uData.imageApprovalStatus === "approved") {
          statusText = "অনুমোদিত";
          badgeClass = "status-approved";
          progressPercent = 100;
          progressColorClass = "approved-fill";
        } else if (uData.imageApprovalStatus === "rejected") {
          statusText = "প্রত্যাখ্যাত";
          badgeClass = "status-rejected";
          progressPercent = 100;
          progressColorClass = "rejected-fill";
        }

        let timelineNodesHtml = `
          <div class="timeline-node node-submitted">
            <div class="timeline-bullet"></div>
            <div class="timeline-content">
              <h5><i class="fas fa-check-circle" style="color:#0077b6;"></i> Submitted</h5>
              <p>নতুন প্রোফাইল ছবি আপলোড রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে।</p>
              <time>${formatFullDateTime(uData.imageRequestedAt)}</time>
            </div>
          </div>
          <div class="timeline-node node-pending ${uData.imageApprovalStatus === 'pending' ? 'node-active' : ''}">
            <div class="timeline-bullet"></div>
            <div class="timeline-content">
              <h5><i class="fas fa-clock" style="color:var(--neon-blue);"></i> Pending Evaluation</h5>
              <p>অ্যাডমিন প্যানেল ভেরিফিকেশন প্রসেস রানিং।</p>
              <time>${formatFullDateTime(uData.imageRequestedAt)}</time>
            </div>
          </div>
        `;

        if (uData.imageApprovalStatus === "approved") {
          timelineNodesHtml += `
            <div class="timeline-node node-approved node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-check-double" style="color:var(--neon-green);"></i> Approved</h5>
                <p>আপনার প্রোফাইল ছবি পরিবর্তন সফলভাবে অনুমোদিত হয়েছে।</p>
                <time>${formatFullDateTime(uData.imageActionAt)}</time>
              </div>
            </div>
          `;
        } else if (uData.imageApprovalStatus === "rejected") {
          timelineNodesHtml += `
            <div class="timeline-node node-rejected node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content">
                <h5><i class="fas fa-times-circle" style="color:var(--neon-red);"></i> Rejected</h5>
                <p>আপনার প্রোফাইল ছবি পরিবর্তনের আবেদনটি বাতিল করা হয়েছে।</p>
                <div class="inner-reason-box"><strong>Reject Reason:</strong> ${uData.imageRejectReason || "ত্রুটিপূর্ণ ফাইল বা ছবি অস্পষ্ট।"}</div>
                <time>${formatFullDateTime(uData.imageActionAt)}</time>
              </div>
            </div>
          `;
        }

        const photoCardObj = {
          type: 'image',
          date: formatDateOnly(uData.imageRequestedAt),
          badgeClass: badgeClass,
          statusText: statusText,
          progressPercent: progressPercent,
          progressColorClass: progressColorClass,
          timeline: timelineNodesHtml,
          actionHtml: "",
          title: "প্রোফাইল ছবি পরিবর্তন"
        };

        if (isCurrent) currentCards.push(photoCardObj);
        else previousCards.push(photoCardObj);
      }
    }

    // ==========================================
    // ৩. সিরিয়াল নাম্বার (১, ২, ৩, ৪) সহ রেন্ডারিং লুপ
    // ==========================================
    const compileHtmlFromCards = (cardsArray) => {
      let htmlOutput = "";
      cardsArray.forEach((card, index) => {
        const serialNumber = index + 1; // লুপ ইনডেক্স থেকে সিরিয়াল তৈরি (১, ২, ৩...)
        const iconClass = card.type === 'info' ? 'fas fa-user-edit' : 'fas fa-camera';
        const strokeColor = card.type === 'info' ? 'var(--neon-blue)' : 'var(--neon-yellow)';

        htmlOutput += `
          <div>
            <div class="req-compact-card" onclick="this.nextElementSibling.classList.toggle('open')">
              <div class="card-left">
                <div class="card-serial">${serialNumber}</div>
                <div class="card-icon" style="color: ${strokeColor}; border-color: ${strokeColor}44;"><i class="${iconClass}"></i></div>
                <div class="card-details">
                  <h4>${card.title}</h4>
                  <p>তারিখ: ${card.date}</p>
                </div>
              </div>
              <span class="status-node ${card.badgeClass}">${card.statusText} <i class="fas fa-chevron-down" style="font-size:9px; margin-left:4px;"></i></span>
            </div>
            <div class="req-expanded-panel">
              <div class="progress-tracker-container">
                <div class="progress-info-row">
                  <span>ধাপ প্রোগ্রেস ট্র্যাকার</span>
                  <span>সম্পন্ন: <b>${card.progressPercent}%</b></span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill ${card.progressColorClass}" style="width: ${card.progressPercent}%;"></div>
                </div>
              </div>
              <div class="timeline-axis">
                ${card.timeline}
              </div>
              ${card.actionHtml}
            </div>
          </div>
        `;
      });
      return htmlOutput;
    };

    // কারেন্ট রেন্ডারিং এক্সিকিউশন
    if (currentCards.length === 0) {
      currentRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-box-open" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.2);"></i> বর্তমানে কোনো চলমান আবেদন নেই।</div>`;
    } else {
      currentRoot.innerHTML = compileHtmlFromCards(currentCards);
    }

    // আর্কাইভড রেন্ডারিং এক্সিকিউশন
    if (previousCards.length === 0) {
      previousRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-archive" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.2);"></i> পূর্ববর্তী ৩ মাসের আর্কাইভ হিস্ট্রি খালি।</div>`;
    } else {
      previousRoot.innerHTML = compileHtmlFromCards(previousCards);
    }

    // ৪. "তথ্য সংশোধন করুন" বাটন ক্লিকের গ্লোবাল বাবলিং ফিক্স
    contentRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('.edit-redirect-btn');
      if (btn) {
        // মেম্বার ড্যাশবোর্ডের এডিট প্রোফাইল মডিউল ট্রিগার করার জন্য আইডি ট্র্যাকিং
        const targetMenuNode = document.getElementById('menuUpdateInfoLink') || 
                               document.getElementById('menuProfileEditLink') || 
                               document.querySelector('[id*="UpdateInfo"]') || 
                               document.querySelector('[id*="Edit"]');
        if (targetMenuNode) {
          targetMenuNode.click();
        } else {
          alert("সরাসরি নেভিগেশন করতে অনুগ্রহ করে বাম পাশের সাইডবার প্যানেল থেকে 'প্রোফাইল এডিট' অপশনটি সিলেক্ট করুন।");
        }
      }
    });

  });
}
