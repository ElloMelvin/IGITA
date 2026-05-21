// ============================================================
  // REGISTRATION MODAL SYSTEM
  // ============================================================

  // Ganti dengan URL Web App dari Google Apps Script (Deploy → Web app → /exec)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbyqC7CBMocnTthTT-Gx0iB2ijgc5SVoTXZ_YQbqT58oY9InIkxGNrGqN3v9v553NS9d/exec';

  (function() {
    const overlay   = document.getElementById('reg-overlay');
    const modal     = document.getElementById('reg-modal');
    const closeBtn  = document.getElementById('reg-close-btn');
    const btnNext   = document.getElementById('btn-next');
    const btnBack   = document.getElementById('btn-back');
    const btnSubmit = document.getElementById('btn-submit');
    const regFooter = document.getElementById('reg-footer');
    const stepText  = document.getElementById('step-indicator-text');

    let currentStep = 1;
    const TOTAL_STEPS = 3;

    document.getElementById('btn-success-close').addEventListener('click', () => {
        window.location.href = 'index.html';
    });


    // ---- Category card selection ----
    document.querySelectorAll('.cat-select-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.cat-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const rowInst = document.getElementById('row-asal-institusi');
          if (rowInst) {
            if (radio.value === 'internal') {
              rowInst.style.display = 'none';
              setInputErr('asal-institusi', false);
              showErr('err-asal-institusi', false);
            } else {
              rowInst.style.display = '';
            }
          }
        }
      });
    });

    // ---- Char counter for description ----
    const desc = document.getElementById('deskripsi-proyek'); // not used
    const counter = document.getElementById('char-counter');
    if (desc && counter) {
      desc.addEventListener('input', () => {
        counter.textContent = desc.value.length + ' / 300 karakter';
      });
    }

    // ---- Validation per step ----
    function showErr(id, show) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('visible', show);
    }
    function setInputErr(id, hasErr) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('error', hasErr);
    }
    function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function isPhone(v) { return v.replace(/[\s\-]/g, '').length >= 9; }

    
    function validateStep1() {
      let ok = true;
      const kat = document.querySelector('input[name="kategori"]:checked');
      const noKat = !kat;
      showErr('err-kategori', noKat);
      if (noKat) ok = false;

      const namaVal = document.getElementById('nama-tim').value.trim();
      const noNama = namaVal.length < 2;
      setInputErr('nama-tim', noNama); showErr('err-nama-tim', noNama);
      if (noNama) ok = false;

      if (kat && kat.value === 'external') {
        const instVal = document.getElementById('asal-institusi').value.trim();
        const noInst = instVal.length < 2;
        setInputErr('asal-institusi', noInst); showErr('err-asal-institusi', noInst);
        if (noInst) ok = false;
      } else {
        setInputErr('asal-institusi', false); showErr('err-asal-institusi', false);
      }

      return ok;
    }

    function validateStep2() {
      let ok = true;
      const members = [
        { id: 1, req: true },
        { id: 2, req: true },
        { id: 3, req: true },
        { id: 4, req: true },
        { id: 5, req: false } // Cadangan
      ];

      members.forEach(m => {
        const namId = `m${m.id}-nama`;
        const emId = `m${m.id}-email`;
        const hpId = `m${m.id}-hp`;
        const igId = `m${m.id}-ig`;

        const namVal = document.getElementById(namId)?.value.trim() || '';
        const emVal = document.getElementById(emId)?.value.trim() || '';
        const hpVal = document.getElementById(hpId)?.value.trim() || '';
        const igVal = document.getElementById(igId)?.value.trim() || '';

        // Jika cadangan dan semua field kosong, abaikan validasi (valid)
        if (!m.req && !namVal && !emVal && !hpVal && !igVal) {
          setInputErr(namId, false); showErr(`err-${namId}`, false);
          setInputErr(emId, false); showErr(`err-${emId}`, false);
          setInputErr(hpId, false); showErr(`err-${hpId}`, false);
          setInputErr(igId, false); showErr(`err-${igId}`, false);
          return;
        }

        // Jika wajib ATAU ada salah satu field cadangan diisi sebagian
        const noNam = namVal.length < 2;
        setInputErr(namId, noNam); showErr(`err-${namId}`, noNam);
        if (noNam) ok = false;

        const noEm = !isEmail(emVal);
        setInputErr(emId, noEm); showErr(`err-${emId}`, noEm);
        if (noEm) ok = false;

        const noHp = !isPhone(hpVal);
        setInputErr(hpId, noHp); showErr(`err-${hpId}`, noHp);
        if (noHp) ok = false;

        const noIg = igVal.length < 2;
        setInputErr(igId, noIg); showErr(`err-${igId}`, noIg);
        if (noIg) ok = false;
      });
      return ok;
    }

    function validateStep3() {
      let ok = true;
      const fileInput = document.getElementById('bukti-bayar');
      const noFile = !fileInput || !fileInput.files || fileInput.files.length === 0;
      setInputErr('bukti-bayar', noFile); showErr('err-bukti-bayar', noFile);
      if (noFile) ok = false;

      const agreed = document.getElementById('agree-check').checked;
      showErr('err-agree', !agreed);
      document.getElementById('agree-wrap').style.borderColor = agreed ? '' : 'rgba(255,80,80,0.4)';
      if (!agreed) ok = false;

      return ok;
    }
// ---- Step navigation ----
    function updateStepUI() {
      // Panels
      document.querySelectorAll('.reg-panel').forEach((p, i) => {
        p.classList.toggle('active', i + 1 === currentStep);
      });
      // Step dots
      document.querySelectorAll('.reg-step').forEach((s, i) => {
        const n = i + 1;
        s.classList.remove('active', 'done');
        if (n < currentStep) s.classList.add('done');
        if (n === currentStep) s.classList.add('active');
      });
      // Connectors
      document.getElementById('conn-1-2').classList.toggle('done', currentStep > 1);
      document.getElementById('conn-2-3').classList.toggle('done', currentStep > 2);

      // Buttons
      btnBack.style.display = currentStep > 1 ? 'inline-flex' : 'none';
      const isLast = currentStep === TOTAL_STEPS;
      btnNext.style.display = isLast ? 'none' : 'inline-flex';
      btnSubmit.classList.toggle('visible', isLast);

      stepText.textContent = 'Langkah ' + currentStep + ' dari ' + TOTAL_STEPS;

      modal.scrollTop = 0;
    }

    btnNext.addEventListener('click', () => {
      let valid = false;
      if (currentStep === 1) valid = validateStep1();
      else if (currentStep === 2) valid = validateStep2();
      if (valid && currentStep < TOTAL_STEPS) {
        currentStep++;
        updateStepUI();
      }
    });

    btnBack.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });

    // ---- Submit → Google Spreadsheet (via Apps Script) ----
    function generateCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'IGITA-2026-';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    function val(id) {
      return (document.getElementById(id)?.value || '').trim();
    }

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const base64 = String(dataUrl).split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Gagal membaca file bukti bayar.'));
        reader.readAsDataURL(file);
      });
    }

    function buildPayload(kode, bukti) {
      const kat = document.querySelector('input[name="kategori"]:checked')?.value || '';
      const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';
      const institusi = kat === 'internal' ? 'Internal KKG' : val('asal-institusi');

      return {
        kode,
        kategori: katLabel,
        namaTim: val('nama-tim'),
        institusi,
        m1Nama: val('m1-nama'), m1Email: val('m1-email'), m1Hp: val('m1-hp'), m1Ig: val('m1-ig'),
        m2Nama: val('m2-nama'), m2Email: val('m2-email'), m2Hp: val('m2-hp'), m2Ig: val('m2-ig'),
        m3Nama: val('m3-nama'), m3Email: val('m3-email'), m3Hp: val('m3-hp'), m3Ig: val('m3-ig'),
        m4Nama: val('m4-nama'), m4Email: val('m4-email'), m4Hp: val('m4-hp'), m4Ig: val('m4-ig'),
        m5Nama: val('m5-nama'), m5Email: val('m5-email'), m5Hp: val('m5-hp'), m5Ig: val('m5-ig'),
        buktiBase64: bukti.base64,
        buktiName: bukti.name,
        buktiMime: bukti.mime
      };
    }

    function showSuccessScreen(kode, kat) {
      const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';

      document.getElementById('success-code').textContent = kode;
      document.getElementById('suc-team').textContent  = val('nama-tim');
      document.getElementById('suc-cat').textContent   = katLabel;
      document.getElementById('suc-inst').textContent  = kat === 'internal' ? 'Internal KKG' : val('asal-institusi');
      document.getElementById('suc-email').textContent = val('m1-email');

      document.querySelectorAll('.reg-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
      document.getElementById('reg-steps').style.display = 'none';
      regFooter.style.display = 'none';
      document.getElementById('reg-success').classList.add('active');
      modal.scrollTop = 0;
    }

    function endSubmitLoading() {
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
      btnBack.disabled = false;
    }

    async function submitToGoogleSheets(payload) {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { ok: res.ok };
      }
    }

    btnSubmit.addEventListener('click', async () => {
      if (!validateStep3()) return;

      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('GANTI_DENGAN_ID')) {
        alert('URL Google Apps Script belum diatur. Buka register.js dan isi GOOGLE_SCRIPT_URL dengan URL Web App Anda.');
        return;
      }

      const fileInput = document.getElementById('bukti-bayar');
      const file = fileInput.files[0];
      const maxBytes = 2 * 1024 * 1024;
      if (file.size > maxBytes) {
        setInputErr('bukti-bayar', true);
        showErr('err-bukti-bayar', true);
        document.getElementById('err-bukti-bayar').textContent = 'Ukuran file maksimal 2MB.';
        return;
      }
      document.getElementById('err-bukti-bayar').textContent = 'Bukti pembayaran wajib diunggah.';

      btnSubmit.classList.add('loading');
      btnSubmit.disabled = true;
      btnBack.disabled = true;

      const kode = generateCode();
      const kat = document.querySelector('input[name="kategori"]:checked')?.value;

      try {
        const base64 = await readFileAsBase64(file);
        const payload = buildPayload(kode, {
          base64,
          name: file.name,
          mime: file.type || 'application/octet-stream'
        });

        const result = await submitToGoogleSheets(payload);
        if (!result.ok) {
          throw new Error(result.error || 'Server menolak pendaftaran.');
        }

        showSuccessScreen(kode, kat);
      } catch (err) {
        console.error(err);
        alert('Pendaftaran gagal dikirim. Periksa koneksi internet dan URL Apps Script, lalu coba lagi.\n\n' + (err.message || err));
        endSubmitLoading();
      }
    });

    // On close reset
    function resetModal() {
      currentStep = 1;
      // Restore panels/footer
      document.querySelectorAll('.reg-panel').forEach(p => { p.style.display = ''; p.classList.remove('active'); });
      document.getElementById('panel-1').classList.add('active');
      document.getElementById('reg-steps').style.display = '';
      regFooter.style.display = '';
      document.getElementById('reg-success').classList.remove('active');

      // Clear form
      document.querySelectorAll('.reg-modal input, .reg-modal textarea, .reg-modal select').forEach(el => {
        if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
        else if (el.type === 'file') el.value = '';
        else el.value = '';
      });
      document.querySelectorAll('.cat-select-card').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
      document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(i => i.classList.remove('error'));
      document.getElementById('agree-wrap').style.borderColor = '';
      // document.getElementById('char-counter').textContent = '0 / 300 karakter';
      btnSubmit.classList.remove('loading'); btnSubmit.disabled = false; btnBack.disabled = false;
      updateStepUI();
    }

    document.getElementById('btn-success-close').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    updateStepUI();
  })();