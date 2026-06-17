import { db, auth } from '../firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM উপাদানসমূহ লিঙ্কিং
const mCardName = document.getElementById('mCardName');
const mCardMemberId = document.getElementById('mCardMemberId');
const mCardEmail = document.getElementById('mCardEmail');
const mCardPhone = document.getElementById('mCardPhone');
const mCardPhoto = document.getElementById('mCardPhoto');
const mStatusBadge = document.getElementById('mStatusBadge');
const mLogoutBtn = document.getElementById('memberLogoutBtn');
const mQrcodeContainer = document.getElementById('mQrcode');

let qrcodeInstance = null;

// ইউজার লগইন স্টেট এবং ডাটা লোড মনিটর
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // ইউজারের UID দিয়ে Firestore থেকে ডাটা রিড করা
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // ১. আইডি কার্ডের ইন্টারফেসে ডাটা বসানো
        mCardName.innerText = userData.englishName || "No Name";
        mCardMemberId.innerText = userData.memberId || "Assigning...";
        mCardEmail.innerText = userData.email;
        mCardPhone.innerText = userData.mobileNumber || "N/A";
        
        if (userData.photoUrl) {
          mCardPhoto.src = userData.photoUrl;
        }

        // ২. মেম্বার স্ট্যাটাস ব্যাজ আপডেট করা
        if (userData.status === "active") {
          mStatusBadge.innerText = "ACTIVE";
          mStatusBadge.style.background = "rgba(46, 196, 182, 0.15)";
          mStatusBadge.style.color = "#2ec4b6";
          mStatusBadge.style.borderColor = "rgba(46, 196, 182, 0.4)";
        } else {
          mStatusBadge.innerText = "PENDING";
          mStatusBadge.style.background = "rgba(255, 159, 67, 0.15)";
          mStatusBadge.style.color = "#ff9f43";
          mStatusBadge.style.borderColor = "rgba(255, 159, 67, 0.4)";
        }

        // ৩. ডাইনামিক কিউআর কোড জেনারেশন (ভেরিফিকেশনের জন্য)
        const verificationUrl = `https://ros-user-panel.vercel.app/verify.html?id=${userData.memberId}`;
        
        if (!qrcodeInstance) {
          qrcodeInstance = new QRCode(mQrcodeContainer, {
            text: verificationUrl,
            width: 55,
            height: 55,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
          });
        } else {
          qrcodeInstance.clear();
          qrcodeInstance.makeCode(verificationUrl);
        }

      } else {
        alert("দুঃখিত, আপনার মেম্বার প্রোফাইল ডাটাবেজে পাওয়া যায়নি।");
        window.location.href = "../login.html";
      }
    } catch (error) {
      console.error("Error loading member dashboard:", error);
      alert("ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।");
    }
  } else {
    // সেশন না থাকলে বা লগআউট করা থাকলে সরাসরি লগইন পেজে রিডাইরেক্ট
    window.location.href = "../login.html";
  }
});

// লগআউট হ্যান্ডলার
mLogoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = "../login.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
});

