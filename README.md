# Project UAS Mata Kuliah Visualisasi Data Kelas A Kelompok 1 T.A Genap 2025/2026

# Hotel Booking Demand Dashboard

Dashboard visualisasi data interaktif berbasis web untuk menganalisis pola pemesanan hotel menggunakan dataset Hotel Booking Demand. Proyek ini dikembangkan sebagai tugas Mata Kuliah Visualisasi Data Program Studi Informatika Universitas Syiah Kuala.

**Anggota Kelompok**:

1. 2408107010036 - Mahda Annisa
2. 2408107010037 - Raisa Nabila
3. 2408107010096 - Muhammad Shidqi Hanif
4. 2408107010101 - Muhammad Razi Siregar
5. 2408107010104 - Muhammad Sulthan Shadiq
6. 2408107010114 - Ahmad Hanif

## 🎯 Tujuan Proyek

Proyek ini bertujuan untuk:

- Melakukan Exploratory Data Analysis (EDA) pada dataset Hotel Booking Demand.
- Melakukan preprocessing data untuk meningkatkan kualitas data.
- Mengembangkan dashboard visualisasi interaktif berbasis web.
- Menampilkan insight bisnis yang dapat membantu pengambilan keputusan pada industri perhotelan.

## 📊 Dataset

Dataset yang digunakan adalah **Hotel Booking Demand Dataset** yang tersedia di Kaggle.

**Sumber Dataset:**

https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand

### Karakteristik Dataset

- 119.390 data pemesanan hotel
- 32 atribut
- Periode Juli 2015 – Juli 2017
- Data City Hotel dan Resort Hotel
- Berasal dari Portugal

## 🔍 Tahapan Analisis

### 1. Exploratory Data Analysis (EDA)

Tahapan analisis meliputi:

- Pemeriksaan struktur dataset
- Analisis statistik deskriptif
- Deteksi missing values
- Identifikasi data duplikat
- Analisis outlier
- Analisis tingkat pembatalan reservasi
- Analisis negara asal tamu
- Analisis market segment

### 2. Data Preprocessing

Langkah preprocessing yang dilakukan:

- Menghapus kolom yang tidak relevan
- Menghapus data duplikat
- Menangani missing values
- Menangani inconsistent values
- Menghapus outlier menggunakan metode IQR
- Feature engineering
- Encoding variabel kategorikal
- Normalisasi fitur numerik

## 📈 Visualisasi Dashboard

Dashboard menyediakan beberapa komponen utama:

### KPI Dashboard

- Total Bookings
- Cancellation Rate
- Average ADR
- Average Lead Time

### Booking & Cancellation Trend

Visualisasi tren pemesanan dan pembatalan hotel berdasarkan bulan.

### Top Guest Countries

Menampilkan 10 negara dengan jumlah tamu terbanyak.

### Market Segment Analysis

Perbandingan reservasi yang dibatalkan dan tidak dibatalkan berdasarkan segmen pasar.

### ADR vs Lead Time

Scatter plot untuk melihat hubungan antara:

- Average Daily Rate (ADR)
- Lead Time

### Dashboard Insights

Ringkasan otomatis berdasarkan data yang sedang ditampilkan.

## 🛠️ Teknologi yang Digunakan

### Backend

- Python 3.x
- Pandas
- NumPy
- Scikit-Learn
- Jupyter Notebook

### Frontend

- HTML5
- CSS3
- JavaScript
- D3.js v7

## 📌 Hasil Utama

Beberapa insight yang diperoleh dari analisis:

- Tingkat pembatalan reservasi mencapai sekitar 37%.
- Pemesanan tertinggi terjadi pada bulan Juli–Agustus.
- Portugal merupakan negara asal tamu terbanyak.
- Segmen Online TA memiliki jumlah reservasi dan pembatalan tertinggi.
- Tidak ditemukan korelasi linear yang kuat antara ADR dan Lead Time.

## 📚 Referensi

- Antonio, N., Almeida, A., & Nunes, L. (2019). Hotel Booking Demand Datasets.
- D3.js Documentation
- Kaggle Hotel Booking Demand Dataset
- Scott Murray. Interactive Data Visualization for the Web.
- Stephen Few. Information Dashboard Design.

