/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Theme: Premium Olympiad Cyan & Bright Yellow Dual-Tone Custom Edition
 * Icons: π, Σ, ∫, √, ⚛, 📚, 🔭, 💡
 * Fixes: Completely eliminated bottom-clipping issue using fluid tight box container layouts
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // প্রয়োজনীয় প্রিমিয়াম ফন্ট ও আইকন ডিপেন্ডেন্সি লোডার
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
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #00B2E2; background: rgba(5, 17, 36, 0.75);">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Montserrat', sans-serif;">
                <i class="fas fa-award" style="color: #00B2E2;"></i> ROS Premium Certificate Control Panel
            </h2>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
                Filter member profiles to generate the brand synchronized Cyan & Bright Yellow custom edition. Guaranteed zero cutting edge layout.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Start typing member name or UID..." 
                           style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; padding: 11px 28px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,178,226,0.3);">
                    <i class="fas fa-magic"></i> Generate Premium Layout
                </button>
            </div>
            
            <div id="selectedMemberBadge" style="display: none; color: #00C5FF; font-size: 13px; background: rgba(0, 197, 255, 0.1); padding: 6px 12px; border-radius: 4px; display: inline-block;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.8); padding: 12px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">
                    <i class="fas fa-download"></i> Download Full-Bleed PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close Preview
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 10px 0;">
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; color: #1e293b; box-sizing: border-box; position: relative; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.3); flex-shrink: 0; margin: 0; padding: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0;">
                        </div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; transition: 0.2s; border-bottom: 1px solid #1e293b; }
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
        } catch (err) {
            console.error("Database connection lost:", err);
        }
    }
    initModuleData();

    // অটো-সাজেস্ট সার্চ ফিল্টারিং লজিক
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

    // সিরিয়াল নাম্বার ট্র্যাকার জেনারেটর
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

    // লেআউট ইঞ্জিন কম্পাইলার
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please select a profile from the search options!");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Assets...`;

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

            // 🎨 আপনার নির্দিষ্ট করে দেওয়া সায়ান (#00B2E2) এবং উজ্জ্বল গোল্ডেন হলুদ (#FFD700) থিমে ডিজাইন করা আর্কিটেকচার
            certDynamicBody.innerHTML = `
                <div style="width: 842px; height: 595px; max-height: 595px; box-sizing: border-box; padding: 22px; position: relative;
                            background: radial-gradient(circle at 50% 38%, #ffffff 0%, #f0fafc 65%, #d1f4fc 100%); margin: 0; overflow: hidden;">
                    
                    <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.08; font-family: 'Cinzel', serif; z-index: 0;">
                        <div style="position: absolute; top: 60px; left: 65px; font-size: 50px; font-weight: bold; color: #00B2E2;">π</div>
                        <div style="position: absolute; top: 180px; left: 50px; font-size: 52px; color: #00B2E2; font-family: 'Arial', sans-serif;">Σ</div>
                        <div style="position: absolute; top: 65px; right: 130px; font-size: 54px; color: #00B2E2;">∫</div>
                        <div style="position: absolute; bottom: 140px; left: 70px; font-size: 48px; color: #00B2E2;">√</div>
                        
                        <div style="position: absolute; top: 160px; right: 65px; font-size: 45px; color: #00B2E2;"><i class="fas fa-atom"></i></div> <div style="position: absolute; bottom: 55px; left: 250px; font-size: 40px; color: #00B2E2;"><i class="fas fa-book"></i></div> <div style="position: absolute; bottom: 130px; right: 70px; font-size: 48px; color: #00B2E2;"><i class="fas fa-telescope"></i></div> <div style="position: absolute; top: 45px; left: 340px; font-size: 38px; color: #00B2E2;"><i class="far fa-lightbulb"></i></div> <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 178, 226, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 178, 226, 0.18) 1px, transparent 1px); background-size: 35px 35px; mask-image: radial-gradient(circle, black 35%, transparent 80%); -webkit-mask-image: radial-gradient(circle, black 35%, transparent 80%);"></div>
                    </div>

                    <div style="position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 2.5px solid #00B2E2; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    <div style="position: absolute; top: 18px; left: 18px; right: 18px; bottom: 18px; border: 1.5px solid #FFD700; pointer-events: none; z-index: 2; box-sizing: border-box;"></div>
                    
                    <div style="position: absolute; width: 22px; height: 22px; border-color: #FFD700; border-style: solid; top: 8px; left: 8px; border-width: 4px 0 0 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 22px; height: 22px; border-color: #FFD700; border-style: solid; top: 8px; right: 8px; border-width: 4px 4px 0 0; z-index: 3;"></div>
                    <div style="position: absolute; width: 22px; height: 22px; border-color: #FFD700; border-style: solid; bottom: 8px; left: 8px; border-width: 0 0 4px 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 22px; height: 22px; border-color: #FFD700; border-style: solid; bottom: 8px; right: 8px; border-width: 0 4px 4px 0; z-index: 3;"></div>

                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; padding: 18px 25px; position: relative; z-index: 4;">
                        
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #001a24; text-align: left; line-height: 1.4;">
                                <div><strong style="color: #00B2E2; letter-spacing: 0.3px;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: bold; color: #00B2E2;">${currentCertNumber}</span></div>
                                <div><strong style="color: #00B2E2; letter-spacing: 0.3px;">DATE OF ISSUE:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                            </div>
                            <div style="background: linear-gradient(135deg, #00B2E2, #00C5FF); color: #001a24; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: bold; padding: 4px 14px; border-radius: 4px; letter-spacing: 0.5px; box-shadow: 0 2px 5px rgba(0,178,226,0.15);">
                                OFFICIAL RECORD
                            </div>
                        </div>

                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: -8px;">
                            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 62px; height: 62px; object-fit: contain; margin-bottom: 2px;" />
                            <h1 style="font-family: 'Cinzel', serif; font-size: 25px; font-weight: 900; color: #002b3d; letter-spacing: 1px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                            <div style="width: 100%; text-align: center;">
                                <p style="font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: #00B2E2; letter-spacing: 3px; text-transform: uppercase; margin: 0; display: inline-block;">
                                    SYSTEM CONTROL & ENTERPRISE NETWORK
                                </p>
                            </div>
                        </div>

                        <div style="text-align: center; width: 100%; margin-top: 2px;">
                            <h2 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 700; color: #FFD700; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); letter-spacing: 0.5px; margin: 0 0 2px 0; text-transform: uppercase;">Certificate of Membership</h2>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 12.5px; font-style: italic; color: #475569; margin: 0 0 10px 0;">This is to officially certify that</p>
                            
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 23px; font-weight: 700; color: #002b3d; border-bottom: 2px solid #00B2E2; display: inline-block; padding-bottom: 3px; min-width: 440px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                            </div>
                            
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 12.5px; color: #1e293b; line-height: 1.5; max-width: 710px; margin: 12px auto 0 auto; letter-spacing: 0.1px;">
                                has been successfully registered as an official active <strong style="color: #00B2E2; font-weight: 700;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                            </p>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; margin-top: 5px;">
                            
                            <div style="background: rgba(255, 255, 255, 0.95); border: 1px solid #00B2E2; border-radius: 4px; padding: 5px 20px; display: flex; gap: 25px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 11px; box-shadow: 0 2px 6px rgba(0,178,226,0.05);">
                                <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #FFD700; background: #002b3d; padding: 1px 6px; border-radius: 3px; font-family: 'Orbitron'; font-size: 11.5px; margin-left: 3px;">${displayMemberId}</strong></div>
                                <div style="width: 1px; height: 12px; background: rgba(0,178,226,0.25);"></div>
                                <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #0f172a; margin-left: 3px;">${regDateText}</strong></div>
                            </div>

                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 12px; box-sizing: border-box; margin-top: 2px;">
                                
                                <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 700; color: #0f172a;">General Secretary</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: -2px;">
                                    <div style="border: 1.5px solid #00B2E2; padding: 3px; background: #ffffff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,178,226,0.15);">
                                        <img src="https://ros-user-panel.vercel.app/qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 52px; height: 52px; display: block;" />
                                    </div>
                                    <div style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; color: #64748b; font-weight: 500; letter-spacing: 0.2px;">
                                        Scan to Verify
                                    </div>
                                </div>

                                <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 4px; font-size: 11px; font-weight: 700; color: #0f172a;">President</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
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
            alert("Error rendering premium layout engine.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Generate Premium Layout`;
        }
    });

    // 🚀 ১০০% পিওর নো-ক্লিপিং আল্ট্রা ক্রিস্প পিডিএফ রেন্ডারিং আর্কিটেকচার
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetElement = document.getElementById('certificatePaperFrame');
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 4.0, useCORS: true, logging: false, letterRendering: true }, // Scale 4.0 for elite print sharpness
            jsPDF:        { unit: 'px', format: [842, 595], orientation: 'landscape' } // Full bleed frame lock down
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetElement).save();
        } else {
            alert("PDF layout compiler engine is re-initializing. Try in a few moments.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
