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

  // ১. ড্যাশবোর্ডের থিমে মূল কন্টেন্ট (শর্তাবলী প্যানেল ও লাইভ প্রিভিউ) তৈরি
  contentRoot.innerHTML = `
    <!-- 📜 মেম্বারশিপ শর্তাবলী প্যানেল -->
    <div class="cyber-glass" style="padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-yellow);">
      <h2 style="font-size: 18px; color: var(--neon-yellow); margin-bottom: 15px;">
        <i class="fas fa-gavel"></i> সদস্যপদ বহাল থাকার শর্তাবলী ও নীতিমালা
      </h2>
      <div style="font-size: 13px; color: #e5e7eb; line-height: 1.7; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid rgba(255,183,3,0.2);">
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;"><strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সোসাইটির শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।</li>
          <li style="margin-bottom: 8px;"><strong>তথ্য সত্যতা:</strong> এই ফরমে এবং ডাটাবেজে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক হতে হবে। ভুয়া বা অসত্য তথ্য প্রমাণিত হলে সদস্যপদ তাৎক্ষণিক বাতিল হবে।</li>
          <li style="margin-bottom: 8px;"><strong>সাংগঠনিক শৃঙ্খলা:</strong> সংগঠনের সকল সক্রিয় কার্যক্রম, প্রোটোকল, অভ্যন্তরীণ গঠনতন্ত্র এবং নীতি-নির্ধারকদের সিদ্ধান্ত মেনে চলা বাধ্যতামূলক।</li>
          <li style="margin-bottom: 0;"><strong>অ-রাজনৈতিক অবস্থান:</strong> সংগঠনের ভেতরে কোনো প্রকার রাজনৈতিক বা উগ্রপন্থী এজেন্ডা প্রমোট করা সম্পূর্ণরূপে নিষিদ্ধ।</li>
        </ol>
      </div>

      <!-- 🔐 টিকবক্স কন্ট্রোল -->
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: #fff;">
        <input type="checkbox" id="acceptTermsCheckbox" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--neon-blue);">
        আমি উপরোক্ত সকল শর্তাবলী ও নীতিমালা মনোযোগ সহকারে পড়েছি এবং তা মেনে চলতে বাধ্য থাকব।
      </label>
    </div>

    <!-- 📥 ডাউনলোড বাটন কন্ট্রোল এরিয়া -->
    <div class="cyber-glass" style="padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
      <button class="cyber-btn" id="triggerPdfDownloadBtn" disabled style="max-width: 280px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0.4; cursor: not-allowed; background: gray;">
        <i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন
      </button>
    </div>

    <!-- 📄 ব্যাকগ্রাউন্ড এ ৪ পেপার কন্টেইনার (এটিই পিডিএফ হবে, যেখানে শর্তগুলো প্রিন্ট হবে) -->
    <div style="width: 100%; overflow-x: auto; background: rgba(0,0,0,0.1); padding: 10px 0; border-radius: 8px; display: flex; justify-content: center; opacity: 0.8;">
      <div id="registrationFormPaperTemplate" style="width: 595px; min-width: 595px; height: 842px; padding: 40px; box-sizing: border-box; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', 'Arial', sans-serif; position: relative; border: 3px double #0077b6; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
        
        <!-- ওয়াটারমার্ক ব্যাকগ্রাউন্ড -->
        <div style="position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.03; font-size: 42px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; white-space: nowrap;">
          RAJSHAHI OLIMPIAD SOCIETY
        </div>

        <!-- হেডার -->
        <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 10px; margin-bottom: 20px;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 55px; height: 55px; margin-bottom: 5px;">
          <h1 style="font-size: 18px; font-weight: 700; color: #0056b3; margin: 0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
          <p style="font-size: 9px; color: #555; margin: 2px 0 0 0; text-transform: uppercase; font-family: 'Arial';">Rajshahi Olympiad Society</p>
          <div style="display: inline-block; background: #0077b6; color: #fff; padding: 3px 12px; font-size: 10px; font-weight: bold; border-radius: 3px; margin-top: 5px;">সদস্য নিবন্ধন ফরম</div>
        </div>

        <!-- মেম্বার ফটো বক্স -->
        <div style="position: absolute; top: 110px; right: 40px; width: 90px; height: 105px; border: 1px dashed #0077b6; box-sizing: border-box; background: #fafafa; overflow:hidden;">
          ${photoHtml}
        </div>

        <!-- মেম্বার আইডি ও মেটা -->
        <div style="margin-bottom: 20px; font-size: 12px; line-height: 1.5;">
          <p style="margin: 2px 0;"><strong>সদস্য আইডি (ID):</strong> <span style="color: #0077b6; font-weight: bold; font-family:'Arial';">${mId}</span></p>
          <p style="margin: 2px 0;"><strong>নিবন্ধন তারিখ:</strong> <span>${regDate}</span></p>
          <p style="margin: 2px 0;"><strong>স্ট্যাটাস:</strong> <span style="color: #2a9d8f; font-weight: bold;">সক্রিয় (Verified Copy)</span></p>
        </div>

        <!-- ডাটা টেবিল গ্রিড -->
        <h3 style="font-size: 13px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 8px; padding-bottom: 1px;">১. ব্যক্তিগত বিবরণ (Personal Information)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; width: 28%; background: #fcfcfc; font-weight: bold;">পূর্ণ নাম (বাংলা):</td>
            <td style="padding: 6px; border: 1px solid #cccccc; width: 72%;">${banglaName}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">পূর্ণ নাম (English):</td>
            <td style="padding: 6px; border: 1px solid #cccccc; font-weight: 600; text-transform: uppercase;">${englishName}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">মোবাইল নম্বর:</td>
            <td style="padding: 6px; border: 1px solid #cccccc;">${phoneNo}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">ইমেইল অ্যাড্রেস:</td>
            <td style="padding: 6px; border: 1px solid #cccccc;">${emailId}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">রক্তের গ্রুপ:</td>
            <td style="padding: 6px; border: 1px solid #cccccc; font-weight: bold; color: #d90429;">${blood}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">শিক্ষা প্রতিষ্ঠান/পদবী:</td>
            <td style="padding: 6px; border: 1px solid #cccccc;">${inst}</td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">বর্তমান ঠিকানা:</td>
            <td style="padding: 6px; border: 1px solid #cccccc;">${addr}</td>
          </tr>
        </table>

        <!-- 📜 পিডিএফে শর্তাবলী সংযুক্তি -->
        <h3 style="font-size: 13px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 8px; padding-bottom: 1px;">২. সদস্যপদ বহাল থাকার শর্তাবলী ও ঘোষণা</h3>
        <div style="font-size: 10px; line-height: 1.5; color: #222; text-align: justify; background: #f9f9f9; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 45px;">
          ১. <strong>কর্তৃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সংগঠনের শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।<br>
          ২. আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য। সংগঠনের সম্মান ক্ষুণ্ন হয় এমন কোনো কার্যক্রমের সাথে আমি নিজেকে সম্পৃক্ত করব না। আমি অনলাইন ড্যাশবোর্ডের মাধ্যমে এই শর্তাবলী ডিজিটালভাবে মেনে নিয়ে ফরমটি ডাউনলোড করেছি।
        </div>

        <!-- স্বাক্ষর এরিয়া -->
        <div style="position: absolute; bottom: 60px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 11px;">
          <div style="text-align: center; width: 140px;">
            <div style="border-top: 1px solid #333; padding-top: 4px; margin-top: 25px;">আবেদনকারীর স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 160px;">
            <div style="color: #0077b6; font-weight: bold; margin-bottom: 2px;">ডিজিটালভাবে স্বীকৃত কপি</div>
            <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #555;">সেন্ট্রাল অথরিটি অনুমোদন</div>
          </div>
        </div>

        <!-- ফুটার নোটিশ -->
        <div style="position: absolute; bottom: 15px; left: 0; right: 0; text-align: center; font-size: 8.5px; color: #777; border-top: 1px solid #eee; padding-top: 5px;">
          এটি একটি সিস্টেম জেনারেটেড অনলাইন কপি। ডিজিটাল টার্মস অ্যাকসেপ্টেড। | © Rajshahi Olympiad Society
        </div>

      </div>
    </div>
  `;

  // ২. ⚙️ টিকবক্স চেক অ্যান্ড আনলক লজিক
  const termsCheckbox = document.getElementById('acceptTermsCheckbox');
  const downloadBtn = document.getElementById('triggerPdfDownloadBtn');

  termsCheckbox.addEventListener('change', function() {
    if (this.checked) {
      // টিক দিলে বাটন একটিভ হবে এবং সাইবার স্টাইল ফিরে আসবে
      downloadBtn.disabled = false;
      downloadBtn.style.opacity = "1";
      downloadBtn.style.cursor = "pointer";
      downloadBtn.style.background = "var(--neon-blue)";
    } else {
      // টিক তুলে নিলে বাটন আবার লক হয়ে যাবে
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = "0.4";
      downloadBtn.style.cursor = "not-allowed";
      downloadBtn.style.background = "gray";
    }
  });

  // ৩. 📥 পিডিএফ জেনারেশন এবং অটোমেটিক ডাউনলোড লজিক
  downloadBtn.addEventListener('click', async () => {
    // নিরাপত্তা রি-চেক (যদি কেউ ইন্সপেক্ট উপাদান দিয়ে বাটন একটিভ করতে চায়)
    if (!termsCheckbox.checked) {
      alert("দয়া করে প্রথমে শর্তাবলীতে টিক দিয়ে সম্মতি জ্ঞাপন করুন।");
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> প্রসেসিং হচ্ছে...`;

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

      const element = document.getElementById('registrationFormPaperTemplate');
      const filenameClean = englishName.replace(/[^a-zA-Z0-9]/g, "_");

      const options = {
        margin:       0,
        filename:     `ROS_Form_${filenameClean}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(element).save();

    } catch (err) {
      console.error("PDF Core Engine Error:", err);
      alert("দুঃখিত, পিডিএফ জেনারেট করা সম্ভব হয়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।");
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন`;
    }
  });
}

// গ্লোবাল ড্যাশবোর্ডের জন্য এক্সপোর্ট উইন্ডো স্কোপ
window.loadDownloadFormModule = loadDownloadFormModule;
