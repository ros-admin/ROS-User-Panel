function loadIdCardsModule(contentRoot, db, collection, onSnapshot, doc, updateDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🪪 মেম্বারশিপ আইডি কার্ড জোন</h2>
      <span style="font-size:12px; color:var(--text-muted);">ডিজিটাল আইডি কার্ড জেনারেটর ও প্রিন্ট স্টেশন</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;">
      
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-green); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">👤 সদস্য আইডি কার্ড সার্চ</h3>
        <label style="font-size:12px; color:var(--text-muted);">সদস্য নির্বাচন করুন:</label>
        <select id="idCardMemberSelect" class="cyber-input" style="background:#000; color:#fff; margin-bottom:20px;">
          <option value="">সদস্য ডাটা লোড হচ্ছে...</option>
        </select>
        
        <div id="idCardMemberDetails" style="display:none; flex-direction:column; gap:10px; font-size:13px; color:var(--text-main);">
          <div><strong>নাম:</strong> <span id="idPreviewName" style="color:#fff;"></span></div>
          <div><strong>মেম্বার আইডি:</strong> <span id="idPreviewUid" style="color:var(--neon-blue); font-family:'Orbitron';"></span></div>
          <div><strong>রোল/পদবী:</strong> <span id="idPreviewRole" style="color:var(--neon-yellow);"></span></div>
          <div><strong>রক্তের গ্রুপ:</strong> <span id="idPreviewBlood" style="color:var(--neon-red);"></span></div>
          <button id="btnPrintCardTrigger" class="cyber-input" style="background:var(--neon-blue); border:none; margin-top:15px; font-weight:bold;">🖨️ কার্ড প্রিন্ট করুন</button>
        </div>
      </div>

      <div style="display:flex; justify-content:center; align-items:center;">
        <div id="virtualIdCardContainer" class="cyber-glass" style="width:320px; height:480px; border-radius:12px; padding:25px; box-shadow:0 0 20px rgba(0,180,216,0.2); border:2px solid var(--neon-blue); display:flex; flex-direction:column; justify-content:space-between; align-items:center; position:relative; background:linear-gradient(135deg, #0d1b2a 0%, #000814 100%); overflow:hidden;">
          
          <div style="position:absolute; width:150px; height:150px; background:var(--neon-blue); filter:blur(80px); opacity:0.3; top:20%; left:25%; z-index:1;"></div>
          
          <div style="text-align:center; z-index:2; width:100%;">
            <h4 style="color:#fff; font-size:16px; letter-spacing:1px; margin:0; font-family:'Orbitron', sans-serif;">ROBOTICS SOCIETY</h4>
            <small style="color:var(--neon-blue); font-size:10px; letter-spacing:2px; font-weight:bold;">OFFICIAL MEMBER</small>
            <div style="width:100%; height:1px; background:linear-gradient(90deg, transparent, var(--neon-blue), transparent); margin-top:8px;"></div>
          </div>

          <div style="z-index:2; text-align:center; margin-top:10px;">
            <div style="width:110px; height:110px; border-radius:50%; border:2px solid var(--neon-green); padding:3px; box-shadow:0 0 10px var(--neon-green); background:#000; display:flex; justify-content:center; align-items:center; overflow:hidden;">
              <img id="idCardAvatar" src="https://via.placeholder.com/150" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
            </div>
          </div>

          <div style="text-align:center; z-index:2; width:100%; margin-top:10px;">
            <h3 id="idCardNameNode" style="color:#fff; font-size:18px; margin:0 0 4px 0;">SELECT MEMBER</h3>
            <span id="idCardRoleNode" style="color:var(--neon-yellow); font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">DESIGNATION</span>
            
            <div style="margin-top:15px; font-family:'Orbitron', sans-serif; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); padding:8px; border-radius:4px;">
              <div style="font-size:9px; color:var(--text-muted);">MEMBER ID NUMBER</div>
              <div id="idCardIdNode" style="font-size:14px; color:var(--neon-green); font-weight:bold; margin-top:2px; letter-spacing:1px;">ROS-XXXX-XXXX</div>
            </div>
          </div>

          <div style="width:100%; display:flex; justify-content:space-between; align-items:center; z-index:2; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; margin-top:10px;">
            <div style="text-align:left; font-size:10px; color:var(--text-muted);">
              <div>রক্তের গ্রুপ: <span id="idCardBloodNode" style="color:var(--neon-red); font-weight:bold;">O+</span></div>
              <div style="margin-top:2px; font-size:9px;">মেয়াদ: ২০২৬-২০২৭</div>
            </div>
            <div style="width:50px; height:50px; background:#fff; padding:3px; border-radius:4px; display:flex; justify-content:center; align-items:center; box-shadow:0 0 10px rgba(255,255,255,0.1);">
              <img id="idCardQrNode" src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=RoboticsSociety" alt="QR" style="width:100%; height:100%;">
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  const memberSelect = document.getElementById('idCardMemberSelect');
  const detailsBox = document.getElementById('idCardMemberDetails');
  let localMembersList = [];

  // ১. ফায়ারবেস থেকে মেম্বার ডাটা ড্রপডাউনে লোড করা
  onSnapshot(collection(db, "users"), (snap) => {
    localMembersList = [];
    memberSelect.innerHTML = `<option value="">-- সদস্য সিলেক্ট করুন --</option>`;
    
    snap.forEach(mDoc => {
      const u = mDoc.data();
      if (u.role !== 'super_admin' && u.status === 'active') {
        localMembersList.push({ id: mDoc.id, ...u });
        memberSelect.innerHTML += `<option value="${mDoc.id}">${u.englishName} (${u.memberId || 'No ID'})</option>`;
      }
    });
  });

  // ২. মেম্বার সিলেক্ট করলে আইডি কার্ডের ডাটা লাইভ আপডেট হওয়া
  memberSelect.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      detailsBox.style.display = "none";
      resetCardView();
      return;
    }

    const m = localMembersList.find(u => u.id === selectedId);
    if (m) {
      detailsBox.style.display = "flex";
      
      // বাম পাশের প্যানেল আপডেট
      document.getElementById('idPreviewName').innerText = m.englishName;
      document.getElementById('idPreviewUid').innerText = m.memberId || "PENDING";
      document.getElementById('idPreviewRole').innerText = (m.role || 'Member').toUpperCase();
      document.getElementById('idPreviewBlood').innerText = m.bloodGroup || "N/A";

      // ডান পাশের আইডি কার্ড ভিউ রিয়েল-টাইম আপডেট
      document.getElementById('idCardNameNode').innerText = m.englishName.toUpperCase();
      document.getElementById('idCardRoleNode').innerText = m.role || 'Member';
      document.getElementById('idCardIdNode').innerText = m.memberId || "PENDING";
      document.getElementById('idCardBloodNode').innerText = m.bloodGroup || "N/A";
      
      if(m.profileImageUrl) {
        document.getElementById('idCardAvatar').src = m.profileImageUrl;
      } else {
        document.getElementById('idCardAvatar').src = "https://via.placeholder.com/150";
      }

      // ডাইনামিক QR কোড জেনারেটর এপিআই (মেম্বার আইডি কোড দিয়ে কিউআর তৈরি হবে)
      const qrData = encodeURIComponent(`ID:${m.memberId || 'N/A'}|Name:${m.englishName}|Status:Verified`);
      document.getElementById('idCardQrNode').src = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${qrData}`;
    }
  });

  function resetCardView() {
    document.getElementById('idCardNameNode').innerText = "SELECT MEMBER";
    document.getElementById('idCardRoleNode').innerText = "DESIGNATION";
    document.getElementById('idCardIdNode').innerText = "ROS-XXXX-XXXX";
    document.getElementById('idCardBloodNode').innerText = "N/A";
    document.getElementById('idCardAvatar').src = "https://via.placeholder.com/150";
    document.getElementById('idCardQrNode').src = "https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=RoboticsSociety";
  }

  // ৩. প্রিন্ট ট্রিগার হ্যান্ডলার
  document.getElementById('btnPrintCardTrigger').addEventListener('click', () => {
    alert("🖨️ আইডি কার্ড প্রিন্টিং মডিউল প্রস্তুত! সিএসএস এবং প্রিন্ট লেআউট আপগ্রেডের সময় এটিকে সরাসরি কাগজে প্রিন্ট করার অপশন অ্যাক্টিভেট হবে।");
  });
}
