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
    `<span style="font-size: 10px; color: #888; padding: 5px; text-align:center; display:block; margin-top:35px;">পাসপোর্ট সাইজ ছবি</span>`;

  // ১. ড্যাশবোর্ডের থিমে প্রিভিউ স্ক্রিন এবং অ্যাকশন এরিয়া তৈরি
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 18px; color: #fff;"><i class="fas fa-file-invoice"></i> আপনার ডিজিটাল রেজিস্ট্রেশন ফরম</h2>
      <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">নিচে ফরমের প্রিভিউ দেখে যাচাই করুন এবং অফিশিয়াল কপিটি সংরক্ষণ করতে ডাউনলোড বাটনে ক্লিক করুন।</p>
    </div>

    <div style="width: 100%; overflow-x: auto; background: rgba(0,0,0,0.2); padding: 20px 0; border-radius: 8px; display: flex; justify-content: center; margin-bottom: 25px; border: 1px dashed var(--glass-border);">
      
      <div id="registrationFormPaperTemplate" style="width: 595px; min-width: 595px; height: 842px; padding: 45px; box-sizing: border-box; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', 'Arial', sans-serif; position: relative; border: 3px double #0077b6; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.04; font-size: 42px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; white-space: nowrap;">
          RAJSHAHI OLIMPIAD SOCIETY
        </div>

        <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 12px; margin-bottom: 25px;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 60px; height: 60px; margin-bottom: 5px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #0056b3; margin: 0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
          <p style="font-size: 10px; color: #555; margin: 2px 0 0 0; text-transform: uppercase; font-family: 'Arial', sans-serif; letter-spacing: 1px;">Rajshahi Olympiad Society</p>
          <div style="display: inline-block; background: #0077b6; color: #fff; padding: 3px 14px; font-size: 11px; font-weight: bold; border-radius: 3px; margin-top: 8px;">সদস্য নিবন্ধন ফরম</div>
        </div>

        <div style="position: absolute; top: 120px; right: 45px; width: 95px; height: 110px; border: 1px dashed #0077b6; box-sizing: border-box; background: #fafafa; overflow:hidden;">
          ${photoHtml}
        </div>

        <div style="margin-bottom: 25px; font-size: 12.5px; line-height: 1.6;">
          <p style="margin: 2px 0;"><strong>সদস্য আইডি (ID):</strong> <span style="color: #0077b6; font-weight: bold; font-family:'Arial';">${mId}</span></p>
          <p style="margin: 2px 0;"><strong>নিবন্ধন তারিখ:</strong> <span>${regDate}</span></p>
          <p style="margin: 2px 0;"><strong>স্ট্যাটাস:</strong> <span style="color: #2a9d8f; font-weight: bold;">অনলাইন ভেরিফাইড (Active)</span></p>
        </div>

        <h3 style="font-size: 13.5px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 10px; padding-bottom: 1px;">১. ব্যক্তিগত বিবরণ (Personal Details)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 25px; background: transparent;">
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
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">প্রতিষ্ঠান/পদবী:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${inst}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cccccc; background: #fcfcfc; font-weight: bold;">বর্তমান ঠিকানা:</td>
            <td style="padding: 8px; border: 1px solid #cccccc;">${addr}</td>
          </tr>
        </table>

        <h3 style="font-size: 13.5px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 10px; padding-bottom: 1px;">২. ঘোষণা ও অঙ্গীকারনামা</h3>
        <div style="font-size: 11px; line-height: 1.5; color: #222; text-align: justify; background: #f9f9f9; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 50px;">
          আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি রাজশাহী অলিম্পিয়াড सोसाइटीর (ROS) সকল নিয়ম-কানুন, প্রোটোকল এবং সাংগঠনিক আদর্শ মেনে চলবো। সংগঠনের সম্মান ও ভাবমূর্তি ক্ষুণ্ন হয় এমন কোনো কার্যক্রমের সাথে আমি নিজেকে সম্পৃক্ত করবো না।
        </div>

        <div style="position: absolute; bottom: 65px; left: 45px; right: 45px; display: flex; justify-content: space-between; font-size: 11.5px;">
          <div style="text-align: center; width: 140px;">
            <div style="border-top: 1px solid #333; padding-top: 4px; margin-top: 30px;">আবেদনকারীর স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 160px;">
            <div style="color: #0077b6; font-weight: bold; margin-bottom: 2px;">অনলাইন ভেরিফাইড কপি</div>
            <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #555;">সেন্ট্রাল অথরিটি অনুমোদন</div>
          </div>
        </div>

        <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 9px; color: #777; border-top: 1px solid #eee; padding-top: 5px;">
          এটি একটি সিস্টেম জেনারেটেড অনলাইন কপি। কোনো ম্যানুয়াল স্বাক্ষর বা সিলের প্রয়োজন নেই। | © Rajshahi Olympiad Society
        </div>

      </div>
    </div>

    <div class="cyber-glass" style="padding: 15px; border-radius: 8px; text-align: center;">
      <button class="cyber-btn" id="triggerPdfDownloadBtn" style="max-width: 280px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px;">
        <i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন
      </button>
    </div>
  `;

  // ২. পিডিএফ ডাউনলোড এক্সিকিউশন লজিক
  document.getElementById('triggerPdfDownloadBtn').addEventListener('click', async () => {
    const downloadBtn = document.getElementById('triggerPdfDownloadBtn');
    
    // লোডিং স্টেট সেট করা
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> পিডিএফ ফাইল তৈরি হচ্ছে...`;

    try {
      // যদি html2pdf স্ক্রিপ্ট লাইব্রেরিটি গ্লোবাল মেমরিতে না থাকে তবে ডাইনামিকালি ইমপোর্ট করা
      if (typeof html2pdf === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // ভিউপোর্টে দৃশ্যমান আসল ফরম পেপার এলিমেন্টটি টার্গেট করা
      const element = document.getElementById('registrationFormPaperTemplate');
      const filenameClean = englishName.replace(/[^a-zA-Z0-9]/g, "_");

      // নিখুঁত ১ পাতার আনকাট প্রিন্টিং কনফিগারেশন সেটআপ
      const options = {
        margin:       0, 
        filename:     `ROS_Reg_Form_${filenameClean}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      // পিডিএফ জেনারেশন প্রসেস এবং অটোমেটিক ব্রাউজার ডাউনলোড ট্রিগার
      await html2pdf().set(options).from(element).save();

    } catch (err) {
      console.error("PDF Core Engine Error:", err);
      alert("দুঃখিত, আপনার ব্রাউজারে পিডিএফ জেনারেট করা সম্ভব হয়নি। অনুগ্রহ করে পেজটি রিলোড করে পুনরায় চেষ্টা করুন।");
    } finally {
      // বাটন আগের অবস্থায় ফিরিয়ে নেওয়া
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-file-download"></i> পিডিএফ ফরম ডাউনলোড করুন`;
    }
  });
}

// গ্লোবাল ড্যাশবোর্ড যেন ফাইল রিড করতে পারে তাই উইন্ডো এক্সপোর্ট
window.loadDownloadFormModule = loadDownloadFormModule;
