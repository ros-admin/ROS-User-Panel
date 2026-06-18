// ROS Nexus - Enterprise Member Update Info Module (Parallel Lock Engine)
function loadUpdateInfoModule(contentRoot, db, auth, doc, onSnapshot, updateDoc, serverTimestamp) {
  
  if (!contentRoot) return;

  // ১. মডিউলের জন্য ডেডিকেটেড সাইবারপাঙ্ক ইউআই এবং নোটিফিকেশন স্টাইল ইনজেকশন
  contentRoot.innerHTML = `
    <style>
      .update-matrix-card { max-width: 1000px; width: 100%; margin: 0 auto; padding: 40px; border-radius: 16px; position: relative; overflow: hidden; background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(0, 180, 216, 0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.5); box-sizing: border-box; font-family: 'Segoe UI', Roboto, sans-serif; color: #fff; }
      .update-matrix-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #fbbf24, #00b4d8, transparent); }
      
      .update-identity-hub { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; }
      .avatar-edit-wrapper { width: 130px; height: 130px; border-radius: 50%; position: relative; border: 3px solid #00b4d8; background: #020c1b; padding: 4px; box-shadow: 0 0 20px rgba(0, 180, 216, 0.3); }
      .avatar-preview-node { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
      .gallery-trigger-btn { position: absolute; bottom: 0; right: 0; background: #00b4d8; color: #020c1b; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: 0 0 10px rgba(0, 180, 216, 0.5); }
      .gallery-trigger-btn:hover { background: #fff; transform: scale(1.1); }
      
      .status-lock-notice { width: 100%; padding: 15px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 25px; box-sizing: border-box; display: none; align-items: center; gap: 12px; }
      .status-pending { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; }
      .status-rejected { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
      
      .update-matrix-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .form-field-node { display: flex; flex-direction: column; gap: 6px; }
      .form-field-node.span-full { grid-column: span 2; }
      .form-field-node label { font-size: 13px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
      .matrix-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 12px 14px; color: #fff; font-size: 14px; transition: 0.3s; width: 100%; box-sizing: border-box; }
      .matrix-input:focus { outline: none; border-color: #00b4d8; box-shadow: 0 0 10px rgba(0, 180, 216, 0.2); background: rgba(0,0,0,0.5); }
      .matrix-input:disabled { background: rgba(255,255,255,0.02); color: #6b7280; cursor: not-allowed; border-color: transparent; }
      
      .matrix-submit-wrapper { grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 15px; }
      .matrix-save-btn { background: linear-gradient(135deg, #00b4d8, #0077b6); color: #fff; border: none; padding: 14px 35px; font-size: 15px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3); }
      .matrix-save-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 180, 216, 0.5); }
      .matrix-save-btn:disabled { background: #374151; color: #9ca3af; cursor: not-allowed; box-shadow: none; transform: none; }
      
      @media(max-width: 768px) {
        .update-matrix-form { grid-template-columns: 1fr; }
        .form-field-node.span-full, .matrix-submit-wrapper { grid-column: span 1; }
      }
    </style>

    <div class="update-matrix-card">
      <div class="update-identity-hub">
        <div class="avatar-edit-wrapper">
          <img src="../placeholder.png" id="updAvatarPreview" class="avatar-preview-node">
          <button class="gallery-trigger-btn" id="updGalleryTriggerBtn" title="গ্যালারি থেকে ছবি সিলেক্ট করুন">
            <i class="fas fa-camera"></i>
          </button>
        </div>
        <input type="file" id="updHiddenGalleryInput" accept="image/*" style="display: none;">
        <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">সর্বোচ্চ সাইজ: ১ মেগাবাইট (JPEG/PNG)</p>
      </div>

      <div class="status-lock-notice status-pending" id="photoPendingNotice">
        <i class="fas fa-clock fa-spin"></i> আপনার ছবি পরিবর্তনের আবেদনটি এডমিনের অনুমোদনের অপেক্ষায় রয়েছে।
      </div>
      <div class="status-lock-notice status-pending" id="infoPendingNotice">
        <i class="fas fa-hourglass-half fa-spin"></i> আপনার তথ্য পরিবর্তনের আবেদনটি রিভিউ করা হচ্ছে।
      </div>
      <div class="status-lock-notice status-rejected" id="photoRejectNotice">
        <i class="fas fa-exclamation-circle"></i> <span id="photoRejectReasonText">আপনার ছবি পরিবর্তনের আবেদনটি বাতিল করা হয়েছে।</span>
      </div>
      <div class="status-lock-notice status-rejected" id="infoRejectNotice">
        <i class="fas fa-user-times"></i> <span id="infoRejectReasonText">আপনার তথ্য পরিবর্তনের আবেদনটি বাতিল করা হয়েছে।</span>
      </div>

      <form class="update-matrix-form" id="updateMatrixForm" onsubmit="return false;">
        <div class="form-field-node">
          <label>English Name</label>
          <input type="text" id="updEnglishName" class="matrix-input" required>
        </div>
        <div class="form-field-node">
          <label>Bangla Name</label>
          <input type="text" id="updBanglaName" class="matrix-input" required>
        </div>
        <div class="form-field-node">
          <label>Father's Name</label>
          <input type="text" id="updFatherName" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Mother's Name</label>
          <input type="text" id="updMotherName" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Date of Birth</label>
          <input type="date" id="updDob" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Gender</label>
          <select id="updGender" class="matrix-input">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-field-node">
          <label>NID / Birth Registration No</label>
          <input type="text" id="updNidOrBrn" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Institution / Workplace</label>
          <input type="text" id="updInstitution" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Education / Degree</label>
          <input type="text" id="updEducation" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Academic Year / Batch</label>
          <input type="text" id="updAcademicYear" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Profession</label>
          <input type="text" id="updProfession" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Mobile Number</label>
          <input type="tel" id="updMobileNumber" class="matrix-input" required>
        </div>
        <div class="form-field-node">
          <label>WhatsApp Number</label>
          <input type="tel" id="updWhatsappNumber" class="matrix-input">
        </div>
        <div class="form-field-node">
          <label>Facebook Profile Link</label>
          <input type="url" id="updFacebookLink" class="matrix-input">
        </div>
        <div class="form-field-node span-full">
          <label>Present Address</label>
          <input type="text" id="updPresentAddress" class="matrix-input">
        </div>
        <div class="form-field-node span-full">
          <label>Permanent Address</label>
          <input type="text" id="updPermanentAddress" class="matrix-input">
        </div>
        <div class="matrix-submit-wrapper">
          <button type="submit" class="matrix-save-btn" id="matrixSaveBtn">
            <i class="fas fa-shield-alt"></i> তথ্য পরিবর্তনের আবেদন পাঠান
          </button>
        </div>
      </form>
    </div>
  `;

  // ২. ডম অবজেক্ট রেফারেন্স ম্যাপিং
  const currentUser = auth ? auth.currentUser : null;
  if (!currentUser) {
    contentRoot.innerHTML = `<div style="color:#f87171; text-align:center; padding:50px; font-weight:bold;">🚫 অনুগ্রহ করে আগে লগইন করুন বা সেশন চেক করুন।</div>`;
    return;
  }

  const updAvatarPreview = document.getElementById('updAvatarPreview');
  const updGalleryTriggerBtn = document.getElementById('updGalleryTriggerBtn');
  const hiddenGalleryInput = document.getElementById('updHiddenGalleryInput');
  const matrixSaveBtn = document.getElementById('matrixSaveBtn');
  const updateMatrixForm = document.getElementById('updateMatrixForm');

  const photoPendingNotice = document.getElementById('photoPendingNotice');
  const infoPendingNotice = document.getElementById('infoPendingNotice');
  const photoRejectNotice = document.getElementById('photoRejectNotice');
  const infoRejectNotice = document.getElementById('infoRejectNotice');
  const photoRejectReasonText = document.getElementById('photoRejectReasonText');
  const infoRejectReasonText = document.getElementById('infoRejectReasonText');

  let tempBase64Image = null;

  function getTimeStamp() {
    return (typeof serverTimestamp === 'function') ? serverTimestamp() : new Date();
  }

  // ৩. রিয়েল-টাইม ডাটাবেজ লুপ
  onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.data();

    if (!tempBase64Image && updAvatarPreview) {
      updAvatarPreview.src = data.photoUrl || '../placeholder.png';
    }

    if(document.getElementById('updEnglishName')) document.getElementById('updEnglishName').value = data.englishName || "";
    if(document.getElementById('updBanglaName')) document.getElementById('updBanglaName').value = data.banglaName || "";
    if(document.getElementById('updFatherName')) document.getElementById('updFatherName').value = data.fatherName || "";
    if(document.getElementById('updMotherName')) document.getElementById('updMotherName').value = data.motherName || "";
    if(document.getElementById('updDob')) document.getElementById('updDob').value = data.dob || "";
    if(document.getElementById('updGender')) document.getElementById('updGender').value = data.gender || "";
    if(document.getElementById('updNidOrBrn')) document.getElementById('updNidOrBrn').value = data.nidOrBrn || "";
    if(document.getElementById('updInstitution')) document.getElementById('updInstitution').value = data.institution || "";
    if(document.getElementById('updEducation')) document.getElementById('updEducation').value = data.education || "";
    if(document.getElementById('updAcademicYear')) document.getElementById('updAcademicYear').value = data.academicYear || "";
    if(document.getElementById('updProfession')) document.getElementById('updProfession').value = data.profession || "";
    if(document.getElementById('updMobileNumber')) document.getElementById('updMobileNumber').value = data.mobileNumber || "";
    if(document.getElementById('updWhatsappNumber')) document.getElementById('updWhatsappNumber').value = data.whatsappNumber || "";
    if(document.getElementById('updFacebookLink')) document.getElementById('updFacebookLink').value = data.facebookLink || "";
    if(document.getElementById('updPresentAddress')) document.getElementById('updPresentAddress').value = data.presentAddress || "";
    if(document.getElementById('updPermanentAddress')) document.getElementById('updPermanentAddress').value = data.permanentAddress || "";

    if (data.imageApprovalStatus === "pending") {
      if(photoPendingNotice) photoPendingNotice.style.display = "flex";
      if(updGalleryTriggerBtn) { updGalleryTriggerBtn.disabled = true; updGalleryTriggerBtn.style.opacity = "0.5"; }
    } else {
      if(photoPendingNotice) photoPendingNotice.style.display = "none";
      if(updGalleryTriggerBtn) { updGalleryTriggerBtn.disabled = false; updGalleryTriggerBtn.style.opacity = "1"; }
    }

    if (data.imageApprovalStatus === "rejected") {
      if(photoRejectReasonText) photoRejectReasonText.innerText = `❌ ছবি রিজেক্টের কারণ: ${data.imageRejectReason || 'নির্দিষ্ট কারণ নেই।'}`;
      if(photoRejectNotice) photoRejectNotice.style.display = "flex";
    } else { if(photoRejectNotice) photoRejectNotice.style.display = "none"; }

    if (data.infoApprovalStatus === "pending") {
      if(infoPendingNotice) infoPendingNotice.style.display = "flex";
      if(matrixSaveBtn) matrixSaveBtn.disabled = true;
      toggleFormInputs(true);
    } else {
      if(infoPendingNotice) infoPendingNotice.style.display = "none";
      if(matrixSaveBtn) matrixSaveBtn.disabled = false;
      toggleFormInputs(false);
    }

    if (data.infoApprovalStatus === "rejected") {
      if(infoRejectReasonText) infoRejectReasonText.innerText = `❌ তথ্য রিজেক্টের কারণ: ${data.infoRejectReason || 'নির্দিষ্ট কারণ নেই।'}`;
      if(infoRejectNotice) infoRejectNotice.style.display = "flex";
    } else if (data.infoApprovalStatus === "waiting") {
      if(infoRejectReasonText) infoRejectReasonText.innerText = `⚠️ তথ্য হোল্ডের কারণ: ${data.infoRejectReason || 'আপনার তথ্য হোল্ডে রাখা হয়েছে, সংশোধন করুন।'}`;
      if(infoRejectNotice) infoRejectNotice.style.display = "flex";
    } else { if(infoRejectNotice) infoRejectNotice.style.display = "none"; }
  });

  function toggleFormInputs(isLock) {
    if(!updateMatrixForm) return;
    const inputs = updateMatrixForm.querySelectorAll('.matrix-input');
    inputs.forEach(input => input.disabled = isLock);
  }

  // ৪. লোকাল গ্যালারি ইমেজ সাবমিশন
  if(updGalleryTriggerBtn && hiddenGalleryInput) {
    updGalleryTriggerBtn.onclick = () => hiddenGalleryInput.click();

    hiddenGalleryInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 1024 * 1024) {
        alert("⚠️ ফাইল সাইজ ১ মেগাবাইটের বেশি! অনুগ্রহ করে ছোট সাইজের ছবি আপলোড করুন।");
        hiddenGalleryInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        tempBase64Image = reader.result;
        if(updAvatarPreview) updAvatarPreview.src = tempBase64Image;

        if (confirm("আপনি কি নতুন ছবিটি এডমিনের অনুমোদনের জন্য সাবমিট করতে চান?")) {
          try {
            await updateDoc(doc(db, "users", currentUser.uid), {
              tempPendingPhoto: tempBase64Image,
              imageApprovalStatus: "pending",
              imageActionAt: getTimeStamp()
            });
            alert("🎉 নতুন ছবি সফলভাবে সাবমিট হয়েছে। এডমিন অনুমোদনের অপেক্ষা করুন।");
          } catch (err) {
            alert("দুঃখিত, ছবি রিকোয়েস্ট পাঠানো যায়নি!");
          }
        } else {
          tempBase64Image = null;
          hiddenGalleryInput.value = "";
          if(updAvatarPreview) updAvatarPreview.src = "../placeholder.png";
        }
      };
      reader.readAsDataURL(file);
    };
  }

  // ৫. ইনফো ডাটা ফর্ম সাবমিশন
  if(updateMatrixForm) {
    updateMatrixForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (confirm("আপনি কি নিশ্চিতভাবে এই নতুন তথ্যসমূহ অনুমোদনের জন্য পাঠাতে চান?")) {
        const pendingDataPayload = {
          tempPendingData: {
            englishName: document.getElementById('updEnglishName') ? document.getElementById('updEnglishName').value.trim() : "",
            banglaName: document.getElementById('updBanglaName') ? document.getElementById('updBanglaName').value.trim() : "",
            fatherName: document.getElementById('updFatherName') ? document.getElementById('updFatherName').value.trim() : "",
            motherName: document.getElementById('updMotherName') ? document.getElementById('updMotherName').value.trim() : "",
            dob: document.getElementById('updDob') ? document.getElementById('updDob').value.trim() : "",
            gender: document.getElementById('updGender') ? document.getElementById('updGender').value : "",
            nidOrBrn: document.getElementById('updNidOrBrn') ? document.getElementById('updNidOrBrn').value.trim() : "",
            institution: document.getElementById('updInstitution') ? document.getElementById('updInstitution').value.trim() : "",
            education: document.getElementById('updEducation') ? document.getElementById('updEducation').value.trim() : "",
            academicYear: document.getElementById('updAcademicYear') ? document.getElementById('updAcademicYear').value.trim() : "",
            profession: document.getElementById('updProfession') ? document.getElementById('updProfession').value.trim() : "",
            mobileNumber: document.getElementById('updMobileNumber') ? document.getElementById('updMobileNumber').value.trim() : "",
            whatsappNumber: document.getElementById('updWhatsappNumber') ? document.getElementById('updWhatsappNumber').value.trim() : "",
            facebookLink: document.getElementById('updFacebookLink') ? document.getElementById('updFacebookLink').value.trim() : "",
            presentAddress: document.getElementById('updPresentAddress') ? document.getElementById('updPresentAddress').value.trim() : "",
            permanentAddress: document.getElementById('updPermanentAddress') ? document.getElementById('updPermanentAddress').value.trim() : ""
          },
          infoApprovalStatus: "pending",
          infoActionAt: getTimeStamp()
        };

        try {
          await updateDoc(doc(db, "users", currentUser.uid), pendingDataPayload);
          alert("🔒 আপনার প্রোফাইলের তথ্য পরিবর্তনের আবেদনটি এডমিন প্যানেলে পৌঁছেছে। অনুমোদনের জন্য অপেক্ষা করুন।");
        } catch (err) {
          console.error(err);
          alert("দুঃখিত, তথ্য রিকোয়েস্ট সাবমিট হয়নি। আবার চেষ্টা করুন।");
        }
      }
      
      if(hiddenGalleryInput) hiddenGalleryInput.value = "";
      tempBase64Image = null;
    });
  }
                                      }
