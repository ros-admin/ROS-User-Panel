import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Cloudinary Credentials 
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcmu3hius/image/upload";
const UPLOAD_PRESET = "ros_uploads"; 

const loginForm = document.getElementById('loginForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const resetModal = document.getElementById('resetModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitResetBtn = document.getElementById('submitResetBtn');
const loginBtn = document.getElementById('loginBtn');

const resetSelfieInput = document.getElementById('resetSelfieInput');
const triggerSelfieBtn = document.getElementById('triggerSelfieBtn');
const selfieStatusText = document.getElementById('selfieStatusText');

let selectedSelfieBase64 = null;

function showPopupNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-popup toast-${type}`;
  
  let icon = '<i class="fas fa-check-circle" style="color: #00b4d8;"></i>';
  if (type === 'error') icon = '<i class="fas fa-times-circle" style="color: #ff4d6d;"></i>';
  if (type === 'warning') icon = '<i class="fas fa-exclamation-circle" style="color: #fbbf24;"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => { toast.remove(); }, 400);
  }, 3000);
}

forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  resetModal.style.display = 'block';
  selectedSelfieBase64 = null;
  selfieStatusText.innerText = "";
  resetSelfieInput.value = "";
});

closeModalBtn.addEventListener('click', () => {
  resetModal.style.display = 'none';
});

triggerSelfieBtn.addEventListener('click', () => {
  resetSelfieInput.click();
});

// সেলফি ফাইল ১ এমবির নিচে কম্প্রেশন লজিক
resetSelfieInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selfieStatusText.innerText = "ছবি প্রসেস হচ্ছে...";

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const MAX_WIDTH = 800;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      selectedSelfieBase64 = canvas.toDataURL('image/jpeg', 0.7); 
      selfieStatusText.innerHTML = `<i class="fas fa-check"></i> সেলফি রেডি হয়েছে (১ মেগাবাইটের কম)`;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

async function findEmailByIdentifier(identifier) {
  if (identifier.includes('@')) return identifier; 
  const q = query(collection(db, "users"), where("memberId", "==", identifier));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("এই মেম্বার আইডিটি ডাটাবেজে নিবন্ধিত নেই!");
  return snap.docs[0].data().email;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  loginBtn.innerText = "যাচাই করা হচ্ছে...";
  loginBtn.disabled = true;

  try {
    const email = await findEmailByIdentifier(identifier);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) throw new Error("ইউজার ডাটাবেজ প্রোফাইল খুঁজে পাওয়া যায়নি!");
    const userData = querySnapshot.docs[0].data();

    if (userData.status === "pending") {
      showPopupNotification("আপনার অ্যাকাউন্টটি এখনো পেন্ডিং অবস্থায় আছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।", "warning");
      auth.signOut();
      return;
    }

    showPopupNotification("লগইন সফল! রিডাইরেক্ট করা হচ্ছে...", "success");

    setTimeout(() => {
      if (userData.role === "super_admin" || userData.role === "president" || userData.role === "secretary") {
        window.location.href = "admin/dashboard.html";
      } else if (userData.role === "general_member") {
        window.location.href = "member/dashboard.html";
      } else {
        showPopupNotification("রোল ডিফাইন করা নেই! অ্যাডমিনের সাথে যোগাযোগ করুন।", "error");
      }
    }, 1000);

  } catch (error) {
    showPopupNotification("লগইন ব্যর্থ হয়েছে: " + error.message, "error");
  } finally {
    loginBtn.innerText = "পোর্টালে প্রবেশ করুন";
    loginBtn.disabled = false;
  }
});

submitResetBtn.addEventListener('click', async () => {
  const resetIdentifier = document.getElementById('resetIdentifier').value.trim();
  if (!resetIdentifier) return showPopupNotification("মেম্বার আইডি বা মোবাইল নম্বর দিন!", "warning");
  
  if (!selectedSelfieBase64) {
    return showPopupNotification("নিরাপত্তাজনিত কারণে ভেরিফিকেশনের জন্য সেলফি তোলা বাধ্যতামূলক!", "error");
  }

  submitResetBtn.innerText = "ক্লাউডে আপলোড হচ্ছে...";
  submitResetBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("file", selectedSelfieBase64);
    formData.append("upload_preset", UPLOAD_PRESET);

    const cloudRes = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
    if (!cloudRes.ok) throw new Error("Cloudinary সার্ভারে ছবি আপলোড ব্যর্থ হয়েছে।");
    
    const cloudData = await cloudRes.json();
    const liveImageUrl = cloudData.secure_url; 
    const imagePublicId = cloudData.public_id; 

    submitResetBtn.innerText = "রিকোয়েস্ট পাঠানো হচ্ছে...";

    await addDoc(collection(db, "password_resets"), {
      identifier: resetIdentifier,
      liveImageUrl: liveImageUrl,
      cloudinaryPublicId: imagePublicId, 
      status: "pending",
      requestedAt: new Date().toISOString()
    });

    showPopupNotification("আপনার ভেরিফিকেশন সেলফিসহ রিকোয়েস্টটি অ্যাডমিন প্যানেলে পাঠানো হয়েছে।", "success");
    resetModal.style.display = 'none';

  } catch (error) {
    showPopupNotification("ভেরিফিকেশন সাবমিট ব্যর্থ: " + error.message, "error");
  } finally {
    submitResetBtn.innerText = "রিকোয়েস্ট পাঠান";
    submitResetBtn.disabled = false;
  }
});
