// ==========================================================
// SISTEM LOGIN POS
// ==========================================================

// Password untuk membuka aplikasi POS
// Opsi A: password berada di sisi client
const PASSWORD_LOGIN = "KASIRRIA2026";

// PIN lama untuk identifikasi transaksi Firebase.
// JANGAN DIUBAH agar transaksi lama tetap terbaca.
const PIN_AKSES = "KASIR123";


// ==========================================================
// STATUS LOGIN
// ==========================================================

let sudahLogin = false;


// Cek status login saat aplikasi dibuka
function cekStatusLogin() {

    const statusLogin =
        sessionStorage.getItem("sateTaichanRIA_login");

    if (statusLogin === "true") {

        sudahLogin = true;

        tampilkanPOS();

    } else {

        sudahLogin = false;

        tampilkanLogin();

    }
}


// Tampilkan halaman login
function tampilkanLogin() {

    const loginScreen =
        document.getElementById("login-screen");

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (app) {
        app.style.display = "none";
    }

    const input =
        document.getElementById("login-password");

    if (input) {

        setTimeout(() => {
            input.focus();
        }, 300);

    }
}


// Tampilkan aplikasi POS
function tampilkanPOS() {

    sudahLogin = true;

    const loginScreen =
        document.getElementById("login-screen");

    const app =
        document.getElementById("app");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "block";
    }
}


// ==========================================================
// PROSES LOGIN
// ==========================================================

function prosesLogin() {

    const input =
        document.getElementById("login-password");

    const error =
        document.getElementById("login-error");

    if (!input) return;


    const password =
        input.value;


    if (password === PASSWORD_LOGIN) {

        sudahLogin = true;

        sessionStorage.setItem(
            "sateTaichanRIA_login",
            "true"
        );

        if (error) {
            error.style.display = "none";
        }

        input.value = "";

        tampilkanPOS();

        // Jalankan sistem POS setelah login berhasil
        inisialisasiPOS();

    } else {

        if (error) {

            error.style.display = "block";

            // Reset animasi error
            error.style.animation = "none";

            void error.offsetWidth;

            error.style.animation =
                "errorShake 0.3s ease";

        }

        input.value = "";

        input.focus();

    }

}


// ==========================================================
// TAMPILKAN / SEMBUNYIKAN PASSWORD
// ==========================================================

function togglePassword() {

    const input =
        document.getElementById("login-password");

    const button =
        document.getElementById("toggle-password");

    if (!input || !button) return;


    if (input.type === "password") {

        input.type = "text";

        button.innerText = "🙈";

        button.setAttribute(
            "aria-label",
            "Sembunyikan password"
        );

    } else {

        input.type = "password";

        button.innerText = "👁️";

        button.setAttribute(
            "aria-label",
            "Tampilkan password"
        );

    }

}


// ==========================================================
// KUNCI POS
// ==========================================================

window.kunciPOS = function() {

    const yakin =
        confirm(
            "Kunci POS sekarang?\n\nAnda perlu memasukkan password kembali untuk membuka POS."
        );

    if (!yakin) return;


    sessionStorage.removeItem(
        "sateTaichanRIA_login"
    );

    sudahLogin = false;


    // Tutup modal jika sedang terbuka
    const modalQty =
        document.getElementById("popup-qty");

    const modalBayar =
        document.getElementById("popup-pembayaran");

    const modalDetail =
        document.getElementById("popup-detail");


    if (modalQty) {
        modalQty.style.display = "none";
    }

    if (modalBayar) {
        modalBayar.style.display = "none";
    }

    if (modalDetail) {
        modalDetail.style.display = "none";
    }


    tampilkanLogin();

};


// ==========================================================
// EVENT LOGIN
// ==========================================================

function pasangEventLogin() {

    const buttonLogin =
        document.getElementById("btn-login");

    const inputPassword =
        document.getElementById("login-password");

    const toggleButton =
        document.getElementById("toggle-password");


    if (buttonLogin) {

        buttonLogin.addEventListener(
            "click",
            prosesLogin
        );

    }


    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            togglePassword
        );

    }


    if (inputPassword) {

        inputPassword.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    prosesLogin();

                }

            }
        );

    }

}


// ==========================================================
// 1. DATA MASTER MENU
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


let keranjang = [];

let totalHarga = 0;

let menuDipilih = null;

let semuaDataTransaksi = [];

let posSudahDiinisialisasi = false;


// ==========================================================
// NAMA BULAN
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
// FORMAT RUPIAH
// ==========================================================

function formatRupiah(angka) {

    return "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID");

}


// ==========================================================
// 2. RENDER MENU
// ==========================================================

function renderTombolMenu() {

    const containerMenu =
        document.getElementById(
            "container-menu"
        );

    if (!containerMenu) return;


    containerMenu.innerHTML = "";


    daftarMenu.forEach(menu => {

        const tombol =
            document.createElement("button");


        tombol.innerHTML = `

            <div
                style="
                    font-size:0.9rem;
                    margin-bottom:4px;
                    text-align:center;
                    line-height:1.2;
                "
            >
                ${menu.nama}
            </div>

            <div
                style="
                    color:#ff4e50;
                    font-size:0.85rem;
                    font-weight:700;
                "
            >
                ${formatRupiah(menu.harga)}
            </div>

        `;


        tombol.onclick =
            function() {

                bukaModalJumlah(menu);

            };


        containerMenu.appendChild(
            tombol
        );

    });

}


// ==========================================================
// MODAL JUMLAH
// ==========================================================

function bukaModalJumlah(menu) {

    if (!sudahLogin) return;


    menuDipilih = menu;


    document.getElementById(
        "modal-menu-title"
    ).innerText = menu.nama;


    document.getElementById(
        "modal-qty"
    ).value = 1;


    document.getElementById(
        "popup-qty"
    ).style.display = "flex";

}


window.ubahQty = function(nilai) {

    if (!sudahLogin) return;


    const inputQty =
        document.getElementById(
            "modal-qty"
        );


    let qtySekarang =
        parseInt(inputQty.value) || 1;


    qtySekarang += nilai;


    if (qtySekarang < 1) {

        qtySekarang = 1;

    }


    inputQty.value =
        qtySekarang;

};


window.tutupModal = function() {

    document.getElementById(
        "popup-qty"
    ).style.display = "none";


    menuDipilih = null;

};


window.konfirmasiTambahKeKeranjang =
    function() {

        if (!sudahLogin) return;

        if (!menuDipilih) return;


        const qtyInput =
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

            itemSama.jumlah +=
                qtyInput;

        } else {

            keranjang.push({

                nama:
                    menuDipilih.nama,

                harga:
                    menuDipilih.harga,

                jumlah:
                    qtyInput

            });

        }


        perbaruiTampilanKeranjang();

        tutupModal();

    };


// ==========================================================
// TAMPILAN KERANJANG
// ==========================================================

function perbaruiTampilanKeranjang() {

    const daftarKeranjangEl =
        document.getElementById(
            "daftar-keranjang"
        );

    const totalHargaEl =
        document.getElementById(
            "total-harga"
        );


    if (
        !daftarKeranjangEl ||
        !totalHargaEl
    ) {
        return;
    }


    daftarKeranjangEl.innerHTML = "";

    totalHarga = 0;


    keranjang.forEach(
        (item, index) => {

            const subTotal =
                item.harga *
                item.jumlah;


            totalHarga +=
                subTotal;


            const li =
                document.createElement(
                    "li"
                );


            li.innerHTML = `

                <div>

                    <strong
                        style="
                            color:#2d3748;
                        "
                    >
                        ${item.nama}
                    </strong>

                    <br>

                    <span
                        style="
                            color:#718096;
                            font-size:0.85rem;
                        "
                    >
                        ${item.jumlah}x
                        @
                        ${formatRupiah(item.harga)}
                    </span>

                </div>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    "
                >

                    <span
                        style="
                            font-weight:600;
                            color:#4a5568;
                        "
                    >
                        ${formatRupiah(subTotal)}
                    </span>

                    <button
                        onclick="hapusItem(${index})"
                    >
                        X
                    </button>

                </div>

            `;


            daftarKeranjangEl.appendChild(
                li
            );

        }
    );


    totalHargaEl.innerText =
        formatRupiah(totalHarga);

}


window.hapusItem = function(index) {

    if (!sudahLogin) return;


    keranjang.splice(
        index,
        1
    );


    perbaruiTampilanKeranjang();

};


// ==========================================================
// 3. PEMBAYARAN
// ==========================================================

window.bukaModalPembayaran =
    function() {

        if (!sudahLogin) return;


        if (keranjang.length === 0) {

            alert(
                "Keranjang masih kosong, silakan pilih menu terlebih dahulu!"
            );

            return;

        }


        document.getElementById(
            "pay-txt-tagihan"
        ).innerText =
            formatRupiah(totalHarga);


        const inputNominal =
            document.getElementById(
                "pay-input-nominal"
            );


        inputNominal.value = "";


        document.getElementById(
            "pay-txt-kembalian"
        ).innerText =
            "Rp 0";


        const containerPintasan =
            document.getElementById(
                "pay-container-pintasan"
            );


        containerPintasan.innerHTML =
            "";


        let pecahanPilihan =
            [totalHarga];


        [
            10000,
            20000,
            50000,
            100000
        ].forEach(
            p => {

                if (
                    p > totalHarga &&
                    !pecahanPilihan.includes(p)
                ) {

                    pecahanPilihan.push(p);

                }

            }
        );


        pecahanPilihan
            .slice(0, 4)
            .forEach(
                nominal => {

                    const btn =
                        document.createElement(
                            "button"
                        );


                    btn.className =
                        "btn-pecahan";


                    btn.innerText =
                        nominal === totalHarga
                            ? "Uang Pas"
                            : formatRupiah(nominal);


                    btn.onclick =
                        function() {

                            inputNominal.value =
                                nominal;

                            hitungKembalianLive();

                        };


                    containerPintasan.appendChild(
                        btn
                    );

                }
            );


        document.getElementById(
            "popup-pembayaran"
        ).style.display =
            "flex";


        setTimeout(
            () => inputNominal.focus(),
            100
        );

    };


window.tutupModalPembayaran =
    function() {

        document.getElementById(
            "popup-pembayaran"
        ).style.display =
            "none";

    };


window.hitungKembalianLive =
    function() {

        if (!sudahLogin) return;


        const inputNominal =
            document.getElementById(
                "pay-input-nominal"
            ).value;


        const uangDiterima =
            parseInt(inputNominal) || 0;


        const btnSimpan =
            document.getElementById(
                "pay-btn-eksekusi"
            );


        const kembalian =
            uangDiterima -
            totalHarga;


        if (kembalian < 0) {

            document.getElementById(
                "pay-txt-kembalian"
            ).innerText =
                "Uang Kurang!";


            btnSimpan.disabled =
                true;


            btnSimpan.style.opacity =
                0.5;

        } else {

            document.getElementById(
                "pay-txt-kembalian"
            ).innerText =
                formatRupiah(kembalian);


            btnSimpan.disabled =
                false;


            btnSimpan.style.opacity =
                1;

        }

    };


window.prosesPembayaranAkhir =
    async function() {

        if (!sudahLogin) return;


        const inputNominal =
            document.getElementById(
                "pay-input-nominal"
            ).value;


        const uangDiterima =
            parseInt(inputNominal) || 0;


        if (
            uangDiterima <
            totalHarga
        ) {

            alert(
                "Nominal pembayaran masih kurang dari total tagihan!"
            );

            return;

        }


        const dataTransaksi = {

            items:
                keranjang,

            totalBayar:
                totalHarga,

            uangDiterima:
                uangDiterima,

            uangKembalian:
                uangDiterima -
                totalHarga,

            waktu:
                new Date(),

            // Tetap menggunakan PIN lama
            // agar data lama tetap kompatibel
            password:
                PIN_AKSES

        };


        try {

            if (
                !window.db ||
                !window.collection ||
                !window.addDoc
            ) {

                throw new Error(
                    "Koneksi Firebase belum siap."
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

                `Transaksi SUKSES!\n` +
                `Total: ${formatRupiah(totalHarga)}\n` +
                `Kembalian: ${formatRupiah(
                    dataTransaksi.uangKembalian
                )}`

            );


            tutupModalPembayaran();


            keranjang = [];


            perbaruiTampilanKeranjang();


        } catch (error) {

            console.error(
                "Gagal simpan transaksi:",
                error
            );


            alert(
                "Akses simpan gagal! Periksa koneksi internet Anda."
            );

        }

    };


// ==========================================================
// 4. MONITOR FIREBASE
// ==========================================================

function aktifkanLiveMonitoring() {

    if (
        !sudahLogin ||
        !window.db ||
        !window.collection ||
        !window.onSnapshot
    ) {
        return;
    }


    const q =
        window.collection(
            window.db,
            "transaksi"
        );


    window.onSnapshot(

        q,

        (snapshot) => {

            let totalOmzetHariIni =
                0;

            let penampungBulanan =
                {};

            let penampungHarian =
                {};

            semuaDataTransaksi =
                [];


            const tgl =
                new Date();


            const hariIni =
                `${tgl.getFullYear()}-` +
                `${String(
                    tgl.getMonth() + 1
                ).padStart(2, "0")}-` +
                `${String(
                    tgl.getDate()
                ).padStart(2, "0")}`;


            snapshot.forEach(
                (doc) => {

                    const data =
                        doc.data();


                    if (
                        data.waktu &&
                        data.password ===
                        PIN_AKSES
                    ) {

                        const idDokumen =
                            doc.id;


                        const tglTransaksi =
                            data.waktu.toDate
                                ? data.waktu.toDate()
                                : new Date(
                                    data.waktu
                                );


                        const tahun =
                            tglTransaksi
                                .getFullYear();


                        const bulanNum =
                            tglTransaksi
                                .getMonth() + 1;


                        const hari =
                            String(
                                tglTransaksi
                                    .getDate()
                            ).padStart(
                                2,
                                "0"
                            );


                        const formatTglTransaksi =
                            `${tahun}-` +
                            `${String(
                                bulanNum
                            ).padStart(2, "0")}-` +
                            `${hari}`;


                        const formatBulanTahun =
                            `${tahun}-` +
                            `${String(
                                bulanNum
                            ).padStart(2, "0")}`;


                        semuaDataTransaksi.push({

                            id:
                                idDokumen,

                            bulanKey:
                                formatBulanTahun,

                            hariKey:
                                formatTglTransaksi,

                            waktu:
                                tglTransaksi,

                            totalBayar:
                                data.totalBayar,

                            items:
                                data.items

                        });


                        // Omzet hari ini
                        if (
                            formatTglTransaksi ===
                            hariIni
                        ) {

                            totalOmzetHariIni +=
                                data.totalBayar;

                        }


                        // Omzet bulanan
                        if (
                            !penampungBulanan[
                                formatBulanTahun
                            ]
                        ) {

                            penampungBulanan[
                                formatBulanTahun
                            ] = 0;

                        }


                        penampungBulanan[
                            formatBulanTahun
                        ] +=
                            data.totalBayar;


                        // Omzet harian
                        if (
                            !penampungHarian[
                                formatTglTransaksi
                            ]
                        ) {

                            penampungHarian[
                                formatTglTransaksi
                            ] = 0;

                        }


                        penampungHarian[
                            formatTglTransaksi
                        ] +=
                            data.totalBayar;

                    }

                }
            );


            const totalOmzetEl =
                document.getElementById(
                    "total-omzet"
                );


            if (totalOmzetEl) {

                totalOmzetEl.innerText =
                    formatRupiah(
                        totalOmzetHariIni
                    );

            }


            renderTabelLaporanBulanan(
                penampungBulanan
            );


            renderTabelLaporanHarian(
                penampungHarian
            );

        },


        (error) => {

            console.error(
                "Gagal monitoring real-time:",
                error
            );

        }

    );

}


// ==========================================================
// LAPORAN BULANAN
// ==========================================================

function renderTabelLaporanBulanan(
    dataBulanan
) {

    const tbody =
        document.getElementById(
            "body-laporan-bulanan"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const bulanUrut =
        Object.keys(
            dataBulanan
        )
        .sort()
        .reverse();


    if (
        bulanUrut.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="
                        text-align:center;
                        color:#718096;
                    "
                >
                    Belum ada data transaksi bulanan.
                </td>

            </tr>

        `;

        return;

    }


    bulanUrut.forEach(
        key => {

            const [
                tahun,
                bulanStr
            ] =
                key.split("-");


            const namaBulan =
                namaBulanIndo[
                    parseInt(
                        bulanStr
                    ) - 1
                ];


            const totalOmzetBulanan =
                dataBulanan[key];


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

                <td
                    class="text-right"
                    style="
                        font-weight:600;
                        color:#10b981;
                    "
                >
                    ${formatRupiah(
                        totalOmzetBulanan
                    )}
                </td>

                <td
                    style="
                        text-align:center;
                    "
                >

                    <button
                        class="btn-detail"
                        onclick="
                            bukaDetailRiwayat(
                                'bulan',
                                '${key}',
                                '${namaBulan} ${tahun}'
                            )
                        "
                    >
                        Lihat Riwayat
                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


// ==========================================================
// LAPORAN HARIAN
// ==========================================================

function renderTabelLaporanHarian(
    dataHarian
) {

    const tbody =
        document.getElementById(
            "body-laporan-harian"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const hariUrut =
        Object.keys(
            dataHarian
        )
        .sort()
        .reverse();


    if (
        hariUrut.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="
                        text-align:center;
                        color:#718096;
                    "
                >
                    Belum ada data transaksi harian.
                </td>

            </tr>

        `;

        return;

    }


    hariUrut.forEach(
        key => {

            const [
                tahun,
                bulanStr,
                hariStr
            ] =
                key.split("-");


            const namaBulan =
                namaBulanIndo[
                    parseInt(
                        bulanStr
                    ) - 1
                ];


            const labelTanggal =
                `${hariStr} ` +
                `${namaBulan} ` +
                `${tahun}`;


            const totalOmzetHarian =
                dataHarian[key];


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${labelTanggal}
                </td>

                <td
                    class="text-right"
                    style="
                        font-weight:600;
                        color:#3182ce;
                    "
                >
                    ${formatRupiah(
                        totalOmzetHarian
                    )}
                </td>

                <td
                    style="
                        text-align:center;
                    "
                >

                    <button
                        class="btn-detail"
                        onclick="
                            bukaDetailRiwayat(
                                'hari',
                                '${key}',
                                '${labelTanggal}'
                            )
                        "
                    >
                        Lihat Riwayat
                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


// ==========================================================
// DETAIL RIWAYAT
// ==========================================================

window.bukaDetailRiwayat =
    function(
        tipe,
        kunciPencarian,
        labelJudul
    ) {

        if (!sudahLogin) return;


        document.getElementById(
            "modal-detail-title"
        ).innerText =
            `Riwayat: ${labelJudul}`;


        const listRiwayat =
            document.getElementById(
                "list-riwayat-transaksi"
            );


        listRiwayat.innerHTML =
            "";


        const transaksiFilter =
            semuaDataTransaksi
                .filter(
                    t => {

                        return tipe === "bulan"
                            ? t.bulanKey ===
                                kunciPencarian
                            : t.hariKey ===
                                kunciPencarian;

                    }
                )
                .sort(
                    (a, b) =>
                        b.waktu - a.waktu
                );


        if (
            transaksiFilter.length === 0
        ) {

            listRiwayat.innerHTML =
                `
                    <li
                        style="
                            text-align:center;
                            color:#999;
                        "
                    >
                        Tidak ada transaksi.
                    </li>
                `;

        } else {

            transaksiFilter.forEach(
                t => {

                    const jam =
                        String(
                            t.waktu
                                .getHours()
                        ).padStart(
                            2,
                            "0"
                        )
                        +
                        ":"
                        +
                        String(
                            t.waktu
                                .getMinutes()
                        ).padStart(
                            2,
                            "0"
                        );


                    const tgl =
                        String(
                            t.waktu
                                .getDate()
                        ).padStart(
                            2,
                            "0"
                        );


                    const bulanSingkat =
                        namaBulanIndo[
                            t.waktu
                                .getMonth()
                        ].substring(
                            0,
                            3
                        );


                    const rincianItem =
                        t.items
                            .map(
                                i =>
                                    `${i.nama} (${i.jumlah}x)`
                            )
                            .join(", ");


                    const li =
                        document.createElement(
                            "li"
                        );


                    li.className =
                        "riwayat-item";


                    li.innerHTML = `

                        <div
                            style="
                                max-width:70%;
                                line-height:1.3;
                            "
                        >

                            <span
                                style="
                                    font-size:0.75rem;
                                    color:#a0aec0;
                                    font-weight:bold;
                                "
                            >
                                ${tgl}
                                ${bulanSingkat}
                                /
                                ${jam}
                            </span>

                            <br>

                            <span
                                style="
                                    color:#4a5568;
                                    font-size:0.8rem;
                                "
                            >
                                ${rincianItem}
                            </span>

                        </div>

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:8px;
                            "
                        >

                            <strong
                                style="
                                    color:#2d3748;
                                "
                            >
                                ${formatRupiah(
                                    t.totalBayar
                                )}
                            </strong>

                            <button
                                class="btn-hapus-cloud"
                                onclick="
                                    hapusTransaksiCloud(
                                        '${t.id}',
                                        ${t.totalBayar}
                                    )
                                "
                            >
                                Hapus
                            </button>

                        </div>

                    `;


                    listRiwayat.appendChild(
                        li
                    );

                }
            );

        }


        document.getElementById(
            "popup-detail"
        ).style.display =
            "flex";

    };


window.tutupModalDetail =
    function() {

        document.getElementById(
            "popup-detail"
        ).style.display =
            "none";

    };


// ==========================================================
// HAPUS TRANSAKSI
// ==========================================================

window.hapusTransaksiCloud =
    async function(
        idDokumen,
        nominal
    ) {

        if (!sudahLogin) return;


        const konfirmasiAwal =
            confirm(

                `Apakah Anda yakin ingin ` +
                `MENGHAPUS DATA transaksi sebesar ` +
                `${formatRupiah(nominal)} ini?`

            );


        if (!konfirmasiAwal) return;


        const pinInput =
            prompt(
                "Masukkan PIN Keamanan untuk menyetujui penghapusan data:"
            );


        if (
            pinInput !==
            PIN_AKSES
        ) {

            alert(
                "PIN SALAH! Anda tidak memiliki izin menghapus data cloud."
            );

            return;

        }


        try {

            if (
                !window.db ||
                !window.docRef ||
                !window.deleteDoc
            ) {

                throw new Error(
                    "Modul penghapusan Firebase belum siap."
                );

            }


            const dokumenRef =
                window.docRef(
                    window.db,
                    "transaksi",
                    idDokumen
                );


            await window.deleteDoc(
                dokumenRef
            );


            alert(
                "Transaksi BERHASIL dihapus dari Cloud database!"
            );


            tutupModalDetail();


        } catch (error) {

            console.error(
                "Gagal menghapus data dari Firebase:",
                error
            );


            alert(
                "Gagal menghapus! Periksa kembali koneksi internet Anda."
            );

        }

    };


// ==========================================================
// INISIALISASI POS
// ==========================================================

function inisialisasiPOS() {

    if (posSudahDiinisialisasi) {
        return;
    }


    posSudahDiinisialisasi =
        true;


    renderTombolMenu();

    aktifkanLiveMonitoring();

}


// ==========================================================
// START APPLICATION
// ==========================================================

pasangEventLogin();


// Jika sudah login dalam sesi browser,
// langsung tampilkan POS.
// Jika belum, tampilkan halaman login.
cekStatusLogin();


// Jika status sudah login ketika halaman dibuka,
// inisialisasi POS.
if (
    sessionStorage.getItem(
        "sateTaichanRIA_login"
    ) === "true"
) {

    inisialisasiPOS();

}
