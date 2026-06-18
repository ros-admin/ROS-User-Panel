// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. প্রোফাইল মডিউলের এইচটিএমএল এবং আল্ট্রা-প্রিমিয়াম সাইবারপাঙ্ক CSS রেন্ডার
  contentRoot.innerHTML = `
    <style>
      .profile-matrix-card { max-width: 1000px; margin: 0 auto; padding: 40px; border-radius: 16px; position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
      .profile-matrix-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-yellow), transparent); }
      
      .profile-org-header { text-align: center; margin-bottom: 30px; }
      .org-logo-img { max-width: 260px; height: auto; filter: drop-shadow(0 0 8px rgba(0, 180, 216, 0.3)); }
      .cyber-yellow-line { height: 2px; width: 40%; background: linear-gradient(90deg, transparent, var(--neon-blue), transparent); margin: 12px auto 0 auto; box-shadow: 0 0 10px var(--neon-blue); }
      
      .profile-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
      .avatar-box-wrapper { width: 140px; height: 140px; border: 2px solid rgba(0, 180, 216, 0.3); padding: 6px; background: rgba(3, 7, 18, 0.6); border-radius: 50%; box-shadow: 0 0 20px rgba(0, 180, 216, 0.15); margin-bottom: 12px; transition: 0.3s; }
      .avatar-box-wrapper:hover { transform: scale(1.03); border-color: var(--neon-yellow); box-shadow: 0 0 25px rgba(255, 183, 3, 0.3); }
      .prof-square-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      /* ছবির নিচের মেম্বার আইডি/রেজিস্ট্রেশন ব্যাজ */
      .prof-reg-badge { background: rgba(0, 180, 216, 0.1); color: var(--neon-blue); border: 1px solid rgba(0, 180, 216, 0.4); padding: 6px 20px; border-radius: 30px; font-family: 'Orbitron'; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; box-shadow: 0 0 15px rgba(0, 180, 216, 0.2); margin-top: 5px; margin-bottom: 15px; text-shadow: 0 0 5px var(--neon-blue); }
      
      .prof-eng-name { font-size: 26px; font-weight: 800; color: #fff; text-shadow: 0 0 12px rgba(255,255,255,0.2); margin-bottom: 4px; }
      .prof-bg-name { font-size: 18px; color: var(--neon-yellow); font-weight: 600; margin-bottom: 20px; font-family: 'Hind Siliguri', sans-serif; }
      
      .membership-timeline-node { display: flex; gap: 15px; margin-top: 5px; flex-wrap: wrap; justify-content: center; }
      .timeline-tag { font-size: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 6px 16px; border-radius: 20px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
      .timeline-tag strong { font-family: 'Orbitron', 'Hind Siliguri'; color: #fff; }
      .text-yellow i { color: var(--neon-yellow); }
      .text-yellow strong { color: var(--neon-yellow) !important; text-shadow: 0 0 5px rgba(255, 183, 3, 0.4); }
      
      /* সেকশন হেডার স্টাইল */
      .section-block-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--neon-blue); margin: 25px 0 15px 0; display: flex; align-items: center; gap: 10px; font-weight: 700; }
      .section-block-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0, 180, 216, 0.3), transparent); }
      
      /* গ্রিড ও বক্স লেআউট */
      .profile-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .info-metric-box { background: rgba(3, 7, 18, 0.4); border: 1px solid rgba(255,255,255,0.04); padding: 14px 18px; border-radius: 8px; transition: all 0.25s ease; }
      .info-metric-box:hover { border-color: rgba(0, 180, 216, 0.3); background: rgba(0, 180, 216, 0.02); transform: translateY(-1px); }
      .info-metric-box small { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
      .info-metric-box small i { color: var(--neon-blue); font-size: 11px; width: 14px; text-align: center; }
      .info-metric-box p { font-size: 14px; font-weight: 600; color: #e5e7eb; word-break: break-all; }
      .info-metric-box p a { color: var(--neon-yellow); text-decoration: none; }
      .info-metric-box p a:hover { text-decoration: underline; }
      
      .span-2 { grid-column: span 2; }
      .span-4 { grid-column: span 4; }
      .status-badge { color: var(--neon-green) !important; text-shadow: 0 0 8px rgba(46, 196, 182, 0.3); text-transform: uppercase; }

      @media (max-width: 992px) {
        .profile-details-grid { grid-template-columns: repeat(2, 1fr); }
        .span-2, .span-4 { grid-column: span 2; }
      }
      @media (max-width: 576px) {
        .profile-details-grid { grid-template-columns: 1fr; }
        .span-2, .span-4 { grid-column: span 1; }
        .profile-matrix-card { padding: 25px 15px; }
      }
    </style>

    <section class="module-viewport">
      <div class="profile-matrix-card">
        
        <!-- লোগো হেডার -->
        <div class="profile-org-header">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" alt="ROS Logo" class="org-logo-img">
          <div class="cyber-yellow-line"></div>
        </div>

        <!-- মেম্বার আইডি ও মেইন অবতার সেকশন -->
        <div class="profile-identity-hub">
          <div class="avatar-box-wrapper">
            <img src="../placeholder.png" id="profCardAvatar" class="prof-square-avatar">
          </div>
          
          <!-- ছবির নিচে মেম্বার আইডি (memberId) -->
          <div class="prof-reg-badge" id="profCardMemberId">ROS-LOADING</div>
          
          <h2 class="prof-eng-name" id="profCardEngName">সদস্যের নাম</h2>
          <h4 class="prof-bg-name" id="profCardBngName">বাংলা নাম</h4>
          
          <div class="membership-timeline-node">
            <span class="timeline-tag"><i class="fas fa-calendar-alt" style="color:var(--neon-blue);"></i> অন্তর্ভুক্তি: <strong id="profCardJoinDate">--/--/----</strong></span>
            <span class="timeline-tag text-yellow"><i class="fas fa-bolt"></i> সদস্যকাল: <strong id="profCardTotalDays">0</strong> দিন</span>
          </div>
        </div>

        <!-- ১. ব্যক্তিগত তথ্য সেকশন (Personal Matrix) -->
        <div class="section-block-title"><i class="fas fa-user"></i> ব্যক্তিগত বিবরণ (Personal Matrix)</div>
        <div class="profile-details-grid">
          <div class="info-metric-box span-2">
            <small><i class="fas fa-user-tie"></i> পিতার নাম (Father's Name)</small>
            <p id="profGridFather">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-female"></i> মাতার নাম (Mother's Name)</small>
            <p id="profGridMother">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-birthday-cake"></i> জন্ম তারিখ (DOB)</small>
            <p id="profGridDob">--/--/----</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-venus-mars"></i> লিঙ্গ (Gender)</small>
            <p id="profGridGender">--</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-id-card"></i> NID / জন্ম নিবন্ধন নম্বর</small>
            <p id="profGridNidBrn">-</p>
          </div>
        </div>

        <!-- ২. শিক্ষা ও পেশা সেকশন (Academic & Profession) -->
        <div class="section-block-title"><i class="fas fa-graduation-cap"></i> শিক্ষা ও পেশা (Academic & Career)</div>
        <div class="profile-details-grid">
          <div class="info-metric-box span-2">
            <small><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান (Institution)</small>
            <p id="profGridInstitution">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-book"></i> শ্রেণী/যোগ্যতা (Education)</small>
            <p id="profGridEducation">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-calendar-check"></i> শিক্ষাবর্ষ (Academic Year)</small>
            <p id="profGridAcademicYear">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-briefcase"></i> পেশা (Profession)</small>
            <p id="profGridProfession">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-user-shield"></i> মেম্বারশিপ রোল (Role)</small>
            <p id="profGridRole" style="color: var(--neon-blue); text-transform: uppercase;">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-toggle-on"></i> অ্যাকাউন্ট স্ট্যাটাস</small>
            <p id="profGridStatus" class="status-badge">Active</p>
          </div>
        </div>

        <!-- ৩. যোগাযোগ ও ঠিকানা সেকশন (Contact & Network) -->
        <div class="section-block-title"><i class="fas fa-address-book"></i> যোগাযোগ মাধ্যম (Contact & Network)</div>
        <div class="profile-details-grid">
          <div class="info-metric-box">
            <small><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</small>
            <p id="profGridMobile">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</small>
            <p id="profGridWhatsapp">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-envelope"></i> ইমেইল এড্রেস</small>
            <p id="profGridEmail">-</p>
          </div>
          <div class="info-metric-box span-4">
            <small><i class="fab fa-facebook"></i> ফেসবুক প্রোফাইল লিংক</small>
            <p id="profGridFacebook">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা (Present Address)</small>
            <p id="profGridPresentAddress">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-home"></i> স্থায়ী ঠিকানা (Permanent Address)</small>
            <p id="profGridPermanentAddress">লোড হচ্ছে...</p>
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
        const d = snapshot.data(); // d = memberData object

        // ক) প্রোফাইল হেডার ডাটা বাইন্ডিং 
        document.getElementById('profCardAvatar').src = d.photoUrl || '../placeholder.png';
        document.getElementById('profCardMemberId').innerText = d.memberId || "ROS-NEXUS";
        document.getElementById('profCardEngName').innerText = d.englishName || "সদস্য নাম";
        document.getElementById('profCardBngName').innerText = d.banglaName || "";

        // খ) গ্রিড ডিটেইলস ডাটা বাইন্ডিং (আপনার দেওয়া ২২টি ফিল্ডের ম্যাপিং)
        document.getElementById('profGridFather').innerText = d.fatherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridMother').innerText = d.motherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridDob').innerText = d.dob || "তথ্য নেই";
        document.getElementById('profGridGender').innerText = d.gender || "নির্দিষ্ট নয়";
        document.getElementById('profGridNidBrn').innerText = d.nidOrBrn || "প্রদান করা হয়নি";
        
        document.getElementById('profGridInstitution').innerText = d.institution || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridEducation').innerText = d.education || "N/A";
        document.getElementById('profGridAcademicYear').innerText = d.academicYear || "N/A";
        document.getElementById('profGridProfession').innerText = d.profession || "N/A";
        document.getElementById('profGridRole').innerText = d.role || "member";
        document.getElementById('profGridStatus').innerText = d.status || "active";

        document.getElementById('profGridMobile').innerText = d.mobileNumber || "তথ্য নেই";
        document.getElementById('profGridWhatsapp').innerText = d.whatsappNumber || "তথ্য নেই";
        document.getElementById('profGridEmail').innerText = d.email || "তথ্য নেই";
        
        // ফেসবুক লিংকটিকে ক্লিকযোগ্য (Clickable Link) বানানোর লজিক
        if (d.facebookLink && d.facebookLink.trim() !== "") {
          document.getElementById('profGridFacebook').innerHTML = `<a href="${d.facebookLink}" target="_blank"><i class="fas fa-external-link-alt"></i> প্রোফাইল ভিজিট করুন</a>`;
        } else {
          document.getElementById('profGridFacebook').innerText = "লিংক যুক্ত করা হয়নি";
        }

        document.getElementById('profGridPresentAddress').innerText = d.presentAddress || "ঠিকানা খালি";
        document.getElementById('profGridPermanentAddress').innerText = d.permanentAddress || "ঠিকানা খালি";

        // গ) মেম্বারশিপ সময়কাল এবং দিন গণনা (createdAt থেকে)
        if (d.createdAt) {
          const joinDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
          
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
