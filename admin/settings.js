function loadSettingsModule(contentRoot, db, collection, onSnapshot, doc, updateDoc, setDoc) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">⚙️ গ্লোবাল সিস্টেম সেটিংস ও কনফিগারেশন</h2>
      <button class="cyber-input" id="btnSaveGlobalSettings" style="width:auto; margin:0; background:var(--neon-blue); border:none; font-weight:bold; padding:8px 20px;">💾 সেটিংস সংরক্ষণ করুন</button>
    </div>

    <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px; align-items:start;">
      
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:#fff; font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">🏢 প্রাতিষ্ঠানিক প্রোফাইল কনফিগারেশন</h3>
        
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; color:var(--text-muted);">সংগঠনের নাম (Organization Name):</label>
            <input type="text" id="setOrgName" class="cyber-input" placeholder="উদা: Robotics Society">
          </div>
          <div>
            <label style="font-size:12px; color:var(--text-muted);">অফিশিয়াল সাপোর্ট ইমেইল:</label>
            <input type="email" id="setOrgEmail" class="cyber-input" placeholder="support@domain.com">
          </div>
          <div>
            <label style="font-size:12px; color:var(--text-muted);">কারেন্ট সিস্টেম নোটিশ (মারকুই টেক্সট):</label>
            <input type="text" id="setSystemNotice" class="cyber-input" placeholder="সর্বশেষ আপডেট বা স্ক্রোলিং নোটিশ...">
          </div>
        </div>
      </div>

      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-yellow); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">🎛️ সিস্টেম গেটওয়ে ও ফিচার কন্ট্রোল</h3>
        
        <div style="display:flex; flex-direction:column; gap:18px; margin-top:10px;">
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:13px; color:#fff;">🎯 অলিম্পিয়াড রেজিস্ট্রেশন গেট</strong>
              <div style="font-size:11px; color:var(--text-muted);">নতুন সদস্যদের মেম্বারশিপ বা রেজিস্ট্রেশন ফর্ম লিংকের স্থিতি।</div>
            </div>
            <select id="setRegGateStatus" class="cyber-input" style="width:100px; background:#000; margin:0;">
              <option value="open">OPEN</option>
              <option value="closed">CLOSED</option>
            </select>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:13px; color:var(--neon-red);">⚠️ সিস্টেম মেইন্টেন্যান্স মোড</strong>
              <div style="font-size:11px; color:var(--text-muted);">চালু করলে সাধারণ ইউজাররা পোর্টালে ঢুকতে পারবে না।</div>
            </div>
            <select id="setMaintenanceMode" class="cyber-input" style="width:100px; background:#000; margin:0; border-color:var(--neon-red);">
              <option value="off">OFF</option>
              <option value="on">ON</option>
            </select>
          </div>

        </div>
      </div>

    </div>
  `;

  // ফায়ারবেস থেকে গ্লোবাল কনফিগারেশন ডাটা লাইভ লোড করা
  // আমরা "system_config" কালেকশনের "global" নামক ডক-এ সেটিংস রাখবো
  onSnapshot(doc(db, "system_config", "global"), (dSnap) => {
    if (dSnap.exists()) {
      const config = dSnap.data();
      document.getElementById('setOrgName').value = config.orgName || "";
      document.getElementById('setOrgEmail').value = config.orgEmail || "";
      document.getElementById('setSystemNotice').value = config.systemNotice || "";
      document.getElementById('setRegGateStatus').value = config.regGateStatus || "open";
      document.getElementById('setMaintenanceMode').value = config.maintenanceMode || "off";
    }
  });

  // সেটিংস সেভ করার লজিক
  document.getElementById('btnSaveGlobalSettings').addEventListener('click', async () => {
    const orgName = document.getElementById('setOrgName').value.trim();
    const orgEmail = document.getElementById('setOrgEmail').value.trim();
    const systemNotice = document.getElementById('setSystemNotice').value.trim();
    const regGateStatus = document.getElementById('setRegGateStatus').value;
    const maintenanceMode = document.getElementById('setMaintenanceMode').value;

    try {
      // setDoc ব্যবহার করে নির্দিষ্ট ডকুমেন্ট আইডি 'global' এ ডাটা ওভাররাইট/সেভ করা
      await setDoc(doc(db, "system_config", "global"), {
        orgName,
        orgEmail,
        systemNotice,
        regGateStatus,
        maintenanceMode,
        updatedAt: new Date().toISOString()
      });
      alert("⚙️ গ্লোবাল সিস্টেম সেটিংস সফলভাবে আপডেট ও ক্লাউডে সংরক্ষিত হয়েছে!");
    } catch (err) {
      alert("সেটিংস সেভ করতে ব্যর্থ: " + err.message);
    }
  });
}

