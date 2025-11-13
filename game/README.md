# 🍜 Mie Ayam Menghindari Topping

Game 2D browser sederhana dimana pemain mengontrol mangkuk mie ayam untuk menghindari berbagai topping yang jatuh dari atas layar. Pilih topping apa yang tidak disuka mie ayam, lalu hindari semuanya!

## 📋 Fitur Utama

- ✨ **Gameplay Interaktif**: Pilih topping yang ingin dihindari, lalu gerakkan mie ayam
- 🎯 **Sistem Pilihan Topping**: Memilih salah satu dari 3 topping yang berbeda:
  - 🌶️ Menghindari Sambal
  - 🥟 Menghindari Pangsit
  - 🌿 Menghindari Daun Bawang
- 🎨 **Sprite Unik per Pilihan**: Player sprite berubah sesuai topping yang dipilih
- 💥 **Game Over Scene Dinamis**: Tampilkan gambar mie dengan topping yang tertabrak
- 💾 **High Score**: Skor tertinggi disimpan menggunakan LocalStorage
- 🎨 **Grafis PNG Berkualitas**: Sprite dengan animasi rotasi smooth
- 📱 **Fully Responsive**: Sempurna di desktop, tablet, dan mobile
- 🎮 **Kontrol Fleksibel**: Tombol panah atau A/D keyboard

## 🚀 Cara Memainkan

### Langkah 1: Buka Game
Buka file `index.html` di browser kesayangan kamu

### Langkah 2: Pilih Topping
Di layar awal, kamu akan melihat 3 pilihan topping:
- **🌶️ Menghindari Sambal** - Mie ayam tidak suka sambal
- **🥟 Menghindari Pangsit** - Mie ayam tidak suka pangsit
- **🌿 Menghindari Daun Bawang** - Mie ayam tidak suka daun bawang

Klik salah satu untuk memilih

### Langkah 3: Bermain
Gunakan kontrol untuk menggerakkan mie ayam:
- **Panah Kiri (←)** atau **Tombol A** = Gerak ke kiri
- **Panah Kanan (→)** atau **Tombol D** = Gerak ke kanan

### Langkah 4: Hindari Topping
- Semua 3 jenis topping akan terus jatuh dari atas
- **Hanya hindari topping yang kamu pilih!**
- Topping lain bisa mengenai mie tanpa masalah (tidak akan dihiraukan)
- Jika tertabrak topping pilihan, GAME OVER!

### Langkah 5: Raih Skor Tinggi
- Semakin lama bertahan, semakin tinggi skor
- Skor disimpan dan di-update setiap detik
- High score otomatis tersimpan di browser

## 📁 Struktur Folder

```
game/
├── index.html              # File HTML utama
├── style.css              # CSS responsive (desktop & mobile)
├── script.js              # Logika game utama
├── README.md              # Dokumentasi ini
└── assets/
    ├── players/           # Sprite mie ayam per topping
    │   ├── player-avoid-sambal.png
    │   ├── player-avoid-pangsit.png
    │   └── player-avoid-daunbawang.png
    ├── toppings/          # Sprite topping yang jatuh
    │   ├── topping-sambal.png
    │   ├── topping-pangsit.png
    │   └── topping-daun-bawang.png
    └── game-over/         # Sprite mie saat game over
        ├── mie-kena-sambal.png
        ├── mie-kena-pangsit.png
        └── mie-kena-daunbawang.png
```

## 🛠️ Tech Stack

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (No frameworks!)
- **Graphics**: Canvas 2D API dengan hardware acceleration
- **Storage**: LocalStorage untuk high score persistence
- **Assets**: PNG images berkualitas tinggi
- **Responsive**: Mobile-first CSS dengan breakpoints untuk semua devices

## 🎮 Kontrol Game

| Input | Aksi |
|-------|------|
| ← / A | Gerak ke kiri |
| → / D | Gerak ke kanan |

## 📊 Sistem Penilaian

- **Skor**: Dihitung per 0.1 detik bertahan hidup
- **High Score**: Skor tertinggi otomatis disimpan di LocalStorage
- **Game Over**: Terpicu ketika tertabrak topping yang dipilih

## 🎨 Elemen Game

### Pemain (Mie Ayam)
- **Sprite**: 3 varian berbeda sesuai pilihan topping
- **Ukuran**: 50x50 pixel
- **Kecepatan**: 5 pixel per frame
- **Posisi Awal**: Center bawah layar

### Musuh (Topping yang Jatuh)

| Topping | Size | Speed | Deskripsi |
|---------|------|-------|-----------|
| Sambal 🌶️ | 40x40 | 3 px/frame | Paling cepat, paling kecil |
| Pangsit 🥟 | 50x50 | 2 px/frame | Paling lambat, paling besar |
| Daun Bawang 🌿 | 45x45 | 2.5 px/frame | Medium speed dan ukuran |

**Spawn Rate**: 1 topping baru setiap 0.5 detik
**Tipe Spawn**: Random antara 3 jenis, semua ikut jatuh

## 💾 Menyimpan & Reset High Score

### Melihat High Score
High score ditampilkan di layar utama dan game over

### Reset High Score
Buka DevTools browser (F12) dan jalankan:
```javascript
localStorage.removeItem('mieAyamHighScore');
```

Atau clear cache/cookies browser

## 📱 Responsive Design

Game telah dioptimalkan untuk semua ukuran device:

- **Desktop (1200px+)**: Full resolution 800x600px
- **Tablet (768px - 1024px)**: Scaled proportionally
- **Mobile (480px - 768px)**: Touch-friendly interface
- **Small Phone (<480px)**: Minimal UI, fullscreen-optimized

Semua elemen (buttons, score board, player, topping) otomatis menyesuaikan ukuran

## 🔧 Cara Mengembangkan

### Menambah Topping Baru

1. Siapkan 3 PNG file:
   - `player-avoid-[nama].png` (sprite mie)
   - `topping-[nama].png` (sprite topping)
   - `mie-kena-[nama].png` (game over scene)

2. Copy ke folder `assets/(players|toppings|game-over)/`

3. Update `TOPPING_TYPES` di `script.js`:
```javascript
const TOPPING_TYPES = {
    // ... topping lain ...
    namaTopping: {
        name: 'namaTopping',
        image: 'topping-nama.png',
        speed: 2.5,
        size: 45,
    }
};
```

4. Update HTML `index.html` di `.topping-selection`:
```html
<div class="topping-option" data-topping="namaTopping">
    <div class="topping-icon">🎯</div>
    <p>Menghindari [Nama Topping]</p>
</div>
```

5. Update image map di `showGameOverScreen()` function

### Mengubah Kesulitan

**Spawn Rate (lebih cepat/lambat):**
```javascript
// Di fungsi update(), ubah nilai ini (sekarang 30):
if (gameState.frameCount % 30 === 0) {
    spawnTopping();  // Kurangi angka = lebih cepat, naikkan = lebih lambat
}
```

**Kecepatan Topping:**
```javascript
const TOPPING_TYPES = {
    sambal: {
        speed: 3,  // Ubah nilai ini (naik = lebih cepat)
    }
}
```

**Ukuran Topping:**
```javascript
const TOPPING_TYPES = {
    sambal: {
        size: 40,  // Ubah nilai ini (naik = lebih besar)
    }
}
```

### Mengubah Ukuran Canvas

Di `index.html`:
```html
<canvas id="gameCanvas" width="1000" height="700"></canvas>
```

Canvas akan otomatis responsive, tapi untuk perubahan logika game update di `script.js` jika diperlukan.

### Menambah Sound Effects

Tambahkan di `script.js`:
```javascript
function playSound(soundName) {
    const audio = new Audio(`assets/sounds/${soundName}.mp3`);
    audio.play();
}

// Panggil di endGame():
playSound('game-over');
```

### Menambah Pause Feature

Tambahkan di `script.js`:
```javascript
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
}

// Di update() function:
function update() {
    if (gameState.isPaused) return;
    // ... rest of update
}
```

## 🐛 Debugging

### Melihat Console Logs
Buka DevTools (F12) dan lihat Console tab untuk melihat loaded assets

### Collision Debug
Uncomment di akhir `render()` untuk lihat bounding boxes:
```javascript
// Draw player hitbox
ctx.strokeStyle = 'red';
ctx.strokeRect(player.x, player.y, player.width, player.height);

// Draw topping hitboxes
ctx.strokeStyle = 'blue';
for (let topping of toppings) {
    ctx.strokeRect(topping.x, topping.y, topping.width, topping.height);
}
```

## 📝 Lisensi

Proyek ini dibuat untuk pembelajaran dan hiburan personal.

## 👨‍💻 Kredit

Dikembangkan dengan ❤️ menggunakan:
- HTML5 Canvas API
- Vanilla JavaScript (0 dependencies!)
- CSS3 Media Queries

---

## 🎮 Tips & Trik

1. **Sambal (Cepat)**: Paling sulit dihindari karena speed tinggi
2. **Daun Bawang (Medium)**: Difficulty medium, cocok untuk pemula
3. **Pangsit (Lambat)**: Paling mudah dihindari, cocok training
4. **Prediksi**: Lihat pattern jatuh dan antisipasi posisi
5. **Tepi Layar**: Gunakan edge sebagai helper untuk dodge cepat

---

**Selamat bermain! Jangan lupa hindari topping yang tidak disuka mie ayammu! 🍜✨**
