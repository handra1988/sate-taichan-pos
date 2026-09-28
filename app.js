/* =========================================================
   SATE TAICHAN RIA - POS
   ========================================================= */

const PASSWORD_LOGIN = "KASIRRIA2026";

/*
   PENTING:
   PIN_AKSES adalah PIN LAMA yang juga tersimpan
   pada transaksi Firebase.

   JANGAN DIUBAH jika ingin transaksi lama
   tetap terbaca dan dapat dihapus.
*/
const PIN_AKSES = "KASIR123";


/* =========================================================
   MENU
   ========================================================= */

const MENU = [

    {
        id: "p1",
        nama: "Paket I",
        deskripsi: "6 Tusuk + Lontong",
        harga: 18000
    },

    {
        id: "p2",
        nama: "Paket II",
        deskripsi: "10 Tusuk + Lontong",
        harga: 30000
    },

    {
        id: "p3",
        nama: "Paket III",
        deskripsi: "6 Tusuk Crispy + Lontong",
        harga: 24000
    },

    {
        id: "a1",
        nama: "Extra Cabe",
        deskripsi: "",
        harga: 3000
    },

    {
        id: "a2",
        nama: "Extra Lontong",
        deskripsi: "",
        harga: 3000
    },

    {
        id: "s1",
        nama: "Ayam / Tusuk",
        deskripsi: "",
        harga: 3000
    },

    {
        id: "s2",
        nama: "Kulit / Tusuk",
        deskripsi: "",
        harga: 2500
    },

    {
        id: "s3",
        nama: "Ayam Crispy / Tusuk",
        deskripsi: "",
        harga: 4000
    },

    {
        id: "ss1",
        nama: "Sosis Solo Original",
        deskripsi: "",
        harga: 3000
    },

    {
        id: "ss2",
        nama: "Sosis Solo Pedas",
        deskripsi: "",
        harga: 3500
    },

    {
        id: "ss3",
        nama: "Sosis Solo Keju",
        deskripsi: "",
        harga: 3500
    },

    {
        id: "r1",
        nama: "Risol Mayo",
        deskripsi: "",
        harga: 3000
    },

    {
        id: "r2",
        nama: "Risol Bolognese",
        deskripsi: "",
        harga: 3500
    }

];


/* =========================================================
   VARIABLE
   ========================================================= */

let keranjang = [];

let menuDipilih = null;

let qtyMenu = 1;

let semuaTransaksi = [];

let transaksiAkanDihapus = null;


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        minimumFractionDigits: 0

    }).format(angka);

}


/* =========================================================
   FORMAT TANGGAL
   ========================================================= */

function formatTanggal(waktu) {

    if (!waktu) return "-";

    let date;

    if (waktu.toDate) {

        date = waktu.toDate();

    } else {

        date = new Date(waktu);

    }

    return date.toLocaleString("id-ID", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}


/* =========================================================
   LOGIN
   ========================================================= */

function loginAplikasi() {

    const password =
        document.getElementById("loginPassword").value;

    const error =
        document.getElementById("loginError");


    if (password === PASSWORD_LOGIN) {

        sessionStorage.setItem(
            "sateTaichanRIA_login",
            "true"
        );

        document
            .getElementById("loginOverlay")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("app-hidden");

        error.textContent = "";

    } else {

        error.textContent =
            "Password salah. Silakan coba lagi.";

    }

}


function cekLogin() {

    const sudahLogin =
        sessionStorage.getItem(
            "sateTaichanRIA_login"
        );

    if (sudahLogin === "true") {

        document
            .getElementById("loginOverlay")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("app-hidden");

    }

}


function kunciAplikasi() {

    sessionStorage.removeItem(
        "sateTaichanRIA_login"
    );

    location.reload();

}


document
    .getElementById("loginPassword")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            loginAplikasi();

        }

    });


document
    .getElementById("toggleLoginPassword")
    .addEventListener("click", function() {

        const input =
            document.getElementById("loginPassword");

        if (input.type === "password") {

            input.type = "text";

            this.textContent = "🙈";

        } else {

            input.type = "password";

            this.textContent = "👁️";

        }

    });


/* =========================================================
   NAVIGASI
   ========================================================= */

function bukaHalaman(namaHalaman) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active-page");

        });


    const halaman =
        document.getElementById(
            "page-" + namaHalaman
        );


    if (halaman) {

        halaman.classList.add("active-page");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.page === namaHalaman
            ) {

                button.classList.add("active");

            }

        });


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (namaHalaman === "riwayat") {

        renderRiwayat();

    }

}


/* =========================================================
   RENDER MENU
   ========================================================= */

function renderMenu() {

    const container =
        document.getElementById("menuGrid");

    container.innerHTML = "";


    MENU.forEach(menu => {

        const button =
            document.createElement("button");

        button.className = "menu-card";

        button.onclick = () => bukaModalQty(menu.id);


        button.innerHTML = `

            <div class="menu-icon">
                🍢
            </div>

            <strong>
                ${menu.nama}
            </strong>

            ${
                menu.deskripsi
                ? `<small>${menu.deskripsi}</small>`
                : ""
            }

            <span class="menu-price">
                ${formatRupiah(menu.harga)}
            </span>

        `;


        container.appendChild(button);

    });

}


/* =========================================================
   MODAL QTY
   ========================================================= */

function bukaModalQty(idMenu) {

    menuDipilih =
        MENU.find(menu => menu.id === idMenu);

    qtyMenu = 1;


    document
        .getElementById("qtyNamaMenu")
        .textContent = menuDipilih.nama;


    document
        .getElementById("qtyHargaMenu")
        .textContent =
        formatRupiah(menuDipilih.harga);


    document
        .getElementById("qtyInput")
        .value = 1;


    document
        .getElementById("qtyModal")
        .classList.add("show");

}


function tutupModalQty() {

    document
        .getElementById("qtyModal")
        .classList.remove("show");

}


function ubahQty(perubahan) {

    const input =
        document.getElementById("qtyInput");

    let qty =
        Number(input.value) || 1;


    qty += perubahan;


    if (qty < 1) {

        qty = 1;

    }


    input.value = qty;

}


/* =========================================================
   KERANJANG
   ========================================================= */

function tambahKeKeranjang() {

    if (!menuDipilih) return;


    const qty =
        Math.max(
            1,
            Number(
                document.getElementById("qtyInput").value
            ) || 1
        );


    const itemLama =
        keranjang.find(
            item => item.id === menuDipilih.id
        );


    if (itemLama) {

        itemLama.jumlah += qty;

    } else {

        keranjang.push({

            id: menuDipilih.id,

            nama: menuDipilih.nama,

            harga: menuDipilih.harga,

            jumlah: qty

        });

    }


    tutupModalQty();

    renderKeranjang();

}


function hapusItemKeranjang(index) {

    keranjang.splice(index, 1);

    renderKeranjang();

}


function kosongkanKeranjang() {

    if (keranjang.length === 0) return;


    if (
        !confirm(
            "Kosongkan semua item di keranjang?"
        )
    ) return;


    keranjang = [];

    renderKeranjang();

}


function hitungTotalKeranjang() {

    return keranjang.reduce(

        (total, item) => {

            return total +
                (item.harga * item.jumlah);

        },

        0

    );

}


/* =========================================================
   RENDER KERANJANG
   ========================================================= */

function renderKeranjang() {

    const container =
        document.getElementById("cartList");


    if (keranjang.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">
                Belum ada menu dipilih
            </div>

        `;

    } else {

        container.innerHTML = "";


        keranjang.forEach((item, index) => {

            const subtotal =
                item.harga * item.jumlah;


            const row =
                document.createElement("div");

            row.className = "cart-item";


            row.innerHTML = `

                <div class="cart-item-info">

                    <strong>
                        ${item.nama}
                    </strong>

                    <small>
                        ${item.jumlah} ×
                        ${formatRupiah(item.harga)}
                    </small>

                </div>

                <div class="cart-item-right">

                    <strong>
                        ${formatRupiah(subtotal)}
                    </strong>

                    <button
                        class="btn-delete-small"
                        onclick="hapusItemKeranjang(${index})"
                    >
                        ×
                    </button>

                </div>

            `;


            container.appendChild(row);

        });

    }


    const total =
        hitungTotalKeranjang();


    document
        .getElementById("cartTotal")
        .textContent =
        formatRupiah(total);


    document
        .getElementById("jumlahKeranjang")
        .textContent =
        keranjang.reduce(
            (total, item) => total + item.jumlah,
            0
        ) + " item";


    document
        .getElementById("btnBayar")
        .disabled =
        keranjang.length === 0;

}


/* =========================================================
   PEMBAYARAN
   ========================================================= */

function bukaModalPembayaran() {

    if (keranjang.length === 0) return;


    const total =
        hitungTotalKeranjang();


    document
        .getElementById("paymentTotal")
        .textContent =
        formatRupiah(total);


    document
        .getElementById("uangDiterima")
        .value = "";


    document
        .getElementById("uangKembalian")
        .textContent =
        formatRupiah(0);


    document
        .getElementById("paymentModal")
        .classList.add("show");


    setTimeout(() => {

        document
            .getElementById("uangDiterima")
            .focus();

    }, 200);

}


function tutupModalPembayaran() {

    document
        .getElementById("paymentModal")
        .classList.remove("show");

}


document
    .getElementById("uangDiterima")
    .addEventListener("input", function() {

        const total =
            hitungTotalKeranjang();

        const diterima =
            Number(this.value) || 0;

        const kembali =
            Math.max(
                0,
                diterima - total
            );


        document
            .getElementById("uangKembalian")
            .textContent =
            formatRupiah(kembali);

    });


/* =========================================================
   SIMPAN TRANSAKSI
   ========================================================= */

async function simpanTransaksi() {

    if (keranjang.length === 0) {

        alert("Keranjang masih kosong.");

        return;

    }


    const total =
        hitungTotalKeranjang();


    const uangDiterima =
        Number(
            document
                .getElementById("uangDiterima")
                .value
        ) || 0;


    if (uangDiterima < total) {

        alert(
            "Uang yang diterima kurang."
        );

        return;

    }


    const uangKembalian =
        uangDiterima - total;


    try {

        await window.addDoc(

            window.collection(
                window.db,
                "transaksi"
            ),

            {

                items: keranjang.map(item => ({

                    id: item.id,

                    nama: item.nama,

                    harga: item.harga,

                    jumlah: item.jumlah

                })),

                totalBayar: total,

                uangDiterima: uangDiterima,

                uangKembalian: uangKembalian,

                waktu: new Date(),

                /*
                  Jangan diubah.
                  Transaksi lama menggunakan nilai ini.
                */
                password: PIN_AKSES

            }

        );


        alert(
            "✅ Transaksi berhasil disimpan."
        );


        keranjang = [];

        renderKeranjang();

        tutupModalPembayaran();


    } catch (error) {

        console.error(error);

        alert(
            "❌ Gagal menyimpan transaksi."
        );

    }

}


/* =========================================================
   HPP
   ========================================================= */

function ambilHPP() {

    const data =
        localStorage.getItem(
            "sateTaichanRIA_HPP"
        );


    if (!data) {

        const hppDefault = {};

        MENU.forEach(menu => {

            hppDefault[menu.id] = 0;

        });


        return hppDefault;

    }


    try {

        return JSON.parse(data);

    } catch {

        return {};

    }

}


function renderHPP() {

    const container =
        document.getElementById("hppList");


    const hpp =
        ambilHPP();


    container.innerHTML = "";


    MENU.forEach(menu => {

        const row =
            document.createElement("div");

        row.className = "hpp-row";


        row.innerHTML = `

            <div class="hpp-info">

                <strong>
                    ${menu.nama}
                </strong>

                <small>
                    Harga jual:
                    ${formatRupiah(menu.harga)}
                </small>

            </div>

            <div class="hpp-input-wrapper">

                <span>Rp</span>

                <input
                    type="number"
                    min="0"
                    data-hpp-id="${menu.id}"
                    value="${hpp[menu.id] || 0}"
                    inputmode="numeric"
                >

            </div>

        `;


        container.appendChild(row);

    });

}


function simpanHPP() {

    const data = {};


    document
        .querySelectorAll("[data-hpp-id]")
        .forEach(input => {

            data[input.dataset.hppId] =
                Number(input.value) || 0;

        });


    localStorage.setItem(

        "sateTaichanRIA_HPP",

        JSON.stringify(data)

    );


    alert(
        "✅ HPP berhasil disimpan."
    );


    renderSemuaData();

}


/* =========================================================
   HITUNG HPP TRANSAKSI
   ========================================================= */

function hitungHPPTransaksi(transaksi) {

    const hpp =
        ambilHPP();


    if (!transaksi.items) return 0;


    return transaksi.items.reduce(

        (total, item) => {

            const biaya =
                Number(
                    hpp[item.id]
                ) || 0;


            return total +
                (biaya * Number(item.jumlah || 0));

        },

        0

    );

}


/* =========================================================
   TANGGAL TRANSAKSI
   ========================================================= */

function tanggalTransaksi(transaksi) {

    if (!transaksi.waktu) return null;


    if (transaksi.waktu.toDate) {

        return transaksi.waktu.toDate();

    }


    return new Date(transaksi.waktu);

}


/* =========================================================
   FILTER TANGGAL
   ========================================================= */

function transaksiHariIni(transaksi) {

    const tanggal =
        tanggalTransaksi(transaksi);


    if (!tanggal) return false;


    const sekarang =
        new Date();


    return (

        tanggal.getFullYear() ===
        sekarang.getFullYear()

        &&

        tanggal.getMonth() ===
        sekarang.getMonth()

        &&

        tanggal.getDate() ===
        sekarang.getDate()

    );

}


function transaksiBulanIni(transaksi) {

    const tanggal =
        tanggalTransaksi(transaksi);


    if (!tanggal) return false;


    const sekarang =
        new Date();


    return (

        tanggal.getFullYear() ===
        sekarang.getFullYear()

        &&

        tanggal.getMonth() ===
        sekarang.getMonth()

    );

}


/* =========================================================
   DATA MONITORING FIREBASE
   ========================================================= */

function mulaiMonitoringFirebase() {

    window.onSnapshot(

        window.collection(
            window.db,
            "transaksi"
        ),

        snapshot => {

            const hasil = [];


            snapshot.forEach(docSnap => {

                const data =
                    docSnap.data();


                /*
                   Hanya transaksi POS RIA
                   dengan password lama.
                */
                if (
                    data.password === PIN_AKSES
                ) {

                    hasil.push({

                        id: docSnap.id,

                        ...data

                    });

                }

            });


            hasil.sort(

                (a, b) => {

                    const tanggalA =
                        tanggalTransaksi(a);

                    const tanggalB =
                        tanggalTransaksi(b);


                    return (

                        (tanggalB?.getTime() || 0)
                        -
                        (tanggalA?.getTime() || 0)

                    );

                }

            );


            semuaTransaksi = hasil;


            renderSemuaData();

        },

        error => {

            console.error(
                "Firebase monitoring error:",
                error
            );

        }

    );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function hitungData(transaksiList) {

    let omzet = 0;

    let hpp = 0;

    let transaksi = 0;

    let item = 0;


    transaksiList.forEach(data => {

        omzet +=
            Number(data.totalBayar) || 0;

        hpp +=
            hitungHPPTransaksi(data);

        transaksi++;


        if (data.items) {

            data.items.forEach(i => {

                item +=
                    Number(i.jumlah) || 0;

            });

        }

    });


    return {

        omzet,

        hpp,

        laba: omzet - hpp,

        transaksi,

        item

    };

}


function renderDashboard() {

    const hari =
        semuaTransaksi.filter(
            transaksiHariIni
        );


    const bulan =
        semuaTransaksi.filter(
            transaksiBulanIni
        );


    const dataHari =
        hitungData(hari);


    const dataBulan =
        hitungData(bulan);


    document
        .getElementById("dashOmzetHariIni")
        .textContent =
        formatRupiah(dataHari.omzet);


    document
        .getElementById("dashTransaksiHariIni")
        .textContent =
        dataHari.transaksi;


    document
        .getElementById("dashItemHariIni")
        .textContent =
        dataHari.item;


    document
        .getElementById("dashHppHariIni")
        .textContent =
        formatRupiah(dataHari.hpp);


    document
        .getElementById("dashLabaHariIni")
        .textContent =
        formatRupiah(dataHari.laba);


    const rata =
        dataHari.transaksi > 0

            ? dataHari.omzet /
              dataHari.transaksi

            : 0;


    document
        .getElementById("dashRataTransaksi")
        .textContent =
        formatRupiah(rata);


    document
        .getElementById("dashOmzetBulan")
        .textContent =
        formatRupiah(dataBulan.omzet);


    document
        .getElementById("dashHppBulan")
        .textContent =
        formatRupiah(dataBulan.hpp);


    document
        .getElementById("dashLabaBulan")
        .textContent =
        formatRupiah(dataBulan.laba);


    document
        .getElementById("kasirOmzetHariIni")
        .textContent =
        formatRupiah(dataHari.omzet);


    document
        .getElementById("kasirTransaksiHariIni")
        .textContent =
        dataHari.transaksi;


    document
        .getElementById("laporanOmzetHari")
        .textContent =
        formatRupiah(dataHari.omzet);


    document
        .getElementById("laporanTransaksiHari")
        .textContent =
        dataHari.transaksi;


    document
        .getElementById("laporanHppHari")
        .textContent =
        formatRupiah(dataHari.hpp);


    document
        .getElementById("laporanLabaHari")
        .textContent =
        formatRupiah(dataHari.laba);


    document
        .getElementById("laporanOmzetBulan")
        .textContent =
        formatRupiah(dataBulan.omzet);


    document
        .getElementById("laporanTransaksiBulan")
        .textContent =
        dataBulan.transaksi;


    document
        .getElementById("laporanHppBulan")
        .textContent =
        formatRupiah(dataBulan.hpp);


    document
        .getElementById("laporanLabaBulan")
        .textContent =
        formatRupiah(dataBulan.laba);


    renderTopMenu(hari);

    renderDashboardRecent();

}


/* =========================================================
   TOP MENU
   ========================================================= */

function renderTopMenu(transaksi) {

    const container =
        document.getElementById(
            "topMenuList"
        );


    const menuCount = {};


    transaksi.forEach(data => {

        if (!data.items) return;


        data.items.forEach(item => {

            if (!menuCount[item.nama]) {

                menuCount[item.nama] = 0;

            }


            menuCount[item.nama] +=
                Number(item.jumlah) || 0;

        });

    });


    const ranking =
        Object.entries(menuCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);


    if (ranking.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Belum ada transaksi hari ini
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    ranking.forEach((item, index) => {

        const row =
            document.createElement("div");

        row.className = "top-menu-row";


        row.innerHTML = `

            <div class="top-rank">
                #${index + 1}
            </div>

            <div class="top-menu-name">
                ${item[0]}
            </div>

            <strong>
                ${item[1]} terjual
            </strong>

        `;


        container.appendChild(row);

    });

}


/* =========================================================
   DASHBOARD TRANSAKSI TERBARU
   ========================================================= */

function renderDashboardRecent() {

    const container =
        document.getElementById(
            "dashboardRecentTransactions"
        );


    const transaksi =
        semuaTransaksi.slice(0, 5);


    if (transaksi.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Belum ada transaksi
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    transaksi.forEach(data => {

        const item =
            buatKartuTransaksi(
                data,
                true
            );


        container.appendChild(item);

    });

}


/* =========================================================
   RIWAYAT TRANSAKSI
   ========================================================= */

function renderRiwayat() {

    const container =
        document.getElementById(
            "riwayatList"
        );


    document
        .getElementById("jumlahRiwayat")
        .textContent =
        semuaTransaksi.length +
        " transaksi";


    if (semuaTransaksi.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Belum ada transaksi
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    semuaTransaksi.forEach(data => {

        const card =
            buatKartuTransaksi(
                data,
                false
            );


        container.appendChild(card);

    });

}


/* =========================================================
   BUAT KARTU TRANSAKSI
   ========================================================= */

function buatKartuTransaksi(
    transaksi,
    compact = false
) {

    const card =
        document.createElement("div");

    card.className =
        compact
            ? "transaction-card compact"
            : "transaction-card";


    const waktu =
        formatTanggal(
            transaksi.waktu
        );


    const itemText =
        transaksi.items

            ? transaksi.items
                .map(
                    item =>
                        `${item.nama} ×${item.jumlah}`
                )
                .join(", ")

            : "-";


    card.innerHTML = `

        <div class="transaction-header">

            <div>

                <strong>
                    ${formatRupiah(
                        transaksi.totalBayar
                    )}
                </strong>

                <small>
                    ${waktu}
                </small>

            </div>

            <span class="transaction-badge">
                ${transaksi.items
                    ? transaksi.items.reduce(
                        (sum, item) =>
                            sum +
                            Number(item.jumlah || 0),
                        0
                    )
                    : 0
                } item
            </span>

        </div>


        <div class="transaction-items">

            ${itemText}

        </div>


        <div class="transaction-actions">

            <button
                class="btn-secondary btn-small"
                onclick="bukaDetailTransaksiById('${transaksi.id}')"
            >
                👁️ Detail
            </button>

            <button
                class="btn-danger btn-small"
                onclick="bukaModalHapusTransaksi('${transaksi.id}')"
            >
                🗑️ Hapus
            </button>

        </div>

    `;


    return card;

}


/* =========================================================
   DETAIL TRANSAKSI
   ========================================================= */

function bukaDetailTransaksiById(id) {

    const transaksi =
        semuaTransaksi.find(
            item => item.id === id
        );


    if (!transaksi) {

        alert(
            "Transaksi tidak ditemukan."
        );

        return;

    }


    document
        .getElementById("detailTitle")
        .textContent =
        "Detail Transaksi";


    const itemsHTML =
        transaksi.items

            ? transaksi.items.map(item => `

                <div class="detail-item">

                    <span>
                        ${item.nama}
                        ×${item.jumlah}
                    </span>

                    <strong>
                        ${formatRupiah(
                            item.harga *
                            item.jumlah
                        )}
                    </strong>

                </div>

            `).join("")

            : "";


    document
        .getElementById("detailContent")
        .innerHTML = `

            <div class="detail-info">

                <div>
                    <span>Waktu</span>
                    <strong>
                        ${formatTanggal(
                            transaksi.waktu
                        )}
                    </strong>
                </div>

                <div>
                    <span>Total</span>
                    <strong>
                        ${formatRupiah(
                            transaksi.totalBayar
                        )}
                    </strong>
                </div>

                <div>
                    <span>Uang Diterima</span>
                    <strong>
                        ${formatRupiah(
                            transaksi.uangDiterima
                        )}
                    </strong>
                </div>

                <div>
                    <span>Kembalian</span>
                    <strong>
                        ${formatRupiah(
                            transaksi.uangKembalian
                        )}
                    </strong>
                </div>

            </div>


            <div class="detail-items">

                <h4>Item</h4>

                ${itemsHTML}

            </div>


            <button
                class="btn-danger btn-large"
                onclick="bukaModalHapusTransaksi('${transaksi.id}'); tutupModalDetail();"
            >
                🗑️ Hapus Transaksi Ini
            </button>

        `;


    document
        .getElementById("detailModal")
        .classList.add("show");

}


function tutupModalDetail() {

    document
        .getElementById("detailModal")
        .classList.remove("show");

}


/* =========================================================
   LAPORAN DETAIL
   ========================================================= */

function bukaDetailRiwayat(
    tipe,
    key,
    label
) {

    let transaksi = [];


    if (tipe === "hari") {

        transaksi =
            semuaTransaksi.filter(
                transaksiHariIni
            );

    } else if (tipe === "bulan") {

        transaksi =
            semuaTransaksi.filter(
                transaksiBulanIni
            );

    }


    document
        .getElementById("detailTitle")
        .textContent =
        label;


    const container =
        document.getElementById(
            "detailContent"
        );


    if (transaksi.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Tidak ada transaksi.
            </div>

        `;

    } else {

        container.innerHTML = "";


        transaksi.forEach(data => {

            const card =
                buatKartuTransaksi(
                    data,
                    false
                );


            container.appendChild(card);

        });

    }


    document
        .getElementById("detailModal")
        .classList.add("show");

}


/* =========================================================
   MODAL HAPUS TRANSAKSI
   ========================================================= */

function bukaModalHapusTransaksi(id) {

    const transaksi =
        semuaTransaksi.find(
            item => item.id === id
        );


    if (!transaksi) {

        alert(
            "Transaksi tidak ditemukan."
        );

        return;

    }


    transaksiAkanDihapus =
        transaksi;


    const itemText =
        transaksi.items

            ? transaksi.items.map(
                item =>
                    `${item.nama} ×${item.jumlah}`
              ).join("<br>")

            : "-";


    document
        .getElementById(
            "deleteTransactionInfo"
        )
        .innerHTML = `

            <div>
                <span>Waktu</span>
                <strong>
                    ${formatTanggal(
                        transaksi.waktu
                    )}
                </strong>
            </div>

            <div>
                <span>Item</span>
                <strong>
                    ${itemText}
                </strong>
            </div>

            <div>
                <span>Total</span>
                <strong class="delete-total">
                    ${formatRupiah(
                        transaksi.totalBayar
                    )}
                </strong>
            </div>

        `;


    document
        .getElementById("pinHapus")
        .value = "";


    document
        .getElementById("deletePinError")
        .textContent = "";


    document
        .getElementById("deleteModal")
        .classList.add("show");


    setTimeout(() => {

        document
            .getElementById("pinHapus")
            .focus();

    }, 200);

}


/* =========================================================
   TOGGLE PIN HAPUS
   ========================================================= */

function togglePinHapus() {

    const input =
        document.getElementById(
            "pinHapus"
        );


    const button =
        document.querySelector(
            ".pin-toggle"
        );


    if (input.type === "password") {

        input.type = "text";

        button.textContent = "🙈";

    } else {

        input.type = "password";

        button.textContent = "👁️";

    }

}


/* =========================================================
   KONFIRMASI HAPUS
   ========================================================= */

async function konfirmasiHapusTransaksi() {

    if (!transaksiAkanDihapus) {

        return;

    }


    /*
       PENTING:

       type input adalah TEXT,
       sehingga huruf + angka diterima.

       PIN dibandingkan sebagai STRING.
    */

    const pin =
        document
            .getElementById("pinHapus")
            .value
            .trim();


    const error =
        document
            .getElementById(
                "deletePinError"
            );


    if (!pin) {

        error.textContent =
            "Masukkan PIN penghapusan.";

        return;

    }


    if (pin !== PIN_AKSES) {

        error.textContent =
            "PIN penghapusan salah.";

        document
            .getElementById("pinHapus")
            .select();

        return;

    }


    const id =
        transaksiAkanDihapus.id;


    try {

        /*
           Hapus berdasarkan ID dokumen Firebase.
           Jadi transaksi yang dihapus pasti transaksi
           yang dipilih.
        */

        const ref =
            window.docRef(
                window.db,
                "transaksi",
                id
            );


        await window.deleteDoc(ref);


        tutupModalHapus();


        transaksiAkanDihapus = null;


        alert(
            "✅ Transaksi berhasil dihapus."
        );


        /*
           Tidak perlu reload manual.

           onSnapshot Firebase akan otomatis
           memperbarui:
           - Dashboard
           - Omzet
           - Jumlah transaksi
           - HPP
           - Laba
           - Riwayat
           - Laporan
        */

    } catch (errorFirebase) {

        console.error(
            "Gagal menghapus transaksi:",
            errorFirebase
        );


        error.textContent =
            "Gagal menghapus transaksi. Periksa koneksi internet.";

    }

}


function tutupModalHapus() {

    document
        .getElementById("deleteModal")
        .classList.remove("show");


    document
        .getElementById("pinHapus")
        .value = "";


    document
        .getElementById("deletePinError")
        .textContent = "";


    transaksiAkanDihapus = null;

}


/* =========================================================
   ENTER UNTUK PIN HAPUS
   ========================================================= */

document
    .getElementById("pinHapus")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                konfirmasiHapusTransaksi();

            }

        }
    );


/* =========================================================
   RENDER SEMUA DATA
   ========================================================= */

function renderSemuaData() {

    renderDashboard();

    renderRiwayat();

    renderHPP();

}


/* =========================================================
   INIT
   ========================================================= */

window.initAplikasi = function() {

    cekLogin();

    renderMenu();

    renderKeranjang();

    renderHPP();

    mulaiMonitoringFirebase();

};


/* =========================================================
   TUTUP MODAL SAAT KLIK BACKDROP
   ========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            function(event) {

                if (event.target === modal) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    });
