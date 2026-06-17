function loadQrVerifyModule(contentRoot, db, collection, onSnapshot, doc, getDocs) {
  contentRoot.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:18px; color:var(--neon-blue);">🔍 QR কোড ভেরিфикации ও সিকিউরিটি গেট</h2>
      <span style="font-size:11px; color:var(--neon-yellow); background:rgba(255,183,3,0.1); border:1px solid var(--neon-yellow); padding:5px 12px; border-radius:4px;">STATUS: LIVE SCANNER GATE</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:20px; align-items:start;">
      
      <!-- বাম পাশ: স্ক্যানার ইনপুট জোন -->
      <div class="cyber-glass" style="padding:20px; border-radius:8px;">
        <h3 style="color:var(--neon-blue); font-size:15px; margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:5px;">📟 স্ক্যানার ইনপুট টার্মিনাল</h3>
        <p style="font-size:12px; color:var(--text-muted); line-height:1.5;">কিউআর কোড স্ক্যানার দিয়ে আইডি কার্ড স্ক্যান করুন অথবা নিচের বক্সে স্ক্যানকৃত ডাটা পেস্ট করে এন্টার চাপুন।</p>
        
        <form id="qrVerifyForm" style="margin-top:15px;">
          <input type="text" id="qrScanInput" class="cyber-input" placeholder="ID:ROS-2026-XXXX|Name:..." required autocomplete="off" autofocus style="font-family:'Orbitron', sans-serif; font-size:13px; letter-spacing:1px; border-color:var(--neon-blue);">
          <button type="submit" class="cyber-input" style="background:var(--neon-blue); border:none; font-weight:bold; margin-top:10px;">🔍 ভেরিফাই করুন</button>
        </form>
        
        <button id="btnResetScanner" class="cyber-input" style="background:transparent; border:1px solid var(--glass-border); color:var(--text-muted); font-size:11px; margin-top:10px; width:auto; padding:5px 10px;">রিসেট টার্মিনাল</button>
      </div>

      <!-- ডান পাশ: লাইভ ভেরিফিকেশন রেজাল্ট প্যানেল -->
      <div id="qrResultPanel" class="cyber-glass" style="padding:25px; border-radius:8px; min-height:260px; display:flex; flex-direction:column; justify-content:center; align-items:center; border: 1px dashed var(--glass-border); transition: all 0.3s ease;">
        <div id="qrPlaceholderState" style="text-align:center;">
          <i class="fas fa-qrcode" style="font-size:50px; color:var(--glass-border); margin-bottom:15px; display:block;"></i>
          <span style="color:var(--text-muted); font-size:13px;">আইডি কার্ড স্ক্যান করার জন্য অপেক্ষা করা হচ্ছে...</span>
        </div>

        <!-- সফল এন্ট্রি (লুকানো থাকবে, ডাটা মিললে শো হবে) -->
        <div id="qrSuccessState" style="display:none; width:100%; text-align:center;">
          <div style="width:70px; height:70px; background:rgba(0,245,212,0.1); border:2px solid var(--neon-green); border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 15px auto; box-shadow:0 0 15px var(--neon-green);">
            <i class="fas fa-user-check" style="font-size:28px; color:var(--neon-green);"></i>
          </div>
          <h3 style="color:var(--neon-green); font-size:18px; margin:0 0 5px 0; font-family:'Orbitron'; letter-spacing:1px;">ACCESS GRANTED</h3>
          <span style="font-size:11px; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:3px;">অফিশিয়াল সদস্য</span>
          
          <div style="margin-top:20px; display:flex; gap:15px; align-items:center; text-align:left; background:rgba(0,0,0,0.2); padding:15px; border-radius:6px; border:1px solid var(--glass-border);">
            <img id="vUserImg" src="https://via.placeholder.com/150" style="width:65px; height:65px; border-radius:4px; border:1px solid var(--neon-blue); object-fit:cover;">
            <div>
              <div id="vUserName" style="font-size:15px; font-weight:bold; color:#fff;"></div>
              <div id="vUserId" style="font-size:12px; color:var(--neon-blue); font-family:'Orbitron'; margin-top:2px;"></div>
              <div id="vUserRole" style="font-size:11px; color:var(--neon-yellow); font-weight:bold; margin-top:2px; text-transform:uppercase;"></div>
            </div>
          </div>
        </div>

        <!-- ব্যর্থ বা ফেক এন্ট্রি (লুকানো থাকবে) -->
        <div id="qrFailedState" style="display:none; text-align:center;">
          <div style="width:70px; height:70px; background:rgba(239,35,60,0.1); border:2px solid var(--neon-red); border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 15px auto; box-shadow:0 0 15px var(--neon-red);">
            <i class="fas fa-user-times" style="font-size:28px; color:var(--neon-red);"></i>
          </div>
          <h3 style="color:var(--neon-red); font-size:18px; margin:0 0 5px 0; font-family:'Orbitron'; letter-spacing:1px;">ACCESS DENIED</h3>
          <p id="qrFailReason" style="color:var(--text-muted); font-size:13px; max-width:250px; margin:0 auto;"></p>
        </div>

      </div>
    </div>
  `;

  const form = document.getElementById('qrVerifyForm');
  const input = document.getElementById('qrScanInput');
  const panel = document.getElementById('qrResultPanel');
  
  const statePlaceholder = document.getElementById('qrPlaceholderState');
  const stateSuccess = document.getElementById('qrSuccessState');
  const stateFailed = document.getElementById('qrFailedState');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawData = input.value.trim();
    if(!rawData) return;

    // প্যানেল রিসেট অ্যানিমেশন ইফেক্ট
    statePlaceholder.style.display = "none";
    stateSuccess.style.display = "none";
    stateFailed.style.display = "none";
    panel.style.borderColor = "var(--glass-border)";
    panel.style.boxShadow = "none";

    let scannedMemberId = "";

    // কিউআর কোডের স্ট্রিং স্ট্রাকচার পার্স করা (উদা: ID:ROS-2026-0001|Name:...)
    if (rawData.includes("ID:") && rawData.includes("|")) {
      try {
        scannedMemberId = rawData.split('|')[0].replace("ID:", "").trim().toUpperCase();
      } catch(err) {
        scannedMemberId = "";
      }
    } else {
      // যদি সরাসরি মেম্বার আইডি টাইপ বা স্ক্যান করা হয়
      scannedMemberId = rawData.toUpperCase();
    }

    if (!scannedMemberId) {
      showFailedState("ভুল কিউআর কোড ফরম্যাট বা ইনভ্যালিড ডাটা স্ট্রাকচার।");
      return;
    }

    // ডাটাবেজে এই মেম্বার আইডির খোঁজ করা
    try {
      const snap = await getDocs(collection(db, "users"));
      let foundUser = null;

      snap.forEach(uDoc => {
        const u = uDoc.data();
        if (u.memberId && u.memberId.toUpperCase() === scannedMemberId) {
          foundUser = u;
        }
      });

      if (foundUser) {
        if (foundUser.status === 'active') {
          // সফল ভেরিফিকেশন
          panel.style.borderColor = "var(--neon-green)";
          panel.style.boxShadow = "0 0 20px rgba(0,245,212,0.15)";
          
          document.getElementById('vUserName').innerText = foundUser.englishName;
          document.getElementById('vUserId').innerText = foundUser.memberId;
          document.getElementById('vUserRole').innerText = foundUser.role || 'Member';
          document.getElementById('vUserImg').src = foundUser.profileImageUrl || "https://via.placeholder.com/150";
          
          stateSuccess.style.display = "block";
        } else {
          // মেম্বার আছে কিন্তু সাসপেন্ড বা ইনঅ্যাক্টিভ
          showFailedState(`সদস্য অ্যাকাউন্টটি বর্তমানে "${foundUser.status || 'inactive'}" অবস্থায় আছে। এন্ট্রি নিষিদ্ধ!`);
        }
      } else {
        // ডাটাবেজে কোনো রেকর্ড নেই (ফেক আইডি)
        showFailedState("এই আইডি কার্ডের কোনো রেকর্ড ডাটাবেজে খুঁজে পাওয়া যায়নি। এটি একটি ভুয়া আইডি হতে পারে!");
      }

    } catch (err) {
      showFailedState("সার্ভার ডাটা রিড করতে ব্যর্থ হয়েছে: " + err.message);
    }
  });

  function showFailedState(reason) {
    panel.style.borderColor = "var(--neon-red)";
    panel.style.boxShadow = "0 0 20px rgba(239,35,60,0.15)";
    document.getElementById('qrFailReason').innerText = reason;
    stateFailed.style.display = "block";
  }

  // টার্মিনাল রিসেট লজিক
  document.getElementById('btnResetScanner').addEventListener('click', () => {
    input.value = "";
    statePlaceholder.style.display = "block";
    stateSuccess.style.display = "none";
    stateFailed.style.display = "none";
    panel.style.borderColor = "var(--glass-border)";
    panel.style.boxShadow = "none";
    input.focus();
  });
}

