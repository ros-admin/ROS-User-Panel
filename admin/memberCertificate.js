/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Theme: Elite Olympiad Gold & Cyan Fusion Edition
 * Icons: π, Σ, ∫, √, ⚛, 📚, 🔭, 💡
 * Fixes: Solved bottom cutting issue permanently via absolute box constraints, inward premium borders
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // প্রিমিয়াম ফন্ট ও ডিপেন্ডেন্সি ইনজেকশন
    if (!document.getElementById('ros-fonts-dependency')) {
        const linkNode = document.createElement('div');
        linkNode.id = 'ros-fonts-dependency';
        linkNode.innerHTML = `
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@400;500;600;700;800&family=Orbitron:wght@700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        `;
        document.head.appendChild(linkNode);
    }

    // html2pdf ডাইনামিক লাইব্রেরি চেকার
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // কন্ট্রোল প্যানেল UI
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #00B2E2; background: rgba(5, 17, 36, 0.85);">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Montserrat', sans-serif;">
                <i class="fas fa-award" style="color: #00B2E2;"></i> ROS Certificate Generator v2.5
            </h2>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
                Outputs fully verified certificates with 100% full-bleed anti-clipping parameters. Symmetrical inward royal borders.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Search member profiles..." 
                           style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; padding: 11px 28px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-magic"></i> Compile & Render
                </button>
            </div>
            <div id="selectedMemberBadge" style="display: none; color: #00C5FF; font-size: 13px; background: rgba(0, 197, 255, 0.1); padding: 6px 12px; border-radius: 4px;"></div>
        </div>

        <!-- প্রিভিউ এবং অ্যাকশন হাব -->
        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.8); padding: 12px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-download"></i> Export High-Sharpness PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close
                </button>
            </div>

            <!-- এ৪ পেপার ফ্রেম ভিউপোর্ট -->
            <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 10px 0;">
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; position: relative; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.35); flex-shrink: 0; box-sizing: border-box; margin: 0; padding: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0; overflow: hidden;"></div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #00B2E2; color: #001a24; font-weight: bold; }
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
        } catch (err) { console.error("Sync Error:", err); }
    }
    initModuleData();

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = "";
        if (!value) { suggestionsDiv.style.display = 'none'; return; }

        const filtered = allMembers.filter(m => {
            const name = (m.englishName || m.fullName || "").toLowerCase();
            return name.includes(value) || m.uid.toLowerCase().includes(value);
        });

        if (filtered.length > 0) {
            filtered.slice(0, 5).forEach(m => {
                const name = m.englishName || m.fullName || "Unknown";
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
        } else { suggestionsDiv.style.display = 'none'; }
    });

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
        } catch (e) { return "ROS-" + Math.floor(100000 + Math.random() * 900000); }
    }

    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please select a valid member first.");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Rendering Elite Grid...`;

        try {
            currentCertNumber = await issueCertificateNumber(selectedMember.uid);
            const today = new Date();
            const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const displayMemberId = selectedMember.memberId ? selectedMember.memberId.toUpperCase() : `ROS-2026-${String(allMembers.indexOf(selectedMember) + 1).padStart(4, '0')}`;
            
            let regDateText = "June 24, 2026";
            if (selectedMember.createdAt) {
                const regDateObj = new Date(selectedMember.createdAt);
                if(!isNaN(regDateObj)) regDateText = regDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            // 🎨 ইউনিক রয়্যাল বর্ডার, অভিজাত টাইপোগ্রাফি এবং অলিম্পিয়াড সিম্বল নেটওয়ার্ক কম্বিনেশন
            certDynamicBody.innerHTML = `
                <div style="width: 842px; height: 595px; box-sizing: border-box; padding: 45px; position: relative;
                            background: radial-gradient(circle at 50% 35%, #ffffff 0%, #f4fdf1 55%, #e1f7fc 100%); margin: 0; overflow: hidden;">
                    
                    <!-- 🌌 অলিম্পিয়াড চিহ্নের জলছাপ ব্যাকগ্রাউন্ড (π, Σ, ∫, √, ⚛, 📚, 🔭, 💡) -->
                    <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.09; font-family: 'Cinzel', serif; z-index: 0;">
                        <div style="position: absolute; top: 75px; left: 80px; font-size: 55px; font-weight: bold; color: #00B2E2;">π</div>
                        <div style="position: absolute; top: 220px; left: 65px; font-size: 58px; color: #00B2E2; font-family: 'Arial';">Σ</div>
                        <div style="position: absolute; top: 80px; right: 150px; font-size: 60px; color: #00B2E2;">∫</div>
                        <div style="position: absolute; bottom: 160px; left: 85px; font-size: 54px; color: #00B2E2;">√</div>
                        
                        <div style="position: absolute; top: 200px; right: 75px; font-size: 50px; color: #00B2E2;"><i class="fas fa-atom"></i></div>
                        <div style="position: absolute; bottom: 80px; left: 260px; font-size: 44px; color: #00B2E2;"><i class="fas fa-book"></i></div>
                        <div style="position: absolute; bottom: 160px; right: 85px; font-size: 52px; color: #00B2E2;"><i class="fas fa-telescope"></i></div>
                        <div style="position: absolute; top: 60px; left: 360px; font-size: 42px; color: #00B2E2;"><i class="far fa-lightbulb"></i></div>

                        <!-- ফাইন ম্যাথমেটিক্যাল গ্রিড লাইন -->
                        <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 178, 226, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 178, 226, 0.12) 1px, transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(circle, black 45%, transparent 85%); -webkit-mask-image: radial-gradient(circle, black 45%, transparent 85%);"></div>
                    </div>

                    <!-- 🏆 প্রিমিয়াম লেভেলের ইনওয়ার্ড ট্রিপল-লেয়ার্ড রয়্যাল বর্ডার ফ্রেম (ধার থেকে ৩০px ভেতরে) -->
                    <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 2px solid #00B2E2; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    <div style="position: absolute; top: 34px; left: 34px; right: 34px; bottom: 34px; border: 1.5px solid #FFD700; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 1px solid rgba(0, 178, 226, 0.25); pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    
                    <!-- কর্নার রয়্যাল ভেক্টর কর্নার প্লাগস -->
                    <div style="position: absolute; width: 24px; height: 24px; border-color: #FFD700; border-style: solid; top: 24px; left: 24px; border-width: 4px 0 0 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 24px; height: 24px; border-color: #FFD700; border-style: solid; top: 24px; right: 24px; border-width: 4px 4px 0 0; z-index: 3;"></div>
                    <div style="position: absolute; width: 24px; height: 24px; border-color: #FFD700; border-style: solid; bottom: 24px; left: 24px; border-width: 0 0 4px 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 24px; height: 24px; border-color: #FFD700; border-style: solid; bottom: 24px; right: 24px; border-width: 0 4px 4px 0; z-index: 3;"></div>

                    <!-- 📄 কোর কন্টেন্ট ডিসপ্লে ইউনিট (ক্লিপিং রুখতে হাইট ও প্যাডিং অপ্টিমাইজড) -->
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; padding: 15px 20px; position: relative; z-index: 4;">
                        
                        <!-- TOP METADATA ROW -->
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #002b3d; text-align: left; line-height: 1.4;">
                                <div><strong style="color: #00B2E2;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: bold; color: #00B2E2;">${currentCertNumber}</span></div>
                                <div><strong style="color: #00B2E2;">DATE OF ISSUE:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                            </div>
                            <div style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 800; padding: 4px 14px; border-radius: 4px; letter-spacing: 0.5px;">
                                SYSTEM CONTROL RECORD
                            </div>
                        </div>

                        <!-- BRANDING HEADER (গ্লসি ডার্ক থিম টাইপোগ্রাফি) -->
                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 58px; height: 58px; object-fit: contain; margin-bottom: 2px;" />
                            <h1 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; background: linear-gradient(135deg, #002b3d 30%, #005573 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 9.5px; font-weight: 700; color: #00B2E2; letter-spacing: 3.5px; text-transform: uppercase; margin: 0;">
                                SYSTEM CONTROL & ENTERPRISE NETWORK
                            </p>
                        </div>

                        <!-- CORE TEXT FIELDS WITH RE-DESIGNED BRAND TEXT -->
                        <div style="text-align: center; width: 100%;">
                            <h2 style="font-family: 'Cinzel', serif; font-size: 25px; font-weight: 800; background: linear-gradient(135deg, #FFD700 0%, #c2410c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px; margin: 0 0 1px 0;">Certificate of Membership</h2>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 12px; font-style: italic; color: #475569; margin: 0 0 12px 0;">This is to officially certify that</p>
                            
                            <!-- Elite Bold Member Card Display -->
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 800; color: #002b3d; border-bottom: 2px solid #00B2E2; display: inline-block; padding-bottom: 4px; min-width: 450px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                            </div>
                            
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 12px; color: #1e293b; line-height: 1.6; max-width: 680px; margin: 12px auto 0 auto;">
                                has been successfully registered as an official active <strong style="color: #00B2E2; font-weight: 700;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                            </p>
                        </div>

                        <!-- BOTTOM AUTHENTICATION & EMBEDDED REGISTRY PANEL -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
                            
                            <!-- Sync Registry Badge -->
                            <div style="background: #002b3d; border: 1.5px solid #FFD700; border-radius: 4px; padding: 4px 18px; display: flex; gap: 20px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #ffffff;">
                                <div><span style="color: #94a3b8;">Registration No:</span> <strong style="color: #FFD700; font-family: 'Orbitron'; font-size: 11px; margin-left: 2px;">${displayMemberId}</strong></div>
                                <div style="width: 1px; height: 10px; background: rgba(255,255,255,0.2);"></div>
                                <div><span style="color: #94a3b8;">Registration Date:</span> <strong style="color: #00C5FF; margin-left: 2px;">${regDateText}</strong></div>
                            </div>

                            <!-- Triple-Axis Authorization Line -->
                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px; box-sizing: border-box; margin-top: 4px;">
                                
                                <!-- Left Signature -->
                                <div style="text-align: center; width: 170px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 700; color: #002b3d;">General Secretary</div>
                                    <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                </div>

                                  <!-- Integrated Center Security QR Code Node -->
                                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: -2px;">
                                    <div style="border: 1.5px solid #00B2E2; padding: 2px; background: #ffffff; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,178,226,0.12);">
                                        <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 50px; height: 50px; display: block;" />
                                    </div>
                                    <div style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; color: #64748b; font-weight: 600;">Verification Node</div>
                                </div>

                                <!-- Right Signature -->
                                <div style="text-align: center; width: 170px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 700; color: #002b3d;">President</div>
                                    <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
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
            alert("Error running the elite render engine.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Compile & Render`;
        }
    });

    // 🚀 নো-মার্জিন, অ্যান্টি-ক্লিপিং এবং কমপ্যাক্ট পিডিএফ ডাউনলোড ইঞ্জিন কনফিগুরেশন
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetElement = document.getElementById('certificatePaperFrame');
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 4.0, useCORS: true, logging: false, letterRendering: true, scrollY: 0, scrollX: 0 },
            jsPDF:        { unit: 'px', format: [842, 595], orientation: 'landscape', hotfixes: ["px_scaling"] },
            pagebreak:    { mode: 'avoid' } // কোনো উপাদানের পেজ-ব্রেক বা ওভারফ্লো রুখতে বাধ্য করবে
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetElement).save();
        } else {
            alert("PDF Engine is compiling assets. Please wait a second.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
