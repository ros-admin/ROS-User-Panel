import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const resetModal = document.getElementById('resetModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitResetBtn = document.getElementById('submitResetBtn');
const loginBtn = document.getElementById('loginBtn');

// ৩ সেকেন্ডে স্লাইড-আউট হয়ে চলে যাওয়া গ্লোবাল নোটিফিকেশন পপআপ ইঞ্জিন
function showPopupNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-popup toast-${type}`;
  
  // টাইপ অনুযায়ী আইকন নির্ধারণ
  let icon = '<i class="fas fa-check-circle" style="color: #00b4d8;"></i>';
  if (type === 'error') icon = '<i class="fas fa-times-circle" style="color: #ff4d6d;"></i>';
  if (type === 'warning') icon = '<i class="fas fa-exclamation-circle" style="color: #fbbf24;"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // ঠিক ৩ সেকেন্ড পর হারিয়ে যাওয়ার মেকানিজম
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// মডাল কন্ট্রোল
forgotPasswordLink.addEventListener('click', (e) => { 
  e.preventDefault(); 
  resetModal.style.display = 'block'; 
});
closeModalBtn.addEventListener('click', () => { 
  resetModal.style.display = 'none'; 
});

// মেম্বার আইডি অবজেক্ট থেকে রিয়েল ইমেইল বের করার মেকানিজম
async function findEmailByIdentifier(identifier) {
  if (identifier.includes('@')) return identifier; // ইউজার সরাসরি ইমেইল দিয়েছে

  // মেম্বার আইডি দিয়ে কোয়েরি
  const q = query(collection(db, "users"), where("memberId", "==", identifier));
  const snap = await getDocs(q);
  
  if (snap.empty) throw new Error("এই মেম্বার আইডিটি ডাটাবেজে নিবন্ধিত নেই!");
  return snap.docs[0].data().email;
}

// সাইন-ইন এবং রোল-ভিত্তিক রাউটিং লজিক (কোড লজিক সম্পূর্ণ অক্ষুণ্ণ)
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  loginBtn.innerText = "যাচাই করা হচ্ছে...";
  loginBtn.disabled = true;

  try {
    // ইডি বা ইমেইল থেকে রিয়েল ইমেইল ডিটেকশন
    const resolvedEmail = await findEmailByIdentifier(identifier);
    
    // Firebase Auth সাইন ইন
    const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
    const user = userCredential.user;

    // মেম্বার ডেটাবেজ স্ন্যাপশট চেক
    const userDocRef = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(userDocRef);

    if (querySnapshot.empty) {
      showPopupNotification("আপনার প্রোফাইল ডাটাবেজে খুঁজে পাওয়া যায়নি!", "error");
      auth.signOut();
      return;
    }

    const userData = querySnapshot.docs[0].data();

    // স্ট্যাটাস পেন্ডিং হলে ড্যাশবোর্ডে ঢুকতে দেওয়া হবে না
    if (userData.status === "pending") {
      showPopupNotification("আপনার অ্যাকাউন্টটি এখনো পেন্ডিং অবস্থায় আছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।", "warning");
      auth.signOut();
      return;
    }

    showPopupNotification("লগইন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...", "success");

    // রোল অনুযায়ী স্পেসিফিক ড্যাশবোর্ড ফোল্ডারে রিডাইরেকশন
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

// পাসওয়ার্ড রিসেট রিকোয়েস্ট কুউতে পুশ লজিক
submitResetBtn.addEventListener('click', async () => {
  const resetIdentifier = document.getElementById('resetIdentifier').value.trim();
  if (!resetIdentifier) return showPopupNotification("মেম্বার আইডি বা মোবাইল নম্বর দিন!", "warning");

  try {
    await addDoc(collection(db, "password_resets"), {
      identifier: resetIdentifier,
      status: "pending",
      requestedAt: new Date().toISOString()
    });
    showPopupNotification("আপনার পাসওয়ার্ড রিসেট রিকোয়েস্ট অ্যাডমিনদের প্যানেলে পাঠানো হয়েছে।", "success");
    resetModal.style.display = 'none';
    document.getElementById('resetIdentifier').value = "";
  } catch (err) {
    showPopupNotification("রিকোয়েস্ট সাবমিট করা যায়নি। আবার চেষ্টা করুন।", "error");
  }
});
