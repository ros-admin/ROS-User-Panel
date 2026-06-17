let localAttendanceSessions = [];

function loadAttendanceModule(contentRoot, db, collection, onSnapshot, doc, getDocs, addDoc, updateDoc, query, where) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">⏱️ ডিজিটাল উপস্থিতি (Attendance Manager)</h2>
      <button class="cyber-input" id="btnCreateSession" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন উপস্থিতি সেশন তৈরি করুন</button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 2fr; gap:20px; align-items:start;">
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-green); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">🔍 কুইক এন্ট্রি (আইডি স্ক্যান/ইনপুট)</h3>
        <form id="erpAttendanceInputForm">
          <label style="font-size:12px; color:var(--text-muted);">চলতি সেশন নির্বাচন করুন:</label>
          <select id="attendanceSessionSelect" class="cyber-input" style="background:#000; color:#fff;" required>
            <option value="">সেশন লোড হচ্ছে...</option>
          </select>

          <label style="font-size:12px; color:var(--text-muted);">সদস্য আইডি (Member ID):</label>
          <input type="text" id="attendanceMemberIdInput" class="cyber-input" placeholder="উদা: ROS-2026-0001" required style="font-family:'Orbitron', sans-serif; letter-spacing:1px; text-transform:uppercase;">

          <button type="submit" class="cyber-input" style="background:var(--neon-green); border:none; margin:0; font-weight:bold;">حাজিরা নিশ্চিত করুন</button>
        </form>
      </div>

      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-yellow); font-size:15px; margin-bottom:15px;">📊 লাইভ উপস্থিতি ট্র্যাক (Live Log)</h3>
        <div id="attendanceLiveLogContainer" style="display:flex; flex-direction:column; gap:15px;">
          <p style="color:var(--text-muted); font-size:13px;">উপস্থিতি ডাটাবেজ কানেক্ট হচ্ছে...</p>
        </div>
      </div>
    </div>
  `;

  const sessionSelect = document.getElementById('attendanceSessionSelect');
  const logContainer = document.getElementById('attendanceLiveLogContainer');

  // ১. রিয়েল-টাইমে উপস্থিতি সেশনসমূহ লোড করা
  onSnapshot(collection(db, "attendance_sessions"), (snap) => {
    localAttendanceSessions = [];
    sessionSelect.innerHTML = `<option value="">-- সেশন সিলেক্ট করুন --</option>`;
    logContainer.innerHTML = "";

    if (snap.empty) {
      logContainer.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center;">বর্তমানে কোনো উপস্থিতি সেশন একটিভ নেই।</p>`;
      return;
    }

    snap.forEach(sDoc => {
      const session = { id: sDoc.id, ...sDoc.data() };
      localAttendanceSessions.push(session);

      // ড্রপডাউনে সেশন যোগ করা
      sessionSelect.innerHTML += `<option value="${session.id}">${session.eventName} (${session.date})</option>`;

      // ডান পাশের লাইভ লগ ভিউ কার্ড তৈরি
      const card = document.createElement('div');
      card.className = "cyber-glass";
      card.style.padding = "15px";
      card.style.borderRadius = "6px";
      card.style.borderLeft = "4px solid var(--neon-yellow)";

      const attendees = session.attendees || [];

      let attendeesHTML = "";
      if (attendees.length === 0) {
        attendeesHTML = `<p style="color:var(--text-muted); font-size:12px; margin-top:8px; font-style:italic;">⏳ এই সেশনে এখনো কেউ হাজিরা দেয়নি।</p>`;
      } else {
        attendeesHTML = `
          <div style="margin-top:10px; max-height:200px; overflow-y:auto; background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;">
            <table style="width:100%; font-size:12px; text-align:left; border-collapse:collapse;">
              <tr style="color:var(--neon-blue); border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:5px;">আইডি</th>
                <th style="padding:5px;">নাম</th>
                <th style="padding:5px; text-align:right;">সময়</th>
              </tr>
              ${attendees.map(m => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:6px 5px; font-family:'Orbitron'; color:var(--neon-green);">${m.memberId}</td>
                  <td style="padding:6px 5px;">${m.memberName}</td>
                  <td style="padding:6px 5px; text-align:right; color:var(--text-muted);">${m.time}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `;
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">
          <div>
            <h4 style="color:#fff; font-size:14px;">🎯 ${session.eventName}</h4>
            <small style="color:var(--text-muted);">তারিখ: ${session.date} | মোট উপস্থিত: <span style="color:var(--neon-green); font-weight:bold;">${attendees.length} জন</span></small>
          </div>
        </div>
        ${attendeesHTML}
      `;
      logContainer.appendChild(card);
    });
  });

  // ২. নতুন উপস্থিতি সেশন তৈরি করার হ্যান্ডলার
  document.getElementById('btnCreateSession').addEventListener('click', async () => {
    const eName = prompt("কোন প্রোগ্রাম/মিটিংয়ের জন্য হাজিরা নিতে চান? (উদা: ১৬তম অলিম্পিয়াড প্রস্তুতি সভা):");
    if (!eName) return;
    const sDate = prompt("তারিখ নির্ধারণ করুন (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

    try {
      await addDoc(collection(db, "attendance_sessions"), {
        eventName: eName,
        date: sDate,
        attendees: [], // শুরুতে উপস্থিতির তালিকা শূন্য থাকবে
        createdAt: new Date().toISOString()
      });
      alert("নতুন উপস্থিতি সেশন রিয়েল-টাইমে সচল করা হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });

  // ৩. মেম্বার আইডি ইনপুট দিয়ে উপস্থিতি নিশ্চিত করার লজিক
  document.getElementById('erpAttendanceInputForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sessionId = sessionSelect.value;
    const inputId = document.getElementById('attendanceMemberIdInput').value.trim().toUpperCase();

    if (!sessionId) { alert("দয়া করে একটি চলমান সেশন সিলেক্ট করুন!"); return; }

    // মেম্বার ডাটাবেজ থেকে এই আইডির সঠিক সদস্য খুঁজে বের করা
    try {
      const userQuery = await getDocs(collection(db, "users"));
      let targetUser = null;

      userQuery.forEach(uDoc => {
        if (uDoc.data().memberId && uDoc.data().memberId.toUpperCase() === inputId) {
          targetUser = uDoc.data();
        }
      });

