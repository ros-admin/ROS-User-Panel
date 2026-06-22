// ডাউনলোড মেম্বারশিপ ফরম মডিউলের মূল ফাংশন
function loadDownloadFormModule(contentRoot, currentMemberData) {
  
  // ১. ফায়ারবেস ডেটাবেজ স্ট্রাকচার ম্যাপিং (1000363601.jpg রেফারেন্স অনুযায়ী)
  const m = currentMemberData || {};
  
  const mId = m.memberId || m.uid || '—';
  const regNo = m.registrationNo || mId; // নিবন্ধন নাম্বার হিসেবে ব্যবহৃত
  const regDate = m.createdAt ? new Date(m.createdAt).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD');
  
  const bName = m.banglaName || '—';
  const eName = (m.englishName || m.fullName || 'MEMBER').toUpperCase();
  const fName = m.fatherName || '—';
  const mName = m.motherName || '—';
  const phone = m.mobileNumber || m.phone || '—';
  const email = m.email || '—';
  const dob = m.dob || m.dateOfBirth || '—';
  const blood = m.bloodGroup || '—';
  const gender = m.gender === 'Female' ? 'মহিলা' : (m.gender === 'Male' ? 'পুরুষ' : m.gender || '—');
  const prof = m.profession || '—'; // ফায়ারবেস থেকে পেশা ডেটা রিড
  
  const inst = m.institution || m.workplace || '—';
  const edu = m.education || m.educationalQualification || '—';
  const session = m.academicYear || m.session || '—';
  
  const curAddr = m.presentAddress || m.currentAddress || '—';
  const perAddr = m.permanentAddress || '—';
  const mType = m.role === 'general_member' ? 'সাধারণ সদস্য' : (m.role || 'সদস্য');

  const photoHtml = m.photoUrl || m.profileImageUrl ? 
    `<img src="${m.photoUrl || m.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : 
    `<div style="font-size: 10px; color: #777; padding-top: 40px; text-align:center;">ছবি নেই</div>`;

  // ২. ড্যাশবোর্ডের মূল অফিশিয়াল থিম অনুযায়ী UI
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--accent); background: var(--card-bg); backdrop-filter: blur(16px);">
      <h2 style="font-size: 18px; color: var(--accent); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-gavel"></i> সদস্যপদ বহাল থাকার শর্তাবলী ও নীতিমালা
      </h2>
      <div style="font-size: 14px; color: var(--text-light); line-height: 1.8; background: rgba(5, 17, 36, 0.7); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(0, 245, 255, 0.08);">
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;"><strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ক্ষমতা সংরক্ষণ করে।</li>
          <li style="margin-bottom: 10px;"><strong>তথ্য সত্যতা:</strong> এই ফরমে এবং ডাটাবেজে প্রদত্ত আপনার সকল তথ্য সম্পূর্ণ সত্য ও সঠিক হতে হবে। ভুয়া তথ্য প্রমাণিত হলে সদস্যপদ তাৎক্ষণিক বাতিল বলে গণ্য হবে।</li>
        </ol>
      </div>

      <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: var(--text-light); user-select: none;">
        <input type="checkbox" id="acceptTermsCheckbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--secondary);">
        আমি উপরোক্ত সকল শর্তাবলী ও নীতিমালা মনোযোগ সহকারে পড়েছি এবং তা মেনে চলতে বাধ্য থাকব।
      </label>
    </div>

    <div class="cyber-glass" style="padding: 20px; border-radius: 12px; text-align: center; background: var(--card-bg);">
      <button class="cyber-btn" id="triggerPdfDownloadBtn" disabled style="max-width: 300px; width: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0.3; cursor: not-allowed; background: #334155; color: #94a3b8; border: 1px solid transparent;">
        <i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন
      </button>
    </div>

    <!-- 🖨️ ইন-মেমরি ডাইনামিক রেন্ডারিং বাফার কন্টেইনার -->
    <div id="pdfRenderBufferContainer" style="display: none;"></div>
  `;

  // ৩. লক/আনলক ইন্টারেকশন কন্ট্রোল
  const termsCheckbox = document.getElementById('acceptTermsCheckbox');
  const downloadBtn = document.getElementById('triggerPdfDownloadBtn');

  termsCheckbox.addEventListener('change', function() {
    if (this.checked) {
      downloadBtn.disabled = false;
      downloadBtn.style.opacity = "1";
      downloadBtn.style.cursor = "pointer";
      downloadBtn.style.background = "var(--secondary)";
      downloadBtn.style.color = "#030a16";
      downloadBtn.style.boxShadow = "0 0 20px rgba(0, 245, 255, 0.4)";
    } else {
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = "0.3";
      downloadBtn.style.cursor = "not-allowed";
      downloadBtn.style.background = "#334155";
      downloadBtn.style.color = "#94a3b8";
      downloadBtn.style.boxShadow = "none";
    }
  });

  // ৪. পিডিএফ জেনারেশন এবং লেআউট অপ্টিমাইজেশন
  downloadBtn.addEventListener('click', async () => {
    if (!termsCheckbox.checked) return;

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ফাইল তৈরি হচ্ছে...`;

    try {
      if (typeof html2pdf === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const now = new Date();
      const formattedTimeStr = `ডাউনলোড সময়: ${now.toLocaleDateString('bn-BD')} | সময়: ${now.toLocaleTimeString('bn-BD')}`;

      // A4 উইডথ অনুযায়ী ডাইনামিক পেপার রেন্ডারিং
      const pdfBuffer = document.getElementById('pdfRenderBufferContainer');
      pdfBuffer.innerHTML = `
        <div id="actualTargetPaper" style="width: 535pt; height: 760pt; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', 'Arial', sans-serif; position: relative; box-sizing: border-box; padding: 25pt; border: 2.5pt double #0077b6; overflow: hidden;">
          
          <!-- ওয়াটারমার্ক ব্যাকগ্রাউন্ড -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.03; font-size: 38px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; white-space: nowrap; z-index: 1;">
            RAJSHAHI OLIMPIAD SOCIETY
          </div>

          <!-- অফিশিয়াল হেডার এবং আন্ডারলাইন টান -->
          <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 8px; margin-bottom: 15px; position: relative; z-index: 2;">
            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 50px; height: 50px; margin-bottom: 2px;">
            <h1 style="font-size: 17px; font-weight: 700; color: #0056b3; margin: 0; padding: 0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
            <p style="font-size: 8.5px; color: #555; margin: 1px 0 0 0; text-transform: uppercase; font-family: 'Arial'; letter-spacing: 0.5px;">Rajshahi Olympiad Society</p>
            <div style="display: inline-block; background: #0077b6; color: #fff; padding: 2px 10px; font-size: 9.5px; font-weight: bold; border-radius: 3px; margin-top: 5px;">সদস্য নিবন্ধন ফরম</div>
          </div>

          <!-- প্রোফাইল ফটো বক্স (টানের নিচে এবং টেবিলের ঠিক উপরে ডান কোণায় সেট করা) -->
          <div style="position: absolute; top: 110px; right: 25pt; width: 85px; height: 100px; border: 1px dashed #0077b6; box-sizing: border-box; background: #fafafa; overflow:hidden; z-index: 10;">
            ${photoHtml}
          </div>

          <!-- বেসিক ট্র্যাকিং মেটা ডাটা (সংশোধিত) -->
          <div style="margin-bottom: 15px; font-size: 10px; line-height: 1.6; position: relative; z-index: 2;">
            <p style="margin: 2px 0;"><strong>নিবন্ধন নাম্বার:</strong> <span style="color: #0077b6; font-weight: bold; font-family:'Arial';">${regNo}</span></p>
            <p style="margin: 2px 0;"><strong>নিবন্ধনের তারিখ:</strong> <span>${regDate}</span></p>
            <p style="margin: 2px 0;"><strong>সদস্যের ধরন:</strong> <span style="color: #0056b3; font-weight: bold;">${mType}</span></p>
          </div>

          <!-- ফ্লেক্সিবল ও ফিট ওয়ান-পেজ গ্রিড টেবিল -->
          <h3 style="font-size: 11px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin-bottom: 6px; padding-bottom: 1px; position: relative; z-index: 2;">১. সদস্যের বিস্তারিত তথ্যাবলী</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 12px; position: relative; z-index: 2;">
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 18%; background: #fcfcfc; font-weight: bold;">নাম (বাংলা):</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 82%;" colspan="3">${bName}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">Name (English):</td>
              <td style="padding: 5px; border: 1px solid #cccccc;" colspan="3"><strong>${eName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">বাবার নাম:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 32%;">${fName}</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 16%; background: #fcfcfc; font-weight: bold;">মায়ের নাম:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 34%;">${mName}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">মোবাইল নম্বর:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; font-family:'Arial';">${phone}</td>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">ইমেইল এড্রেস:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; font-family:'Arial'; font-size: 8.5px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">জন্মতারিখ:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; font-family:'Arial';">${dob}</td>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">রক্তের গ্রুপ:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; font-weight: bold; color: #d90429;">${blood}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">লিঙ্গ:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 32%;">${gender}</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 16%; background: #fcfcfc; font-weight: bold;">পেশা:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; width: 34%;">${prof}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">প্রতিষ্ঠান/কর্মস্থল:</td>
              <td style="padding: 5px; border: 1px solid #cccccc;" colspan="3">${inst}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">শিক্ষাগত যোগ্যতা:</td>
              <td style="padding: 5px; border: 1px solid #cccccc;">${edu}</td>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">শিক্ষাবর্ষ:</td>
              <td style="padding: 5px; border: 1px solid #cccccc; font-family:'Arial';">${session}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">বর্তমান ঠিকানা:</td>
              <td style="padding: 5px; border: 1px solid #cccccc;" colspan="3">${curAddr}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">স্থায়ী ঠিকানা:</td>
              <td style="padding: 5px; border: 1px solid #cccccc;" colspan="3">${perAddr}</td>
            </tr>
          </table>

          <!-- শর্তাবলী বক্স -->
          <h3 style="font-size: 11px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin-bottom: 5px; position: relative; z-index: 2;">২. সদস্যপদ বহাল থাকার শর্তাবলী ও ঘোষণা</h3>
          <div style="font-size: 8.5px; line-height: 1.4; color: #222; text-align: justify; background: #f9f9f9; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 30px; position: relative; z-index: 2;">
            ১. <strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সংগঠনের শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।<br>
            ২. আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি অনলাইন ড্যাশবোর্ডের মাধ্যমে ডিজিটালভাবে এই সকল শর্তাবলীতে সম্মতি প্রদান করে এই মেম্বারশিপ কপিটি জেনারেট করেছি।
          </div>

          <!-- স্বাক্ষর জোন -->
          <div style="margin-top: 15px; display: flex; justify-content: space-between; font-size: 9.5px; padding: 0 5px; position: relative; z-index: 2;">
            <div style="text-align: center; width: 130px; margin-top: 25px;">
              <div style="border-top: 1px solid #333; padding-top: 4px;">আবেদনকারীর স্বাক্ষর</div>
            </div>
            
            <div style="text-align: center; width: 150px; position: relative;">
              <div style="font-family: 'Arial'; font-size: 9px; font-weight: bold; color: #2a9d8f; text-transform: uppercase; border: 2px dashed #2a9d8f; padding: 2px 6px; display: inline-block; margin-bottom: 4px; transform: rotate(-4deg); border-radius: 4px; background: #fff;">
                ✓ SIGNED VERIFIED
              </div>
              <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #0077b6; font-weight: bold;">কর্তৃপক্ষের স্বাক্ষর</div>
            </div>
          </div>

          <!-- সিস্টেম জেনারেটেড নোটিশ নোট -->
          <div style="text-align: center; font-size: 8px; color: #e63946; font-weight: bold; background: #fff5f5; padding: 4px; border: 1px dashed #e63946; border-radius: 4px; margin-top: 20px; position: relative; z-index: 2;">
            * বিশেষ দ্রষ্টব্য: এটি একটি সিস্টেম জেনারেটেড ডিজিটাল ভেরিফাইড কপি। অনলাইন ডাটাবেজে রিয়েল-টাইম ভেরিফিকেশনের ব্যবস্থা থাকায় এতে কোনো ম্যানুয়াল স্বাক্ষর বা সিলের প্রয়োজন নেই।
          </div>

          <!-- 📊 ৪ কোণায় ফিটড রিয়েলটাইম ফুটার (বর্ডারের একদম ঠিক উপরে প্লেস করা হয়েছে) -->
          <div style="position: absolute; bottom: 10pt; left: 25pt; right: 25pt; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #666; border-top: 1px solid #eee; padding-top: 5px; z-index: 5;">
            <div>${formattedTimeStr}</div>
            <div style="font-weight: 600; color: #333;">Developed by: Utsab Sarker</div>
          </div>

        </div>
      `;

      // পিডিএফ কনফিগারেশন প্যারামিটার
      const targetPaperNode = document.getElementById('actualTargetPaper');
      const filenameClean = eName.replace(/[^a-zA-Z0-9]/g, "_");

      const options = {
        margin:       [30, 30, 30, 30],
        filename:     `ROS_Form_${filenameClean}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true, 
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      // পিডিএফ ডাউনলোড সম্পন্ন করা
      await html2pdf().set(options).from(targetPaperNode).save();

    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("পিডিএফ ফাইল তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      document.getElementById('pdfRenderBufferContainer').innerHTML = "";
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন`;
    }
  });
}

// গ্লোবাল ড্যাশবোর্ডের জন্য স্কোপ এক্সপোর্ট
window.loadDownloadFormModule = loadDownloadFormModule;
        
