/**
 * ROS Nexus - Enterprise Membership Certificate Module v4.1
 * Bugfixes: Fixed PDF Left-clipping & Shift alignment, Resolved PDF Text-Gradient fallback box issue
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // ডিপেন্ডেন্সি লোডার (Fonts, FontAwesome, html2pdf)
    if (!document.getElementById('ros-core-dependencies')) {
        const depNode = document.createElement('div');
        depNode.id = 'ros-core-dependencies';
        depNode.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        `;
        document.head.appendChild(depNode);
    }

    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // মূল ইন্টারফেস ও ইতিহাস দেখার জন্য মডার্ন পপআপ মোডাল (Modal HTML)
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #00B2E2; background: rgba(5, 17, 36, 0.85); font-family: 'Poppins', sans-serif;">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                <i class="fas fa-award" style="color: #00B2E2;"></i> ROS Certificate Generator v4.1
            </h2>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
                Search by Name or Registration Number. Managed history logs enabled.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Type Member Name or Registration No (e.g. ROS-)..." 
                           style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 220px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; padding: 11px 28px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-magic"></i> Process Certificate
                </button>
            </div>
            <div id="selectedMemberBadge" style="display: none; color: #00C5FF; font-size: 13px; background: rgba(0, 197, 255, 0.1); padding: 6px 12px; border-radius: 4px;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.8); padding: 12px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 10px 0;">
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; position: relative; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.35); flex-shrink: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0; overflow: hidden;"></div>
                </div>
            </div>
        </div>

        <div id="certHistoryModal" style="display: none; position: fixed; inset: 0; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px); z-index: 10000; justify-content: center; align-items: center; padding: 20px;">
            <div style="background: #0f172a; border: 1px solid rgba(0, 178, 226, 0.3); width: 100%; max-width: 520px; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; font-family: 'Poppins', sans-serif;">
                <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px;">
                    <div style="background: rgba(230, 95, 0, 0.15); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #E65F00; font-size: 18px;">
                        <i class="fas fa-history"></i>
                    </div>
                    <div>
                        <h3 style="color: #fff; margin: 0; font-size: 16px; font-weight: 600;">Certificate Record Found!</h3>
                        <p style="color: #94a3b8; margin: 2px 0 0 0; font-size: 12px;">This member already has issued certificates.</p>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <p style="color: #cbd5e1; font-size: 13.5px; margin: 0 0 15px 0; line-height: 1.5;">
                        You can either load an existing certificate from the archive list below or compile a brand new instance.
                    </p>
                    
                    <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px;">Archived Certificates List:</div>
                    <div id="certModalListContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto; margin-bottom: 20px; padding-right: 4px;"></div>
                    
                    <div style="display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                        <button id="modalCancelBtn" style="background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 9px 18px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 500;">Cancel</button>
                        <button id="modalGenerateNewBtn" style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; border: none; padding: 9px 22px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-plus"></i> Issue New Certificate
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #00B2E2; color: #001a24; font-weight: bold; }
            .archive-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
            .archive-item:hover { background: rgba(0, 178, 226, 0.08); border-color: #00B2E2; }
        </style>
    `;

    const searchInput = document.getElementById('certSearchInput');
    const suggestionsDiv = document.getElementById('certSuggestions');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    const certDynamicBody = document.getElementById('certDynamicBody');
    const badge = document.getElementById('selectedMemberBadge');
    
    const historyModal = document.getElementById('certHistoryModal');
    const modalListContainer = document.getElementById('certModalListContainer');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalGenerateNewBtn = document.getElementById('modalGenerateNewBtn');

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
            const regNo = (m.memberId || "").toLowerCase();
            return name.includes(value) || regNo.includes(value);
        });

        if (filtered.length > 0) {
            filtered.slice(0, 5).forEach(m => {
                const name = m.englishName || m.fullName || "Unknown Name";
                const regNo = m.memberId ? m.memberId.toUpperCase() : "NO-ID";
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${name} (${regNo})`;
                div.addEventListener('click', () => {
                    selectedMember = m;
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                    badge.style.display = 'inline-block';
                    badge.innerHTML = `<strong>✔ Selected:</strong> ${name} [${regNo}]`;
                });
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = 'block';
        } else { suggestionsDiv.style.display = 'none'; }
    });

    async function generateUniqueSerial() {
        try {
            const certRef = collection(db, "issued_certificates");
            const qSnapshot = await getDocs(query(certRef));
            const nextSerial = String(qSnapshot.size + 1).padStart(4, '0');
            return `ROS-MSC-${nextSerial}`;
        } catch (e) { 
            return "ROS-" + Math.floor(100000 + Math.random() * 900000); 
        }
    }

    async function saveCertToDatabase(certNo, dateStr) {
        try {
            await addDoc(collection(db, "issued_certificates"), {
                certificateNo: certNo,
                userId: selectedMember.uid,
                language: "en",
                issuedAt: dateStr
            });
        } catch (e) { console.error("Logging failed:", e); }
    }

    function renderCertificateCanvas(certNo, issueDate) {
        const displayMemberId = selectedMember.memberId ? selectedMember.memberId.toUpperCase() : "ROS-PENDING";
        
        let regDateText = "June 24, 2026";
        if (selectedMember.createdAt) {
            const regDateObj = new Date(selectedMember.createdAt);
            if(!isNaN(regDateObj)) regDateText = regDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        currentCertNumber = certNo;

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
                    <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 178, 226, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 178, 226, 0.1) 1px, transparent 1px); background-size: 34px 34px; mask-image: radial-gradient(circle, black 45%, transparent 85%); -webkit-mask-image: radial-gradient(circle, black 45%, transparent 85%);"></div>
                </div>

                <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 2.5px solid #00B2E2; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                <div style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 1.5px solid #FFD700; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                
                <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; top: 34px; left: 34px; border-width: 4px 0 0 4px; z-index: 3;"></div>
                <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; top: 34px; right: 34px; border-width: 4px 4px 0 0; z-index: 3;"></div>
                <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; bottom: 34px; left: 34px; border-width: 0 0 4px 4px; z-index: 3;"></div>
                <div style="position: absolute; width: 20px; height: 20px; border-color: #FFD700; border-style: solid; bottom: 34px; right: 34px; border-width: 0 4px 4px 0; z-index: 3;"></div>

                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; padding: 12px 15px; position: relative; z-index: 4;">
                    
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-size: 11px; color: #002b3d; text-align: left; line-height: 1.4; font-weight: 500;">
                            <div><strong style="color: #00B2E2; font-weight: 600;">SERIAL NO:</strong> <span style="font-weight: 700; color: #E65F00;">${certNo}</span></div>
                            <div><strong style="color: #00B2E2; font-weight: 600;">DATE OF ISSUE:</strong> <span style="font-weight: 500; color: #002b3d;">${issueDate}</span></div>
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
                        <div style="margin: 0 auto 6px auto; display: inline-block; background: transparent !important;">
                            <h2 id="targetMembershipText" style="font-size: 19px; font-weight: 800; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; font-family: 'Poppins', sans-serif;
                                       background: linear-gradient(to right, #FFD700 0%, #FF8C00 50%, #FF3344 100%);
                                       -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                CERTIFICATE OF MEMBERSHIP
                            </h2>
                        </div>
                        
                        <p style="font-size: 11px; font-style: italic; color: #475569; margin: 0 0 12px 0;">This is to officially certify that</p>
                        
                        <div style="font-size: 23px; font-weight: 800; color: #000000; border-bottom: 2.5px solid #00B2E2; display: inline-block; padding-bottom: 4px; min-width: 440px; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                        </div>
                        
                        <p style="font-size: 11.5px; color: #1e293b; line-height: 1.6; max-width: 660px; margin: 12px auto 0 auto; font-weight: 400;">
                            has been successfully registered as an official active <strong style="color: #00B2E2; font-weight: 600;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                        </p>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
                        
                        <div style="background: #ffffff; border: 1.5px solid #00B2E2; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 4px; padding: 4px 18px; display: flex; gap: 20px; justify-content: center; align-items: center; font-size: 11px; color: #002b3d;">
                            <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #E65F00; font-size: 11px; margin-left: 2px; font-weight: 800;">${displayMemberId}</strong></div>
                            <div style="width: 1px; height: 10px; background: rgba(0,178,226,0.2);"></div>
                            <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #002b3d; margin-left: 2px; font-weight: 600;">${regDateText}</strong></div>
                        </div>

                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 15px; box-sizing: border-box; margin-top: 2px;">
                            <div style="text-align: center; width: 170px;">
                                <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 600; color: #002b3d;">General Secretary</div>
                                <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                            </div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 1px; margin-bottom: -4px;">
                                <div style="border: 1.5px solid #00B2E2; padding: 2px; background: #ffffff; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,178,226,0.12);">
                                    <img src="../qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 46px; height: 46px; display: block;" />
                                </div>
                                <div style="font-size: 7.5px; color: #64748b; font-weight: 500;">Scan To Verify</div>
                            </div>

                            <div style="text-align: center; width: 170px;">
                                <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 600; color: #002b3d;">President</div>
                                <div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                            </div>
                        </div>

                    </div>
                </div>
            `;
        previewZone.style.display = 'flex';
        previewZone.scrollIntoView({ behavior: 'smooth' });
    }

    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please select a valid member profile first.");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Checking Database...`;

        try {
            const certRef = collection(db, "issued_certificates");
            const q = query(certRef, where("userId", "==", selectedMember.uid));
            const querySnapshot = await getDocs(q);

            const pastCertificates = [];
            querySnapshot.forEach(doc => { pastCertificates.push(doc.data()); });

            if (pastCertificates.length > 0) {
                modalListContainer.innerHTML = "";
                pastCertificates.forEach((cert) => {
                    const item = document.createElement('div');
                    item.className = 'archive-item';
                    item.innerHTML = `
                        <div style="text-align: left;">
                            <div style="color: #00B2E2; font-size: 12.5px; font-weight: 700;">${cert.certificateNo}</div>
                            <div style="color: #94a3b8; font-size: 11px;"><i class="far fa-calendar-alt"></i> ${cert.issuedAt}</div>
                        </div>
                        <div style="color: #10b981; font-size: 12px; font-weight: 500;"><i class="fas fa-eye"></i> Load Saved</div>
                    `;
                    item.addEventListener('click', () => {
                        historyModal.style.display = 'none';
                        renderCertificateCanvas(cert.certificateNo, cert.issuedAt);
                    });
                    modalListContainer.appendChild(item);
                });
                historyModal.style.display = 'flex';
            } else {
                const freshSerial = await generateUniqueSerial();
                const today = new Date();
                const freshDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                
                await saveCertToDatabase(freshSerial, freshDate);
                renderCertificateCanvas(freshSerial, freshDate);
            }
        } catch (error) {
            console.error(error);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Process Certificate`;
        }
    });

    modalGenerateNewBtn.addEventListener('click', async () => {
        historyModal.style.display = 'none';
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-cog fa-spin"></i> Compiling New Copy...`;
        
        try {
            const freshSerial = await generateUniqueSerial();
            const today = new Date();
            const freshDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            await saveCertToDatabase(freshSerial, freshDate);
            renderCertificateCanvas(freshSerial, freshDate);
        } catch(e) {
            console.error(e);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Process Certificate`;
        }
    });

    modalCancelBtn.addEventListener('click', () => historyModal.style.display = 'none');

    // 🚀 পিডিএফ এক্সপোর্ট এবং অফসেট অ্যালাইনমেন্ট ইঞ্জিন (১০০% ফিক্সড)
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const element = document.getElementById('certDynamicBody');
        const textNode = document.getElementById('targetMembershipText');
        
        if (!window.html2pdf) {
            alert("PDF asset engine loading, please retry in 2 seconds.");
            return;
        }

        // html2canvas এর ব্যাকগ্রাউন্ড ট্রানজিশন বাগ এড়ানোর জন্য পিডিএফ ডাউনলোডের আগে টেক্সট মোড পরিবর্তন
        if (textNode) {
            textNode.style.background = "none";
            textNode.style.webkitBackgroundClip = "unset";
            textNode.style.webkitTextFillColor = "unset";
            textNode.style.backgroundClip = "unset";
            textNode.style.color = "#FF8C00"; // প্রিমিয়াম মিড-অরেঞ্জ টোন কালার লক
        }

        // একদম জিরো অফসেটে স্ক্রিন লকিং মেকানিজম (বাম এবং ডান দিকের সমস্যা দূরীকরণে)
        const opt = {
            margin:       0,
            filename:     `ROS-Certificate-${currentCertNumber}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 3, 
                useCORS: true, 
                logging: false,
                letterRendering: true,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                windowWidth: 842,
                windowHeight: 595
            },
            jsPDF:        { unit: 'px', format: [842, 595], orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // পিডিএফ জেনারেট হয়ে গেলে স্ক্রিনে আবার লাইভ ডাইনামিক গ্রেডিয়েন্ট ফিরিয়ে আনা
            if (textNode) {
                textNode.style.background = "linear-gradient(to right, #FFD700 0%, #FF8C00 50%, #FF3344 100%)";
                textNode.style.webkitBackgroundClip = "text";
                textNode.style.webkitTextFillColor = "transparent";
                textNode.style.backgroundClip = "text";
            }
        });
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
