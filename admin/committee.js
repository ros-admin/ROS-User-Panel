import { db } from '../firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const committeeForm = document.getElementById('committeeForm');
const committeeListContainer = document.getElementById('committeeListContainer');

// ১. ফায়ারস্টোরে নতুন কমিটি তৈরি (Save) করার লজিক
committeeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('comName').value.trim();
  const year = document.getElementById('comYear').value.trim();

  try {
    await addDoc(collection(db, "committees"), {
      committeeName: name,
      year: year,
      createdAt: new Date().toISOString(),
      status: "active"
    });

    alert("নতুন কমিটি সফলভাবে তৈরি করা হয়েছে!");
    committeeForm.reset();
  } catch (error) {
    console.error("Error creating committee:", error);
    alert("কমিটি তৈরিতে সমস্যা হয়েছে: " + error.message);
  }
});

// ২. রিয়েল-টাইমে তৈরি হওয়া কমিটিগুলোর লিস্ট দেখানোর লজic
const qCommittees = query(collection(db, "committees"), orderBy("createdAt", "desc"));
onSnapshot(qCommittees, (snapshot) => {
  committeeListContainer.innerHTML = "";

  if (snapshot.empty) {
    committeeListContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">এখনো কোনো কমিটি তৈরি করা হয়নি।</p>`;
    return;
  }

  snapshot.forEach((comDoc) => {
    const com = comDoc.data();
    const card = document.createElement('div');
    card.className = "cyber-card";
    card.style.background = "rgba(2, 12, 27, 0.4)";
    card.style.margin = "0";
    card.style.display = "flex";
    card.style.justifyContent = "between";
    card.style.alignItems = "center";
    
    card.innerHTML = `
      <div style="flex: 1;">
        <h4 style="margin: 0; color: #fff; font-size: 14px;">${com.committeeName}</h4>
        <small style="color: var(--accent);">মেয়াদ: ${com.year}</small>
      </div>
      <button class="cyber-btn assign-btn" data-id="${comDoc.id}" style="width: auto; padding: 6px 12px; font-size: 11px; background: rgba(0,180,216,0.2); border-color: var(--secondary);">পদবী দিন</button>
    `;
    committeeListContainer.appendChild(card);
  });

    // পদবী বণ্টন বাটনে ক্লিক করলে মেম্বার অ্যাসাইন পেজে নিয়ে যাবে
  document.querySelectorAll('.assign-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const committeeId = e.target.getAttribute('data-id');
      window.location.href = `assign-member.html?id=${committeeId}`;
    });
  });
});
