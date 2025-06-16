// === Profil Matching & Data ===
const pesertaList = [];
const pembobotanList = [];
const gapList = [];
const gapDetailList = [];
const nilaiHuruf = { "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D": 1.5, "E": 1.0 };
const bobotGap = g => {
  if (g >= 0) return 5;
  const gapMap = {
    "-1": 4,
    "-2": 3,
    "-3": 2,
    "-4": 1
  };
  return gapMap[g] ?? 1;
};
const bobotIPK = ipk => ipk >= 3.76 ? 5 : ipk >= 3.51 ? 4 : ipk >= 3.01 ? 3 : ipk >= 2.76 ? 2 : 1;
const bobotKompetensi = v => v >= 81 ? 5 : v >= 71 ? 4 : v >= 61 ? 3 : v >= 51 ? 2 : 1;

function hitungProfileMatching(p) {
  const ipk_b = bobotIPK(p.ipk);
  const algo = nilaiHuruf[p.algo] ?? 0;
  const jar = nilaiHuruf[p.jar] ?? 0;
  const rataKuliah = (algo + jar) / 2;
  const nilaiKuliah = bobotIPK(rataKuliah);
  const sertifikat = p.sertifikat === "Ada" ? 3 : 1;
  const rataKomp = (p.prog + p.jarkom) / 2;
  const kompetensi = bobotKompetensi(rataKomp);
  const suara = parseInt(p.suara);
  const penguasaan = parseInt(p.penguasaan);
  const penyampaian = parseInt(p.penyampaian);
  const sikap = parseInt(p.sikap);
  const interaksi = parseInt(p.interaksi);
  const komitmen = parseInt(p.komitmen);
  const konsistensi = parseInt(p.konsistensi);
  const karakter = parseInt(p.karakter);

  const hitungGAP = (nilai, preferensi) => {
    const selisih = nilai - preferensi;
    return { gap: selisih, bobot: bobotGap(selisih) };
  };

  const g1 = hitungGAP(ipk_b, 5);
  const g2 = hitungGAP(nilaiKuliah, 4);
  const g3 = hitungGAP(sertifikat, 3);
  const g4 = hitungGAP(kompetensi, 4);
  const g5 = hitungGAP(suara, 4);
  const g6 = hitungGAP(sikap, 4);
  const g7 = hitungGAP(interaksi, 5);
  const g8 = hitungGAP(penguasaan, 3);
  const g9 = hitungGAP(penyampaian, 3);
  const g10 = hitungGAP(komitmen, 5);
  const g11 = hitungGAP(konsistensi, 5);
  const g12 = hitungGAP(karakter, 3);

  const cf1 = (g1.bobot + g2.bobot) / 2;
  const sf1 = g3.bobot;
  const N1 = ((cf1 + sf1) / 2).toFixed(2);

  const cf2 = g4.bobot;
  const sf2 = g4.bobot;
  const N2 = ((cf2 + sf2) / 2).toFixed(2);

  const cf3 = (g5.bobot + g6.bobot + g7.bobot) / 3;
  const sf3 = (g8.bobot + g9.bobot) / 2;
  const N3 = ((cf3 + sf3) / 2).toFixed(2);

  const cf4 = (g10.bobot + g11.bobot) / 2;
  const sf4 = g12.bobot;
  const N4 = ((cf4 + sf4) / 2).toFixed(2);

  const total = ((+N1 + +N2 + +N3 + +N4) / 4).toFixed(2);

  pembobotanList.push({ 
  nama: p.nama, ipk_b, algo, jar, nilaiKuliah, sertifikat, 
  kompetensi, suara, sikap, interaksi, penguasaan, penyampaian, 
  komitmen, konsistensi, karakter 
});
  gapList.push({ nama: p.nama, N1: +N1, N2: +N2, N3: +N3, N4: +N4 });
  gapDetailList.push({
    nama: p.nama,
    gap: [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12]
  });

  return { nama: p.nama, N1: +N1, N2: +N2, N3: +N3, N4: +N4, total: +total };
}

function ambilDataPerNama(nama) {
  function ambilDariTabel(id, keys) {
    const trs = document.getElementById(id).querySelectorAll("tbody tr");
    for (const tr of trs) {
      const tds = tr.querySelectorAll("td");
      if (tds[0].innerText === nama) {
        const values = Array.from(tds).slice(1).map(td => {
          const select = td.querySelector("select");
          if (select) {
            return select.value || td.innerText.trim();
          }
          return td.innerText.trim();
        });
        const obj = {};
        keys.forEach((k, i) => {
          const val = values[i];
          obj[k] = (!isNaN(val) && val !== "") ? parseFloat(val) : val;
        });
        return obj;
      }
    }
    return {};
  }
  return {
    nama,
    ...ambilDariTabel("adminTable", ["ipk", "algo", "jar", "sertifikat"]),
    ...ambilDariTabel("kompTable", ["prog", "jarkom"]),
    ...ambilDariTabel("microTable", ["suara", "sikap", "interaksi", "penguasaan", "penyampaian"]),
    ...ambilDariTabel("wawanTable", ["komitmen", "konsistensi", "karakter"])
  };
}

function prosesSemua() {
  // Bersihkan semua list agar tidak dobel saat dihitung ulang
  pesertaList.length = 0;
  pembobotanList.length = 0;
  gapList.length = 0;
  gapDetailList.length = 0;

  document.querySelectorAll("#adminTable tbody tr").forEach(tr => {
    const nama = tr.querySelector("td").innerText.trim();
    const data = ambilDataPerNama(nama);
    pesertaList.push(hitungProfileMatching(data));
  });

  tampilkanHasil();
  showSection('hasilSection');
}

function tampilkanHasil() {
  const sorted = pesertaList.slice().sort((a, b) => b.total - a.total);
  let html = `<table class="table table-bordered table-hover"><thead class="table-light"><tr><th>Nama</th><th>N1</th><th>N2</th><th>N3</th><th>N4</th><th>Total</th><th>Ranking</th></tr></thead><tbody>`;
  sorted.forEach((p, i) => {
    html += `<tr><td>${p.nama}</td><td>${p.N1.toFixed(2)}</td><td>${p.N2.toFixed(2)}</td><td>${p.N3.toFixed(2)}</td><td>${p.N4.toFixed(2)}</td><td>${p.total.toFixed(2)}</td><td>${i + 1}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById("hasil").innerHTML = html;
}

function tampilkanGAP() {
  const container = document.getElementById("gapTableContainer");
  container.innerHTML = ""; // Kosongkan dulu

  const aspekList = [
    {
      nama: "Administrasi",
      kolom: ["IPK", "Nilai Kuliah", "Sertifikat"],
      ambil: p => [p.ipk_b, p.nilaiKuliah, p.sertifikat]
    },
    {
      nama: "Kompetensi",
      kolom: ["Kompetensi"],
      ambil: p => [p.kompetensi]
    },
    {
      nama: "Microteaching",
      kolom: ["Suara", "Sikap", "Interaksi", "Penguasaan", "Penyampaian"],
      ambil: p => [p.suara, p.sikap, p.interaksi, p.penguasaan, p.penyampaian]
    },
    {
      nama: "Wawancara",
      kolom: ["Komitmen", "Konsistensi", "Karakter"],
      ambil: p => [p.komitmen, p.konsistensi, p.karakter]
    }
  ];

  aspekList.forEach(aspek => {
    let html = `<div class="mb-4"><h4 class="text-success">${aspek.nama}</h4>`;
    html += `<div class="table-responsive"><table class="table table-bordered table-hover"><thead class="table-light"><tr><th>Nama</th>`;

    aspek.kolom.forEach(k => html += `<th>${k}</th>`);
    html += `</tr></thead><tbody>`;

    pembobotanList.forEach(p => {
      html += `<tr><td>${p.nama}</td>`;
      aspek.ambil(p).forEach(nilai => html += `<td>${nilai}</td>`);
      html += `</tr>`;
    });

    html += `</tbody></table></div></div>`;
    container.innerHTML += html;
  });
}

function tampilkanPembobotanNilai() {
  ['bobotAdminTable', 'bobotKompTable', 'bobotMicroTable', 'bobotWawanTable'].forEach(id => {
    document.querySelector(`#${id} tbody`).innerHTML = '';
  });

  pembobotanList.forEach(p => {
    const adminRow = `<tr><td>${p.nama}</td><td>${p.ipk_b}</td><td>${p.algo}</td><td>${p.jar}</td><td>${p.sertifikat}</td></tr>`;
    document.querySelector('#bobotAdminTable tbody').innerHTML += adminRow;

    const kompRow = `<tr><td>${p.nama}</td><td>${p.kompetensi}</td><td>-</td></tr>`;
    document.querySelector('#bobotKompTable tbody').innerHTML += kompRow;

    const microRow = `<tr><td>${p.nama}</td><td>${p.suara}</td><td>${p.sikap}</td><td>${p.interaksi}</td><td>${p.penguasaan}</td><td>${p.penyampaian}</td></tr>`;
    document.querySelector('#bobotMicroTable tbody').innerHTML += microRow;

    const wawanRow = `<tr><td>${p.nama}</td><td>${p.komitmen}</td><td>${p.konsistensi}</td><td>${p.karakter}</td></tr>`;
    document.querySelector('#bobotWawanTable tbody').innerHTML += wawanRow;
  });
}

function showSection(sectionId, linkElement) {
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('hasilSection').style.display = 'none';
  document.getElementById('gapSection').style.display = 'none';
  document.getElementById('bobotSection').style.display = 'none';

  document.getElementById(sectionId).style.display = 'block';

  // Aktifkan navlink
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (linkElement) linkElement.classList.add('active');

  // Tampilkan tabel GAP hanya jika halaman GAP yang dibuka
  if (sectionId === 'gapSection') {
    tampilkanGAP();
  } else if (sectionId === 'bobotSection') {
  tampilkanPembobotanNilai();
}
}

function tambahBaris(tableId, colCount) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const row = document.createElement('tr');
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td');
    if (tableId === "adminTable" && (i === 2 || i === 3)) {
      const select = document.createElement('select');
      ["A", "B+", "B", "C+", "C", "E"].forEach(val => {
        const opt = document.createElement('option');
        opt.value = opt.text = val;
        select.appendChild(opt);
      });
      td.appendChild(select);
    } else if (tableId === "adminTable" && i === 4) {
      const select = document.createElement('select');
      ["Ada", "-"].forEach(val => {
        const opt = document.createElement('option');
        opt.value = opt.text = val;
        select.appendChild(opt);
      });
      td.appendChild(select);
    } else {
      td.contentEditable = false;
      td.innerText = '';
    }
    row.appendChild(td);
  }
  row.appendChild(buatKolomAksi(row));
  tbody.appendChild(row);
}

function buatKolomAksi(row) {
  const td = document.createElement('td');
  td.className = "d-flex gap-1 justify-content-center";

  const btnEdit = document.createElement('button');
  btnEdit.innerHTML = '<i class="bi bi-pencil-fill"></i>';
  btnEdit.className = 'btn btn-sm btn-edit';
  btnEdit.title = 'Edit';

  const btnSave = document.createElement('button');
  btnSave.innerHTML = '<i class="bi bi-check-lg"></i>';
  btnSave.className = 'btn btn-sm btn-save d-none';
  btnSave.title = 'Simpan';

  btnEdit.onclick = () => {
    // Aktifkan semua sel kecuali aksi dan select
    row.querySelectorAll('td').forEach((cell, i) => {
      if (i < row.cells.length - 1 && !cell.querySelector("select")) {
        cell.contentEditable = true;
        cell.style.backgroundColor = '#ffffcc';
      }
    });
    btnEdit.classList.add("d-none");
    btnSave.classList.remove("d-none");
  };

  btnSave.onclick = () => {
    row.querySelectorAll('td').forEach((cell, i) => {
      if (i < row.cells.length - 1 && !cell.querySelector("select")) {
        cell.contentEditable = false;
        cell.style.backgroundColor = ''; // reset
      }
    });
    btnEdit.classList.remove("d-none");
    btnSave.classList.add("d-none");
  };

  const btnDelete = document.createElement('button');
  btnDelete.innerHTML = '<i class="bi bi-trash-fill"></i>';
  btnDelete.className = 'btn btn-sm btn-delete';
  btnDelete.title = 'Hapus';
  btnDelete.onclick = function (event) {
    const tr = event.target.closest('tr');
    if (tr && confirm('Yakin ingin menghapus baris ini?')) tr.remove();
  };

  td.appendChild(btnEdit);
  td.appendChild(btnSave);
  td.appendChild(btnDelete);
  return td;
}


function editBaris(row) {
  row.querySelectorAll('td').forEach((cell, i) => {
    if (i < row.cells.length - 1 && !cell.querySelector("select")) {
      cell.contentEditable = true;
      cell.style.backgroundColor = '#ffffcc';
    }
  });
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetSemua() {
  document.querySelectorAll("tbody").forEach(tbody => tbody.innerHTML = "");
  document.getElementById("hasil").innerHTML = "";
  pesertaList.length = 0;
}

function inputNamaPeserta() {
  const nama = prompt("Masukkan nama peserta:");
  if (nama && nama.trim() !== "") tambahPesertaBaru(nama.trim());
}

function tambahPesertaBaru(nama) {
  const isiAdmin = [nama, "", "", "", ""];
  const isiKomp = [nama, "", ""];
  const isiMicro = [nama, "", "", "", "", ""];
  const isiWawan = [nama, "", "", ""];

  const trAdmin = document.createElement('tr');
  isiAdmin.forEach((val, i) => {
    const td = document.createElement('td');
    if (i === 2 || i === 3) {
      const select = document.createElement('select');
      ["A", "B+", "B", "C+", "C", "E"].forEach(optVal => {
        const opt = document.createElement('option');
        opt.value = opt.text = optVal;
        select.appendChild(opt);
      });
      td.appendChild(select);
    } else if (i === 4) {
      const select = document.createElement('select');
      ["Ada", "-"].forEach(optVal => {
        const opt = document.createElement('option');
        opt.value = opt.text = optVal;
        select.appendChild(opt);
      });
      td.appendChild(select);
    } else {
      td.contentEditable = false;
      td.innerText = val;
    }
    trAdmin.appendChild(td);
  });
  trAdmin.appendChild(buatKolomAksi(trAdmin));
  document.querySelector("#adminTable tbody").appendChild(trAdmin);

  const trKomp = document.createElement('tr');
  isiKomp.forEach(val => {
    const td = document.createElement('td');
    td.contentEditable = false;
    td.innerText = val;
    trKomp.appendChild(td);
  });
  trKomp.appendChild(buatKolomAksi(trKomp));
  document.querySelector("#kompTable tbody").appendChild(trKomp);

  const trMicro = document.createElement('tr');
  isiMicro.forEach(val => {
    const td = document.createElement('td');
    td.contentEditable = false;
    td.innerText = val;
    trMicro.appendChild(td);
  });
  trMicro.appendChild(buatKolomAksi(trMicro));
  document.querySelector("#microTable tbody").appendChild(trMicro);

  const trWawan = document.createElement('tr');
  isiWawan.forEach(val => {
    const td = document.createElement('td');
    td.contentEditable = false;
    td.innerText = val;
    trWawan.appendChild(td);
  });
  trWawan.appendChild(buatKolomAksi(trWawan));
  document.querySelector("#wawanTable tbody").appendChild(trWawan);
}

function muatDataAwal() {
  resetSemua();
  const data = [
    { nama: "R", ipk: 3.88, algo: "B", jar: "A", sertifikat: "Ada", prog: 85, jarkom: 60, suara: 5, sikap: 5, interaksi: 4, penguasaan: 3, penyampaian: 4, komitmen: 4, konsistensi: 4, karakter: 4 },
    { nama: "J", ipk: 3.24, algo: "A", jar: "B", sertifikat: "Ada", prog: 65, jarkom: 70, suara: 4, sikap: 4, interaksi: 4, penguasaan: 3, penyampaian: 3, komitmen: 3, konsistensi: 3, karakter: 3 },
    { nama: "O", ipk: 3.88, algo: "B", jar: "B", sertifikat: "Tidak", prog: 80, jarkom: 50, suara: 3, sikap: 4, interaksi: 3, penguasaan: 4, penyampaian: 3, komitmen: 4, konsistensi: 4, karakter: 5 },
    { nama: "H", ipk: 3.68, algo: "B", jar: "B", sertifikat: "Tidak", prog: 50, jarkom: 20, suara: 3, sikap: 4, interaksi: 5, penguasaan: 5, penyampaian: 4, komitmen: 3, konsistensi: 3, karakter: 4 }
  ];

  data.forEach(d => {
    tambahPesertaBaru(d.nama);

    const trAdmin = [...document.querySelectorAll("#adminTable tbody tr")].find(tr => tr.cells[0].innerText.trim() === d.nama);
    if (trAdmin) {
      trAdmin.cells[1].innerText = d.ipk;
      trAdmin.cells[2].querySelector("select").value = d.algo;
      trAdmin.cells[3].querySelector("select").value = d.jar;
      trAdmin.cells[4].querySelector("select").value = d.sertifikat === "Tidak" ? "-" : d.sertifikat;
    }

    const trKomp = [...document.querySelectorAll("#kompTable tbody tr")].find(tr => tr.cells[0].innerText.trim() === d.nama);
    if (trKomp) {
      trKomp.cells[1].innerText = d.prog;
      trKomp.cells[2].innerText = d.jarkom;
    }

    const trMicro = [...document.querySelectorAll("#microTable tbody tr")].find(tr => tr.cells[0].innerText.trim() === d.nama);
    if (trMicro) {
      trMicro.cells[1].innerText = d.suara;
      trMicro.cells[2].innerText = d.sikap;
      trMicro.cells[3].innerText = d.interaksi;
      trMicro.cells[4].innerText = d.penguasaan;
      trMicro.cells[5].innerText = d.penyampaian;
    }

    const trWawan = [...document.querySelectorAll("#wawanTable tbody tr")].find(tr => tr.cells[0].innerText.trim() === d.nama);
    if (trWawan) {
      trWawan.cells[1].innerText = d.komitmen;
      trWawan.cells[2].innerText = d.konsistensi;
      trWawan.cells[3].innerText = d.karakter;
    }
  });

function simpanData() {
  const data = [];

  document.querySelectorAll("#adminTable tbody tr").forEach(tr => {
    const nama = tr.cells[0].innerText.trim();
    const admin = ambilDataPerNama(nama); // fungsi yang sudah kamu punya
    data.push(admin);
  });

  // Simpan ke localStorage
  localStorage.setItem("dataPeserta", JSON.stringify(data));
  alert("Data berhasil disimpan sementara!");
}

}

// Jalankan data awal otomatis saat halaman dimuat
window.addEventListener("DOMContentLoaded", () => {
  muatDataAwal();
});
