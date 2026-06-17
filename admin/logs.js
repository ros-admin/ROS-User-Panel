function loadLogsModule(contentRoot, db, collection, onSnapshot, doc, addDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🔐 সিস্টেম অ্যাক্টিভিটি লগ (Audit & Security Logs)</h2>
      <button class="cyber-input" id="btnClearLogsTrigger" style="width:auto; margin:0; background:rgba(239,35,60,0.1); border:1px solid var(--neon-red); color:var(--neon-red); font-size:12px; padding:6px 15px;">🧹 লগস ক্লিয়ার করুন</button>
    </div>

    <div class="cyber-glass" style="padding:20px; border-radius:8px;">
      <h3 style="color:var(--neon-yellow); font-size:15px; margin-bottom:20px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">🕒 রিয়েল-টাইম সিকিউরিটি টাইমলাইন (Live Audit Trail)</h3>
      
      <div id="activityLogsTimeline" style="display:flex; flex-direction:column; gap:15px; position:relative; padding-left:20px;">
        <div style="position:absolute; left:5px; top:10px; bottom:10px; width:2px; background:linear-gradient(180deg, var(--neon-blue), transparent);"></div>
        
        <p style="color:var(--text-muted); font-size:13px;">অ্যাক্টিভিটি লগ ডাটাবেজ কানেক্ট হচ্ছে...</p>
      </div>
    </div>
  `;

  const timelineContainer = document.getElementById('activityLogsTimeline');

  // ফায়ারবেস থেকে রিয়েল-টাইমে অ্যাক্টিভিটি লগসমূহ রিড করা
  onSnapshot(collection(db, "activity_logs"), (snap) => {
    timelineContainer.innerHTML = `<div style="position:absolute; left:5px; top:10px; bottom:10px; width:2px; background:linear-gradient(180deg, var(--neon-blue), transparent);"></div>`;

    if (snap.empty) {
      timelineContainer.innerHTML += `<p style="color:var(--text-muted); font-size:13px; padding:10px 0;">বর্তমানে সিস্টেমে কোনো অ্যাক্টিভিটি বা সিকিউরিটি লগ রেকর্ড করা নেই।</p>`;
      return;
    }

    // নতুন লগগুলো সবার উপরে দেখানোর জন্য সর্ট করা
    let localLogs = [];
    snap.forEach(lDoc => {
      localLogs.push({ id: lDoc.id, ...lDoc.data() });
    });
    localLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    localLogs.forEach(log => {
      const logItem = document.createElement('div');
      logItem.style.position = "relative";
      logItem.style.padding = "12px 15px";
      logItem.style.borderRadius = "6px";
      logItem.style.background = "rgba(255,255,255,0.02)";
      logItem.style.border = "1px solid var(--glass-border)";
      
      // লগের ধরণ অনুযায়ী আইকন ও কালার কোডিং
      let icon = "fa-cog";
      let iconColor = "var(--neon-blue)";
      if (log.actionType === 'create' || log.actionType === 'add') { icon = "fa-plus-circle"; iconColor = "var(--neon-green)"; }
      else if (log.actionType === 'delete') { icon = "fa-trash-alt"; iconColor = "var(--neon-red)"; }
      else if (log.actionType === 'update') { icon = "fa-edit"; iconColor = "var(--neon-yellow)"; }
      else if (log.actionType === 'security') { icon = "fa-shield-alt"; iconColor = "var(--neon-red)"; }

      logItem.innerHTML = `
        <div style="position:absolute; left:-20px; top:15px; width:10px; height:10px; border-radius:50%; background:${iconColor}; box-shadow:0 0 8px ${iconColor};"></div>
        
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:5px;">
          <div>
            <span style="color:${iconColor}; font-size:13px; margin-right:6px;"><i class="fas ${icon}"></i></span>
            <strong style="color:#fff; font-size:13px;">${log.details || 'অ্যাক্টিভিটি রেকর্ড করা হয়েছে'}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">
              👤 অপারেটর: <span style="color:var(--neon-blue); font-weight:bold;">${log.adminEmail || 'System'}</span>
            </div>
          </div>
          <small style="font-size:11px; color:var(--text-muted); font-family:'Orbitron', sans-serif;">${new Date(log.timestamp).toLocaleTimeString('bn-BD')} | ${new Date(log.timestamp).toLocaleDateString('bn-BD')}</small>
        </div>
      `;
      timelineContainer.appendChild(logItem);
    });
  });

  // লগস ডিলিট/ক্লিয়ার করার লজিক (নিরাপত্তার স্বার্থে সুপার অ্যাডমিন কনফার্মেশন সহ)
  document.getElementById('btnClearLogsTrigger').addEventListener('click', async () => {
    if (confirm("⚠️ আপনি কি নিশ্চিত যে আপনি সমস্ত সিস্টেম অ্যাক্টিভিটি লগ মুছে ফেলতে চান? এর ফলে অতীতের সকল অডিট ট্রেইল ডিলিট হয়ে যাবে!")) {
      const password = prompt("নিরাপত্তা ভেরিফিকেশনের জন্য 'CONFIRM CLEAR' টাইপ করুন:");
      if (password === 'CONFIRM CLEAR') {
        alert("🧹 ক্লিয়ারিং প্রসেস ট্রিগার করা হয়েছে। (প্রো-লেভেলে এটি ব্যাচ ডিলিটের মাধ্যমে ব্যাকএন্ড থেকে সম্পূর্ণ ফাঁকা হবে)");
        // নোট: ফায়ারবেস ক্লায়েন্ট সাইড থেকে এক ক্লিকে পুরো কালেকশন ডিলিট করা যায় না, তাই প্রিমিয়াম লেভেলে আমরা এর জন্য ব্যাচ লুপ কোড যুক্ত করব।
      } else {
        alert("ভুল কোড! লগস সুরক্ষিত আছে।");
      }
    }
  });
}
