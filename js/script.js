// ===============================
// LOGIN HANDLER
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("loginForm");

    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Asumsi dataPengguna adalah variabel global yang berisi user
            const user = dataPengguna.find(
                (u) => u.email === email && u.password === password
            );

            if (user) {
                localStorage.setItem("userLogin", JSON.stringify(user));
                window.location.href = "dashboard.html";
            } else {
                alert("Email atau password salah!");
            }
        });
    }

    // Modal handler
    document.querySelectorAll(".close").forEach((btn) => {
        btn.onclick = () => {
            document.getElementById(btn.dataset.close).style.display = "none";
        };
    });

    const forgot = document.getElementById("forgotPasswordBtn");
    if (forgot)
        forgot.onclick = () =>
            (document.getElementById("forgotModal").style.display = "flex");

    const reg = document.getElementById("registerBtn");
    if (reg)
        reg.onclick = () =>
            (document.getElementById("registerModal").style.display = "flex");
            
    // Panggil inisialisasi halaman yang relevan saat DOMContentLoaded
    initCheckoutPage();
    initTrackingPage();
    initHistoryPage();
    initResultPage(); // Untuk halaman checkout.html (halaman hasil)
});

// ===============================
// DASHBOARD GREETING
// ===============================
function greetingMessage() {
    const greet = document.getElementById("greeting");
    if (!greet) return;

    const hour = new Date().getHours();
    let msg = "Selamat Malam";

    if (hour < 12) msg = "Selamat Pagi";
    else if (hour < 18) msg = "Selamat Siang";
    else msg = "Selamat Sore";

    const user = JSON.parse(localStorage.getItem("userLogin"));
    greet.innerText = `${msg}, ${user ? user.nama : "Pengunjung"}!`;
}
greetingMessage();

function logout() {
    localStorage.removeItem("userLogin");
    window.location.href = "login.html";
}

// ===============================
// STOK / KATALOG BUKU
// ===============================
const tabelBuku = document.querySelector("#tabelBuku tbody");

if (tabelBuku) {
    function loadBuku() {
        tabelBuku.innerHTML = "";
        // Asumsi dataKatalogBuku adalah variabel global yang berisi data buku
        dataKatalogBuku.forEach((b) => {
            const row = `
                <tr>
                    <td>${b.kodeBarang}</td>
                    <td>${b.namaBarang}</td>
                    <td>${b.jenisBarang}</td>
                    <td>${b.edisi}</td>
                    <td>${b.stok}</td>
                    <td>${b.harga}</td>
                </tr>`;
            tabelBuku.innerHTML += row;
        });
    }

    loadBuku();

    document.getElementById("tambahBukuBtn")?.addEventListener('click', () => {
        const kode = prompt("Kode Buku:");
        const nama = prompt("Nama Buku:");
        const jenis = prompt("Jenis Buku:");
        const edisi = prompt("Edisi:");
        const stok = prompt("Stok:");
        const harga = prompt("Harga:");

        if (kode && nama) {
            dataKatalogBuku.push({
                kodeBarang: kode,
                namaBarang: nama,
                jenisBarang: jenis,
                edisi,
                stok,
                harga,
            });
            loadBuku();
        }
    });
}

// ===============================
// CHECKOUT / PEMESANAN (FIXED) 🚀
// ===============================
function initCheckoutPage() {
    const bukuSelect = document.getElementById("bukuSelect");
    const gambarBuku = document.getElementById("gambarBuku");
    const formCheckout = document.getElementById("formCheckout");
    const tabelPesanan = document.querySelector("#tabelPesanan tbody");
    const totalTag = document.getElementById("totalBayar"); // Asumsi ID untuk menampilkan total
    
    if (!bukuSelect || !formCheckout) return;

    // Isi dropdown (tetap sama)
    dataKatalogBuku.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.namaBarang;
        opt.textContent = `${b.namaBarang} - ${b.harga}`;
        bukuSelect.appendChild(opt);
    });

    // Preview gambar buku (tetap sama)
    bukuSelect.addEventListener("change", () => {
        const bukuDipilih = dataKatalogBuku.find(
            (b) => b.namaBarang === bukuSelect.value
        );
        if (bukuDipilih && gambarBuku) {
            gambarBuku.src = bukuDipilih.cover || 'placeholder.jpg'; // tambahkan placeholder jika cover tidak ada
            gambarBuku.alt = bukuDipilih.namaBarang;
            gambarBuku.style.display = "block";
        } else if(gambarBuku) {
            gambarBuku.style.display = "none";
        }
    });

    let pesanan = [];

    // Fungsi untuk me-render tabel pesanan dan menghitung total
    function renderPesananTable() {
        if (!tabelPesanan) return;
        tabelPesanan.innerHTML = "";
        let totalKeseluruhan = 0;

        pesanan.forEach((p) => {
            totalKeseluruhan += p.total;
            tabelPesanan.innerHTML += `
                <tr>
                    <td>${p.buku}</td>
                    <td>${p.jumlah}</td>
                    <td>Rp ${p.harga.toLocaleString("id-ID")}</td>
                    <td>Rp ${p.total.toLocaleString("id-ID")}</td>
                </tr>`;
        });
        if (totalTag) {
            totalTag.innerText = totalKeseluruhan.toLocaleString("id-ID");
        }
    }

    // Tambah pesanan (Diperbaiki)
    document.getElementById("tambahPesananBtn")?.addEventListener('click', () => {
        const buku = bukuSelect.value;
        const jumlahInput = document.getElementById("jumlah");
        const jumlah = parseInt(jumlahInput.value);

        if (!buku || isNaN(jumlah) || jumlah <= 0) {
            alert("Pilih buku dan masukkan jumlah yang valid!");
            return;
        }

        const item = dataKatalogBuku.find((b) => b.namaBarang === buku);
        if (!item) return;

        // Ambil harga dan hapus semua karakter non-digit
        const harga = parseInt(item.harga.toString().replace(/[^\d]/g, ""));
        const total = harga * jumlah;

        // Cek jika buku sudah ada di keranjang
        const existingItem = pesanan.find(p => p.buku === buku);
        if (existingItem) {
            existingItem.jumlah += jumlah;
            existingItem.total += total;
        } else {
            pesanan.push({ buku, jumlah, harga, total });
        }
        
        renderPesananTable();
        jumlahInput.value = 1; // Reset jumlah input
    });

    // Proses Checkout (FIXED)
    formCheckout.addEventListener("submit", (e) => {
        e.preventDefault();

        if (pesanan.length === 0) {
            alert("Pesanan masih kosong!");
            return;
        }

        // Ambil data pemesan
        const nama = document.getElementById("namaPemesan")?.value || '';
        const email = document.getElementById("emailPemesan")?.value || '';
        const alamat = document.getElementById("alamatPemesan")?.value || '';
        const telepon = document.getElementById("teleponPemesan")?.value || '';
        const metode = document.getElementById("metodePembayaran")?.value || 'Transfer Bank';
        
        if (!nama || !email || !alamat || !telepon) {
            alert("Isi semua data pemesan!");
            return;
        }
        
        const totalAkhir = pesanan.reduce((a, b) => a + b.total, 0);
        // Generate nomor DO unik 7 digit
        const nomorDO = 2000000 + Math.floor(Math.random() * 7999999);
        const tanggalPemesanan = new Date().toLocaleDateString('id-ID');

        // --- 1. SIMPAN UNTUK HISTORY (Array: historyOrders) ---
        const newHistoryItem = {
            id: Date.now(), 
            nama: nama,
            judulBuku: pesanan.map((p) => `${p.buku} (${p.jumlah}x)`).join(", "),
            jumlah: pesanan.reduce((a, b) => a + b.jumlah, 0),
            total: totalAkhir.toLocaleString("id-ID"),
            tanggal: tanggalPemesanan,
            nomorDO: nomorDO, 
            metodePembayaran: metode
        };

        let historyOrders = JSON.parse(localStorage.getItem('historyOrders')) || [];
        historyOrders.push(newHistoryItem);
        localStorage.setItem('historyOrders', JSON.stringify(historyOrders));
        
        // --- 2. SIMPAN UNTUK TRACKING (Object/Map: dataTracking) ---
        const currentDataTracking = JSON.parse(localStorage.getItem("dataTracking")) || {};
        currentDataTracking[nomorDO] = {
            nomorDO: nomorDO,
            nama,
            alamat,
            telepon,
            email,
            buku: newHistoryItem.judulBuku,
            jumlah: newHistoryItem.jumlah,
            pembayaran: metode,
            total: newHistoryItem.total,
            status: "Menunggu Konfirmasi",
            ekspedisi: "JNE/TIKI/POS",
            tanggalKirim: "-",
            pengirim: "Admin BukuStore",
            perjalanan: [
                { waktu: new Date().toLocaleTimeString('id-ID'), keterangan: "Pesanan berhasil dibuat dan menunggu konfirmasi." }
            ],
        };
        localStorage.setItem("dataTracking", JSON.stringify(currentDataTracking));
        
        // --- 3. SIMPAN DATA HASIL (lastOrderData) & REDIRECT ---
        localStorage.setItem("lastOrderData", JSON.stringify({
            ...newHistoryItem,
            alamat, telepon, email,
        }));

        // PENTING: Redirect ke halaman hasil pesanan (asumsi Anda memiliki checkout.html sebagai halaman hasil)
        window.location.href = "checkout.html"; 
    });
}

// Fungsi untuk menampilkan hasil pesanan di checkout.html
function initResultPage() {
    const resultDiv = document.getElementById("orderResultDisplay"); // Ganti ID div hasil di checkout.html
    const lastOrderData = JSON.parse(localStorage.getItem("lastOrderData"));

    if (resultDiv && lastOrderData) {
        resultDiv.innerHTML = `
            <div class="tracking-result success-message">
                <h3>Hore, Pesanan Berhasil Dibuat!! Yuk Lacak Pesanan Anda Sekarang!!</h3>
                <p>Nama: ${lastOrderData.nama}</p>
                <p>Alamat: ${lastOrderData.alamat}</p>
                <p>Telepon: ${lastOrderData.telepon}</p>
                <p>Email: ${lastOrderData.email}</p>
                <p>Buku: ${lastOrderData.judulBuku}</p>
                <p>Jumlah: ${lastOrderData.jumlah}</p>
                <p>Metode Pembayaran: ${lastOrderData.metodePembayaran}</p>
                <p>Total: Rp ${lastOrderData.total}</p>
                <p><strong>Nomor DO: ${lastOrderData.nomorDO}</strong></p>
                <p>Gunakan nomor DO ini untuk melacak di halaman Tracking.</p>
                <button class="btn-primary" onclick="trackNow('${lastOrderData.nomorDO}')">
                    Lacak Pesanan Anda Yuk!!
                </button>
            </div>
        `;
        // Hapus data sementara setelah ditampilkan
        localStorage.removeItem("lastOrderData"); 
    }
}

// Fungsi untuk langsung ke tracking
function trackNow(nomorDO) {
    localStorage.setItem("trackNow", nomorDO);
    window.location.href = "tracking.html";
}


// ===============================
// TRACKING PAGE (FIXED) 🔍
// ===============================
function initTrackingPage() {
    const form = document.getElementById("trackingForm");
    const result = document.getElementById("trackingResult");
    const noDOInput = document.getElementById("noDO"); // Asumsi ID input Nomor DO

    // Otomatis isi jika dari halaman Checkout
    const presetDO = localStorage.getItem("trackNow");
    if (presetDO && noDOInput) {
        noDOInput.value = presetDO;
        localStorage.removeItem("trackNow");
        // Jika ada preset, jalankan pencarian otomatis
        // Asumsi form tracking memiliki tombol submit atau fungsi searchTracking
        if (form) {
            form.dispatchEvent(new Event('submit')); 
        }
    }

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const noDO = noDOInput?.value.trim();
        if (!noDO) return;
        
        result.innerHTML = ''; // Bersihkan hasil

        const currentDataTracking =
            JSON.parse(localStorage.getItem("dataTracking")) || {};
            
        // Mencari data berdasarkan Nomor DO sebagai kunci (key) objek
        const data = currentDataTracking[noDO]; 

        if (!data) {
            // Tampilkan pesan error dengan style CSS yang sudah diperbaiki
            result.innerHTML = `<div class="tracking-result error-message">❌ Nomor DO **${noDO}** tidak ditemukan.</div>`;
            return;
        }

        let perjalananHTML = "";
        data.perjalanan.forEach((p) => {
            perjalananHTML += `<li><strong>${p.waktu}</strong> — ${p.keterangan}</li>`;
        });
        
        // Cek status untuk progress bar (Opsional)
        let progress = 0;
        if (data.status === "Pesanan Dibuat") progress = 25;
        else if (data.status === "Siap Dikirim") progress = 50;
        else if (data.status === "Dalam Perjalanan") progress = 75;
        else if (data.status === "Telah Diterima") progress = 100;

        // Tampilkan hasil tracking
        result.innerHTML = `
            <div class="tracking-result">
                <h4>Nomor DO: ${data.nomorDO}</h4>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <p>Status: <b>${data.status}</b></p>
                <p>Nama: ${data.nama}</p>
                <p>Total: Rp ${data.total}</p>
                <h4>Riwayat Pengiriman:</h4>
                <ul>${perjalananHTML || '<li>Belum ada pembaruan perjalanan.</li>'}</ul>
            </div>
        `;
    });
}


// ===============================
// HISTORY TRANSAKSI (FIXED) 📜
// ===============================
function initHistoryPage() {
    const historyBody = document.querySelector("#historyTableBody"); // Asumsi ID tbody di history.html
    
    if (!historyBody) return;
    
    // Ambil data dari Local Storage
    const history = JSON.parse(localStorage.getItem('historyOrders')) || [];
    
    historyBody.innerHTML = ''; // Bersihkan
    
    if (history.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    let rowHtml = '';
    history.forEach((order, index) => {
        rowHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${order.nama || 'N/A'}</td>
                <td>${order.judulBuku || 'N/A'}</td>
                <td>${order.jumlah || 'N/A'}</td>
                <td>Rp ${order.total || 'N/A'}</td>
                <td>${order.tanggal || 'N/A'}</td>
            </tr>
        `;
    });

    historyBody.innerHTML = rowHtml;
}

// ==========================
// Tambahkan tracking di bawah ini (Dihapus karena sudah diperbaiki di initTrackingPage)
// ==========================
// Semua kode di bagian ini telah digantikan/diintegrasikan ke dalam fungsi initTrackingPage