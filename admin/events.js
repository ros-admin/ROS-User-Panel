function loadEventsModule(contentRoot, db, collection, onSnapshot, doc, addDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">📅 ইভেন্ট ও প্রোগ্রাম ম্যানেজমেন্ট</h2>
      <button class="cyber-input" id="btnCreateEvent" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন ইভেন্ট যুক্ত করুন</button>
    </div>

    <div id="centralEventsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
      <p style="color:var(--text-muted); font-size:13px;">ইভেন্ট ডাটা লোড হচ্ছে...</p>
    </div>
  `;

  const eventsGrid = document.getElementById('centralEventsGrid');

  // ফায়ারবেস থেকে রিয়েল-টাইমে ইভেন্ট লিস্ট লোড করা
  onSnapshot(collection(db, "events"), (snap) => {
    eventsGrid.innerHTML = "";

    if (snap.empty) {
      eventsGrid.innerHTML = `<div class="cyber-glass" style="grid-column: 1/-1; padding:30px; text-align:center; border-radius:8px;"><p style="color:var(--text-muted); font-size:13px;">বর্তমানে কোনো ইভেন্ট শিডিউল করা নেই।</p></div>`;
      return;
    }

    snap.forEach(eDoc => {
      const event = eDoc.data();
      const eventId = eDoc.id;

      // ইভেন্ট ডেট ফরম্যাটিং
      const eventDate = new Date(event.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

      const card = document.createElement('div');
      card.className = "cyber-glass";
      card.style.padding = "20px";
      card.style.borderRadius = "8px";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      card.style.borderTop = `4px solid ${event.status === 'upcoming' ? 'var(--neon-green)' : 'var(--text-muted)'}`;

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:11px; font-weight:bold; color:${event.status === 'upcoming' ? 'var(--neon-green)' : 'var(--text-muted)'}; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px;">
              ● ${event.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
            </span>
            <small style="color:var(--neon-yellow); font-weight:bold;"><i class="fas fa-tags"></i> ${event.category}</small>
          </div>
          <h3 style="color:#fff; font-size:16px; margin-bottom:8px;">${event.title}</h3>
          <p style="color:var(--text-muted); font-size:12px; line-height:1.6; margin-bottom:15px;">${event.description}</p>
          
          <div style="font-size:12px; color:var(--text-main); display:flex; flex-direction:column; gap:5px; background:rgba(0,0,0,0.2); padding:10px; border-radius:4px;">
            <span><i class="fas fa-calendar-day" style="color:var(--neon-blue); width:20px;"></i> <strong>তারিখ:</strong> ${eventDate}</span>
            <span><i class="fas fa-clock" style="color:var(--neon-blue); width:20px;"></i> <strong>সময়:</strong> ${event.time}</span>
            <span><i class="fas fa-map-marker-alt" style="color:var(--neon-red); width:20px;"></i> <strong>ভেন্যু:</strong> ${event.venue}</span>
          </div>
        </div>

        <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--glass-border); padding-top:12px;">
          <button class="btn-delete-event" data-id="${eventId}" style="background:transparent; border:1px solid var(--neon-red); color:var(--neon-red); padding:5px 12px; font-size:11px; border-radius:4px; cursor:pointer; font-weight:bold;"><i class="fas fa-trash-alt"></i> মুছুন</button>
        </div>
      `;
      eventsGrid.appendChild(card);
    });

    // ডিলিট বাটনের জন্য ইভেন্ট হ্যান্ডলার
    document.querySelectorAll('.btn-delete-event').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("ইভেন্টটি ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, "events", id));
      }
    }));
  });

  // নতুন ইভেন্ট তৈরির প্রম্পট লজিক
  document.getElementById('btnCreateEvent').addEventListener('click', async () => {
    const title = prompt("ইভেন্টের শিরোনাম বা নাম লিখুন:");
    if (!title) return;
    const desc = prompt("ইভেন্টের সংক্ষিপ্ত বিবরণ দিন:");
    const category = prompt("ক্যাটাগরি (উদা: Olympiad / Seminar / Meeting / Workshop):", "Olympiad");
    const date = prompt("তারিখ দিন (YYYY-MM-DD ফরম্যাটে):", new Date().toISOString().split('T')[0]);
    const time = prompt("সময় দিন (উদা: সকাল ১০:০০ টা):");
    const venue = prompt("ভেন্যু বা স্থান নির্ধারণ করুন:");

    try {
      await addDoc(collection(db, "events"), {
        title: title,
        description: desc || "কোনো বিবরণ দেওয়া হয়নি।",
        category: category,
        date: date,
        time: time || "নির্ধারিত নয়",
        venue: venue || "অনলাইন / টিবিডি",
        status: "upcoming",
        createdAt: new Date().toISOString()
      });
      alert("নতুন প্রোগ্রাম সফলভাবে শিডিউল করা হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });
}

