// ডাউনলোড মেম্বারশিপ ফরম মডিউলের মূল ফাংশন
function loadDownloadFormModule(contentRoot, currentMemberData) {
  
  // নিরাপদ ফলব্যাক ডাটা (যদি ডাটাবেজের কোনো ফিল্ড খালি থাকে)
  const member = currentMemberData || {};
  const banglaName = member.banglaName || member.fullName || '—';
  const englishName = member.englishName || member.fullName || 'MEMBER';
  const phoneNo = member.phone || member.mobile || '—';
  const emailId = member.email || '—';
  const blood = member.bloodGroup || '—';
  const inst = member.institution || member.designation || '—';
  const addr = member.address || '—';
  const mId = member.memberId || member.uid || 'ROS-PENDING';
  
  const regDate = member.createdAt ? 
    new Date(member.createdAt.seconds * 1000).toLocaleDateString('bn-BD') : 
    new Date().toLocaleDateString('bn-BD');

  const photoHtml = member.photoUrl || member.profileImageUrl ? 
    `<img src="${member.photoUrl || member.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : 
    `<span style="font-size: 10px; color: #888; padding: 5px; text-align:center; display:block; margin-top:35px;">ছবি নেই</span>`;

  // ১. ড্যাশবোর্ডের অফিশিয়াল সাইবার-ডার্ক ও নিয়ন থিম অনুযায়ী UI ডিজাইন (কোনো প্রিভিউ ছাড়া)
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

    <div style="position: absolute; left: -9999px; top: -9999px;">
      <div id="hiddenRegistrationFormPaper" style="width: 595.28pt; height: 841.89pt; padding: 45pt; box-sizing: border-box; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', 'Arial', sans-serif; position: relative;">
        
        <div style="position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.03; font-size: 45px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; white-space: nowrap;">
          RAJSHAHI OLIMPIAD SOCIETY
        </div>

        <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 12px; margin-bottom: 25px;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 60px; height: 60px; margin-bottom: 5px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #0056b3; margin: 0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
          <p style="font-size: 10px; color: #555; margin: 2px 0 0 0; text-transform: uppercase; font-family: 'Arial'; letter-spacing: 1px;">Rajshahi Olympiad Society</p>
          <div style="display: inline-block; background: #0077b6; color: #fff; padding: 4px 15px; font-size: 11px; font-weight: bold; border-radius: 3px; margin-top: 8px;">সদস্য নিবন্ধন ফরম</div>
        </div>

        <div style="position: absolute; top: 125px; right: 45px; width: 95px; height: 115px; border: 1px dashed #0077b6; box-sizing: border-box; background: #fafafa; overflow:hidden;">
          ${photoHtml}
        </div>

        <div style="margin-bottom: 25px; font-size: 12.5px; line-height: 1.6;">
          <p style="margin: 2px 0;"><strong>সদস্য আইডি (ID):</strong> <span style="color: #0077b6; font-weight: bold; font-family:'Arial';">${mId}</span></p>
          <p style="margin: 2px 0;"><strong>নিবন্ধন তারিখ:</strong> <span>${regDate}</span></p>
          <p style="margin: 2px 0;"><strong>স্ট্যাটাস:</strong> <span style="color: #2a9d8f; font-weight: bold;">সক্রিয় (Verified Copy)</span></p>
        </div>

        <h3 style="font-size: 14px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 10px; padding-bottom: 1px;">১. ব্যক্তিগত বিবরণ (Personal Information)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; width: 28%; background: #fcfcfc; font-weight: bold;">পূর্ণ নাম (বাংলা):</td>
            <td style="padding: 8px; border: 1px solid #cccccc; width: 72%;">${banglaName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">পূর্ণ নাম (English):</td>
            <td style="padding: 8px; border: 1px solid #cccccc; font-weight: 600; text-transform: uppercase;">${englishName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">মোবাইল নম্বর:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${phoneNo}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">ইমেইল অ্যাড্রেস:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${emailId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">রক্তের গ্রুপ:</td>
            <td style="padding: 8px; border: 1px solid #cccccc; font-weight: bold; color: #d90429;">${blood}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">শিক্ষা প্রতিষ্ঠান/পদবী:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${inst}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">বর্তমান ঠিকানা:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${addr}</td>
          </tr>
        </table>

        <h3 style="font-size: 14px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 10px; padding-bottom: 1px;">২. সদস্যপদ বহাল থাকার শর্তাবলী ও ঘোষণা</h3>
        <div style="font-size: 10.5px; line-height: 1.6; color: #222; text-align: justify; background: #f9f9f9; padding: 12px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 50px;">
          ১. <strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সংগঠনের শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।<br>
          ২. আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য। সংগঠনের সম্মান ও ভাবমূর্তি ক্ষুণ্ন হয় এমন কোনো কার্যক্রমের সাথে আমি নিজেকে সম্পৃক্ত করব না। আমি অনলাইন ড্যাশবোর্ডের মাধ্যমে ডিজিটালভাবে এই শর্তাবলীতে সম্মতি প্রদান করে এই কপিটি জেনারেট করেছি।
        </div>

        <div style="position: absolute; bottom: 70px; left: 45px; right: 45px; display: flex; justify-content: space-between; font-size: 11.5px;">
          <div style="text-align: center; width: 140px;">
            <div style="border-top: 1px solid #333; padding-top: 4px; margin-top: 30px;">আবেদনকারীর স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 160px;">
            <div style="color: #0077b6; font-weight: bold; margin-bottom: 2px;">ডিজিটালভাবে স্বীকৃত কপি</div>
            <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #555;">সেন্ট্রাল অথরিটি অনুমোদন</div>
          </div>
        </div>

        <div style="position: absolute; bottom: 20px; left: 45px; right: 45px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #666; border-top: 1px solid #eee; padding-top: 6px;">
          <div id="pdfLiveDownloadTimeNode">ডাউনলোড সময়: —</div>
          <div style="font-weight: 600; color: #444;">Developed by: Utsab Sarker</div>
        </div>

      </div>
    </div>
  `;

  // ২. ⚙️ শর্তাবলী চেক বক্স লিসেনার (লক/আনলক লজিক)
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

  // ৩. 📥 বাটন ট্রিগার এবং এ৪ ফুল-পেজ ফিক্সড পিডিএফ এক্সপোর্ট লজিক
  downloadBtn.addEventListener('click', async () => {
    if (!termsCheckbox.checked) {
      alert("দয়া করে প্রথমে শর্তাবলীতে টিক দিয়ে সম্মতি জ্ঞাপন করুন।");
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ফাইল প্রসেসিং হচ্ছে...`;

    try {
      // html2pdf স্ক্রিপ্ট লোড করা নিশ্চিত করা
      if (typeof html2pdf === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // ডাউনলোড করার বর্তমান রিয়েল-টাইম তারিখ ও সময় ফুটারে পুশ করা
      const now = new Date();
      const liveTimeString = `ডাউনলোড সময়: ${now.toLocaleDateString('bn-BD')} | সময়: ${now.toLocaleTimeString('bn-BD')}`;
      document.getElementById('pdfLiveDownloadTimeNode').innerText = liveTimeString;

      const element = document.getElementById('hiddenRegistrationFormPaper');
      const filenameClean = englishName.replace(/[^a-zA-Z0-9]/g, "_");

      // 🎯 ছবি এক কোনায় চলে যাওয়ার বাগটি ফিক্স করার জন্য html2canvas-এর scrollX/scrollY এবং window width নির্দিষ্ট করা হয়েছে
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
          windowWidth: 595.28
        },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      // পিডিএফ জেনারেশন এবং অটো ডাউনলোড ট্রিগার
      await html2pdf().set(options).from(element).save();

    } catch (err) {
      console.error("PDF Core Engine Error:", err);
      alert("দুঃখিত, পিডিএফ ডাউনলোড ব্যর্থ হয়েছে। পেজটি রিলোড করে পুনরায় চেষ্টা করুন।");
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন`;
    }
  });
}

// গ্লোবাল ড্যাশবোর্ডের জন্য স্কোপ এক্সপোর্ট
window.loadDownloadFormModule = loadDownloadFormModule;
