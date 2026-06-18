// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. প্রোফাইল মডিউলের এইচটিএমএল স্ট্রাকচার রুট কন্টেন্টে পুশ করা
  contentRoot.innerHTML = `
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
          <div class="prof-reg-badge" id="profCardRegNo">লোড হচ্ছে...</div>
          <h2 class="prof-eng-name" id="profCardEngName">সদস্যের নাম</h2>
          
          <div class="membership-timeline-node">
            <span class="timeline-tag"><i class="fas fa-calendar-alt"></i> অন্তর্ভুক্তি: <strong id="profCardJoinDate">--/--/----</strong></span>
            <span class="timeline-tag text-yellow"><i class="fas fa-hourglass-half"></i> সদস্যকাল: <strong id="profCardTotalDays">0</strong> দিন</span>
          </div>
        </div>

        <div class="cyber-divider"></div>

        <div class="profile-details-grid">
          <div class="info-metric-box">
            <small><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</small>
            <p id="profGridPhone">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-envelope"></i> ইমেইল এড্রেস</small>
            <p id="profGridEmail">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-tint"></i> রক্তের গ্রুপ</small>
            <p id="profGridBlood" style="color: var(--neon-red);">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-venus-mars"></i> লিঙ্গ (Gender)</small>
            <p id="profGridGender">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা</small>
            <p id="profGridAddress">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-user-shield"></i> মেম্বারশিপ রোল</small>
            <p id="profGridRole" style="color: var(--neon-green); text-transform: uppercase;">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-toggle-on"></i> অ্যাকাউন্ট স্ট্যাটাস</small>
            <p id="profGridStatus">-</p>
          </div>
        </div>

      </div>
    </section>
  `;

  // ২. কারেন্ট লগইন থাকা ইউজারের অবজেক্ট চেক করা
  const user = auth.currentUser;
  if (!user) return;

  // ৩. ফায়ারস্টোর থেকে রিয়েল-টাইম ডাটা লিসেন ও ক্যালকুলেশন লুপ
  onSnapshot(doc(db, "users", user.uid), (snapshot) => {
    if (snapshot.exists()) {
      const memberData = snapshot.data();
      
      // ক) প্রোফাইল টপ কার্ড ডাটা বাইন্ডিং
      document.getElementById('profCardAvatar').src = memberData.photoUrl || '../placeholder.png';
      document.getElementById('profCardRegNo').innerText = memberData.registrationNo || "REG-PENDING";
      document.getElementById('profCardEngName').innerText = memberData.englishName || "সদস্যের নাম";
      
      // খ) বিস্তারিত ইনফো গ্রিড বাইন্ডিং
      document.getElementById('profGridPhone').innerText = memberData.phoneNumber || "প্রদান করা হয়নি";
      document.getElementById('profGridEmail').innerText = user.email || "পাওয়া যায়নি";
      document.getElementById('profGridBlood').innerText = memberData.bloodGroup || "জানা নেই";
      document.getElementById('profGridGender').innerText = memberData.gender || "নির্দিষ্ট নয়";
      document.getElementById('profGridAddress').innerText = memberData.presentAddress || "ঠিকানা পাওয়া যায়নি";
      document.getElementById('profGridRole').innerText = memberData.role || "member";
      document.getElementById('profGridStatus').innerText = memberData.status || "Active";

      // গ) ডাইনামিক সদস্যপদ দিন গণনা লজিক (Live Membership Counter)
      if (memberData.createdAt) {
        // ফায়ারবেস টাইমস্ট্যাম্প বা ডেট স্ট্রিং কনভার্সন
        const joinDate = memberData.createdAt.toDate ? memberData.createdAt.toDate() : new Date(memberData.createdAt);
        
        // ফর্ম্যাট ডেট (DD/MM/YYYY)
        const day = String(joinDate.getDate()).padStart(2, '0');
        const month = String(joinDate.getMonth() + 1).padStart(2, '0');
        const year = joinDate.getFullYear();
        document.getElementById('profCardJoinDate').innerText = `${day}/${month}/${year}`;

        // আজ পর্যন্ত মোট দিন গণনা
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
}
