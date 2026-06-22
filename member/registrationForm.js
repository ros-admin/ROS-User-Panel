// ডাউনলোড মেম্বারশিপ ফরম মডিউলের মূল ফাংশন
function loadDownloadFormModule(contentRoot, currentMemberData) {
  
  // ১. মেম্বার ডাটা ভেরিয়েবল এবং নিরাপদ ফলব্যাক ডিফাইন করা
  const m = currentMemberData || {};
  
  const mId = m.memberId || m.uid || 'PENDING';
  const regDate = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD');
  const bName = m.banglaName || '—';
  const eName = (m.englishName || m.fullName || 'MEMBER').toUpperCase();
  const fName = m.fatherName || '—';
  const mName = m.motherName || '—';
  const phone = m.phone || m.mobile || '—';
  const email = m.email || '—';
  const dob = m.dob || m.dateOfBirth || '—';
  const blood = m.bloodGroup || '—';
  const gender = m.gender || '—';
  const inst = m.institution || m.workplace || '—';
  const edu = m.educationalQualification || m.qualification || '—';
  const session = m.session || m.academicYear || '—';
  const curAddr = m.currentAddress || m.address || '—';
  const perAddr = m.permanentAddress || '—';
  const mType = m.memberType || m.role || 'সাধারণ সদস্য';

  const photoHtml = m.photoUrl || m.profileImageUrl ? 
    `<img src="${m.photoUrl || m.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : 
    `<div style="font-size: 10px; color: #777; padding-top: 40px; text-align:center;">ছবি পাওয়া যায়নি</div>`;

  // ২. ড্যাশবোর্ডের অফিশিয়াল সাইবার-ডার্ক ও নিয়ন থিম অনুযায়ী UI (প্রিভিউ সম্পূর্ণ বন্ধ)
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--accent); background: var(--card-bg); backdrop-filter: blur(16px);">
      <h2 style="font-size: 18px; color: var(--accent); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-gavel"></i> সদস্যপদ বহাল থাকার শর্তাবলী ও নীতিমালা
      </h2>
      <div style="font-size: 14px; color: var(--text-light); line-height: 1.8; background: rgba(5, 17, 36, 0.7); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(0, 245, 255, 0.08);">
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;"><strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সোসাইটির শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, <span style="color: var(--secondary);">রাজশাহী অলিম্পিয়াড সোসাইটি (ROS)</span> কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।</li>
          <li style="margin-bottom: 10px;"><strong>তথ্য সত্যতা:</strong> এই ফরমে এবং ডাটাবেজে প্রদত্ত আপনার সকল তথ্য সম্পূর্ণ সত্য ও সঠিক হতে হবে। ভুয়া বা অসত্য তথ্য প্রমাণিত হলে সদস্যপদ তাৎক্ষণিক বাতিল বলে গণ্য হবে।</li>
          <li style="margin-bottom: 10px;"><strong>সাংগঠনিক শৃঙ্খলা:</strong> সংগঠনের সকল সক্রিয় কার্যক্রম, প্রোটোকল, অভ্যন্তরীণ গঠনতন্ত্র এবং নীতি-নির্ধারকদের সিদ্ধান্ত মেনে চলা বাধ্যতামূলক।</li>
          <li style="margin-bottom: 0;"><strong>অ-রাজনৈতিক অবস্থান:</strong> সংগঠনের ভেতরে বা সংগঠনের নাম ব্যবহার করে কোনো প্রকার রাজনৈতিক বা উগ্রপন্থী এজেন্ডা প্রমোট করা সম্পূর্ণরূপে নিষিদ্ধ।</li>
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

    <div id="pdfRenderBufferContainer" style="display: none;"></div>
  `;

  // ৩. ⚙️ চেকবক্স কন্ট্রোল লজিক
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

  // 8. 📥 পিডিএফ জেনারেশন এক্সিকিউশন
  downloadBtn.addEventListener('click', async () => {
    if (!termsCheckbox.checked) return;

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> জেনারেট হচ্ছে...`;

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

      // লাইভ কারেন্ট টাইম স্ট্যাম্প জেনারেশন
      const now = new Date();
      const formattedTimeStr = `ডাউনলোড সময়: ${now.toLocaleDateString('bn-BD')} | সময়: ${now.toLocaleTimeString('bn-BD')}`;

      // রান-টাইমে ইন-মেমরি এ৪ এইচটিএমএল আর্কিটেকচার তৈরি করা
      const pdfBuffer = document.getElementById('pdfRenderBufferContainer');
      pdfBuffer.innerHTML = `
        <div id="actualTargetPaper" style="width: 595.28pt; height: 841.89pt; padding: 40pt; box-sizing: border-box; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', 'Arial', sans-serif; position: relative;">
          
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.03; font-size: 42px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; white-space: nowrap;">
            RAJSHAHI OLIMPIAD SOCIETY
          </div>

          <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 10px; margin-bottom: 18px;">
            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 55px; height: 55px; margin-bottom: 4px;">
            <h1 style="font-size: 18px; font-weight: 700; color: #0056b3; margin: 0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
            <p style="font-size: 9px; color: #555; margin: 1px 0 0 0; text-transform: uppercase; font-family: 'Arial'; letter-spacing: 1px;">Rajshahi Olympiad Society</p>
            <div style="display: inline-block; background: #0077b6; color: #fff; padding: 3px 12px; font-size: 10px; font-weight: bold; border-radius: 3px; margin-top: 6px;">সদস্য নিবন্ধন ফরম</div>
          </div>

          <div style="position: absolute; top: 115px; right: 40px; width: 90px; height: 105px; border: 1px dashed #0077b6; box-sizing: border-box; background: #fafafa; overflow:hidden;">
            ${photoHtml}
          </div>

          <div style="margin-bottom: 15px; font-size: 11px; line-height: 1.5;">
            <p style="margin: 2px 0;"><strong>সদস্য আইডি (ID):</strong> <span style="color: #0077b6; font-weight: bold; font-family:'Arial';">${mId}</span></p>
            <p style="margin: 2px 0;"><strong>নিবন্ধন নাম্বার:</strong> <span style="font-family:'Arial';">${m.registrationNo || mId}</span></p>
            <p style="margin: 2px 0;"><strong>নিবন্ধনের তারিখ:</strong> <span>${regDate}</span></p>
            <p style="margin: 2px 0;"><strong>সদস্যের ধরন:</strong> <span style="color: #0056b3; font-weight: bold;">${mType}</span></p>
          </div>

          <h3 style="font-size: 12px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin-bottom: 8px;">১. সদস্যের ব্যক্তিগত তথ্যাবলী (Personal Dossier)</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 15px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; width: 22%; background: #fcfcfc; font-weight: bold;">নাম (বাংলা):</td>
              <td style="padding: 6px; border: 1px solid #dddddd; width: 78%;" colspan="3">${bName}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">Name (English):</td>
              <td style="padding: 6px; border: 1px solid #dddddd;" colspan="3"><strong>${eName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">বাবার নাম:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; width: 28%;">${fName}</td>
              <td style="padding: 6px; border: 1px solid #dddddd; width: 22%; background: #fcfcfc; font-weight: bold;">মায়ের নাম:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; width: 28%;">${mName}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">মোবাইল নাম্বার:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; font-family:'Arial';">${phone}</td>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">ইমেইল এড্রেস:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; font-family:'Arial'; font-size:9.5px; white-space:nowrap;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">জন্মতারিখ:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; font-family:'Arial';">${dob}</td>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">রক্তের গ্রুপ:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; font-weight: bold; color: #d90429;">${blood}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">লিঙ্গ (Gender):</td>
              <td style="padding: 6px; border: 1px solid #dddddd;" colspan="3">${gender}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">প্রতিষ্ঠান/কর্মস্থল:</td>
              <td style="padding: 6px; border: 1px solid #dddddd;" colspan="3">${inst}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">শিক্ষাগত যোগ্যতা:</td>
              <td style="padding: 6px; border: 1px solid #dddddd;">${edu}</td>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">শিক্ষাবর্ষ:</td>
              <td style="padding: 6px; border: 1px solid #dddddd; font-family:'Arial';">${session}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">বর্তমান ঠিকানা:</td>
              <td style="padding: 6px; border: 1px solid #dddddd;" colspan="3">${curAddr}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #dddddd; background: #fcfcfc; font-weight: bold;">স্থায়ী ঠিকানা:</td>
              <td style="padding: 6px; border: 1px solid #dddddd;" colspan="3">${perAddr}</td>
            </tr>
          </table>

          <h3 style="font-size: 12px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin-bottom: 6px;">২. সদস্যপদ বহাল থাকার শর্তাবলী ও ঘোষণা</h3>
          <div style="font-size: 9.5px; line-height: 1.5; color: #222; text-align: justify; background: #f9f9f9; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 45px;">
            ১. <strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সংগঠনের শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।<br>
            ২. আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি অনলাইন ড্যাশবোর্ডের মাধ্যমে ডিজিটালভাবে এই সকল শর্তাবলীতে সম্মতি প্রদান করে এই মেম্বারশিপ কপিটি জেনারেট করেছি।
          </div>

          <div style="position: absolute; bottom: 70px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 11px;">
            <div style="text-align: center; width: 140px; margin-top: 35px;">
              <div style="border-top: 1px solid #333; padding-top: 4px;">আবেদনকারীর স্বাক্ষর</div>
            </div>
            
            <div style="text-align: center; width: 160px; position: relative;">
              <div style="font-family: 'Arial'; font-size: 11px; font-weight: bold; color: #2a9d8f; text-transform: uppercase; border: 2px dashed #2a9d8f; padding: 3px 8px; display: inline-block; margin-bottom: 5px; transform: rotate(-5deg); border-radius: 4px;">
                ✓ SIGNED VERIFIED
              </div>
              <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #0077b6; font-weight: bold;">কর্তৃপক্ষের স্বাক্ষর</div>
            </div>
          </div>

          <div style="position: absolute; bottom: 40px; left: 40px; right: 40px; text-align: center; font-size: 9px; color: #e63946; font-weight: bold; background: #fff5f5; padding: 4px; border: 1px dashed #e63946; border-radius: 4px;">
            * বিশেষ দ্রষ্টব্য: এটি একটি সিস্টেম জেনারেটেড ডিজিটাল ভেরিফাইড কপি। অনলাইন ডাটাবেজে যাচাইকরণের জন্য এতে কোনো সিল বা ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।
          </div>

          <div style="position: absolute; bottom: 15px; left: 40px; right: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #666; border-top: 1px solid #eee; padding-top: 5px;">
            <div>${formattedTimeStr}</div>
            <div style="font-weight: 600; color: #333;">Developed by: Utsab Sarker</div>
          </div>

        </div>
      `;

      // পিডিএফ টার্গেট ডক এক্সপোর্ট প্যারামিটার কনফিগারেশন
      const targetPaperNode = document.getElementById('actualTargetPaper');
      const filenameClean = eName.replace(/[^a-zA-Z0-9]/g, "_");

      const options = {
        margin:       0,
        filename:     `ROS_Form_${filenameClean}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true, 
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 595.28 // এ৪ ফরম্যাটের স্ট্যান্ডার্ড পিক্সেল উইডথ নিশ্চিত করা
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      // পিডিএফ ডাউনলোড সম্পন্ন করা
      await html2pdf().set(options).from(targetPaperNode).save();

    } catch (err) {
      console.error("PDF Core Engine Error:", err);
      alert("দুঃখিত, পিডিএফ ডাউনলোড ব্যর্থ হয়েছে। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।");
    } finally {
      // রেন্ডারিং শেষে বাফার খালি করা ও বাটন রিসেট
      document.getElementById('pdfRenderBufferContainer').innerHTML = "";
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন`;
    }
  });
}

// গ্লোবাল ড্যাশবোর্ডের জন্য স্কোপ এক্সপোর্ট
window.loadDownloadFormModule = loadDownloadFormModule;
