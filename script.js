document.addEventListener('DOMContentLoaded', function() {
    // Data login guru (bisa diganti dengan sistem login yang lebih aman)
    const validUsers = [
        { username: "guru1", password: "pass123" },
        { username: "admin", password: "admin123" }
    ];

    // Inisialisasi data absensi dari localStorage atau array kosong
    let absensiData = JSON.parse(localStorage.getItem('absensiData')) || [];
    
    // Elemen form
    const loginForm = document.getElementById('formLogin');
    const absensiContent = document.getElementById('absensiContent');
    const loginFormContainer = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const formAbsensi = document.getElementById('formAbsensi');
    const tabelAbsensi = document.getElementById('tabelAbsensi').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAbsensiContent();
    }

    // Fungsi untuk menampilkan konten absensi
    function showAbsensiContent() {
        loginFormContainer.style.display = 'none';
        absensiContent.style.display = 'block';
        renderAbsensiTable();
    }

    // Fungsi logout
    function logout() {
        localStorage.removeItem('isLoggedIn');
        loginFormContainer.style.display = 'block';
        absensiContent.style.display = 'none';
        loginForm.reset();
    }

    // Fungsi untuk menampilkan data absensi ke tabel
    function renderAbsensiTable(data = absensiData) {
        tabelAbsensi.innerHTML = '';
        
        if (data.length === 0) {
            const row = tabelAbsensi.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 7;
            cell.textContent = 'Tidak ada data absensi';
            cell.style.textAlign = 'center';
            return;
        }
        
        data.forEach((item, index) => {
            const row = tabelAbsensi.insertRow();
            
            // Tambahkan class sesuai status untuk styling
            let statusClass = '';
            switch(item.kehadiran) {
                case 'hadir': statusClass = 'status-hadir'; break;
                case 'izin': statusClass = 'status-izin'; break;
                case 'sakit': statusClass = 'status-sakit'; break;
                case 'alpa': statusClass = 'status-alpa'; break;
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nis}</td>
                <td>${item.nama}</td>
                <td>${item.kelas}</td>
                <td>${item.jurusan}</td>
                <td class="${statusClass}">${item.kehadiran.charAt(0).toUpperCase() + item.kehadiran.slice(1)}</td>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
            `;
        });
    }
    
    // Fungsi untuk validasi form absensi
    function validateAbsensiForm(formData) {
        const errors = [];
        
        // Validasi NIS (hanya angka, 6-10 digit)
        if (!/^\d{6,10}$/.test(formData.nis)) {
            errors.push('NIS harus berupa angka (6-10 digit)');
        }
        
        // Validasi Nama (minimal 3 karakter, hanya huruf dan spasi)
        if (!/^[a-zA-Z\s]{3,}$/.test(formData.nama)) {
            errors.push('Nama harus minimal 3 karakter dan hanya mengandung huruf');
        }
        
        // Validasi Kelas
        if (!['X', 'XI', 'XII'].includes(formData.kelas)) {
            errors.push('Kelas harus dipilih');
        }
        
        // Validasi Jurusan
        const validJurusan = ['TKJ', 'MM', 'RPL', 'TKRO', 'TBSM'];
        if (!validJurusan.includes(formData.jurusan)) {
            errors.push('Jurusan harus dipilih');
        }
        
        // Validasi Kehadiran
        if (!['hadir', 'izin', 'sakit', 'alpa'].includes(formData.kehadiran)) {
            errors.push('Status kehadiran harus dipilih');
        }
        
        // Validasi Keterangan jika izin/sakit
        if ((formData.kehadiran === 'izin' || formData.kehadiran === 'sakit') && formData.keterangan.trim() === '') {
            errors.push('Keterangan wajib diisi jika status izin/sakit');
        }
        
        return errors;
    }
    
    // Fungsi untuk menambahkan data absensi baru
    function addAbsensiData(formData) {
        const newAbsensi = {
            nis: formData.nis,
            nama: formData.nama,
            kelas: formData.kelas,
            jurusan: formData.jurusan,
            kehadiran: formData.kehadiran,
            keterangan: formData.keterangan || '',
            timestamp: new Date().getTime()
        };
        
        absensiData.unshift(newAbsensi); // Tambahkan di awal array
        localStorage.setItem('absensiData', JSON.stringify(absensiData));
    }
    
    // Fungsi untuk mencari data absensi
    function searchAbsensi(keyword) {
        if (!keyword.trim()) {
            return absensiData;
        }
        
        const lowerKeyword = keyword.toLowerCase();
        return absensiData.filter(item => 
            item.nis.toLowerCase().includes(lowerKeyword) || 
            item.nama.toLowerCase().includes(lowerKeyword)
        );
    }
    
    // Event listener untuk form login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = this.username.value.trim();
        const password = this.password.value.trim();
        
        // Validasi login
        const user = validUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            showAbsensiContent();
        } else {
            alert('Username atau password salah!');
        }
    });
    
    // Event listener untuk logout
    logoutBtn.addEventListener('click', logout);
    
    // Event listener untuk form submission absensi
    formAbsensi.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nis: this.nis.value.trim(),
            nama: this.nama.value.trim(),
            kelas: this.kelas.value,
            jurusan: this.jurusan.value,
            kehadiran: this.kehadiran.value,
            keterangan: this.keterangan.value.trim()
        };
        
        // Validasi form
        const errors = validateAbsensiForm(formData);
        
        if (errors.length > 0) {
            alert('Error:\n' + errors.join('\n'));
            return;
        }
        
        // Tambahkan data baru
        addAbsensiData(formData);
        
        // Reset form
        this.reset();
        
        // Tampilkan data terbaru
        renderAbsensiTable();
        
        // Beri feedback
        alert('Absensi berhasil dicatat!');
    });
    
    // Event listener untuk pencarian
    searchBtn.addEventListener('click', function() {
        const results = searchAbsensi(searchInput.value);
        renderAbsensiTable(results);
    });
    
    // Event listener untuk pencarian saat tekan Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const results = searchAbsensi(searchInput.value);
            renderAbsensiTable(results);
        }
        // JavaScript untuk filter
document.getElementById('filterDate').addEventListener('change', function() {
    const selectedDate = new Date(this.value);
    if(isNaN(selectedDate.getTime())) {
        renderAbsensiTable(absensiData);
        return;
    }
    
    const filtered = absensiData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === selectedDate.toDateString();
    });
    
    renderAbsensiTable(filtered);
});

document.getElementById('resetFilter').addEventListener('click', function() {
    document.getElementById('filterDate').value = '';
    renderAbsensiTable(absensiData);
});
    });
});