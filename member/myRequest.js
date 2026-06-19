// ROS Nexus - Enterprise Member Request Status Module (Ultra Advanced Vertical Tracker & Dynamic Loops)
function loadMyRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. প্রিমিয়াম সাইবেরপাঙ্ক ডার্ক-ম্যাট্রিক্স থিম ইউআই এবং মোবাইল রেসপন্সিভ লেআউট ডিজাইন
  contentRoot.innerHTML = `
    <style>
      .my-req-container { 
        max-width: 1000px; width: 100%; margin: 0 auto; padding: 25px 15px; border-radius: 16px; 
        position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.95); 
        backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); 
        border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); 
        box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif; color: #fff; 
      }
      .my-req-container::before { 
        content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; 
        background: linear-gradient(90deg, transparent, #fbbf24, #00b4d8, transparent); 
      }
      
      .my-req-title { 
        font-size: 20px; color: #fff; margin-bottom: 20px; font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px; 
        display: flex; align-items: center; gap: 12px; 
      }
      .my-req-title i { color: #00b4d8; text-shadow: 0 0 10px rgba(0, 180, 216, 0.4); }
      
      .req-section-title { 
        font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; 
        margin: 30px 0 14px 0; display: flex; align-items: center; gap: 8px; font-weight: 600; 
      }
      .req-section-title span { color: #00b4d8; font-weight: 700; }
      .req-section-title i { color: #fbbf24; }

      /* কম্প্যাক্ট লিস্ট ভিউ - মোবাইল রেসপন্সিভ ফ্লেক্স লেআউট */
      .req-status-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      
      .req-compact-card { 
        padding: 16px 20px; border-radius: 8px; 
        background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.06); 
        display: flex; justify-content: space-between; align-items: center; gap: 15px;
        cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
      }
      .req-compact-card:hover { 
        border-color: #00b4d8; background: rgba(0, 0, 0, 0.5); 
        transform: translateX(4px); box-shadow: 0 4px 15px rgba(0, 180, 216, 0.1); 
      }
      
      /* মোবাইল ওভারল্যাপ ফিক্স করার জন্য লেফট এরিয়া */
      .card-left { display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; }
      .card-serial { 
        font-family: 'Orbitron', monospace, sans-serif; font-size: 13px; font-weight: 800; 
        color: #00b4d8; background: rgba(0, 180, 216, 0.1); width: 30px; height: 30px; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        border: 1px solid rgba(0, 180, 216, 0.3); flex-shrink: 0; 
      }
      .card-icon { 
        width: 38px; height: 38px; border-radius: 6px; background: rgba(255,255,255,0.02); 
        border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; 
        justify-content: center; font-size: 16px; color: #fff; flex-shrink: 0; 
      }
      
      .card-details { flex: 1; min-width: 0; }
      .card-details h4 { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 4px 0; line-height: 1.4; }
      .card-details p { font-size: 11px; color: #9ca3af; margin: 0; }
      
      /* কার্ডের ভেতরের ইনলাইন রিজন ট্যাগ স্টাইল */
      .card-inline-reason { font-size: 11px; margin-top: 6px !important; font-weight: 500; display: block; white-space: normal; word-break: break-word; }
      .reason-red { color: #f87171; }
      .reason-yellow { color: #fbbf24; }
      
      /* নিয়ন স্ট্যাটাস ব্যাজ (মোবাইলের জন্য ফ্লেক্স-শ্রিঙ্ক ফিক্স) */
      .status-node { 
        padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; 
        text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; 
        display: flex; align-items: center; gap: 6px; flex-shrink: 0; white-space: nowrap;
      }
      .status-pending { background: rgba(0, 180, 216, 0.15); color: #00b4d8; border-color: rgba(0, 180, 216, 0.3); }
      .status-approved { background: rgba(46, 196, 182, 0.15); color: #2ec4b6; border-color: rgba(46, 196, 182, 0.3); }
      .status-rejected { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
      .status-waiting { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; }
      
      /* স্মুথ এক্সপ্যান্ড ড্রপডাউন প্যানেল */
      .req-expanded-panel { 
        max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
        background: rgba(0, 0, 0, 0.2); border: 0 solid rgba(255,255,255,0.06); border-top: none; 
        border-radius: 0 0 8px 8px; margin-top: -14px; margin-bottom: 15px; padding: 0 15px; box-sizing: border-box;
      }
      .req-expanded-panel.open { max-height: 2000px; padding: 25px 15px; border-width: 0 1px 1px 1px; }

      /* ইউনিক ভার্টিক্যাল প্রোগ্রেস এবং টাইমলাইন এক্সিস */
      .timeline-wrapper { position: relative; padding-left: 25px; margin-left: 5px; }
      
      /* বাম পাশের ডাইনামিক প্রোগ্রেস লাইন বার */
      .vertical-progress-line { 
        position: absolute; left: 5px; top: 10px; bottom: 15px; width: 3px; 
        background: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden; 
      }
      .vertical-progress-fill { 
        width: 100%; height: 0%; 
        background: linear-gradient(180deg, #0077b6, #00b4d8, #fbbf24); 
        transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
      }
      .vertical-progress-fill.complete-approved { background: linear-gradient(180deg, #00b4d8, #2ec4b6); height: 100% !important; }
      .vertical-progress-fill.complete-rejected { background: linear-gradient(180deg, #00b4d8, #f87171); height: 100% !important; }

      /* টাইমলাইন নোড এলিমেন্টস */
      .timeline-axis { display: flex; flex-direction: column; gap: 24px; position: relative; }
      .timeline-node { position: relative; animation: fadeInUp 0.4s ease; }
      
      /* বুলেট ডট */
      .timeline-bullet { 
        position: absolute; left: -25px; top: 4px; width: 11px; height: 11px; 
        border-radius: 50%; background: #1f2937; border: 2px solid #4b5563; 
        box-shadow: 0 0 0 4px #111827; transition: 0.3s; z-index: 2;
      }
      
      .node-active .timeline-bullet { background: #030712; border-color: #00b4d8; box-shadow: 0 0 12px #00b4d8, 0 0 0 4px #111827; }
      .node-submitted .timeline-bullet { border-color: #0077b6; background: #0077b6; }
      .node-resubmitted .timeline-bullet { border-color: #00b4d8; background: #00b4d8; }
      .node-pending .timeline-bullet { border-color: #00b4d8; background: #00b4d8; }
      .node-approved .timeline-bullet { border-color: #2ec4b6; background: #2ec4b6; box-shadow: 0 0 12px #2ec4b6, 0 0 0 4px #111827; }
      .node-rejected .timeline-bullet { border-color: #f87171; background: #f87171; box-shadow: 0 0 12px #f87171, 0 0 0 4px #111827; }
      .node-hold .timeline-bullet { border-color: #fbbf24; background: #fbbf24; box-shadow: 0 0 12px #fbbf24, 0 0 0 4px #111827; }

      /* কন্টেন্ট টেক্সট এবং সুন্দর টাইম বক্স */
      .timeline-content h5 { font-size: 13px; font-weight: 700; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }
      .content-submitted h5 { color: #0077b6; }
      .content-resubmitted h5 { color: #00b4d8; }
      .content-pending h5 { color: #00b4d8; }
      .content-approved h5 { color: #2ec4b6; }
      .content-rejected h5 { color: #f87171; }
      .content-hold h5 { color: #fbbf24; }

      .timeline-content p { font-size: 12px; color: #e5e7eb; margin: 0 0 8px 0; line-height: 1.5; font-weight: 500; }
      
      /* সুন্দর বক্সের মধ্যে সময় */
      .time-box { 
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); 
        padding: 4px 8px; border-radius: 4px; font-size: 10px; color: #9ca3af; 
        font-family: 'Orbitron', monospace; font-weight: 600; box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
      }

      /* রিজেক্ট/হোল্ড রেসপন্স বক্স */
      .reason-display-box { 
        background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); 
        padding: 10px; border-radius: 6px; font-size: 12px; margin-top: 8px; color: #f87171; 
        line-height: 1.4; box-shadow: 0 2px 8px rgba(0,0,0,0.2); word-break: break-word;
      }
      .reason-display-box.hold-style { 
        background: rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.2); color: #fbbf24; 
      }

      /* অ্যাকশন বাটন প্যানেল */
      .action-trigger-area { margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; }
      .edit-redirect-btn { 
        padding: 10px 20px; border-radius: 6px; background: linear-gradient(135deg, #fbbf24, #d97706); 
        border: none; color: #020c1b; font-size: 12px; font-weight: 700; cursor: pointer; 
        display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); 
        transition: 0.3s; text-transform: uppercase; width: 100%; justify-content: center;
      }
      .edit-redirect-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5); }

      .no-req-placeholder { text-align: center; padding: 35px; color: #6b7280; font-size: 13px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; background: rgba(255,255,255,0.01); }
      
      /* ৫. বিশেষ মোবাইল রেসপন্সিভ মিডিয়া কোয়েরি ফিক্স */
      @media (max-width: 600px) {
        .req-compact-card { flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; }
        .card-left { width: 100%; }
        .status-node { align-self: flex-end; width: auto; font-size: 10px; padding: 4px 10px; }
        .my-req-container { padding: 20px 12px; border-radius: 8px; }
        .timeline-wrapper { padding-left: 20px; margin-left: 0; }
        .timeline-bullet { left: -20px; }
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="my-req-container">
      <h3 class="my-req-title"><i class="fas fa-file-invoice"></i> আমার আবেদন মডিউল</h3>
      
      <div class="req-section-title"><i class="fas fa-satellite-dish"></i> বর্তমান আবেদন <span>(Current Application)</span></div>
      <div class="req-status-grid" id="currentRequestsRoot">
        <div class="no-req-placeholder">ডাটা লোড হচ্ছে...</div>
      </div>

      <div class="req-section-title"><i class="fas fa-history"></i> পুরাতন আর্কাইভ <span>(Previous Application)</span></div>
      <div class="req-status-grid" id="previousRequestsRoot">
        <div class="no-req-placeholder">ডাটা লোড হচ্ছে...</div>
      </div>
    </div>
  `;

  const currentRoot = document.getElementById('currentRequestsRoot');
  const previousRoot = document.getElementById('previousRequestsRoot');
  const currentUser = auth.currentUser;

  if (!currentUser) return;

  // নিখুঁত টাইম বক্স জেনারেটর (বক্স ডিজাইনে সময় দেখাবে)
  const renderTimeBox = (timestampField) => {
    if (!timestampField) return `<div class="time-box"><i class="far fa-clock"></i> লাইভ সেশন রানিং</div>`;
    const d = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
    return `<div class="time-box"><i class="far fa-calendar-alt"></i> ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} — <i class="far fa-clock"></i> ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}</div>`;
  };

  const formatDateOnly = (timestampField) => {
    if (!timestampField) return "চলতি সেশন";
    const d = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // ২. রিয়েল-টাইম ডাটাবেজ লিসেনার এবং প্রোগ্রেসিভ লুপ আর্কিটেকচার (লজিক সম্পূর্ণ অপরিবর্তিত)
  onSnapshot(doc(db, "users", currentUser.uid), async (snapshot) => {
    if (!snapshot.exists()) return;
    const uData = snapshot.data();
    
    let currentCards = [];
    let previousCards = [];
    
    const rightNow = new Date().getTime();
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000; // ৩ মাস সংরক্ষণ মেমোরি

    // ==========================================
    // ক) প্রোফাইল তথ্য পরিবর্তন আবেদন প্রসেসিং (INFO REQUEST)
    // ==========================================
    if (uData.infoApprovalStatus) {
      let isCurrent = uData.infoApprovalStatus === "pending" || uData.infoApprovalStatus === "waiting";
      let showInfoCard = true;

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
        let progressHeightPercent = 40; 
        let progressFillModifier = "";
        let inlineReasonHtml = ""; 

        if (uData.infoApprovalStatus === "waiting") {
          statusText = "হোল্ড (স্থগিত)";
          badgeClass = "status-waiting";
          progressHeightPercent = 65;
          inlineReasonHtml = `<p class="card-inline-reason reason-yellow"><strong>হোল্ডের কারণ:</strong> ${uData.infoRejectReason || "তথ্য অসঙ্গতি রয়েছে। সংশোধন করুন।"}</p>`;
        } else if (uData.infoApprovalStatus === "approved") {
          statusText = "অনুমোদিত";
          badgeClass = "status-approved";
          progressFillModifier = "complete-approved";
        } else if (uData.infoApprovalStatus === "rejected") {
          statusText = "প্রত্যাখ্যাত";
          badgeClass = "status-rejected";
          progressFillModifier = "complete-rejected";
          inlineReasonHtml = `<p class="card-inline-reason reason-red"><strong>বাতিলের কারণ:</strong> ${uData.infoRejectReason || "শর্তাবলী পূরণ করা হয়নি।"}</p>`;
        }

        let nodesArray = [];

        nodesArray.push(`
          <div class="timeline-node node-submitted">
            <div class="timeline-bullet"></div>
            <div class="timeline-content content-submitted">
              <h5>Submitted</h5>
              <p>আপনার তথ্য পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে।</p>
              ${renderTimeBox(uData.infoRequestedAt)}
            </div>
          </div>
        `);

        if (uData.infoApprovalStatus === "pending" && !uData.infoRejectReason) {
          nodesArray.push(`
            <div class="timeline-node node-pending node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-pending">
                <h5>Pending</h5>
                <p>আপনার আবেদন প্রশাসকের পর্যালোচনার অপেক্ষায় রয়েছে।</p>
                ${renderTimeBox(uData.infoRequestedAt)}
              </div>
            </div>
          `);
        }

        if (uData.infoApprovalStatus === "waiting") {
          nodesArray.push(`
            <div class="timeline-node node-pending">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-pending">
                <h5>Pending</h5>
                <p>আপনার আবেদন প্রশাসকের পর্যালোচনার অপেক্ষায় রয়েছে।</p>
                ${renderTimeBox(uData.infoRequestedAt)}
              </div>
            </div>
          `);
          nodesArray.push(`
            <div class="timeline-node node-hold node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-hold">
                <h5>Hold</h5>
                <p>আপনার আবেদন সাময়িকভাবে স্থগিত রাখা হয়েছে।</p>
                <div class="reason-display-box hold-style"><strong>Hold Reason:</strong> ${uData.infoRejectReason || "তথ্য অসঙ্গতি রয়েছে। সংশোধন করুন।"}</div>
                ${renderTimeBox(uData.infoActionAt || uData.infoRequestedAt)}
              </div>
            </div>
          `);
        }

        if (uData.infoRejectReason && uData.infoApprovalStatus === "pending") {
          progressHeightPercent = 85;
          inlineReasonHtml = `<p class="card-inline-reason reason-yellow"><strong>পূর্বের কারণ:</strong> ${uData.infoRejectReason}</p>`;
          
          nodesArray.push(`
            <div class="timeline-node node-hold">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-hold">
                <h5>Hold</h5>
                <p>আপনার আবেদন সাময়িকভাবে স্থগিত রাখা হয়েছে।</p>
                <div class="reason-display-box hold-style"><strong>Previous Reason:</strong> ${uData.infoRejectReason}</div>
                ${renderTimeBox(uData.infoRequestedAt)}
              </div>
            </div>
          `);
          nodesArray.push(`
            <div class="timeline-node node-resubmitted">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-resubmitted">
                <h5>Resubmitted</h5>
                <p>আপনি সংশোধিত তথ্য পুনরায় জমা দিয়েছেন।</p>
                ${renderTimeBox(uData.infoRequestedAt)}
              </div>
            </div>
          `);
          nodesArray.push(`
            <div class="timeline-node node-pending node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-pending">
                <h5>Pending</h5>
                <p>আপনার আবেদনটি পুনরায় সাবমিট করা হয়েছে এবং প্রশাসকের পর্যালোচনার অপেক্ষায় রয়েছে।</p>
                ${renderTimeBox(uData.infoRequestedAt)}
              </div>
            </div>
          `);
        }

        if (uData.infoApprovalStatus === "approved") {
          nodesArray.push(`
            <div class="timeline-node node-approved node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-approved">
                <h5>Approved</h5>
                <p>আপনার আবেদন অনুমোদিত হয়েছে।</p>
                ${renderTimeBox(uData.infoActionAt)}
              </div>
            </div>
          `);
        }

        if (uData.infoApprovalStatus === "rejected") {
          nodesArray.push(`
            <div class="timeline-node node-rejected node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-rejected">
                <h5>Rejected</h5>
                <p>আপনার আবেদন বাতিল করা হয়েছে।</p>
                <div class="reason-display-box"><strong>Reject Reason:</strong> ${uData.infoRejectReason || "শর্তাবলী পূরণ করা হয়নি।"}</div>
                ${renderTimeBox(uData.infoActionAt)}
              </div>
            </div>
          `);
        }

        let editActionHtml = "";
        if (uData.infoApprovalStatus === "waiting") {
          editActionHtml = `
            <div class="action-trigger-area">
              <button class="edit-redirect-btn">
                <i class="fas fa-edit"></i> তথ্য সংশোধন করুন
              </button>
            </div>
          `;
        }

        const infoCardObj = {
          type: 'info',
          date: formatDateOnly(uData.infoRequestedAt),
          badgeClass: badgeClass,
          statusText: statusText,
          progressHeight: progressHeightPercent,
          progressFillModifier: progressFillModifier,
     timelineHtml: nodesArray.join(''),
          actionHtml: editActionHtml,
          inlineReasonHtml: inlineReasonHtml, 
          title: "প্রোফাইল তথ্য পরিবর্তন",
          icon: "fa-user-edit"
        };

        if (isCurrent) currentCards.push(infoCardObj);
        else previousCards.push(infoCardObj);
      }
    }

    // ==========================================
    // খ) প্রোফাইল ছবি পরিবর্তন আবেদন প্রসেসিং (IMAGE REQUEST)
    // ==========================================
    if (uData.imageApprovalStatus && uData.imageApprovalStatus !== "") {
      let isImgCurrent = uData.imageApprovalStatus === "submit" || uData.imageApprovalStatus === "pending";
      let showImgCard = true;

      if (!isImgCurrent && uData.imageActionAt) {
        const imgActionTime = uData.imageActionAt.toDate ? uData.imageActionAt.toDate().getTime() : new Date(uData.imageActionAt).getTime();
        if (rightNow - imgActionTime >= ninetyDaysInMs) {
          showImgCard = false;
          await updateDoc(doc(db, "users", currentUser.uid), {
            imageApprovalStatus: null,
            imageRejectReason: null,
            imageActionAt: null,
            tempBase64Image: null
          });
        }
      }

      if (showImgCard) {
        let imgStatusText = "সাবমিট";
        let imgBadgeClass = "status-pending";
        let imgProgressHeight = 40;
        let imgProgressFillModifier = "";
        let imgInlineReasonHtml = ""; 

        if (uData.imageApprovalStatus === "pending") {
          imgStatusText = "পেন্ডিং";
          imgBadgeClass = "status-waiting";
          imgProgressHeight = 70;
        } else if (uData.imageApprovalStatus === "approved") {
          imgStatusText = "অনুমোদিত";
          imgBadgeClass = "status-approved";
          imgProgressFillModifier = "complete-approved";
        } else if (uData.imageApprovalStatus === "rejected") {
          imgStatusText = "প্রত্যাখ্যাত";
          imgBadgeClass = "status-rejected";
          imgProgressFillModifier = "complete-rejected";
          imgInlineReasonHtml = `<p class="card-inline-reason reason-red"><strong>বাতিলের কারণ:</strong> ${uData.imageRejectReason || "ছবিটি অস্পষ্ট বা নির্দেশিকা অনুযায়ী নয়।"}</p>`;
        }

        let imgNodes = [];

        imgNodes.push(`
          <div class="timeline-node node-submitted">
            <div class="timeline-bullet"></div>
            <div class="timeline-content content-submitted">
              <h5>Submit</h5>
              <p>নতুন প্রোফাইল ছবি সফলভাবে আপলোড এবং সাবমিট করা হয়েছে।</p>
              ${renderTimeBox(uData.imageRequestedAt || uData.imageActionAt)}
            </div>
          </div>
        `);

        if (uData.imageApprovalStatus === "submit" || uData.imageApprovalStatus === "pending") {
          imgNodes.push(`
            <div class="timeline-node node-pending node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-pending">
                <h5>Pending</h5>
                <p>আপনার ছবিটি প্রশাসকের অনুমোদনের অপেক্ষায় আছে।</p>
                ${renderTimeBox(uData.imageRequestedAt || uData.imageActionAt)}
              </div>
            </div>
          `);
        } else {
          imgNodes.push(`
            <div class="timeline-node node-pending">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-pending">
                <h5>Pending</h5>
                <p>আপনার ছবিটি প্রশাসকের অনুমোদনের অপেক্ষায় আছে।</p>
                ${renderTimeBox(uData.imageRequestedAt || uData.imageActionAt)}
              </div>
            </div>
          `);
        }

        if (uData.imageApprovalStatus === "approved") {
          imgNodes.push(`
            <div class="timeline-node node-approved node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-approved">
                <h5>Approved</h5>
                <p>আপনার প্রোফাইল ছবি অনুমোদন করা হয়েছে এবং প্রোফাইল আপডেট সম্পন্ন হয়েছে।</p>
                ${renderTimeBox(uData.imageActionAt)}
              </div>
            </div>
          `);
        }

        if (uData.imageApprovalStatus === "rejected") {
          imgNodes.push(`
            <div class="timeline-node node-rejected node-active">
              <div class="timeline-bullet"></div>
              <div class="timeline-content content-rejected">
                <h5>Rejected</h5>
                <p>আপনার ছবির আবেদনটি বাতিল করা হয়েছে।</p>
                <div class="reason-display-box"><strong>Reject Reason:</strong> ${uData.imageRejectReason || "ছবিটি অস্পষ্ট বা নির্দেশিকা অনুযায়ী নয়।"}</div>
                ${renderTimeBox(uData.imageActionAt)}
              </div>
            </div>
          `);
        }

        const imgCardObj = {
          type: 'image',
          date: formatDateOnly(uData.imageRequestedAt || uData.imageActionAt),
          badgeClass: imgBadgeClass,
          statusText: imgStatusText,
          progressHeight: imgProgressHeight,
          progressFillModifier: imgProgressFillModifier,
          timelineHtml: imgNodes.join(''),
          actionHtml: "",
          inlineReasonHtml: imgInlineReasonHtml, 
          title: "প্রোফাইল ছবি পরিবর্তন",
          icon: "fa-image"
        };

        if (isImgCurrent) currentCards.push(imgCardObj);
        else previousCards.push(imgCardObj);
      }
    }

    // ==========================================
    // ৩. সিরিয়াল নাম্বার হ্যান্ডলিং সহ রেসপন্সিভ রেন্ডারার লুপ
    // ==========================================
    const renderCardEngine = (cardsArray) => {
      let output = "";
      cardsArray.forEach((card, index) => {
        const serialNo = index + 1; 
        output += `
          <div>
            <div class="req-compact-card" onclick="this.nextElementSibling.classList.toggle('open')">
              <div class="card-left">
                <div class="card-serial">${serialNo}</div>
                <div class="card-icon" style="color:#00b4d8; border-color: rgba(0, 180, 216, 0.3);"><i class="fas ${card.icon || 'fa-user-edit'}"></i></div>
                <div class="card-details">
                  <h4>${card.title}</h4>
                  <p>আবেদনের তারিখ: ${card.date}</p>
                  ${card.inlineReasonHtml || ""} 
                </div>
              </div>
              <span class="status-node ${card.badgeClass}">${card.statusText} <i class="fas fa-chevron-down" style="font-size:9px; margin-left:4px;"></i></span>
            </div>
            <div class="req-expanded-panel">
              
              <div class="timeline-wrapper">
                <div class="vertical-progress-line">
                  <div class="vertical-progress-fill ${card.progressFillModifier}" style="height: ${card.progressHeight}%;"></div>
                </div>
                <div class="timeline-axis">
                  ${card.timelineHtml}
                </div>
              </div>
              ${card.actionHtml}
            </div>
          </div>
        `;
      });
      return output;
    };

    if (currentCards.length === 0) {
      currentRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-box-open" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.15);"></i> বর্তমানে কোনো চলমান আবেদন নেই।</div>`;
    } else {
      currentRoot.innerHTML = renderCardEngine(currentCards);
    }

    if (previousCards.length === 0) {
      previousRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-archive" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.15);"></i> পুরাতন আর্কাইভ হিস্ট্রি খালি।</div>`;
    } else {
      previousRoot.innerHTML = renderCardEngine(previousCards);
    }

    // ৪. ইভেন্ট লিসেনার নেভিগেশনাল বাবল ফিক্স
    contentRoot.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.edit-redirect-btn');
      if (targetBtn) {
        const linkNode = document.getElementById('menuUpdateInfoLink') || 
                         document.getElementById('menuProfileEditLink') || 
                         document.querySelector('[id*="UpdateInfo"]') || 
                         document.querySelector('[id*="Edit"]');
        if (linkNode) {
          linkNode.click();
        } else {
          alert("তথ্য সংশোধন করতে সাইডবার মেনু থেকে 'প্রোফাইল আপডেট' অপশনে ক্লিক করুন।");
        }
      }
    });

  });
          }
