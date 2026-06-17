function loadLogisticsModule(contentRoot, db, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📦 লজিস্টিকস ও অফিশিয়াল নোটস</h2>
      <button class="cyber-input" id="btnNewLogistics" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন মালামাল/নোট যুক্ত করুন</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:start;">
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-green); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">📊 লজিস্টিকস ইনভেন্টরি (Asset Inventory)</h3>
        <div id="logisticsInventoryContainer" style="display:flex; flex-direction:column; gap:12px;">
          <p style="color:var(--text-muted); font-size:13px;">ইনভেন্টরি লোড হচ্ছে...</p>
        </div>
      </div>

      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-yellow); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">📝 অফিশিয়াল কুইক নোটস (Sticky Notes)</h3>
        <div id="logisticsNotesContainer" style="display:grid; grid-template-columns:1fr; gap:12px;">
          <p style="color:var(--text-muted); font-size:13px;">নোটস লোড হচ্ছে...</p>
        </div>
      </div>
    </div>
  `;

  const inventoryContainer = document.getElementById('logisticsInventoryContainer');
  const notesContainer = document.getElementById('logisticsNotesContainer');

  // ফায়ারবেস থেকে রিয়েল-টাইমে লজিস্টিকস ও নোটস ডাটা লোড করা
  onSnapshot(collection(db, "logistics"), (snap) => {
    inventoryContainer.innerHTML = "";
    notesContainer.innerHTML = "";

    let hasAssets = false;
    let hasNotes = false;

    snap.forEach(lDoc => {
      const item = { id: lDoc.id, ...lDoc.data() };

      if (item.type === 'asset') {
        hasAssets = true;
        const assetRow = document.createElement('div');
        assetRow.className = "cyber-glass";
        assetRow.style.padding = "12px";
        assetRow.style.borderRadius = "6px";
        assetRow.style.display = "flex";
        assetRow.style.justifyContent = "space-between";
        assetRow.style.alignItems = "center";

        assetRow.innerHTML = `
          <div>
            <strong style="color:#fff; font-size:14px;">${item.title}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">অবস্থান: ${item.location || 'অফিস'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:15px;">
            <span style="font-size:13px; font-weight:bold; color:var(--neon-blue); background:rgba(0,180,216,0.1); padding:3px 8px; border-radius:4px;">${item.quantity} টি/পিস</span>
            <button class="btn-delete-logistic" data-id="${item.id}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        `;
        inventoryContainer.appendChild(assetRow);
      } else if (item.type === 'note') {
        hasNotes = true;
        const noteCard = document.createElement('div');
        noteCard.className = "cyber-glass";
        noteCard.style.padding = "15px";
        noteCard.style.borderRadius = "6px";
        noteCard.style.borderLeft = "4px solid var(--neon-yellow)";

        noteCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
            <strong style="color:var(--neon-yellow); font-size:14px;">📌 ${item.title}</strong>
            <button class="btn-delete-logistic" data-id="${item.id}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer; font-size:11px;"><i class="fas fa-trash"></i></button>
          </div>
          <p style="font-size:12px; color:var(--text-main); line-height:1.5; white-space: pre-wrap;">${item.content}</p>
          <div style="font-size:10px; color:var(--text-muted); text-align:right; margin-top:8px;">${new Date(item.createdAt).toLocaleDateString('bn-BD')}</div>
        `;
        notesContainer.appendChild(noteCard);
      }
    });

    if (!hasAssets) inventoryContainer.innerHTML = `<p style="color:var(--text-muted); font-size:12px; text-align:center;">কোনো মালামালের রেকর্ড নেই।</p>`;
    if (!hasNotes) notesContainer.innerHTML = `<p style="color:var(--text-muted); font-size:12px; text-align:center;">কোনো কুইক নোট নেই।</p>`;

    // ডিলিট বাটন হ্যান্ডলার বাইন্ডিং
    document.querySelectorAll('.btn-delete-logistic').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই রেকর্ডটি চিরতরে মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, "logistics", id));
      }
    }));
  });

  // নতুন ডাটা বা নোট এন্ট্রি করার প্রম্পট লজিক
  document.getElementById('btnNewLogistics').addEventListener('click', async () => {
    const option = prompt("আপনি কি যুক্ত করতে চান?\n১ লিখুন লজিস্টিকস ইনভেন্টরির জন্য\n২ লিখুন অফিশিয়াল নোটের জন্য");
    
    if (option === '1') {
      const title = prompt("মালামালের নাম (উদা: ROS অফিশিয়াল ব্যানার):");
      if (!title) return;
      const quantity = prompt("পরিমাণ বা সংখ্যা (উদা: 5):", "1");
      const location = prompt("এটি বর্তমানে কোথায় আছে (উদা: মেইন অফিস / ল্যাব):", "অফিস");

      await addDoc(collection(db, "logistics"), {
        type: 'asset',
        title: title,
        quantity: quantity,
        location: location,
        createdAt: new Date().toISOString()
      });
      alert("ইনভেন্টরি আইটেম যোগ হয়েছে!");
    } else if (option === '2') {
      const title = prompt("নোটের শিরোনাম (উদা: আগামী মিটিংয়ের এজেন্ডা):");
      if (!title) return;
      const content = prompt("নোটের বিস্তারিত বিবরণ লিখুন:");

      await addDoc(collection(db, "logistics"), {
        type: 'note',
        title: title,
        content: content || "",
        createdAt: new Date().toISOString()
      });
      alert("অফিশিয়াল নোটটি সংরক্ষিত হয়েছে!");
    }
  });
}
