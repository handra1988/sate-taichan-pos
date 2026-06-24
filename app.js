// ==========================================================
// 1. DATA MASTER MENU (BERDASARKAN DAFTAR BROSUR RESMI SATE TAICHAN RIA)
// ==========================================================
const daftarMenu = [
    // === KATEGORI PAKET ===
    { id: "p1", nama: "Paket I (6 Tsk + Lontong)", harga: 18000 },
    { id: "p2", nama: "Paket II (10 Tsk + Lontong)", harga: 30000 },
    { id: "p3", nama: "Paket III (6 Tsk Crispy + Lontong)", harga: 24000 },

    // === KATEGORI SATUAN / ADD-ON ===
    { id: "s1", nama: "Per Tusuk Ayam", harga: 3000 },
    { id: "s2", nama: "Per Tusuk Kulit", harga: 2500 },
    { id: "s3", nama: "Per Tusuk Ayam Crispy", harga: 4000 },
    { id: "a1", nama: "Extra Cabe", harga: 3000 },
    { id: "a2", nama: "Extra Lontong", harga: 3000 },

    // === KATEGORI SOSIS SOLO ===
    { id: "ss1", nama: "Sosis Solo Original", harga: 3000 },
    { id: "ss2", nama: "Sosis Solo Pedas", harga: 3500 },
    { id: "ss3", nama: "Sosis Solo Keju", harga: 3500 },

    // === KATEGORI RISOL ===
    { id: "r1", nama: "Risol Mayo", harga: 3000 },
    { id: "r2", nama: "Risol Bolognese", harga: 3500 }
];

// ==========================================================
// 2. KUNCI PENGAMAN KONEKSI DATABASE (PASSWORD SINKRONISASI)
// ==========================================================
const PIN_AKSES = "TAICHANRIA2026"; 

// State Penyimpanan Internal Aplikasi Kasir
let keranjang = [];
let totalHarga = 0;

// Helper format angka biasa menjadi format mata uang rupiah (IDR)
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// ==========================================================
// 3. LOGIKA RENDER ANTARMUKA / UI KASIR
// ==========================================================

// Membuat & memunculkan grid tombol menu secara dinamis otomatis
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

// Menambahkan item baru atau meningkatkan jumlah kuantitas pesanan
window.tambahKeKeranjang = function(namaMenu, harga) {
    const itemSama = keranjang.find(item => item.nama === namaMenu);
    
    if (itemSama) {
        itemSama.jumlah += 1;
    } else {
        keranjang.push({ nama: namaMenu, harga: harga, jumlah: 1 });
    }
    perbaruiTampilanKeranjang();
};

// Menggambar ulang data keranjang belanja saat ada update item masuk / hapus
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

// Mengeluarkan baris pesanan dari keranjang belanja kasir
window.hapusItem = function(index) {
    keranjang.splice(index, 1);
    perbaruiTampilanKeranjang();
};

// ==========================================================
// 4. INTERAKSI CLOUD DATABASE FIREBASE (WRITE DATA)
// ==========================================================

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
        if (!window.db || !window.collection || !window.addDoc) {
            throw new Error("SDK Firebase belum sepenuhnya ter-load, mohon tunggu sebentar.");
        }

        await window.addDoc(window.collection(window.db, "transaksi"), dataTransaksi);
        alert(`Transaksi atas nama "${namaPelanggan}" SUKSES disimpan ke Cloud Database!`);
        
        keranjang = [];
        if (namaPelangganEl) namaPelangganEl.value = '';
        perbaruiTampilanKeranjang();
        
    } catch (error) {
        console.error("Gagal simpan transaksi ke Firebase: ", error);
        alert("Akses simpan gagal! Periksa kembali Firebase Rules Anda.");
    }
};

// ==========================================================
// 5. MONITORING LIVE OMZET REAL-TIME (VERSI FIXED TIMEZONE)
// ==========================================================

function aktifkanLiveMonitoring() {
    const intervalCheck = setInterval(() => {
        if (window.db && window.collection && window.onSnapshot) {
            clearInterval(intervalCheck);

            const q = window.collection(window.db, "transaksi");

            window.onSnapshot(q, (snapshot) => {
                let totalOmzetHariIni = 0;
                
                // Ambil string format YYYY-MM-DD waktu lokal HP
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
                console.error("Gagal melakukan monitoring real-time (Permission Denied):", error);
            });
        }
    }, 500);
}

renderTombolMenu();
aktifkanLiveMonitoring();
