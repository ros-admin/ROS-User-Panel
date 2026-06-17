let localCommitteeList = [];

function loadCommitteeModule(contentRoot, db, collection, onSnapshot, doc, getDocs, addDoc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🏛️ কমিটি ফরমেশন প্যানেল</h2>
      <button class="cyber-input" id="btnCreateCommittee" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 15px;">+ নতুন কমিটি গঠন করুন</button>
    </div>

    <div style="display:grid; grid-template-columns:1fr 2fr; gap:20px; align-items:start;">
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-green); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">👤 সদস্য পদায়ন (Assign Member)</h3>
        <form id="erpCommitteeAssignForm">
          <label style="font-size:12px; color:var(--text-muted);">কমিটি নির্বাচন করুন:</label>
          <select id="assignCommitteeSelect" class="cyber-input" style="background:#000; color:#fff;" required>
            <option value="">কমিটি লোড হচ্ছে...</option>
          </select>

          <label style="font-size:12px; color:var(--text-muted);">সদস্য নির্বাচন করুন:</label>
          <select id="assignMemberSelect" class="cyber-input" style="background:#000; color:#fff;" required>
            <option value="">সদস্য লোড হচ্ছে...</option>
          </select>

          <label style="font-size:12px; color:var(--text-muted);">পদবী (Designation):</label>
          <input type="text" id="assignDesignation" class="cyber-input" placeholder="উদা: সভাপতি / যুগ্ন-সম্পাদক" required>

          <label style="font-size:12px; color:var(--text-muted);">ক্রমিক নম্বর (Priority/Serial):</label>
          <input type="number" id="assignSerial" class="cyber-input" placeholder="উদা: 1, 2, 3 (লিস্টে সাজানোর জন্য)" required>

          <button type="submit" class="cyber-input" style="background:var(--neon-green); border:none; margin:0; font-weight:bold;">কমিটিতে যুক্ত করুন</button>
        </form>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="cyber-glass" style="padding:20px; border-radius:8px;">
          <h3 style="color:var(--neon-blue); font-size:15px; margin-bottom:15px;">📋 বর্তমান একটিভ কমিটিসমূহ</h3>
          <div id="committeeListsContainer" style="display:flex; flex-direction:column; gap:15px;">
            <p style="color:var(--text-muted); font-size:13px;">কমিটি ডাটা লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const committeeSelect = document.getElementById('assignCommitteeSelect');
  const memberSelect = document.getElementById('assignMemberSelect');
  const container = document.getElementById('committeeListsContainer');

  // ১. ড্রপডাউনের জন্য মেম্বারদের লিস্ট লোড করা (শুধুমাত্র Active মেম্বাররা আসবে)
  // `localMembersArray` গ্লোবাল ভ্যারিয়েবল থেকে ডাটা নিবে, অথবা ডাটাবেজ থেকে রিয়েল-টাইম রিড করবে
  onSnapshot(collection(db, "users"), (snap) => {
    memberSelect.innerHTML = `<option value="">-- সদস্য সিলেক্ট করুন --</option>`;
    snap.forEach(mDoc => {
      const u = mDoc.data();
      if(u.role !== 'super_admin' && u.status === 'active') {
        memberSelect.innerHTML += `<option value="${mDoc.id}" data-name="${u.englishName}">${u.englishName} (${u.memberId || 'No ID'})</option>`;
      }
    });
  });

  // ২. রিয়েল-টাইম কমিটি লিস্ট এবং তাদের মেম্বারদের স্ট্রাকচার লোড করা
  onSnapshot(collection(db, "committees"), (snap) => {
    localCommitteeList = [];
    committeeSelect.innerHTML = `<option value="">-- কমিটি সিলেক্ট করুন --</option>`;
    container.innerHTML = "";

    if (snap.empty) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center;">কোনো কমিটি তৈরি করা হয়নি।</p>`;
      return;
    }

    snap.forEach(cDoc => {
      const committee = { id: cDoc.id, ...cDoc.data() };
      localCommitteeList.push(committee);

      // ড্রপডাউনে কমিটি অ্যাড করা
      committeeSelect.innerHTML += `<option value="${committee.id}">${committee.committeeName} (${committee.sessionYear})</option>`;

      // ডান পাশের ভিউ কার্ড তৈরি
      const card = document.createElement('div');
      card.className = "cyber-glass";
      card.style.padding = "15px";
      card.style.borderRadius = "6px";
      card.style.borderLeft = "4px solid var(--neon-blue)";

      // মেম্বারদের প্রায়োরিটি/সিরিয়াল অনুযায়ী সর্ট করা
      const members = committee.members || [];
      members.sort((a, b) => parseInt(a.serial) - parseInt(b.serial));

      let membersHTML = "";
      if(members.length === 0) {
        membersHTML = `<p style="color:var(--text-muted); font-size:12px; margin-top:5px;">⚠️ এই কমিটিতে এখনো কোনো সদস্য পদায়ন করা হয়নি।</p>`;
      } else {
        membersHTML = `
          <table style="width:100%; margin-top:10px; font-size:12px; text-align:left; border-collapse:collapse;">
            <tr style="color:var(--neon-green); border-bottom:1px solid rgba(255,255,255,0.1);">
              <th style="padding:5px;">নাম</th>
              <th style="padding:5px;">পদবী</th>
              <th style="padding:5px; text-align:right;">অ্যাকশন</th>
            </tr>
            ${members.map((m, idx) => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:6px 5px;">${m.memberName}</td>
                <td style="padding:6px 5px; color:var(--neon-yellow);">${m.designation}</td>
                <td style="padding:6px 5px; text-align:right;">
                  <button class="btn-remove-member" data-committee-id="${committee.id}" data-index="${idx}" style="background:transparent; border:none; color:var(--neon-red); cursor:pointer;"><i class="fas fa-user-minus"></i></button>
                </td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">
          <div>
            <h4 style="color:#fff; font-size:14px;">${committee.committeeName}</h4>
            <small style="color:var(--text-muted);">সেশন/মেয়াদ: ${committee.sessionYear} | টাইপ: ${committee.committeeType}</small>
          </div>
          <button class="btn-delete-committee" data-id="${committee.id}" style="background:var(--neon-red); border:none; color:#fff; padding:3px 8px; font-size:11px; border-radius:4px; cursor:pointer; margin-left:auto;"><i class="fas fa-trash"></i> মুছুন</button>
        </div>
        ${membersHTML}
      `;
      container.appendChild(card);
    });

    // ডিলিট এবং রিমুভ বাটনের জন্য ইভেন্ট বাইন্ডিং
    document.querySelectorAll('.btn-delete-committee').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if(confirm("কমিটিটি ডিলিট করলে এর ভেতরের সকল মেম্বার লিস্টও মুছে যাবে! আপনি কি নিশ্চিত?")) {
        await deleteDoc(doc(db, "committees", id));
      }
    }));

    document.querySelectorAll('.btn-remove-member').forEach(b => b.addEventListener('click', async (e) => {
      const cId = e.currentTarget.getAttribute('data-committee-id');
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      
      if(confirm("কমিটি থেকে এই সদস্যকে বাদ দিতে চান?")) {
        const committee = localCommitteeList.find(c => c.id === cId);
        if(committee) {
          committee.members.splice(index, 1); // নির্দিষ্ট মেম্বার রিমুভ
          await updateDoc(doc(db, "committees", cId), { members: committee.members });
        }
      }
    }));
  });

  // ৩. নতুন মূল কমিটি তৈরি করার প্রম্পট হ্যান্ডলার
  document.getElementById('btnCreateCommittee').addEventListener('click', async () => {
    const cName = prompt("কমিটির নাম দিন (উদা: কেন্দ্রীয় কার্যনির্বাহী সংসদ, রাজশাহী জোন):");
    if(!cName) return;
    const sYear = prompt("সেশন/বছর নির্ধারণ করুন (উদা: 2026-2027):");
    if(!sYear) return;
    const cType = prompt("কমিটির ধরন (Executive / Sub-Committee / Advisory):", "Executive");

    try {
      await addDoc(collection(db, "committees"), {
        committeeName: cName,
        sessionYear: sYear,
        committeeType: cType,
        members: [], // শুরুতে মেম্বার খালি থাকবে
        createdAt: new Date().toISOString()
      });
      alert("নতুন কমিটি সফলভাবে রেজিস্টার্ড হয়েছে!");
    } catch (err) { alert("ত্রুটি: " + err.message); }
  });

  // ৪. কমিটিতে মেম্বার পদায়ন করার সাবমিট হ্যান্ডলার
  document.getElementById('erpCommitteeAssignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cId = committeeSelect.value;
    const mId = memberSelect.value;
    const mName = memberSelect.options[memberSelect.selectedIndex].getAttribute('data-name');
    const designation = document.getElementById('assignDesignation').value;
    const serial = document.getElementById('assignSerial').value;

    if(!cId || !mId) { alert("কমিটি এবং মেম্বার সঠিকভাবে সিলেক্ট করুন!"); return; }

    const targetCommittee = localCommitteeList.find(c => c.id === cId);
    if(targetCommittee) {
      // চেক করা যে এই মেম্বার ইতিমধ্যে এই কমিটিতে আছে কিনা
      const alreadyExists = targetCommittee.members.some(m => m.memberUid === mId);
      if(alreadyExists) { alert("এই সদস্য অলরেডি এই কমিটিতে যুক্ত আছেন!"); return; }

      // নতুন মেম্বার অবজেক্ট পুশ করা
      targetCommittee.members.push({
        memberUid: mId,
        memberName: mName,
        designation: designation,
        serial: serial
      });

      try {
        await updateDoc(doc(db, "committees", cId), { members: targetCommittee.members });
        alert("সদস্যকে সফলভাবে কমিটিতে পদায়ন করা হয়েছে!");
        document.getElementById('erpCommitteeAssignForm').reset();
      } catch (err) { alert(err.message); }
    }
  });
}
