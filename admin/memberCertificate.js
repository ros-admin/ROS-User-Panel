/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Features: Pure English Premium Edition, Light Olympiad Theme, Sharp Resolution PDF Engine
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // গুগল ফন্ট প্রিলোডার ইন্জেকশন (পিডিএফ ফন্ট ক্র্যাশ ও টেক্সট ভাঙা রোধ করতে)
    if (!document.getElementById('ros-fonts-dependency')) {
        const linkNode = document.createElement('div');
        linkNode.id = 'ros-fonts-dependency';
        linkNode.innerHTML = `
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;500;600;700&family=Orbitron:wght@600;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        `;
        document.head.appendChild(linkNode);
    }

    // html2pdf লাইব্রেরি চেক ও ডাইনামিক ইম্পোর্ট
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // কন্ট্রোল প্যানেল UI
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0284c7;">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Montserrat', sans-serif;">
                <i class="fas fa-award" style="color: #0284c7;"></i> Premium Membership Certificate Panel
            </h2>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                Filter member name to instantly generate the ultra-premium English edition with matching Olympiad vector themes.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Start typing member name or UID..." 
                           style="width: 100%; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #0284c7, #06b6d4); color: #fff; padding: 11px 28px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(2,132,199,0.2);">
                    <i class="fas fa-magic"></i> Generate Premium Certificate
                </button>
            </div>
            
            <div id="selectedMemberBadge" style="display: none; color: #0284c7; font-size: 13px; background: rgba(2, 132, 199, 0.1); padding: 6px 12px; border-radius: 4px; display: inline-block;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.6); padding: 12px 25px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);">
                    <i class="fas fa-download"></i> Download Premium PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close Preview
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; padding: 10px 0; display: flex; justify-content: center;">
                <div id="certificatePaperFrame" style="width: 1120px; height: 792px; background: #ffffff; color: #1e293b; box-sizing: border-box; position: relative; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.3); flex-shrink: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box;">
                        </div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; transition: 0.2s; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #0284c7; color: #fff; font-weight: bold; }
        </style>
    `;

    const searchInput = document.getElementById('certSearchInput');
    const suggestionsDiv = document.getElementById('certSuggestions');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    const certDynamicBody = document.getElementById('certDynamicBody');
    const badge = document.getElementById('selectedMemberBadge');

    let allMembers = [];
    let selectedMember = null;
    let currentCertNumber = ""; 

    async function initModuleData() {
        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            allMembers = [];
            snapshot.forEach(s => { allMembers.push({ uid: s.id, ...s.data() }); });
        } catch (err) {
            console.error("Error loading registry:", err);
        }
    }
    initModuleData();

    // অটো-সাজেস্ট লাইভ সার্চ
    searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = "";
        if (!value) { suggestionsDiv.style.display = 'none'; return; }

        const filtered = allMembers.filter(m => {
            const eName = (m.englishName || m.fullName || "").toLowerCase();
            return eName.includes(value) || m.uid.toLowerCase().includes(value);
        });

        if (filtered.length > 0) {
            filtered.slice(0, 5).forEach(m => {
                const name = m.englishName || m.fullName || "Unknown Member";
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${name} (${m.uid.substring(0, 8).toUpperCase()})`;
                div.addEventListener('click', () => {
                    selectedMember = m;
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                    badge.style.display = 'inline-block';
                    badge.innerHTML = `<strong>✔ Selected:</strong> ${name}`;
                });
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });

    // সিরিয়াল কাউন্টার জেনারেটর
    async function issueCertificateNumber(memberUid) {
        try {
            const certRef = collection(db, "issued_certificates");
            const qSnapshot = await getDocs(query(certRef));
            const nextSerial = String(qSnapshot.size + 1).padStart(4, '0');
            const certNo = `ROS-MCS-${nextSerial}`;
            
            await addDoc(certRef, {
                certificateNo: certNo,
                userId: memberUid,
                language: "en",
                issuedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
            });
            return certNo;
        } catch (e) {
            return "ROS-" + Math.floor(100000 + Math.random() * 900000);
        }
    }

    // সার্টিফিকেট জেনারেট লজিক
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please select a member profile first!");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Building Layout...`;

        try {
            currentCertNumber = await issueCertificateNumber(selectedMember.uid);
            const today = new Date();
            const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const displayMemberId = selectedMember.memberId ? selectedMember.memberId.toUpperCase() : `ROS-2026-${String(allMembers.indexOf(selectedMember) + 1).padStart(4, '0')}`;
            
            let regDateText = "June 24, 2026";
            if (selectedMember.createdAt) {
                const regDateObj = new Date(selectedMember.createdAt);
                if(!isNaN(regDateObj)) {
                    regDateText = regDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            // 🎨 সম্পূর্ণ নতুন অলিম্পিয়াড থিম ব্যাকগ্রাউন্ড এবং ভেক্টোরিয়াল কার্ভ লেআউট
            certDynamicBody.innerHTML = `
                <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 45px; position: relative;
                            background: radial-gradient(circle at 50% 40%, #ffffff 0%, #e6f7ff 60%, #cceeff 100%);">
                    
                    <svg style="position: absolute; top: 0; left: 0; width: 450px; height: 220px; pointer-events: none; opacity: 0.85;" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <path d="M0,0 C150,90 280,15 380,60 C440,90 470,140 500,120 L500,0 Z" fill="url(#topWaveGradient)"/>
                        <path d="M0,0 C120,50 220,80 320,40 C400,10 440,60 500,30 L500,0 Z" fill="rgba(0, 245, 255, 0.15)"/>
                        <defs>
                            <linearGradient id="topWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#005580" stop-opacity="0.9" />
                                <stop offset="50%" stop-color="#0088cc" stop-opacity="0.8" />
                                <stop offset="100%" stop-color="#00f5ff" stop-opacity="0.2" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg style="position: absolute; bottom: 0; right: 0; width: 450px; height: 180px; pointer-events: none; opacity: 0.85;" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <path d="M0,150 C80,120 150,180 250,140 C350,100 420,160 500,80 L500,200 L0,200 Z" fill="url(#bottomWaveGradient)"/>
                        <defs>
                            <linearGradient id="bottomWaveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#004466" stop-opacity="0.9" />
                                <stop offset="60%" stop-color="#0099cc" stop-opacity="0.7" />
                                <stop offset="100%" stop-color="#00f5d4" stop-opacity="0.1" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div style="position: absolute; inset: 0; opacity: 0.08; pointer-events: none;
                                background-image: linear-gradient(#00aacc 1px, transparent 1px), linear-gradient(90deg, #00aacc 1px, transparent 1px);
                                background-size: 30px 30px; mask-image: radial-gradient(circle, black 40%, transparent 80%); -webkit-mask-image: radial-gradient(circle, black 40%, transparent 80%);">
                    </div>

                    <div style="width: 100%; height: 100%; border: 3px solid #005580; position: relative; box-sizing: border-box; padding: 12px;">
                        <div style="width: 100%; height: 100%; border: 1px solid rgba(0, 85, 128, 0.3); box-sizing: border-box; padding: 25px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative;">
                            
                            <div style="position: absolute; width: 20px; height: 20px; border-color: #005580; border-style: solid; top: -3px; left: -3px; border-width: 4px 0 0 4px;"></div>
                            <div style="position: absolute; width: 20px; height: 20px; border-color: #005580; border-style: solid; top: -3px; right: -3px; border-width: 4px 4px 0 0;"></div>
                            <div style="position: absolute; width: 20px; height: 20px; border-color: #005580; border-style: solid; bottom: -3px; left: -3px; border-width: 0 0 4px 4px;"></div>
                            <div style="position: absolute; width: 20px; height: 20px; border-color: #005580; border-style: solid; bottom: -3px; right: -3px; border-width: 0 4px 4px 0;"></div>

                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; z-index: 10;">
                                <div style="display: flex; flex-direction: column; gap: 4px; font-family: 'Montserrat', sans-serif; font-size: 12px; color: #003366; text-align: left;">
                                    <div><strong style="color: #005580; letter-spacing: 0.5px;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: 700; color: #0284c7;">${currentCertNumber}</span></div>
                                    <div><strong style="color: #005580; letter-spacing: 0.5px;">DATE OF ISSUE:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                                </div>
                                
                                <div style="background: #e11d48; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: bold; padding: 4px 15px; border-radius: 4px; letter-spacing: 1px; box-shadow: 0 2px 6px rgba(225,29,72,0.2);">
                                    OFFICIAL RECORD
                                </div>
                            </div>

                            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: -10px; z-index: 10;">
                                <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 75px; height: 75px; margin-bottom: 2px;" />
                                <h1 style="font-family: 'Cinzel', serif; font-size: 32px; font-weight: 900; color: #003366; letter-spacing: 2px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                                <div style="width: 100%; text-align: center;">
                                    <p style="font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #0284c7; letter-spacing: 4px; text-transform: uppercase; margin: 0; display: inline-block;">
                                        SYSTEM CONTROL & ENTERPRISE NETWORK
                                    </p>
                                </div>
                            </div>

                            <div style="text-align: center; width: 100%; z-index: 10; margin-top: 10px;">
                                <h2 style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; color: #c2410c; letter-spacing: 0.5px; margin: 0 0 4px 0;">Certificate of Membership</h2>
                                <p style="font-family: 'Montserrat', sans-serif; font-size: 15px; font-style: italic; color: #475569; margin: 0 0 15px 0;">This is to officially certify that</p>
                                
                                <div style="font-family: 'Montserrat', sans-serif; font-size: 30px; font-weight: 700; color: #004466; border-bottom: 2px solid #0284c7; display: inline-block; padding-bottom: 4px; min-width: 480px; text-transform: uppercase; letter-spacing: 1px;">
                                    ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                                </div>
                                
                                <p style="font-family: 'Montserrat', sans-serif; font-size: 14px; color: #334155; line-height: 1.7; max-width: 840px; margin: 20px auto 0 auto; letter-spacing: 0.2px;">
                                    has been successfully registered as an official active <strong style="color: #0284c7; font-weight: 700;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                                </p>
                            </div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; z-index: 10;">
                                
                                <div style="background: rgba(255, 255, 255, 0.85); border: 1px solid #005580; border-radius: 4px; padding: 7px 25px; display: flex; gap: 30px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 13px; box-shadow: 0 2px 10px rgba(0,85,128,0.06);">
                                    <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #c2410c; font-family: 'Orbitron'; font-size: 13.5px; margin-left: 4px;">${displayMemberId}</strong></div>
                                    <div style="width: 1px; height: 14px; background: rgba(0,85,128,0.2);"></div>
                                    <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #0f172a; margin-left: 4px;">${regDateText}</strong></div>
                                </div>

                                <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; box-sizing: border-box; padding: 0 20px;">
                                    
                                    <div style="text-align: center; width: 220px; font-family: 'Montserrat', sans-serif;">
                                        <div style="border-top: 1.5px solid #003366; padding-top: 5px; font-size: 13px; font-weight: 700; color: #002244;">General Secretary</div>
                                        <div style="font-size: 11px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                    </div>

                                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: -5px;">
                                        <div style="border: 2px solid #0284c7; padding: 4px; background: #ffffff; border-radius: 4px; box-shadow: 0 3px 10px rgba(2,132,199,0.15);">
                                            <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 72px; height: 72px; display: block;" />
                                        </div>
                                        <div style="font-family: 'Montserrat', sans-serif; font-size: 8.5px; color: #475569; text-align: center; font-weight: 500;">
                                            System Authenticity Verification Node
                                        </div>
                                    </div>

                                     <div style="text-align: center; width: 220px; font-family: 'Montserrat', sans-serif;">
                                        <div style="border-top: 1.5px solid #003366; padding-top: 5px; font-size: 13px; font-weight: 700; color: #002244;">President</div>
                                        <div style="font-size: 11px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;

            previewZone.style.display = 'flex';
            previewZone.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert("Error initializing Premium Template View Grid.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Generate Premium Certificate`;
        }
    });

    // পিডিএফ রেন্ডারিং ইঞ্জিন
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetFrame = document.getElementById('certificatePaperFrame');
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 2.5, useCORS: true, logging: false },
            jsPDF:        { unit: 'px', format: [1120, 792], orientation: 'landscape' }
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetFrame).save();
        } else {
            alert("PDF Engine is re-initializing. Please try again.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
