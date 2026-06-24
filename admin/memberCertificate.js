
/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Features: Multi-lingual (BN/EN), Auto-suggest Search, Firestore Serial Generator, html2pdf.js Direct Download
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // মডিউলের মূল ইউজার ইন্টারফেস (UI)
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #d4af37;">
            <h2 style="color: #d4af37; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-crown"></i> প্রিমিয়াম মেম্বারশিপ সার্টিফিকেট প্যানেল
            </h2>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                সদস্যের নাম টাইপ করা শুরু করলে অটোমেটিক ফিল্টার হবে। ভাষা নির্বাচন করে ইউনিক সার্টিফিকেট নাম্বার সহ জেনারেট করুন।
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="সদস্যের নাম বা আইডি লিখুন..." 
                           style="width: 100%; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <div style="min-width: 150px;">
                    <select id="certLangSelect" style="width: 100%; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px; border-radius: 6px; color: #fff; font-size: 14px;">
                        <option value="bn">🎯 বাংলা সংস্করণ</option>
                        <option value="en">🇬🇧 English Version</option>
                    </select>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #d4af37, #aa7c11); color: #030712; padding: 11px 25px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                    <i class="fas fa-gem"></i> সার্টিফিকেট তৈরি করুন
                </button>
            </div>
            
            <div id="selectedMemberBadge" style="display: none; color: #d4af37; font-size: 13px; background: rgba(212, 175, 55, 0.1); padding: 6px 12px; border-radius: 4px; display: inline-block;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.4); padding: 10px 20px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="downloadCertBtn" style="background: #059669; color: #fff; padding: 8px 22px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-download"></i> সরাসরি PDF ডাউনলোড করুন
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.2); color: var(--neon-red); border: 1px solid var(--neon-red); padding: 8px 22px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    বন্ধ করুন
                </button>
            </div>

            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

            <div id="certificatePaperFrame" style="width: 1120px; height: 792px; background: #ffffff; color: #1c1c1c; box-sizing: border-box; padding: 50px; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); border-radius: 2px;">
                <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box;">
                    </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 10px 15px; color: #fff; cursor: pointer; font-size: 13.5px; transition: 0.2s; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #b38600; color: #030712; font-weight: bold; }
        </style>
    `;

    // html2pdf 라이브러리 동적 로드 체크
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // এলিমেন্টসমূহ টার্গেটিং
    const searchInput = document.getElementById('certSearchInput');
    const suggestionsDiv = document.getElementById('certSuggestions');
    const langSelect = document.getElementById('certLangSelect');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    const certDynamicBody = document.getElementById('certDynamicBody');
    const badge = document.getElementById('selectedMemberBadge');

    let allMembers = [];
    let selectedMember = null;
    let currentCertNumber = ""; 

    // ১. ইনিশিয়াল ডাটা লোড
    async function initModuleData() {
        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            allMembers = [];
            snapshot.forEach(s => {
                allMembers.push({ uid: s.id, ...s.data() });
            });
        } catch (err) {
            console.error("Error loading members for auto-complete:", err);
        }
    }
    initModuleData();

    // ২. অটোমেটিক লাইভ ফিল্টারিং লজিক
    searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = "";
        
        if (!value) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const filtered = allMembers.filter(m => {
            const bName = (m.banglaName || "").toLowerCase();
            const eName = (m.englishName || m.fullName || "").toLowerCase();
            return bName.includes(value) || eName.includes(value) || m.uid.toLowerCase().includes(value);
        });

        if (filtered.length > 0) {
            filtered.slice(0, 6).forEach(m => {
                const name = m.banglaName || m.englishName || m.fullName || "সদস্য";
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${name} (${m.uid.substring(0, 8).toUpperCase()})`;
                div.addEventListener('click', () => {
                    selectedMember = m;
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                    badge.style.display = 'inline-block';
                    badge.innerHTML = `<strong>✔ নির্বাচিত:</strong> ${name} | ID: ${m.uid.substring(0,10)}`;
                });
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== searchInput) suggestionsDiv.style.display = 'none';
    });

    // ৩. ইউনিক ক্রমিক ভিত্তিক সার্টিফিকেট আইডি জেনারেটর (ROS-MCS-0001 থেকে শুরু)
    async function issueCertificateNumber(memberUid, lang) {
        try {
            const certRef = collection(db, "issued_certificates");
            const qSnapshot = await getDocs(query(certRef));
            const totalCount = qSnapshot.size;
            
            // সিরিয়াল নাম্বার প্যাডিং লজিক (যেমন: ROS-MCS-0001, ROS-MCS-0002)
            const nextSerial = String(totalCount + 1).padStart(4, '0');
            const certNo = `ROS-MCS-${nextSerial}`;
            
            await addDoc(certRef, {
                certificateNo: certNo,
                userId: memberUid,
                language: lang,
                issuedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
            });
            
            return certNo;
        } catch (e) {
            console.error("Serial Generator Error:", e);
            return "ROS-MCS-" + Math.floor(1000 + Math.random() * 9000);
        }
    }

    // ৪. সার্টিফিকেট জেনারেট এবং ভিউ রেন্ডারিং লজিক
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("অনুগ্রহ করে সাজেস্টেড ড্রপডাউন থেকে একজন সদস্য সিলেক্ট করুন!");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ডাটাবেজ প্রসেস হচ্ছে...`;

        try {
            const lang = langSelect.value;
            currentCertNumber = await issueCertificateNumber(selectedMember.uid, lang);
            const today = new Date();

            // মেম্বার আইডি ফরম্যাটিং
            const displayMemberId = selectedMember.memberId || `ROS-2026-${String(allMembers.indexOf(selectedMember) + 1).padStart(4, '0')}`;

            // ব্যাকগ্রাউন্ড ওয়াটারমার্ক এবং ফ্রেমের কমন এইচটিএমএল স্ট্রাকচার
            const sharedLayoutStart = `
                <div style="width: 100%; height: 100%; border: 3px solid #d4af37; position: relative; box-sizing: border-box; padding: 8px;">
                    <div style="width: 100%; height: 100%; border: 1px solid #aa7c11; position: relative; box-sizing: border-box; padding: 35px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                        
                        <div style="position: absolute; width: 40px; height: 40px; border-color: #d4af37; border-style: solid; top: 0; left: 0; border-width: 6px 0 0 6px;"></div>
                        <div style="position: absolute; width: 40px; height: 40px; border-color: #d4af37; border-style: solid; top: 0; right: 0; border-width: 6px 6px 0 0;"></div>
                        <div style="position: absolute; width: 40px; height: 40px; border-color: #d4af37; border-style: solid; bottom: 0; left: 0; border-width: 0 0 6px 6px;"></div>
                        <div style="position: absolute; width: 40px; height: 40px; border-color: #d4af37; border-style: solid; bottom: 0; right: 0; border-width: 0 6px 6px 0;"></div>

                        <div style="position: absolute; color: rgba(212, 175, 55, 0.07); font-weight: bold; font-size: 75px; top: 12%; left: 10%; transform: rotate(-15deg); pointer-events: none; font-family: 'Montserrat';">&pi;</div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.07); font-weight: bold; font-size: 68px; bottom: 22%; left: 7%; transform: rotate(10deg); pointer-events: none; font-family: 'Montserrat';">&Sigma;</div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.07); font-weight: bold; font-size: 95px; top: 18%; right: 9%; transform: rotate(15deg); pointer-events: none; font-family: 'Montserrat';">&int;</div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.07); font-weight: bold; font-size: 85px; bottom: 32%; right: 11%; transform: rotate(-10deg); pointer-events: none; font-family: 'Montserrat';">&radic;</div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.05); font-size: 80px; top: 42%; left: 14%; pointer-events: none;"><i class="fas fa-atom"></i></div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.05); font-size: 65px; bottom: 12%; left: 22%; pointer-events: none;"><i class="fas fa-book-open"></i></div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.05); font-size: 70px; top: 38%; right: 16%; pointer-events: none;"><i class="fas fa-binoculars"></i></div>
                        <div style="position: absolute; color: rgba(212, 175, 55, 0.05); font-size: 60px; bottom: 12%; right: 26%; pointer-events: none;"><i class="fas fa-lightbulb"></i></div>

                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 440px; opacity: 0.035; pointer-events: none;" />
            `;

            const sharedLayoutEnd = `
                    </div>
                </div>
            `;

            if (lang === 'bn') {
                // 🎯 সম্পূর্ণ বাংলা টেমপ্লেট
                const বাংলাতারিখ = today.toLocaleDateString('bn-BD');
                
                certDynamicBody.innerHTML = `
                    ${sharedLayoutStart}
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 70px; height: 70px; margin-bottom: 2px;">
                        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #1e293b; letter-spacing: 2px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 10px; font-weight: 700; color: #aa7c11; letter-spacing: 3px; text-transform: uppercase; margin: 0;">সিস্টেম কন্ট্রোল ও এন্টারপ্রাইজ নেটওয়ার্ক</p>
                    </div>

                    <div style="text-align: center; width: 100%;">
                        <h2 style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; color: #aa7c11; margin: 0 0 8px 0;">মেম্বারশিপ সার্টিফিকেট</h2>
                        <p style="font-family: 'Great Vibes', cursive; font-size: 25px; color: #64748b; margin: 0 0 12px 0;">এই মর্মে অত্যন্ত নিষ্ঠার সাথে প্রত্যয়ন করা যাচ্ছে যে,</p>
                        <div style="font-family: 'Hind Siliguri', sans-serif; font-size: 30px; font-weight: 700; color: #0284c7; border-bottom: 2px dotted #d4af37; display: inline-block; padding-bottom: 5px; min-width: 420px;">
                            ${selectedMember.banglaName || selectedMember.fullName}
                        </div>
                        <p style="font-size: 14px; color: #334155; line-height: 1.7; max-width: 760px; margin: 20px auto 0 auto; font-family: 'Hind Siliguri';">
                            তিনি সফলভাবে সকল নিয়মাবলী সম্পন্ন করে <strong>রাজশাহী অলিম্পিয়াড সোসাইটি</strong>-এর একজন অফিশিয়াল নিবন্ধিত আজীবন মেম্বার হিসেবে আমাদের এন্টারপ্রাইজ নেটওয়ার্কে অন্তর্ভুক্ত হয়েছেন।
                        </p>
                    </div>

                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Hind Siliguri';">
                        <div style="display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #334155; text-align: left;">
                            <div><strong>সার্টিফিকেট নং:</strong> <span style="color: #aa7c11; font-weight: bold;">${currentCertNumber}</span></div>
                            <div><strong>সদস্য আইডি:</strong> <span style="font-weight: 600;">${displayMemberId}</span></div>
                            <div><strong>ইস্যুর তারিখ:</strong> <span style="font-weight: 600;">${বাংলাতারিখ}</span></div>
                        </div>

                        <div style="display: flex; align-items: flex-end; justify-content: space-between; width: 730px;">
                            <div style="text-align: center; width: 200px;">
                                <div style="height: 45px;"></div> 
                                <div style="border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 13px; font-weight: 700; color: #1e293b;">সাধারণ সম্পাদক</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">রাজশাহী অলিম্পিয়াড সোসাইটি</div>
                            </div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; width: 250px;">
                                <div style="border: 2px solid #d4af37; padding: 4px; background: #fff; border-radius: 6px;">
                                    <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 75px; height: 75px; display: block;" />
                                </div>
                                <div style="font-size: 9px; color: #64748b; text-align: center; line-height: 1.3; max-width: 200px; font-weight: 600;">
                                    সার্টিফিকেট স্ক্যান করার জন্য এটা ভেরিফাই করতে হবে
                                </div>
                            </div>

                            <div style="text-align: center; width: 200px;">
                                <div style="height: 45px;"></div>
                                <div style="border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 13px; font-weight: 700; color: #1e293b;">সভাপতি</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">রাজশাহী অলিম্পিয়াড সোসাইটি</div>
                            </div>
                        </div>
                    </div>
                    ${sharedLayoutEnd}
                `;
            } else {
                    // 🇬🇧 সম্পূর্ণ ইংরেজি টেমপ্লেট
                const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const enRole = selectedMember.role === 'general_member' ? 'GENERAL MEMBER' : (selectedMember.role ? selectedMember.role.toUpperCase() : 'OFFICIAL MEMBER');

                certDynamicBody.innerHTML = `
                    ${sharedLayoutStart}
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 70px; height: 70px; margin-bottom: 2px;">
                        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #1e293b; letter-spacing: 2px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 10px; font-weight: 700; color: #aa7c11; letter-spacing: 3px; text-transform: uppercase; margin: 0;">System Control & Enterprise Network</p>
                    </div>

                    <div style="text-align: center; width: 100%;">
                        <h2 style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; color: #aa7c11; margin: 0 0 8px 0;">Certificate of Membership</h2>
                        <p style="font-family: 'Great Vibes', cursive; font-size: 25px; color: #64748b; margin: 0 0 12px 0;">This is to officially certify that</p>
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 30px; font-weight: 700; color: #0284c7; border-bottom: 2px dotted #d4af37; display: inline-block; padding-bottom: 5px; min-width: 420px; text-transform: uppercase;">
                            ${selectedMember.englishName || selectedMember.fullName || "Official Member"}
                        </div>
                        <p style="font-size: 14px; color: #334155; line-height: 1.7; max-width: 760px; margin: 20px auto 0 auto;">
                            has been successfully registered as an official corporate <strong>${enRole}</strong> of Rajshahi Olympiad Society. Their contribution and profile status are fully recorded in our enterprise station.
                        </p>
                    </div>

                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Montserrat';">
                        <div style="display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #334155; text-align: left;">
                            <div><strong>Certificate No:</strong> <span style="color: #aa7c11; font-weight: bold;">${currentCertNumber}</span></div>
                            <div><strong>Member ID:</strong> <span style="font-weight: 600;">${displayMemberId}</span></div>
                            <div><strong>Date of Issue:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                        </div>

                        <div style="display: flex; align-items: flex-end; justify-content: space-between; width: 730px;">
                            <div style="text-align: center; width: 200px;">
                                <div style="height: 45px;"></div>
                                <div style="border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 13px; font-weight: 700; color: #1e293b;">General Secretary</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Rajshahi Olympiad Society</div>
                            </div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; width: 250px;">
                                <div style="border: 2px solid #d4af37; padding: 4px; background: #fff; border-radius: 6px;">
                                    <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 75px; height: 75px; display: block;" />
                                </div>
                                <div style="font-size: 9px; color: #64748b; text-align: center; line-height: 1.3; max-width: 200px; font-weight: 600;">
                                    সার্টিফিকেট স্ক্যান করার জন্য এটা ভেরিফাই করতে হবে
                                </div>
                            </div>

                            <div style="text-align: center; width: 200px;">
                                <div style="height: 45px;"></div>
                                <div style="border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 13px; font-weight: 700; color: #1e293b;">President</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Rajshahi Olympiad Society</div>
                            </div>
                        </div>
                    </div>
                    ${sharedLayoutEnd}
                `;
            }

            previewZone.style.display = 'flex';
            previewZone.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert("সার্টিফিকেট জেনারেট এবং নাম্বার সেভ করতে ট্রাবল হয়েছে!");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-gem"></i> সার্টিফিকেট তৈরি করুন`;
        }
    });

    // ৫. প্রম্পটলেস ওয়ান-ক্লিক পিডিএফ এক্সপোর্ট ইঞ্জিন (ফাঁকা স্পেস সমস্যা চিরতরে দূরীকৃত)
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetFrame = document.getElementById('certificatePaperFrame');
        
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2,           // ক্রিস্পি ও শার্প প্রিন্টিং টেক্সটের জন্য
                useCORS: true,      // ক্লাউড ও রিমোট সার্ভারের লোগো লোড করতে
                logging: false 
            },
            jsPDF:        { 
                unit: 'px', 
                format: [1120, 792], // A4 ল্যান্ডস্কেপের উইডথ ও হাইট পিক্সেল রেশিও লকড
                orientation: 'landscape' 
            }
        };

        // কোনো প্রিন্ট উইন্ডো ওপেন না করে সরাসরি ডাউনলোড হবে
        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetFrame).save();
        } else {
            alert("পিডিএফ ইঞ্জিন লোড হচ্ছে, অনুগ্রহ করে ২ সেকেন্ড পর আবার ক্লিক করুন।");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
