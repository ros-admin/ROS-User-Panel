import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const resetModal = document.getElementById('resetModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitResetBtn = document.getElementById('submitResetBtn');

// মডাল কন্ট্রোল
forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); resetModal.style.display = 'block'; });
closeModalBtn.addEventListener('click', () => { resetModal.style.display = 'none'; });

// মেম্বার আইডি অবজেক্ট থেকে রিয়েল ইমেইল বের করার মেকানিজম
async function findEmailByIdentifier(identifier) {
  if (identifier.includes('@')) return identifier; // ইউজার সরাসরি ইমেইল দিয়েছে

  // মেম্বার আইডি দিয়ে কোয়েরি
  const q = query(collection(db, "users"), where("memberId", "==", identifier));
  const snap = await getDocs(q);
  
  if (snap.empty) throw new Error("এই মেম্বার আইডিটি ডাটাবেজে নিবন্ধিত নেই!");
  return snap.docs[0].data().email;
}

// সাইন-ইন এবং রোল-ভিত্তিক রাউটিং লজিক
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.innerText = "অথেনটিকেশন যাচাই হচ্ছে...";
  loginBtn.disabled = true;

  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const resolvedEmail = await findEmailByIdentifier(identifier);
    const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
    
    // ফায়ারস্টোর থেকে রোল এবং স্ট্যাটাস চেক
    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userCredential.user.uid)));
    const userData = userDoc.docs[0].data();

    // স্ট্যাটাস পেন্ডিং হলে ড্যাশবোর্ডে ঢুকতে দেওয়া হবে না
    if (userData.status === "pending") {
      alert("আপনার অ্যাকাউন্টটি এখনো পেন্ডিং অবস্থায় আছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।");
      auth.signOut();
      return;
    }

    // রোল অনুযায়ী স্পেসিফিক ড্যাশবোর্ড ফোল্ডারে রিডাইরেকশন
    if (userData.role === "super_admin" || userData.role === "president" || userData.role === "secretary") {
      window.location.href = "admin/dashboard.html";
    } else if (userData.role === "general_member") {
      window.location.href = "member/dashboard.html";
    } else {
      alert("রোল ডিফাইন করা নেই! অ্যাডমিনের সাথে যোগাযোগ করুন।");
    }

  } catch (error) {
    alert("লগইন ব্যর্থ হয়েছে: " + error.message);
  } finally {
    loginBtn.innerText = "পোর্টালে প্রবেশ করুন";
    loginBtn.disabled = false;
  }
});

// পাসওয়ার্ড রিসেট রিকোয়েস্ট কুউতে পুশ লজিক
submitResetBtn.addEventListener('click', async () => {
  const resetIdentifier = document.getElementById('resetIdentifier').value.trim();
  if (!resetIdentifier) return alert("মেম্বার আইডি বা মোবাইল নম্বর দিন!");

  try {
    await addDoc(collection(db, "password_resets"), {
      identifier: resetIdentifier,
      status: "pending",
      requestedAt: new Date().toISOString()
    });
    alert("আপনার পাসওয়ার্ড রিসেট রিকোয়েস্ট অ্যাডমিনদের প্যানেলে পাঠানো হয়েছে। সফল রিসেটের পর আপনার পাসওয়ার্ড হবে ROS@1234");
    resetModal.style.display = 'none';
  } catch (err) {
    alert("রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে: " + err.message);
  }
});
