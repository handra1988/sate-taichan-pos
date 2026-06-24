// ==========================================================
// 1. DATA MASTER MENU SESUAI BROSUR RESMI SATE TAICHAN RIA
// ==========================================================
const daftarMenu = [
    { id: "p1", nama: "Paket I (6 Tsk + Lontong)", harga: 18000 },
    { id: "p2", nama: "Paket II (10 Tsk + Lontong)", harga: 30000 },
    { id: "p3", nama: "Paket III (6 Tsk Crispy + Lontong)", harga: 24000 },
    { id: "a1", nama: "Extra Cabe", harga: 3000 },
    { id: "a2", nama: "Extra Lontong", harga: 3000 },
    { id: "s1", nama: "Per Tusuk Ayam", harga: 3000 },
    { id: "s2", nama: "Per Tusuk Kulit", harga: 2500 },
    { id: "s3", nama: "Per Tusuk Ayam Crispy", harga: 4000 },
    { id: "ss1", nama: "Sosis Solo Original", harga: 3000 },
    { id: "ss2", nama: "Sosis Solo Pedas", harga: 3500 },
    { id: "ss3", nama: "Sosis Solo Keju", harga: 3500 },
    { id: "r1", nama: "Risol Mayo", harga: 3000 },
    { id: "r2", nama: "Risol Bolognese", harga: 3500 }
];

const PIN_AKSES = "TAICHANRIA2026"; 
let keranjang = [];
let totalHarga = 0;
let menuDipilih = null; 

// Nama-nama bulan Indonesia untuk tampilan laporan tabel
const namaBulanIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// 2. RENDERING UI UTAMA
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
            bukaModalJumlah(menu);
        };
        containerMenu.appendChild(tombol);
    });
}

function bukaModalJumlah(menu) {
    menuDipilih = menu;
    document.getElementById('modal-menu-title').innerText = menu.nama;
    document.getElementById('modal-qty').value = 1; 
    document.getElementById('popup-qty').style.display = 'flex';
}

window.ubahQty = function(nilai) {
    const inputQty = document.getElementById('modal-qty');
    let qtySekarang = parseInt(inputQty.value) || 1;
    qtySekarang += nilai;
    if (qtySekarang < 1) qtySekarang = 1;
    inputQty.value = qtySekarang;
};

window.tutupModal = function() {
    document.getElementById('popup-qty').style.display = 'none';
    menuDipilih = null;
};

window.konfirmasiTambahKeKeranjang = function() {
    if (!menuDipilih) return;
    
    const qtyInput = parseInt(document.getElementById('modal-qty').value) || 1;
    const itemSama = keranjang.find(item => item.nama === menuDipilih.nama);
    
    if (itemSama) {
        itemSama.jumlah += qtyInput; 
    } else {
        keranjang.push({ nama: menuDipilih.nama, harga: menuDipilih.harga, jumlah: qtyInput });
    }
    
    perbaruiTampilanKeranjang();
    tutupModal();
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

// 3. PROSES BAYAR & SIMPAN CLOUD
window.prosesPembayaran = async function() {
    if (keranjang.length === 0) {
        alert('Keranjang masih kosong, silakan pilih menu terlebih dahulu!');
        return;
    }

    const dataTransaksi = {
        items: keranjang,
        totalBayar: totalHarga,
        waktu: new Date(), 
        password: PIN_AKSES 
    };

    try {
        if (!window.db || !window.collection || !window.addDoc) {
            throw new Error("Koneksi Firebase belum siap.");
        }

        await window.addDoc(window.collection(window.db, "transaksi"), dataTransaksi);
        alert(`Transaksi sebesar ${formatRupiah(totalHarga)} SUKSES disimpan ke Cloud!`);
        
        keranjang = [];
        perbaruiTampilanKeranjang();
        
    } catch (error) {
        console.error("Gagal simpan transaksi: ", error);
        alert("Akses simpan gagal! Periksa aturan Cloud Firestore Rules Anda.");
    }
};

// 4. MONITOR LIVE DATA OMZET HARI INI & BULANAN
function aktifkanLiveMonitoring() {
    if (window.db && window.collection && window.onSnapshot) {
        const q = window.collection(window.db, "transaksi");

        window.onSnapshot(q, (snapshot) => {
            let totalOmzetHariIni = 0;
            
            // Wadah penyimpanan sementara untuk hitung bulanan (Format key: "YYYY-MM")
            let penampungBulanan = {};

            const tgl = new Date();
            const hariIni = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, '0')}-${String(tgl.getDate()).padStart(2, '0')}`;

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.waktu && data.password === PIN_AKSES) {
                    const tglTransaksi = data.waktu.toDate();
                    
                    const tahun = tglTransaksi.getFullYear();
                    const bulanNum = tglTransaksi.getMonth() + 1;
                    const hari = String(tglTransaksi.getDate()).padStart(2, '0');

                    const formatTglTransaksi = `${tahun}-${String(bulanNum).padStart(2, '0')}-${hari}`;
                    const formatBulanTahun = `${tahun}-${String(bulanNum).padStart(2, '0')}`;

                    // A. Akumulasi Omzet Hari Ini
                    if (formatTglTransaksi === hariIni) {
                        totalOmzetHariIni += data.totalBayar;
                    }

                    // B. Akumulasi Omzet Per Bulan
                    if (!penampungBulanan[formatBulanTahun]) {
                        penampungBulanan[formatBulanTahun] = 0;
                    }
                    penampungBulanan[formatBulanTahun] += data.totalBayar;
                }
            });

            // Update Monitor Omzet Atas (Hari Ini)
            const totalOmzetEl = document.getElementById('total-omzet');
            if (totalOmzetEl) {
                totalOmzetEl.innerText = formatRupiah(totalOmzetHariIni);
            }

            // Update Tabel Laporan Omzet Bulanan (Bawah)
            renderTabelLaporanBulanan(penampungBulanan);

        }, (error) => {
            console.error("Gagal monitoring real-time:", error);
        });
    }
}

// Fungsi pembantu untuk menggambar baris-baris tabel bulanan
function renderTabelLaporanBulanan(dataBulanan) {
    const tbody = document.getElementById('body-laporan-bulanan');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Ambil semua key bulan-tahun ("2026-06", dll) lalu urutkan dari yang terbaru
    const bulanUrut = Object.keys(dataBulanan).sort().reverse();

    if (bulanUrut.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #718096;">Belum ada data transaksi bulanan.</td></tr>`;
        return;
    }

    bulanUrut.forEach(key => {
        const [tahun, bulanStr] = key.split('-');
        const namaBulan = namaBulanIndo[parseInt(bulanStr) - 1];
        const totalOmzetBulan Ini = dataBulanan[key];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${namaBulan} ${tahun}</strong></td>
            <td class="text-right" style="font-weight: 600; color: #10b981;">${formatRupiah(totalOmzetBulanIni)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Inisialisasi awal aplikasi
renderTombolMenu();
aktifkanLiveMonitoring();
