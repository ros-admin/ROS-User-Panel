/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Theme: Light Olympiad Vector (Math Equation Watermarks & Clean Waves)
 * Fixes: Fixed PDF cutting issue, added genuine math symbols, 100% full-bleed A4 background
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // গুগল ফন্ট প্রিলোডার ইন্জেকশন (ফন্ট ক্র্যাশ ও টেক্সট ভাঙা রোধ করতে)
    if (!document.getElementById('ros-fonts-dependency')) {
        const linkNode = document.createElement('div');
        linkNode.id = 'ros-fonts-dependency';
        linkNode.innerHTML = `
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;500;600;700&family=Orbitron:wght@700&display=swap" rel="stylesheet">
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
                Generate ultra-premium certificates with accurate Math Olympiad watermarks and seamless PDF sizing.
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

        <!-- 🖼️ লাইভ প্রিভিউ এবং অ্যাকশন বোর্ড -->
        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.6); padding: 12px 25px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);">
                    <i class="fas fa-download"></i> Download Premium PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close Preview
                </button>
            </div>

            <!-- ক্যানভাস ভিউপোর্ট রেন্ডার বক্স -->
            <div style="width: 100%; overflow-x: auto; padding: 10px 0; display: flex; justify-content: center;">
                <!-- 📄 Perfect A4 Landscape Ratio Container (842px x 595px) to prevent cutting & white spacing -->
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; color: #1e293b; box-sizing: border-box; position: relative; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.3); flex-shrink: 0; margin: 0; padding: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0;">
                        <!-- ডাইনামিক কন্টেন্ট ইনজেকশন পয়েন্ট -->
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

            // 🎨 রেফারেন্স ছবি '1000363802_2.jpg' এর অনুরূপ মডার্ন অলিম্পিয়াড থিম লেআউট
            certDynamicBody.innerHTML = `
                <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 25px; position: relative;
                            background: radial-gradient(circle at 50% 35%, #ffffff 0%, #edfaff 65%, #d1f0ff 100%); margin: 0;">
                    
                    <!-- 🌊 Top-Left Cyan-Teal Dynamic Wave (Exact Reference Curve Style) -->
                    <svg style="position: absolute; top: -2px; left: -2px; width: 340px; height: 160px; pointer-events: none; z-index: 1;" viewBox="0 0 500 220" preserveAspectRatio="none">
                        <path d="M0,0 C160,110 300,20 420,80 C470,110 490,160 500,190 L500,0 Z" fill="url(#topWaveGrad)"/>
                        <path d="M0,0 C130,70 240,100 350,50 C420,20 460,80 500,50 L500,0 Z" fill="rgba(0, 245, 255, 0.18)"/>
                        <defs>
                            <linearGradient id="topWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#004d66" />
                                <stop offset="45%" stop-color="#0080a3" />
                                <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.4" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <!-- 🌊 Bottom-Right Fluid Greenish-Cyan Wave Vector -->
                    <svg style="position: absolute; bottom: -2px; right: -2px; width: 340px; height: 130px; pointer-events: none; z-index: 1;" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <path d="M0,160 C90,130 170,190 270,150 C370,110 430,170 500,90 L500,200 L0,200 Z" fill="url(#bottomWaveGrad)"/>
                        <defs>
                            <linearGradient id="bottomWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#003344" />
                                <stop offset="55%" stop-color="#007799" />
                                <stop offset="100%" stop-color="#00cc99" stop-opacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <!-- 📐 Math Equation Watermarks & Mathematical Graphs (Requested Features) -->
                    <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.07; font-family: 'Cinzel', serif; z-index: 0;">
                        <!-- Equations -->
                        <div style="position: absolute; top: 120px; left: 40px; font-size: 20px; font-weight: bold; color: #004d66;">a² + b² = c²</div>
                        <div style="position: absolute; top: 220px; left: 25px; font-size: 24px; color: #004d66;">f(x) = ∑ xⁿ</div>
                        <div style="position: absolute; top: 140px; right: 50px; font-size: 26px; color: #004d66;">E = mc²</div>
                        <div style="position: absolute; bottom: 150px; left: 50px; font-size: 22px; color: #004d66;">π ≈ 3.14159</div>
                        <div style="position: absolute; bottom: 120px; right: 60px; font-size: 25px; color: #004d66;">√x² + y²</div>
                        <div style="position: absolute; top: 75px; left: 420px; font-size: 18px; color: #004d66;">∫ da = a</div>
                        
                        <!-- Geometric Grid Overlay Line -->
                        <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 77, 102, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 77, 102, 0.4) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle, black 30%, transparent 75%); -webkit-mask-image: radial-gradient(circle, black 30%, transparent 75%);"></div>
                    </div>

                    <!-- Outer High-Precision Frame Border -->
                    <div style="width: 100%; height: 100%; border: 2.5px solid #004d66; position: relative; box-sizing: border-box; padding: 8px; z-index: 2;">
                        <div style="width: 100%; height: 100%; border: 1px solid rgba(0, 77, 102, 0.25); box-sizing: border-box; padding: 20px 25px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative;">
                            
                            <!-- Sharp Corner Vector Anchors -->
                            <div style="position: absolute; width: 14px; height: 14px; border-color: #004d66; border-style: solid; top: -3px; left: -3px; border-width: 3px 0 0 3px;"></div>
                            <div style="position: absolute; width: 14px; height: 14px; border-color: #004d66; border-style: solid; top: -3px; right: -3px; border-width: 3px 4px 0 0;"></div>
                            <div style="position: absolute; width: 14px; height: 14px; border-color: #004d66; border-style: solid; bottom: -3px; left: -3px; border-width: 0 0 3px 3px;"></div>
                            <div style="position: absolute; width: 14px; height: 14px; border-color: #004d66; border-style: solid; bottom: -3px; right: -3px; border-width: 0 4px 3px 0;"></div>

                            <!-- TOP METADATA BLOCK -->
                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="display: flex; flex-direction: column; gap: 3px; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #002b3d; text-align: left;">
                                    <div><strong style="color: #005573; letter-spacing: 0.3px;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: 700; color: #0284c7;">${currentCertNumber}</span></div>
                                    <div><strong style="color: #005573; letter-spacing: 0.3px;">DATE OF ISSUE:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                                </div>
                                
                                <div style="background: #e11d48; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 3px; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(225,29,72,0.15);">
                                    OFFICIAL RECORD
                                </div>
                            </div>

                            <!-- BRANDING HEADER SECTION -->
                            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: -15px;">
                                <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 60px; height: 60px; margin-bottom: 2px;" />
                                <h1 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #002b3d; letter-spacing: 1.5px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                                <div style="width: 100%; text-align: center;">
                                    <p style="font-family: 'Montserrat', sans-serif; font-size: 10.5px; font-weight: 700; color: #0284c7; letter-spacing: 3px; text-transform: uppercase; margin: 0; display: inline-block;">
                                        SYSTEM CONTROL & ENTERPRISE NETWORK
                                    </p>
                                </div>
                            </div>

                            <!-- CENTRAL CONTENT TEXT FIELD -->
                            <div style="text-align: center; width: 100%; margin-top: 5px;">
                                <h2 style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; color: #c2410c; letter-spacing: 0.5px; margin: 0 0 3px 0;">Certificate of Membership</h2>
                                <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-style: italic; color: #475569; margin: 0 0 12px 0;">This is to officially certify that</p>
                                
                                <div style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #003344; border-bottom: 2px solid #0284c7; display: inline-block; padding-bottom: 3px; min-width: 400px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                                </div>
                                
                                <p style="font-family: 'Montserrat', sans-serif; font-size: 12.5px; color: #334155; line-height: 1.6; max-width: 720px; margin: 15px auto 0 auto;">
                                    has been successfully registered as an official active <strong style="color: #0284c7; font-weight: 700;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                                </p>
                            </div>

                            <!-- REGISTRATION BADGE & SIGNATURE FOOTER SYSTEM -->
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;">
                                
                                <!-- Premium Embedded Registry Counter Badge -->
                                <div style="background: rgba(255, 255, 255, 0.9); border: 1px solid #004d66; border-radius: 4px; padding: 5px 20px; display: flex; gap: 25px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 12px; box-shadow: 0 2px 8px rgba(0,77,102,0.05);">
                                    <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #c2410c; font-family: 'Orbitron'; font-size: 12px; margin-left: 3px;">${displayMemberId}</strong></div>
                                    <div style="width: 1px; height: 12px; background: rgba(0,77,102,0.2);"></div>
                                    <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #0f172a; margin-left: 3px;">${regDateText}</strong></div>
                                </div>

                                <!-- Triple Axis Bottom Line Signatures -->
                                <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; box-sizing: border-box; padding: 0 15px; margin-top: 5px;">
                                    
                                    <!-- Left Admin Authorization -->
                                    <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                        <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11.5px; font-weight: 700; color: #001a24;">General Secretary</div>
                                        <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                    </div>

                                    <!-- QR Code Authentication Node (Fits perfectly inside bounds) -->
                                    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; margin-bottom: -5px;">
                                        <div style="border: 1.5px solid #0284c7; padding: 3px; background: #ffffff; border-radius: 3px; box-shadow: 0 2px 8px rgba(2,132,199,0.12);">
                                            <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 58px; height: 58px; display: block;" />
                                        </div>
                                        <div style="font-family: 'Montserrat', sans-serif; font-size: 8px; color: #475569; text-align: center;">
                                            Verification Node
                                        </div>
                                    </div>

                                    <!-- Right Admin Authorization -->
                                    <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                        <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11.5px; font-weight: 700; color: #001a24;">President</div>
                                        <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
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

    // পিডিএফ রেন্ডারিং ইঞ্জিন (A4 Landscape Form Factor)
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetFrame = document.getElementById('certificatePaperFrame');
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 3.0, useCORS: true, logging: false }, // Higher scale for crisp vector prints
            jsPDF:        { unit: 'px', format: [842, 595], orientation: 'landscape' } // Strict A4 Pixel Match
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetFrame).save();
        } else {
            alert("PDF Engine is re-initializing. Please try again.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
