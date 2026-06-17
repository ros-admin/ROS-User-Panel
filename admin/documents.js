function loadDocumentsModule(contentRoot, db, collection, onSnapshot, doc, addDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📁 ডকুমেন্ট ও রেজুলেশন হাব</h2>
      <button class="cyber-input" id="btnUploadDoc" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন ডকুমেন্ট লিঙ্ক করুন</button>
    </div>

    <!-- ডকুমেন্ট ক্যাটাগরি গ্রিড -->
    <div id="centralDocsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
      <p style="color:var(--text-muted); font-size:13px;">ডকুমেন্ট আর্কাইভ লোড হচ্ছে...</p>
    </div>
  `;

  const docsGrid = document.getElementById('centralDocsGrid');

  // ফায়ারবেস থেকে রিয়েল-টাইমে ডকুমেন্ট ডাটা লোড করা
  onSnapshot(collection(db, "documents"), (snap) => {
    docsGrid.innerHTML = "";

    if (snap.empty) {
      docsGrid.innerHTML = `<div class="cyber-glass" style="grid-column: 1/-1; padding:30px; text-align:center; border-radius:8px;"><p style="color:var(--text-muted); font-size:13px;">আর্কাইভে কোনো ডকুমেন্ট ফাইল পাওয়া যায়নি।</p></div>`;
      return;
    }

    snap.forEach(dDoc => {
      const docData = dDoc.data();
      const docId = dDoc.id;

      const card = document.createElement('div');
      card.className = "cyber-glass";
      card.style.padding = "18px";
      card.style.borderRadius = "8px";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      card.style.borderLeft = "4px solid var(--neon-blue)";

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:11px; font-weight:bold; color:var(--neon-blue); background:rgba(0,180,216,0.1); padding:3px 8px; border-radius:4px; text-transform:uppercase;">
              ${docData.category}
            </span>
            <small style="color:var(--text-muted); font-size:11px;">${docData.date || ''}</small>
          </div>
          <h3 style="color:#fff; font-size:15px; margin-bottom:8px;"><i class="far fa-file-alt" style="color:var(--neon-yellow); margin-right:6px;"></i> ${docData.title}</h3>
          <p style="color:var(--text-muted); font-size:12px; line-height:1.5; margin-bottom:15px;">${docData.description || 'কোনো বিবরণ নেই।'}</p>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--glass-border); padding-top:12px; margin-top:10px;">
          <a href="${docData.fileUrl}" target="_blank" style="color:var(--neon-green); text-decoration:none; font-size:12px; font-weight:bold;"><i class="fas fa-external-link-alt"></i> ফাইলটি দেখুন</a>
          <button class="btn-delete-doc" data-id="${docId}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer; font-size:12px;"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      docsGrid.appendChild(card);
    });

    // ডিলিট বাটনের জন্য ইভেন্ট হ্যান্ডলার
    document.querySelectorAll('.btn-delete-doc').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই ফাইলটি কি আর্কাইভ থেকে মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, "documents", id));
      }
    }));
  });

  // নতুন ডকুমেন্ট যুক্ত করার লজিক
  document.getElementById('btnUploadDoc').addEventListener('click', async () => {
    const title = prompt("ডকুমেন্ট বা ফাইলের নাম লিখুন (উদা: ১৬তম অলিম্পিয়াড রেজুলেশন):");
    if (!title) return;
    const fileUrl = prompt("ফাইল বা ড্রাইভ লিংকটি (URL) দিন:");
    if (!fileUrl) { alert("লিঙ্ক দেওয়া বাধ্যতামূলক!"); return; }
    
    const category = prompt("ক্যাটাগরি নির্ধারণ করুন (উদা: Resolution / Notice / Form / Report):", "Resolution");
    const description = prompt("সংক্ষিপ্ত বিবরণ (ঐচ্ছিক):");

    try {
      await addDoc(collection(db, "documents"), {
        title: title,
        fileUrl: fileUrl,
        category: category,
        description: description || "",
        date: new Date().toLocaleDateString('bn-BD'),
        createdAt: new Date().toISOString()
      });
      alert("ডকুমেন্টটি আর্কাইভে সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });
}
