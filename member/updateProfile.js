// তথ্য পরিবর্তন মডিউলের মূল ফাংশন
function loadUpdateInfoModule(contentRoot, db, auth, doc, onSnapshot, updateDoc) {
  
  // ১. তথ্য পরিবর্তন মডিউলের এইচটিএমএল এবং আল্ট্রা-রেসপনসিভ সাইবারপাঙ্ক CSS রেন্ডার
  contentRoot.innerHTML = `
    <style>
      .update-matrix-card { max-width: 1000px; width: 100%; margin: 0 auto; padding: 40px; border-radius: 16px; position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.6); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); box-sizing: border-box; }
      .update-matrix-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, var(--neon-yellow), var(--neon-blue), transparent); }
      
      .update-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
      .avatar-edit-wrapper { width: 130px; height: 130px; border: 2px solid rgba(255, 183, 3, 0.3); padding: 6px; background: rgba(3, 7, 18, 0.6); border-radius: 50%; box-shadow: 0 0 20px rgba(255, 183, 3, 0.15); margin-bottom: 12px; position: relative; }
      .prof-edit-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      
      /* ছবির নিচের মেম্বার আইডি ব্যাজ */
      .update-reg-badge { background: rgba(255, 183, 3, 0.1); color: var(--neon-yellow); border: 1px solid rgba(255, 183, 3, 0.4); padding: 6px 20px; border-radius: 30px; font-family: 'Orbitron'; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; box-shadow: 0 0 15px rgba(255, 183, 3, 0.2); margin-top: 5px; margin-bottom: 10px; text-shadow: 0 0 5px var(--neon-yellow); }
      
      .update-section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--neon-yellow); margin: 30px 0 15px 0; display: flex; align-items: center; gap: 10px; font-weight: 700; }
      .update-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255, 183, 3, 0.3), transparent); }
      
      /* ফর্ম গ্রিড লেআউট */
      .update-form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .form-field-box { display: flex; flex-direction: column; gap: 6px; }
      .form-field-box.span-2 { grid-column: span 2; }
      .form-field-box.span-4 { grid-column: span 4; }
      
      .form-field-box label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); font-weight: 500; }
      .form-field-box label i { color: var(--neon-blue); font-size: 12px; width: 14px; text-align: center; }
      
      /* সাইবারপাঙ্ক ইনপুট ফিল্ড */
      .cyber-input { width: 100%; background: rgba(3, 7, 18, 0.5); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 8px; color: #fff; font-size: 14px; transition: all 0.25s ease; box-sizing: border-box; }
      .cyber-input:focus { border-color: var(--neon-blue); box-shadow: 0 0 12px rgba(0, 180, 216, 0.25); outline: none; background: rgba(3, 7, 18, 0.8); }
      .cyber-input:disabled { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.03); color: var(--text-muted); cursor: not-allowed; }
      
      /* সাবমিট বাটন নোড */
      .form-submit-row { display: flex; justify-content: center; margin-top: 35px; }
      .cyber-save-btn { background: rgba(46, 196, 182, 0.1); border: 1px solid var(--neon-green); color: var(--neon-green); padding: 14px 40px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; text-shadow: 0 0 5px rgba(46, 196, 182, 0.4); }
      .cyber-save-btn:hover { background: var(--neon-green); color: #030712; box-shadow: 0 0 20px var(--neon-green); transform: translateY(-1px); }
      
      /* মোবাইল রেসপনসিভ অ্যাডজাস্টমেন্ট */
      @media (max-width: 992px) {
        .update-form-grid { grid-template-columns: repeat(2, 1fr); }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 2; }
      }
      @media (max-width: 768px) {
        .update-matrix-card { padding: 30px 20px; }
      }
      @media (max-width: 480px) {
        .update-matrix-card { padding: 20px 12px; margin: 0; border-radius: 8px; width: 100% !important; }
        .update-form-grid { grid-template-columns: 1fr; gap: 12px; }
        .form-field-box.span-2, .form-field-box.span-4 { grid-column: span 1; }
        .cyber-save-btn { width: 100%; justify-content: center; }
      }
    </style>

    <section class="module-viewport" style="padding: 10px; box-sizing: border-box;">
      <div class="update-matrix-card">
        
        <div class="update-identity-hub">
          <div class="avatar-edit-wrapper">
            <img src="../placeholder.png" id="updAvatarImg" class="prof-edit-avatar">
          </div>
          <div class="update-reg-badge" id="updMemberIdBadge">ROS-NEXUS</div>
          <p style="font-size: 13px; color: var(--text-muted);">প্রোফাইল তথ্য আপডেট পোর্টাল</p>
        </div>

        <form id="cyberUpdateForm">
          
          <div class="update-section-title"><i class="fas fa-user-cog"></i> ব্যক্তিগত বিবরণ (Personal Matrix)</div>
          <div class="update-form-grid">
            <div class="form-field-box span-2">
              <label><i class="fas fa-user"></i> ইংরেজিতে নাম (English Name)</label>
              <input type="text" id="updEnglishName" class="cyber-input" required placeholder="John Doe">
            </div>
            <div class="form-field-box span-2">
              <label><i class="font-awesome fa-solid fa-signature"></i> বাংলায় নাম (Bangla Name)</label>
              <input type="text" id="updBanglaName" class="cyber-input" required placeholder="জন ডো">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-user-tie"></i> পিতার নাম (Father's Name)</label>
              <input type="text" id="updFatherName" class="cyber-input" required placeholder="পিতার নাম লিখুন">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-female"></i> মাতার নাম (Mother's Name)</label>
              <input type="text" id="updMotherName" class="cyber-input" required placeholder="মাতার নাম লিখুন">
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
              <input type="text" id="updNidOrBrn" class="cyber-input" placeholder="জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর">
            </div>
          </div>

          <div class="update-section-title"><i class="fas fa-graduation-cap"></i> শিক্ষা ও পেশা (Academic & Career)</div>
          <div class="update-form-grid">
            <div class="form-field-box span-2">
              <label><i class="fas fa-university"></i> শিক্ষা প্রতিষ্ঠান (Institution)</label>
              <input type="text" id="updInstitution" class="cyber-input" placeholder="স্কুল/কলেজ/বিশ্ববিদ্যালয়ের নাম">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-book"></i> শ্রেণী/যোগ্যতা (Education)</label>
              <input type="text" id="updEducation" class="cyber-input" placeholder="উদাঃ HSC / BSC">
            </div>
            <div class="form-field-box">
              <label><i class="fas fa-calendar-check"></i> শিক্ষাবর্ষ (Academic Year)</label>
              <input type="text" id="updAcademicYear" class="cyber-input" placeholder="উদাঃ 2023-24">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-briefcase"></i> পেশা (Profession)</label>
              <input type="text" id="updProfession" class="cyber-input" placeholder="উদাঃ ছাত্র / চাকুরিজীবী">
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
              <input type="text" id="updMobileNumber" class="cyber-input" required placeholder="01XXXXXXXXX">
            </div>
            <div class="form-field-box">
              <label><i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ নম্বর</label>
              <input type="text" id="updWhatsappNumber" class="cyber-input" placeholder="01XXXXXXXXX">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-envelope"></i> ইমেইল এড্রেস (Email)</label>
              <input type="email" id="updEmail" class="cyber-input" disabled>
            </div>
            <div class="form-field-box span-4">
              <label><i class="fab fa-facebook"></i> ফেসবুক প্রোফাইল লিংক (Facebook Link)</label>
              <input type="url" id="updFacebookLink" class="cyber-input" placeholder="https://facebook.com/username">
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-map-marker-alt"></i> বর্তমান ঠিকানা (Present Address)</label>
              <textarea id="updPresentAddress" class="cyber-input" rows="2" placeholder="বর্তমান ঠিকানা লিখুন"></textarea>
            </div>
            <div class="form-field-box span-2">
              <label><i class="fas fa-home"></i> স্থায়ী ঠিকানা (Permanent Address)</label>
              <textarea id="updPermanentAddress" class="cyber-input" rows="2" placeholder="স্থায়ী ঠিকানা লিখুন"></textarea>
            </div>
            <input type="hidden" id="updPhotoUrl">
          </div>

          <div class="form-submit-row">
            <button type="submit" class="cyber-save-btn" id="updSubmitBtn">
              <i class="fas fa-save"></i> পরিবর্তনগুলো সংরক্ষণ করুন
            </button>
          </div>

        </form>
      </div>
    </section>
  `;

  // ২. ফায়ারবেস থেকে ডাটা নিয়ে ফর্মে পুশ (Data Binding) করার প্রসেস লুপ
  const currentUser = auth.currentUser;
  if (currentUser) {
    onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();

        // ক) প্রোফাইল টপ নোড ম্যাপিং 
        document.getElementById('updAvatarImg').src = d.photoUrl || '../placeholder.png';
        document.getElementById('updMemberIdBadge').innerText = d.memberId || "ROS-MEMBER";

        // খ) ফর্ম ফিল্ড ভ্যালু অ্যাসাইনমেন্ট (২২টি ফিল্ড)
        document.getElementById('updEnglishName').value = d.englishName || "";
        document.getElementById('updBanglaName').value = d.banglaName || "";
        document.getElementById('updFatherName').value = d.fatherName || "";
        document.getElementById('updMotherName').value = d.motherName || "";
        document.getElementById('updDob').value = d.dob || "";
        document.getElementById('updGender').value = d.gender || "Male";
        document.getElementById('updNidOrBrn').value = d.nidOrBrn || "";
        
        document.getElementById('updInstitution').value = d.institution || "";
        document.getElementById('updEducation').value = d.education || "";
        document.getElementById('updAcademicYear').value = d.academicYear || "";
        document.getElementById('updProfession').value = d.profession || "";
        document.getElementById('updRole').value = (d.role || "member").toUpperCase();
        document.getElementById('updStatus').value = (d.status || "active").toUpperCase();

        document.getElementById('updMobileNumber').value = d.mobileNumber || "";
        document.getElementById('updWhatsappNumber').value = d.whatsappNumber || "";
        document.getElementById('updEmail').value = d.email || currentUser.email;
        document.getElementById('updFacebookLink').value = d.facebookLink || "";
        document.getElementById('updPresentAddress').value = d.presentAddress || "";
        document.getElementById('updPermanentAddress').value = d.permanentAddress || "";
        document.getElementById('updPhotoUrl').value = d.photoUrl || "";
      }
    });

    // ৩. সাবমিট ইভেন্ট হ্যান্ডলার (ফায়ারবেস ফায়ারস্টোরে লাইভ ডাটা আপডেট লজিক)
    document.getElementById('cyberUpdateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('updSubmitBtn');
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ডাটা প্রসেস হচ্ছে...`;
      submitBtn.disabled = true;

      // ডাটা অবজেক্ট প্রিপারেশন
      const updatedData = {
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
      };

      try {
        // ফায়ারবেস আপডেট মেথড কল
        await updateDoc(doc(db, "users", currentUser.uid), updatedData);
        alert("🔒 চমৎকার! আপনার প্রোফাইলের তথ্যগুলো সফলভাবে আপডেট করা হয়েছে।");
      } catch (error) {
        console.error("Update Error:", error);
        alert("দুঃখিত! তথ্য আপডেট করার সময় একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      } finally {
        submitBtn.innerHTML = `<i class="fas fa-save"></i> পরিবর্তনগুলো সংরক্ষণ করুন`;
        submitBtn.disabled = false;
      }
    });

  } else {
    window.location.href = "../login.html";
  }
}
