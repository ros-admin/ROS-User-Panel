// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. আল্ট্রা-ইউনিক হ্যালোগ্রাফিক ড্যাশবোর্ড ইন্টারফেস ও সিএসএস রেন্ডার
  contentRoot.innerHTML = `
    <style>
      /* কোর হ্যালোগ্রাফিক কন্টেইনার */
      .cyber-hologram-container { 
        max-width: 1050px; width: 100%; margin: 0 auto; padding: 45px 35px; border-radius: 24px; 
        position: relative; overflow: hidden; background: rgba(5, 15, 32, 0.65); 
        backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); 
        border: 1px solid rgba(0, 245, 255, 0.15); 
        box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 245, 255, 0.02); 
        box-sizing: border-box; 
      }
      
      /* টপ ফিউচারিস্টিক এনার্জি বার */
      .cyber-hologram-container::before { 
        content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; 
        background: linear-gradient(90deg, var(--secondary), var(--accent), var(--secondary)); 
        box-shadow: 0 20px 30px var(--secondary);
      }
      
      .brand-display-center { text-align: center; margin-bottom: 45px; position: relative; }
      .brand-display-center img { max-width: 250px; width: 100%; height: auto; filter: drop-shadow(0 0 15px rgba(0, 245, 255, 0.25)); }
      .laser-separator { height: 1px; width: 180px; background: linear-gradient(90deg, transparent, var(--accent), transparent); margin: 18px auto 0 auto; }
      
      /* প্রোফাইল নোড এবং নিয়ন রিং */
      .holo-profile-identity { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 40px; }
      .core-avatar-ring { 
        width: 150px; height: 150px; border: 2px dashed rgba(0, 245, 255, 0.4); padding: 8px; 
        background: rgba(3, 10, 22, 0.8); border-radius: 50%; box-shadow: 0 0 40px rgba(0, 245, 255, 0.15); 
        margin-bottom: 20px; transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); position: relative;
      }
      .core-avatar-ring:hover { transform: scale(1.06); border: 2px solid var(--accent); box-shadow: 0 0 50px rgba(255, 183, 3, 0.3); }
      .core-avatar-ring img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      .holo-id-badge { 
        background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(0, 245, 255, 0.02)); 
        color: var(--secondary); border: 1px solid rgba(0, 245, 255, 0.3); 
        padding: 6px 26px; border-radius: 50px; font-size: 14px; font-weight: 700; letter-spacing: 2.5px; margin-bottom: 18px; 
        text-shadow: 0 0 10px rgba(0, 245, 255, 0.5); box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      
      .holo-main-name { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 6px; letter-spacing: 0.5px; }
      .holo-sub-name { font-size: 18px; color: var(--accent); font-weight: 600; margin-bottom: 25px; }
      
      .holo-timeline-cluster { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
      .holo-tag { font-size: 12px; background: rgba(6, 20, 43, 0.6); border: 1px solid rgba(0, 245, 255, 0.1); padding: 8px 20px; border-radius: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; }
      .holo-tag strong { color: #fff; font-weight: 600; }
      .gold-glow i { color: var(--accent); filter: drop-shadow(0 0 5px var(--accent)); }
      .gold-glow strong { color: var(--accent) !important; }
      
      /* হ্যালোগ্রাফিক সেকশন টাইটেল */
      .holo-section-header { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: var(--secondary); margin: 45px 0 22px 0; display: flex; align-items: center; gap: 15px; font-weight: 700; }
      .holo-section-header i { color: var(--accent); font-size: 14px; }
      .holo-section-header::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0, 245, 255, 0.2), transparent); }
      
      /* ইনফো স্ট্রিপস গ্রিড লেআউট (অন্যরকম ডিজাইন) */
      .holo-data-matrix { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      .holo-data-cell { 
        background: rgba(4, 15, 32, 0.45); border: 1px solid rgba(255, 255, 255, 0.03); 
        padding: 16px 22px; border-radius: 12px; position: relative; transition: all 0.3s ease; box-sizing: border-box; 
      }
      /* বাম পাশের ইউনিক লাইভ সিগন্যাল ডট */
      .holo-data-cell::before {
        content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 3px; height: 40%; background: transparent; border-radius: 0 4px 4px 0; transition: 0.3s;
      }
      .holo-data-cell:hover::before { background: var(--secondary); box-shadow: 0 0 10px var(--secondary); }
      .holo-data-cell:hover { border-color: rgba(0, 245, 255, 0.15); background: rgba(6, 20, 43, 0.7); transform: translateX(3px); }
      
      .holo-data-cell small { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .holo-data-cell small i { color: var(--secondary); font-size: 11px; opacity: 0.7; }
      .holo-data-cell p { font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.9); word-break: break-all; }
      .holo-data-cell p a { color: var(--secondary); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; }
      .holo-data-cell p a:hover { color: var(--accent); text-shadow: 0 0 8px rgba(255, 183, 3, 0.4); }
      
      .cell-span-2 { grid-column: span 2; }
      .cell-span-4 { grid-column: span 4; }
      .holo-active-status { color: var(--neon-green) !important; font-weight: 700; text-transform: uppercase; text-shadow: 0 0 10px rgba(0, 245, 212, 0.3); }

      /* রেসপনসিভ মিডিয়া কোয়েরি */
      @media (max-width: 992px) {
        .holo-data-matrix { grid-template-columns: repeat(2, 1fr); }
        .cell-span-2, .cell-span-4 { grid-column: span 2; }
      }
      @media (max-width: 768px) {
        .cyber-hologram-container { padding: 35px 20px; }
      }
      @media (max-width: 480px) {
        .cyber-hologram-container { padding: 25px 15px; border-radius: 16px; }
        .holo-data-matrix { grid-template-columns: 1fr; gap: 14px; }
        .cell-span-2, .cell-span-4 { grid-column: span 1; }
        .holo-main-name { font-size: 26px; }
        .holo-sub-name { font-size: 16px; }
        .holo-timeline-cluster { flex-direction: column; gap: 10px; }
      }
    </style>

    <section class="module-viewport" style="padding: 5px; box-sizing: border-box;">
      <div class="cyber-hologram-container">
        
        <!-- লোগো ব্র্যান্ডিং এরিয়া -->
        <div class="brand-display-center">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" alt="ROS Logo">
          <div class="laser-separator"></div>
        </div>

        <!-- মেম্বার ইনফো প্রোফাইল নোড -->
        <div class="holo-profile-identity">
          <div class="core-avatar-ring">
            <img src="../placeholder.png" id="profCardAvatar">
          </div>
          
          <div class="holo-id-badge" id="profCardMemberId">ROS-CONNECTING</div>
          
          <h2 class="holo-main-name" id="profCardEngName">সদস্যের নাম</h2>
          <h4 class="holo-sub-name" id="profCardBngName">বাংলা নাম</h4>
          
          <div class="holo-timeline-cluster">
            <span class="holo-tag"><i class="fas fa-fingerprint" style="color:var(--secondary);"></i> নোড অ্যাক্টিভেশন: <strong id="profCardJoinDate">--/--/----</strong></span>
            <span class="holo-tag gold-glow"><i class="fas fa-satellite-dish"></i> সিস্টেম এজ: <strong id="profCardTotalDays">0</strong> সাইকেল</span>
          </div>
        </div>

        <!-- ম্যাট্রিক্স পার্ট ১: ব্যক্তিগত বিবরণ -->
        <div class="holo-section-header"><i class="fas fa-database"></i> Personal Matrix (ব্যক্তিগত বিবরণ)</div>
        <div class="holo-data-matrix">
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-user-shield"></i> পিতার নাম (Father's Name)</small>
            <p id="profGridFather">লোড হচ্ছে...</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-user-astronaut"></i> মাতার নাম (Mother's Name)</small>
            <p id="profGridMother">লোড হচ্ছে...</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-calendar-alt"></i> জন্ম তারিখ (DOB)</small>
            <p id="profGridDob">--/--/----</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-venus-mars"></i> লিঙ্গ (Gender)</small>
            <p id="profGridGender">--</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-id-card"></i> NID / জন্ম নিবন্ধন নম্বর</small>
            <p id="profGridNidBrn">-</p>
          </div>
        </div>

        <!-- ম্যাট্রিক্স পার্ট ২: একাডেমিক ও রোল ডাটা -->
        <div class="holo-section-header"><i class="fas fa-graduation-cap"></i> Academic & Core Module (শিক্ষা ও পেশা)</div>
        <div class="holo-data-matrix">
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান (Institution)</small>
            <p id="profGridInstitution">লোড হচ্ছে...</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-book-open"></i> শ্রেণী/যোগ্যতা (Education)</small>
            <p id="profGridEducation">-</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-clock"></i> শিক্ষাবর্ষ (Academic Year)</small>
            <p id="profGridAcademicYear">-</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-briefcase"></i> পেশা (Profession)</small>
            <p id="profGridProfession">-</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-user-tag"></i> সিস্টেম রোল (Role)</small>
            <p id="profGridRole" style="color: var(--secondary); text-transform: uppercase;">-</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fas fa-shield-alt"></i> কনসোল স্ট্যাটাস</small>
            <p id="profGridStatus" class="holo-active-status">ACTIVE</p>
          </div>
        </div>

        <!-- ম্যাট্রিক্স পার্ট ৩: যোগাযোগ চ্যানেল -->
        <div class="holo-section-header"><i class="fas fa-network-wired"></i> Communication Channels (যোগাযোগ মাধ্যম)</div>
        <div class="holo-data-matrix">
          <div class="holo-data-cell">
            <small><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</small>
            <p id="profGridMobile">-</p>
          </div>
          <div class="holo-data-cell">
            <small><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</small>
            <p id="profGridWhatsapp">-</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-envelope"></i> রেজিস্টার্ড ইমেইল</small>
            <p id="profGridEmail">-</p>
          </div>
          <div class="holo-data-cell cell-span-4">
            <small><i class="fab fa-facebook"></i> ফেসবুক প্রোফাইল গেটওয়ে</small>
            <p id="profGridFacebook">-</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা (Present Address)</small>
            <p id="profGridPresentAddress">লোড হচ্ছে...</p>
          </div>
          <div class="holo-data-cell cell-span-2">
            <small><i class="fas fa-home"></i> স্থায়ী ঠিকানা (Permanent Address)</small>
            <p id="profGridPermanentAddress">লোড হচ্ছে...</p>
          </div>
        </div>

      </div>
    </section>
  `;

  // ২. ফায়ারবেস রিয়েল-টাইম অন-স্ম্যাপশট লুপ (আপনার দেওয়া হুবহু ফিল্ড নেম অনুযায়ী ম্যাপিং)
  const currentUser = auth.currentUser;
  if (currentUser) {
    onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();

        // ক) প্রোফাইল মেইন ব্যানার ম্যাপিং 
        document.getElementById('profCardAvatar').src = d.photoUrl || '../placeholder.png';
        document.getElementById('profCardMemberId').innerText = d.memberId || "ROS-NEXUS";
        document.getElementById('profCardEngName').innerText = d.englishName || "সদস্য নাম";
        document.getElementById('profCardBngName').innerText = d.banglaName || "";

        // খ) ব্যক্তিগত তথ্য সেকশন ম্যাপিং
        document.getElementById('profGridFather').innerText = d.fatherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridMother').innerText = d.motherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridDob').innerText = d.dob || "তথ্য নেই";
        document.getElementById('profGridGender').innerText = d.gender || "নির্দিষ্ট নয়";
        document.getElementById('profGridNidBrn').innerText = d.nidOrBrn || "প্রদান করা হয়নি";
        
        // গ) শিক্ষা ও পেশা ম্যাপিং (Academic Year ফিক্সড)
        document.getElementById('profGridInstitution').innerText = d.institution || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridEducation').innerText = d.education || "N/A";
        document.getElementById('profGridAcademicYear').innerText = d['Academic Year'] || "N/A";
        document.getElementById('profGridProfession').innerText = d.profession || "N/A";
        document.getElementById('profGridRole').innerText = d.role || "member";
        document.getElementById('profGridStatus').innerText = d.status || "active";

        // ঘ) নেটওয়ার্ক ও যোগাযোগ ম্যাপিং (presentAddress এবং whatsapp Number স্পেস ফিক্সড)
        document.getElementById('profGridMobile').innerText = d.mobileNumber || "তথ্য নেই";
        document.getElementById('profGridWhatsapp').innerText = d['whatsapp Number'] || "তথ্য নেই";
        document.getElementById('profGridEmail').innerText = d.email || "তথ্য নেই";
        
        if (d.facebookLink && d.facebookLink.trim() !== "") {
          document.getElementById('profGridFacebook').innerHTML = `<a href="${d.facebookLink}" target="_blank"><i class="fas fa-external-link-alt"></i> প্রোফাইল নেটওয়ার্ক ওপেন করুন</a>`;
        } else {
          document.getElementById('profGridFacebook').innerText = "লিংক যুক্ত করা হয়নি";
        }

        document.getElementById('profGridPresentAddress').innerText = d.presentAddress || "ঠিকানা খালি";
        document.getElementById('profGridPermanentAddress').innerText = d.permanentAddress || "ঠিকানা খালি";

        // ঙ) ফায়ারবেস টাইমস্ট্যাম্প / অবজেক্ট থেকে ডেটা রেন্ডারিং ও মেম্বারশিপ লাইভ ট্র্যাকিং 
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
        alert("আপনার প্রোফাইল ম্যাট্রিক্স ডাটাবেজে খুঁজে পাওয়া যায়নি!");
        signOut(auth);
      }
    });
  } else {
    window.location.href = "../login.html";
  }
}
