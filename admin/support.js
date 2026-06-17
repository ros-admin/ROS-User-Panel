function loadSupportModule(contentRoot, db, collection, onSnapshot, doc, updateDoc, deleteDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🎫 মেম্বার সাপোর্ট ও হেল্পডেস্ক</h2>
      <span style="font-size:12px; color:var(--neon-green); background:rgba(0,245,212,0.1); border:1px solid var(--neon-green); padding:5px 12px; border-radius:4px;" id="openTicketsCountNode">ওপেন টিকেট: লোড হচ্ছে...</span>
    </div>

    <!-- টিকেট তালিকা -->
    <div class="cyber-glass" style="overflow-x:auto; border-radius:8px;">
      <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
        <thead style="background:rgba(0,180,216,0.15); color:var(--neon-blue);">
          <tr>
            <th style="padding:12px;">মেম্বার ও আইডি</th>
            <th style="padding:12px;">বিষিয় ও সমস্যা</th>
            <th style="padding:12px;">ক্যাটাগরি</th>
            <th style="padding:12px;">স্ট্যাটাস</th>
            <th style="padding:12px; text-align:right;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody id="supportTicketsTableBody">
          <tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">টিকেট ডাটাবেজ কানেক্ট হচ্ছে...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('supportTicketsTableBody');
  const countNode = document.getElementById('openTicketsCountNode');

  // ফায়ারবেস থেকে রিয়েল-টাইমে মেম্বারদের সাপোর্ট টিকেট লোড করা
  onSnapshot(collection(db, "support_tickets"), (snap) => {
    tbody.innerHTML = "";
    let openTicketsCount = 0;

    if (snap.empty) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">বর্তমানে কোনো সাপোর্ট টিকেট বা অভিযোগ পেন্ডিং নেই।</td></tr>`;
      countNode.innerText = "ওপেন টিকেট: ০টি";
      return;
    }

    snap.forEach(tDoc => {
      const ticket = { id: tDoc.id, ...tDoc.data() };
      
      if (ticket.status === 'open' || ticket.status === 'pending') {
        openTicketsCount++;
      }

      const tr = document.createElement('tr');
      tr.style.borderBottom = "1px solid var(--glass-border)";

      const statusColor = ticket.status === 'solved' ? 'var(--neon-green)' : 'var(--neon-yellow)';

      tr.innerHTML = `
        <td style="padding:12px;">
          <div style="font-weight:bold; color:#fff;">${ticket.memberName || 'অজ্ঞাত মেম্বার'}</div>
          <div style="font-size:11px; color:var(--neon-blue); font-family:'Orbitron'; margin-top:2px;">${ticket.memberId || 'N/A'}</div>
        </td>
        <td style="padding:12px; max-width:300px;">
          <div style="font-weight:bold; color:var(--text-main);">${ticket.subject}</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px; white-space:pre-wrap;">${ticket.message}</div>
        </td>
        <td style="padding:12px;"><span style="font-size:11px; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px; color:var(--text-main);">${ticket.category || 'General'}</span></td>
        <td style="padding:12px;"><span style="color:${statusColor}; font-weight:bold;">● ${ticket.status.toUpperCase()}</span></td>
        <td style="padding:12px; text-align:right; display:flex; gap:5px; justify-content:flex-end; align-items:center; height:60px;">
          <!-- সমাধান বাটন -->
          <button class="cyber-input btn-solve-ticket" data-id="${ticket.id}" style="width:auto; padding:4px 10px; font-size:11px; background:rgba(0,245,212,0.1); border:1px solid var(--neon-green); color:var(--neon-green); margin:0;" title="সমাধান দিন"><i class="fas fa-check" data-id="${ticket.id}"></i> Solve</button>
          
          <!-- ডিলিট বাটন -->
          <button class="cyber-input btn-delete-ticket" data-id="${ticket.id}" style="width:auto; padding:5px 10px; font-size:11px; background:transparent; border:none; color:var(--neon-red); margin:0;"><i class="fas fa-trash-alt" data-id="${ticket.id}"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    countNode.innerText = `ওপেন টিকেট: ${openTicketsCount}টি`;

    // ১. টিকেট সলভড করার ইভেন্ট লিসেনার
    document.querySelectorAll('.btn-solve-ticket').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const feedback = prompt("মেম্বারের জন্য কোনো সমাধান বার্তা বা নোট দিতে চান? (ঐচ্ছিক):");
      
      if (feedback !== null) {
        await updateDoc(doc(db, "support_tickets", id), {
          status: 'solved',
          adminFeedback: feedback,
          solvedAt: new Date().toISOString()
        });
        alert("টিকেটটি সফলভাবে সমাধান করা হয়েছে!");
      }
    }));

    // ২. টিকেট ডিলিট করার ইভेंट লিসেনার
    document.querySelectorAll('.btn-delete-ticket').forEach(b => b.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("এই সাপোর্ট টিকেট রেকর্ডটি ডাটাবেজ থেকে চিরতরে মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, "support_tickets", id));
      }
    }));
  });
}
