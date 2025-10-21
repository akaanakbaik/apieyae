# 🌐 Api’s AI by aka

**Selamat datang di Api’s AI**, sebuah antarmuka web modern yang dirancang untuk menyediakan interaksi **cepat, andal, dan intuitif** dengan layanan **AI generatif**.  
Proyek ini menonjol lewat **sistem AI ganda (hybrid)** yang cerdas dan **antarmuka pengguna premium** berbasis glassmorphism.

Tujuan utamanya adalah menghadirkan platform **stabil, cepat, dan ramah developer**, lengkap dengan dokumentasi interaktif untuk integrasi ke berbagai proyek lain.

---

## ✨ Fitur Unggulan

### 🧠 1. Sistem AI Hibrida dengan Fallback Otomatis
- **API Utama:** Menggunakan WebSocket ke *Microsoft Copilot* untuk respons cepat dan real-time.  
- **API Cadangan:** Jika API utama gagal (timeout, error, atau rate limit), sistem **otomatis beralih** ke *GPT-4o Mini*.  
- Pengguna tetap mendapat respons tanpa gangguan — menciptakan **uptime dan keandalan tinggi**.

---

### 💎 2. Antarmuka Pengguna Modern & Responsif
- Desain **mobile-first** menggunakan **Tailwind CSS**.  
- Efek **glassmorphism** menghadirkan tampilan elegan dan modern.  
- Semua elemen (input, tombol, kartu hasil) dibuat **ramah layar kecil** dan mudah digunakan.

---

### 📘 3. Dokumentasi API Interaktif
- Halaman khusus: `/doc.html` untuk developer.  
- Contoh kode (cURL, Bot WA) **otomatis menyesuaikan domain aktif**, sehingga bisa langsung **copy-paste** tanpa konfigurasi manual.

---

### 🔔 4. Sistem Notifikasi Canggih
- Pop-up cepat yang hilang dalam **1,5 detik**.  
- Dapat dihapus dengan **gesture swipe** (kiri, kanan, atas).  
- Ringan, tidak mengganggu, dan cocok untuk perangkat sentuh.

---

### 🚀 5. Deployment Optimal
- Dikonfigurasi **khusus untuk Vercel** dengan backend *serverless functions*.  
- **Caching agresif** di frontend untuk performa maksimal dan latency rendah.

---

## 📂 Struktur Proyek

```
.
├── api/
│   ├── index.js     # [Backend] Endpoint utama API
│   └── ai.js        # [Backend] Logika inti AI (utama & fallback)
│
├── public/
│   ├── index.html   # [Frontend] Halaman utama
│   ├── doc.html     # [Frontend] Dokumentasi API
│   ├── css/
│   │   ├── index.css  # [Styling] Tampilan utama
│   │   └── doc.css    # [Styling] Tampilan dokumentasi
│   └── js/
│       ├── main.js    # [Logic] Interaksi halaman utama
│       ├── doc.js     # [Logic] Fungsi halaman dokumentasi
│       └── notif.js   # [Logic] Sistem notifikasi
│
├── package.json     # [Konfigurasi] Dependensi & script
├── vercel.json      # [Konfigurasi] Aturan deployment
└── README.md        # [Dokumentasi] Penjelasan proyek
```

---

## ⚙️ Penjelasan Direktori & File

### **📡 api/**
#### `api/index.js`
- Menjalankan **server Express.js**.  
- Endpoint utama: `POST /api/chat`.  
- Menerima query dari frontend, memvalidasi, lalu memanggil logika AI di `api/ai.js`.  
- Menggunakan blok `try...catch` untuk **mengaktifkan fallback otomatis** jika API utama gagal.  

#### `api/ai.js`
- Berisi dua fungsi utama:
  - **PrimaryAI:** Kelas pengelola koneksi WebSocket ke *Microsoft Copilot*.  
  - **fallbackAIChat:** Fungsi HTTP ke layanan AI cadangan (*GPT-4o Mini*).  

---

### **🎨 public/**
#### `index.html` & `doc.html`
- Struktur dasar HTML untuk halaman utama & dokumentasi.  

#### `css/index.css` & `css/doc.css`
- Aturan gaya tambahan di luar Tailwind untuk nuansa khas tiap halaman.  

#### `js/main.js`
- Mengatur event tombol (**Exec, Clear, Doc**).  
- Mengirim permintaan `POST /api/chat`.  
- Menampilkan hasil respons & notifikasi.

#### `js/doc.js`
- Mengisi contoh kode dengan URL dinamis.  
- Menyediakan fitur **Salin ke Clipboard**.

#### `js/notif.js`
- Modul mandiri untuk membuat dan mengatur notifikasi.  
- Lengkap dengan animasi dan logika swipe.

---

## 🔄 Alur Kerja Permintaan

1. **Pengguna:** Mengisi query di halaman utama dan menekan tombol **Exec**.  
2. **Frontend (`js/main.js`):**  
   - Mengambil input, menampilkan status loading.  
   - Mengirim request `POST /api/chat` berisi JSON `{ "query": "..." }`.  
3. **Backend (`api/index.js`):**  
   - Mencoba API utama (`PrimaryAI`).  
   - Jika berhasil → kirim hasil JSON dengan status `200 OK`.  
   - Jika gagal → otomatis jalankan `fallbackAIChat()` dan kirim hasilnya.  
4. **Frontend:**  
   - Menampilkan hasil, metadata, dan notifikasi sukses/error.

---

## 💻 Menjalankan Secara Lokal

### 1️⃣ Clone repositori
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2️⃣ Install dependensi
```bash
npm install
```

### 3️⃣ Install Vercel CLI (jika belum)
```bash
npm install -g vercel
```

### 4️⃣ Jalankan server development
```bash
vercel dev
```

---

💖 **Made with love and code by aka**
