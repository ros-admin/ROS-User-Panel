/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Theme: Light Olympiad Grid with Custom Symbols (π, Σ, ∫, √, ⚛, 📚, 🔭, 💡)
 * Fixes: Fixed PDF cutting completely, fixed white space/shape rendering, added proper asset loading
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // প্রয়োজনীয় প্রিমিয়াম ফন্ট ও আইকন লোডার
    if (!document.getElementById('ros-fonts-dependency')) {
        const linkNode = document.createElement('div');
        linkNode.id = 'ros-fonts-dependency';
        linkNode.innerHTML = `
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;500;600;700&family=Orbitron:wght@700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        `;
        document.head.appendChild(linkNode);
    }

    // html2pdf লাইব্রেরি ডিপেন্ডেন্সি চেক
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.head.appendChild(script);
    }

    // অ্যাডমিন কন্ট্রোল প্যানেল UI
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0284c7; background: rgba(5, 17, 36, 0.75);">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Montserrat', sans-serif;">
                <i class="fas fa-award" style="color: #0284c7;"></i> ROS Certificate Generator Pro
            </h2>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
                Generate high-precision certificates with requested science & math symbols. Guarantees 0% cutting edge during PDF exports.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Type member name or UID..." 
                           style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999;"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #0284c7, #06b6d4); color: #fff; padding: 11px 28px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-magic"></i> Generate Layout
                </button>
            </div>
            <div id="selectedMemberBadge" style="display: none; color: #0284c7; font-size: 13px; background: rgba(2, 132, 199, 0.1); padding: 6px 12px; border-radius: 4px;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.8); padding: 12px 25px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <button id="downloadCertBtn" style="background: #10b981; color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-download"></i> Download Perfect PDF
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.2); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; cursor: pointer; font-size: 13px;">
                    Close
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 10px;">
                <div id="certificatePaperFrame" style="width: 842px; height: 595px; background: #ffffff; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.25); flex-shrink: 0; box-sizing: border-box; margin: 0;">
                    </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #0284c7; }
        </style>
    `;

    const searchInput = document.getElementById('certSearchInput');
    const suggestionsDiv = document.getElementById('certSuggestions');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    const paperFrame = document.getElementById('certificatePaperFrame');
    const badge = document.getElementById('selectedMemberBadge');

    let allMembers = [];
    let selectedMember = null;
    let currentCertNumber = "";

    // ডাটাবেজ থেকে ইউজার কালেকশন রিকভারি
    async function initModuleData() {
        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            allMembers = [];
            snapshot.forEach(s => { allMembers.push({ uid: s.id, ...s.data() }); });
        } catch (err) { console.error("Database sync failed:", err); }
    }
    initModuleData();

    // লাইভ মেম্বার সার্চ সাজেশন ফিল্টার
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
                    badge.style.display = 'block';
                    badge.innerHTML = `<strong>Selected profile:</strong> ${name}`;
                });
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = 'block';
        } else { suggestionsDiv.style.display = 'none'; }
    });

    // ইউনিক সিরিয়াল ইস্যু ট্র্যাকার
    async function issueCertificateNumber(memberUid) {
        try {
            const certRef = collection(db, "issued_certificates");
            const snapshot = await getDocs(query(certRef));
            const nextSerial = String(snapshot.size + 1).padStart(4, '0');
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

    // কম্পাইল ও লেআউট জেনারেটর
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please pick a profile from suggestions first.");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Rendering...`;

        try {
            currentCertNumber = await issueCertificateNumber(selectedMember.uid);
            const today = new Date();
            const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const displayId = selectedMember.memberId ? selectedMember.memberId.toUpperCase() : `ROS-2026-${String(allMembers.indexOf(selectedMember)+1).padStart(4, '0')}`;
            
            let regDateText = "June 24, 2026";
            if (selectedMember.createdAt) {
                const dateObj = new Date(selectedMember.createdAt);
                if(!isNaN(dateObj)) regDateText = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            // 🎨 রিয়েল অলিম্পিয়াড ব্যাকগ্রাউন্ড আর্কিটেকচার এবং আপনার চাওয়া সবকটি চিহ্নের জলছাপ (π, Σ, ∫, √, ⚛, 📚, 🔭, 💡)
            paperFrame.innerHTML = `
                <div style="width: 842px; height: 595px; background: radial-gradient(circle at 50% 40%, #ffffff 0%, #f4fbe7 60%, #e0f4ff 100%); box-sizing: border-box; padding: 24px; position: relative; margin: 0; overflow: hidden;">
                    
                    <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.08; font-family: 'Cinzel', serif; z-index: 1;">
                        
                        <div style="position: absolute; top: 50px; left: 60px; font-size: 45px; font-weight: bold; color: #0284c7;">π</div>
                        <div style="position: absolute; top: 180px; left: 45px; font-size: 48px; color: #004d66; font-family: 'Arial';">Σ</div>
                        <div style="position: absolute; top: 60px; right: 120px; font-size: 50px; color: #004d66;">∫</div>
                        <div style="position: absolute; bottom: 130px; left: 65px; font-size: 44px; color: #0284c7;">√</div>
                        
                        <div style="position: absolute; top: 150px; right: 60px; font-size: 42px; color: #004d66;"><i class="fas fa-atom"></i></div> <div style="position: absolute; bottom: 50px; left: 240px; font-size: 38px; color: #0284c7;"><i class="fas fa-book"></i></div> <div style="position: absolute; bottom: 120px; right: 60px; font-size: 45px; color: #004d66;"><i class="fas fa-telescope"></i></div> <div style="position: absolute; top: 40px; left: 320px; font-size: 36px; color: #0284c7;"><i class="far fa-lightbulb"></i></div> <div style="width: 100%; height: 100%; background-image: linear-gradient(rgba(2, 132, 199, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(2, 132, 199, 0.15) 1px, transparent 1px); background-size: 30px 30px; mask-image: radial-gradient(circle, black 40%, transparent 85%); -webkit-mask-image: radial-gradient(circle, black 40%, transparent 85%);"></div>
                    </div>

                    <div style="position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 2px solid #004d66; pointer-events: none; z-index: 2;"></div>
                    <div style="position: absolute; top: 18px; left: 18px; right: 18px; bottom: 18px; border: 1px solid rgba(2, 132, 199, 0.3); pointer-events: none; z-index: 2;"></div>
                    
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #c2410c; border-style: solid; top: 8px; left: 8px; border-width: 4px 0 0 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #c2410c; border-style: solid; top: 8px; right: 8px; border-width: 4px 4px 0 0; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #c2410c; border-style: solid; bottom: 8px; left: 8px; border-width: 0 0 4px 4px; z-index: 3;"></div>
                    <div style="position: absolute; width: 20px; height: 20px; border-color: #c2410c; border-style: solid; bottom: 8px; right: 8px; border-width: 0 4px 4px 0; z-index: 3;"></div>

                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; padding: 20px 30px; position: relative; z-index: 4;">
                        
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #0f172a; text-align: left; line-height: 1.4;">
                                <div><strong style="color: #004d66;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: bold; color: #c2410c;">${currentCertNumber}</span></div>
                                <div><strong style="color: #004d66;">DATE OF ISSUE:</strong> <span style="font-weight: 600;">${enDate}</span></div>
                            </div>
                            <div style="background: #e11d48; color: #fff; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: bold; padding: 4px 14px; border-radius: 4px; letter-spacing: 0.5px;">
                                SYSTEM CONTROL RECORD
                            </div>
                        </div>

                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: -10px;">
                            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 65px; height: 65px; object-fit: contain;" />
                            <h1 style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 900; color: #002b3d; letter-spacing: 1px; margin: 0;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: #0284c7; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
                                SYSTEM CONTROL & ENTERPRISE NETWORK
                            </p>
                        </div>

                        <div style="text-align: center; width: 100%;">
                            <h2 style="font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; color: #c2410c; letter-spacing: 0.5px; margin: 0 0 4px 0;">Certificate of Membership</h2>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-style: italic; color: #475569; margin: 0 0 14px 0;">This is to officially certify that</p>
                            
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #002b3d; border-bottom: 2px solid #0284c7; display: inline-block; padding-bottom: 4px; min-width: 420px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                            </div>
                            
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6; max-width: 700px; margin: 15px auto 0 auto;">
                                has been successfully registered as an official active <strong style="color: #0284c7; font-weight: 700;">MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile signature status are fully recorded in our permanent enterprise system.
                            </p>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;">
                            
                            <div style="background: rgba(255, 255, 255, 0.95); border: 1px solid #004d66; border-radius: 4px; padding: 6px 20px; display: flex; gap: 25px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 11.5px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                                <div><span style="color: #64748b;">Registration No:</span> <strong style="color: #c2410c; font-family: 'Orbitron';">${displayId}</strong></div>
                                <div style="width: 1px; height: 12px; background: rgba(0,0,0,0.15);"></div>
                                <div><span style="color: #64748b;">Registration Date:</span> <strong style="color: #0f172a;">${regDateText}</strong></div>
                            </div>

                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10px; box-sizing: border-box;">
                                
                                <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 5px; font-size: 11.5px; font-weight: 700; color: #0f172a;">General Secretary</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Rajshahi Olympiad Society</div>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: -4px;">
                                    <div style="border: 1px solid #0284c7; padding: 3px; background: #fff; border-radius: 4px;">
                                        <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 55px; height: 55px; display: block;" />
                                    </div>
                                    <div style="font-family: 'Montserrat', sans-serif; font-size: 8px; color: #64748b;">Security Node</div>
                                </div>

                                <div style="text-align: center; width: 180px; font-family: 'Montserrat', sans-serif;">
                                    <div style="border-top: 1.5px solid #002b3d; padding-top: 5px; font-size: 11.5px; font-weight: 700; color: #0f172a;">President</div>
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
            alert("Error rendering layout grid.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Generate Layout`;
        }
    });

    // 🚀 হাই-ডেফিনিশন ক্রিস্প পিডিএফ এক্সপোর্ট মেকানিজম (A4 Landscape Form Factor 1:1 Match)
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetElement = document.getElementById('certificatePaperFrame');
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 3.5, useCORS: true, logging: false, letterRendering: true }, // Scale 3.5 for maximum sharpness
            jsPDF:        { unit: 'px', format: [842, 595], orientation: 'landscape' } // Strict 1:1 A4 Frame Lock
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetElement).save();
        } else {
            alert("PDF engine loading. Click again in a moment.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
