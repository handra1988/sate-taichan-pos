// ==========================================================
// SATE TAICHAN RIA POS v2
// Dashboard + HPP + Laba
// ==========================================================


// ==========================================================
// 1. PASSWORD & PIN
// ==========================================================

// Password untuk membuka aplikasi
const PASSWORD_LOGIN = "KASIRRIA2026";

// PIN lama.
// JANGAN DIUBAH karena transaksi lama Firebase
// menggunakan PIN ini.
const PIN_AKSES = "KASIR123";


// ==========================================================
// 2. MASTER MENU
// ==========================================================

const daftarMenu = [

    {
        id: "p1",
        nama: "Paket I (6 Tsk + Lontong)",
        harga: 18000
    },

    {
        id: "p2",
        nama: "Paket II (10 Tsk + Lontong)",
        harga: 30000
    },

    {
        id: "p3",
        nama: "Paket III (6 Tsk Crispy + Lontong)",
        harga: 24000
    },

    {
        id: "a1",
        nama: "Extra Cabe",
        harga: 3000
    },

    {
        id: "a2",
        nama: "Extra Lontong",
        harga: 3000
    },

    {
        id: "s1",
        nama: "Per Tusuk Ayam",
        harga: 3000
    },

    {
        id: "s2",
        nama: "Per Tusuk Kulit",
        harga: 2500
    },

    {
        id: "s3",
        nama: "Per Tusuk Ayam Crispy",
        harga: 4000
    },

    {
        id: "ss1",
        nama: "Sosis Solo Original",
        harga: 3000
    },

    {
        id: "ss2",
        nama: "Sosis Solo Pedas",
        harga: 3500
    },

    {
        id: "ss3",
        nama: "Sosis Solo Keju",
        harga: 3500
    },

    {
        id: "r1",
        nama: "Risol Mayo",
        harga: 3000
    },

    {
        id: "r2",
        nama: "Risol Bolognese",
        harga: 3500
    }

];


// ==========================================================
// 3. VARIABEL GLOBAL
// ==========================================================

let keranjang = [];

let totalHarga = 0;

let menuDipilih = null;

let semuaDataTransaksi = [];

let unsubscribeFirebase = null;


// ==========================================================
// 4. HPP DEFAULT
// ==========================================================

// Sengaja 0.
// Anda akan memasukkan HPP sebenarnya dari menu HPP.

const HPP_DEFAULT = {

    p1: 0,
    p2: 0,
    p3: 0,

    a1: 0,
    a2: 0,

    s1: 0,
    s2: 0,
    s3: 0,

    ss1: 0,
    ss2: 0,
    ss3: 0,

    r1: 0,
    r2: 0

};


// ==========================================================
// 5. BULAN INDONESIA
// ==========================================================

const namaBulanIndo = [

    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"

];


// ==========================================================
// 6. FORMAT RUPIAH
// ==========================================================

function formatRupiah(angka) {

    angka = Number(angka) || 0;

    return "Rp " + angka.toLocaleString("id-ID");

}


// ==========================================================
// 7. HPP
// ==========================================================

function ambilHPP() {

    try {

        const data =
            localStorage.getItem(
                "sateTaichanRIA_HPP"
            );

        if (!data) {

            return {
                ...HPP_DEFAULT
            };

        }

        return {
            ...HPP_DEFAULT,
            ...JSON.parse(data)
        };

    } catch (error) {

        console.error(
            "Gagal membaca HPP:",
            error
        );

        return {
            ...HPP_DEFAULT
        };

    }

}


function getHPPMenu(menu) {

    const hpp = ambilHPP();

    return Number(
        hpp[menu.id] || 0
    );

}


function hitungHPPItem(item) {

    const menu = daftarMenu.find(
        m => m.nama === item.nama
    );

    if (!menu) {

        return 0;

    }

    return getHPPMenu(menu) *
        Number(item.jumlah || 0);

}


// ==========================================================
// 8. LOGIN
// ==========================================================

function cekStatusLogin() {

    const sudahLogin =
        sessionStorage.getItem(
            "sateTaichanRIA_login"
        );

    if (sudahLogin === "true") {

        tampilkanAplikasi();

    } else {

        tampilkanLogin();

    }

}


function tampilkanLogin() {

    const login =
        document.getElementById(
            "login-screen"
        );

    const app =
        document.getElementById("app");

    if (login) {

        login.style.display = "flex";

    }

    if (app) {

        app.classList.add("app-hidden");

    }

}


function tampilkanAplikasi() {

    const login =
        document.getElementById(
            "login-screen"
        );

    const app =
        document.getElementById("app");

    if (login) {

        login.style.display = "none";

    }

    if (app) {

        app.classList.remove(
            "app-hidden"
        );

    }

    inisialisasiAplikasi();

}


window.loginPOS = function () {

    const input =
        document.getElementById(
            "login-password"
        );

    const password =
        input.value.trim();

    const error =
        document.getElementById(
            "login-error"
        );

    if (password === PASSWORD_LOGIN) {

        sessionStorage.setItem(
            "sateTaichanRIA_login",
            "true"
        );

        if (error) {

            error.style.display = "none";

        }

        tampilkanAplikasi();

    } else {

        if (error) {

            error.style.display = "block";

        }

        input.value = "";

        input.focus();

    }

};


window.togglePassword = function () {

    const input =
        document.getElementById(
            "login-password"
        );

    if (!input) return;

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }

};


window.kunciPOS = function () {

    sessionStorage.removeItem(
        "sateTaichanRIA_login"
    );

    if (unsubscribeFirebase) {

        unsubscribeFirebase();

        unsubscribeFirebase = null;

    }

    window.location.reload();

};


// Enter untuk login
document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            document.getElementById(
                "login-screen"
            )?.style.display !== "none"
        ) {

            loginPOS();

        }

    }
);


// ==========================================================
// 9. NAVIGASI
// ==========================================================

window.bukaHalaman = function (namaHalaman) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(
            "page-" + namaHalaman
        );

    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

        if (
            item.dataset.page ===
            namaHalaman
        ) {

            item.classList.add(
                "active"
            );

        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (namaHalaman === "dashboard") {

        renderDashboard();

    }


    if (namaHalaman === "hpp") {

        renderHPP();

    }

};


// ==========================================================
// 10. RENDER MENU
// ==========================================================

function renderTombolMenu() {

    const container =
        document.getElementById(
            "container-menu"
        );

    if (!container) return;

    container.innerHTML = "";


    daftarMenu.forEach(menu => {

        const tombol =
            document.createElement("button");

        tombol.innerHTML = `

            <span class="menu-name">
                ${menu.nama}
            </span>

            <span class="menu-price">
                ${formatRupiah(menu.harga)}
            </span>

        `;

        tombol.onclick = function () {

            bukaModalJumlah(menu);

        };

        container.appendChild(tombol);

    });

}


// ==========================================================
// 11. MODAL JUMLAH
// ==========================================================

function bukaModalJumlah(menu) {

    menuDipilih = menu;

    const title =
        document.getElementById(
            "modal-menu-title"
        );

    const qty =
        document.getElementById(
            "modal-qty"
        );

    if (title) {

        title.innerText =
            menu.nama;

    }

    if (qty) {

        qty.value = 1;

    }

    document.getElementById(
        "popup-qty"
    ).style.display = "flex";

}


window.ubahQty = function (nilai) {

    const input =
        document.getElementById(
            "modal-qty"
        );

    let qty =
        parseInt(input.value) || 1;

    qty += nilai;

    if (qty < 1) {

        qty = 1;

    }

    input.value = qty;

};


window.tutupModal = function () {

    document.getElementById(
        "popup-qty"
    ).style.display = "none";

    menuDipilih = null;

};


window.konfirmasiTambahKeKeranjang =
    function () {

        if (!menuDipilih) return;


        const qty =
            parseInt(
                document.getElementById(
                    "modal-qty"
                ).value
            ) || 1;


        const itemSama =
            keranjang.find(
                item =>
                    item.nama ===
                    menuDipilih.nama
            );


        if (itemSama) {

            itemSama.jumlah += qty;

        } else {

            keranjang.push({

                id: menuDipilih.id,

                nama: menuDipilih.nama,

                harga: menuDipilih.harga,

                jumlah: qty

            });

        }


        perbaruiTampilanKeranjang();

        tutupModal();

    };


// ==========================================================
// 12. KERANJANG
// ==========================================================

function perbaruiTampilanKeranjang() {

    const list =
        document.getElementById(
            "daftar-keranjang"
        );

    const totalEl =
        document.getElementById(
            "total-harga"
        );

    const empty =
        document.getElementById(
            "cart-empty"
        );

    const jumlahEl =
        document.getElementById(
            "jumlah-item-keranjang"
        );


    if (!list || !totalEl) return;


    list.innerHTML = "";

    totalHarga = 0;

    let totalItem = 0;


    keranjang.forEach(
        (item, index) => {

            const subtotal =
                Number(item.harga) *
                Number(item.jumlah);


            totalHarga += subtotal;

            totalItem +=
                Number(item.jumlah);


            const li =
                document.createElement(
                    "li"
                );


            li.innerHTML = `

                <div>

                    <div class="cart-item-name">
                        ${item.nama}
                    </div>

                    <div class="cart-item-detail">
                        ${item.jumlah}x @
                        ${formatRupiah(item.harga)}
                    </div>

                </div>

                <div class="cart-item-right">

                    <span class="cart-subtotal">
                        ${formatRupiah(subtotal)}
                    </span>

                    <button
                        class="btn-delete-item"
                        onclick="hapusItem(${index})"
                    >
                        ×
                    </button>

                </div>

            `;


            list.appendChild(li);

        }
    );


    totalEl.innerText =
        formatRupiah(totalHarga);


    if (jumlahEl) {

        jumlahEl.innerText =
            totalItem +
            (totalItem === 1
                ? " item"
                : " item");

    }


    if (empty) {

        empty.style.display =
            keranjang.length === 0
                ? "block"
                : "none";

    }

}


window.hapusItem = function (index) {

    keranjang.splice(index, 1);

    perbaruiTampilanKeranjang();

};


window.kosongkanKeranjang =
    function () {

        if (
            keranjang.length === 0
        ) {

            return;

        }


        const yakin =
            confirm(
                "Kosongkan semua isi keranjang?"
            );


        if (!yakin) return;


        keranjang = [];

        totalHarga = 0;

        perbaruiTampilanKeranjang();

    };


// ==========================================================
// 13. PEMBAYARAN
// ==========================================================

window.bukaModalPembayaran =
    function () {

        if (
            keranjang.length === 0
        ) {

            alert(
                "Keranjang masih kosong."
            );

            return;

        }


        document.getElementById(
            "pay-txt-tagihan"
        ).innerText =
            formatRupiah(totalHarga);


        const input =
            document.getElementById(
                "pay-input-nominal"
            );

        input.value = "";


        document.getElementById(
            "pay-txt-kembalian"
        ).innerText =
            "Rp 0";


        const container =
            document.getElementById(
                "pay-container-pintasan"
            );

        container.innerHTML = "";


        let pilihan = [
            totalHarga
        ];


        [
            10000,
            20000,
            50000,
            100000,
            200000
        ].forEach(
            nominal => {

                if (
                    nominal >= totalHarga &&
                    !pilihan.includes(
                        nominal
                    )
                ) {

                    pilihan.push(
                        nominal
                    );

                }

            }
        );


        pilihan
            .slice(0, 6)
            .forEach(nominal => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "btn-pecahan";


                button.innerText =
                    nominal === totalHarga
                        ? "Uang Pas"
                        : formatRupiah(
                            nominal
                        );


                button.onclick =
                    function () {

                        input.value =
                            nominal;

                        hitungKembalianLive();

                    };


                container.appendChild(
                    button
                );

            });


        document.getElementById(
            "popup-pembayaran"
        ).style.display = "flex";


        setTimeout(
            () => input.focus(),
            100
        );

    };


window.tutupModalPembayaran =
    function () {

        document.getElementById(
            "popup-pembayaran"
        ).style.display = "none";

    };


window.hitungKembalianLive =
    function () {

        const input =
            document.getElementById(
                "pay-input-nominal"
            );


        const uang =
            parseInt(input.value) || 0;


        const kembalian =
            uang - totalHarga;


        const hasil =
            document.getElementById(
                "pay-txt-kembalian"
            );


        const button =
            document.getElementById(
                "pay-btn-eksekusi"
            );


        if (kembalian < 0) {

            hasil.innerText =
                "Uang Kurang!";

            hasil.style.color =
                "#dc2626";

            button.disabled = true;

            button.style.opacity =
                "0.5";

        } else {

            hasil.innerText =
                formatRupiah(
                    kembalian
                );

            hasil.style.color =
                "#059669";

            button.disabled = false;

            button.style.opacity =
                "1";

        }

    };


// ==========================================================
// 14. SIMPAN TRANSAKSI
// ==========================================================

window.prosesPembayaranAkhir =
    async function () {

        const uang =
            parseInt(
                document.getElementById(
                    "pay-input-nominal"
                ).value
            ) || 0;


        if (uang < totalHarga) {

            alert(
                "Nominal pembayaran masih kurang."
            );

            return;

        }


        const dataTransaksi = {

            items: keranjang.map(
                item => ({

                    id: item.id,

                    nama: item.nama,

                    harga: item.harga,

                    jumlah: item.jumlah

                })
            ),

            totalBayar: totalHarga,

            uangDiterima: uang,

            uangKembalian:
                uang - totalHarga,

            waktu: new Date(),

            // Jangan ubah.
            password: PIN_AKSES

        };


        try {

            if (
                !window.db ||
                !window.collection ||
                !window.addDoc
            ) {

                throw new Error(
                    "Firebase belum siap."
                );

            }


            await window.addDoc(

                window.collection(
                    window.db,
                    "transaksi"
                ),

                dataTransaksi

            );


            alert(
                "Transaksi BERHASIL!\n\n" +
                "Total: " +
                formatRupiah(
                    totalHarga
                ) +
                "\nKembalian: " +
                formatRupiah(
                    dataTransaksi
                        .uangKembalian
                )
            );


            tutupModalPembayaran();


            keranjang = [];

            totalHarga = 0;

            perbaruiTampilanKeranjang();


        } catch (error) {

            console.error(
                "Gagal menyimpan transaksi:",
                error
            );


            alert(
                "Gagal menyimpan transaksi.\n\n" +
                "Periksa koneksi internet."
            );

        }

    };


// ==========================================================
// 15. UTILITAS TANGGAL
// ==========================================================

function tanggalKey(date) {

    return (

        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")

    );

}


function bulanKey(date) {

    return (

        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0")

    );

}


function labelTanggal(date) {

    return (

        String(
            date.getDate()
        ).padStart(2, "0") +
        " " +
        namaBulanIndo[
            date.getMonth()
        ] +
        " " +
        date.getFullYear()

    );

}


// ==========================================================
// 16. HITUNG HPP TRANSAKSI
// ==========================================================

function hitungHPPTransaksi(transaksi) {

    if (!transaksi.items) {

        return 0;

    }


    return transaksi.items.reduce(
        (total, item) => {

            return (
                total +
                hitungHPPItem(item)
            );

        },
        0
    );

}


// ==========================================================
// 17. LIVE FIREBASE
// ==========================================================

function aktifkanLiveMonitoring() {

    if (
        !window.db ||
        !window.collection ||
        !window.onSnapshot
    ) {

        console.error(
            "Firebase belum siap."
        );

        return;

    }


    const collectionRef =
        window.collection(
            window.db,
            "transaksi"
        );


    unsubscribeFirebase =
        window.onSnapshot(

            collectionRef,

            snapshot => {

                semuaDataTransaksi = [];


                snapshot.forEach(
                    firebaseDoc => {

                        const data =
                            firebaseDoc.data();


                        /*
                         * Filter menggunakan PIN lama.
                         * Ini menjaga transaksi lama
                         * tetap terbaca.
                         */

                        if (
                            !data.waktu ||
                            data.password !==
                            PIN_AKSES
                        ) {

                            return;

                        }


                        let waktu;


                        try {

                            waktu =
                                data.waktu.toDate
                                    ? data.waktu.toDate()
                                    : new Date(
                                        data.waktu
                                    );

                        } catch {

                            waktu =
                                new Date(
                                    data.waktu
                                );

                        }


                        semuaDataTransaksi.push({

                            id:
                                firebaseDoc.id,

                            waktu: waktu,

                            totalBayar:
                                Number(
                                    data.totalBayar
                                ) || 0,

                            items:
                                Array.isArray(
                                    data.items
                                )
                                    ? data.items
                                    : []

                        });

                    }
                );


                semuaDataTransaksi.sort(
                    (a, b) =>
                        b.waktu - a.waktu
                );


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


// ==========================================================
// 18. RENDER SEMUA DATA
// ==========================================================

function renderSemuaData() {

    renderDashboard();

    renderTabelLaporan();

    renderOmzetKasir();

}


// ==========================================================
// 19. DATA HARI INI
// ==========================================================

function ambilTransaksiHariIni() {

    const sekarang =
        new Date();

    const key =
        tanggalKey(sekarang);


    return semuaDataTransaksi.filter(
        transaksi =>
            tanggalKey(
                transaksi.waktu
            ) === key
    );

}


// ==========================================================
// 20. DATA BULAN INI
// ==========================================================

function ambilTransaksiBulanIni() {

    const sekarang =
        new Date();

    const key =
        bulanKey(sekarang);


    return semuaDataTransaksi.filter(
        transaksi =>
            bulanKey(
                transaksi.waktu
            ) === key
    );

}


// ==========================================================
// 21. HITUNG STATISTIK
// ==========================================================

function hitungStatistik(
    daftarTransaksi
) {

    let omzet = 0;

    let hpp = 0;

    let jumlahItem = 0;

    const menuCount = {};


    daftarTransaksi.forEach(
        transaksi => {

            omzet +=
                Number(
                    transaksi.totalBayar
                ) || 0;


            hpp +=
                hitungHPPTransaksi(
                    transaksi
                );


            transaksi.items.forEach(
                item => {

                    const jumlah =
                        Number(
                            item.jumlah
                        ) || 0;


                    jumlahItem += jumlah;


                    if (
                        !menuCount[
                            item.nama
                        ]
                    ) {

                        menuCount[
                            item.nama
                        ] = 0;

                    }


                    menuCount[
                        item.nama
                    ] += jumlah;

                }
            );

        }
    );


    const laba =
        omzet - hpp;


    return {

        omzet,

        hpp,

        laba,

        jumlahItem,

        jumlahTransaksi:
            daftarTransaksi.length,

        menuCount

    };

}


// ==========================================================
// 22. DASHBOARD
// ==========================================================

function renderDashboard() {

    const hariIni =
        ambilTransaksiHariIni();


    const bulanIni =
        ambilTransaksiBulanIni();


    const statistikHari =
        hitungStatistik(
            hariIni
        );


    const statistikBulan =
        hitungStatistik(
            bulanIni
        );


    const sekarang =
        new Date();


    const tanggalEl =
        document.getElementById(
            "dashboard-tanggal"
        );


    if (tanggalEl) {

        tanggalEl.innerText =
            labelTanggal(
                sekarang
            );

    }


    setText(
        "dash-omzet-hari",
        formatRupiah(
            statistikHari.omzet
        )
    );


    setText(
        "dash-transaksi",
        statistikHari.jumlahTransaksi
    );


    setText(
        "dash-item",
        statistikHari.jumlahItem
    );


    setText(
        "dash-hpp",
        formatRupiah(
            statistikHari.hpp
        )
    );


    setText(
        "dash-laba",
        formatRupiah(
            statistikHari.laba
        )
    );


    const rata =
        statistikHari.jumlahTransaksi > 0
            ? statistikHari.omzet /
              statistikHari.jumlahTransaksi
            : 0;


    setText(
        "dash-rata",
        formatRupiah(
            Math.round(rata)
        )
    );


    setText(
        "dash-periode-hari",
        labelTanggal(
            sekarang
        )
    );


    setText(
        "dash-bulan-label",
        namaBulanIndo[
            sekarang.getMonth()
        ] +
        " " +
        sekarang.getFullYear()
    );


    setText(
        "dash-omzet-bulan",
        formatRupiah(
            statistikBulan.omzet
        )
    );


    setText(
        "dash-hpp-bulan",
        formatRupiah(
            statistikBulan.hpp
        )
    );


    setText(
        "dash-laba-bulan",
        formatRupiah(
            statistikBulan.laba
        )
    );


    renderMenuTerlaris(
        statistikHari.menuCount
    );

}


// ==========================================================
// 23. MENU TERLARIS
// ==========================================================

function renderMenuTerlaris(
    menuCount
) {

    const container =
        document.getElementById(
            "menu-terlaris"
        );


    if (!container) return;


    const data =
        Object.entries(
            menuCount
        )
        .sort(
            (a, b) => b[1] - a[1]
        )
        .slice(0, 5);


    if (data.length === 0) {

        container.innerHTML = `

            <div class="empty-data">
                Belum ada penjualan hari ini.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    data.forEach(
        ([nama, jumlah], index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "best-menu";


            row.innerHTML = `

                <div class="best-rank">
                    ${index + 1}
                </div>

                <div class="best-name">
                    ${nama}
                </div>

                <div class="best-qty">
                    ${jumlah} terjual
                </div>

            `;


            container.appendChild(row);

        }
    );

}


// ==========================================================
// 24. OMZET DI KASIR
// ==========================================================

function renderOmzetKasir() {

    const hariIni =
        ambilTransaksiHariIni();


    const statistik =
        hitungStatistik(
            hariIni
        );


    setText(
        "kasir-omzet-hari",
        formatRupiah(
            statistik.omzet
        )
    );


    setText(
        "kasir-transaksi-hari",
        statistik.jumlahTransaksi +
        " transaksi"
    );

}


// ==========================================================
// 25. LAPORAN
// ==========================================================

function renderTabelLaporan() {

    const bulanan = {};

    const harian = {};


    semuaDataTransaksi.forEach(
        transaksi => {

            const bKey =
                bulanKey(
                    transaksi.waktu
                );


            const hKey =
                tanggalKey(
                    transaksi.waktu
                );


            if (!bulanan[bKey]) {

                bulanan[bKey] = [];

            }


            if (!harian[hKey]) {

                harian[hKey] = [];

            }


            bulanan[bKey].push(
                transaksi
            );


            harian[hKey].push(
                transaksi
            );

        }
    );


    renderLaporanBulanan(
        bulanan
    );


    renderLaporanHarian(
        harian
    );

}


// ==========================================================
// 26. LAPORAN BULANAN
// ==========================================================

function renderLaporanBulanan(
    data
) {

    const tbody =
        document.getElementById(
            "body-laporan-bulanan"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const keys =
        Object.keys(data)
        .sort()
        .reverse();


    if (keys.length === 0) {

        tbody.innerHTML = `

            <tr>
                <td colspan="3">
                    Belum ada transaksi.
                </td>
            </tr>

        `;

        return;

    }


    keys.forEach(key => {

        const transaksi =
            data[key];


        const statistik =
            hitungStatistik(
                transaksi
            );


        const [tahun, bulan] =
            key.split("-");


        const namaBulan =
            namaBulanIndo[
                Number(bulan) - 1
            ];


        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                <strong>
                    ${namaBulan} ${tahun}
                </strong>
            </td>

            <td>
                ${formatRupiah(
                    statistik.omzet
                )}
            </td>

            <td>

                <button
                    class="btn-detail"
                    onclick="bukaDetailRiwayat(
                        'bulan',
                        '${key}',
                        '${namaBulan} ${tahun}'
                    )"
                >
                    Detail
                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });

}


// ==========================================================
// 27. LAPORAN HARIAN
// ==========================================================

function renderLaporanHarian(
    data
) {

    const tbody =
        document.getElementById(
            "body-laporan-harian"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const keys =
        Object.keys(data)
        .sort()
        .reverse();


    if (keys.length === 0) {

        tbody.innerHTML = `

            <tr>
                <td colspan="3">
                    Belum ada transaksi.
                </td>
            </tr>

        `;

        return;

    }


    keys.forEach(key => {

        const transaksi =
            data[key];


        const statistik =
            hitungStatistik(
                transaksi
            );


        const [tahun, bulan, hari] =
            key.split("-");


        const namaBulan =
            namaBulanIndo[
                Number(bulan) - 1
            ];


        const label =
            hari +
            " " +
            namaBulan +
            " " +
            tahun;


        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

            <td>
                ${label}
            </td>

            <td>
                ${formatRupiah(
                    statistik.omzet
                )}
            </td>

            <td>

                <button
                    class="btn-detail"
                    onclick="bukaDetailRiwayat(
                        'hari',
                        '${key}',
                        '${label}'
                    )"
                >
                    Detail
                </button>

            </td>

        `;


        tbody.appendChild(tr);

    });

}


// ==========================================================
// 28. DETAIL RIWAYAT
// ==========================================================

window.bukaDetailRiwayat =
    function (
        tipe,
        key,
        label
    ) {

        const list =
            document.getElementById(
                "list-riwayat-transaksi"
            );


        const title =
            document.getElementById(
                "modal-detail-title"
            );


        if (title) {

            title.innerText =
                "Riwayat: " + label;

        }


        list.innerHTML = "";


        const transaksi =
            semuaDataTransaksi
            .filter(t => {

                if (
                    tipe === "bulan"
                ) {

                    return (
                        bulanKey(
                            t.waktu
                        ) === key
                    );

                }


                return (
                    tanggalKey(
                        t.waktu
                    ) === key
                );

            })
            .sort(
                (a, b) =>
                    b.waktu - a.waktu
            );


        if (
            transaksi.length === 0
        ) {

            list.innerHTML = `

                <li
                    style="
                        text-align:center;
                        padding:20px;
                        color:#9ca3af;
                    "
                >
                    Tidak ada transaksi.
                </li>

            `;

        } else {

            transaksi.forEach(
                transaksiItem => {

                    const jam =
                        String(
                            transaksiItem
                                .waktu
                                .getHours()
                        ).padStart(2, "0") +
                        ":" +
                        String(
                            transaksiItem
                                .waktu
                                .getMinutes()
                        ).padStart(2, "0");


                    const rincian =
                        transaksiItem
                            .items
                            .map(
                                item =>
                                    `${item.nama} (${item.jumlah}x)`
                            )
                            .join(", ");


                    const li =
                        document.createElement(
                            "li"
                        );


                    li.className =
                        "riwayat-item";


                    li.innerHTML = `

                        <div class="riwayat-left">

                            <span class="riwayat-time">
                                ${jam}
                            </span>

                            <span class="riwayat-items">
                                ${rincian}
                            </span>

                        </div>

                        <div class="riwayat-right">

                            <strong class="riwayat-price">
                                ${formatRupiah(
                                    transaksiItem.totalBayar
                                )}
                            </strong>

                            <button
                                class="btn-hapus-cloud"
                                onclick="hapusTransaksiCloud(
                                    '${transaksiItem.id}',
                                    ${transaksiItem.totalBayar}
                                )"
                            >
                                Hapus
                            </button>

                        </div>

                    `;


                    list.appendChild(li);

                }
            );

        }


        document.getElementById(
            "popup-detail"
        ).style.display = "flex";

    };


window.tutupModalDetail =
    function () {

        document.getElementById(
            "popup-detail"
        ).style.display = "none";

    };


// ==========================================================
// 29. HAPUS TRANSAKSI
// ==========================================================

window.hapusTransaksiCloud =
    async function (
        idDokumen,
        nominal
    ) {

        const yakin =
            confirm(
                "Hapus transaksi sebesar " +
                formatRupiah(
                    nominal
                ) +
                "?"
            );


        if (!yakin) return;


        const pin =
            prompt(
                "Masukkan PIN keamanan:"
            );


        if (pin !== PIN_AKSES) {

            alert(
                "PIN SALAH."
            );

            return;

        }


        try {

            const ref =
                window.docRef(
                    window.db,
                    "transaksi",
                    idDokumen
                );


            await window.deleteDoc(
                ref
            );


            alert(
                "Transaksi berhasil dihapus."
            );


            tutupModalDetail();


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Gagal menghapus transaksi."
            );

        }

    };


// ==========================================================
// 30. HPP - RENDER
// ==========================================================

function renderHPP() {

    const container =
        document.getElementById(
            "container-hpp"
        );


    if (!container) return;


    const hpp =
        ambilHPP();


    container.innerHTML = "";


    daftarMenu.forEach(menu => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "hpp-row";


        row.innerHTML = `

            <div class="hpp-name">

                <strong>
                    ${menu.nama}
                </strong>

                <span>
                    Harga jual:
                    ${formatRupiah(
                        menu.harga
                    )}
                </span>

            </div>


            <input
                type="number"
                class="hpp-input"
                data-hpp-id="${menu.id}"
                value="${hpp[menu.id] || 0}"
                min="0"
                step="500"
                inputmode="numeric"
            >

        `;


        container.appendChild(row);

    });

}


// ==========================================================
// 31. SIMPAN HPP
// ==========================================================

window.simpanSemuaHPP =
    function () {

        const inputs =
            document.querySelectorAll(
                ".hpp-input"
            );


        const data = {};


        inputs.forEach(input => {

            const id =
                input.dataset.hppId;


            const nilai =
                parseInt(
                    input.value
                ) || 0;


            data[id] =
                Math.max(
                    0,
                    nilai
                );

        });


        localStorage.setItem(

            "sateTaichanRIA_HPP",

            JSON.stringify(
                data
            )

        );


        alert(
            "HPP berhasil disimpan."
        );


        renderDashboard();

    };


// ==========================================================
// 32. REFRESH
// ==========================================================

window.refreshDashboard =
    function () {

        renderSemuaData();

    };


// ==========================================================
// 33. SET TEXT
// ==========================================================

function setText(
    id,
    text
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            text;

    }

}


// ==========================================================
// 34. INISIALISASI
// ==========================================================

let aplikasiSudahDiinisialisasi =
    false;


function inisialisasiAplikasi() {

    if (
        aplikasiSudahDiinisialisasi
    ) {

        renderSemuaData();

        return;

    }


    aplikasiSudahDiinisialisasi =
        true;


    renderTombolMenu();

    perbaruiTampilanKeranjang();

    renderHPP();

    aktifkanLiveMonitoring();

}


// ==========================================================
// 35. MULAI
// ==========================================================

cekStatusLogin();
