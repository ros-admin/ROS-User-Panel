// ROS Nexus - Enterprise Member Update Info Module (Ultra-Premium Core)
function loadUpdateInfoModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. মডিউলের জন্য ডেডিকেটেড সাইবারপাঙ্ক ইউআই এবং নোটিফিকেশন স্টাইল ইনজেকশন
  contentRoot.innerHTML = `
    <style>
      .update-matrix-card { max-width: 1000px; width: 100%; margin: 0 auto; padding: 40px; border-radius: 16px; position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); box-sizing: border-box; }
      .update-matrix-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, var(--neon-yellow), var(--neon-blue), transparent); }
      
      /* ছবি ও গ্যালারি ট্রিগার নোড */
      .update-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
      .avatar-edit-wrapper { width: 130px; height: 130px; border: 2px solid rgba(0, 180, 216, 0.3); padding: 6px; background: rgba(3, 7, 18, 0.6); border-radius: 50%; box-shadow: 0 0 20px rgba(0, 180, 216, 0.15); margin-bottom: 12px; position: relative; }
      .prof-edit-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      .change-photo-trigger { color: var(--neon-blue); font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 6px; margin-bottom: 15px; transition: 0.3s; text-shadow: 0 0 5px rgba(0, 180, 216, 0.3); }
      .change-photo-trigger:hover { color: #fff; text-shadow: 0 0 10px var(--neon-blue); }
      
      .update-reg-badge { background: rgba(255, 183, 3, 0.1); color: var(--neon-yellow); border: 1px solid rgba(255, 183, 3, 0.4); padding: 6px 20px; border-radius: 30px; font-family: 'Orbitron'; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; box-shadow: 0 0 15px rgba(255, 183, 3, 0.2); text-shadow: 0 0 5px var(--neon-yellow); margin-bottom: 5px; }
      
      /* লকড মেম্বার স্টেট ব্যানার */
      .lock-status-banner { width: 100%; padding: 12px; border-radius: 8px; background: rgba(230, 57, 70, 0.1); border: 1px solid rgba(230, 57, 70, 0.3); color: var(--neon-red); font-size: 13px; text-align: center; font-weight: 600; margin-bottom: 20px; display: none; align-items: center; justify-content: center; gap: 10px; text-shadow: 0 0 5px rgba(230, 57, 70, 0.4); }
      
      .update-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--neon-yellow); margin: 30px 0 15px 0; display: flex; align-items: center; gap: 10px; font-weight: 700; }
      .update-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255, 183, 3, 0.3), transparent); }
      
      .update-form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .form-field-box { display: flex; flex-direction: column; gap: 6px; }
      .form-field-box.span-2 { grid-column: span 2; }
      .form-field-box.span-4 { grid-column: span 4; }
      .form-field-box label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); font-weight: 500; }
      .form-field-box label i { color: var(--neon-blue); font-size: 12px; width: 14px; text-align: center; }
      
      .cyber-input { width: 100%; background: rgba(3, 7, 18, 0.5); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 8px; color: #fff; font-size: 14px; transition: all 0.25s ease; box-sizing: border-box; }
      .cyber-input:focus { border-color: var(--neon-blue); box-shadow: 0 0 12px rgba(0, 180, 216, 0.25); outline: none; background: rgba(3, 7, 18, 0.8); }
      .cyber-input:disabled { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.03); color: var(--text-muted); cursor: not-allowed; }
      
      .form-submit-row { display: flex; justify-content: center; margin-top: 35px; }
      .cyber-save-btn { background: rgba(46, 196, 182, 0.1); border: 1px solid var(--neon-green); color: var(--neon-green); padding: 14px 40px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; text-shadow: 0 0 5px rgba(46, 196, 182, 0.4); }
      .cyber-save-btn:hover { background: var(--neon-green); color: #030712; box-shadow: 0 0 20px var(--neon-green); transform: translateY(-1px); }
      .cyber-save-btn:disabled { background: rgba(255,255,255,0.02) !important; border-color: rgba(255,255,255,0.05) !important; color: var(--text-muted) !important; cursor: not-allowed !important; box-shadow: none !important; text-shadow: none !important; }

      /* ডাবল কনফার্মেশন মোডাল পপআপ স্টাইল */
      .confirm-popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(10px); z-index: 3000; display: none; align-items: center; justify-content: center; padding: 20px; }
      .confirm-popup-card { width: 100%; max-width: 420px; padding: 30px; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; animation: neonPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      @keyframes neonPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .confirm-popup-card h4 { font-size: 16px; color: #fff; margin-bottom: 20px; line-height: 1.6; }
      .popup-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
      
      @media (max-width: 992px) {
        .update-form-grid { grid-template-columns: repeat(2, 1fr); }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 2; }
      }
      @media (max-width: 480px) {
        .update-matrix-card { padding: 20px 12px; border-radius: 8px; }
        .update-form-grid { grid-template-columns: 1fr; gap: 12px; }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 1; }
        .cyber-save-btn { width: 100%; justify-content: center; }
      }
    </style>

    <section style="padding: 10px; box-sizing: border-box;">
      <div class="update-matrix-card">
        
        <!-- লাইভ রিকোয়েস্ট ওয়ার্নিং ব্যানার -->
        <div class="lock-status-banner" id="lockStatusBanner">
          <i class="fas fa-shield-alt fa-spin"></i> আপনার একটি তথ্য পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।
        </div>

        <div class="update-identity-hub">
          <div class="avatar-edit-wrapper">
            <img src="../placeholder.png" id="updAvatarImg" class="prof-edit-avatar">
          </div>
          
          <!-- গ্যালারি ওপেন করার ক্লিক ট্রিগার লিংক -->
          <div class="change-photo-trigger" id="photoTriggerBtn"><i class="fas fa-camera"></i> ছবি পরিবর্তন করুন</div>
          <input type="file" id="hiddenGalleryInput" accept="image/*" style="display: none;">
          
          <div class="update-reg-badge" id="updMemberIdBadge">ROS-NEXUS</div>
        </div>

        <!-- তথ্য পরিবর্তনের মূল এডিট ফর্ম -->
        <form id="cyberUpdateForm">
          <div class="update-section-title"><i class="fas fa-user-cog"></i> ব্যক্তিগত বিবরণ (Personal Matrix)</div>
          <div class="update-form-grid">
            <div class="form-field-box span-2">
              <label><i class="fas fa-user"></i> ইংরেজিতে নাম (English Name)</label>
              <input type="text" id="updEnglishName" class="cyber-input" required>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fa-solid fa-signature"></i> বাংলায় নাম (Bangla Name)</label>
              <input type="text" id="updBanglaName" class="cyber-input" required>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-user-tie"></i> পিতার নাম (Father's Name)</label>
              <input type="text" id="updFatherName" class="cyber-input" required>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-female"></i> মাতার নাম (Mother's Name)</label>
              <input type="text" id="updMotherName" class="cyber-input" required>
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-calendar-alt"></i> জন্ম তারিখ (DOB)</label>
              <input type="text" id="updDob" class="cyber-input" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-venus-mars"></i> লিঙ্গ (Gender)</label>
              <select id="updGender" class="cyber-input">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-id-card"></i> NID অথবা BRN নম্বর</label>
              <input type="text" id="updNidOrBrn" class="cyber-input">
            </div>
          </div>

          <div class="update-section-title"><i class="fas fa-graduation-cap"></i> শিক্ষা ও পেশা (Academic & Career)</div>
          <div class="update-form-grid">
            <div class="form-field-box span-2">
              <label><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান (Institution)</label>
              <input type="text" id="updInstitution" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-book"></i> শ্রেণী/যোগ্যта (Education)</label>
              <input type="text" id="updEducation" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-calendar-check"></i> শিক্ষাবর্ষ (Academic Year)</label>
              <input type="text" id="updAcademicYear" class="cyber-input">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-briefcase"></i> পেশা (Profession)</label>
              <input type="text" id="updProfession" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-user-shield"></i> মেম্বারশিপ রোল (Role)</label>
              <input type="text" id="updRole" class="cyber-input" disabled>
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-toggle-on"></i> অ্যাকাউন্ট স্ট্যাটাস (Status)</label>
              <input type="text" id="updStatus" class="cyber-input" disabled>
            </div>
          </div>

          <div class="update-section-title"><i class="fas fa-address-book"></i> যোগাযোগ ও নেটওয়ার্ক (Contact & Network)</div>
          <div class="update-form-grid">
            <div class="form-field-box">
              <label><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</label>
              <input type="text" id="updMobileNumber" class="cyber-input" required>
            </div>
            <div class="form-field-box">
              <label><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</label>
              <input type="text" id="updWhatsappNumber" class="cyber-input">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-envelope"></i> ইমেইল এড্রেস (Email)</label>
              <input type="email" id="updEmail" class="cyber-input" disabled>
            </div>
            <div class="form-field-box span-4">
              <label><i class="fab fa-facebook"></i> ফেসবুক প্রোফাইল লিংক (Facebook Link)</label>
              <input type="url" id="updFacebookLink" class="cyber-input">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা (Present Address)</label>
              <textarea id="updPresentAddress" class="cyber-input" rows="2"></textarea>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-home"></i> স্থায়ী ঠিকানা (Permanent Address)</label>
              <textarea id="updPermanentAddress" class="cyber-input" rows="2"></textarea>
            </div>
          </div>

          <div class="form-submit-row">
            <button type="submit" class="cyber-save-btn" id="updSubmitBtn">
              <i class="fas fa-save"></i> সাবমিট করুন
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- ডাবল কনফার্মেশন মেকানিজম পপআপ উইন্ডো -->
    <div class="confirm-popup-overlay" id="cyberConfirmPopup">
      <div class="confirm-popup-card cyber-glass">
        <h4 id="popupPromptText">আপনি কি নিশ্চিত?</h4>
        <div class="popup-action-grid">
          <button class="cyber-btn cyber-btn-muted" id="popupCancelBtn">বাতিল করুন</button>
          <button class="cyber-btn cyber-btn-primary" id="popupConfirmBtn">সাবমিট করুন</button>
        </div>
      </div>
    </div>
  `;

  // ২. ডম অবজেক্ট রেফারেন্স ট্র্যাকিং
  const currentUser = auth.currentUser;
  const photoTriggerBtn = document.getElementById('photoTriggerBtn');
  const hiddenGalleryInput = document.getElementById('hiddenGalleryInput');
  const lockStatusBanner = document.getElementById('lockStatusBanner');
  const cyberUpdateForm = document.getElementById('cyberUpdateForm');
  const updSubmitBtn = document.getElementById('updSubmitBtn');
  
  const cyberConfirmPopup = document.getElementById('cyberConfirmPopup');
  const popupPromptText = document.getElementById('popupPromptText');
  const popupCancelBtn = document.getElementById('popupCancelBtn');
  const popupConfirmBtn = document.getElementById('popupConfirmBtn');

  let globalIsLocked = false; 
  let tempBase64Image = null; 
  let confirmationType = ""; // "photo" অথবা "data"

  if (!currentUser) { window.location.href = "../login.html"; return; }

  // ৩. রিয়েল-টাইম ফায়ারবেস ডেটা ট্র্যাকিং লুপ এবং লকআউট কন্ডিশন ভ্যালিডেশন
  onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
    if (snapshot.exists()) {
      const d = snapshot.data();

      // চেক করা হচ্ছে কোনো আবেদন 'pending' অবস্থায় লকড আছে কিনা (waiting থাকলে লক হবে না)
      if (d.infoApprovalStatus === "pending" || d.imageApprovalStatus === "pending") {
        globalIsLocked = true;
        lockStatusBanner.style.display = "flex";
        updSubmitBtn.disabled = true;
        photoTriggerBtn.style.opacity = "0.5";
        photoTriggerBtn.style.cursor = "not-allowed";
      } else {
        globalIsLocked = false;
        lockStatusBanner.style.display = "none";
        updSubmitBtn.disabled = false;
        photoTriggerBtn.style.opacity = "1";
        photoTriggerBtn.style.cursor = "pointer";
      }

      // ফর্ম ও হেডারে ডাটা রেন্ডারিং (২২টি প্যারামিটার)
      document.getElementById('updAvatarImg').src = d.photoUrl || '../placeholder.png';
      document.getElementById('updMemberIdBadge').innerText = d.memberId || "ROS-MEMBER";

      const fields = [
        ['updEnglishName', d.englishName], ['updBanglaName', d.banglaName],
        ['updFatherName', d.fatherName], ['updMotherName', d.motherName],
        ['updDob', d.dob], ['updGender', d.gender || "Male"],
        ['updNidOrBrn', d.nidOrBrn], ['updInstitution', d.institution],
        ['updEducation', d.education], ['updAcademicYear', d.academicYear],
        ['updProfession', d.profession], ['updMobileNumber', d.mobileNumber],
        ['updWhatsappNumber', d.whatsappNumber], ['updFacebookLink', d.facebookLink],
        ['updPresentAddress', d.presentAddress], ['updPermanentAddress', d.permanentAddress]
      ];

      fields.forEach(([id, val]) => {
        const el = document.getElementById(id);
        if(el) {
          el.value = val || "";
          el.disabled = globalIsLocked; // পেন্ডিং থাকলে ইনপুট লক হয়ে যাবে
        }
      });

      document.getElementById('updRole').value = (d.role || "member").toUpperCase();
      document.getElementById('updStatus').value = (d.status || "active").toUpperCase();
      document.getElementById('updEmail').value = d.email || currentUser.email;
    }
  });

  // ৪. গ্যালারি ট্রিগার প্রসেসিং লজিক
  photoTriggerBtn.addEventListener('click', () => {
    if (globalIsLocked) {
      alert("আপনার একটি তথ্য পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।");
      return;
    }
    hiddenGalleryInput.click();
  });

  // গ্যালারি থেকে ছবি সিলেক্ট করার পর মেকানিজম
  hiddenGalleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      tempBase64Image = reader.result; 
      // ছবি পরিবর্তনের জন্য নিওন মোডাল ডাবল কনফার্মেশন পপআপ ওপেন
      confirmationType = "photo";
      popupPromptText.innerText = "থিম অনুযায়ী আপনার নতুন ছবি নির্বাচন করা হয়েছে। আপনি কি ছবি পরিবর্তনের জন্য সাবমিট করবেন?";
      cyberConfirmPopup.style.display = "flex";
    };
    reader.readAsDataURL(file);
  });

  // ৫. মূল ডাটা ফর্ম সাবমিশন লজিক
  cyberUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (globalIsLocked) return;

    // তথ্য পরিবর্তনের জন্য নিওন মোডাল ডাবল কনফার্মেশন পপআপ ওপেন
    confirmationType = "data";
    popupPromptText.innerText = "আপনি কি আপনার তথ্য পরিবর্তনের জন্য সাবমিট করতে চান?";
    cyberConfirmPopup.style.display = "flex";
  });

  // ৬. মোডাল উইন্ডোর অ্যাকশন হ্যান্ডলার (বাতিল এবং সাবমিট বাটন প্রসেস)
  popupCancelBtn.addEventListener('click', () => {
    cyberConfirmPopup.style.display = "none";
    hiddenGalleryInput.value = ""; // রিসেট ফাইল ট্রিগার
    tempBase64Image = null;
  });

  popupConfirmBtn.addEventListener('click', async () => {
    cyberConfirmPopup.style.display = "none";

    if (confirmationType === "photo" && tempBase64Image) {
      try {
        // ফায়ারস্টোরে ছবি পরিবর্তনের পেন্ডিং রিকোয়েস্ট পাঠানো হচ্ছে
        await updateDoc(doc(db, "users", currentUser.uid), {
          tempPendingPhoto: tempBase64Image,
          imageApprovalStatus: "pending"
        });
        alert("🔒 আপনার ছবি পরিবর্তনের আবেদনটি এডমিন/সভাপতি/সেক্রেটারির কাছে পৌঁছেছে। অনুমোদনের জন্য অনুগ্রহ করে অপেক্ষা করুন।");
      } catch (err) {
        alert("দুঃখিত, ছবি রিকোয়েস্ট সাবমিট হয়নি। আবার চেষ্টা করুন।");
      }
    } 
    
    else if (confirmationType === "data") {
      // তথ্য পরিবর্তনের অবজেক্ট রেডি
      const pendingDataPayload = {
        tempPendingData: {
          englishName: document.getElementById('updEnglishName').value.trim(),
          banglaName: document.getElementById('updBanglaName').value.trim(),
          fatherName: document.getElementById('updFatherName').value.trim(),
          motherName: document.getElementById('updMotherName').value.trim(),
          dob: document.getElementById('updDob').value.trim(),
          gender: document.getElementById('updGender').value,
          nidOrBrn: document.getElementById('updNidOrBrn').value.trim(),
          institution: document.getElementById('updInstitution').value.trim(),
          education: document.getElementById('updEducation').value.trim(),
          academicYear: document.getElementById('updAcademicYear').value.trim(),
          profession: document.getElementById('updProfession').value.trim(),
          mobileNumber: document.getElementById('updMobileNumber').value.trim(),
          whatsappNumber: document.getElementById('updWhatsappNumber').value.trim(),
          facebookLink: document.getElementById('updFacebookLink').value.trim(),
          presentAddress: document.getElementById('updPresentAddress').value.trim(),
          permanentAddress: document.getElementById('updPermanentAddress').value.trim()
        },
        infoApprovalStatus: "pending"
      };

      try {
        await updateDoc(doc(db, "users", currentUser.uid), pendingDataPayload);
        alert("🔒 আপনার প্রোফাইলের তথ্য পরিবর্তনের আবেদনটি এডমিন/সভাপতি/সেক্রেটারির কাছে পৌঁছেছে। অনুমোদনের জন্য অনুগ্রহ করে অপেক্ষা করুন।");
      } catch (err) {
        alert("দুঃখিত, তথ্য রিকোয়েস্ট সাবমিট হয়নি। আবার চেষ্টা করুন।");
      }
    }
    
    hiddenGalleryInput.value = "";
    tempBase64Image = null;
  });
}
