// ==========================================================
// 1. DATA MASTER MENU (BERDASARKAN DAFTAR BROSUR RESMI SATE TAICHAN RIA)
// ==========================================================
const daftarMenu = [
    { id: "p1", nama: "Paket I (6 Tsk + Lontong)", harga: 18000 },
    { id: "p2", nama: "Paket II (10 Tsk + Lontong)", harga: 30000 },
    { id: "p3", nama: "Paket III (6 Tsk Crispy + Lontong)", harga: 24000 },
    { id: "s1", nama: "Per Tusuk Ayam", harga: 3000 },
    { id: "s2", nama: "Per Tusuk Kulit", harga: 2500 },
    { id: "s3", nama: "Per Tusuk Ayam Crispy", harga: 4000 },
    { id: "a1", nama: "Extra Cabe", harga: 3000 },
    { id: "a2", nama: "Extra Lontong", harga: 3000 },
    { id: "ss1", nama: "Sosis Solo Original", harga: 3000 },
    { id: "ss2", nama: "Sosis Solo Pedas", harga: 3500 },
    { id: "ss3", nama: "Sosis Solo Keju", harga: 3500 },
    { id: "r1", nama: "Risol Mayo", harga: 3000 },
    { id: "r2", nama: "Risol Bolognese", harga: 3500 }
];

const PIN_AKSES = "TAICHANRIA2026"; 
let keranjang = [];
let totalHarga = 0;

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// 2. RENDERING UI
function renderTombolMenu() {
    const containerMenu = document.getElementById('container-menu');
    if (!containerMenu) return;
    containerMenu.innerHTML = '';

    daftarMenu.forEach(menu => {
        const tombol = document.createElement('button');
        tombol.innerHTML = `
            <div style="font-size: 0.9rem; margin-bottom: 4px; text-align: center; line-height: 1.2;">${menu.nama}</div>
            <div style="color: #ff4e50; font-size: 0.85rem; font-weight: 700;">${formatRupiah(menu.harga)}</div>
        `;
        tombol.onclick = function() {
            tambahKeKeranjang(menu.nama, menu.harga);
        };
        containerMenu.appendChild(tombol);
    });
}

window.tambahKeKeranjang = function(namaMenu, harga) {
    const itemSama = keranjang.find(item => item.nama === namaMenu);
    if (itemSama) {
        itemSama.jumlah += 1;
    } else {
        keranjang.push({ nama: namaMenu, harga: harga, jumlah: 1 });
    }
    perbaruiTampilanKeranjang();
};

function perbaruiTampilanKeranjang() {
    const daftarKeranjangEl = document.getElementById('daftar-keranjang');
    const totalHargaEl = document.getElementById('total-harga');
    if (!daftarKeranjangEl || !totalHargaEl) return;
    
    daftarKeranjangEl.innerHTML = '';
    totalHarga = 0;

    keranjang.forEach((item, index) => {
        const subTotal = item.harga * item.jumlah;
        totalHarga += subTotal;

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong style="color:#2d3748;">${item.nama}</strong><br>
                <span style="color:#718096; font-size:0.85rem;">${item.jumlah}x @ ${formatRupiah(item.harga)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 600; color:#4a5568;">${formatRupiah(subTotal)}</span>
                <button onclick="hapusItem(${index})">X</button>
            </div>
        `;
        daftarKeranjangEl.appendChild(li);
    });

    totalHargaEl.innerText = formatRupiah(totalHarga);
}

window.hapusItem = function(index) {
    keranjang.splice(index, 1);
    perbaruiTampilanKeranjang();
};

// 3. WRITE DATA TO FIREBASE
window.prosesPembayaran = async function() {
    const namaPelangganEl = document.getElementById('nama-pelanggan');
    const namaPelanggan = namaPelangganEl ? namaPelangganEl.value.trim() : "";

    if (!namaPelanggan) {
        alert('Mohon ketik nama pelanggan / nomor order terlebih dahulu!');
        return;
    }
    if (keranjang.length === 0) {
        alert('Keranjang masih kosong, silakan klik menu sate terlebih dahulu!');
        return;
    }

    const dataTransaksi = {
        namaPelanggan: namaPelanggan,
        items: keranjang,
        totalBayar: totalHarga,
        waktu: new Date(), 
        password: PIN_AKSES 
    };

    try {
        await window.addDoc(window.collection(window.db, "transaksi"), dataTransaksi);
        alert(`Transaksi atas nama "${namaPelanggan}" SUKSES disimpan!`);
        
        keranjang = [];
        if (namaPelangganEl) namaPelangganEl.value = '';
        perbaruiTampilanKeranjang();
        
    } catch (error) {
        console.error("Gagal simpan transaksi: ", error);
        alert("Akses simpan gagal! Periksa aturan Cloud Firestore Rules Anda.");
    }
};

// 4. READ LIVE DATA OMZET (CLIENT-SIDE FILTER)
function aktifkanLiveMonitoring() {
    if (window.db && window.collection && window.onSnapshot) {
        const q = window.collection(window.db, "transaksi");

        window.onSnapshot(q, (snapshot) => {
            let totalOmzetHariIni = 0;
            const tgl = new Date();
            const hariIni = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, '0')}-${String(tgl.getDate()).padStart(2, '0')}`;

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.waktu && data.password === PIN_AKSES) {
                    const tglTransaksi = data.waktu.toDate();
                    const formatTglTransaksi = `${tglTransaksi.getFullYear()}-${String(tglTransaksi.getMonth() + 1).padStart(2, '0')}-${String(tglTransaksi.getDate()).padStart(2, '0')}`;
                    
                    if (formatTglTransaksi === hariIni) {
                        totalOmzetHariIni += data.totalBayar;
                    }
                }
            });

            const totalOmzetEl = document.getElementById('total-omzet');
            if (totalOmzetEl) {
                totalOmzetEl.innerText = formatRupiah(totalOmzetHariIni);
            }
        }, (error) => {
            console.error("Gagal monitoring real-time:", error);
        });
    }
}

// Inisialisasi awal aplikasi
renderTombolMenu();
aktifkanLiveMonitoring();
