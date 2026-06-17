function loadReportsModule(contentRoot, db, collection, onSnapshot, getDocs) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📈 এন্টারপ্রাইজ রিপোর্টস ও অ্যানালিটিক্স হাব</h2>
      <button class="cyber-input" id="btnPrintReportTrigger" style="width:auto; margin:0; background:rgba(0,180,216,0.1); border:1px solid var(--neon-blue); font-size:12px; padding:6px 15px;">📥 এক্সপোর্ট পিডিএফ রিপোর্ট</button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:15px; margin-bottom:25px;">
      
      <div class="cyber-glass" style="padding:15px; border-top:3px solid var(--neon-blue);">
        <span style="font-size:12px; color:var(--text-muted);">সদস্যদের ডাটাবেজ স্থিতি</span>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:10px;">
          <h2 id="repTotalMembers" style="color:#fff; font-family:'Orbitron'; margin:0;">০</h2>
          <small id="repActiveMembers" style="color:var(--neon-green);">একটিভ: ০</small>
        </div>
      </div>

      <div class="cyber-glass" style="padding:15px; border-top:3px solid var(--neon-green);">
        <span style="font-size:12px; color:var(--text-muted);">ট্রেজারি নেট ফান্ড ব্যালেন্স</span>
        <div style="margin-top:10px;">
          <h2 id="repNetBalance" style="color:var(--neon-green); font-family:'Orbitron'; margin:0;">০ ৳</h2>
        </div>
      </div>

      <div class="cyber-glass" style="padding:15px; border-top:3px solid var(--neon-yellow);">
        <span style="font-size:12px; color:var(--text-muted);">মোট ইভেন্ট ও উপস্থিতি সেশন</span>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:10px;">
          <h2 id="repTotalEvents" style="color:#fff; font-family:'Orbitron'; margin:0;">০</h2>
          <small id="repTotalSessions" style="color:var(--neon-yellow);">হাজিরা সেশন: ০</small>
        </div>
      </div>

      <div class="cyber-glass" style="padding:15px; border-top:3px solid var(--neon-red);">
        <span style="font-size:12px; color:var(--text-muted);">ইনভেন্টরি লজিস্টিকস ও নোটিশ</span>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:10px;">
          <h2 id="repTotalAssets" style="color:#fff; font-family:'Orbitron'; margin:0;">০</h2>
          <small id="repTotalNotices" style="color:var(--neon-red);">নোটিশ বোর্ড: ০</small>
        </div>
      </div>

    </div>

    <div class="cyber-glass" style="padding:20px; border-radius:8px;">
      <h3 style="color:#fff; font-size:15px; margin-bottom:20px; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">📊 ফাইনান্সিয়াল লেজার গ্রাফ (আয় বনাম ব্যয় তুলনামূলক চিত্র)</h3>
      
      <div style="display:flex; flex-direction:column; gap:15px; margin-top:10px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:5px;">
            <span>ক্রেডিট / মোট আয় (Cash In)</span>
            <span id="graphTextIncome" style="color:var(--neon-green); font-weight:bold;">০%</span>
          </div>
          <div style="width:100%; height:12px; background:rgba(255,255,255,0.05); border-radius:6px; overflow:hidden;">
            <div id="graphBarIncome" style="width:0%; height:100%; background:var(--neon-green); transition:width 1s ease-in-out;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:5px;">
            <span>ডেবিট / মোট ব্যয় (Cash Out)</span>
            <span id="graphTextExpense" style="color:var(--neon-red); font-weight:bold;">০%</span>
          </div>
          <div style="width:100%; height:12px; background:rgba(255,255,255,0.05); border-radius:6px; overflow:hidden;">
            <div id="graphBarExpense" style="width:0%; height:100%; background:var(--neon-red); transition:width 1s ease-in-out;"></div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px; font-size:11px; color:var(--text-muted); text-align:center;">
        💡 এই চার্টটি ডাটাবেজের রিয়েল-টাইম ট্রানজেকশনের অনুপাতের ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়।
      </div>
    </div>
  `;

  // রিয়েল-টাইমে ভিন্ন ভিন্ন কালেকশন থেকে ডাটা রিড করে মেগা রিপোর্ট ক্যালকুলেট করা
  
  // ১. মেম্বার ডাটা অ্যানালিটিক্স
  onSnapshot(collection(db, "users"), (snap) => {
    let total = snap.size;
    let active = 0;
    snap.forEach(doc => {
      if(doc.data().status === 'active') active++;
    });
    document.getElementById('repTotalMembers').innerText = total;
    document.getElementById('repActiveMembers').innerText = `একটিভ: ${active}`;
  });

  // ২. ট্রেজারি ও গ্রাফ ক্যালকুলেশন
  onSnapshot(collection(db, "treasury"), (snap) => {
    let totalIncome = 0;
    let totalExpense = 0;

    snap.forEach(doc => {
      const t = doc.data();
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'credit') totalIncome += amt;
      else if (t.type === 'debit') totalExpense += amt;
    });

    const netBalance = totalIncome - totalExpense;
    document.getElementById('repNetBalance').innerText = `${netBalance.toLocaleString('bn-BD')} ৳`;

    // পিওর সিএসএস গ্রাফ পার্সেন্টেজ লজিক
    const grandTotalTransactions = totalIncome + totalExpense;
    if (grandTotalTransactions > 0) {
      const incomePercent = Math.round((totalIncome / grandTotalTransactions) * 100);
      const expensePercent = Math.round((totalExpense / grandTotalTransactions) * 100);

      document.getElementById('graphTextIncome').innerText = `${incomePercent}% (${totalIncome.toLocaleString('bn-BD')} ৳)`;
      document.getElementById('graphBarIncome').style.width = `${incomePercent}%`;

      document.getElementById('graphTextExpense').innerText = `${expensePercent}% (${totalExpense.toLocaleString('bn-BD')} ৳)`;
      document.getElementById('graphBarExpense').style.width = `${expensePercent}%`;
    }
  });

  // ৩. ইভেন্ট ও উপস্থিতি সেশন অ্যানালিটিক্স
  onSnapshot(collection(db, "events"), (snap) => {
    document.getElementById('repTotalEvents').innerText = snap.size;
  });
  onSnapshot(collection(db, "attendance_sessions"), (snap) => {
    document.getElementById('repTotalSessions').innerText = `হাজিরা সেশন: ${snap.size}`;
  });

  // ৪. লজিস্টিকস ও নোটিশ অ্যানালিটিক্স
  onSnapshot(collection(db, "logistics"), (snap) => {
    let assetsCount = 0;
    snap.forEach(doc => {
      if(doc.data().type === 'asset') assetsCount++;
    });
    document.getElementById('repTotalAssets').innerText = assetsCount;
  });
  onSnapshot(collection(db, "notifications"), (snap) => {
    document.getElementById('repTotalNotices').innerText = `নোটিশ বোর্ড: ${snap.size}`;
  });

  // প্রিন্ট বা এক্সপোর্ট বাটন ট্রিকার
  document.getElementById('btnPrintReportTrigger').addEventListener('click', () => {
    window.print();
  });
}

