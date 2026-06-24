/**
 * ROS Nexus - Premium Membership Certificate Module
 * File: ../admin/certificate.js
 * Design: Royal Landscape Theme (Inspired by User Sketch 1000363780.jpg)
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where) {
    
    // মডিউলের মূল ইউজার ইন্টারফেস (UI) জেনারেশন
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid var(--neon-yellow);">
            <h2 style="color: var(--neon-yellow); font-size: 20px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-award"></i> মেম্বারশিপ সার্টিফিকেট জেনারেটর প্যানেল
            </h2>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                সদস্যদের নাম বা ফায়ারবেস আইডি লিখে খুঁজুন এবং একক ক্লিকে প্রিন্ট-রেডি রয়্যাল সার্টিফিকেট জেনারেট করুন।
            </p>
            
            <div style="display: flex; gap: 10px; max-width: 500px; margin-bottom: 20px;">
                <input type="text" id="certSearchInput" placeholder="সদস্যের নাম বা আইডি দিয়ে খুঁজুন..." 
                       style="flex: 1; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 11px 15px; border-radius: 6px; color: #fff; font-size: 14px;">
                <button id="certSearchBtn" class="cyber-glass" style="padding: 0 22px; color: var(--neon-blue); cursor: pointer; border-radius: 6px; font-weight: bold; background: rgba(0, 180, 216, 0.05); transition: 0.3s;">
                    <i class="fas fa-search"></i> খুঁজুন
                </button>
            </div>

            <div id="certResultArea" style="display: none; margin-top: 15px; animation: modalSlideUp 0.3s ease;">
                <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">সদস্য প্রোফাইল সিলেক্ট করুন:</label>
                <select id="certMemberSelect" style="width: 100%; max-width: 500px; background: #0b0f19; border: 1px solid var(--glass-border); padding: 10px; border-radius: 6px; color: #fff; font-size: 14px; margin-bottom: 15px; cubic-bezier(0.4, 0, 0.2, 1);"></select>
                <br>
                <button id="generateCertBtn" style="background: var(--neon-yellow); color: #030712; padding: 10px 25px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                    <i class="fas fa-magic"></i> সার্টিফিকেট প্রিভিউ করুন
                </button>
            </div>
        </div>

        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 25px; margin-top: 20px;">
            
            <div style="display: flex; gap: 15px; background: rgba(17, 24, 39, 0.4); padding: 10px 20px; border-radius: 30px; border: 1px solid var(--glass-border);">
                <button id="printCertBtn" style="background: var(--neon-green); color: #030712; padding: 8px 22px; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                    <i class="fas fa-print"></i> প্রিন্ট / PDF সংরক্ষণ
                </button>
                <button id="closeCertBtn" style="background: rgba(230, 57, 70, 0.2); color: var(--neon-red); border: 1px solid var(--neon-red); padding: 8px 22px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 13px;">
                    প্রিভিউ বন্ধ করুন
                </button>
            </div>

            <div id="certificatePaperFrame" class="premium-cert-print-node" style="width: 842px; height: 595px; background: #ffffff; color: #000000; box-sizing: border-box; padding: 40px; position: relative; font-family: 'Hind Siliguri', sans-serif; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.6); border-radius: 4px;">
                
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 3px solid #b392ac; box-sizing: border-box; pointer-events: none;"></div>
                <div style="position: absolute; top: 26px; left: 26px; right: 26px; bottom: 26px; border: 1px solid #b392ac; box-sizing: border-box; pointer-events: none;"></div>
                
                <div style="position: absolute; top: 22px; left: 22px; width: 30px; height: 30px; border-top: 5px solid #d4af37; border-left: 5px solid #d4af37; pointer-events: none;"></div>
                <div style="position: absolute; top: 22px; right: 22px; width: 30px; height: 30px; border-top: 5px solid #d4af37; border-right: 5px solid #d4af37; pointer-events: none;"></div>
                <div style="position: absolute; bottom: 22px; left: 22px; width: 30px; height: 30px; border-bottom: 5px solid #d4af37; border-left: 5px solid #d4af37; pointer-events: none;"></div>
                <div style="position: absolute; bottom: 22px; right: 22px; width: 30px; height: 30px; border-bottom: 5px solid #d4af37; border-right: 5px solid #d4af37; pointer-events: none;"></div>

                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; width: 300px; height: 300px; background: url('https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png') no-repeat center center; background-size: contain; pointer-events: none;"></div>

                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; box-sizing: border-box; padding: 20px 15px;">
                    
                    <div style="margin-top: 10px;">
                        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width: 60px; height: 60px; margin-bottom: 5px;">
                        <h1 style="font-family: 'Orbitron', sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: 1.5px;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #475569; margin-top: 2px; font-family: 'Arial';">Official Corporate Member Network</p>
                    </div>

                    <div style="margin-top: -10px;">
                        <h2 style="font-family: 'Galada', cursive; font-size: 40px; color: #b38600; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); margin: 0;">মেম্বারশিপ সার্টিফিকেট</h2>
                        <p style="font-size: 15px; color: #475569; font-style: italic; margin-top: 10px;">এই মর্মে অত্যন্ত আনন্দের সাথে প্রত্যয়ন করা যাচ্ছে যে,</p>
                        
                        <h3 id="certTargetName" style="font-size: 28px; font-weight: 700; color: #0284c7; margin: 15px 0; padding: 0 40px; border-bottom: 2px dashed #bae6fd; display: inline-block;">- - -</h3>
                        
                        <p style="font-size: 14.5px; color: #334155; max-width: 620px; line-height: 1.7; margin: 0 auto; text-align: center;">
                            সফলভাবে সকল শর্তাবলী পূরণপূর্বক <span style="font-weight: 700; color: #0f172a;">রাজশাহী অলিম্পিয়াড সোসাইটি (ROS)</span> এর একজন অফিশিয়াল নিবন্ধিত মেম্বার হিসেবে অন্তর্ভুক্ত হয়েছেন। ডাটাবেজের নিয়মানুযায়ী সংগঠনে তার এই সদস্যপদটি সম্পূর্ণ বৈধ ও সক্রিয়।
                        </p>
                    </div>

                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 35px; box-sizing: border-box; margin-bottom: 10px;">
                        
                        <div style="text-align: left; font-size: 12px; color: #475569; line-height: 1.7;">
                            <p style="margin: 2px 0;"><strong>সদস্য আইডি:</strong> <span id="certTargetId" style="font-family: 'Arial'; font-weight: bold; color: #0f172a;">—</span></p>
                            <p style="margin: 2px 0;"><strong>অফিশিয়াল পদবী:</strong> <span id="certTargetRole" style="color: #0284c7; font-weight: 600;">—</span></p>
                            <p style="margin: 2px 0;"><strong>ইস্যু তারিখ:</strong> <span id="certIssueDate">—</span></p>
                        </div>

                        <div style="text-align: center; position: relative; width: 160px;">
                            <div style="position: absolute; top: -35px; left: -25px; border: 2px dashed #059669; color: #059669; font-family: 'Arial'; font-size: 8px; font-weight: bold; text-transform: uppercase; padding: 3px 6px; transform: rotate(-12deg); border-radius: 4px; background: #fff; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(5,150,105,0.1); z-index: 5; pointer-events: none; user-select: none;">
                                <i class="fas fa-check-circle"></i> SYSTEM VERIFIED
                            </div>
                            
                            <div style="border-top: 1.5px solid #334155; padding-top: 5px; width: 100%;">
                                <p style="font-weight: 700; color: #0f172a; font-size: 12px; margin: 0;">কর্তৃপক্ষ</p>
                                <p style="font-size: 10px; color: #64748b; margin-top: 1px;">রাজশাহী অলিম্পিয়াড সোসাইটি</p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>

        <style>
            @media print {
                /* ড্যাশবোর্ডের চারপাশের ডার্ক সাইডবার, হেডার ও বাটন প্রিন্ট স্ক্রিন থেকে সম্পূর্ণ উধাও করবে */
                body *, .top-bar, .sidebar-nav, .cyber-glass, button, style { 
                    visibility: hidden !important; 
                    box-shadow: none !important;
                }
                /* শুধুমাত্র এই ক্লাসের এলিমেন্ট এবং এর ভেতরের এলিমেন্ট দৃশ্যমান হবে */
                .premium-cert-print-node, .premium-cert-print-node * { 
                    visibility: visible !important; 
                }
                .premium-cert-print-node { 
                    position: fixed !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 100% !important; 
                    height: 100% !important; 
                    border: none !important;
                    margin: 0 !important; 
                    padding: 40px !important;
                    box-sizing: border-box !important;
                    page-break-inside: avoid !important;
                }
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
            }
        </style>
    `;

    // এলিমেন্ট সমূহের রেফারেন্স কালেকশন
    const searchInput = document.getElementById('certSearchInput');
    const searchBtn = document.getElementById('certSearchBtn');
    const resultArea = document.getElementById('certResultArea');
    const memberSelect = document.getElementById('certMemberSelect');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    
    let searchedMembersList = [];

    // ১. ফায়ারবেস Firestore থেকে ইন্টেলিজেন্ট মেম্বার সার্চিং মেকানিজম
    searchBtn.addEventListener('click', async () => {
        const queryStr = searchInput.value.trim();
        if(!queryStr) return alert("অনুগ্রহ করে সদস্যের নাম অথবা মেম্বার আইডি টাইপ করুন!");

        searchBtn.disabled = true;
        searchBtn.innerText = "সার্চ হচ্ছে...";

        try {
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            
            memberSelect.innerHTML = "";
            searchedMembersList = [];

            snapshot.forEach((snap) => {
                const data = snap.data();
                const englishNameStr = data.englishName || "";
                const fullNameStr = data.fullName || "";
                const docId = snap.id;
                
                // নাম বা ফায়ারবেস ডকুমেন্টের আইডির সাথে কি-ওয়ার্ড ফিল্টার ম্যাপ
                if(englishNameStr.toLowerCase().includes(queryStr.toLowerCase()) || 
                   fullNameStr.toLowerCase().includes(queryStr.toLowerCase()) || 
                   docId.includes(queryStr)) {
                    
                    searchedMembersList.push({ uid: docId, ...data });
                    
                    const opt = document.createElement('option');
                    opt.value = docId;
                    opt.innerText = `${data.banglaName || englishNameStr || fullNameStr} — (${data.role === 'general_member' ? 'সাধারণ সদস্য' : (data.role || 'সদস্য')}) — ID: ${docId.substring(0,12)}`;
                    memberSelect.appendChild(opt);
                }
            });

            if(searchedMembersList.length > 0) {
                resultArea.style.display = 'block';
            } else {
                alert("দুঃখিত, এই নাম বা আইডি দিয়ে কোনো নিবন্ধিত সদস্যের তথ্য ডাটাবেজে পাওয়া যায়নি!");
                resultArea.style.display = 'none';
            }
        } catch (err) {
            console.error("Certificate Search Engine Error:", err);
            alert("ডাটাবেজ থেকে তথ্য রিড করতে সমস্যা হয়েছে। কনসোল চেক করুন।");
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = `<i class="fas fa-search"></i> খুঁজুন`;
        }
    });

    // ২. সিলেক্টেড মেম্বারের রিয়েল-টাইম ডাটা সার্টিফিকেটে ইনজেক্ট করা
    generateBtn.addEventListener('click', () => {
        const activeUid = memberSelect.value;
        const selectedMember = searchedMembersList.find(m => m.uid === activeUid);

        if(!selectedMember) return alert("দয়া করে একজন বৈধ সদস্য সিলেক্ট করুন!");

        // মেম্বারশিপ সার্টিফিকেটের ভেতরের ভ্যারিয়েবল রেন্ডারিং
        document.getElementById('certTargetName').innerText = (selectedMember.englishName || selectedMember.fullName || "MEMBER PROFILE").toUpperCase();
        document.getElementById('certTargetId').innerText = (selectedMember.memberId || selectedMember.registrationNo || activeUid).toUpperCase();
        document.getElementById('certTargetRole').innerText = selectedMember.role === 'general_member' ? 'GENERAL MEMBER' : (selectedMember.role ? selectedMember.role.toUpperCase().replace('_', ' ') : 'MEMBER');
        
        // মেম্বার ক্রিয়েশন বা ইস্যুর বর্তমান ডেট ফরম্যাটিং
        const issueDateObj = selectedMember.createdAt ? new Date(selectedMember.createdAt) : new Date();
        document.getElementById('certIssueDate').innerText = issueDateObj.toLocaleDateString('bn-BD');

        // প্রিভিউ প্যানেল অন করা এবং স্ক্রল অ্যানিমেশন
        previewZone.style.display = 'flex';
        previewZone.scrollIntoView({ behavior: 'smooth' });
    });

    // ৩. সিস্টেম প্রিন্ট ডায়ালগ এবং মডাল ট্রিপ ইভেন্টস
    document.getElementById('printCertBtn').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => {
        previewZone.style.display = 'none';
    });
};
