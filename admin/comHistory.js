function loadComHistoryModule(contentRoot, db, collection, onSnapshot) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📜 কমিটির ইতিহাস ও আর্কাইভ হাব</h2>
      <span style="font-size:11px; color:var(--text-muted); background:rgba(255,183,3,0.1); border:1px solid var(--neon-yellow); padding:4px 10px; border-radius:20px;">📋 সর্বমোট রেকর্ড</span>
    </div>

    <div class="cyber-glass" style="padding:15px; border-radius:6px; margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
      <input type="text" id="historySearchInput" class="cyber-input" placeholder="কমিটির নাম বা সাল দিয়ে ইতিহাস খুঁজুন..." style="margin:0; flex:1; min-width:200px;">
    </div>

    <div id="historyTimelineContainer" style="display:flex; flex-direction:column; gap:20px; position:relative; padding-left:20px; border-left:2px dashed var(--glass-border);">
      <p style="color:var(--text-muted); font-size:13px;">ইতিহাস ডাটাবেজ লোড হচ্ছে...</p>
    </div>
  `;

  const searchInput = document.getElementById('historySearchInput');
  const timelineContainer = document.getElementById('historyTimelineContainer');
  let localHistoryArray = [];

  // ফায়ারবেস থেকে সব কমিটির ডাটা নিয়ে আসা (যা আমরা committee মডিউলে তৈরি করেছি)
  onSnapshot(collection(db, "committees"), (snap) => {
    localHistoryArray = [];
    snap.forEach(doc => {
      localHistoryArray.push({ id: doc.id, ...doc.data() });
    });
    // বছর অনুযায়ী উল্টো করে সাজানো (নতুনটা সবার আগে, পুরোনোটা নিচে)
    localHistoryArray.sort((a, b) => b.sessionYear.localeCompare(a.sessionYear));
    renderHistoryTimeline();
  });

  function renderHistoryTimeline() {
    timelineContainer.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();

    const filtered = localHistoryArray.filter(c => {
      return (c.committeeName && c.committeeName.toLowerCase().includes(searchTerm)) || 
             (c.sessionYear && c.sessionYear.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
      timelineContainer.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">কোনো অতীত বা বর্তমান কমিটির ইতিহাস খুঁজে পাওয়া যায়নি।</p>`;
      return;
    }

    filtered.forEach(c => {
      const historyCard = document.createElement('div');
      historyCard.className = "cyber-glass";
      historyCard.style.padding = "20px";
      historyCard.style.borderRadius = "8px";
      historyCard.style.position = "relative";
      
      // টাইমলাইনের ডট ইফেক্ট
      historyCard.innerHTML = `
        <div style="position:absolute; width:12px; height:12px; background:var(--neon-yellow); border-radius:50%; left:-27px; top:25px; box-shadow:0 0 10px var(--neon-yellow);"></div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--glass-border); padding-bottom:10px; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="color:#fff; font-size:16px;">${c.committeeName}</h3>
            <span style="font-size:11px; color:var(--neon-yellow); font-weight:bold;"><i class="fas fa-calendar-alt"></i> সেশন: ${c.sessionYear}</span>
          </div>
          <span style="background:rgba(0,180,216,0.1); border:1px solid var(--neon-blue); color:var(--neon-blue); padding:3px 10px; font-size:11px; border-radius:4px;">${c.committeeType || 'Executive'}</span>
        </div>
        
        <div style="margin-top:10px;">
          <h4 style="font-size:12px; color:var(--neon-green); margin-bottom:8px;"><i class="fas fa-users"></i> কমিটির দায়িত্বপ্রাপ্ত সদস্যবৃন্দ (${c.members ? c.members.length : 0} জন):</h4>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:10px;">
            ${c.members && c.members.length > 0 ? c.members.map(m => `
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:8px 12px; border-radius:4px; display:flex; flex-direction:column;">
                <span style="font-weight:bold; color:var(--text-main); font-size:13px;">${m.memberName}</span>
                <span style="color:var(--text-muted); font-size:11px; margin-top:2px;">👑 ${m.designation}</span>
              </div>
            `).join('') : `<p style="color:var(--text-muted); font-size:11px; font-style:italic;">এই কমিটিতে কোনো সদস্য অন্তর্ভুক্ত করা হয়নি।</p>`}
          </div>
        </div>
      `;
      timelineContainer.appendChild(historyCard);
    });
  }

  searchInput.addEventListener('input', renderHistoryTimeline);
}
