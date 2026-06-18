// প্রোফাইল মডিউলের মূল ফাংশন
function loadProfileModule(contentRoot, db, auth, doc, onSnapshot, signOut) {
  
  // ১. ড্রপডাউন ড্যাশবোর্ড ইন্টারফেস ও স্টাইল রেন্ডার
  contentRoot.innerHTML = `
    <style>
      /* কোর ফ্রেমওয়ার্ক */
      .nexus-profile-wrapper { 
        max-width: 1000px; width: 100%; margin: 0 auto; padding: 30px 20px; 
        box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif;
      }
      
      /* আপগ্রেডেড লোগো সেকশন (গ্লাস গ্লো ব্যাকগ্রাউন্ড সহ বড় সাইজ) */
      .nexus-brand-header { 
        text-align: center; margin-bottom: 35px; padding: 25px;
        background: radial-gradient(circle, rgba(0, 245, 255, 0.08) 0%, transparent 70%);
      }
      .nexus-logo { 
        max-width: 340px; width: 100%; height: auto; 
        filter: drop-shadow(0 0 25px rgba(0, 245, 255, 0.35)) brightness(1.25); 
      }
      
      /* প্রোফাইল মেইন কার্ড */
      .nexus-hero-identity { 
        display: flex; flex-direction: column; align-items: center; text-align: center; 
        margin-bottom: 35px; background: rgba(5, 15, 32, 0.45); padding: 30px; 
        border-radius: 20px; border: 1px solid rgba(0, 245, 255, 0.1);
      }
      .nexus-avatar-frame { 
        width: 135px; height: 135px; border: 2px solid var(--secondary); padding: 5px; 
        background: #030a16; border-radius: 50%; box-shadow: 0 0 30px rgba(0, 245, 255, 0.25); 
        margin-bottom: 15px; 
      }
      .nexus-avatar-frame img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      .nexus-uid-badge { 
        background: rgba(0, 245, 255, 0.08); color: var(--secondary); 
        border: 1px solid rgba(0, 245, 255, 0.25); padding: 5px 20px; 
        border-radius: 30px; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 12px; 
      }
      .nexus-name-en { font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
      .nexus-name-bn { font-size: 16px; color: var(--accent); font-weight: 500; margin-bottom: 15px; }
      
      .nexus-stats-cluster { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
      .nexus-stat-tag { font-size: 12px; background: rgba(6, 20, 43, 0.8); border: 1px solid rgba(0, 245, 255, 0.1); padding: 6px 16px; border-radius: 8px; color: var(--text-muted); }
      .nexus-stat-tag strong { color: #fff; }
      .nexus-stat-tag.highlight i { color: var(--accent); }
      .nexus-stat-tag.highlight strong { color: var(--accent); }
      
      /* নীল কালারের থিমড মেইন বক্স (অ্যাডভান্সড ড্রপডাউন) */
      .nexus-dropdown-box { 
        background: rgba(4, 15, 32, 0.55); border: 1px solid rgba(0, 245, 255, 0.25); 
        border-radius: 14px; margin-bottom: 22px; overflow: hidden;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4); transition: border-color 0.3s;
      }
      .nexus-dropdown-box.active { border-color: var(--secondary); box-shadow: 0 0 20px rgba(0, 245, 255, 0.15); }
      
      .nexus-dropdown-trigger { 
        padding: 20px 25px; background: rgba(6, 20, 43, 0.85); 
        display: flex; justify-content: space-between; align-items: center; 
        cursor: pointer; user-select: none; transition: background 0.3s;
      }
      .nexus-dropdown-trigger:hover { background: rgba(0, 245, 255, 0.04); }
      .nexus-trigger-title { font-size: 15px; font-weight: 700; color: var(--secondary); text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 12px; }
      .nexus-trigger-title i { color: var(--accent); }
      .nexus-trigger-arrow { color: var(--text-muted); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 18px; }
      .nexus-dropdown-box.active .nexus-trigger-arrow { transform: rotate(180deg); color: var(--secondary); }
      
      /* ড্রপডাউন ওপেন মেকানিজম */
      .nexus-dropdown-content { 
        max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
        background: rgba(3, 10, 22, 0.4);
      }
      .nexus-dropdown-box.active .nexus-dropdown-content { max-height: 1200px; }
      .nexus-inner-padding { padding: 25px; display: flex; flex-direction: column; gap: 18px; }
      
      /* ডেস্কটপ গ্রিড ও ইন্ডিভিজুয়াল ফিল্ড বক্স */
      .nexus-row { display: flex; gap: 18px; width: 100%; box-sizing: border-box; }
      .nexus-field-cell { 
        flex: 1; background: rgba(5, 17, 37, 0.75); border: 1px solid rgba(255, 255, 255, 0.04); 
        padding: 15px 20px; border-radius: 10px; transition: all 0.3s ease; box-sizing: border-box;
      }
      
      /* ফিল্ডে ক্লিক/হোভার করলে আলাদাভাবে থিমড গ্লো মেকানিজম */
      .nexus-field-cell:hover, .nexus-field-cell:focus-within { 
        border-color: var(--secondary); 
        background: rgba(0, 245, 255, 0.03);
        box-shadow: 0 0 18px rgba(0, 245, 255, 0.18), inset 0 0 8px rgba(0, 245, 255, 0.08);
        transform: translateY(-2px);
      }
      
      .nexus-field-cell small { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }
      .nexus-field-cell small i { color: var(--secondary); opacity: 0.8; }
      .nexus-field-cell p { font-size: 14.5px; font-weight: 600; color: rgba(255, 255, 255, 0.95); margin: 0; word-break: break-all; }
      .nexus-field-cell p a { color: var(--secondary); text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
      .nexus-field-cell p a:hover { color: var(--accent); text-shadow: 0 0 8px rgba(255,183,3,0.3); }
      
      .status-active-glow { color: var(--neon-green) !important; font-weight: 700; text-shadow: 0 0 10px rgba(0, 245, 212, 0.2); }

      /* মোবাইল রেস্পন্সিভ রুলস (প্রতি লাইনে একটি ফিল্ড) */
      @media (max-width: 768px) {
        .nexus-row { flex-direction: column; gap: 14px; }
        .nexus-inner-padding { padding: 16px; gap: 14px; }
        .nexus-dropdown-trigger { padding: 16px 20px; }
        .nexus-brand-header { margin-bottom: 20px; }
      }
    </style>

    <div class="nexus-profile-wrapper">
      
      <!-- টপ লোগো গেটওয়ে -->
      <div class="nexus-brand-header">
        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/Assets/Logo/ROS%20Logo%20Title%20.png" alt="ROS Logo" class="nexus-logo">
      </div>

      <!-- কোর মেম্বার আইডি ও ইনফো প্যানেল -->
      <div class="nexus-hero-identity">
        <div class="nexus-avatar-frame">
          <img src="../placeholder.png" id="profCardAvatar">
        </div>
        <div class="nexus-uid-badge" id="profCardMemberId">ROS-CONNECTING</div>
        <h2 class="nexus-name-en" id="profCardEngName">সদস্যের নাম</h2>
        <h4 class="nexus-name-bn" id="profCardBngName">বাংলা নাম</h4>
        
        <div class="nexus-stats-cluster">
          <span class="nexus-stat-tag"><i class="fas fa-fingerprint"></i> নোড অ্যাক্টিভেশন: <strong id="profCardJoinDate">--/--/----</strong></span>
          <span class="nexus-stat-tag highlight"><i class="fas fa-satellite-dish"></i> সিস্টেম এজ: <strong id="profCardTotalDays">0</strong> সাইকেল</span>
        </div>
      </div>

      <!-- ড্রপডাউন ১: ব্যক্তিগত বিবরণ -->
      <div class="nexus-dropdown-box" id="dropBoxPersonal">
        <div class="nexus-dropdown-trigger" onclick="toggleNexusDropdown('dropBoxPersonal')">
          <div class="nexus-trigger-title"><i class="fas fa-user-astronaut"></i> Personal Matrix (ব্যক্তিগত বিবরণ)</div>
          <div class="nexus-trigger-arrow"><i class="fas fa-chevron-down"></i></div>
        </div>
        <div class="nexus-dropdown-content">
          <div class="nexus-inner-padding">
            <!-- মা বাবার নাম এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-user-shield"></i> পিতার নাম (Father's Name)</small>
                <p id="profGridFather">লোড হচ্ছে...</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-user-tie"></i> মাতার নাম (Mother's Name)</small>
                <p id="profGridMother">লোড হচ্ছে...</p>
              </div>
            </div>
            <!-- জন্ম তারিখ, লিঙ্গ, এনআইডি এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-calendar-alt"></i> জন্ম তারিখ (DOB)</small>
                <p id="profGridDob">--/--/----</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-venus-mars"></i> লিঙ্গ (Gender)</small>
                <p id="profGridGender">--</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-id-card"></i> NID / জন্ম নিবন্ধন নম্বর</small>
                <p id="profGridNidBrn">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ড্রপডাউন ২: শিক্ষা ও পেশা -->
      <div class="nexus-dropdown-box" id="dropBoxAcademic">
        <div class="nexus-dropdown-trigger" onclick="toggleNexusDropdown('dropBoxAcademic')">
          <div class="nexus-trigger-title"><i class="fas fa-graduation-cap"></i> Academic & Role (শিক্ষা ও পেশা)</div>
          <div class="nexus-trigger-arrow"><i class="fas fa-chevron-down"></i></div>
        </div>
        <div class="nexus-dropdown-content">
          <div class="nexus-inner-padding">
            <!-- শিক্ষা প্রতিষ্ঠান এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান / কর্মস্থলের নাম (Institution)</small>
                <p id="profGridInstitution">লোড হচ্ছে...</p>
              </div>
            </div>
            <!-- শিক্ষাগত যোগ্যতা, শিক্ষাবর্ষ, পেশা এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-book-open"></i> শিক্ষাগত যোগ্যতা (Education)</small>
                <p id="profGridEducation">-</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-clock"></i> শিক্ষাবর্ষ (Academic Year)</small>
                <p id="profGridAcademicYear">-</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-briefcase"></i> পেশা (Profession)</small>
                <p id="profGridProfession">-</p>
              </div>
            </div>
            <!-- অ্যাকাউন্টের ধরন ও অ্যাকাউন্টের স্ট্যাটাস এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-user-tag"></i> অ্যাকাউন্টের ধরন (Role)</small>
                <p id="profGridRole" style="color: var(--secondary); text-transform: uppercase;">-</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fas fa-toggle-on"></i> অ্যাকাউন্টের স্ট্যাটাস</small>
                <p id="profGridStatus" class="status-active-glow">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ড্রপডাউন ৩: যোগাযোগ মাধ্যম -->
      <div class="nexus-dropdown-box" id="dropBoxContact">
        <div class="nexus-dropdown-trigger" onclick="toggleNexusDropdown('dropBoxContact')">
          <div class="nexus-trigger-title"><i class="fas fa-network-wired"></i> Communication (যোগাযোগ মাধ্যম)</div>
          <div class="nexus-trigger-arrow"><i class="fas fa-chevron-down"></i></div>
        </div>
        <div class="nexus-dropdown-content">
          <div class="nexus-inner-padding">
            <!-- মোবাইল ও হোয়াটসঅ্যাপ নম্বর এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</small>
                <p id="profGridMobile">-</p>
              </div>
              <div class="nexus-field-cell">
                <small><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</small>
                <p id="profGridWhatsapp">-</p>
              </div>
            </div>
            <!-- ইমেইল এড্রেস এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-envelope"></i> ইমেইল এড্রেস</small>
                <p id="profGridEmail">-</p>
              </div>
            </div>
            <!-- ফেসবুক আইডি লিংক এক লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fab fa-facebook-square"></i> ফেসবুক প্রোফাইল গেটওয়ে</small>
                <p id="profGridFacebook">-</p>
              </div>
            </div>
            <!-- বর্তমান ঠিকানা আলাদা লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা (Present Address)</small>
                <p id="profGridPresentAddress">লোড হচ্ছে...</p>
              </div>
            </div>
            <!-- স্থায়ী ঠিকানা আলাদা লাইনে -->
            <div class="nexus-row">
              <div class="nexus-field-cell">
                <small><i class="fas fa-home"></i> স্থায়ী ঠিকানা (Permanent Address)</small>
                <p id="profGridPermanentAddress">লোড হচ্ছে...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // ২. গ্লোবাল ড্রপডাউন টগল ফাংশন (ক্লিক না করা পর্যন্ত অটোমেটিক বন্ধ হবে না)
  window.toggleNexusDropdown = function(boxId) {
    const element = document.getElementById(boxId);
    if (element) {
      element.classList.toggle('active');
    }
  };

  // ৩. ফায়ারবেস রিয়েল-টাইম ডাটা বাইন্ডিং লুপ
  const currentUser = auth.currentUser;
  if (currentUser) {
    onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();

        // ক) প্রোফাইল টপ কার্ড ডাটা ম্যাপিং
        document.getElementById('profCardAvatar').src = d.photoUrl || '../placeholder.png';
        document.getElementById('profCardMemberId').innerText = d.memberId || "ROS-NEXUS";
        document.getElementById('profCardEngName').innerText = d.englishName || "সদস্য নাম";
        document.getElementById('profCardBngName').innerText = d.banglaName || "";

        // খ) ড্রপডাউন ১: ব্যক্তিগত তথ্য ম্যাপিং
        document.getElementById('profGridFather').innerText = d.fatherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridMother').innerText = d.motherName || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridDob').innerText = d.dob || "তথ্য নেই";
        document.getElementById('profGridGender').innerText = d.gender || "নির্দিষ্ট নয়";
        document.getElementById('profGridNidBrn').innerText = d.nidOrBrn || "প্রদান করা হয়নি";
        
        // গ) ড্রপডাউন ২: শিক্ষা ও পেশা ম্যাপিং (ব্র্যাকেট নোটেশন দিয়ে Academic Year ১০০% ফিক্সড)
        document.getElementById('profGridInstitution').innerText = d.institution || "তথ্য পাওয়া যায়নি";
        document.getElementById('profGridEducation').innerText = d.education || "N/A";
        document.getElementById('profGridAcademicYear').innerText = d['academicYear'] || "N/A";
        document.getElementById('profGridProfession').innerText = d.profession || "N/A";
        document.getElementById('profGridRole').innerText = d.role || "MEMBER";
        document.getElementById('profGridStatus').innerText = d.status || "ACTIVE";

        // ঘ) ড্রপডাউন ৩: যোগাযোগ ডাটা ম্যাপিং (ব্র্যাকেট নোটেশন দিয়ে whatsapp Number ১০০% ফিক্সড)
        document.getElementById('profGridMobile').innerText = d.mobileNumber || "তথ্য নেই";
        document.getElementById('profGridWhatsapp').innerText = d['whatsappNumber'] || "তথ্য নেই";
        document.getElementById('profGridEmail').innerText = d.email || "তথ্য নেই";
        
        if (d.facebookLink && d.facebookLink.trim() !== "") {
          document.getElementById('profGridFacebook').innerHTML = `<a href="${d.facebookLink}" target="_blank"><i class="fas fa-external-link-alt"></i> প্রোফাইল কানেক্ট করুন</a>`;
        } else {
          document.getElementById('profGridFacebook').innerText = "লিংক যুক্ত করা হয়নি";
        }

        document.getElementById('profGridPresentAddress').innerText = d.presentAddress || "ঠিকানা খালি";
        document.getElementById('profGridPermanentAddress').innerText = d.permanentAddress || "ঠিকানা খালি";

        // ঙ) রেজিস্ট্রেশন ডেট ও সিস্টেম সাইকেল ক্যালকুলেশন
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
        alert("আপনার প্রোফাইল ডাটাবেজে খুঁজে পাওয়া যায়নি!");
        signOut(auth);
      }
    });
  } else {
    window.location.href = "../login.html";
  }
}
