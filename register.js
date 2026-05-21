// ============================================================
  // REGISTRATION MODAL SYSTEM
  // ============================================================
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

    // ---- Submit ----
    function generateCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'IGITA-2026-';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    btnSubmit.addEventListener('click', () => {
      if (!validateStep3()) return;

      // Loading state
      btnSubmit.classList.add('loading');
      btnSubmit.disabled = true;
      btnBack.disabled = true;

      // Simulate network delay (replace with real fetch to your backend)
      setTimeout(() => {
        const kat = document.querySelector('input[name="kategori"]:checked')?.value;
        const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';

        // Populate success screen
        document.getElementById('success-code').textContent = generateCode();
        document.getElementById('suc-team').textContent  = document.getElementById('nama-tim').value.trim();
        document.getElementById('suc-cat').textContent   = katLabel;
        document.getElementById('suc-inst').textContent  = kat === 'internal' ? 'Internal KKG' : document.getElementById('asal-institusi').value.trim();
        document.getElementById('suc-email').textContent = document.getElementById('m1-email').value.trim();

        // Hide form panels & footer
        document.querySelectorAll('.reg-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
        document.getElementById('reg-steps').style.display = 'none';
        regFooter.style.display = 'none';

        // Show success
        document.getElementById('reg-success').classList.add('active');
        modal.scrollTop = 0;

      }, 1800);
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