// ড্যাশবোর্ড মডিউলের মূল ফাংশন
function loadDashboardModule(contentRoot, currentAdminData, db, collection, onSnapshot) {
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue); position: relative; overflow: hidden;">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${currentAdminData.englishName}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">অনলাইন</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div class="cyber-glass" style="padding:20px; text-align:center; position:relative; border-bottom: 3px solid var(--neon-blue);">
        <i class="fas fa-users" style="color:var(--neon-blue); font-size:18px; margin-bottom:8px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600;">মোট সদস্য</small>
        <h2 id="cTotal" style="color:var(--neon-blue); margin-top:8px; font-family:'Orbitron'; font-size:28px;">...</h2>
      </div>
      <div class="cyber-glass" style="padding:20px; text-align:center; position:relative; border-bottom: 3px solid var(--neon-green);">
        <i class="fas fa-user-check" style="color:var(--neon-green); font-size:18px; margin-bottom:8px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600;">সক্রিয় সদস্য</small>
        <h2 id="cActive" style="color:var(--neon-green); margin-top:8px; font-family:'Orbitron'; font-size:28px;">...</h2>
      </div>
      <div class="cyber-glass" style="padding:20px; text-align:center; position:relative; border-bottom: 3px solid var(--neon-yellow);">
        <i class="fas fa-clock" style="color:var(--neon-yellow); font-size:18px; margin-bottom:8px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600;">পেন্ডিং অনুমোদন</small>
        <h2 id="cPending" style="color:var(--neon-yellow); margin-top:8px; font-family:'Orbitron'; font-size:28px;">...</h2>
      </div>
      <div class="cyber-glass" style="padding:20px; text-align:center; position:relative; border-bottom: 3px solid #a855f7;">
        <i class="fas fa-unlock-alt" style="color:#a855f7; font-size:18px; margin-bottom:8px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600;">পাসওয়ার্ড রিসেট আবেদন</small>
        <h2 id="cResetRequests" style="color:#a855f7; margin-top:8px; font-family:'Orbitron'; font-size:28px;">...</h2>
      </div>
      <div class="cyber-glass" style="padding:20px; text-align:center; position:relative; border-bottom: 3px solid var(--neon-red);">
        <i class="fas fa-exchange-alt" style="color:var(--neon-red); font-size:18px; margin-bottom:8px;"></i><br>
        <small style="color:var(--text-muted); font-weight:600;">মোট ট্রানজেকশন</small>
        <h2 id="cTreasury" style="color:var(--neon-red); margin-top:8px; font-family:'Orbitron'; font-size:28px;">...</h2>
      </div>
    </div>
  `;

  // রিয়েল-টাইম ডাটা কাউন্টার (সুপার এডমিন বাদে)
  onSnapshot(collection(db, "users"), (snap) => {
    const nonAdminDocs = snap.docs.filter(d => d.data().role !== 'super_admin');
    document.getElementById('cTotal').innerText = nonAdminDocs.length;
    document.getElementById('cActive').innerText = nonAdminDocs.filter(d => d.data().status === 'active').length;
    document.getElementById('cPending').innerText = nonAdminDocs.filter(d => d.data().status === 'pending').length;
  });

  // পাসওয়ার্ড রিসেট রিকোয়েস্ট কাউন্টার (ধরে নেওয়া হয়েছে কালেকশনের নাম 'password_resets')
  onSnapshot(collection(db, "password_resets"), (snap) => {
    document.getElementById('cResetRequests').innerText = snap.size;
  }, (err) => {
    console.log("Password reset tracking standby...");
    document.getElementById('cResetRequests').innerText = "0";
  });

  // ট্রানজেকশন কাউন্টার
  onSnapshot(collection(db, "treasury"), (snap) => {
    document.getElementById('cTreasury').innerText = snap.size;
  });
}
