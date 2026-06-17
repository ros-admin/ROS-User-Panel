function loadNotificationsModule(contentRoot, db, collection, onSnapshot, doc, addDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📢 নোটিফিকেশন ও অ্যালার্ট সেন্টার</h2>
      <button class="cyber-input" id="btnBroadcastNotice" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন নোটিশ ব্রডকাস্ট করুন</button>
    </div>

    <div class="cyber-glass" style="padding:20px; border-radius:8px;">
      <h3 style="color:var(--neon-yellow); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">📋 লাইভ নোটিশ হিস্টোরি (Broadcast Log)</h3>
      <div id="notificationsLogContainer" style="display:flex; flex-direction:column; gap:15px;">
        <p style="color:var(--text-muted); font-size:13px;">নোটিশ ডাটা লোড হচ্ছে...</p>
      </div>
    </div>
  `;

  const logContainer = document.getElementById('notificationsLogContainer');

  // ফায়ারবেস থেকে রিয়েল-টাইমে নোটিশসমূহ রিড করা
  onSnapshot(collection(db, "notifications"), (snap) => {
    logContainer.innerHTML = "";

    if (snap.empty) {
      logContainer.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">বর্তমানে কোনো নোটিশ বা ব্রডকাস্ট হিস্টোরি নেই।</p>`;
      return;
    }

    // নতুন নোটিশ সবার উপরে দেখানোর জন্য সর্ট করা
    let localNotices = [];
    snap.forEach(nDoc => {
      localNotices.push({ id: nDoc.id, ...nDoc.data() });
    });
    localNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    localNotices.forEach(notice => {
      const card = document.createElement('div');
      card.className = "cyber-glass";
      card.style.padding = "15px";
      card.style.borderRadius = "6px";
      card.style.borderLeft = `4px solid ${notice.priority === 'high' ? 'var(--neon-red)' : 'var(--neon-blue)'}`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:5px;">
          <div>
            <strong style="color:#fff; font-size:15px;">${notice.title}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
              🎯 টার্গেট: <span style="color:var(--neon-green);">${notice.audience.toUpperCase()}</span> | ⏰ ${new Date(notice.createdAt).toLocaleString('bn-BD')}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:10px; font-weight:bold; background:${notice.priority === 'high' ? 'rgba(239,35,60,0.1)' : 'rgba(0,180,216,0.1)'}; color:${notice.priority === 'high' ? 'var(--neon-red)' : 'var(--neon-blue)'}; border:1px solid ${notice.priority === 'high' ? 'var(--neon-red)' : 'var(--neon-blue)'}; padding:2px 6px; border-radius:3px;">
              ${notice.priority.toUpperCase()}
            </span>
            <button class="btn-delete-notice" data-id="${notice.id}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer; font-size:13px;"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
        <p style="font-size:12px; color:var(--text-main); line-height:1.6; white-space:pre-wrap;">${notice.message}</p>
      `;
      logContainer.appendChild(card);
    });

    // ডিলিট বাটন ইভেন্ট হ্যান্ডলার
    document.querySelectorAll('.btn-delete-notice').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই নোটিশটি ডিলিট করতে চান? এর ফলে মেম্বাররা আর এটি দেখতে পাবে can না।")) {
        await deleteDoc(doc(db, "notifications", id));
      }
    }));
  });

  // নতুন নোটিশ যুক্ত করার লজিক
  document.getElementById('btnBroadcastNotice').addEventListener('click', async () => {
    const title = prompt("নোটিশের শিরোনাম (Title) লিখুন:");
    if (!title) return;
    const message = prompt("নোটিশের বিস্তারিত বার্তা (Message) লিখুন:");
    if (!message) return;
    
    const audience = prompt("কাদের উদ্দেশ্যে নোটিশ? (all / members / volunteers):", "all");
    const priority = prompt("প্রায়োরিটি কেমন? (normal / high):", "normal");

    try {
      await addDoc(collection(db, "notifications"), {
        title: title,
        message: message,
        audience: audience,
        priority: priority,
        createdAt: new Date().toISOString()
      });
      alert("নতুন নোটিশ সফলভাবে ব্রডকাস্ট করা হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });
}

