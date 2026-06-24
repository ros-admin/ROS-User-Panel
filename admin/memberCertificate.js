/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Features: Multi-lingual (BN/EN), Auto-suggest Search, Firestore Serial Generator
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
            
            <!-- ফিল্টার ও কনফিগারেশন এরিয়া -->
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <!-- অটো-সাজেস্ট সার্চ বক্স -->
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="সদস্যের নাম বা আইডি লিখুন..." 
                           style="width: 100%; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <!-- লাইভ সাজেশন ড্রপডাউন -->
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <!-- ভাষা সিলেকশন -->
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

        <!-- 🖼️ লাইভ প্রিভিউ এবং অ্যাকশন বোর্ড জোন -->
        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.4); padding: 10px 20px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="printCertBtn" style="background: #059669; color: #fff; padding: 8px 22px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-print"></i> প্রিন্ট / PDF ডাউনলোড
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.2); color: var(--neon-red); border: 1px solid var(--neon-red); padding: 8px 22px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    বন্ধ করুন
                </button>
            </div>

            <!-- 📄 আল্ট্রা প্রিমিয়াম মেম্বারশিপ সার্টিফিকেট ফ্রেম (A4 ল্যান্ডস্কেপ) -->
            <div id="certificatePaperFrame" class="premium-cert-print-node" style="width: 842px; height: 595px; background: #fffcf2; color: #1c1c1c; box-sizing: border-box; padding: 45px; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.7); border-radius: 2px;">
                
                <!-- লাক্সারি ডাবল বর্ডার এবং কর্নার ডিজাইন -->
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 4px double #cc9933; box-sizing: border-box; pointer-events: none;"></div>
                <div style="position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 1px solid #dfb76c; box-sizing: border-box; pointer-events: none;"></div>
                
                <!-- কর্নার লাক্সারি অর্নামেন্টস সিমুলেশন -->
                <div style="position: absolute; top: 22px; left: 22px; width: 25px; height: 25px; border-top: 4px solid #aa7c11; border-left: 4px solid #aa7c11;"></div>
                <div style="position: absolute; top: 22px; right: 22px; width: 25px; height: 25px; border-top: 4px solid #aa7c11; border-right: 4px solid #aa7c11;"></div>
                <div style="position: absolute; bottom: 22px; left: 22px; width: 25px; height: 25px; border-bottom: 4px solid #aa7c11; border-left: 4px solid #aa7c11;"></div>
                <div style="position: absolute; bottom: 22px; right: 22px; width: 25px; height: 25px; border-bottom: 4px solid #aa7c11; border-right: 4px solid #aa7c11;"></div>

                <!-- ওয়াটারমার্ক ব্যাকগ্রাউন্ড -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.035; width: 320px; height: 320px; background: url('https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png') no-repeat center center; background-size: contain; pointer-events: none;"></div>

                <!-- ইনার বডি ডায়নামিক কন্টেন্ট -->
                <div id="certDynamicBody" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; box-sizing: border-box; padding: 15px 10px;">
                    <!-- ল্যাঙ্গুয়েজ সুইচারের মাধ্যমে এই অংশটি জাভাস্ক্রিপ্ট দ্বারা নিয়ন্ত্রিত হবে -->
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 10px 15px; color: #fff; cursor: pointer; font-size: 13.5px; transition: 0.2s; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #b38600; color: #030712; font-weight: bold; }
            @media print {
                body *, .top-bar, .sidebar-nav, .cyber-glass, button, style, #certSuggestions { visibility: hidden !important; box-shadow: none !important; }
                .premium-cert-print-node, .premium-cert-print-node * { visibility: visible !important; }
                .premium-cert-print-node { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; border: none !important; margin: 0 !important; padding: 45px !important; box-sizing: border-box !important; }
                @page { size: A4 landscape; margin: 0; }
            }
        </style>
    `;

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

    // ১. ইনিশিয়াল ডাটা লোড (অটো-ফিল্টারিং এর জন্য সমস্ত মেম্বার একবারে আনা হচ্ছে)
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

    // ২. অটোমেটিক লাইভ ফিল্টারিং লজিক (Input Event Listener)
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
            filtered.slice(0, 6).forEach(m => { // টপ ৬ টি রেজাল্ট দেখাবে
                const name = m.banglaName || m.englishName || m.fullName || "সদস্য";
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${name} (${m.uid.substring(0, 8).toUpperCase()})`;
                div.addEventListener('click', () => {
                    selectedMember = m;
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                    badge.style.display = 'inline-block';
                    badge.innerHTML = `<strong>নির্বাচিত:</strong> ${name} | ID: ${m.uid.substring(0,10)}`;
                });
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });

    // মডাল এরিয়ার বাইরে ক্লিক করলে সাজেশন হাইড হবে
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput) suggestionsDiv.style.display = 'none';
    });

    // ৩. ইউনিক সার্টিফিকেট আইডি জেনারেটর এবং ফায়ারবেস নতুন কালেকশনে সেভিং মেকানিজম
    async function issueCertificateNumber(memberUid, lang) {
        const certNo = "ROS-" + Math.floor(100000 + Math.random() * 900000); // যেমন: ROS-583920
        
        // ফায়ারবেসের আলাদা কালেকশন 'issued_certificates'-এ ডাটা যুক্ত হবে
        await addDoc(collection(db, "issued_certificates"), {
            certificateNo: certNo,
            userId: memberUid,
            language: lang,
            issuedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
        });
        
        return certNo;
    }

    // ৪. সার্টিফিকেট জেনারেট এবং ভিউ রেন্ডারিং লজিক
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("অনুগ্রহ করে সাজেস্টেড ড্রপডাউন থেকে একজন সদস্য সিলেক্ট করুন!");

        generateBtn.disabled = true;
        generateBtn.innerText = "সার্টিফিকেট নাম্বার তৈরি হচ্ছে...";

        try {
            const lang = langSelect.value;
            const certNumber = await issueCertificateNumber(selectedMember.uid, lang);
            const today = new Date();

            if (lang === 'bn') {
                // 🎯 সম্পূর্ণ বাংলা টেমপ্লেট
                const বাংলাতারিখ = today.toLocaleDateString('bn-BD');
                const বাংলাআইডি = selectedMember.memberId || selectedMember.uid.substring(0, 8).toUpperCase();
                
                certDynamicBody.innerHTML = `
                    <div>
                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 55px; height: 55px; margin-bottom: 5px;">
                        <h1 style="font-size: 25px; font-weight: 800; color: #111827; margin: 0; letter-spacing: 1px; font-family: 'Arial';">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #b38600; margin-top: 3px; font-weight: bold;">সিস্টেম কন্ট্রোল ও এন্টারপ্রাইজ নেটওয়ার্ক</p>
                    </div>

                    <div>
                        <h2 style="font-family: 'Galada', cursive; font-size: 44px; color: #aa7c11; margin: 5px 0;">মেম্বারশিপ সার্টিফিকেট</h2>
                        <p style="font-size: 16px; color: #4b5563; font-style: italic;">এই মর্মে অত্যন্ত নিষ্ঠার সাথে প্রত্যয়ন করা যাচ্ছে যে,</p>
                        <h3 style="font-size: 28px; font-weight: bold; color: #0284c7; margin: 12px 0; border-bottom: 2px dashed #cc9933; display: inline-block; padding: 0 30px;">${selectedMember.banglaName || selectedMember.fullName}</h3>
                        <p style="font-size: 15px; color: #1f2937; max-width: 640px; line-height: 1.8; margin: 0 auto;">
                            তিনি সফলভাবে সকল নিয়মাবলী সম্পন্ন করে <span style="font-weight: bold;">রাজশাহী অলিম্পিয়াড সোসাইটি</span>-এর একজন অফিশিয়াল নিবন্ধিত আজীবন মেম্বার হিসেবে আমাদের এন্টারপ্রাইজ নেটওয়ার্কে অন্তর্ভুক্ত হয়েছেন।
                        </p>
                    </div>

                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 25px; box-sizing: border-box;">
                        <div style="text-align: left; font-size: 13px; color: #4b5563; line-height: 1.6;">
                            <p style="margin: 2px 0;"><strong>সার্টিফিকেট নং:</strong> <span style="color: #aa7c11; font-weight: bold;">${certNumber}</span></p>
                            <p style="margin: 2px 0;"><strong>সদস্য আইডি:</strong> <span style="color: #111827;">${বাংলাআইডি}</span></p>
                            <p style="margin: 2px 0;"><strong>ইস্যুর তারিখ:</strong> ${বাংলাতারিখ}</p>
                        </div>
                        <div style="text-align: center; width: 160px; position: relative;">
                            <div style="position: absolute; top: -30px; left: -10px; border: 2px dashed #059669; color: #059669; font-size: 9px; font-weight: bold; padding: 2px 5px; transform: rotate(-10deg); background: #fffcf2;">ভেরিফাইড মেম্বার</div>
                            <div style="border-top: 1.5px solid #4b5563; padding-top: 5px; width: 100%;">
                                <p style="font-weight: bold; color: #111827; font-size: 13px; margin: 0;">সেন্ট্রাল অথরিটি</p>
                                <p style="font-size: 11px; color: #6b7280;">রাজশাহী অলিম্পিয়াড সোসাইটি</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 🇬🇧 সম্পূর্ণ ইংরেজি টেমপ্লেট
                const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const enId = selectedMember.uid.substring(0, 8).toUpperCase();
                const enRole = selectedMember.role === 'general_member' ? 'GENERAL MEMBER' : (selectedMember.role ? selectedMember.role.toUpperCase() : 'OFFICIAL MEMBER');

                certDynamicBody.innerHTML = `
                    <div>
                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 55px; height: 55px; margin-bottom: 5px;">
                        <h1 style="font-size: 26px; font-weight: 900; color: #111827; margin: 0; letter-spacing: 1.5px; font-family: 'Arial';">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #b38600; margin-top: 3px; font-weight: bold;">System Control & Enterprise Network</p>
                    </div>

                    <div>
                        <h2 style="font-family: 'Times New Roman', serif; font-size: 38px; color: #aa7c11; font-weight: bold; font-style: italic; margin: 5px 0; letter-spacing: 1px;">Certificate of Membership</h2>
                        <p style="font-size: 14px; color: #4b5563; font-style: italic; margin-top: 8px;">This is to officially certify that</p>
                        <h3 style="font-size: 26px; font-weight: bold; color: #0284c7; margin: 12px 0; border-bottom: 2px dashed #cc9933; display: inline-block; padding: 0 30px; font-family: 'Arial';">${(selectedMember.englishName || selectedMember.fullName || "Official Member").toUpperCase()}</h3>
                        <p style="font-size: 14px; color: #1f2937; max-width: 620px; line-height: 1.7; margin: 0 auto; font-family: 'Georgia', serif;">
                            has been successfully registered as an official corporate <span style="font-weight: bold;">${enRole}</span> of Rajshahi Olympiad Society. Their contribution and profile status are fully recorded in our enterprise station.
                        </p>
                    </div>

                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 25px; box-sizing: border-box; font-family: 'Arial';">
                        <div style="text-align: left; font-size: 12px; color: #4b5563; line-height: 1.6;">
                            <p style="margin: 2px 0;"><strong>Certificate No:</strong> <span style="color: #aa7c11; font-weight: bold;">${certNumber}</span></p>
                            <p style="margin: 2px 0;"><strong>Member ID:</strong> <span style="color: #111827;">${selectedMember.memberId || enId}</span></p>
                            <p style="margin: 2px 0;"><strong>Date of Issue:</strong> ${enDate}</p>
                        </div>
                        <div style="text-align: center; width: 160px; position: relative;">
                            <div style="position: absolute; top: -30px; left: -10px; border: 2px dashed #059669; color: #059669; font-size: 8px; font-weight: bold; padding: 2px 5px; transform: rotate(-10deg); background: #fffcf2;">VERIFIED MEMBER</div>
                            <div style="border-top: 1.5px solid #4b5563; padding-top: 5px; width: 100%;">
                                <p style="font-weight: bold; color: #111827; font-size: 12px; margin: 0;">Central Authority</p>
                                <p style="font-size: 10px; color: #6b7280; margin-top: 1px;">Rajshahi Olympiad Society</p>
                            </div>
                        </div>
                    </div>
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

    // ৪. প্রিন্ট ও মডাল ক্লোজ কন্ট্রোলস
    document.getElementById('printCertBtn').addEventListener('click', () => window.print());
    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
        
