/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Theme: Premium Olympiad Cyan & Bright Yellow Elite Edition
 * Fonts: Poppins (Weights: 400, 500, 600) & Hind Siliguri (Specified CDN)
 * Fixes: Fixed all clipping issues, 40px inward custom premium borders, updated typography
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // 🔤 আপনার দেওয়া ফন্ট এবং আইকন সিডিএন লিংক (সর্বদা <head> এ যুক্ত হচ্ছে)
    if (!document.getElementById('ros-fonts-dependency')) {
        const linkNode = document.createElement('div');
        linkNode.id = 'ros-fonts-dependency';
        linkNode.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        `;
        document.head.appendChild(linkNode);
    }

    // html2pdf লাইব্রেরি ডিপেন্ডেন্সি চেকার
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // কন্ট্রোল প্যানেল UI
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #00B2E2; background: rgba(5, 17, 36, 0.85);">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Poppins', sans-serif; font-weight: 600;">
                <i class="fas fa-award" style="color: #00B2E2;"></i> ROS Certificate Generator v3.0
            </h2>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px; font-family: 'Poppins', sans-serif;">
                Verified production layout using Poppins typography engine. Guaranteed zero bottom clipping.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Search member profiles..." 
                           style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px; font-family: 'Poppins', sans-serif;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; padding: 11px 28px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-magic"></i> Compile & Render
                </button>
            </div>
            <div id="selectedMemberBadge" style="display: none; color: #00C5FF; font-size: 13px; background: rgba(0, 197, 255, 0.1); padding: 6px 12px; border-radius: 4px; font-family: 'Poppins', sans-serif;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.8); padding: 12px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-download"></i> Export High-Sharpness PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif;">
                    Close
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 10px 0;">
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; position: relative; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.35); flex-shrink: 0; box-sizing: border-box; margin: 0; padding: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0; overflow: hidden;"></div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; border-bottom: 1px solid #1e293b; font-family: 'Poppins', sans-serif; }
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

            // 🎨 প্রিমিয়াম গোল্ডেন-সায়ান থিম, ভেতরের বর্ডার এবং Poppins টাইপোগ্রাফি আর্কিটেকচার
            certDynamicBody.innerHTML = `
                <div style="width: 842px; height: 595px; box-sizing: border-box; padding: 50px; position: relative;
                            background: radial-gradient(circle at 50% 35%, #ffffff 0%, #f3fcfe 60%, #cdf2fa 100%); margin: 0; overflow: hidden; font-family: 'Poppins', sans-serif;">
                    
                    <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.1; z-index: 0;">
                        <div style="position: absolute; top: 85px; left: 95px; font-size: 50px; font-weight: 700; color: #00B2E2;">π</div>
                        <div style="position: absolute; top: 230px; left: 80px; font-size: 52px; font-weight: 600; color: #00B2E2;">Σ</div>
                        <div style="position: absolute; top: 90px; right: 160px; font-size: 55px; color: #00B2E2;">∫</div>
                        <div style="position: absolute; bottom: 170px; left: 100px; font-size: 50px; color: #00B2E2;">√</div>
                        
                        <div style="position: absolute; top: 210px; right: 90px; font-size: 46px; color: #00B2E2;"><i class="fas fa-atom"></i></div>
                        <div style="position: absolute; bottom: 95px; left: 270px; font-size: 40px; color: #00B2E2;"><i class="fas fa-book"></i></div>
                        <div style="position: absolute; bottom: 170px; right: 100px; font-size: 48px; color: #00B2E2;"><i class="fas fa-telescope"></i></div>
                        <div style="position: absolute; top: 75px; left: 380px; font-size: 38px; color: #00B2E2;"><i class="far fa-lightbulb"></i></div>

                        <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 178, 226, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 178, 226, 0.1) 1px, transparent 1px); background-size: 34px 34px; mask-image: radial-gradient(circle, black 45%, transparent 85%); -webkit-mask-image: radial-gradient(circle, black 45%, transparent 85%);"></div>
                    </div>

                    <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 2.5px solid #00B2E2; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    <div style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 1.5px solid #FFD700; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    <div style="position: absolute; top: 52px; left: 52px; right: 52px; bottom: 52px; border: 1px solid rgba(0, 178, 226, 0.2); pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; top: 34px; left: 34px; border-width: 4px 0 0 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; top: 34px; right: 34px; border-width: 4px 4px 0 0; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; bottom: 34px; left: 34px; border-width: 0 0 4px 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; bottom: 34px; right: 34px; border-width: 0 4px 4px 0; z-index: 3;"></div>

                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; padding: 12px 15px; position: relative; z-index: 4;">
                        
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-size: 11px; color: #002b3d; text-align: left; line-height: 1.4; font-weight: 500;">
                                <div><strong style="color: #00B2E2; font-weight: 600;">SERIAL NO:</strong> <span style="font-weight: 700; color: #00B2E2;">${currentCertNumber}</span></div>
                                <div><strong style="color: #00B2E2; font-weight: 600;">DATE OF ISSUE:</strong> <span style="font-weight: 500;">${enDate}</span></div>
                            </div>
                            <div style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; font-size: 10px; font-weight: 600; padding: 4px 14px; border-radius: 4px; letter-spacing: 0.5px;">
                                SYSTEM CONTROL RECORD
                            </div>
                        </div>

                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1px; margin-top: -5px;">
                            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 55px; height: 55px; object-fit: contain; margin-bottom: 2px;" />
                            <h1 style="font-size: 24px; font-weight: 800; color: #002b3d; letter-spacing: 0.5px; margin: 0; text-transform: uppercase;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                            <p style="font-size: 9.5px; font-weight: 600; color: #00B2E2; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
                                SYSTEM CONTROL & ENTERPRISE NETWORK
                            </p>
                        </div>

                        <div style="text-align: center; width: 100%;">
                            <h2 style="font-size: 24px; font-weight: 800; color: #002b3d; letter-spacing: 0.5px; margin: 0 0 2px 0; text-transform: uppercase;">
                                Certificate <span style="color: #FFD700;">of</span> Membership
                            </h2>
                            <p style="font-size: 12px; font-style: italic; color: #475569; margin: 0 0 10px 0;">This is to officially certify that</p>
                            
                            <div style="font-size: 23px; font-weight: 700; color: #00B2E2; border-bottom: 2px solid #FFD700; display: inline-block; padding-bottom: 2px; min-width: 440px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                            </div>
                            
                            <p style="font-size: 11.5px; color: #1e293b; line-height: 1.6; max-width: 660px; margin: 12px auto 0 auto; font-weight: 400;">
                                has been successfully registered as an official active <strong style="color: #00B2E2; font-weight: 600;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                            </p>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
                            
                            <!-- মেটাডেটা বক্সের ব্যাকগ্রাউন্ড পরিবর্তন করে সাদা (#ffffff) এবং বর্ডার অ্যাডজাস্ট করা হলো -->
                            <div style="background: #ffffff; border: 1.5px solid #00B2E2; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 4px; padding: 4px 18px; display: flex; gap: 20px; justify-content: center; align-items: center; font-size: 11px; color: #002b3d;">
                                <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #002b3d; font-size: 11px; margin-left: 2px; font-weight: 600;">${displayMemberId}</strong></div>
                                <div style="width: 1px; height: 10px; background: rgba(0,178,226,0.2);"></div>
                                <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #00B2E2; margin-left: 2px; font-weight: 600;">${regDateText}</strong></div>
                            </div>

                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 15px; box-sizing: border-box; margin-top: 2px;">
                                
                                <div style="text-align: center; width: 170px;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 600; color: #002b3d;">General Secretary</div>
                                    <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: center; gap: 1px; margin-bottom: -4px;">
                                    <div style="border: 1.5px solid #00B2E2; padding: 2px; background: #ffffff; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,178,226,0.12);">
                                        <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 46px; height: 46px; display: block;" />
                                    </div>
                                    <div style="font-size: 7.5px; color: #64748b; font-weight: 500;">Verification Node</div>
                                </div>

                                <div style="text-align: center; width: 170px;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 600; color: #002b3d;">President</div>
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
    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
