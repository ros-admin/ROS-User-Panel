import { db, auth } from '../firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const pendingContainer = document.getElementById('pendingContainer');
const resetContainer = document.getElementById('resetContainer');
const pendingCount = document.getElementById('pendingCount');
const logoutBtn = document.getElementById('logoutBtn');

// ১. রিয়েল-টাইম পেন্ডিং মেম্বার লিস্ট লোড করা
const qPending = query(collection(db, "users"), where("status", "==", "pending"));
onSnapshot(qPending, (snapshot) => {
  pendingContainer.innerHTML = "";
  pendingCount.innerText = snapshot.size;

  if (snapshot.empty) {
    pendingContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">কোনো পেন্ডিং মেম্বার নেই।</p>`;
    return;
  }

  snapshot.forEach((userDoc) => {
    const user = userDoc.data();
    const card = document.createElement('div');
    card.className = "cyber-card";
    card.style.background = "rgba(2, 12, 27, 0.6)";
    card.style.margin = "0";
    card.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
        <img src="${user.photoUrl || '../placeholder.png'}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid var(--secondary);">
        <div>
          <h4 style="margin: 0; color: #fff;">${user.englishName}</h4>
          <small style="color: var(--accent); font-weight: bold;">ID: ${user.memberId}</small><br>
          <small style="color: var(--text-muted);">${user.email} | ${user.mobileNumber}</small>
        </div>
      </div>
      <div style="font-size: 12px; color: var(--text-light); margin-bottom: 12px;">
        <strong>শিক্ষা:</strong> ${user.education} (${user.academicYear}) | <strong>পেশা:</strong> ${user.profession}
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="cyber-btn approve-btn" data-id="${user.uid}" style="padding: 8px; font-size: 12px; background: linear-gradient(135deg, #4cc9f0, #00b4d8);">Approve</button>
        <button class="cyber-btn reject-btn" data-id="${user.uid}" style="padding: 8px; font-size: 12px; background: linear-gradient(135deg, #ff4d6d, #c9184a);">Reject</button>
      </div>
    `;
    pendingContainer.appendChild(card);
  });

  // বাটন ইভেন্ট লিসেনার যুক্ত করা
  document.querySelectorAll('.approve-btn').forEach(btn => btn.addEventListener('click', approveMember));
  document.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', rejectMember));
});

// ২. মেম্বার অ্যাপ্রুভ (Approve) করার লজিক
async function approveMember(e) {
  const uid = e.target.getAttribute('data-id');
  if (confirm("আপনি কি এই মেম্বারকে অনুমোদন দিতে চান?")) {
    try {
      await updateDoc(doc(db, "users", uid), { status: "active" });
      alert("মেম্বার সফলভাবে সক্রিয় করা হয়েছে!");
    } catch (err) {
      alert("অ্যাপ্রুভ করতে সমস্যা হয়েছে: " + err.message);
    }
  }
}

// ৩. মেম্বার রিজেক্ট (Reject) করার লজিক
async function rejectMember(e) {
  const uid = e.target.getAttribute('data-id');
  if (confirm("আপনি কি এই মেম্বার রিকোয়েস্টটি ডিলিট করতে চান?")) {
    try {
      await deleteDoc(doc(db, "users", uid));
      alert("মেম্বার রিকোয়েস্ট বাতিল ও ডিলিট করা হয়েছে।");
    } catch (err) {
      alert("বাতিল করতে সমস্যা হয়েছে: " + err.message);
    }
  }
}

// ৪. পাসওয়ার্ড রিসেট রিকোয়েস্ট কিউ লোড করা
const qResets = query(collection(db, "password_resets"), where("status", "==", "pending"));
onSnapshot(qResets, (snapshot) => {
  resetContainer.innerHTML = "";
  if (snapshot.empty) {
    resetContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">কোনো পাসওয়ার্ড রিসেট রিকোয়েস্ট নেই।</p>`;
    return;
  }

  snapshot.forEach((resetDoc) => {
    const data = resetDoc.data();
    const card = document.createElement('div');
    card.className = "cyber-card";
    card.style.background = "rgba(255, 77, 109, 0.05)";
    card.style.margin = "0";
    card.innerHTML = `
      <p style="margin: 0; font-size: 13px; color: #fff;"><strong>আইডি/মোবাইল:</strong> ${data.identifier}</p>
      <small style="color: var(--text-muted);">সময়: ${new Date(data.requestedAt).toLocaleString('bn-BD')}</small>
      <button class="cyber-btn reset-done-btn" data-id="${resetDoc.id}" style="margin-top: 10px; padding: 6px; font-size: 11px; background: var(--danger);">Reset to ROS@1234</button>
    `;
    resetContainer.appendChild(card);
  });

  document.querySelectorAll('.reset-done-btn').forEach(btn => btn.addEventListener('click', completePasswordReset));
});

// ৫. পাসওয়ার্ড রিসেট সম্পন্ন করা
async function completePasswordReset(e) {
  const docId = e.target.getAttribute('data-id');
  if (confirm("মেম্বারের পাসওয়ার্ড ROS@1234 এ রিসেট করা হয়েছে নিশ্চিত করছেন?")) {
    try {
      // রিকোয়েস্টটি কিউ থেকে ডিলিট বা সলভ করে দেওয়া
      await deleteDoc(doc(db, "password_resets", docId));
      alert("রিসেক্ট রিকোয়েস্ট সম্পন্ন হয়েছে। ইউজার এখন ডিফল্ট পাসওয়ার্ড দিয়ে ঢুকতে পারবেন।");
    } catch (err) {
      alert("সমস্যা হয়েছে: " + err.message);
    }
  }
}

// লগআউট লজিক
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = "../login.html";
  });
});

