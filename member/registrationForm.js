// ডাউনলোড মেম্বারশিপ ফরম মডিউলের মূল ফাংশন
function loadDownloadFormModule(contentRoot, currentMemberData) {
  // ১. মডিউল ভিউপোর্টে একটি প্রিভিউ এবং ডাউনলোড বাটন লোড করা
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue); text-align: center;">
      <i class="fas fa-file-pdf" style="font-size: 50px; color: var(--neon-blue); margin-bottom: 15px; text-shadow: 0 0 15px rgba(0,180,216,0.4);"></i>
      <h2 style="font-size: 20px; color: #fff;">অফিশিয়াল সদস্য নিবন্ধন ফরম</h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px; margin-bottom: 20px;">আপনার রাজশাহী অলিম্পিয়াড সোসাইটির ডিজিটাল মেম্বারশিপ ডাটা ভেরিফাইড এক পাতার ফরমে ডাউনলোড করুন।</p>
      
      <button class="cyber-btn" id="triggerPdfDownloadBtn" style="max-width: 250px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px;">
        <i class="fas fa-cloud-download-alt"></i> ফরম ডাউনলোড করুন
      </button>
    </div>

    <div id="hiddenRegistrationTemplate" style="position: absolute; left: -9999px; top: -9999px;">
      <div style="width: 595px; height: 842px; padding: 40px; box-sizing: border-box; background: #ffffff; color: #000000; font-family: 'Hind Siliguri', sans-serif; position: relative; border: 4px double #0077b6;">
        
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.04; font-size: 70px; font-weight: bold; color: #000; text-align: center; width: 100%; pointer-events: none; letter-spacing: 2px;">
          RAJSHAHI OLIMPIAD SOCIETY
        </div>

        <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 15px; margin-bottom: 25px;">
          <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 65px; height: 65px; margin-bottom: 8px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #0056b3; margin: 0; letter-spacing: 0.5px;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
          <p style="font-size: 11px; color: #555; margin: 3px 0 0 0; text-transform: uppercase; font-family: 'Orbitron', sans-serif;">Rajshahi Olympiad Society</p>
          <div style="display: inline-block; background: #0077b6; color: #fff; padding: 4px 15px; font-size: 12px; font-weight: bold; border-radius: 3px; margin-top: 10px;">সদস্য নিবন্ধন ফরম</div>
        </div>

        <div style="position: absolute; top: 125px; right: 40px; width: 100px; height: 115px; border: 1px dashed #0077b6; text-align: center; box-sizing: border-box; background: #fdfdfd; display: flex; align-items: center; justify-content: center;">
          ${currentMemberData.photoUrl || currentMemberData.profileImageUrl ? 
            `<img src="${currentMemberData.photoUrl || currentMemberData.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : 
            `<span style="font-size: 9px; color: #888; padding: 5px;">পাসপোর্ট সাইজ ছবি</span>`
          }
        </div>

        <div style="margin-bottom: 25px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>সদস্য আইডি (ID):</strong> <span style="font-family: 'Orbitron', sans-serif; color: #0077b6; font-weight: bold;">${currentMemberData.memberId || currentMemberData.uid || 'N/A'}</span></p>
          <p style="margin: 4px 0;"><strong>নিবন্ধন তারিখ:</strong> <span>${currentMemberData.createdAt ? new Date(currentMemberData.createdAt.seconds * 1000).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD')}</span></p>
          <p style="margin: 4px 0;"><strong>স্ট্যাটাস:</strong> <span style="color: green; font-weight: bold;">সক্রিয় (Active)</span></p>
        </div>

        <h3 style="font-size: 14px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 12px; padding-bottom: 2px;">১. ব্যক্তিগত বিবরণ (Personal Information)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; width: 30%; background: #f9f9f9; font-weight: bold;">পূর্ণ নাম (বাংলা):</td>
            <td style="padding: 8px; border: 1px solid #ddd; width: 70%;">${currentMemberData.banglaName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">পূর্ণ নাম (English):</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: 500; text-transform: uppercase;">${currentMemberData.englishName || currentMemberData.fullName || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">মোবাইল নম্বর:</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-family: 'Orbitron', sans-serif;">${currentMemberData.phone || currentMemberData.mobile || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">ইমেইল অ্যাড্রেস:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${currentMemberData.email || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">রক্তের গ্রুপ:</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #d90429;">${currentMemberData.bloodGroup || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">শিক্ষা প্রতিষ্ঠান/পদবী:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${currentMemberData.institution || currentMemberData.designation || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">বর্তমান ঠিকানা:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${currentMemberData.address || '—'}</td>
          </tr>
        </table>

        <h3 style="font-size: 14px; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 8px; margin-bottom: 12px; padding-bottom: 2px;">২. ঘোষণা ও অঙ্গীকারনামা</h3>
        <div style="font-size: 11.5px; line-height: 1.6; color: #333; text-align: justify; background: #fcfcfc; padding: 12px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 60px;">
          আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি রাজশাহী অলিম্পিয়াড সোসাইটির (ROS) সকল নিয়ম-কানুন, প্রোটোকল এবং সাংগঠনিক আদর্শ মেনে চলবো। সংগঠনের সম্মান ও ভাবমূর্তি ক্ষুণ্ন হয় এমন কোনো কার্যক্রমের সাথে আমি নিজেকে সম্পৃক্ত করবো না।
        </div>

        <div style="position: absolute; bottom: 60px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 12px;">
          <div style="text-align: center; width: 150px;">
            <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 30px;">আবেদনকারীর স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="font-family: 'Galada', cursive; color: #0077b6; margin-bottom: -5px; font-size: 14px;">অনলাইন ভেরিফাইড</div>
            <div style="border-top: 1px solid #0077b6; padding-top: 5px; color: #0077b6; font-weight: bold;">কর্তৃপক্ষের অনুমোদন</div>
          </div>
        </div>

        <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 9px; color: #888; border-top: 1px solid #eee; padding-top: 5px;">
          এটি একটি সিস্টেম জেনারেটেড ডিজিটাল কপি। কোনো সিল বা ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই। | © Rajshahi Olympiad Society
        </div>

      </div>
    </div>
  `;

  // ২. 📥 ডাউনলোড বাটনের অ্যাকশন এবং PDF মেকিং লজিক
  document.getElementById('triggerPdfDownloadBtn').addEventListener('click', async () => {
    const downloadBtn = document.getElementById('triggerPdfDownloadBtn');
    
    // বাটন লোডিং স্টেট অ্যানিমেশন
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> পিডিএফ জেনারেট হচ্ছে...`;

    // html2pdf লাইব্রেরি ব্রাউজারে আগে থেকে লোড করা না থাকলে ডাইনামিকালি লোড করা
    if (typeof html2pdf === 'undefined') {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    const element = document.getElementById('hiddenRegistrationTemplate');
    
    // ১ পাতার প্রিন্ট অপ্টিমাইজড কনফিগারেশন সেটআপ
    const options = {
      margin:       0,
      filename:     `ROS_Registration_Form_${currentMemberData.englishName || 'Member'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };

    // ফ্যামিলি মেথড ব্যবহার করে ফাইল জেনারেশন এবং সাথে সাথে ডাউনলোড ট্রিগার করা
    html2pdf().set(options).from(element).save().then(() => {
      // বাটন রিসেট স্টেট
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-cloud-download-alt"></i> ফরম ডাউনলোড করুন`;
    }).catch((err) => {
      console.error("PDF Download Error: ", err);
      alert("দুঃখিত, পিডিএফ ডাউনলোড করার সময় একটি কারিগরি ত্রুটি ঘটেছে।");
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<i class="fas fa-cloud-download-alt"></i> ফরম ডাউনলোড করুন`;
    });
  });
}

// গ্লোবাল উইন্ডো স্কোপে মেথড এক্সপোর্ট
window.loadDownloadFormModule = loadDownloadFormModule;

