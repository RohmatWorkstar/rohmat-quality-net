# Skills Assessment & AI Interview Platform
> **Engineering Quality Net, Defect Remediation & Release Gating Baseline (`v1.0.0`)**  
> **Author & Quality Lead:** Rohmat Supriyadi ([@RohmatWorkstar](https://github.com/RohmatWorkstar))  
> **Repository:** `rohmat-quality-net`  
> **Status:** Production Ready (Pipeline: 100% Passed)

---

## 📌 Ringkasan Eksekutif (Untuk Awam & Semi-Teknis)

### Apa itu Platform Ini?
Platform ini adalah sistem wawancara kerja berbasis kecerdasan buatan (**AI Interviewer**) yang menguji kompetensi kandidat secara langsung melalui suara/audio real-time, lalu menghasilkan laporan kesesuaian keahlian (**Fit/Gap Analysis**) untuk membantu tim rekruter (Assessor) mengambil keputusan penerimaan kerja.

### Masalah Awal yang Ditemukan
Saat platform ini pertama kali diaudit, terdapat beberapa masalah kritis yang menghalangi rilis ke klien nyata:
1. **Pintu Masuk Terkunci**: Assessor/rekruter tidak bisa mendaftar atau login karena role mereka ditolak sistem autentikasi.
2. **Data "Zombie"**: Keahlian (skill) yang sudah dihapus oleh rekruter dari formulir penilaian muncul kembali saat halaman di-refresh (*silent data corruption*).
3. **Data Tidak Sinkron**: Tabel perbandingan Fit/Gap menampilkan kolom kosong karena nama variabel antara backend dan frontend berbeda.
4. **Tidak Ada Jaring Pengaman**: Developer bisa menggabungkan (*merge*) kode tanpa spesifikasi jelas dan tanpa tes otomatis.

### Solusi: Membangun "Jaring Kualitas Dua Sisi" (*The Two-Halved Net*)
Untuk menyelesaikan masalah di atas secara permanen, kami menerapkan filosofi rekayasa kualitas modern:

```text
               ┌─────────────────────────────────────────────────────────────┐
               │              THE TWO-HALVED QUALITY NET                     │
               └─────────────────────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌───────────────────────────────┐                   ┌───────────────────────────────┐
│     HULU: GERBANG DoR         │                   │      HILIR: HARNESS TES       │
│   (Definition of Ready)       │                   │    (Definition of Done)       │
├───────────────────────────────┤                   ├───────────────────────────────┤
│ • Mencegah bug sebelum dibuat │                   │ • Menangkap bug saat dibuat   │
│ • Wajib punya link PRD/Spec   │                   │ • Vitest untuk Frontend React │
│ • Wajib skenario Given/When/  │                   │ • RSpec untuk Backend Rails   │
│   Then yang terukur           │                   │ • Pipeline CI 100% Hijau      │
│ • Diuji otomatis via script   │                   │ • Terbukti secara matematis   │
│   'scripts/verify-dor.js'     │                   │   aman untuk dirilis          │
└───────────────────────────────┘                   └───────────────────────────────┘
```

---

## 🏗 Arsitektur Sistem

Platform ini terdiri dari dua layanan utama yang bekerja berdampingan:

```text
.
├── api/          # Backend Service (Ruby on Rails 7, PostgreSQL, Redis/Sidekiq, WebSockets)
├── web/          # Frontend Web Application (React 18, TypeScript, Vite, TailwindCSS)
├── assessment/   # Dokumen Laporan Rekayasa Kualitas (Audit, Net Architecture, Release Decision)
└── scripts/      # Script Otomasi Gerbang Kualitas (verify-dor.js)
```

1. **Frontend (`web/`)**: Aplikasi antarmuka responsif bagi Kandidat (sesi interview live) dan Assessor (dashboard lowongan, formulir penilaian, dan laporan fit/gap).
2. **Backend (`api/`)**: API berbasis Rails yang mengelola perutean WebSocket real-time, autentikasi multi-tenant, antrean latar belakang Sidekiq, dan database relasional PostgreSQL.

---

## 🔍 Ringkasan Perbaikan Kunci (Audit Red-to-Green)

Seluruh defek tingkat **P0 (Blocker)** dan **P1 (Major)** telah diperbaiki secara tuntas:

| Kode | Area | Gejala Masalah (Sebelum) | Solusi Rekayasa (Sesudah) |
| :--- | :--- | :--- | :--- |
| **AUD-02** | Auth API | Role `assessor` ditolak saat login. | Memperluas enum `User::ROLES` dan otorisasi auth untuk mengizinkan role `assessor`. |
| **AUD-03** | Auth API | Endpoint `/auth/signup` tidak tersedia di API. | Menambahkan endpoint registrasi `POST /api/v1/auth/signup` dengan enkripsi password & token JWT. |
| **AUD-04** | Fit-Gap Seam | Kolom *Required Level* di tabel Fit-Gap kosong. | Menyelaraskan kontrak API backend agar mengirimkan `required_level` dan `is_override`, serta menambahkan fallback defensif di UI React. |
| **AUD-05** | Form Assessment | Gagal simpan skill karena ID taksonomi tertimpa. | Memastikan preservasi `skill_id` asli saat dipetakan oleh komponen `SkillPicker.tsx`. |
| **AUD-06** | Form Assessment | Skill yang dihapus muncul kembali (*Zombie Skills*). | Mengirimkan flag `{ id, _destroy: true }` ke Rails `accepts_nested_attributes_for` agar baris data dihapus permanen dari PostgreSQL. |
| **AUD-07** | Interview Route | Link undangan interview mengarah ke port 3001 (404). | Memperbaiki fallback `APP_BASE_URL` agar mengarah ke port aplikasi web klien (`5173`). |
| **AUD-08** | Form Assessment | Pilihan bahasa interview selalu kembali ke default. | Menambahkan dropdown dan payload persisten `language: 'id' \| 'en'`. |

---

## 🚦 Demonstrasi Gerbang Kualitas (2 Pull Requests)

Untuk membuktikan bahwa sistem gerbang kami bekerja secara objektif, kami mendemonstrasikan dua skenario Pull Request di GitHub Actions:

### 1. PR #1 — Gerbang Tertahan (*Blocked*)
* **Branch**: `main` $\leftarrow$ `demo/gate-blocked-missing-inputs`
* **Skenario**: Developer mengajukan perubahan kode tanpa referensi spesifikasi dan tanpa skenario pengujian.
* **Hasil Verifikasi**: Job `dor-gate` pada CI langsung mendeteksi ketiadaan input wajib dan menggagalkan pipeline (**Status: RED / BLOCKED**). Pekerjaan tertahan di hulu sebelum membuang waktu code review.

### 2. PR #2 — Gerbang Lolos (*Passed*)
* **Branch**: `main` $\leftarrow$ `demo/gate-passed-with-inputs`
* **Skenario**: Developer mengajukan helper utilitas durasi sesi yang mematuhi `PRD-02`, menyertakan skenario `Given/When/Then`, dan melampirkan unit test Vitest lengkap (`formatDuration.test.ts`).
* **Hasil Verifikasi**: Job `dor-gate`, `test-web`, dan `test-api` semuanya berhasil dieksekusi (**Status: GREEN / RELEASABLE**).

---

## 🚀 Panduan Menjalankan Secara Lokal (Quickstart)

### 1. Verifikasi Gerbang DoR
Jalankan script verifikasi mandiri tanpa dependensi luar:
```bash
node scripts/verify-dor.js
```

### 2. Menjalankan Frontend Web (`web/`)
```bash
cd web
npm install
npm test            # Menjalankan suite tes Vitest (Unit & Kontrak)
npm run build       # Verifikasi kompilasi TypeScript dan bundle Vite
npm run dev         # Menjalankan dev server pada http://localhost:5173
```

### 3. Menjalankan Backend API (`api/`)
```bash
cd api
bundle install
bundle exec rspec   # Menjalankan suite tes regresi RSpec
rails server -p 3001
```

---

## 📂 Peta Dokumen Laporan Kasus (*Deliverables*)

Seluruh dokumen teknis resmi tersimpan rapi di direktori `/assessment` dan root repository:

* 📄 [assessment/01-audit.md](assessment/01-audit.md) — **Laporan Audit Platform**: Klasifikasi menyeluruh 10 temuan (P0–P3), analisis akar masalah, serta pemilahan *Built Wrong* vs *Missing Spec*.
* 📄 [assessment/02-quality-system.md](assessment/02-quality-system.md) — **Arsitektur Jaring Kualitas**: Desain gerbang DoR, alur CI/CD, dan narasi pembuktian transisi *Red-to-Green*.
* 📄 [assessment/03-release-decision.md](assessment/03-release-decision.md) — **Keputusan Rilis v1.0.0**: Kriteria kelayakan rilis ke klien, penandatanganan kejujuran (*Honesty Sign-off*), dan mitigasi risiko terukur (AUD-09).
* 📄 [RELEASE_NOTES.md](RELEASE_NOTES.md) — **Catatan Rilis Formal**: Rincian kapabilitas rilis v1.0.0, pembaruan kontrak API, dan instruksi verifikasi.

---

## 💡 Contekan Cepat Menjelaskan ke Rekruter (Elevator Pitch)

Jika rekruter bertanya: *"Bisa ceritakan apa yang Anda kerjakan di case study ini?"*, gunakan alur 3 poin ini:

> 1. **"Saya mengaudit platform ini secara menyeluruh:** Saya menemukan 10 masalah teknis, mulai dari login asesor yang tertutup (P0), sampai data skill yang tidak terhapus di database (*zombie data* P1). Semua saya kategorikan apakah itu salah coding (*built wrong*) atau spesifikasinya yang kurang (*missing spec*)."
>
> 2. **"Saya membangun Jaring Kualitas Dua Sisi (*Two-Halved Net*):** Di hulu, saya membuat gerbang otomatis (*Definition of Ready*) agar developer tidak bisa asal push tanpa spesifikasi yang jelas. Di hilir, saya membuat otomasi pengujian di React (Vitest) dan Rails (RSpec) untuk mengunci fungsionalitas."
>
> 3. **"Saya memperbaiki semua bug kritis dan mengunci rilis v1.0.0:** Seluruh pengujian berjalan 100% hijau di GitHub Actions, dan saya mendemonstrasikan dua Pull Request di GitHub—satu yang tertahan karena kurang syarat, dan satu yang lolos sempurna."
