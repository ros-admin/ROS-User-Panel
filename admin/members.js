let localMembersArray = []; // লোকাল ক্যাশ ভ্যারিয়েবল

function loadMembersModule(contentRoot, db, collection, onSnapshot, doc, getDocs, addDoc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">👥 সদস্য ডাটাবেজ কন্ট্রোল</h2>
      <button class="cyber-input" id="btnManualEntry" style="width:auto; margin:0; background:var(--neon-green); border:none; font-weight:bold; padding:8px 15px;">+ ম্যানুয়াল মেম্বার তৈরি করুন</button>
    </div>
    
    <div class="cyber-glass" style="padding:15px; border-radius:6px; margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap;">
      <input type="text" id="memberSearchInput" class="cyber-input" placeholder="নাম, ইমেইল বা আইডি দিয়ে খুঁজুন..." style="margin:0; flex:1; min-width:200px;">
      <select id="memberStatusFilter" class="cyber-input" style="margin:0; width:150px; background:#000; color:#fff;">
        <option value="all">সকল স্ট্যাটাস</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <div class="cyber-glass" style="overflow-x:auto; border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
        <thead style="background:rgba(0,180,216,0.15); color:var(--neon-blue);">
          <tr>
            <th style="padding:12px;">রেজিস্ট্রেশন নং</th>
            <th style="padding:12px;">নাম</th>
            <th style="padding:12px;">মোবাইল</th>
            <th style="padding:12px;">স্ট্যাটাস</th>
            <th style="padding:12px; text-align:right;">ব্যবস্থাপনা</th>
          </tr>
        </thead>
        <tbody id="memberTableBody"></tbody>
      </table>
    </div>

    <div class="nexus-modal" id="memberDetailsModal" style="display:none; background:rgba(0,0,0,0.85);">
      <div class="modal-body cyber-glass" style="max-width:550px; border-color:var(--neon-blue);">
        <h3 style="color:var(--neon-blue); margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:10px;">🪪 সদস্য প্রোফাইল</h3>
        <div id="modalMemberCardContent" style="font-size:13px; line-height:1.8; color:var(--text-main);"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
          <button type="button" class="cyber-input" id="closeMemberModalBtn" style="width:auto; margin:0; background:var(--neon-red); border:none; font-weight:bold;">বন্ধ করুন</button>
        </div>
      </div>
    </div>
  `;

  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');

  // ডাটাবেজ লিসেনার (সুপার এডমিন বাদে ডাটা লোড করবে)
  onSnapshot(collection(db, "users"), (snap) => {
    localMembersArray = [];
    snap.forEach(userDoc => {
      if (userDoc.data().role !== 'super_admin') {
        localMembersArray.push({ id: userDoc.id, ...userDoc.data() });
      }
    });
    renderFilteredMembers();
  });

  function renderFilteredMembers() {
    const tbody = document.getElementById('memberTableBody');
    tbody.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;

    const filtered = localMembersArray.filter(u => {
      const matchesSearch = (u.englishName && u.englishName.toLowerCase().includes(searchTerm)) || 
                            (u.memberId && u.memberId.toLowerCase().includes(searchTerm)) || 
                            (u.mobileNumber && u.mobileNumber.includes(searchTerm));
      return matchesSearch && (filterValue === 'all' || u.status === filterValue);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>`;
      return;
    }

    filtered.forEach(u => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = "1px solid var(--glass-border)";
      let statusColor = u.status === 'active' ? 'var(--neon-green)' : (u.status === 'suspended' ? 'var(--neon-red)' : 'var(--neon-yellow)');

      tr.innerHTML = `
        <td style="padding:12px; color:var(--neon-blue); font-weight:bold;">${u.memberId || '⏳ Pending'}</td>
        <td style="padding:12px;">${u.englishName}</td>
        <td style="padding:12px;">${u.mobileNumber || 'N/A'}</td>
        <td style="padding:12px;"><span style="color:${statusColor}; font-weight:bold;">● ${u.status.toUpperCase()}</span></td>
        <td style="padding:12px; text-align:right; display:flex; gap:5px; justify-content:flex-end;">
          <button class="cyber-input btn-view" data-id="${u.id}" style="width:auto; padding:5px 10px; font-size:11px; background:rgba(0,180,216,0.2); border:1px solid var(--neon-blue); margin:0;"><i class="fas fa-eye" data-id="${u.id}"></i></button>
          <select class="cyber-input erp-status-changer" data-id="${u.id}" style="width:auto; margin:0; padding:2px 5px; font-size:11px; background:#000; height:28px; color:#fff;">
            <option value="">পদক্ষেপ</option>
            <option value="active">Active / Approve</option>
            <option value="suspended">Suspend</option>
            <option value="inactive">Inactive</option>
          </select>
          <button class="cyber-input btn-delete-mem" data-id="${u.id}" style="width:auto; padding:5px 10px; font-size:11px; background:var(--neon-red); border:none; margin:0;"><i class="fas fa-trash" data-id="${u.id}"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // ইভেন্ট লিসেনার বাইন্ডিং
    document.querySelectorAll('.btn-view').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const member = localMembersArray.find(m => m.id === id);
      if (!member) return;
      document.getElementById('modalMemberCardContent').innerHTML = `
        <p><strong>নাম:</strong> ${member.englishName}</p>
        <p><strong>আইডি:</strong> ${member.memberId || 'Pending'}</p>
        <p><strong>মোবাইল:</strong> ${member.mobileNumber || 'N/A'}</p>
      `;
      document.getElementById('memberDetailsModal').style.display = 'flex';
    }));

    document.querySelectorAll('.btn-delete-mem').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("সদস্যের ডাটা চিরতরে মুছে যাবে। নিশ্চিত?")) {
        await deleteDoc(doc(db, "users", id));
      }
    }));

    document.querySelectorAll('.erp-status-changer').forEach(s => s.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const newStatus = e.target.value;
      if (!newStatus) return;

      if (confirm(`স্ট্যাটাস পরিবর্তন করতে চান?`)) {
        const updateData = { status: newStatus };
        const currentMem = localMembersArray.find(m => m.id === id);
        
        if (newStatus === 'active' && !currentMem.memberId) {
          const currentYear = new Date().getFullYear();
          const querySnapshot = await getDocs(collection(db, "users"));
          let maxSerial = 0;
          querySnapshot.forEach((doc) => {
            const memberId = doc.data().memberId;
            if (memberId && memberId.startsWith(`ROS-${currentYear}-`)) {
              const serialNum = parseInt(memberId.split('-')[2], 10);
              if (serialNum > maxSerial) maxSerial = serialNum;
            }
          });
          updateData.memberId = `ROS-${currentYear}-${String(maxSerial + 1).padStart(4, '0')}`;
        }
        await updateDoc(doc(db, "users", id), updateData);
      }
      e.target.value = "";
    }));
  }

  // ম্যানুয়াল এন্ট্রি ও ক্লোজ বাটন কন্ট্রোল
  document.getElementById('btnManualEntry').addEventListener('click', async () => {
    const name = prompt("সদস্যের নাম:");
    if (!name) return;
    const mobile = prompt("মোবাইল নম্বর:");
    
    const currentYear = new Date().getFullYear();
    const querySnapshot = await getDocs(collection(db, "users"));
    let maxSerial = 0;
    querySnapshot.forEach((doc) => {
      const memberId = doc.data().memberId;
      if (memberId && memberId.startsWith(`ROS-${currentYear}-`)) {
        const serialNum = parseInt(memberId.split('-')[2], 10);
        if (serialNum > maxSerial) maxSerial = serialNum;
      }
    });
    const generatedId = `ROS-${currentYear}-${String(maxSerial + 1).padStart(4, '0')}`;

    await addDoc(collection(db, "users"), {
      englishName: name, mobileNumber: mobile, status: "active", memberId: generatedId, role: "member", createdAt: new Date().toISOString()
    });
    alert("সফলভাবে মেম্বার তৈরি হয়েছে!");
  });

  document.getElementById('closeMemberModalBtn').addEventListener('click', () => {
    document.getElementById('memberDetailsModal').style.display = 'none';
  });

  searchInput.addEventListener('input', renderFilteredMembers);
  statusFilter.addEventListener('change', renderFilteredMembers);
}
