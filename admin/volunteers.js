let localVolunteersArray = [];

function loadVolunteersModule(contentRoot, db, collection, onSnapshot, doc, getDocs, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🙋 স্বেচ্ছাসেবক (Volunteer) উইং কন্ট্রোল</h2>
      <span style="font-size:12px; color:var(--neon-yellow); background:rgba(255,183,3,0.1); border:1px solid var(--neon-yellow); padding:5px 12px; border-radius:4px;" id="volunteerCountNode">সর্বমোট: লোড হচ্ছে...</span>
    </div>

    <div class="cyber-glass" style="padding:15px; border-radius:6px; margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
      <input type="text" id="volunteerSearchInput" class="cyber-input" placeholder="নাম, শিক্ষাপ্রতিষ্ঠান বা মোবাইল দিয়ে খুঁজুন..." style="margin:0; flex:1; min-width:200px;">
      <select id="volunteerStatusFilter" class="cyber-input" style="margin:0; width:160px; background:#000; color:#fff;">
        <option value="all">সকল স্ট্যাটাস</option>
        <option value="pending">Pending (আবেদনকারী)</option>
        <option value="selected">Selected (নির্বাচিত)</option>
        <option value="rejected">Rejected (বাতিল)</option>
      </select>
    </div>

    <div class="cyber-glass" style="overflow-x:auto; border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
        <thead style="background:rgba(0,180,216,0.15); color:var(--neon-blue);">
          <tr>
            <th style="padding:12px;">নাম ও প্রতিষ্ঠান</th>
            <th style="padding:12px;">মোবাইল ও ইমেইল</th>
            <th style="padding:12px;">ইভেন্ট/ডিউটি</th>
            <th style="padding:12px;">স্ট্যাটাস</th>
            <th style="padding:12px; text-align:right;">ব্যবস্থাপনা</th>
          </tr>
        </thead>
        <tbody id="volunteerTableBody"></tbody>
      </table>
    </div>
  `;

  const searchInput = document.getElementById('volunteerSearchInput');
  const statusFilter = document.getElementById('volunteerStatusFilter');
  const tbody = document.getElementById('volunteerTableBody');
  const countNode = document.getElementById('volunteerCountNode');

  // ফায়ারবেস থেকে রিয়েল-টাইমে ভলান্টিয়ারদের ডাটা লোড করা (সংগঠনের সাধারণ ইউজারদের মধ্য থেকে যাদের রোল volunteer)
  onSnapshot(collection(db, "users"), (snap) => {
    localVolunteersArray = [];
    snap.forEach(uDoc => {
      const data = uDoc.data();
      // যারা অ্যাপ্লিকেশন করেছে বা অলরেডি ভলান্টিয়ার হিসেবে কাজ করছে
      if (data.role === 'volunteer' || data.isVolunteerApplicant === true) {
        localVolunteersArray.push({ id: uDoc.id, ...data });
      }
    });
    countNode.innerText = `সর্বমোট স্বেচ্ছাসেবক: ${localVolunteersArray.length} জন`;
    renderFilteredVolunteers();
  });

  function renderFilteredVolunteers() {
    tbody.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;

    const filtered = localVolunteersArray.filter(v => {
      const matchesSearch = (v.englishName && v.englishName.toLowerCase().includes(searchTerm)) || 
                            (v.institution && v.institution.toLowerCase().includes(searchTerm)) ||
                            (v.mobileNumber && v.mobileNumber.includes(searchTerm));
      
      // যদি ডাটাতে ভলান্টিয়ার স্ট্যাটাস না থাকে তবে ডিফল্ট 'pending' ধরা হবে
      const vStatus = v.volunteerStatus || 'pending';
      return matchesSearch && (filterValue === 'all' || vStatus === filterValue);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">কোনো স্বেচ্ছাসেবকের রেকর্ড পাওয়া যায়নি।</td></tr>`;
      return;
    }

    filtered.forEach(v => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = "1px solid var(--glass-border)";
      
      const vStatus = v.volunteerStatus || 'pending';
      let statusColor = vStatus === 'selected' ? 'var(--neon-green)' : (vStatus === 'rejected' ? 'var(--neon-red)' : 'var(--neon-yellow)');

      tr.innerHTML = `
        <td style="padding:12px;">
          <div style="font-weight:bold; color:#fff;">${v.englishName}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;"><i class="fas fa-university"></i> ${v.institution || 'প্রতিষ্ঠান জানা নেই'}</div>
        </td>
        <td style="padding:12px;">
          <div>${v.mobileNumber || 'N/A'}</div>
          <div style="font-size:11px; color:var(--text-muted);">${v.email || ''}</div>
        </td>
        <td style="padding:12px; color:var(--neon-blue); font-weight:600;">
          ${v.assignedDuty || '⏳ নো ডিউটি'}
        </td>
        <td style="padding:12px;"><span style="color:${statusColor}; font-weight:bold;">● ${vStatus.toUpperCase()}</span></td>
        <td style="padding:12px; text-align:right; display:flex; gap:5px; justify-content:flex-end; align-items:center;">
          <button class="cyber-input btn-assign-duty" data-id="${v.id}" style="width:auto; padding:4px 8px; font-size:11px; background:rgba(0,180,216,0.1); border:1px solid var(--neon-blue); margin:0;" title="ডিউটি দিন"><i class="fas fa-clipboard-list" data-id="${v.id}"></i></button>
          
          <select class="cyber-input v-status-changer" data-id="${v.id}" style="width:auto; margin:0; padding:2px 5px; font-size:11px; background:#000; height:28px; color:#fff;">
            <option value="">বাছাই</option>
            <option value="selected">Select (অনুমোদন)</option>
            <option value="rejected">Reject (বাতিল)</option>
          </select>

          <button class="cyber-input btn-delete-volunteer" data-id="${v.id}" style="width:auto; padding:5px 10px; font-size:11px; background:var(--neon-red); border:none; margin:0;"><i class="fas fa-trash" data-id="${v.id}"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // ১. স্ট্যাটাস পরিবর্তন করার ইভেন্ট লিসেনার
    document.querySelectorAll('.v-status-changer').forEach(s => s.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      if (!newStatus) return;

      if (confirm(`স্বেচ্ছাসেবকের স্ট্যাটাস "${newStatus.toUpperCase()}" করতে চান?`)) {
        await updateDoc(doc(db, "users", id), { 
          volunteerStatus: newStatus,
          role: newStatus === 'selected' ? 'volunteer' : 'member' // সিলেক্ট হলে রোল ভলান্টিয়ার হবে
        });
      }
      e.target.value = "";
    }));

    // ২. ডিউটি বা টাস্ক অ্যাসাইন করার ইভেন্ট লিসেনার
    document.querySelectorAll('.btn-assign-duty').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const currentVolunteer = localVolunteersArray.find(v => v.id === id);
      const dutyText = prompt(`"${currentVolunteer.englishName}" এর জন্য নতুন দায়িত্ব বা ভেন্যু ডিউটি লিখুন (যেমন: রেজিস্ট্রেশন ডেস্ক / অলিম্পিয়াড ল্যাব-১):`, currentVolunteer.assignedDuty || "");
      
      if (dutyText !== null) {
        await updateDoc(doc(db, "users", id), { assignedDuty: dutyText || "⏳ নো ডিউটি" });
        alert("স্বেচ্ছাসেবকের দায়িত্ব সফলভাবে আপডেট করা হয়েছে!");
      }
    }));

    // ৩. রিমুভ করার ইভেন্ট লিসেনার
    document.querySelectorAll('.btn-delete-volunteer').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই সদস্যকে স্বেচ্ছাসেবক উইং থেকে সরিয়ে দিতে চান? (এর প্রোফাইল ডিলিট হবে না)")) {
        await updateDoc(doc(db, "users", id), { 
          isVolunteerApplicant: false, 
          volunteerStatus: deleteField(), // ফিল্ড ডিলিট (অথবা সাধারণ স্ট্র্রিং দিয়ে ফাকা করা)
          role: 'member' 
        });
      }
    }));
  }

  searchInput.addEventListener('input', renderFilteredVolunteers);
  statusFilter.addEventListener('change', renderFilteredVolunteers);
}
