// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. প্রোফাইল মডিউলের এইচটিএমএল এবং কাস্টম CSS একসাথে রুট কন্টেন্টে পুশ করা
  contentRoot.innerHTML = `
    <style>
      /* প্রোফাইল মডিউলের কাস্টম সাইবারপাঙ্ক ডিজাইন */
      .profile-matrix-card { max-width: 900px; margin: 0 auto; padding: 40px; border-radius: 12px; position: relative; overflow: hidden; }
      .profile-matrix-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, transparent, var(--neon-yellow), transparent); }
      .profile-org-header { text-align: center; margin-bottom: 25px; }
      .org-logo-img { max-width: 260px; height: auto; filter: drop-shadow(0 0 8px rgba(255, 183, 3, 0.2)); }
      .cyber-yellow-line { height: 2px; width: 60%; background: linear-gradient(90deg, transparent, var(--neon-yellow), transparent); margin: 12px auto 0 auto; box-shadow: 0 0 8px var(--neon-yellow); }
      
      .profile-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 20px; }
      .avatar-box-wrapper { width: 130px; height: 130px; border: 2px solid var(--glass-border); padding: 5px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; box-shadow: 0 0 15px rgba(0,180,216,0.1); }
      .prof-square-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 1px solid var(--neon-blue); }
      
      .prof-reg-badge { background: rgba(255, 183, 3, 0.1); color: var(--neon-yellow); border: 1px solid rgba(255, 183, 3, 0.3); padding: 4px 14px; border-radius: 4px; font-family: 'Orbitron'; font-size: 13px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 0 10px rgba(255, 183, 3, 0.1); margin-bottom: 10px; }
      .prof-eng-name { font-size: 24px; font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.1); margin-bottom: 5px; }
      .prof-bg-name { font-size: 16px; color: var(--text-muted); margin-bottom: 15px; }
      
      .membership-timeline-node { display: flex; gap: 15px; margin-top: 5px; flex-wrap: wrap; justify-content: center; }
      .timeline-tag { font-size: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 4px 12px; border-radius: 20px; color: var(--text-muted); }
      .timeline-tag strong { font-family: 'Orbitron', 'Hind Siliguri'; color: #fff; }
      .text-yellow strong { color: var(--neon-yellow) !important; }
      
      .cyber-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--glass-border), transparent); margin: 25px 0; }
      
      .profile-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .info-metric-box { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.05); padding: 14px 16px; border-radius: 6px; transition: 0.3s; }
      .info-metric-box:hover { border-color: rgba(0, 180, 216, 0.3); background: rgba(0, 180, 216, 0.02); }
      .info-metric-box small { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
      .info-metric-box small i { color: var(--neon-blue); font-size: 10px; }
      .info-metric-box p { font-size: 14px; font-weight: 600; color: #fff; word-break: break-all; }
      .span-2 { grid-column: span 2; }

      @media (max-width: 768px) {
        .profile-details-grid { grid-template-columns: repeat(2, 1fr); }
        .span-2 { grid-column: span 2; }
        .profile-matrix-card { padding: 20px; }
      }
      @media (max-width: 480px) {
        .profile-details-grid { grid-template-columns: 1fr; }
        .span-2 { grid-column: span 1; }
      }
    </style>

    <section class="module-viewport">
      <div class="cyber-glass profile-matrix-card">
        
        <div class="profile-org-header">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" alt="ROS Logo" class="org-logo-img">
          <div class="cyber-yellow-line"></div>
        </div>

        <div class="profile-identity-hub">
          <div class="avatar-box-wrapper">
            <img src="../placeholder.png" id="profCardAvatar" class="prof-square-avatar">
          </div>
          <div class="prof-reg-badge" id="profCardRegNo">ROS-LOADING...</div>
          <h2 class="prof-eng-name" id="profCardEngName">লোড হচ্ছে...</h2>
          <h4 class="prof-bg-name" id="profCardBngName">...</h4>
          
          <div class="membership-timeline-node">
            <span class="timeline-tag"><i class="fas fa-calendar-alt"></i> অন্তর্ভুক্তি: <strong id="profCardJoinDate">--/--/----</strong></span>
            <span class="timeline-tag text-yellow"><i class="fas fa-hourglass-half\"></i> সদস্যকাল: <strong id="profCardTotalDays">0</strong> দিন</span>
          </div>
        </div>

        <div class="cyber-divider"></div>

        <div class="profile-details-grid">
          <div class="info-metric-box span-2">
            <small><i class="fas fa-user"></i> পিতার নাম</small>
            <p id="profGridFather">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-user-friends"></i> মাতার নাম</small>
            <p id="profGridMother">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</small>
            <p id="profGridPhone">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-tint"></i> রক্তে গ্রুপ</small>
            <p id="profGridBlood">--</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-venus-mars"></i> লিঙ্গ</small>
            <p id="profGridGender">--</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা</small>
            <p id="profGridAddress">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-shield-alt"></i> সিস্টেম অ্যাক্সেস</small>
            <p id="profGridRole" style="color: var(--neon-green); text-transform: uppercase;">MEMBER</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-info-circle"></i> অ্যাকাউন্ট স্ট্যাটাস</small>
            <p id="profGridStatus" style="color: var(--neon-blue);">Active</p>
          </div>
        </div>

      </div>
    </section>
  `;

  // ২. ফায়ারবেস থেকে লগইন থাকা মেম্বারের কারেন্ট ডাটা রিয়েল-টাইমে রিড করা
  const currentUser = auth.currentUser;
  if (currentUser) {
    onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const memberData = snapshot.data();

        // ক) প্রোফাইল হেডার ডাটা বাইন্ডিং
        document.getElementById('profCardAvatar').src = memberData.photoUrl || '../placeholder.png';
        document.getElementById('profCardRegNo').innerText = memberData.registrationNo || "ROS-NEXUS";
        document.getElementById('profCardEngName').innerText = memberData.englishName || "সদস্য নাম";
        document.getElementById('profCardBngName').innerText = memberData.banglaName || "";

        // খ) গ্রিড ডিটেইলস ডাটা বাইন্ডিং
        document.getElementById('profGridFather').innerText = memberData.fatherName || "তথ্য নেই";
        document.getElementById('profGridMother').innerText = memberData.motherName || "তথ্য নেই";
        document.getElementById('profGridPhone').innerText = memberData.phone || "তথ্য নেই";
        document.getElementById('profGridBlood').innerText = memberData.bloodGroup || "জানা নেই";
        document.getElementById('profGridGender').innerText = memberData.gender || "নির্দিষ্ট নয়";
        document.getElementById('profGridAddress').innerText = memberData.presentAddress || "ঠিকানা পাওয়া যায়নি";
        document.getElementById('profGridRole').innerText = memberData.role || "member";
        document.getElementById('profGridStatus').innerText = memberData.status || "Active";

        // গ) মেম্বারশিপ সময়কাল এবং দিন গণনা
        if (memberData.createdAt) {
          const joinDate = memberData.createdAt.toDate ? memberData.createdAt.toDate() : new Date(memberData.createdAt);
          
          const day = String(joinDate.getDate()).padStart(2, '0');
          const month = String(joinDate.getMonth() + 1).padStart(2, '0');
          const year = joinDate.getFullYear();
          document.getElementById('profCardJoinDate').innerText = `${day}/${month}/${year}`;

          const today = new Date();
          const timeDiff = Math.abs(today.getTime() - joinDate.getTime());
          const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          document.getElementById('profCardTotalDays').innerText = totalDays;
        }
      } else {
        alert("আপনার সদস্য প্রোফাইল ডাটাবেজে খুঁজে পাওয়া যায়নি!");
        signOut(auth);
      }
    });
  } else {
    window.location.href = "../login.html";
  }
}
