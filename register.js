import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const sameAddressCheck = document.getElementById('sameAddressCheck');
const presentAddress = document.getElementById('presentAddress');
const permanentAddress = document.getElementById('permanentAddress');
const registrationForm = document.getElementById('registrationForm');

// 'Same as Present Address' লজিক টগল
sameAddressCheck.addEventListener('change', () => {
  if (sameAddressCheck.checked) {
    permanentAddress.value = presentAddress.value;
    permanentAddress.readOnly = true;
  } else {
    permanentAddress.value = "";
    permanentAddress.readOnly = false;
  }
});

// Cloudinary-তে ছবি আপলোড করার সিকিউর ফাংশন
async function uploadToCloudinary(file) {
  const cloudName = "dcmu3hius"; 
  const unsignedUploadPreset = "ros_uploads"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", unsignedUploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  
  if (!res.ok) throw new Error("Cloudinary ইমেজ আপলোড ব্যর্থ হয়েছে!");
  const data = await res.json();
  return data.secure_url; 
}

// ট্রানজেকশন ভিত্তিক সিকিউর অটো মেম্বার আইডি জেনারেটর (ROS-2026-XXXX)
async function generateNextMemberId() {
  const currentYear = 2026; 
  const counterRef = doc(db, "settings", "member_counter");
  
  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let nextCount = 1;
    
    if (counterDoc.exists()) {
      nextCount = counterDoc.data().lastCount + 1;
    }
    
    transaction.set(counterRef, { lastCount: nextCount }, { merge: true });
    return `ROS-${currentYear}-${String(nextCount).padStart(4, '0')}`;
  });
}

// মূল ফর্ম সাবমিশন প্রসেসর
registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.innerText = "প্রসেসিং হচ্ছে, অপেক্ষা করুন...";
  submitBtn.disabled = true;

  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobileNumber').value.trim();
  const photoFile = document.getElementById('profilePhoto').files[0];

  // ফটো সাইজ লিমিট হ্যান্ডলিং (Max 512KB)
  if (photoFile.size > 512 * 1024) {
    alert("ত্রুটি: প্রোফাইল ছবির সাইজ ৫১২ কেবির বেশি হতে পারবে না!");
    submitBtn.innerText = "রেজিস্ট্রেশন সাবমিট করুন";
    submitBtn.disabled = false;
    return;
  }

  try {
    // ১. ডাটাবেজে ডুপ্লিকেট মোবাইল বা ইমেইল আছে কিনা তা যাচাই
    const qMobile = query(collection(db, "users"), where("mobileNumber", "==", mobile));
    const mobileSnap = await getDocs(qMobile);
    if (!mobileSnap.empty) throw new Error("এই মোবাইল নম্বরটি দিয়ে অলরেডি রেজিস্ট্রেশন করা হয়েছে!");

    // ২. ক্লাউডিনারিতে ছবি আপলোড
    const uploadedPhotoUrl = await uploadToCloudinary(photoFile);

    // ৩. মেম্বার আইডি জেনারেট
    const nextMemberId = await generateNextMemberId();

    // ৪. ফায়ারবেস অথেনটিকেশনে ডিফল্ট পাসওয়ার্ড দিয়ে মেম্বার তৈরি
    const defaultPassword = "ROS@1234";
    const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
    const user = userCredential.user;

    // ৫. ফায়ারস্টোর ডেটাবেজে মেম্বার রেকর্ড তৈরি
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      memberId: nextMemberId,
      banglaName: document.getElementById('banglaName').value,
      englishName: document.getElementById('englishName').value,
      fatherName: document.getElementById('fatherName').value,
      motherName: document.getElementById('motherName').value,
      mobileNumber: mobile,
      email: email,
      gender: document.getElementById('gender').value,
      dob: document.getElementById('dob').value,
      presentAddress: presentAddress.value,
      permanentAddress: permanentAddress.value,
      education: document.getElementById('education').value,
      academicYear: document.getElementById('academicYear').value,
      profession: document.getElementById('profession').value,
      institution: document.getElementById('institution').value,
      photoUrl: uploadedPhotoUrl,
      whatsappNumber: document.getElementById('whatsappNumber').value || "",
      facebookLink: document.getElementById('facebookLink').value || "",
      nidOrBrn: document.getElementById('nidOrBrn').value || "",
      status: "pending",
      role: "general_member",
      isPasswordChanged: false,
      createdAt: new Date().toISOString()
    });

    alert(`রেজিস্ট্রেশন সফল! আপনার মেম্বার আইডি: ${nextMemberId}\nডিফল্ট পাসওয়ার্ড: ${defaultPassword}\nঅ্যাডমিন প্যানেল থেকে অনুমোদনের পর আপনি ড্যাশবোর্ড ব্যবহার করতে পারবেন।`);
    registrationForm.reset();
    window.location.href = "login.html";

  } catch (error) {
    alert("রেজিস্ট্রেশন ব্যর্থ হয়েছে: " + error.message);
  } finally {
    submitBtn.innerText = "রেজিস্ট্রেশন সাবমিট করুন";
    submitBtn.disabled = false;
  }
});

