/**
 * ROS Nexus - Membership Certificate Module
 * File: ../admin/certificate.js
 */

window.loadCertificatesModule = function(container, db, collection, onSnapshot, doc, getDocs, query, where) {
    container.innerHTML = `
        <div class="cyber-glass" style="padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--neon-blue); font-size: 20px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-certificate"></i> মেম্বারশিপ সার্টিফিকেট জেনারেটর
            </h2>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">
                সদস্যদের আইডি বা নাম দিয়ে সার্চ করুন এবং সরাসরি প্রিন্ট-রেডি সার্টিফিকেট জেনারেট করুন।
            </p>
            
            <!-- সার্চ বার -->
            <div style="display: flex; gap: 10px; max-width: 500px; margin-bottom: 25px;">
                <input type="text" id="certSearchInput" placeholder="সদস্য আইডি বা নাম লিখুন..." 
                       style="flex: 1; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 10px; border-radius: 6px; color: #fff;">
                <button id="certSearchBtn" class="cyber-glass" style="padding: 10px 20px; color: var(--neon-green); cursor: pointer; border-radius: 6px; font-weight: bold;">
                    <i class="fas fa-search"></i> খুঁজুন
                </button>
            </div>

            <!-- মেম্বার সিলেকশন ড্রপডাউন/ফলাফল -->
            <div id="certResultArea" style="display: none; margin-bottom: 25px;">
                <h4 style="color: var(--text-main); font-size: 14px; margin-bottom: 10px;">সদস্য নির্বাচন করুন:</h4>
                <select id="certMemberSelect" style="width: 100%; max-width: 500px; background: rgba(17, 24, 39, 0.9); border: 1px solid var(--glass-border); padding: 10px; border-radius: 6px; color: #fff; margin-bottom: 15px;">
                </select>
                <button id="generateCertBtn" style="background: var(--neon-blue); color: #030712; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-magic"></i> সার্টিফিকেট তৈরি করুন
                </button>
            </div>
        </div>

        <!-- সার্টিফিকেট প্রিভিউ জোন -->
        <div id="certificatePreviewZone" style="display: none; flex-direction: column; align-items: center; gap: 20px;">
            <div style="display: flex; gap: 15px;">
                <button id="printCertBtn" style="background: var(--neon-green); color: #030712; padding: 10px 25px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-print"></i> প্রিন্ট / PDF ডাউনলোড
                </button>
                <button id="closeCertBtn" style="background: var(--neon-red); color: #fff; padding: 10px 25px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    বোর্ড বন্ধ করুন
                </button>
            </div>

            <!-- লাইভ সার্টিফিকেট ডিজাইন টেমপ্লেট -->
            <div id="certificateFrame" class="print-section" style="width: 842px; height: 595px; background: #fff; color: #000; padding: 50px; border: 15px double #00b4d8; box-sizing: border-box; position: relative; font-family: 'Hind Siliguri', sans-serif; text-align: center; background-image: radial-gradient(circle, rgba(0,180,216,0.03) 10%, transparent 10%); background-size: 20px 20px;">
                <!-- সার্টিফিকেটের বর্ডার ডিজাইন ও ওয়াটারমার্ক -->
                <div style="border: 2px solid #030712; height: 100%; width: 100%; padding: 30px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                    
                    <div>
                        <h1 style="font-family: 'Orbitron', sans-serif; font-size: 28px; color: #00b4d8; letter-spacing: 2px; margin-bottom: 5px;">RAJSHAHI OLYMPIAD SOCIETY</h1>
                        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #555;">System Control & Enterprise Network</p>
                    </div>

                    <div>
                        <h2 style="font-family: 'Galada', cursive; font-size: 42px; color: #030712; margin-bottom: 10px;">মেম্বারশিপ সার্টিফিকেট</h2>
                        <p style="font-size: 16px; color: #444; font-style: italic;">এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,</p>
                        <h3 id="certTargetName" style="font-size: 26px; color: #00b4d8; margin: 15px 0; border-bottom: 2px dashed #00b4d8; display: inline-block; padding: 0 30px;">- - -</h3>
                        <p style="font-size: 15px; color: #444; max-width: 600px; line-height: 1.6; margin: 0 auto;">
                            তিনি অত্যন্ত নিষ্ঠার সাথে <span style="font-weight: bold; color: #030712;">রাজশাহী অলিম্পিয়াড সোসাইটি</span>-এর একজন নিবন্ধিত সদস্য হিসেবে যুক্ত আছেন। সংগঠনে তার সক্রিয় অংশগ্রহণ ও অবদান প্রশংসনীয়। 
                        </p>
                    </div>

                    <!-- সিগনেচার ও আইডি জোন -->
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px;">
                        <div style="text-align: left; font-size: 13px; color: #555;">
                            <p>সদস্য আইডি: <span id="certTargetId" style="font-weight: bold; color: #030712;">-</span></p>
                            <p>পদবী: <span id="certTargetRole">-</span></p>
                        </div>
                        <div style="text-align: center; font-size: 13px; color: #555;">
                            <div style="width: 150px; border-top: 1px solid #030712; margin-top: 40px; padding-top: 5px;">
                                <p style="font-weight: bold; color: #030712;">সভাপতি / সেক্রেটারি</p>
                                <p style="font-size: 11px;">কেন্দ্রীয় কমিটি, ROS</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- প্রিন্ট করার জন্য ডেডিকেটেড সিএসএস স্টাইল -->
        <style>
            @media print {
                body * { visibility: hidden; background: #fff !important; }
                .print-section, .print-section * { visibility: visible; }
                .print-section { position: absolute; left: 0; top: 0; width: 100% !important; height: 100% !important; border: none !important; }
            }
        </style>
    `;

    // লজিক ও ইভেন্ট হ্যান্ডলারসমূহ
    const searchInput = document.getElementById('certSearchInput');
    const searchBtn = document.getElementById('certSearchBtn');
    const resultArea = document.getElementById('certResultArea');
    const memberSelect = document.getElementById('certMemberSelect');
    const generateBtn = document.getElementById('generateCertBtn');
    const previewZone = document.getElementById('certificatePreviewZone');
    
    let searchedMembers = [];

    // ১. মেম্বার সার্চ লজিক (Firestore থেকে)
    searchBtn.addEventListener('click', async () => {
        const keyword = searchInput.value.trim();
        if(!keyword) return alert("অনুগ্রহ করে কিছু লিখুন!");

        searchBtn.disabled = true;
        searchBtn.innerText = "খুঁজছে...";

        try {
            // Firestore-এর 'users' কালেকশন থেকে ডাটা নেওয়া হচ্ছে
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            
            memberSelect.innerHTML = "";
            searchedMembers = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const name = data.fullName || data.englishName || "";
                const uid = docSnap.id;
                
                // নাম বা আইডি ম্যাচ করলে ফিল্টার করবে
                if(name.toLowerCase().includes(keyword.toLowerCase()) || uid.includes(keyword)) {
                    searchedMembers.push({ id: uid, ...data });
                    const option = document.createElement('option');
                    option.value = uid;
                    option.innerText = `${name} (${data.role || 'সদস্য'}) - ID: ${uid}`;
                    memberSelect.appendChild(option);
                }
            });

            if(searchedMembers.length > 0) {
                resultArea.style.display = 'block';
            } else {
                alert("কোন সদস্য খুঁজে পাওয়া যায়নি!");
                resultArea.style.display = 'none';
            }
        } catch (error) {
            console.error(error);
            alert("সার্চ করতে সমস্যা হয়েছে!");
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = `<i class="fas fa-search"></i> খুঁজুন`;
        }
    });

    // ২. সার্টিফিকেট ডাটা রেন্ডার লজিক
    generateBtn.addEventListener('click', () => {
        const selectedId = memberSelect.value;
        const member = searchedMembers.find(m => m.id === selectedId);

        if(!member) return;

        document.getElementById('certTargetName').innerText = member.englishName || member.fullName || "সদস্য";
        document.getElementById('certTargetId').innerText = member.id.substring(0, 10).toUpperCase();
        document.getElementById('certTargetRole').innerText = member.role ? member.role.toUpperCase().replace('_', ' ') : 'MEMBER';

        previewZone.style.display = 'flex';
        previewZone.scrollIntoView({ behavior: 'smooth' });
    });

    // ৩. প্রিন্ট ও ক্লোজ বাটন ইভেন্ট
    document.getElementById('printCertBtn').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('closeCertBtn').addEventListener('click', () => {
        previewZone.style.display = 'none';
    });
};

