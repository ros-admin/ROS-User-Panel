// ROS Nexus - Enterprise Member Update Info Module (Parallel Lock Engine)
function loadUpdateInfoModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. মডিউলের জন্য ডেডিকেটেড নেক্সাস ইউআই এবং নোটিফিকেশন স্টাইল ইনজেকশন
  contentRoot.innerHTML = `
    <style>
      /* কোর ফ্রেমওয়ার্ক ও কন্টেইনার */
      .update-matrix-card { 
        max-width: 1000px; width: 100%; margin: 0 auto; padding: 35px 30px; 
        border-radius: 16px; position: relative; overflow: hidden; 
        background: rgba(4, 15, 32, 0.55); backdrop-filter: blur(15px); 
        -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(0, 245, 255, 0.25); 
        box-shadow: 0 10px 40px rgba(0,0,0,0.5); box-sizing: border-box;
        font-family: 'Segoe UI', Roboto, sans-serif;
      }
      
      /* ছবি ও প্রোফাইল ইমেজ হাব */
      .update-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
      .avatar-edit-wrapper { 
        width: 135px; height: 135px; border: 2px solid var(--secondary); padding: 5px; 
        background: #030a16; border-radius: 50%; box-shadow: 0 0 30px rgba(0, 245, 255, 0.25); 
        margin-bottom: 15px; position: relative;
      }
      .prof-edit-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      .change-photo-trigger { 
        color: var(--secondary); font-size: 13.5px; font-weight: 700; cursor: pointer; 
        text-decoration: none; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; 
        transition: 0.3s; text-shadow: 0 0 8px rgba(0, 245, 255, 0.3); 
      }
      .change-photo-trigger:hover { color: var(--accent); text-shadow: 0 0 12px var(--accent); }
      .change-photo-trigger.locked-state { opacity: 0.5 !important; cursor: not-allowed !important; color: #ef4444 !important; text-shadow: 0 0 8px rgba(239, 68, 68, 0.4) !important; }
      
      .update-reg-badge { 
        background: rgba(0, 245, 255, 0.08); color: var(--secondary); 
        border: 1px solid rgba(0, 245, 255, 0.25); padding: 5px 20px; 
        border-radius: 30px; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-bottom: 5px; 
      }
      
      /* সিস্টেম লক স্টেট নোটিশ ব্যানার */
      .lock-status-banner { width: 100%; padding: 14px; border-radius: 10px; font-size: 13.5px; text-align: center; font-weight: 600; margin-bottom: 20px; display: none; align-items: center; justify-content: center; gap: 10px; box-sizing: border-box; }
      .banner-red { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; text-shadow: 0 0 5px rgba(239, 68, 68, 0.4); }
      .banner-blue { background: rgba(0, 245, 255, 0.1); border: 1px solid rgba(0, 245, 255, 0.3); color: var(--secondary); text-shadow: 0 0 5px rgba(0, 245, 255, 0.4); }
      
      /* সেকশন হেডার ডিজাইন */
      .update-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--secondary); margin: 35px 0 18px 0; display: flex; align-items: center; gap: 10px; font-weight: 700; }
      .update-section-title i { color: var(--accent); }
      .update-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(0, 245, 255, 0.2), transparent); }
      
      /* ফর্ম গ্রিড ও রেস্পন্সিভ ফিল্ডস */
      .update-form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
      .form-field-box { 
        display: flex; flex-direction: column; gap: 6px; 
        background: rgba(5, 17, 37, 0.75); border: 1px solid rgba(255, 255, 255, 0.04); 
        padding: 14px 18px; border-radius: 10px; transition: all 0.3s ease; box-sizing: border-box;
      }
      .form-field-box.span-2 { grid-column: span 2; }
      .form-field-box.span-4 { grid-column: span 4; }
      
      /* ফিল্ড ফোকাস নিয়ন গ্লো */
      .form-field-box:hover, .form-field-box:focus-within { 
        border-color: var(--secondary); 
        background: rgba(0, 245, 255, 0.02);
        box-shadow: 0 0 18px rgba(0, 245, 255, 0.15), inset 0 0 8px rgba(0, 245, 255, 0.05);
      }
      
      .form-field-box label { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
      .form-field-box label i { color: var(--secondary); opacity: 0.8; font-size: 12px; width: 14px; text-align: center; }
      
      /* ইনপুট এলিমেন্ট রেন্ডারিং */
      .cyber-input { width: 100%; background: transparent; border: none; padding: 4px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14.5px; font-weight: 600; transition: all 0.25s ease; box-sizing: border-box; }
      .cyber-input:focus { outline: none; }
      .cyber-input:disabled { color: var(--text-muted); cursor: not-allowed; }
      select.cyber-input option { background: #06142b; color: #fff; }
      textarea.cyber-input { resize: vertical; min-height: 40px; font-family: inherit; }
      
      /* সাবমিট বাটন */
      .form-submit-row { display: flex; justify-content: center; margin-top: 40px; }
      .cyber-save-btn { 
        background: rgba(0, 245, 255, 0.05); border: 1px solid var(--secondary); color: var(--secondary); 
        padding: 14px 45px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer; 
        transition: 0.3s; display: flex; align-items: center; gap: 10px; text-shadow: 0 0 5px rgba(0, 245, 255, 0.4); 
      }
      .cyber-save-btn:hover { background: var(--secondary); color: #030712; box-shadow: 0 0 25px var(--secondary); transform: translateY(-2px); }
      .cyber-save-btn:disabled { background: rgba(255,255,255,0.02) !important; border-color: rgba(255,255,255,0.05) !important; color: var(--text-muted) !important; cursor: not-allowed !important; box-shadow: none !important; text-shadow: none !important; transform: none !important; }

      /* মডার্ন কনফার্মেশন মোডাল */
      .confirm-popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 10, 22, 0.85); backdrop-filter: blur(12px); z-index: 3000; display: none; align-items: center; justify-content: center; padding: 20px; }
      .confirm-popup-card { width: 100%; max-width: 425px; padding: 30px; border-radius: 14px; background: #051125; border: 1px solid rgba(0, 245, 255, 0.25); text-align: center; box-shadow: 0 0 30px rgba(0, 245, 255, 0.15); animation: nexusPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      @keyframes nexusPop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      .confirm-popup-card h4 { font-size: 16px; color: #fff; margin: 0 0 25px 0; line-height: 1.6; font-weight: 600; }
      .popup-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      
      .nexus-btn { padding: 12px 20px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.2s; border: none; }
      .nexus-btn-muted { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); }
      .nexus-btn-muted:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .nexus-btn-primary { background: var(--secondary); color: #030712; box-shadow: 0 0 15px rgba(0, 245, 255, 0.2); }
      .nexus-btn-primary:hover { background: #fff; box-shadow: 0 0 20px #fff; }

      /* রেস্পন্সিভ মিডিয়া কোয়েরি (মোবাইলে সিঙ্গেল কলাম) */
      @media (max-width: 992px) {
        .update-form-grid { grid-template-columns: repeat(2, 1fr); }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 2; }
      }
      @media (max-width: 768px) {
        .update-matrix-card { padding: 25px 15px; }
        .update-form-grid { grid-template-columns: 1fr; gap: 14px; }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 1; }
        .cyber-save-btn { width: 100%; justify-content: center; }
      }
    </style>

    <section style="padding: 10px; box-sizing: border-box;">
      <div class="update-matrix-card">
        
        <!-- ১. ছবি পরিবর্তন পেন্ডিং ব্যানার -->
        <div class="lock-status-banner banner-blue" id="photoLockBanner">
          <i class="fas fa-camera fa-spin"></i> আপনার একটি ছবি পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।
        </div>

        <!-- ২. তথ্য পরিবর্তন পেন্ডিং ব্যানার -->
        <div class="lock-status-banner banner-red" id="infoLockBanner">
          <i class="fas fa-user-shield fa-spin"></i> আপনার একটি তথ্য পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।
        </div>

        <div class="update-identity-hub">
          <div class="avatar-edit-wrapper">
            <img src="../placeholder.png" id="updAvatarImg" class="prof-edit-avatar">
          </div>
          
          <!-- ছবি পরিবর্তন লিংক ট্রিগার -->
          <div class="change-photo-trigger" id="photoTriggerBtn"><i class="fas fa-camera"></i> ছবি পরিবর্তন করুন</div>
          <input type="file" id="hiddenGalleryInput" accept="image/*" style="display: none;">
          
          <div class="update-reg-badge" id="updMemberIdBadge">ROS-NEXUS</div>
        </div>

        <!-- তথ্য পরিবর্তনের মূল ফর্ম -->
        <form id="cyberUpdateForm">
          <div class="update-section-title"><i class="fas fa-user-astronaut"></i> ব্যক্তিগত বিবরণ (Personal Matrix)</div>
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
              <label><i class="fas fa-user-shield"></i> পিতার নাম (Father's Name)</label>
              <input type="text" id="updFatherName" class="cyber-input" required>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-user-tie"></i> মাতার নাম (Mother's Name)</label>
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
            <div class="form-field-box span-4">
              <label><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান / কর্মস্থলের নাম (Institution)</label>
              <input type="text" id="updInstitution" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-book-open"></i> শিক্ষাগত যোগ্যতা (Education)</label>
              <input type="text" id="updEducation" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-clock"></i> শিক্ষাবর্ষ (Academic Year)</label>
              <input type="text" id="updAcademicYear" class="cyber-input">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-user-tag"></i> অ্যাকাউন্টের ধরন (Role)</label>
              <input type="text" id="updRole" class="cyber-input" disabled style="color: var(--secondary);">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-toggle-on"></i> অ্যাকাউন্টের স্ট্যাটাস (Status)</label>
              <input type="text" id="updStatus" class="cyber-input" disabled style="color: var(--neon-green);">
            </div>
            <div class="form-field-box span-4">
              <label><i class="fas fa-briefcase"></i> পেশা (Profession)</label>
              <input type="text" id="updProfession" class="cyber-input">
            </div>
          </div>

          <div class="update-section-title"><i class="fas fa-network-wired"></i> যোগাযোগ ও নেটওয়ার্ক (Contact & Network)</div>
          <div class="update-form-grid">
            <div class="form-field-box span-2">
              <label><i class="fas fa-phone-alt"></i> মোবাইল নম্বর</label>
              <input type="text" id="updMobileNumber" class="cyber-input" required>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</label>
              <input type="text" id="updWhatsappNumber" class="cyber-input">
            </div>
            <div class="form-field-box span-4">
              <label><i class="fas fa-envelope"></i> ইমেইল এড্রেস (Email)</label>
              <input type="email" id="updEmail" class="cyber-input" disabled>
            </div>
            <div class="form-field-box span-4">
              <label><i class="fab fa-facebook-square"></i> ফেসবুক প্রোফাইল লিংক (Facebook Link)</label>
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

    <!-- ডাবল কনফার্মেশন মোডাল উইন্ডো -->
    <div class="confirm-popup-overlay" id="cyberConfirmPopup">
      <div class="confirm-popup-card">
        <h4 id="popupPromptText">আপনি কি নিশ্চিত?</h4>
        <div class="popup-action-grid">
          <button class="nexus-btn nexus-btn-muted" id="popupCancelBtn">বাতিল করুন</button>
          <button class="nexus-btn nexus-btn-primary" id="popupConfirmBtn">সাবমিট করুন</button>
        </div>
      </div>
    </div>
  `;

  // ২. ডম অবজেক্ট রেফারেন্স ট্র্যাকিং
  const currentUser = auth.currentUser;
  const photoTriggerBtn = document.getElementById('photoTriggerBtn');
  const hiddenGalleryInput = document.getElementById('hiddenGalleryInput');
  const photoLockBanner = document.getElementById('photoLockBanner');
  const infoLockBanner = document.getElementById('infoLockBanner');
  const cyberUpdateForm = document.getElementById('cyberUpdateForm');
  const updSubmitBtn = document.getElementById('updSubmitBtn');
  
  const cyberConfirmPopup = document.getElementById('cyberConfirmPopup');
  const popupPromptText = document.getElementById('popupPromptText');
  const popupCancelBtn = document.getElementById('popupCancelBtn');
  const popupConfirmBtn = document.getElementById('popupConfirmBtn');

  let isPhotoLocked = false;
  let isInfoLocked = false;
  let tempBase64Image = null; 
  let confirmationType = ""; // "photo" অথবা "data"

  if (!currentUser) { window.location.href = "../login.html"; return; }

  // ৩. প্যারালাল রিয়েল-টাইম ফায়ারবেস ডেটা ট্র্যাকিং লুপ
  onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
    if (snapshot.exists()) {
      const d = snapshot.data();

      // ক) ফটো লক লজিক ইমপ্লিমেন্টেশন
      if (d.imageApprovalStatus === "pending") {
        isPhotoLocked = true;
        photoLockBanner.style.display = "flex";
        photoTriggerBtn.classList.add('locked-state');
      } else {
        isPhotoLocked = false;
        photoLockBanner.style.display = "none";
        photoTriggerBtn.classList.remove('locked-state');
      }

      // খ) তথ্য পরিবর্তন লক লজিক ইমপ্লিমেন্টেশন
      if (d.infoApprovalStatus === "pending") {
        isInfoLocked = true;
        infoLockBanner.style.display = "flex";
        updSubmitBtn.disabled = true;
      } else {
        isInfoLocked = false;
        infoLockBanner.style.display = "none";
        updSubmitBtn.disabled = false;
      }

      // প্রোফাইল ফটো এবং আইডি রেন্ডারিং
      document.getElementById('updAvatarImg').src = d.photoUrl || '../placeholder.png';
      document.getElementById('updMemberIdBadge').innerText = d.memberId || "ROS-MEMBER";

      // ফর্ম ফিল্ড ম্যাপিং এবং ডাইনামিক ফিল্ড লকিং (profile.js অনুযায়ী ফিল্ড নাম ফিক্সড)
      const fields = [
        ['updEnglishName', d.englishName], ['updBanglaName', d.banglaName],
        ['updFatherName', d.fatherName], ['updMotherName', d.motherName],
        ['updDob', d.dob], ['updGender', d.gender || "Male"],
        ['updNidOrBrn', d.nidOrBrn], ['updInstitution', d.institution],
        ['updEducation', d.education], ['updAcademicYear', d.academicYear], // ফিক্সড: academicYear
        ['updProfession', d.profession], ['updMobileNumber', d.mobileNumber],
        ['updWhatsappNumber', d.whatsappNumber], // ফিক্সড: whatsappNumber
        ['updFacebookLink', d.facebookLink],
        ['updPresentAddress', d.presentAddress], ['updPermanentAddress', d.permanentAddress]
      ];

      fields.forEach(([id, val]) => {
        const el = document.getElementById(id);
        if(el) {
          el.value = val || "";
          el.disabled = isInfoLocked; // তথ্য পরিবর্তনের আবেদন পেন্ডিং থাকলে ইনপুট লক হবে
        }
      });

      document.getElementById('updRole').value = (d.role || "member").toUpperCase();
      document.getElementById('updStatus').value = (d.status || "active").toUpperCase();
      document.getElementById('updEmail').value = d.email || currentUser.email;
    }
  });

  // ৪. স্বাধীন গ্যালারি ওপেনিং মেকানিজম
  photoTriggerBtn.addEventListener('click', () => {
    if (isPhotoLocked) {
      alert("আপনার একটি ছবি পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।");
      return;
    }
    hiddenGalleryInput.click();
  });

  // গ্যালারি থেকে ছবি সিলেক্ট রিসিভার
  hiddenGalleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      tempBase64Image = reader.result; 
      confirmationType = "photo";
      popupPromptText.innerText = "থিম অনুযায়ী আপনার নতুন ছবি নির্বাচন করা হয়েছে। আপনি কি ছবি পরিবর্তনের জন্য সাবমিট করবেন?";
      cyberConfirmPopup.style.display = "flex";
    };
    reader.readAsDataURL(file);
  });

  // ৫. স্বাধীন তথ্য পরিবর্তন সাবমিশন মেকানিজম
  cyberUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isInfoLocked) {
      alert("আপনার একটি তথ্য পরিবর্তনের আবেদন ইতোমধ্যে অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অপেক্ষা করুন।");
      return;
    }

    confirmationType = "data";
    popupPromptText.innerText = "আপনি কি আপনার তথ্য পরিবর্তনের জন্য সাবমিট করতে চান?";
    cyberConfirmPopup.style.display = "flex";
  });

    // ৬. ডাবল অ্যাকশন মোডাল ট্রিগার ম্যানেজার
  popupCancelBtn.addEventListener('click', () => {
    cyberConfirmPopup.style.display = "none";
    hiddenGalleryInput.value = ""; 
    tempBase64Image = null;
  });

  popupConfirmBtn.addEventListener('click', async () => {
    cyberConfirmPopup.style.display = "none";

    // ছবি সাবমিট প্রসেস
    if (confirmationType === "photo" && tempBase64Image) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          tempPendingPhoto: tempBase64Image,
          imageApprovalStatus: "pending"
        });
        alert("🔒 আপনার ছবি পরিবর্তনের আবেদনটি এডমিন/সভাপতি/সেক্রেটারির কাছে পৌঁছেছে। অনুমোদনের জন্য অনুগ্রহ করে অপেক্ষা করুন।");
      } catch (err) {
        alert("দুঃখিত, ছবি রিকোয়েস্ট সাবমিট হয়নি। আবার চেষ্টা করুন।");
      }
    } 
    
    // তথ্য সাবমিট প্রসেস (profile.js এর ফিল্ড নেম স্ট্রাকচার অনুযায়ী পে-লোড সাবমিশন)
    else if (confirmationType === "data") {
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
          academicYear: document.getElementById('updAcademicYear').value.trim(), // ফিক্সড নাম
          profession: document.getElementById('updProfession').value.trim(),
          mobileNumber: document.getElementById('updMobileNumber').value.trim(),
          whatsappNumber: document.getElementById('updWhatsappNumber').value.trim(), // ফিক্সড নাম
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
