// Konfigurasi Firebase (Ganti sesuai Firebase Console lu)
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_LU",
  authDomain: "PASTE_AUTH_DOMAIN_LU",
  databaseURL: "PASTE_DATABASE_URL_LU",
  projectId: "PASTE_PROJECT_ID_LU",
  storageBucket: "PASTE_STORAGE_BUCKET_LU",
  messagingSenderId: "PASTE_SENDER_ID_LU",
  appId: "PASTE_APP_ID_LU"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// DOM Elements
const wcbForm = document.getElementById('wcbForm');
const countryTableBody = document.getElementById('countryTableBody');

// Simpan Data Negara ke Firebase Realtime Database
wcbForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const countryName = document.getElementById('countryName').value.trim();
  const euphRate = parseFloat(document.getElementById('euphRate').value);
  const localCurrency = document.getElementById('localCurrency').value.trim();
  const warehouseSupply = parseInt(document.getElementById('warehouseSupply').value);

  if (!countryName) return;

  db.ref('countries/' + countryName).set({
    name: countryName,
    euphRate: euphRate,
    currency: localCurrency,
    warehouse: warehouseSupply,
    status: 'Active',
    updatedAt: Date.now()
  })
  .then(() => {
    alert(`Data negara ${countryName} berhasil disimpan!`);
    wcbForm.reset();
  })
  .catch((err) => {
    alert("Gagal menyimpan data: " + err.message);
  });
});

// Sync Data Real-time ke Dashboard Table
db.ref('countries').on('value', (snapshot) => {
  countryTableBody.innerHTML = '';
  const data = snapshot.val();

  if (!data) {
    countryTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-4 text-center text-slate-500 italic">Belum ada data negara terdaftar.</td>
      </tr>`;
    return;
  }

  Object.keys(data).forEach((key) => {
    const item = data[key];
    const isFrozen = item.status === 'Frozen';

    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/50 transition-colors border-b border-slate-700/50";

    row.innerHTML = `
      <td class="py-3 px-3 font-semibold text-cyan-300">${item.name}</td>
      <td class="py-3 px-3 font-mono">${item.euphRate} EUPH</td>
      <td class="py-3 px-3">${item.currency}</td>
      <td class="py-3 px-3 font-mono">${item.warehouse ? item.warehouse.toLocaleString() : 0}</td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 text-xs rounded-full ${isFrozen ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
          ${item.status || 'Active'}
        </span>
      </td>
      <td class="py-3 px-3 text-right space-x-1">
        <button onclick="toggleFreeze('${item.name}', '${item.status}')" class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded">
          ${isFrozen ? 'Unfreeze' : 'Freeze'}
        </button>
        <button onclick="deleteCountry('${item.name}')" class="px-2 py-1 text-xs bg-red-900/50 hover:bg-red-800 text-red-200 rounded">
          Hapus
        </button>
      </td>
    `;

    countryTableBody.appendChild(row);
  });
});

// Fitur Admin: Freeze / Unfreeze Negara
window.toggleFreeze = function(countryName, currentStatus) {
  const newStatus = currentStatus === 'Frozen' ? 'Active' : 'Frozen';
  db.ref('countries/' + countryName).update({
    status: newStatus
  });
};

// Fitur Admin: Hapus Data Negara
window.deleteCountry = function(countryName) {
  if (confirm(`Hapus data ${countryName} dari sistem?`)) {
    db.ref('countries/' + countryName).remove();
  }
};
