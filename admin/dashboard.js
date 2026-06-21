// ড্যাশবোর্ড মডিউলের মূল ফাংশন
function loadDashboardModule(contentRoot, currentAdminData, db, collection, onSnapshot, doc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${currentAdminData.englishName || 'অ্যাডমিন'}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">অনলাইন</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <p style="font-size: 13px; color: var(--neon-blue); margin-bottom: 10px;"><i class="fas fa-mouse-pointer"></i> যেকোনো সেকশনের বিস্তারিত তথ্য ও অ্যাকশন প্যানেল দেখতে কার্ডে ক্লিক করুন:</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
      
      <div class="cyber-glass dashboard-click-node" data-target-mod="members" style="padding: 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 24px; font-weight: bold; color: var(--neon-yellow);" id="cntPendingMembers">...</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">পেন্ডিং মেম্বার রিকোয়েস্ট</p>
          </div>
          <i class="fas fa-user-plus" style="font-size: 30px; color: rgba(253, 191, 36, 0.2);"></i>
        </div>
      </div>

      <div class="cyber-glass dashboard-click-node" data-target-mod="adminRequests" style="padding: 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 24px; font-weight: bold; color: var(--neon-blue);" id="cntInfoRequests">...</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">তথ্য পরিবর্তনের আবেদন</p>
          </div>
          <i class="fas fa-tasks" style="font-size: 30px; color: rgba(0, 180, 216, 0.2);"></i>
        </div>
      </div>

      <div class="cyber-glass dashboard-click-node" data-target-mod="resetUserPassword" style="padding: 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 24px; font-weight: bold; color: var(--neon-red);" id="cntPassRequests">...</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">Password Reset Queue</p>
          </div>
          <i class="fas fa-shield-alt" style="font-size: 30px; color: rgba(230, 57, 70, 0.2);"></i>
        </div>
      </div>

    </div>

    <div id="dashboardLiveStatusHub" class="cyber-glass" style="padding: 20px; border-radius: 8px; display: none;">
      <h3 id="workspaceTitle" style="font-size: 16px; color: #fff; margin-bottom: 15px; border-bottom: 1px solid var(--glass-border); padding-bottom: 8px;"></h3>
      <div id="workspaceTableResponsive" style="overflow-x: auto;">
         </div>
    </div>
  `;

  // ---- 🎯 সিএসএস হোভার ইফেক্ট স্টাইল ডাইনামিকালি অ্যাড করা ----
  if (!document.getElementById('dashboard-hover-style')) {
    const style = document.createElement('style');
    style.id = 'dashboard-hover-style';
    style.innerHTML = `
      .dashboard-click-node:hover {
        transform: translateY(-4px);
        border-color: var(--neon-blue) !important;
        box-shadow: 0 4px 20px rgba(0, 180, 216, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ---- 🧭 ডিরেক্ট মডিউল নেভিগেশন লজিক (আপনার মূল চাহিদা) ----
  document.querySelectorAll('.dashboard-click-node').forEach(card => {
    card.addEventListener('click', () => {
      const targetModuleId = card.getAttribute('data-target-mod');
      
      // dashboard.html-এর বামপাশের সাইডবারের নির্দিষ্ট মেনু বাটনটি খুঁজে বের করা
      const sidebarMenuLink = document.querySelector(`.menu-item a[data-mod-id="${targetModuleId}"]`);
      
      if (sidebarMenuLink) {
        // সাইডবারের ওই বাটনে অটোমেটিক ক্লিক ইভেন্ট ট্রিগার করা
        sidebarMenuLink.click();
      } else {
        alert("নির্দিষ্ট মডিউলটি সিস্টেমে খুঁজে পাওয়া যায়নি।");
      }
    });
  });

  // ---- 📊 রিয়েল-টাইম কাউন্টার লজিক (নিরাপদ ও ক্র্যাশ-মুক্ত উপায়ে) ----
  
  // ১. পেন্ডিং মেম্বার কাউন্টার
  onSnapshot(collection(db, "users"), (snap) => {
    const pendingCount = snap.docs.filter(d => d.data().status === "pending").length;
    const el = document.getElementById('cntPendingMembers');
    if (el) el.innerText = pendingCount;
  }, (err) => console.log("Users Counter Error:", err));

  // ২. প্রোফাইল আপডেট রিকোয়েস্ট কাউন্টার
  onSnapshot(collection(db, "profile_update_requests"), (snap) => {
    const el = document.getElementById('cntInfoRequests');
    if (el) el.innerText = snap.size;
  }, (err) => console.log("Profile Request Counter Error:", err));

  // ৩. পাসওয়ার্ড রিসেট রিকোয়েস্ট কাউন্টার
  onSnapshot(collection(db, "password_resets"), (snap) => {
    const pendingResetCount = snap.docs.filter(d => d.data().status === "pending").length;
    const el = document.getElementById('cntPassRequests');
    if (el) el.innerText = pendingResetCount;
  }, (err) => console.log("Password Reset Counter Error:", err));
}
