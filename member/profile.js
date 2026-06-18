// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. প্রোফাইল মডিউলের এইচটিএমএল এবং আল্ট্রা-রেসপনসিভ ড্যাশবোর্ড CSS রেন্ডার
  contentRoot.innerHTML = `
    <style>
      .profile-matrix-card { 
        max-width: 1000px; width: 100%; margin: 0 auto; padding: 40px; border-radius: 16px; 
        position: relative; overflow: hidden; background: var(--card-bg); 
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); 
        border: 1px solid rgba(0, 245, 255, 0.1); 
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4); box-sizing: border-box; 
      }
      
      .profile-matrix-card::before { 
        content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; 
        background: linear-gradient(90deg, transparent, var(--secondary), var(--accent), transparent); 
      }
      
      .profile-org-header { text-align: center; margin-bottom: 40px; }
      .org-logo-img { max-width: 240px; width: 100%; height: auto; filter: drop-shadow(0 4px 12px rgba(0, 245, 255, 0.15)); }
      .cyber-yellow-line { height: 1px; width: 30%; background: linear-gradient(90deg, transparent, var(--secondary), transparent); margin: 16px auto 0 auto; }
      
      .profile-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 35px; }
      
      /* মেম্বার ডায়নামিক নিয়ন হ্যালো রিংস */
      .avatar-box-wrapper { 
        width: 140px; height: 140px; border: 2px solid rgba(0, 245, 255, 0.3); padding: 6px; 
        background: var(--dark-bg); border-radius: 50%; box-shadow: 0 0 30px rgba(0, 245, 255, 0.1); 
        margin-bottom: 16px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      }
      .avatar-box-wrapper:hover { transform: scale(1.05) rotate(5deg); border-color: var(--accent); box-shadow: 0 0 35px rgba(255, 183, 3, 0.25); }
      .prof-square-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      .prof-reg-badge { 
        background: rgba(0, 245, 255, 0.05); color: var(--secondary); border: 1px solid rgba(0, 245, 255, 0.25); 
        padding: 5px 22px; border-radius: 30px; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 16px; 
        box-shadow: inset 0 0 10px rgba(0, 245, 255, 0.05);
      }
      
      .prof-eng-name { font-size: 28px; font-weight: 700; color: var(--text-light); margin-bottom: 6px; letter-spacing: 0.5px; }
      .prof-bg-name { font-size: 17px; color: var(--accent); font-weight: 500; margin-bottom: 25px; }
      
      .membership-timeline-node { display: flex; gap: 12px; margin-top: 5px; flex-wrap: wrap; justify-content: center; }
      .timeline-tag { font-size: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 6px 18px; border-radius: 30px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
      .timeline-tag strong { color: var(--text-light); font-weight: 600; }
      .text-yellow i { color: var(--accent); }
      .text-yellow strong { color: var(--accent) !important; }
      
      /* মডার্ন থিম ক্যাটাগরি হেডার */
      .section-block-title { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: var(--secondary); margin: 40px 0 20px 0; display: flex; align-items: center; gap: 12px; font-weight: 700; opacity: 0.9; }
      .section-block-title i { background: rgba(0, 245, 255, 0.06); width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid rgba(0, 245, 255, 0.1); }
      .section-block-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0, 245, 255, 0.15), transparent); }
      
      /* সাইবার ডাটা সেল স্ট্রাকচার */
      .profile-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
      .info-metric-box { background: rgba(4, 15, 32, 0.35); border: 1px solid rgba(0, 245, 255, 0.05); padding: 16px 20px; border-radius: 8px; transition: all 0.3s ease; box-sizing: border-box; }
      .info-metric-box:hover { border-color: rgba(0, 245, 255, 0.2); background: rgba(0, 245, 255, 0.01); transform: translateY(-2px); }
      .info-metric-box small { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 8px; font-weight: 500; letter-spacing: 0.5px; }
      .info-metric-box small i { color: var(--secondary); font-size: 12px; opacity: 0.8; }
      .info-metric-box p { font-size: 14px; font-weight: 600; color: rgba(248, 250, 252, 0.9); word-break: break-all; }
      .info-metric-box p a { color: var(--secondary); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
      .info-metric-box p a:hover { color: var(--accent); }
      
      .span-2 { grid-column: span 2; }
      .span-4 { grid-column: span 4; }
      .status-badge { color: var(--neon-green) !important; letter-spacing: 1px; font-weight: 700; }

      @media (max-width: 992px) {
        .profile-details-grid { grid-template-columns: repeat(2, 1fr); }
        .span-2, .span-4 { grid-column: span 2; }
      }
      @media (max-width: 768px) {
        .profile-matrix-card { padding: 30px 20px; }
      }
      @media (max-width: 480px) {
        .profile-matrix-card { padding: 25px 16px; margin: 0; width: 100% !important; }
        .profile-details-grid { grid-template-columns: 1fr; gap: 12px; }
        .span-2, .span-4 { grid-column: span 1; }
        .prof-eng-name { font-size: 24px; }
        .prof-bg-name { font-size: 15px; }
        .membership-timeline-node { flex-direction: column; gap: 8px; }
      }
    </style>

    <section class="module-viewport" style="padding: 5px; box-sizing: border-box;">
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
          
          <div class="prof-reg-badge" id="profCardMemberId">ROS-LOADING</div>
          
          <h2 class="prof-eng-name" id="profCardEngName">সদস্যের নাম</h2>
          <h4 class="prof-bg-name" id="profCardBngName">বাংলা নাম</h4>
          
          <div class="membership-timeline-node">
            <span class="timeline-tag"><i class="fas fa-calendar-alt"></i> অন্তর্ভুক্তি: <strong id="profCardJoinDate">--/--/----</strong></span>
            <span class="timeline-tag text-yellow"><i class="fas fa-bolt"></i> সদস্যকাল: <strong id="profCardTotalDays">0</strong> দিন</span>
          </div>
        </div>

        <!-- ১. ব্যক্তিগত তথ্য সেকশন -->
        <div class="section-block-title"><i class="fas fa-id-card-alt"></i> ব্যক্তিগত বিবরণ (Personal Matrix)</div>
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
            <small><i class="fas fa-fingerprint"></i> NID / জন্ম নিবন্ধন নম্বর</small>
            <p id="profGridNidBrn">-</p>
          </div>
        </div>

        <!-- ২. শিক্ষা ও পেশা সেকশন -->
        <div class="section-block-title"><i class="fas fa-user-graduate"></i> শিক্ষা ও পেশা (Academic & Career)</div>
        <div class="profile-details-grid">
          <div class="info-metric-box span-2">
            <small><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান (Institution)</small>
            <p id="profGridInstitution">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-graduation-cap"></i> শ্রেণী/যোগ্যতা (Education)</small>
            <p id="profGridEducation">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-hourglass-half"></i> শিক্ষাবর্ষ (Academic Year)</small>
            <p id="profGridAcademicYear">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-user-md"></i> পেশা (Profession)</small>
            <p id="profGridProfession">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-shield-alt"></i> মেম্বারশিপ রোল (Role)</small>
            <p id="profGridRole" style="color: var(--secondary); text-transform: uppercase;">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fas fa-circle-notch"></i> অ্যাকাউন্ট স্ট্যাটাস</small>
            <p id="profGridStatus" class="status-badge">active</p>
          </div>
        </div>

        <!-- ৩. যোগাযোগ ও ঠিকানা সেকশন -->
        <div class="section-block-title"><i class="fas fa-network-wired"></i> যোগাযোগ মাধ্যম (Contact & Network)</div>
        <div class="profile-details-grid">
          <div class="info-metric-box">
            <small><i class="fas fa-mobile-alt"></i> মোবাইল নম্বর</small>
            <p id="profGridMobile">-</p>
          </div>
          <div class="info-metric-box">
            <small><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</small>
            <p id="profGridWhatsapp">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-at"></i> ইমেইল এড্রেস</small>
            <p id="profGridEmail">-</p>
          </div>
          <div class="info-metric-box span-4">
            <small><i class="fab fa-facebook-f"></i> ফেসবুক প্রোফাইল লিংক</small>
            <p id="profGridFacebook">-</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-map-marked-alt"></i> বর্তমান ঠিকানা (Present Address)</small>
            <p id="profGridPresentAddress">লোড হচ্ছে...</p>
          </div>
          <div class="info-metric-box span-2">
            <small><i class="fas fa-map-signs"></i> স্থায়ী ঠিকানা (Permanent Address)</small>
            <p id="profGridPermanentAddress">লোড হচ্ছে...</p>
          </div>
        </div>

      </div>
    </section>
  `;

  // ২. ফায়ারবেস রিয়েল-টাইম ডাটা রিডিং ও বাইন্ডিং লুপ[span_0](start_span)[span_0](end_span)
  const currentUser = auth.currentUser;[span_1](start_span)[span_1](end_span)
  if (currentUser) {[span_2](start_span)[span_2](end_span)
    onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {[span_3](start_span)[span_3](end_span)
      if (snapshot.exists()) {[span_4](start_span)[span_4](end_span)
        const d = snapshot.data();[span_5](start_span)[span_5](end_span)

        document.getElementById('profCardAvatar').src = d.photoUrl || '../placeholder.png';[span_6](start_span)[span_6](end_span)
        document.getElementById('profCardMemberId').innerText = d.memberId || "ROS-NEXUS";[span_7](start_span)[span_7](end_span)
        document.getElementById('profCardEngName').innerText = d.englishName || "সদস্য নাম";[span_8](start_span)[span_8](end_span)
        document.getElementById('profCardBngName').innerText = d.banglaName || "";[span_9](start_span)[span_9](end_span)

        document.getElementById('profGridFather').innerText = d.fatherName || "তথ্য পাওয়া যায়নি";[span_10](start_span)[span_10](end_span)
        document.getElementById('profGridMother').innerText = d.motherName || "তথ্য পাওয়া যায়নি";[span_11](start_span)[span_11](end_span)
        document.getElementById('profGridDob').innerText = d.dob || "তথ্য নেই";[span_12](start_span)[span_12](end_span)
        document.getElementById('profGridGender').innerText = d.gender || "নির্দিষ্ট নয়";[span_13](start_span)[span_13](end_span)
        document.getElementById('profGridNidBrn').innerText = d.nidOrBrn || "প্রদান করা হয়নি";[span_14](start_span)[span_14](end_span)
        
        document.getElementById('profGridInstitution').innerText = d.institution || "তথ্য পাওয়া যায়নি";[span_15](start_span)[span_15](end_span)
        document.getElementById('profGridEducation').innerText = d.education || "N/A";[span_16](start_span)[span_16](end_span)
        document.getElementById('profGridAcademicYear').innerText = d.academicYear || "N/A";[span_17](start_span)[span_17](end_span)
        document.getElementById('profGridProfession').innerText = d.profession || "N/A";[span_18](start_span)[span_18](end_span)
        document.getElementById('profGridRole').innerText = d.role || "member";[span_19](start_span)[span_19](end_span)
        document.getElementById('profGridStatus').innerText = d.status || "active";[span_20](start_span)[span_20](end_span)

        document.getElementById('profGridMobile').innerText = d.mobileNumber || "তথ্য নেই";[span_21](start_span)[span_21](end_span)
        document.getElementById('profGridWhatsapp').innerText = d.whatsappNumber || "তথ্য নেই";[span_22](start_span)[span_22](end_span)
        document.getElementById('profGridEmail').innerText = d.email || "তথ্য নেই";[span_23](start_span)[span_23](end_span)
        
        if (d.facebookLink && d.facebookLink.trim() !== "") {[span_24](start_span)[span_24](end_span)
          document.getElementById('profGridFacebook').innerHTML = `<a href="${d.facebookLink}" target="_blank"><i class="fas fa-external-link-alt"></i> প্রোফাইল ভিজিট করুন</a>`;[span_25](start_span)[span_25](end_span)
        } else {
          document.getElementById('profGridFacebook').innerText = "লিнк যুক্ত করা হয়নি";[span_26](start_span)[span_26](end_span)
        }

        document.getElementById('profGridPresentAddress').innerText = d.presentAddress || "ঠিকানা খালি";[span_27](start_span)[span_27](end_span)
        document.getElementById('profGridPermanentAddress').innerText = d.permanentAddress || "ঠিকানা খালি";[span_28](start_span)[span_28](end_span)

        if (d.createdAt) {[span_29](start_span)[span_29](end_span)
          const joinDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);[span_30](start_span)[span_30](end_span)
          
          const day = String(joinDate.getDate()).padStart(2, '0');[span_31](start_span)[span_31](end_span)
          const month = String(joinDate.getMonth() + 1).padStart(2, '0');[span_32](start_span)[span_32](end_span)
          const year = joinDate.getFullYear();[span_33](start_span)[span_33](end_span)
          document.getElementById('profCardJoinDate').innerText = `${day}/${month}/${year}`;[span_34](start_span)[span_34](end_span)

          const today = new Date();[span_35](start_span)[span_35](end_span)
          const timeDiff = Math.abs(today.getTime() - joinDate.getTime());[span_36](start_span)[span_36](end_span)
          const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));[span_37](start_span)[span_37](end_span)
          
          document.getElementById('profCardTotalDays').innerText = totalDays;[span_38](start_span)[span_38](end_span)
        }
      } else {
        alert("আপনার সদস্য প্রোফাইল ডাটাবেজে খুঁজে পাওয়া যায়নি!");[span_39](start_span)[span_39](end_span)
        signOut(auth);[span_40](start_span)[span_40](end_span)
      }
    });
  } else {
    window.location.href = "../login.html";[span_41](start_span)[span_41](end_span)
  }
}
