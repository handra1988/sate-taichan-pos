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
let semuaDataTransaksi = []; 
let objekGrafikMenu = null; // Instans Chart.js global

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

// 4. MONITOR LIVE DATA OMZET HARI INI, BULANAN & HARIAN
function aktifkanLiveMonitoring() {
    if (window.db && window.collection && window.onSnapshot) {
        const q = window.collection(window.db, "transaksi");

        window.onSnapshot(q, (snapshot) => {
            let totalOmzetHariIni = 0;
            let penampungBulanan = {};
            let penampungHarian = {}; 
            semuaDataTransaksi = []; 

            const tgl = new Date();
            const hariIni = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, '0')}-${String(tgl.getDate()).padStart(2, '0')}`;

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.waktu && data.password === PIN_AKSES) {
                    const idDokumen = doc.id;
                    
                    // Deteksi tipe data waktu dari Firebase (Timestamp atau standard Date)
                    const tglTransaksi = data.waktu.toDate ? data.waktu.toDate() : new Date(data.waktu);
                    
                    const tahun = tglTransaksi.getFullYear();
                    const bulanNum = tglTransaksi.getMonth() + 1;
                    const hari = String(tglTransaksi.getDate()).padStart(2, '0');

                    const formatTglTransaksi = `${tahun}-${String(bulanNum).padStart(2, '0')}-${hari}`;
                    const formatBulanTahun = `${tahun}-${String(bulanNum).padStart(2, '0')}`;

                    semuaDataTransaksi.push({
                        id: idDokumen,
                        bulanKey: formatBulanTahun,
                        hariKey: formatTglTransaksi, 
                        waktu: tglTransaksi,
                        totalBayar: data.totalBayar,
                        items: data.items
                    });

                    if (formatTglTransaksi === hariIni) {
                        totalOmzetHariIni += data.totalBayar;
                    }

                    if (!penampungBulanan[formatBulanTahun]) {
                        penampungBulanan[formatBulanTahun] = 0;
                    }
                    penampungBulanan[formatBulanTahun] += data.totalBayar;

                    if (!penampungHarian[formatTglTransaksi]) {
                        penampungHarian[formatTglTransaksi] = 0;
                    }
                    penampungHarian[formatTglTransaksi] += data.totalBayar;
                }
            });

            const totalOmzetEl = document.getElementById('total-omzet');
            if (totalOmzetEl) {
                totalOmzetEl.innerText = formatRupiah(totalOmzetHariIni);
            }

            renderTabelLaporanBulanan(penampungBulanan);
            renderTabelLaporanHarian(penampungHarian); 

        }, (error) => {
            console.error("Gagal monitoring real-time:", error);
        });
    }
}

function renderTabelLaporanBulanan(dataBulanan) {
    const tbody = document.getElementById('body-laporan-bulanan');
    if (!tbody) return;
    tbody.innerHTML = '';

    const bulanUrut = Object.keys(dataBulanan).sort().reverse();

    if (bulanUrut.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #718096;">Belum ada data transaksi bulanan.</td></tr>`;
        return;
    }

    bulanUrut.forEach(key => {
        const [tahun, bulanStr] = key.split('-');
        const namaBulan = namaBulanIndo[parseInt(bulanStr) - 1];
        const totalOmzetBulanan = dataBulanan[key];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${namaBulan} ${tahun}</strong></td>
            <td class="text-right" style="font-weight: 600; color: #10b981;">${formatRupiah(totalOmzetBulanan)}</td>
            <td style="text-align: center;">
                <button class="btn-detail" onclick="bukaDetailRiwayat('bulan', '${key}', '${namaBulan} ${tahun}')">Lihat Riwayat</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTabelLaporanHarian(dataHarian) {
    const tbody = document.getElementById('body-laporan-harian');
    if (!tbody) return;
    tbody.innerHTML = '';

    const hariUrut = Object.keys(dataHarian).sort().reverse();

    if (hariUrut.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #718096;">Belum ada data transaksi harian.</td></tr>`;
        return;
    }

    hariUrut.forEach(key => {
        const [tahun, bulanStr, hariStr] = key.split('-');
        const namaBulan = namaBulanIndo[parseInt(bulanStr) - 1];
        const labelTanggal = `${hariStr} ${namaBulan} ${tahun}`;
        const totalOmzetHarian = dataHarian[key];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${labelTanggal}</td>
            <td class="text-right" style="font-weight: 600; color: #3182ce;">${formatRupiah(totalOmzetHarian)}</td>
            <td style="text-align: center;">
                <button class="btn-detail" onclick="bukaDetailRiwayat('hari', '${key}', '${labelTanggal}')">Lihat Riwayat</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. SISTEM DASBOR ANALISIS PEMILIK (OWNER DASHBOARD)
window.bukaVerifikasiOwner = function() {
    const pin = prompt("Masukkan PIN Akses Pemilik untuk membuka analisis finansial:");
    if (pin === PIN_AKSES) {
        document.getElementById("modal-owner").style.display = "block";
        
        // Atur input tanggal ke hari ini secara otomatis
        const hariIni = new Date().toISOString().split('T')[0];
        document.getElementById("owner-tgl-mulai").value = hariIni;
        document.getElementById("owner-tgl-selesai").value = hariIni;
        
        prosesMuatLaporanOwner();
    } else if (pin !== null) {
        alert("PIN Salah! Akses dasbor ditolak.");
    }
};

window.tutupOwnerDashboard = function() {
    document.getElementById("modal-owner").style.display = "none";
};

window.prosesMuatLaporanOwner = function() {
    const tglMulaiStr = document.getElementById("owner-tgl-mulai").value;
    const tglSelesaiStr = document.getElementById("owner-tgl-selesai").value;
    
    if (!tglMulaiStr || !tglSelesaiStr) {
        alert("Pilih tanggal mulai dan selesai terlebih dahulu!");
        return;
    }

    const tglMulai = new Date(tglMulaiStr + "T00:00:00");
    const tglSelesai = new Date(tglSelesaiStr + "T23:59:59");

    let totalOmzet = 0;
    let totalNota = 0;
    let kuantitasMenu = {};

    // Filter dari penampung transaksi snapshot real-time internal
    semuaDataTransaksi.forEach(t => {
        if (t.waktu >= tglMulai && t.waktu <= tglSelesai) {
            totalOmzet += t.totalBayar;
            totalNota++;

            if (t.items && Array.isArray(t.items)) {
                t.items.forEach(item => {
                    if (kuantitasMenu[item.nama]) {
                        kuantitasMenu[item.nama] += item.jumlah;
                    } else {
                        kuantitasMenu[item.nama] = item.jumlah;
                    }
                });
            }
        }
    });

    let rataRataNota = totalNota > 0 ? Math.round(totalOmzet / totalNota) : 0;

    // Tampilkan data ke komponen teks
    document.getElementById("owner-txt-omzet").innerText = formatRupiah(totalOmzet);
    document.getElementById("owner-txt-transaksi").innerText = totalNota + " Nota";
    document.getElementById("owner-txt-rata").innerText = formatRupiah(rataRataNota);

    // Update list tabel kuantitas dan grafik Chart
    renderListKuantitasOwner(kuantitasMenu);
    renderGrafikBatangOwner(kuantitasMenu);
};

function renderListKuantitasOwner(dataMenu) {
    const container = document.getElementById("owner-list-item");
    container.innerHTML = "";

    const sortedMenu = Object.entries(dataMenu).sort((a, b) => b[1] - a[1]);

    if (sortedMenu.length === 0) {
        container.innerHTML = `<p style="color: #7f8c8d; text-align: center; padding-top: 20px;">Tidak ada penjualan.</p>`;
        return;
    }

    let html = `<table style="width:100%; border-collapse: collapse; text-align: left;">
        <tr style="border-bottom: 2px solid #ddd; color: #4a5568; font-weight:bold;">
            <th style="padding: 6px 0;">Item Menu</th>
            <th style="padding: 6px 0; text-align: right;">Kuantitas</th>
        </tr>`;

    sortedMenu.forEach(([nama, qty]) => {
        html += `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; color:#4a5568;">${nama}</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ff4e50;">${qty} Qty</td>
        </tr>`;
    });

    html += `</table>`;
    container.innerHTML = html;
}

function renderGrafikBatangOwner(dataMenu) {
    const ctx = document.getElementById('canvasGrafikMenu').getContext('2d');
    
    if (objekGrafikMenu) {
        objekGrafikMenu.destroy();
    }

    const labels = Object.keys(dataMenu);
    const values = Object.values(dataMenu);

    if (labels.length === 0) {
        return; 
    }

    objekGrafikMenu = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Item Terjual (Qty)',
                data: values,
                backgroundColor: 'rgba(255, 78, 80, 0.6)',
                borderColor: 'rgba(255, 78, 80, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                },
                x: {
                    display: false // Sembunyikan label bawah agar tidak menumpuk di HP
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ==========================================================
// KONTROL POPUP DETAIL RIWAYAT & HAPUS DATA CLOUD (UNIVERSAL)
// ==========================================================
window.bukaDetailRiwayat = function(tipe, kunciPencarian, labelJudul) {
    document.getElementById('modal-detail-title').innerText = `Riwayat: ${labelJudul}`;
    const listRiwayat = document.getElementById('list-riwayat-transaksi');
    listRiwayat.innerHTML = '';

    const transaksiFilter = semuaDataTransaksi.filter(t => {
        return tipe === 'bulan' ? t.bulanKey === kunciPencarian : t.hariKey === kunciPencarian;
    }).sort((a, b) => b.waktu - a.waktu); 

    if (transaksiFilter.length === 0) {
        listRiwayat.innerHTML = '<li style="text-align:center;color:#999;">Tidak ada transaksi.</li>';
    } else {
        transaksiFilter.forEach(t => {
            const jam = String(t.waktu.getHours()).padStart(2, '0') + ':' + String(t.waktu.getMinutes()).padStart(2, '0');
            const tgl = String(t.waktu.getDate()).padStart(2, '0');
            const bulanSingkat = namaBulanIndo[t.waktu.getMonth()].substring(0, 3);
            
            const rincianItem = t.items.map(i => `${i.nama} (${i.jumlah}x)`).join(', ');

            const li = document.createElement('li');
            li.className = 'riwayat-item';
            li.innerHTML = `
                <div style="max-width: 70%; line-height: 1.3;">
                    <span style="font-size:0.75rem; color:#a0aec0; font-weight:bold;">${tgl} ${bulanSingkat} / ${jam}</span><br>
                    <span style="color:#4a5568; font-size:0.8rem;">${rincianItem}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <strong style="color:#2d3748;">${formatRupiah(t.totalBayar)}</strong>
                    <button class="btn-hapus-cloud" onclick="hapusTransaksiCloud('${t.id}', ${t.totalBayar})">Hapus</button>
                </div>
            `;
            listRiwayat.appendChild(li);
        });
    }

    document.getElementById('popup-detail').style.display = 'flex';
};

window.tutupModalDetail = function() {
    document.getElementById('popup-detail').style.display = 'none';
};

window.hapusTransaksiCloud = async function(idDokumen, nominal) {
    const konfirmasiAwal = confirm(`Apakah Anda yakin ingin MENGHAPUS DATA transaksi sebesar ${formatRupiah(nominal)} ini?`);
    if (!konfirmasiAwal) return;

    const pinInput = prompt("Masukkan PIN Keamanan untuk menyetujui penghapusan data:");
    if (pinInput !== PIN_AKSES) {
        alert("PIN SALAH! Anda tidak memiliki izin menghapus data cloud.");
        return;
    }

    try {
        if (!window.db || !window.docRef || !window.deleteDoc) {
            throw new Error("Modul penghapusan Firebase belum siap.");
        }

        const dokumenRef = window.docRef(window.db, "transaksi", idDokumen);
        await window.deleteDoc(dokumenRef);
        
        alert("Transaksi BERHASIL dihapus dari Cloud database!");
        tutupModalDetail(); 

    } catch (error) {
        console.error("Gagal menghapus data dari Firebase:", error);
        alert("Gagal menghapus! Periksa kembali koneksi internet Anda.");
    }
};

// Inisialisasi awal aplikasi
renderTombolMenu();
aktifkanLiveMonitoring();
