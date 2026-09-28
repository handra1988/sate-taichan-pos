/* =========================================================
   SATE TAICHAN RIA - POS
   APP.JS
========================================================= */


/* =========================================================
   KONFIGURASI
========================================================= */

const PASSWORD_LOGIN = "KASIRRIA2026";

/*
   PENTING:
   PIN_AKSES JANGAN DIUBAH.

   Transaksi lama di Firebase menggunakan:
   password: "KASIR123"
*/
const PIN_AKSES = "KASIR123";


const LOGIN_STORAGE_KEY =
    "sateTaichanRIA_login";


const HPP_STORAGE_KEY =
    "sateTaichanRIA_HPP";


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
        deskripsi: "Tambahan",
        harga: 3000
    },

    {
        id: "a2",
        nama: "Extra Lontong",
        deskripsi: "Tambahan",
        harga: 3000
    },

    {
        id: "s1",
        nama: "Per Tusuk Ayam",
        deskripsi: "1 Tusuk",
        harga: 3000
    },

    {
        id: "s2",
        nama: "Per Tusuk Kulit",
        deskripsi: "1 Tusuk",
        harga: 2500
    },

    {
        id: "s3",
        nama: "Per Tusuk Ayam Crispy",
        deskripsi: "1 Tusuk",
        harga: 4000
    },

    {
        id: "ss1",
        nama: "Sosis Solo Original",
        deskripsi: "Isi Ayam",
        harga: 3000
    },

    {
        id: "ss2",
        nama: "Sosis Solo Pedas",
        deskripsi: "Isi Ayam",
        harga: 3500
    },

    {
        id: "ss3",
        nama: "Sosis Solo Keju",
        deskripsi: "Isi Ayam",
        harga: 3500
    },

    {
        id: "r1",
        nama: "Risol Mayo",
        deskripsi: "Enak Yummy!",
        harga: 3000
    },

    {
        id: "r2",
        nama: "Risol Bolognese",
        deskripsi: "Enak Yummy!",
        harga: 3500
    }

];


/* =========================================================
   STATE
========================================================= */

let keranjang = [];

let selectedMenu = null;

let selectedQty = 1;

let semuaTransaksi = [];

let transaksiAkanDihapus = null;


/* =========================================================
   HPP DEFAULT
========================================================= */

const DEFAULT_HPP = {

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


/* =========================================================
   UTILITAS
========================================================= */

function formatRupiah(nominal) {

    const angka =
        Number(nominal) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(angka);

}


function formatTanggal(waktu) {

    const date =
        parseTanggal(waktu);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function formatTanggalPanjang(waktu) {

    const date =
        parseTanggal(waktu);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


function formatJam(waktu) {

    const date =
        parseTanggal(waktu);

    if (!date) {
        return "-";
    }

    return date.toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function parseTanggal(waktu) {

    if (!waktu) {
        return null;
    }


    /*
       Firestore Timestamp
    */

    if (
        typeof waktu === "object" &&
        typeof waktu.toDate === "function"
    ) {

        return waktu.toDate();

    }


    /*
       Firestore timestamp object
       { seconds, nanoseconds }
    */

    if (
        typeof waktu === "object" &&
        typeof waktu.seconds === "number"
    ) {

        return new Date(
            waktu.seconds * 1000
        );

    }


    const date =
        new Date(waktu);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;

}


function tanggalISO(date) {

    const d =
        date instanceof Date
            ? date
            : new Date(date);

    const tahun =
        d.getFullYear();

    const bulan =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const hari =
        String(
            d.getDate()
        ).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;

}


function bulanISO(date) {

    const d =
        date instanceof Date
            ? date
            : new Date(date);

    const tahun =
        d.getFullYear();

    const bulan =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    return `${tahun}-${bulan}`;

}


function getTodayISO() {

    return tanggalISO(
        new Date()
    );

}


function getCurrentMonthISO() {

    return bulanISO(
        new Date()
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function tampilkanToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

}


/* =========================================================
   LOGIN
========================================================= */

function cekLogin() {

    const sudahLogin =
        sessionStorage.getItem(
            LOGIN_STORAGE_KEY
        );


    if (sudahLogin === "true") {

        tampilkanAplikasi();

    } else {

        tampilkanLogin();

    }

}


function tampilkanLogin() {

    const overlay =
        document.getElementById(
            "loginOverlay"
        );

    const app =
        document.getElementById(
            "app"
        );


    overlay.classList.remove("hidden");

    app.classList.add("hidden");


    setTimeout(() => {

        const input =
            document.getElementById(
                "passwordLogin"
            );

        if (input) {
            input.focus();
        }

    }, 100);

}


function tampilkanAplikasi() {

    const overlay =
        document.getElementById(
            "loginOverlay"
        );

    const app =
        document.getElementById(
            "app"
        );


    overlay.classList.add("hidden");

    app.classList.remove("hidden");


    initAplikasi();

}


window.prosesLogin = function () {

    const input =
        document.getElementById(
            "passwordLogin"
        );

    const error =
        document.getElementById(
            "loginError"
        );


    const password =
        input.value;


    if (password === PASSWORD_LOGIN) {

        sessionStorage.setItem(
            LOGIN_STORAGE_KEY,
            "true"
        );


        error.textContent = "";

        input.value = "";


        tampilkanAplikasi();


    } else {

        error.textContent =
            "Password salah. Silakan coba lagi.";

        input.value = "";

        input.focus();

    }

};


window.togglePasswordLogin = function () {

    const input =
        document.getElementById(
            "passwordLogin"
        );

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }

};


window.kunciAplikasi = function () {

    sessionStorage.removeItem(
        LOGIN_STORAGE_KEY
    );


    keranjang = [];

    renderKeranjang();


    tampilkanLogin();

};


/* =========================================================
   INIT
========================================================= */

let aplikasiSudahDiinisialisasi = false;


function initAplikasi() {

    if (aplikasiSudahDiinisialisasi) {

        renderSemuaData();

        return;

    }


    aplikasiSudahDiinisialisasi = true;


    setDefaultTanggal();

    renderMenu();

    renderKeranjang();

    renderHPP();

    mulaiMonitorFirebase();

    renderSemuaData();

}


/* =========================================================
   DEFAULT FILTER
========================================================= */

function setDefaultTanggal() {

    const today =
        getTodayISO();

    const month =
        getCurrentMonthISO();


    const dashboardTanggal =
        document.getElementById(
            "dashboardTanggal"
        );

    const laporanTanggal =
        document.getElementById(
            "laporanTanggal"
        );

    const laporanBulan =
        document.getElementById(
            "laporanBulan"
        );


    if (dashboardTanggal) {

        dashboardTanggal.value =
            today;

    }


    if (laporanTanggal) {

        laporanTanggal.value =
            today;

    }


    if (laporanBulan) {

        laporanBulan.value =
            month;

    }


    const tanggalKasir =
        document.getElementById(
            "tanggalKasir"
        );

    if (tanggalKasir) {

        tanggalKasir.textContent =
            formatTanggalPanjang(
                new Date()
            );

    }

}


/* =========================================================
   NAVIGASI
========================================================= */

window.pindahHalaman = function (namaPage) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            `page-${namaPage}`
        );


    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === namaPage
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (namaPage === "riwayat") {

        renderRiwayat();

    }


    if (namaPage === "laporan") {

        renderLaporanHarian();

        renderLaporanBulanan();

    }


    if (namaPage === "hpp") {

        renderHPP();

    }

};


/* =========================================================
   MENU
========================================================= */

function renderMenu() {

    const container =
        document.getElementById(
            "menuGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    MENU.forEach(menu => {

        const card =
            document.createElement(
                "button"
            );


        card.type = "button";

        card.className =
            "menu-card";


        card.innerHTML = `

            <div class="menu-card-icon">
                🍢
            </div>

            <div class="menu-card-name">
                ${escapeHTML(menu.nama)}
            </div>

            <div class="menu-card-description">
                ${escapeHTML(menu.deskripsi)}
            </div>

            <div class="menu-card-price">
                ${formatRupiah(menu.harga)}
            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                bukaQtyModal(menu);

            }
        );


        container.appendChild(card);

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================================================
   QTY MODAL
========================================================= */

function bukaQtyModal(menu) {

    selectedMenu = menu;

    selectedQty = 1;


    document.getElementById(
        "qtyMenuNama"
    ).textContent =
        menu.nama;


    document.getElementById(
        "qtyMenuHarga"
    ).textContent =
        formatRupiah(menu.harga);


    document.getElementById(
        "qtyValue"
    ).textContent =
        selectedQty;


    bukaModal("qtyModal");

}


window.ubahQty = function (jumlah) {

    selectedQty += jumlah;


    if (selectedQty < 1) {

        selectedQty = 1;

    }


    if (selectedQty > 99) {

        selectedQty = 99;

    }


    document.getElementById(
        "qtyValue"
    ).textContent =
        selectedQty;

};


window.tambahKeKeranjang = function () {

    if (!selectedMenu) {
        return;
    }


    const existing =
        keranjang.find(
            item =>
                item.id === selectedMenu.id
        );


    if (existing) {

        existing.jumlah +=
            selectedQty;

    } else {

        keranjang.push({

            id: selectedMenu.id,

            nama: selectedMenu.nama,

            harga: selectedMenu.harga,

            jumlah: selectedQty

        });

    }


    tutupModal("qtyModal");

    renderKeranjang();


    tampilkanToast(
        `${selectedMenu.nama} ditambahkan`
    );


    selectedMenu = null;

};


/* =========================================================
   KERANJANG
========================================================= */

function renderKeranjang() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    const totalElement =
        document.getElementById(
            "cartTotal"
        );

    const jumlahElement =
        document.getElementById(
            "jumlahItemKeranjang"
        );


    if (!container) {
        return;
    }


    if (keranjang.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🛒
                </div>

                <p>
                    Belum ada menu dipilih
                </p>

                <span>
                    Pilih menu di atas
                </span>

            </div>

        `;


        totalElement.textContent =
            formatRupiah(0);


        jumlahElement.textContent =
            "0 item";


        return;

    }


    container.innerHTML = "";


    let total =
        0;

    let jumlahItem =
        0;


    keranjang.forEach(
        (item, index) => {

            const subtotal =
                item.harga *
                item.jumlah;


            total += subtotal;

            jumlahItem +=
                item.jumlah;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "cart-item";


            row.innerHTML = `

                <div class="cart-item-info">

                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>

                    <span>
                        ${formatRupiah(item.harga)} × ${item.jumlah}
                    </span>

                </div>


                <div class="cart-item-right">

                    <strong>
                        ${formatRupiah(subtotal)}
                    </strong>


                    <div class="mini-qty">

                        <button
                            type="button"
                            onclick="ubahJumlahKeranjang(${index}, -1)"
                        >
                            −
                        </button>

                        <span>
                            ${item.jumlah}
                        </span>

                        <button
                            type="button"
                            onclick="ubahJumlahKeranjang(${index}, 1)"
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="btn-remove-item"
                        onclick="hapusItemKeranjang(${index})"
                    >
                        ×
                    </button>

                </div>

            `;


            container.appendChild(row);

        }
    );


    totalElement.textContent =
        formatRupiah(total);


    jumlahElement.textContent =
        `${jumlahItem} item`;

}


window.ubahJumlahKeranjang =
    function(index, perubahan) {

        if (!keranjang[index]) {
            return;
        }


        keranjang[index].jumlah +=
            perubahan;


        if (
            keranjang[index].jumlah <= 0
        ) {

            keranjang.splice(index, 1);

        }


        renderKeranjang();

    };


window.hapusItemKeranjang =
    function(index) {

        keranjang.splice(
            index,
            1
        );

        renderKeranjang();

    };


window.kosongkanKeranjang =
    function() {

        if (keranjang.length === 0) {
            return;
        }


        keranjang = [];

        renderKeranjang();

        tampilkanToast(
            "Keranjang dikosongkan"
        );

    };


function hitungTotalKeranjang() {

    return keranjang.reduce(
        (total, item) =>
            total +
            (
                item.harga *
                item.jumlah
            ),
        0
    );

}


/* =========================================================
   PEMBAYARAN
========================================================= */

window.bukaPembayaran = function () {

    if (keranjang.length === 0) {

        tampilkanToast(
            "Keranjang masih kosong"
        );

        return;

    }


    const total =
        hitungTotalKeranjang();


    document.getElementById(
        "paymentTotal"
    ).textContent =
        formatRupiah(total);


    document.getElementById(
        "uangDiterima"
    ).value = "";


    document.getElementById(
        "uangKembalian"
    ).textContent =
        formatRupiah(0);


    bukaModal("paymentModal");


    setTimeout(() => {

        document.getElementById(
            "uangDiterima"
        ).focus();

    }, 150);

};


window.hitungKembalian = function () {

    const total =
        hitungTotalKeranjang();


    const uang =
        Number(
            document.getElementById(
                "uangDiterima"
            ).value
        ) || 0;


    const kembalian =
        Math.max(
            0,
            uang - total
        );


    document.getElementById(
        "uangKembalian"
    ).textContent =
        formatRupiah(kembalian);

};


window.prosesPembayaran =
    async function() {

        if (keranjang.length === 0) {
            return;
        }


        const total =
            hitungTotalKeranjang();


        const uangDiterima =
            Number(
                document.getElementById(
                    "uangDiterima"
                ).value
            ) || 0;


        if (uangDiterima < total) {

            tampilkanToast(
                "Uang diterima masih kurang"
            );

            return;

        }


        const uangKembalian =
            uangDiterima - total;


        const transaksi = {

            items:
                keranjang.map(
                    item => ({

                        id: item.id,

                        nama: item.nama,

                        harga: item.harga,

                        jumlah: item.jumlah

                    })
                ),

            totalBayar:
                total,

            uangDiterima:
                uangDiterima,

            uangKembalian:
                uangKembalian,

            waktu:
                new Date(),

            /*
               PENTING:
               Tetap gunakan PIN lama
               agar transaksi lama tetap
               terbaca oleh laporan.
            */
            password:
                PIN_AKSES

        };


        try {

            await window.addDoc(
                window.collection(
                    window.db,
                    "transaksi"
                ),
                transaksi
            );


            keranjang = [];

            renderKeranjang();

            tutupModal("paymentModal");


            tampilkanToast(
                "✅ Transaksi berhasil disimpan"
            );


        } catch (error) {

            console.error(
                "Gagal menyimpan transaksi:",
                error
            );


            alert(
                "Gagal menyimpan transaksi.\n\n" +
                error.message
            );

        }

    };


/* =========================================================
   FIREBASE REALTIME
========================================================= */

function mulaiMonitorFirebase() {

    window.onSnapshot(

        window.collection(
            window.db,
            "transaksi"
        ),

        snapshot => {

            semuaTransaksi =
                [];


            snapshot.forEach(
                docSnapshot => {

                    const data =
                        docSnapshot.data();


                    /*
                       Hanya transaksi milik
                       Sate Taichan RIA yang
                       menggunakan PIN lama.
                    */

                    if (
                        data.password !==
                        PIN_AKSES
                    ) {

                        return;

                    }


                    semuaTransaksi.push({

                        idDokumen:
                            docSnapshot.id,

                        ...data

                    });

                }
            );


            semuaTransaksi.sort(
                (a, b) => {

                    const waktuA =
                        parseTanggal(
                            a.waktu
                        )?.getTime() || 0;


                    const waktuB =
                        parseTanggal(
                            b.waktu
                        )?.getTime() || 0;


                    return waktuB - waktuA;

                }
            );


            renderSemuaData();

        },

        error => {

            console.error(
                "Firebase snapshot error:",
                error
            );

        }

    );

}


/* =========================================================
   HPP
========================================================= */

function ambilHPP() {

    try {

        const data =
            localStorage.getItem(
                HPP_STORAGE_KEY
            );


        if (!data) {

            return {
                ...DEFAULT_HPP
            };

        }


        return {
            ...DEFAULT_HPP,
            ...JSON.parse(data)
        };

    } catch (error) {

        console.error(error);

        return {
            ...DEFAULT_HPP
        };

    }

}


function hitungHPPTransaksi(
    transaksi
) {

    const hpp =
        ambilHPP();


    if (
        !transaksi ||
        !Array.isArray(
            transaksi.items
        )
    ) {

        return 0;

    }


    return transaksi.items.reduce(
        (total, item) => {

            const hargaModal =
                Number(
                    hpp[item.id]
                ) || 0;


            return total +
                (
                    hargaModal *
                    (
                        Number(
                            item.jumlah
                        ) || 0
                    )
                );

        },
        0
    );

}


function renderHPP() {

    const container =
        document.getElementById(
            "hppContainer"
        );


    if (!container) {
        return;
    }


    const hpp =
        ambilHPP();


    container.innerHTML = "";


    MENU.forEach(menu => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "hpp-row";


        row.innerHTML = `

            <div class="hpp-info">

                <strong>
                    ${escapeHTML(menu.nama)}
                </strong>

                <span>
                    Harga jual:
                    ${formatRupiah(menu.harga)}
                </span>

            </div>


            <div class="hpp-input-wrapper">

                <span>
                    Rp
                </span>

                <input
                    type="number"
                    min="0"
                    step="100"
                    data-hpp-id="${menu.id}"
                    value="${Number(hpp[menu.id]) || 0}"
                >

            </div>

        `;


        container.appendChild(row);

    });

}


window.simpanHPP = function () {

    const inputs =
        document.querySelectorAll(
            "[data-hpp-id]"
        );


    const hpp = {};


    inputs.forEach(input => {

        const id =
            input.dataset.hppId;


        hpp[id] =
            Number(input.value) || 0;

    });


    localStorage.setItem(
        HPP_STORAGE_KEY,
        JSON.stringify(hpp)
    );


    renderSemuaData();


    tampilkanToast(
        "✅ HPP berhasil disimpan"
    );

};


/* =========================================================
   FILTER TRANSAKSI
========================================================= */

function transaksiTanggal(
    transaksi,
    tanggal
) {

    const date =
        parseTanggal(
            transaksi.waktu
        );


    if (!date) {
        return false;
    }


    return tanggalISO(date) === tanggal;

}


function transaksiBulan(
    transaksi,
    bulan
) {

    const date =
        parseTanggal(
            transaksi.waktu
        );


    if (!date) {
        return false;
    }


    return bulanISO(date) === bulan;

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const input =
        document.getElementById(
            "dashboardTanggal"
        );


    const tanggal =
        input?.value ||
        getTodayISO();


    const data =
        semuaTransaksi.filter(
            transaksi =>
                transaksiTanggal(
                    transaksi,
                    tanggal
                )
        );


    let omzet = 0;

    let jumlahItem = 0;

    let hpp = 0;


    data.forEach(transaksi => {

        omzet +=
            Number(
                transaksi.totalBayar
            ) || 0;


        if (
            Array.isArray(
                transaksi.items
            )
        ) {

            transaksi.items.forEach(
                item => {

                    jumlahItem +=
                        Number(
                            item.jumlah
                        ) || 0;

                }
            );

        }


        hpp +=
            hitungHPPTransaksi(
                transaksi
            );

    });


    const laba =
        omzet - hpp;


    const rataRata =
        data.length > 0
            ? omzet / data.length
            : 0;


    document.getElementById(
        "dashboardOmzet"
    ).textContent =
        formatRupiah(omzet);


    document.getElementById(
        "dashboardTransaksi"
    ).textContent =
        data.length;


    document.getElementById(
        "dashboardItem"
    ).textContent =
        jumlahItem;


    document.getElementById(
        "dashboardHPP"
    ).textContent =
        formatRupiah(hpp);


    document.getElementById(
        "dashboardLaba"
    ).textContent =
        formatRupiah(laba);


    document.getElementById(
        "dashboardAverage"
    ).textContent =
        formatRupiah(rataRata);


    renderTopMenu(data);

    renderMonthlySummary();

    renderDashboardRecent();

    renderKasirSummary();

}


/* =========================================================
   TOP MENU
========================================================= */

function renderTopMenu(data) {

    const container =
        document.getElementById(
            "topMenuContainer"
        );


    if (!container) {
        return;
    }


    const statistik = {};


    data.forEach(transaksi => {

        if (
            !Array.isArray(
                transaksi.items
            )
        ) {
            return;
        }


        transaksi.items.forEach(item => {

            if (!statistik[item.id]) {

                statistik[item.id] = {

                    id: item.id,

                    nama: item.nama,

                    jumlah: 0

                };

            }


            statistik[item.id].jumlah +=
                Number(item.jumlah) || 0;

        });

    });


    const ranking =
        Object.values(statistik)
            .sort(
                (a, b) =>
                    b.jumlah -
                    a.jumlah
            )
            .slice(0, 5);


    if (ranking.length === 0) {

        container.innerHTML = `

            <div class="empty-small">
                Belum ada penjualan.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    ranking.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "top-menu-row";


            row.innerHTML = `

                <div class="top-rank">
                    ${index + 1}
                </div>

                <div class="top-menu-info">

                    <strong>
                        ${escapeHTML(item.nama)}
                    </strong>

                    <span>
                        Terjual ${item.jumlah} item
                    </span>

                </div>

                <strong class="top-menu-number">
                    ${item.jumlah}
                </strong>

            `;


            container.appendChild(row);

        }
    );

}


/* =========================================================
   RINGKASAN BULANAN DASHBOARD
========================================================= */

function renderMonthlySummary() {

    const bulan =
        getCurrentMonthISO();


    const data =
        semuaTransaksi.filter(
            transaksi =>
                transaksiBulan(
                    transaksi,
                    bulan
                )
        );


    let omzet = 0;

    let hpp = 0;


    data.forEach(transaksi => {

        omzet +=
            Number(
                transaksi.totalBayar
            ) || 0;


        hpp +=
            hitungHPPTransaksi(
                transaksi
            );

    });


    document.getElementById(
        "monthlyOmzet"
    ).textContent =
        formatRupiah(omzet);


    document.getElementById(
        "monthlyHPP"
    ).textContent =
        formatRupiah(hpp);


    document.getElementById(
        "monthlyLaba"
    ).textContent =
        formatRupiah(
            omzet - hpp
        );

}


/* =========================================================
   DASHBOARD RECENT
========================================================= */

function renderDashboardRecent() {

    const container =
        document.getElementById(
            "dashboardRecentTransactions"
        );


    if (!container) {
        return;
    }


    const data =
        semuaTransaksi
            .slice(0, 5);


    if (data.length === 0) {

        container.innerHTML = `

            <div class="empty-small">
                Belum ada transaksi.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    data.forEach(transaksi => {

        const row =
            buatRowTransaksi(
                transaksi,
                true
            );


        container.appendChild(row);

    });

}


/* =========================================================
   SUMMARY KASIR
========================================================= */

function renderKasirSummary() {

    const today =
        getTodayISO();


    const data =
        semuaTransaksi.filter(
            transaksi =>
                transaksiTanggal(
                    transaksi,
                    today
                )
        );


    const omzet =
        data.reduce(
            (total, transaksi) =>
                total +
                (
                    Number(
                        transaksi.totalBayar
                    ) || 0
                ),
            0
        );


    const omzetElement =
        document.getElementById(
            "kasirOmzetHariIni"
        );


    const transaksiElement =
        document.getElementById(
            "kasirTransaksiHariIni"
        );


    if (omzetElement) {

        omzetElement.textContent =
            formatRupiah(omzet);

    }


    if (transaksiElement) {

        transaksiElement.textContent =
            data.length;

    }

}


/* =========================================================
   LAPORAN HARIAN
========================================================= */

window.renderLaporanHarian =
    function() {

        const input =
            document.getElementById(
                "laporanTanggal"
            );


        const tanggal =
            input?.value ||
            getTodayISO();


        const data =
            semuaTransaksi.filter(
                transaksi =>
                    transaksiTanggal(
                        transaksi,
                        tanggal
                    )
            );


        let omzet = 0;

        let hpp = 0;


        data.forEach(transaksi => {

            omzet +=
                Number(
                    transaksi.totalBayar
                ) || 0;


            hpp +=
                hitungHPPTransaksi(
                    transaksi
                );

        });


        document.getElementById(
            "laporanHarianOmzet"
        ).textContent =
            formatRupiah(omzet);


        document.getElementById(
            "laporanHarianHPP"
        ).textContent =
            formatRupiah(hpp);


        document.getElementById(
            "laporanHarianLaba"
        ).textContent =
            formatRupiah(
                omzet - hpp
            );


        const tbody =
            document.getElementById(
                "tabelLaporanHarian"
            );


        tbody.innerHTML = "";


        if (data.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="4"
                        class="table-empty">

                        Tidak ada transaksi.

                    </td>

                </tr>

            `;

            return;

        }


        data.forEach(transaksi => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${formatJam(transaksi.waktu)}
                </td>

                <td>
                    ${jumlahNamaItem(transaksi)}
                </td>

                <td>
                    <strong>
                        ${formatRupiah(transaksi.totalBayar)}
                    </strong>
                </td>

                <td>

                    <button
                        type="button"
                        class="btn-table"
                        onclick="bukaDetailTransaksi('${transaksi.idDokumen}')"
                    >
                        Detail
                    </button>

                </td>

            `;


            tbody.appendChild(tr);

        });

    };


/* =========================================================
   LAPORAN BULANAN
========================================================= */

window.renderLaporanBulanan =
    function() {

        const input =
            document.getElementById(
                "laporanBulan"
            );


        const bulan =
            input?.value ||
            getCurrentMonthISO();


        const data =
            semuaTransaksi.filter(
                transaksi =>
                    transaksiBulan(
                        transaksi,
                        bulan
                    )
            );


        let omzet = 0;

        let hpp = 0;


        data.forEach(transaksi => {

            omzet +=
                Number(
                    transaksi.totalBayar
                ) || 0;


            hpp +=
                hitungHPPTransaksi(
                    transaksi
                );

        });


        document.getElementById(
            "laporanBulananOmzet"
        ).textContent =
            formatRupiah(omzet);


        document.getElementById(
            "laporanBulananHPP"
        ).textContent =
            formatRupiah(hpp);


        document.getElementById(
            "laporanBulananLaba"
        ).textContent =
            formatRupiah(
                omzet - hpp
            );


        const tbody =
            document.getElementById(
                "tabelLaporanBulanan"
            );


        tbody.innerHTML = "";


        if (data.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="4"
                        class="table-empty">

                        Tidak ada transaksi.

                    </td>

                </tr>

            `;

            return;

        }


        const grouped = {};


        data.forEach(transaksi => {

            const date =
                parseTanggal(
                    transaksi.waktu
                );


            const key =
                tanggalISO(date);


            if (!grouped[key]) {

                grouped[key] = {

                    tanggal: key,

                    transaksi: 0,

                    omzet: 0

                };

            }


            grouped[key].transaksi++;

            grouped[key].omzet +=
                Number(
                    transaksi.totalBayar
                ) || 0;

        });


        Object.values(grouped)
            .sort(
                (a, b) =>
                    b.tanggal.localeCompare(
                        a.tanggal
                    )
            )
            .forEach(day => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML = `

                    <td>
                        ${formatTanggal(day.tanggal)}
                    </td>

                    <td>
                        ${day.transaksi}
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(day.omzet)}
                        </strong>
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn-table"
                            onclick="bukaDetailRiwayat('tanggal','${day.tanggal}','${day.tanggal}')"
                        >
                            Detail
                        </button>

                    </td>

                `;


                tbody.appendChild(tr);

            });

    };


/* =========================================================
   RIWAYAT TRANSAKSI
========================================================= */

window.renderRiwayat = function() {

    const container =
        document.getElementById(
            "riwayatContainer"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "searchRiwayat"
        );


    const search =
        (
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    let data =
        semuaTransaksi;


    if (search) {

        data =
            semuaTransaksi.filter(
                transaksi => {

                    const text =
                        getSearchText(
                            transaksi
                        );

                    return text.includes(
                        search
                    );

                }
            );

    }


    const count =
        document.getElementById(
            "jumlahSemuaTransaksi"
        );


    if (count) {

        count.textContent =
            semuaTransaksi.length;

    }


    container.innerHTML = "";


    if (data.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    🧾
                </div>

                <h3>
                    Tidak ada transaksi
                </h3>

                <p>
                    Belum ada transaksi yang sesuai.
                </p>

            </div>

        `;

        return;

    }


    data.forEach(transaksi => {

        const card =
            buatKartuRiwayat(
                transaksi
            );


        container.appendChild(card);

    });

};


function getSearchText(transaksi) {

    const tanggal =
        formatTanggal(
            transaksi.waktu
        );


    const jam =
        formatJam(
            transaksi.waktu
        );


    const items =
        Array.isArray(
            transaksi.items
        )
            ? transaksi.items
                .map(
                    item =>
                        `${item.nama} ${item.jumlah}`
                )
                .join(" ")
            : "";


    const total =
        String(
            transaksi.totalBayar || ""
        );


    return `
        ${tanggal}
        ${jam}
        ${items}
        ${total}
    `
        .toLowerCase();

}


function buatKartuRiwayat(
    transaksi
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "history-card";


    const itemsText =
        jumlahNamaItem(
            transaksi
        );


    const itemList =
        Array.isArray(
            transaksi.items
        )
            ? transaksi.items
            : [];


    let itemsHTML = "";


    itemList.forEach(item => {

        itemsHTML += `

            <div class="history-item">

                <span>
                    ${escapeHTML(item.nama)}
                </span>

                <span>
                    ${item.jumlah} ×
                    ${formatRupiah(item.harga)}
                </span>

            </div>

        `;

    });


    card.innerHTML = `

        <div class="history-top">

            <div>

                <div class="history-date">
                    ${formatTanggalPanjang(transaksi.waktu)}
                </div>

                <div class="history-time">
                    🕐 ${formatJam(transaksi.waktu)} WIB
                </div>

            </div>

            <div class="history-total">
                ${formatRupiah(transaksi.totalBayar)}
            </div>

        </div>


        <div class="history-items">

            ${itemsHTML}

        </div>


        <div class="history-bottom">

            <span class="history-item-count">
                🍢 ${itemsText}
            </span>

            <div class="history-actions">

                <button
                    type="button"
                    class="btn-secondary btn-detail"
                    onclick="bukaDetailTransaksi('${transaksi.idDokumen}')"
                >
                    👁️ Detail
                </button>


                <button
                    type="button"
                    class="btn-danger btn-delete"
                    onclick="bukaModalHapusTransaksi('${transaksi.idDokumen}')"
                >
                    🗑️ Hapus
                </button>

            </div>

        </div>

    `;


    return card;

}


function buatRowTransaksi(
    transaksi,
    tampilHapus = false
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "recent-transaction";


    row.innerHTML = `

        <div class="recent-icon">
            🧾
        </div>


        <div class="recent-info">

            <strong>
                ${formatJam(transaksi.waktu)}
            </strong>

            <span>
                ${jumlahNamaItem(transaksi)}
            </span>

        </div>


        <div class="recent-right">

            <strong>
                ${formatRupiah(transaksi.totalBayar)}
            </strong>

            <button
                type="button"
                class="btn-table"
                onclick="bukaDetailTransaksi('${transaksi.idDokumen}')"
            >
                Detail
            </button>

        </div>

    `;


    return row;

}


function jumlahNamaItem(transaksi) {

    if (
        !Array.isArray(
            transaksi.items
        )
    ) {

        return "0 item";

    }


    const jumlah =
        transaksi.items.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(
                        item.jumlah
                    ) || 0
                ),
            0
        );


    return `${jumlah} item`;

}


/* =========================================================
   SEARCH RIWAYAT
========================================================= */

window.clearSearchRiwayat =
    function() {

        const input =
            document.getElementById(
                "searchRiwayat"
            );


        if (input) {

            input.value = "";

            renderRiwayat();

        }

    };


/* =========================================================
   DETAIL TRANSAKSI
========================================================= */

window.bukaDetailTransaksi =
    function(idDokumen) {

        const transaksi =
            semuaTransaksi.find(
                item =>
                    item.idDokumen ===
                    idDokumen
            );


        if (!transaksi) {

            tampilkanToast(
                "Transaksi tidak ditemukan"
            );

            return;

        }


        const container =
            document.getElementById(
                "detailTransaksiContent"
            );


        let itemsHTML = "";


        if (
            Array.isArray(
                transaksi.items
            )
        ) {

            transaksi.items.forEach(item => {

                const subtotal =
                    (
                        Number(
                            item.harga
                        ) || 0
                    ) *
                    (
                        Number(
                            item.jumlah
                        ) || 0
                    );


                itemsHTML += `

                    <div class="detail-item">

                        <div>

                            <strong>
                                ${escapeHTML(item.nama)}
                            </strong>

                            <span>
                                ${item.jumlah} ×
                                ${formatRupiah(item.harga)}
                            </span>

                        </div>

                        <strong>
                            ${formatRupiah(subtotal)}
                        </strong>

                    </div>

                `;

            });

        }


        const hpp =
            hitungHPPTransaksi(
                transaksi
            );


        const laba =
            (
                Number(
                    transaksi.totalBayar
                ) || 0
            ) - hpp;


        container.innerHTML = `

            <div class="detail-info">

                <div>

                    <span>
                        Tanggal
                    </span>

                    <strong>
                        ${formatTanggalPanjang(transaksi.waktu)}
                    </strong>

                </div>


                <div>

                    <span>
                        Waktu
                    </span>

                    <strong>
                        ${formatJam(transaksi.waktu)} WIB
                    </strong>

                </div>

            </div>


            <div class="detail-items">

                ${itemsHTML}

            </div>


            <div class="detail-total">

                <span>
                    Total
                </span>

                <strong>
                    ${formatRupiah(transaksi.totalBayar)}
                </strong>

            </div>


            <div class="detail-payment">

                <div>
                    <span>
                        Uang diterima
                    </span>

                    <strong>
                        ${formatRupiah(transaksi.uangDiterima)}
                    </strong>
                </div>

                <div>
                    <span>
                        Kembalian
                    </span>

                    <strong>
                        ${formatRupiah(transaksi.uangKembalian)}
                    </strong>
                </div>

            </div>


            <div class="detail-profit">

                <div>
                    <span>
                        HPP
                    </span>

                    <strong>
                        ${formatRupiah(hpp)}
                    </strong>
                </div>

                <div>
                    <span>
                        Laba Kotor
                    </span>

                    <strong>
                        ${formatRupiah(laba)}
                    </strong>
                </div>

            </div>


            <div class="detail-actions">

                <button
                    type="button"
                    class="btn-danger"
                    onclick="dariDetailKeHapus('${transaksi.idDokumen}')"
                >
                    🗑️ Hapus Transaksi
                </button>

            </div>

        `;


        bukaModal("detailModal");

    };


window.dariDetailKeHapus =
    function(idDokumen) {

        tutupModal("detailModal");

        setTimeout(() => {

            bukaModalHapusTransaksi(
                idDokumen
            );

        }, 200);

    };


/* =========================================================
   DETAIL BERDASARKAN TANGGAL
========================================================= */

window.bukaDetailRiwayat =
    function(tipe, key, label) {

        let data = [];


        if (tipe === "tanggal") {

            data =
                semuaTransaksi.filter(
                    transaksi =>
                        transaksiTanggal(
                            transaksi,
                            key
                        )
                );

        }


        if (tipe === "bulan") {

            data =
                semuaTransaksi.filter(
                    transaksi =>
                        transaksiBulan(
                            transaksi,
                            key
                        )
                );

        }


        const container =
            document.getElementById(
                "detailTransaksiContent"
            );


        let html = `

            <div class="detail-report-title">

                <strong>
                    ${escapeHTML(label)}
                </strong>

                <span>
                    ${data.length} transaksi
                </span>

            </div>

        `;


        if (data.length === 0) {

            html += `

                <div class="empty-small">
                    Tidak ada transaksi.
                </div>

            `;

        } else {

            data.forEach(transaksi => {

                html += `

                    <div class="report-detail-row">

                        <div>

                            <strong>
                                ${formatJam(transaksi.waktu)}
                            </strong>

                            <span>
                                ${jumlahNamaItem(transaksi)}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatRupiah(transaksi.totalBayar)}
                            </strong>

                            <button
                                type="button"
                                class="btn-danger-small"
                                onclick="dariDetailKeHapus('${transaksi.idDokumen}')"
                            >
                                Hapus
                            </button>

                        </div>

                    </div>

                `;

            });

        }


        container.innerHTML =
            html;


        bukaModal("detailModal");

    };


/* =========================================================
   FITUR HAPUS TRANSAKSI
========================================================= */

window.bukaModalHapusTransaksi =
    function(idDokumen) {

        const transaksi =
            semuaTransaksi.find(
                item =>
                    item.idDokumen ===
                    idDokumen
            );


        if (!transaksi) {

            tampilkanToast(
                "Transaksi tidak ditemukan"
            );

            return;

        }


        transaksiAkanDihapus =
            transaksi;


        const preview =
            document.getElementById(
                "deleteTransactionPreview"
            );


        const deletePin =
            document.getElementById(
                "deletePin"
            );


        const deleteError =
            document.getElementById(
                "deleteError"
            );


        let itemsHTML = "";


        if (
            Array.isArray(
                transaksi.items
            )
        ) {

            transaksi.items.forEach(item => {

                itemsHTML += `

                    <div class="delete-preview-item">

                        <span>
                            ${escapeHTML(item.nama)}
                        </span>

                        <strong>
                            ${item.jumlah}x
                        </strong>

                    </div>

                `;

            });

        }


        preview.innerHTML = `

            <div class="delete-preview-header">

                <div>

                    <span>
                        ${formatTanggal(transaksi.waktu)}
                    </span>

                    <strong>
                        ${formatJam(transaksi.waktu)} WIB
                    </strong>

                </div>


                <strong class="delete-preview-total">
                    ${formatRupiah(transaksi.totalBayar)}
                </strong>

            </div>


            <div class="delete-preview-items">

                ${itemsHTML}

            </div>

        `;


        deletePin.value = "";

        deleteError.textContent = "";


        bukaModal("deleteModal");


        setTimeout(() => {

            deletePin.focus();

        }, 150);

    };


window.toggleDeletePin =
    function() {

        const input =
            document.getElementById(
                "deletePin"
            );


        if (
            input.type ===
            "password"
        ) {

            input.type =
                "text";

        } else {

            input.type =
                "password";

        }

    };


window.konfirmasiHapusTransaksi =
    async function() {

        const errorElement =
            document.getElementById(
                "deleteError"
            );


        const pinInput =
            document.getElementById(
                "deletePin"
            );


        if (!transaksiAkanDihapus) {

            errorElement.textContent =
                "Transaksi tidak ditemukan.";

            return;

        }


        const pin =
            pinInput.value.trim();


        if (!pin) {

            errorElement.textContent =
                "PIN wajib diisi.";

            pinInput.focus();

            return;

        }


        if (pin !== PIN_AKSES) {

            errorElement.textContent =
                "PIN salah.";

            pinInput.value = "";

            pinInput.focus();

            return;

        }


        const idDokumen =
            transaksiAkanDihapus.idDokumen;


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


            /*
               Jangan menghapus manual
               dari array.

               onSnapshot Firebase akan
               mengirim data terbaru dan
               otomatis memperbarui semua
               dashboard/laporan.
            */


            transaksiAkanDihapus =
                null;


            tutupModal(
                "deleteModal"
            );


            tampilkanToast(
                "🗑️ Transaksi berhasil dihapus"
            );


        } catch (error) {

            console.error(
                "Gagal menghapus transaksi:",
                error
            );


            errorElement.textContent =
                "Gagal menghapus transaksi. " +
                "Periksa koneksi internet.";

        }

    };


/* =========================================================
   MODAL
========================================================= */

function bukaModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


window.tutupModal =
    function(id) {

        const modal =
            document.getElementById(id);


        if (!modal) {
            return;
        }


        modal.classList.add(
            "hidden"
        );


        const masihAdaModal =
            document.querySelector(
                ".modal-overlay:not(.hidden)"
            );


        if (!masihAdaModal) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    };


window.tutupModalJikaOverlay =
    function(event, id) {

        if (
            event.target ===
            event.currentTarget
        ) {

            tutupModal(id);

        }

    };


/* =========================================================
   RENDER SEMUA
========================================================= */

window.renderSemuaData =
    function() {

        renderDashboard();

        renderLaporanHarian();

        renderLaporanBulanan();

        renderRiwayat();

        renderKasirSummary();

    };


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cekLogin();

    }
);
