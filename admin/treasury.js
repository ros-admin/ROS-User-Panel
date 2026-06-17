function loadTreasuryModule(contentRoot, db, collection, onSnapshot, doc, addDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">💰 সেন্ট্রাল ট্রেজারি (আয়-ব্যয় হিসাব)</h2>
      <button class="cyber-input" id="btnNewTransaction" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন ট্রানজেকশন এন্ট্রি</button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
      <div class="cyber-glass" style="padding:15px; text-align:center; border-left:4px solid var(--neon-green);">
        <small style="color:var(--text-muted);">মোট আয় (Cash In)</small>
        <h2 id="tCashIn" style="color:var(--neon-green); margin-top:5px; font-family:'Orbitron';">০ ৳</h2>
      </div>
      <div class="cyber-glass" style="padding:15px; text-align:center; border-left:4px solid var(--neon-red);">
        <small style="color:var(--text-muted);">মোট ব্যয় (Cash Out)</small>
        <h2 id="tCashOut" style="color:var(--neon-red); margin-top:5px; font-family:'Orbitron';">০ ৳</h2>
      </div>
      <div class="cyber-glass" style="padding:15px; text-align:center; border-left:4px solid var(--neon-blue);">
        <small style="color:var(--text-muted);">বর্তমান তহবিল (Net Balance)</small>
        <h2 id="tBalance" style="color:var(--neon-blue); margin-top:5px; font-family:'Orbitron';">০ ৳</h2>
      </div>
    </div>

    <div class="cyber-glass" style="overflow-x:auto; border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
        <thead style="background:rgba(0,180,216,0.15); color:var(--neon-blue);">
          <tr>
            <th style="padding:12px;">তারিখ</th>
            <th style="padding:12px;">বিবরণ/খাত</th>
            <th style="padding:12px;">ধরণ</th>
            <th style="padding:12px;">পরিমাণ</th>
            <th style="padding:12px; text-align:right;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody id="treasuryTableBody">
          <tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">ডাটা লোড হচ্ছে...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('treasuryTableBody');
  const tCashIn = document.getElementById('tCashIn');
  const tCashOut = document.getElementById('tCashOut');
  const tBalance = document.getElementById('tBalance');

  // ফায়ারবেস থেকে রিয়েল-টাইমে ট্রানজেকশন ডাটা লোড ও ক্যালকুলেশন করা
  onSnapshot(collection(db, "treasury"), (snap) => {
    tbody.innerHTML = "";
    let totalIn = 0;
    let totalOut = 0;

    if (snap.empty) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">এখনো কোনো ট্রানজেকশন রেকর্ড করা হয়নি।</td></tr>`;
      tCashIn.innerText = "০ ৳";
      tCashOut.innerText = "০ ৳";
      tBalance.innerText = "০ ৳";
      return;
    }

    snap.forEach(tDoc => {
      const t = tDoc.data();
      const id = tDoc.id;
      const amount = parseFloat(t.amount) || 0;

      if (t.type === 'credit') {
        totalIn += amount;
      } else if (t.type === 'debit') {
        totalOut += amount;
      }

      const tr = document.createElement('tr');
      tr.style.borderBottom = "1px solid var(--glass-border)";
      
      const typeLabel = t.type === 'credit' ? 'আয় (In)' : 'ব্যয় (Out)';
      const typeColor = t.type === 'credit' ? 'var(--neon-green)' : 'var(--neon-red)';

      tr.innerHTML = `
        <td style="padding:12px; color:var(--text-muted);">${t.date}</td>
        <td style="padding:12px; font-weight:bold; color:#fff;">${t.description}</td>
        <td style="padding:12px; color:${typeColor}; font-weight:bold;">● ${typeLabel}</td>
        <td style="padding:12px; font-family:'Orbitron'; color:${typeColor}; font-weight:bold;">${amount.toLocaleString('bn-BD')} ৳</td>
        <td style="padding:12px; text-align:right;">
          <button class="btn-delete-trans" data-id="${id}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // সামারি কার্ড আপডেট
    tCashIn.innerText = `${totalIn.toLocaleString('bn-BD')} ৳`;
    tCashOut.innerText = `${totalOut.toLocaleString('bn-BD')} ৳`;
    tBalance.innerText = `${(totalIn - totalOut).toLocaleString('bn-BD')} ৳`;

    // ডিলিট বাটন ইভেন্ট হ্যান্ডলার
    document.querySelectorAll('.btn-delete-trans').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই ট্রানজেকশন রেকর্ডটি ডিলিট করলে তহবিলের হিসাব পরিবর্তন হয়ে যাবে। আপনি কি নিশ্চিত?")) {
        await deleteDoc(doc(db, "treasury", id));
      }
    }));
  });

  // নতুন ট্রানজেকশন তৈরি করার প্রম্পট লজিক
  document.getElementById('btnNewTransaction').addEventListener('click', async () => {
    const typeOption = prompt("ট্রানজেকশনের ধরণ নির্ধারণ করুন:\n১ লিখুন আয়ের (Cash In) জন্য\n২ লিখুন ব্যয়ের (Cash Out) জন্য");
    if (typeOption !== '1' && typeOption !== '2') { alert("ভুল অপশন সিলেক্ট করেছেন!"); return; }
    
    const type = typeOption === '1' ? 'credit' : 'debit';
    const description = prompt("বাবদ/খাত বা বিবরণ লিখুন (উদা: অলিম্পিয়াড রেজিস্ট্রেশন ফি / ব্যানার প্রিন্টিং):");
    if (!description) return;
    
    const amountStr = prompt("টাকার পরিমাণ (Amount):");
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { alert("বৈধ টাকার পরিমাণ লিখুন!"); return; }

    const date = prompt("তারিখ দিন (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

    try {
      await addDoc(collection(db, "treasury"), {
        type: type,
        description: description,
        amount: amount,
        date: date,
        createdAt: new Date().toISOString()
      });
      alert("ট্রানজেকশনটি সফলভাবে সেন্ট্রাল ট্রেজারিতে যুক্ত হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });
}

