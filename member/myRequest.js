// ROS Nexus - Enterprise Member Request Status Module (Ultra Advanced Vertical Tracker & Dynamic Loops)
function loadMyRequestsModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. প্রিমিয়াম সাইবারপাঙ্ক ইউআই এবং ভার্টিক্যাল বাম-পার্শ্বস্থ প্রোগ্রেস লাইন ডিজাইন
  contentRoot.innerHTML = `
    <style>
      .my-req-container { max-width: 1000px; width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; }
      .my-req-title { font-size: 20px; color: #fff; margin-bottom: 25px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
      
      .req-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin: 25px 0 12px 0; display: flex; align-items: center; gap: 8px; }
      .req-section-title span { color: var(--neon-blue); font-weight: bold; }

      /* কম্প্যাক্ট লিস্ট ভিউ */
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
      
      /* নিয়ন স্ট্যাটাস ব্যাজ */
      .status-node { padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; display: flex; align-items: center; gap: 6px; }
      .status-pending { background: rgba(0, 180, 216, 0.15); color: var(--neon-blue); border-color: var(--neon-blue); }
      .status-approved { background: rgba(46, 196, 182, 0.15); color: var(--neon-green); border-color: var(--neon-green); }
      .status-rejected { background: rgba(230, 57, 70, 0.15); color: var(--neon-red); border-color: var(--neon-red); }
      .status-waiting { background: rgba(255, 183, 3, 0.15); color: var(--neon-yellow); border-color: var(--neon-yellow); }
      
      /* স্মুথ এক্সপ্যান্ড ড্রপডাউন */
      .req-expanded-panel { 
        max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
        background: rgba(10, 17, 31, 0.6); border: 0 solid var(--glass-border); border-top: none; 
        border-radius: 0 0 8px 8px; margin-top: -14px; margin-bottom: 15px; padding: 0 20px; box-sizing: border-box;
      }
      .req-expanded-panel.open { max-height: 2000px; padding: 25px 20px; border-width: 0 1px 1px 1px; }

      /* ইউনিক ভার্টিক্যাল প্রোগ্রেস এবং টাইমলাইন এক্সিস */
      .timeline-wrapper { position: relative; padding-left: 35px; margin-left: 15px; }
      
      /* বাম পাশের ডাইনামিক প্রোগ্রেস লাইন বার */
      .vertical-progress-line { 
        position: absolute; left: 5px; top: 10px; bottom: 15px; width: 4px; 
        background: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden; 
      }
      .vertical-progress-fill { 
        width: 100%; height: 0%; 
        background: linear-gradient(180deg, #0077b6, var(--neon-blue), var(--neon-yellow)); 
        transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
      }
      .vertical-progress-fill.complete-approved { background: linear-gradient(180deg, var(--neon-blue), var(--neon-green)); height: 100% !important; }
      .vertical-progress-fill.complete-rejected { background: linear-gradient(180deg, var(--neon-blue), var(--neon-red)); height: 100% !important; }

      /* টাইমলাইন নোড এলিমেন্টস */
      .timeline-axis { display: flex; flex-direction: column; gap: 24px; position: relative; }
      .timeline-node { position: relative; animation: fadeInUp 0.4s ease; }
      
      /* বুলেট ডট */
      .timeline-bullet { 
        position: absolute; left: -35px; top: 2px; width: 14px; height: 14px; 
        border-radius: 50%; background: #1f2937; border: 2px solid #4b5563; 
        box-shadow: 0 0 0 4px #0b111f; transition: 0.3s; z-index: 2;
      }
      
      .node-active .timeline-bullet { background: #030712; border-color: var(--neon-blue); box-shadow: 0 0 12px var(--neon-blue), 0 0 0 4px #0b111f; }
      .node-submitted .timeline-bullet { border-color: #0077b6; background: #0077b6; }
      .node-resubmitted .timeline-bullet { border-color: var(--neon-blue); background: var(--neon-blue); }
      .node-pending .timeline-bullet { border-color: #00b4d8; }
      .node-approved .timeline-bullet { border-color: var(--neon-green); background: var(--neon-green); box-shadow: 0 0 12px var(--neon-green), 0 0 0 4px #0b111f; }
      .node-rejected .timeline-bullet { border-color: var(--neon-red); background: var(--neon-red); box-shadow: 0 0 12px var(--neon-red), 0 0 0 4px #0b111f; }
      .node-hold .timeline-bullet { border-color: var(--neon-yellow); background: var(--neon-yellow); box-shadow: 0 0 12px var(--neon-yellow), 0 0 0 4px #0b111f; }

      /* কন্টেন্ট টেক্সট এবং সুন্দর টাইম বক্স */
      .timeline-content h5 { font-size: 14px; font-weight: 700; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }
      .content-submitted h5 { color: #0077b6; }
      .content-resubmitted h5 { color: var(--neon-blue); }
      .content-pending h5 { color: #00b4d8; }
      .content-approved h5 { color: var(--neon-green); }
      .content-rejected h5 { color: var(--neon-red); }
      .content-hold h5 { color: var(--neon-yellow); }

      .timeline-content p { font-size: 13px; color: #e5e7eb; margin: 0 0 8px 0; line-height: 1.5; font-weight: 500; }
      
      /* সুন্দর বক্সের মধ্যে সময় */
      .time-box { 
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); 
        padding: 4px 10px; border-radius: 4px; font-size: 11px; color: #9ca3af; 
        font-family: 'Orbitron', monospace; font-weight: 600; box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      }

      /* রিজেক্ট/হোল্ড রেসপন্স বক্স */
      .reason-display-box { 
        background: rgba(230, 57, 70, 0.06); border: 1px solid rgba(230, 57, 70, 0.2); 
        padding: 12px; border-radius: 6px; font-size: 12px; margin-top: 8px; color: #ffb3b8; 
        line-height: 1.4; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .reason-display-box.hold-style { 
        background: rgba(255, 183, 3, 0.06); border-color: rgba(255, 183, 3, 0.2); color: #ffe399; 
      }

      /* অ্যাকশন বাটন প্যানেল */
      .action-trigger-area { margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; }
      .edit-redirect-btn { padding: 11px 22px; border-radius: 6px; background: var(--neon-yellow); border: none; color: #030712; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 12px rgba(255, 183, 3, 0.2); transition: 0.2s; text-transform: uppercase; }
      .edit-redirect-btn:hover { transform: translateY(-1px); box-shadow: 0 0 18px rgba(255, 183, 3, 0.5); }

      .no-req-placeholder { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; border: 1px dashed var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.01); }
      
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

  // ২. রিয়েল-টাইম ডাটাবেজ লিসেনার এবং প্রোগ্রেসিভ লুপ আর্কিটেকচার
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

      // আর্কাইভ ক্লিনিং রুলস: ৩ মাস পর অটোমেটিক রিমুভ হবে, তার আগে পুরাতন হিসেবে জমা থাকবে
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

        if (uData.infoApprovalStatus === "waiting") {
          statusText = "হোল্ড (স্থগিত)";
          badgeClass = "status-waiting";
          progressHeightPercent = 65;
        } else if (uData.infoApprovalStatus === "approved") {
          statusText = "অনুমোদিত";
          badgeClass = "status-approved";
          progressFillModifier = "complete-approved";
        } else if (uData.infoApprovalStatus === "rejected") {
          statusText = "প্রত্যাখ্যাত";
          badgeClass = "status-rejected";
          progressFillModifier = "complete-rejected";
        }

        // --- রিকার্সিভ এবং ডাইনামিক ফ্লো ট্র্যাকিং ইঞ্জিন ---
        let nodesArray = [];

        // ধাপ ১: Submitted সবসময় থাকবে
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

        // ধাপ ২: প্রথমবার বা কারেন্ট পেন্ডিং স্টেট ট্র্যাকিং
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

        // ধাপ ৩: যদি হোল্ড (waiting) স্ট্যাটাস সক্রিয় থাকে
        if (uData.infoApprovalStatus === "waiting") {
          // ১ম পেন্ডিং দেখাবে
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
          // তারপর হোল্ড নোড দেখাবে উইথ রিজন বক্স
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

        // ধাপ ৪: ইউজার রিসাবমিট করলে (যখন রিজেক্ট রিজন ফায়ারবেসে আছে কিন্তু স্ট্যাটাস আবার পেন্ডিং)
        if (uData.infoRejectReason && uData.infoApprovalStatus === "pending") {
          progressHeightPercent = 85;
          // পূর্বের ওল্ড হোল্ড হিস্ট্রি ট্রেইল
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
          // রিসাবমিটেড নোড
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
          // কারেন্ট রি-পেন্ডিং এভ্যালুয়েশন
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

        // ধাপ ৫: ফাইনাল এপ্রুভড স্টেট
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

        // ধাপ ৬: ফাইনাল রিজেক্টেড স্টেট
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

        // হোল্ড কন্ডিশনে ডাইনামিক বাটন অ্যাকশন রেন্ডারিং
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
          title: "প্রোফাইল তথ্য পরিবর্তন"
        };

        if (isCurrent) currentCards.push(infoCardObj);
        else previousCards.push(infoCardObj);
      }
    }

    // ==========================================
    // ৩. সিরিয়াল নাম্বার (১, ২, ৩...) হ্যান্ডলিং সহ রেন্ডারার লুপ
    // ==========================================
    const renderCardEngine = (cardsArray) => {
      let output = "";
      cardsArray.forEach((card, index) => {
        const serialNo = index + 1; // ১, ২, ৩ সিরিয়াল নম্বর জেনারেটর
        output += `
          <div>
            <div class="req-compact-card" onclick="this.nextElementSibling.classList.toggle('open')">
              <div class="card-left">
                <div class="card-serial">${serialNo}</div>
                <div class="card-icon" style="color:var(--neon-blue); border-color: rgba(0, 180, 216, 0.3);"><i class="fas fa-user-edit"></i></div>
                <div class="card-details">
                  <h4>${card.title}</h4>
                  <p>আবেদনের তারিখ: ${card.date}</p>
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

    // কারেন্ট রেন্ডারিং কন্ডিশনাল ট্রিগার
    if (currentCards.length === 0) {
      currentRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-box-open" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.2);"></i> বর্তমানে কোনো চলমান আবেদন নেই।</div>`;
    } else {
      currentRoot.innerHTML = renderCardEngine(currentCards);
    }

    // আর্কাইভড পুরাতন রেন্ডারিং কন্ডিশনাল ট্রিগার (৩ মাস থেকে যাবে)
    if (previousCards.length === 0) {
      previousRoot.innerHTML = `<div class="no-req-placeholder"><i class="fas fa-archive" style="font-size:24px; display:block; margin-bottom:8px; color:rgba(255,255,255,0.2);"></i> পুরাতন আর্কাইভ হিস্ট্রি খালি।</div>`;
    } else {
      previousRoot.innerHTML = renderCardEngine(previousCards);
    }

    // ৪. "তথ্য সংশোধন করুন" বাটন নেভিগেশনাল বাবলিং ইভেন্ট লিসেনার ফিক্স
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
