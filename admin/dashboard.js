// ড্যাশবোর্ড মডিউলের মূল ফাংশন
function loadDashboardModule(contentRoot, currentAdminData, db, collection, onSnapshot) {
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue);">${currentAdminData.englishName}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">অনলাইন</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
      <div class="cyber-glass" style="padding:15px; text-align:center;"><small style="color:var(--text-muted);">মোট সদস্য</small><h2 id="cTotal" style="color:var(--neon-blue); margin-top:5px;">...</h2></div>
      <div class="cyber-glass" style="padding:15px; text-align:center;"><small style="color:var(--neon-green);">সক্রিয় সদস্য</small><h2 id="cActive" style="color:var(--neon-green); margin-top:5px;">...</h2></div>
      <div class="cyber-glass" style="padding:15px; text-align:center;"><small style="color:var(--neon-yellow);">পেন্ডিং অনুমোদন</small><h2 id="cPending" style="color:var(--neon-yellow); margin-top:5px;">...</h2></div>
      <div class="cyber-glass" style="padding:15px; text-align:center;"><small style="color:var(--neon-red);">মোট ট্রানজেকশন</small><h2 id="cTreasury" style="color:var(--neon-red); margin-top:5px;">...</h2></div>
    </div>
  `;

  // রিয়েল-টাইম ডাটা কাউন্টার (সুপার এডমিন বাদে)
  onSnapshot(collection(db, "users"), (snap) => {
    const nonAdminDocs = snap.docs.filter(d => d.data().role !== 'super_admin');
    document.getElementById('cTotal').innerText = nonAdminDocs.length;
    document.getElementById('cActive').innerText = nonAdminDocs.filter(d => d.data().status === 'active').length;
    document.getElementById('cPending').innerText = nonAdminDocs.filter(d => d.data().status === 'pending').length;
  });

  onSnapshot(collection(db, "treasury"), (snap) => {
    document.getElementById('cTreasury').innerText = snap.size;
  });
}
