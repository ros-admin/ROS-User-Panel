// ড্যাশবোর্ড মডিউলের মূল ফাংশন
function loadDashboardModule(contentRoot, currentAdminData, db, collection, onSnapshot, doc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${currentAdminData.englishName || 'অ্যাডমিন'}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">অনলাইন</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <p style="font-size: 13px; color: var(--neon-blue); margin-bottom: 10px;"><i class="fas fa-mouse-pointer"></i> যেকোনো সেকশনের বিস্তারিত তথ্য ও অ্যাকশন প্যানেল দেখতে কার্ডে ক্লিক করুন:</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
      
      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">মোট সদস্য সংখ্যা</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #fff;" id="cntTotalMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> ডাটাবেজ ভিউ করুন</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">অ্যাক্টিভ সদস্য সংখ্যা</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-green);" id="cntActiveMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> ডাটাবেজ ভিউ করুন</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">পেন্ডিং মেম্বার রিকোয়েস্ট</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-yellow);" id="cntPendingMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> মেম্বার ডাটাবেজে যান</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="profile_requests" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">প্রোফাইল আপডেট রিকোয়েস্ট</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-cyan);" id="cntDashboardInfoReqs">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> রিকোয়েস্ট হাব ওপেন করুন</div>
      </div>

    </div>

    <div class="cyber-glass" style="padding: 20px; border-radius: 8px;">
      <h3 style="font-size: 16px; margin-bottom: 12px; color: #fff;"><i class="fas fa-shield-alt"></i> সিস্টেম সিকিউরিটি লগ ও প্রোটোকল নোটিশ</h3>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
        <li><span style="color: var(--neon-green);">● SECURITY:</span> প্রতিটি সেশন SSL/TLS এন্ড-টু-এন্ড এনক্রিপশনের মাধ্যমে সুরক্ষিত। কর্তৃপক্ষের অনুমতি ব্যতিরেকে কোনো তথ্য ডিরেক্টরি থেকে কপি বা এক্সপোর্ট করা দণ্ডনীয় অপরাধ।</li>
        <li><span style="color: var(--neon-blue);">● DISCONNECT PROTOCOL:</span> প্যানেল ব্যবহার শেষে ব্রাউজার বন্ধ করার পূর্বে অবশ্যই ড্যাশবোর্ড থেকে সুরক্ষিতভাবে লগআউট সম্পন্ন করুন।</li>
      </ul>
    </div>
  `;

  // ---- 📊 ড্যাশবোর্ড কন্টেন্ট ইন্টারনাল কাউন্টার সিঙ্ক লজিক ----
  onSnapshot(collection(db, "users"), (snap) => {
    // মোট ব্যবহারকারী (যাদের রোল 'member')
    const totalMembers = snap.docs.filter(d => d.data().role === "member").length;
    // একটিভ সদস্য (status === "active")
    const activeCount = snap.docs.filter(d => d.data().role === "member" && d.data().status === "active").length;
    // পেন্ডিং সদস্য (status === "pending")
    const pendingCount = snap.docs.filter(d => d.data().role === "member" && d.data().status === "pending").length;

    const elTotal = document.getElementById('cntTotalMembers');
    const elActive = document.getElementById('cntActiveMembers');
    const elPending = document.getElementById('cntPendingMembers');

    if (elTotal) elTotal.innerText = totalMembers;
    if (elActive) elActive.innerText = activeCount;
    if (elPending) elPending.innerText = pendingCount;
  }, (err) => console.log("Dashboard internal users loader error:", err));

  onSnapshot(collection(db, "profile_update_requests"), (snap) => {
    const el = document.getElementById('cntDashboardInfoReqs');
    if (el) el.innerText = snap.size;
  }, (err) => console.log("Dashboard internal requests loader error:", err));
}

export { loadDashboardModule };
