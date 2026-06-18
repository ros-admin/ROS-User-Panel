// ড্যাশবোর্ড মডিউলের মূল ফাংশন
function loadDashboardModule(contentRoot, currentAdminData, db, collection, onSnapshot, doc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <!-- স্বাগতম সেকশন -->
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${currentAdminData.englishName}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">অনলাইন</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <!-- ইন্টারঅ্যাক্টিভ বাটন গ্রিড কাউন্টার -->
    <p style="font-size: 13px; color: var(--neon-blue); margin-bottom: 10px;"><i class="fas fa-mouse-pointer"></i> যেকোনো সেকশনের বিস্তারিত তথ্য ও অ্যাকশন প্যানেল দেখতে কার্ডে ক্লিক করুন:</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
      
      <div class="cyber-glass dashboard-btn" id="btnTotal" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid var(--neon-blue);">
        <i class="fas fa-users" style="color:var(--neon-blue); font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">মোট সদস্য</small>
        <h2 id="cTotal" style="color:var(--neon-blue); margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

      <div class="cyber-glass dashboard-btn" id="btnActive" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid var(--neon-green);">
        <i class="fas fa-user-check" style="color:var(--neon-green); font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">সক্রিয় সদস্য</small>
        <h2 id="cActive" style="color:var(--neon-green); margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

      <div class="cyber-glass dashboard-btn" id="btnPending" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid var(--neon-yellow);">
        <i class="fas fa-clock" style="color:var(--neon-yellow); font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">পেন্ডিং অনুমোদন</small>
        <h2 id="cPending" style="color:var(--neon-yellow); margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

      <div class="cyber-glass dashboard-btn" id="btnInfoRequests" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid #00f5d4;">
        <i class="fas fa-id-card-alt" style="color:#00f5d4; font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">তথ্য পরিবর্তন আবেদন</small>
        <h2 id="cInfoRequests" style="color:#00f5d4; margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

      <div class="cyber-glass dashboard-btn" id="btnResetRequests" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid #a855f7;">
        <i class="fas fa-unlock-alt" style="color:#a855f7; font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">পাসওয়ার্ড রিসেট</small>
        <h2 id="cResetRequests" style="color:#a855f7; margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

      <div class="cyber-glass dashboard-btn" id="btnTreasury" style="padding:20px; text-align:center; cursor:pointer; transition: 0.3s; border-bottom: 3px solid var(--neon-red);">
        <i class="fas fa-exchange-alt" style="color:var(--neon-red); font-size:18px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600; display:block; margin-top:5px;">মোট ট্রানজেকশন</small>
        <h2 id="cTreasury" style="color:var(--neon-red); margin-top:5px; font-family:'Orbitron';">...</h2>
      </div>

    </div>

    <!-- ডাইনামিক লাইভ অ্যাকশন হাব উইন্ডো -->
    <div id="dashboardActionWorkspace" class="cyber-glass" style="padding: 25px; border-radius: 8px; display: none; border-top: 4px solid var(--neon-blue);">
      <div style="display:flex; justify-content:between; align-items:center; margin-bottom: 20px;">
        <h3 id="workspaceTitle" style="color: #fff; font-size: 16px;">বিস্তারিত তথ্য</h3>
        <span style="font-size:11px; color:var(--text-muted);">কনসোল ওয়ার্কস্পেস</span>
      </div>
      <div id="workspaceContent" style="overflow-x: auto;">
         <!-- এখানে ক্লিক করা ক্যাটাগরির টেবিল/ডাটা লোড হবে -->
      </div>
    </div>
  `;

  // ইন্টারঅ্যাক্টিভ সিএসএস ইফেক্ট যোগ করা
  const style = document.createElement('style');
  style.innerHTML = `
    .dashboard-btn:hover { transform: translateY(-5px); background: rgba(0, 180, 216, 0.15) !important; box-shadow: 0 5px 15px rgba(0,180,216,0.2) !important; }
    .action-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    .action-table th, .action-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--glass-border); color: var(--text-main); }
    .action-table th { color: var(--neon-blue); background: rgba(0,0,0,0.3); }
    .btn-action-success { background: var(--neon-green); color: #000; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-right: 5px; }
    .btn-action-danger { background: var(--neon-red); color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
  `;
  document.head.appendChild(style);

  // লোকাল মেমোরি কন্টেইনার (রিয়েল-টাইম ডাটা স্টোর রাখার জন্য)
  let localUsersCache = [];
  let localInfoRequestsCache = [];
  let localResetsCache = [];
  let localTreasuryCache = [];

  // ১. মেম্বার ডাটা ট্র্যাকিং এবং লাইভ আপডেটিং
  onSnapshot(collection(db, "users"), (snap) => {
    const nonAdminDocs = snap.docs.filter(d => d.data().role !== 'super_admin');
    localUsersCache = nonAdminDocs.map(d => ({ id: d.id, ...d.data() }));
    
    document.getElementById('cTotal').innerText = nonAdminDocs.length;
    document.getElementById('cActive').innerText = nonAdminDocs.filter(d => d.data().status === 'active').length;
    document.getElementById('cPending').innerText = nonAdminDocs.filter(d => d.data().status === 'pending').length;
  });

  // ২. তথ্য পরিবর্তন রিকোয়েস্ট ট্র্যাকিং (Firestore collection: profile_update_requests)
  onSnapshot(collection(db, "profile_update_requests"), (snap) => {
    localInfoRequestsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('cInfoRequests').innerText = snap.size;
  }, () => { document.getElementById('cInfoRequests').innerText = "0"; });

  // ৩. পাসওয়ার্ড রিসেট আবেদন ট্র্যাকিং
  onSnapshot(collection(db, "password_resets"), (snap) => {
    localResetsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('cResetRequests').innerText = snap.size;
  }, () => { document.getElementById('cResetRequests').innerText = "0"; });

  // ৪. ট্রানজেকশন ট্র্যাকিং
  onSnapshot(collection(db, "treasury"), (snap) => {
    localTreasuryCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('cTreasury').innerText = snap.size;
  });

  // ================= বাটন ক্লিকের কার্যকারিতাসমূহ =================
  const workspace = document.getElementById('dashboardActionWorkspace');
  const wsTitle = document.getElementById('workspaceTitle');
  const wsContent = document.getElementById('workspaceContent');

  function openWorkspace(title, htmlContent) {
    workspace.style.display = 'block';
    wsTitle.innerHTML = title;
    wsContent.innerHTML = htmlContent;
    workspace.scrollIntoView({ behavior: 'smooth' });
  }

  // ক. পেন্ডিং অনুমোদন বাটন ক্লিক (সদস্য হওয়ার অনুমতি প্রদান জোন)
  document.getElementById('btnPending').addEventListener('click', () => {
    const pendings = localUsersCache.filter(u => u.status === 'pending');
    if (pendings.length === 0) {
      openWorkspace("⏳ পেন্ডিং অনুমোদন প্যানেল", "<p style='color:var(--text-muted);'>কোনো পেন্ডিং সদস্যের আবেদন নেই।</p>");
      return;
    }
    let html = `<table class="action-table">
      <tr><th>নাম</th><th>ইমেইল</th><th>রোল</th><th>অ্যাকশন</th></tr>`;
    pendings.forEach(u => {
      html += `<tr>
        <td>${u.englishName || 'N/A'}</td>
        <td>${u.email || 'N/A'}</td>
        <td><span style="color:var(--neon-yellow);">${u.role || 'member'}</span></td>
        <td>
          <button class="btn-action-success" onclick="approveUserStatus('${u.id}')">অনুমোদন দিন</button>
          <button class="btn-action-danger" onclick="rejectUserRequest('${u.id}', 'users')">বাতিল</button>
        </td>
      </tr>`;
    });
    html += `</table>`;
    openWorkspace("⏳ পেন্ডিং অনুমোদন প্যানেল (নতুন সদস্য ভেরিফিকেশন স্টেশন)", html);
  });

  // খ. তথ্য পরিবর্তন আবেদন বাটন ক্লিক (এডমিন অ্যাপ্রুভাল মডিউল)
  document.getElementById('btnInfoRequests').addEventListener('click', () => {
    if (localInfoRequestsCache.length === 0) {
      openWorkspace("📝 তথ্য পরিবর্তন আবেদন তালিকা", "<p style='color:var(--text-muted);'>বর্তমানে কোনো প্রোফাইল পরিবর্তনের আবেদন জমা নেই।</p>");
      return;
    }
    let html = `<table class="action-table">
      <tr><th>বর্তমান সদস্য</th><th>পরিবর্তনসমূহ</th><th>আবেদনের তারিখ</th><th>অ্যাকশন</th></tr>`;
    localInfoRequestsCache.forEach(r => {
      let changesText = "";
      // রিকোয়েস্টে আসা অবজেক্টের কী ও ভ্যালুগুলো লুপ করে দেখানো হচ্ছে
      if(r.requestedChanges) {
        for (const [key, value] of Object.entries(r.requestedChanges)) {
          changesText += `<b>${key}:</b> ${value}<br>`;
        }
      }
      html += `<tr>
        <td><b>${r.userEmail || 'N/A'}</b><br><small style="color:var(--text-muted);">UID: ${r.userId}</small></td>
        <td style="color:#00f5d4;">${changesText || 'কোনো তথ্য নেই'}</td>
        <td>${r.timestamp ? new Date(r.timestamp).toLocaleDateString('bn-BD') : 'N/A'}</td>
        <td>
          <button class="btn-action-success" onclick="approveProfileChange('${r.id}', '${r.userId}', ${JSON.stringify(r.requestedChanges).replace(/"/g, '&quot;')})">অনুমতি দিন</button>
          <button class="btn-action-danger" onclick="rejectUserRequest('${r.id}', 'profile_update_requests')">বাতিল</button>
        </td>
      </tr>`;
    });
    html += `</table>`;
    openWorkspace("📝 তথ্য পরিবর্তন আবেদন প্যানেল (প্রোফাইল ডেটা এডিট গেটওয়ে)", html);
  });

  // গ. মোট সদস্য বাটন ক্লিক
  document.getElementById('btnTotal').addEventListener('click', () => {
    let html = `<table class="action-table"><tr><th>নাম</th><th>ইমেইল</th><th>স্ট্যাটাস</th></tr>`;
    localUsersCache.forEach(u => {
      html += `<tr><td>${u.englishName}</td><td>${u.email}</td><td>${u.status === 'active' ? '<span style="color:var(--neon-green)">Active</span>':'<span style="color:var(--neon-yellow)">Pending</span>'}</td></tr>`;
    });
    html += `</table>`;
    openWorkspace("👥 কেন্দ্রীয় সিস্টেম মেম্বার ডিরেক্টরি", html);
  });

  // ঘ. সক্রিয় সদস্য বাটন ক্লিক
  document.getElementById('btnActive').addEventListener('click', () => {
    const actives = localUsersCache.filter(u => u.status === 'active');
    let html = `<table class="action-table"><tr><th>নাম</th><th>ইমেইল</th></tr>`;
    actives.forEach(u => { html += `<tr><td>${u.englishName}</td><td>${u.email}</td></tr>`; });
    html += `</table>`;
    openWorkspace("🟢 অন-ডিউটি সক্রিয় সদস্য তালিকা", html);
  });

  // ঙ. পাসওয়ার্ড রিসেট বাটন ক্লিক
  document.getElementById('btnResetRequests').addEventListener('click', () => {
    if(localResetsCache.length === 0){
      openWorkspace("🔐 পাসওয়ার্ড রিসেট লগ স্টেশন", "<p style='color:var(--text-muted);'>কোনো পাসওয়ার্ড রিসেট আবেদন পেন্ডিং নেই।</p>"); return;
    }
    let html = `<table class="action-table"><tr><th>ইউজার আইডি/ইমেইল</th><th>অ্যাকশন</th></tr>`;
    localResetsCache.forEach(r => {
      html += `<tr><td>${r.email || r.id}</td><td><button class="btn-action-danger" onclick="rejectUserRequest('${r.id}', 'password_resets')">লগ ক্লিয়ার করুন</button></td></tr>`;
    });
    html += `</table>`;
    openWorkspace("🔐 পাসওয়ার্ড রিসেট রিকোয়েস্ট ট্র্যাকার", html);
  });

  // চ. ট্রানজেকশন বাটন ক্লিক
  document.getElementById('btnTreasury').addEventListener('click', () => {
    if(localTreasuryCache.length === 0){
      openWorkspace("💰 সেন্ট্রাল লেজার হিস্টোরি", "<p style='color:var(--text-muted);'>কোনো ট্রানজেকশন হিস্টোরি পাওয়া যায়নি।</p>"); return;
    }
    let html = `<table class="action-table"><tr><th>ID</th><th>বিবরণ</th></tr>`;
    localTreasuryCache.forEach(t => { html += `<tr><td>${t.id}</td><td>ট্রেজারি নোড এন্ট্রি ভেরিফাইড</td></tr>`; });
    html += `</table>`;
    openWorkspace("💰 সেন্ট্রাল লেজার হিস্টোরি", html);
  });


  // ================= গ্লোবাল উইন্ডো অ্যাকশন ফাংশনসমূহ (উইন্ডো অবজেক্টে পুশ করা হয়েছে যাতে HTML অনক্লিক ইভেন্ট পায়) =================
  
  // ১. সদস্য পদ অনুমোদন করা
  window.approveUserStatus = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), { status: "active" });
      alert("✅ সদস্য সফলভাবে অনুমোদিত এবং সক্রিয় হয়েছে!");
      document.getElementById('btnPending').click(); // রিফ্রেশ ইফেক্ট
    } catch (err) { alert("ত্রুটি: " + err.message); }
  };

  // ২. প্রোফাইল ইনফো পরিবর্তনের রিকোয়েস্ট এপ্রুভ করা
  window.approveProfileChange = async (requestId, userId, requestedChanges) => {
    try {
      // মূল ইউজারের ডকুমেন্টে নতুন চেঞ্জগুলো রাইট করা হচ্ছে
      await updateDoc(doc(db, "users", userId), requestedChanges);
      // রিকোয়েস্টটি প্রসেসড হয়ে যাওয়ায় কালেকশন থেকে ডিলিট করা হচ্ছে
      await deleteDoc(doc(db, "profile_update_requests", requestId));
      alert("✅ ব্যবহারকারীর তথ্য পরিবর্তন সফলভাবে অনুমোদন এবং ডাটাবেজে আপডেট করা হয়েছে!");
      document.getElementById('btnInfoRequests').click(); // রিফ্রেশ ওয়ার্কস্পেস
    } catch (err) { alert("ত্রুটি: " + err.message); }
  };

  // ৩. যেকোনো রিকোয়েস্ট রিজেক্ট/ডিলিট করা
  window.rejectUserRequest = async (id, collectionName) => {
    if (confirm("আপনি কি নিশ্চিত যে এই আবেদনটি বাতিল করতে চান?")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        alert("❌ আবেদনটি বাতিল ও রিমুভ করা হয়েছে।");
        if(collectionName === 'users') document.getElementById('btnPending').click();
        if(collectionName === 'profile_update_requests') document.getElementById('btnInfoRequests').click();
        if(collectionName === 'password_resets') document.getElementById('btnResetRequests').click();
      } catch (err) { alert("ত্রুটি: " + err.message); }
    }
  };
}
