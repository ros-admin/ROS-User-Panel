/**
 * ROS Nexus - Ultra Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Features: Pure English Ultra-Premium Edition, Firestore Serial System, Dynamic QR Grid, html2pdf.js Fixed Resolution Engine
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where, setDoc, addDoc, serverTimestamp) {
    
    // গুগল ও ফন্ট-অসাম ফন্ট ফ্যামিলি সরাসরি অ্যাডমিনের মেইন ডকূমেন্টে ইঞ্জেক্ট করা (পিডিএফ ফন্ট ক্র্যাশ রোধ করতে)
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

    // মডিউলের মূল ইউজার ইন্টারফেস (UI) - বাংলা অপশন বাদ দেওয়া হয়েছে
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #00f5ff;">
            <h2 style="color: #fff; font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: 'Montserrat', sans-serif;">
                <i class="fas fa-crown" style="color: #ffb703;"></i> Premium Membership Certificate Control Panel
            </h2>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                Type member name or unique ID to filter. The certificate will be generated instantly in English with a dynamic serial code.
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 20px;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                    <input type="text" id="certSearchInput" placeholder="Start typing member name or UID..." 
                           style="width: 100%; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;" autocomplete="off">
                    <div id="certSuggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
                </div>

                <button id="generateCertBtn" style="background: linear-gradient(135deg, #00f5ff, #00f5d4); color: #030a16; padding: 11px 28px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,245,255,0.2);">
                    <i class="fas fa-magic"></i> Generate Premium Certificate
                </button>
            </div>
            
            <div id="selectedMemberBadge" style="display: none; color: #00f5ff; font-size: 13px; background: rgba(0, 245, 255, 0.1); padding: 6px 12px; border-radius: 4px; display: inline-block;"></div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px; width: 100%;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.6); padding: 12px 25px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="downloadCertBtn" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 10px 24px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);">
                    <i class="fas fa-download"></i> Direct PDF Download
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.15); color: #ff3344; border: 1px solid rgba(230, 57, 70, 0.4); padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    Close Preview
                </button>
            </div>

            <div style="width: 100%; overflow-x: auto; padding: 10px 0; display: flex; justify-content: center;">
                <div id="certificatePaperFrame" style="width: 1120px; height: 792px; background: #030c1b; color: #ffffff; box-sizing: border-box; padding: 45px; position: relative; overflow: hidden; box-shadow: 0 25px 70px rgba(0,0,0,0.8); border: 1px solid rgba(0, 245, 255, 0.2); flex-shrink: 0;">
                    <div id="certDynamicBody" style="width: 100%; height: 100%; box-sizing: border-box;">
                        </div>
                </div>
            </div>
        </div>

        <style>
            .suggestion-item { padding: 11px 15px; color: #fff; cursor: pointer; font-size: 13.5px; transition: 0.2s; border-bottom: 1px solid #1e293b; }
            .suggestion-item:hover { background: #00f5ff; color: #030a16; font-weight: bold; }
        </style>
    `;

    // এলিমেন্ট রেফারেন্স লিঙ্কিং
    const searchInput = document.getElementById('certSearchInput');
    const suggestionsDiv = document.getElementById('certSuggestions');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    const certDynamicBody = document.getElementById('certDynamicBody');
    const badge = document.getElementById('selectedMemberBadge');

    let allMembers = [];
    let selectedMember = null;
    let currentCertNumber = ""; 

    // ডাটাবেজ থেকে রিয়েলটাইম ইউজার অ্যারে ফেচ মেকানিজম
    async function initModuleData() {
        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            allMembers = [];
            snapshot.forEach(s => {
                allMembers.push({ uid: s.id, ...s.data() });
            });
        } catch (err) {
            console.error("Error loading enterprise station registry:", err);
        }
    }
    initModuleData();

    // অটো-সাজেস্ট লাইভ সার্চ ট্রিগার
    searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim().toLowerCase();
        suggestionsDiv.innerHTML = "";
        
        if (!value) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const filtered = allMembers.filter(m => {
            const eName = (m.englishName || m.fullName || "").toLowerCase();
            const bName = (m.banglaName || "").toLowerCase();
            return eName.includes(value) || bName.includes(value) || m.uid.toLowerCase().includes(value);
        });

        if (filtered.length > 0) {
            filtered.slice(0, 5).forEach(m => {
                const name = m.englishName || m.fullName || m.banglaName || "Unknown Member";
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${name} (${m.uid.substring(0, 8).toUpperCase()})`;
                div.addEventListener('click', () => {
                    selectedMember = m;
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                    badge.style.display = 'inline-block';
                    badge.innerHTML = `<strong>✔ Selected Profile:</strong> ${name} | ID: ${m.uid.substring(0,10).toUpperCase()}`;
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

    // ইউনিক ক্রমানুসারী মেম্বারশিপ সিরিয়াল জেনারেটর (Firestore Counter)
    async function issueCertificateNumber(memberUid) {
        try {
            const certRef = collection(db, "issued_certificates");
            const qSnapshot = await getDocs(query(certRef));
            const totalCount = qSnapshot.size;
            const nextSerial = String(totalCount + 1).padStart(4, '0');
            const certNo = `ROS-MCS-${nextSerial}`; // ভেরিফিকেশন ফাইলের সাথে ম্যাচড স্ট্রাকচার
            
            await addDoc(certRef, {
                certificateNo: certNo,
                userId: memberUid,
                language: "en",
                issuedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
            });
            
            return certNo;
        } catch (e) {
            console.error("Firestore serial indexing failed, running dynamic safe fallback:", e);
            return "ROS-" + Math.floor(100000 + Math.random() * 900000);
        }
    }

    // সার্টিফিকেট রেন্ডার কোর লজিক
    generateBtn.addEventListener('click', async () => {
        if (!selectedMember) return alert("Please select a valid member profile from the suggest options first!");

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Initializing Dynamic Canvas...`;

        try {
            currentCertNumber = await issueCertificateNumber(selectedMember.uid);
            const today = new Date();
            
            // রিকোয়েস্ট অনুযায়ী মেটাডাটা ফরম্যাটিং
            const enDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const displayMemberId = selectedMember.memberId ? selectedMember.memberId.toUpperCase() : `ROS-2026-${String(allMembers.indexOf(selectedMember) + 1).padStart(4, '0')}`;
            
            let regDateText = "June 24, 2026";
            if (selectedMember.createdAt) {
                const regDateObj = new Date(selectedMember.createdAt);
                if(!isNaN(regDateObj)) {
                    regDateText = regDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            // আল্ট্রা-প্রিমিয়াম সায়েন্স ক্যানভাস ব্যাকগ্রাউন্ড ও সুসামঞ্জস্যপূর্ণ ফন্ট স্টাইলিং গ্রিড
            certDynamicBody.innerHTML = `
                <div style="width: 100%; height: 100%; border: 2px dashed rgba(0, 245, 255, 0.3); position: relative; box-sizing: border-box; padding: 10px; background: linear-gradient(135deg, #020916 0%, #05142c 50%, #030c1b 100%);">
                    <div style="width: 100%; height: 100%; border: 1px dashed rgba(255, 183, 3, 0.25); position: relative; box-sizing: border-box; padding: 35px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                        
                        <div style="position: absolute; width: 35px; height: 35px; border-color: #ffb703; border-style: solid; top: 0; left: 0; border-width: 4px 0 0 4px;"></div>
                        <div style="position: absolute; width: 35px; height: 35px; border-color: #ffb703; border-style: solid; top: 0; right: 0; border-width: 4px 4px 0 0;"></div>
                        <div style="position: absolute; width: 35px; height: 35px; border-color: #ffb703; border-style: solid; bottom: 0; left: 0; border-width: 0 0 4px 4px;"></div>
                        <div style="position: absolute; width: 35px; height: 35px; border-color: #ffb703; border-style: solid; bottom: 0; right: 0; border-width: 0 4px 4px 0;"></div>

                        <div style="position: absolute; top: 8%; left: 6%; font-size: 13px; font-family: 'Courier New'; color: rgba(0, 245, 255, 0.05); line-height: 1.5; pointer-events: none; text-align: left;">
                            f(x) = a₀ + &sum; (a_n cos(n&pi;x/L) + b_n sin(n&pi;x/L))<br>
                            E = mc² &nbsp;&nbsp;&nbsp;&nbsp; &nabla; &times; B = &mu;₀J + &mu;₀&epsilon;₀(&part;E/&part;t)<br>
                            &int; e^(-x²) dx = &radic;&pi; &nbsp;&nbsp;&nbsp;&nbsp; &psi;(x,t) = Ae^(i(kx-&omega;t))
                        </div>
                        <div style="position: absolute; bottom: 8%; right: 6%; font-size: 13px; font-family: 'Courier New'; color: rgba(0, 245, 255, 0.05); line-height: 1.5; pointer-events: none; text-align: right;">
                            V - E + F = 2 &nbsp;&nbsp;&nbsp;&nbsp; i&hbar;(&part;&psi;/&part;t) = Ĥ&psi;<br>
                            G_&mu;&nu; + &Lambda;g_&mu;&nu; = (8&pi;G/c⁴) T_&mu;&nu;<br>
                            x_1,2 = (-b &plusmn; &radic;(b² - 4ac)) / 2a
                        </div>
                        
                        <div style="position: absolute; color: rgba(0, 245, 255, 0.04); font-size: 80px; top: 38%; left: 8%; pointer-events: none;"><i class="fas fa-atom"></i></div>
                        <div style="position: absolute; color: rgba(0, 245, 255, 0.04); font-size: 70px; top: 35%; right: 9%; pointer-events: none;"><i class="fas fa-chart-network"></i></div>
                        <div style="position: absolute; color: rgba(255, 183, 3, 0.03); font-size: 75px; bottom: 35%; left: 12%; pointer-events: none;"><i class="fas fa-brain"></i></div>
                        <div style="position: absolute; color: rgba(255, 183, 3, 0.03); font-size: 70px; bottom: 38%; right: 12%; pointer-events: none;"><i class="fas fa-microscope"></i></div>

                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 420px; opacity: 0.025; pointer-events: none;" />

                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="display: flex; flex-direction: column; gap: 4px; font-family: 'Montserrat', sans-serif; font-size: 12px; color: rgba(248, 250, 252, 0.85); text-align: left; padding-left: 10px;">
                                <div><strong style="color: #ffb703; letter-spacing: 0.5px;">SERIAL NO:</strong> <span style="font-family: 'Orbitron'; font-weight: 600; color: #00f5ff;">${currentCertNumber}</span></div>
                                <div><strong style="color: #ffb703; letter-spacing: 0.5px;">DATE OF ISSUE:</strong> <span style="font-weight: 500;">${enDate}</span></div>
                            </div>
                            
                            <div style="text-align: right; font-family: 'Orbitron', sans-serif; font-size: 9px; color: rgba(0, 245, 255, 0.4); letter-spacing: 3px; font-weight: bold; padding-right: 10px;">
                                SECURITY CORE VALIDATION
                            </div>
                        </div>

                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: -15px;">
                            <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 72px; height: 72px; margin-bottom: 2px;" />
                            <h1 style="font-family: 'Cinzel', serif; font-size: 29px; font-weight: 900; color: #ffffff; letter-spacing: 2.5px; margin: 0; text-shadow: 0 4px 12px rgba(0,0,0,0.5);">RAJSHAHI OLYMPIAD SOCIETY</h1>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 10.5px; font-weight: 700; color: #ffb703; letter-spacing: 3.5px; text-transform: uppercase; margin: 0;">SYSTEM CONTROL & ENTERPRISE NETWORK</p>
                        </div>

                        <div style="text-align: center; width: 100%; margin-top: 10px;">
                            <h2 style="font-family: 'Cinzel', serif; font-size: 35px; font-weight: 700; color: #ffb703; letter-spacing: 1px; margin: 0 0 5px 0;">Certificate of Membership</h2>
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 15px; font-style: italic; color: rgba(248, 250, 252, 0.7); margin: 0 0 15px 0;">This is to officially certify that</p>
                            
                            <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: #00f5ff; border-bottom: 2px solid rgba(255, 183, 3, 0.4); display: inline-block; padding-bottom: 4px; min-width: 460px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,245,255,0.2);">
                                ${selectedMember.englishName || selectedMember.fullName || "OFFICIAL MEMBER"}
                            </div>
                            
                            <p style="font-family: 'Montserrat', sans-serif; font-size: 13.5px; color: rgba(248, 250, 252, 0.8); line-height: 1.7; max-width: 820px; margin: 20px auto 0 auto; letter-spacing: 0.3px;">
                                has been successfully registered as an official corporate <strong style="color: #00f5d4; font-weight: 600;">GENERAL MEMBER</strong> of Rajshahi Olympiad Society. Their credentials, contribution matrix, and profile status are fully recorded in our permanent enterprise system.
                            </p>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; margin-top: 5px;">
                            
                            <div style="background: rgba(6, 20, 43, 0.6); border: 1px solid rgba(0, 245, 255, 0.2); border-radius: 6px; padding: 8px 30px; display: flex; gap: 35px; justify-content: center; align-items: center; font-family: 'Montserrat', sans-serif; font-size: 12.5px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                                <div><span style="color: rgba(248, 250, 252, 0.6);">Registration No:</span> <strong style="color: #ffb703; font-family: 'Orbitron'; font-size: 13px; margin-left: 5px;">${displayMemberId}</strong></div>
                                <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.15);"></div>
                                <div><span style="color: rgba(248, 250, 252, 0.6);">Registration Date:</span> <strong style="color: #e2e8f0; margin-left: 5px;">${regDateText}</strong></div>
                            </div>

                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; box-sizing: border-box; padding: 0 10px;">
                                
                                <div style="text-align: center; width: 220px; font-family: 'Montserrat', sans-serif;">
                                    <div style="height: 38px; display: flex; align-items: center; justify-content: center; font-family: 'Courier New'; font-size: 14px; font-style: italic; color: rgba(255,255,255,0.2);"></div>
                                    <div style="border-top: 1px solid rgba(248, 250, 252, 0.3); padding-top: 6px; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">General Secretary</div>
                                    <div style="font-size: 11px; color: rgba(248, 250, 252, 0.5); margin-top: 1px;">Rajshahi Olympiad Society</div>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: -10px;">
                                    <div style="border: 2px solid #00f5ff; padding: 4px; background: #ffffff; border-radius: 6px; box-shadow: 0 0 15px rgba(0, 245, 255, 0.25);">
                                        <img src="qrcode_366631672_b43cf58aa0690b3ab9c14d955f7d6c19.png" style="width: 70px; height: 70px; display: block;" />
                                    </div>
                                    <div style="font-family: 'Montserrat', sans-serif; font-size: 8.5px; color: rgba(248, 250, 252, 0.5); text-align: center; letter-spacing: 0.3px;">
                                        Scan Node to Verify Authenticity
                                    </div>
                                </div>

                                <div style="text-align: center; width: 220px; font-family: 'Montserrat', sans-serif;">
                                    <div style="height: 38px; display: flex; align-items: center; justify-content: center; font-family: 'Courier New'; font-size: 14px; font-style: italic; color: rgba(255,255,255,0.2);"></div>
                                    <div style="border-top: 1px solid rgba(248, 250, 252, 0.3); padding-top: 6px; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">President</div>
                                    <div style="font-size: 11px; color: rgba(248, 250, 252, 0.5); margin-top: 1px;">Rajshahi Olympiad Society</div>
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
            alert("Critical Error during certificate data generation grid setup.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-magic"></i> Generate Premium Certificate`;
        }
    });

    // ৫. আল্ট্রা প্রিসাইজ পিডিএফ এক্সপোর্ট ইঞ্জিন (নো প্রিন্ট ডায়ালগ, ক্রিস্প হাই-রেজোলিউশন ডাউনলোড)
    document.getElementById('downloadCertBtn').addEventListener('click', () => {
        const targetFrame = document.getElementById('certificatePaperFrame');
        
        const pdfOptions = {
            margin:       0,
            filename:     `Certificate-${currentCertNumber || 'ROS-MEMBER'}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2.5,         // ক্রিস্পি ও ব্লার-ফ্রি সুপার শার্প রেন্ডারিং এর জন্য স্কেল বুস্ট
                useCORS: true,      // ক্লাউড এন্টারপ্রাইজ এসেট বা পিএনজি ফন্ট ইন্টিগ্রেশন নিশ্চিত করতে
                logging: false 
            },
            jsPDF:        { 
                unit: 'px', 
                format: [1120, 792], // A4 ল্যান্ডস্কেপের স্ট্যান্ডার্ড পিক্সেল রেশিও গ্রিড লকড
                orientation: 'landscape' 
            }
        };

        if (window.html2pdf) {
            html2pdf().set(pdfOptions).from(targetFrame).save();
        } else {
            alert("PDF Engine components are initializing. Please re-click in 2 seconds.");
        }
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => previewZone.style.display = 'none');
};
