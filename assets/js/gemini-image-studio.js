/**
 * Readout Visual Health Studio
 * Create & Edit Medical Visualizations with gemini-3.1-flash-image-preview
 * and Firestore Persistent Storage
 */

(function () {
  let activeMode = 'create'; // 'create' | 'edit'
  let currentAspectRatio = '1:1';
  let uploadedImageBase64 = null;
  let isGenerating = false;

  const PROMPT_PRESETS = [
    {
      title: '🩸 Fasting Glucose Metabolism',
      prompt: 'Create a clean, publication-grade anatomical infographic explaining how insulin transports fasting blood glucose into liver and muscle cells, with normal 70-99 mg/dL reference thresholds.'
    },
    {
      title: '🩺 HDL vs LDL Cholesterol Particles',
      prompt: 'Generate a comparative medical diagram showing HDL (scavenger) vs LDL (arterial plaque contributor) cholesterol particles in a cross-section blood vessel with lipid targets.'
    },
    {
      title: '🧬 Kidney Nephron & Microalbumin',
      prompt: 'Illustrate the microscopic glomerular filter of a human kidney, showing how healthy podocytes prevent albumin leakage vs. early microalbuminuria signs.'
    },
    {
      title: '⚡ Liver Enzymes ALT / AST',
      prompt: 'Create a clinical educational diagram explaining the difference between liver-specific ALT enzyme vs muscle/liver AST enzyme and how intense exercise influences them.'
    }
  ];

  function openImageStudioModal(initialPrompt = null) {
    const modal = document.createElement('div');
    modal.className = 'gemini-image-studio-wrapper';
    modal.style.cssText = 'display:flex;flex-direction:column;height:84vh;max-height:760px;width:100%;max-width:820px;';

    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--line, #e2ded4)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg, #194a43, #2b7a6d);color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px">
            🎨
          </div>
          <div>
            <h3 style="margin:0;font-size:17px;font-weight:700;color:var(--ink-1, #1a1a1a)">Clinical Image Studio</h3>
            <p style="margin:0;font-size:11px;color:var(--ink-3, #777)">Powered by <strong>gemini-3.1-flash-image-preview</strong> • Create & Edit Medical Visualizations</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="chip chip--in" style="font-size:10px;padding:3px 7px">gemini-3.1-flash-image-preview</span>
          <button type="button" class="btn btn-secondary btn-sm" data-close style="padding:4px 10px">✕</button>
        </div>
      </div>

      <!-- Mode Tabs -->
      <div style="display:flex;gap:8px;padding:10px 0;border-bottom:1px solid var(--line, #e2ded4)">
        <button type="button" id="tab-create" class="studio-tab btn btn-primary btn-sm" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px">
          <span>✨ Create Visual from Text</span>
        </button>
        <button type="button" id="tab-edit" class="studio-tab btn btn-secondary btn-sm" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px">
          <span>🖌️ Edit Existing Visual</span>
        </button>
        <button type="button" id="tab-gallery" class="studio-tab btn btn-secondary btn-sm" style="display:flex;align-items:center;gap:6px">
          <span>🖼️ Saved Visuals</span>
        </button>
      </div>

      <!-- Main Workspace Scrollable Container -->
      <div id="studio-workspace" style="flex:1;overflow-y:auto;padding:12px 2px;display:flex;flex-direction:column;gap:14px">

        <!-- Image Upload Section (Edit Mode Only) -->
        <div id="edit-upload-section" style="display:none;background:var(--surface-sunk, #f8f7f4);border:1px dashed var(--line);border-radius:8px;padding:14px">
          <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--ink-1)">1. Select or Upload Reference Medical Visual to Edit:</div>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <input type="file" id="image-file-input" accept="image/*" style="font-size:12px">
            <button type="button" id="use-sample-chart-btn" class="btn btn-ghost btn-sm" style="font-size:11px;border:1px solid var(--line);background:var(--surface)">Use Sample Report Graph</button>
          </div>
          <div id="image-preview-box" style="margin-top:10px;display:none">
            <img id="source-image-preview" src="" alt="Source preview" style="max-height:140px;border-radius:6px;border:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,0.05)">
            <span id="remove-img-btn" style="display:inline-block;margin-left:8px;font-size:11px;color:var(--clay);cursor:pointer;text-decoration:underline">Remove Image</span>
          </div>
        </div>

        <!-- Prompt Input Section -->
        <div>
          <label for="image-prompt-input" style="font-size:12px;font-weight:600;color:var(--ink-1);display:block;margin-bottom:6px">
            <span id="prompt-section-label">Describe the clinical visual you want to create:</span>
          </label>
          <textarea id="image-prompt-input" rows="3" placeholder="e.g. Create a visual infographic explaining why fasting blood glucose rises after dinner and how 10-hour fasting affects results..." style="width:100%;padding:10px 12px;font-size:13px;border-radius:8px;border:1px solid var(--line);line-height:1.4;background:var(--surface)" required></textarea>
        </div>

        <!-- Aspect Ratio & Presets Section -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:11px;font-weight:600;color:var(--ink-2)">Aspect Ratio:</span>
            <div style="display:flex;gap:4px" id="ratio-btn-group">
              <button type="button" data-ratio="1:1" class="btn btn-sm btn-secondary ratio-btn active-ratio" style="padding:3px 8px;font-size:11px;background:var(--pine);color:#fff">1:1 Square</button>
              <button type="button" data-ratio="16:9" class="btn btn-sm btn-secondary ratio-btn" style="padding:3px 8px;font-size:11px">16:9 Landscape</button>
              <button type="button" data-ratio="4:3" class="btn btn-sm btn-secondary ratio-btn" style="padding:3px 8px;font-size:11px">4:3 Presentation</button>
            </div>
          </div>
          <button type="button" id="generate-image-btn" class="btn btn-primary" style="padding:8px 20px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px">
            <span>✨ Generate with Gemini</span>
          </button>
        </div>

        <!-- Quick Clinical Presets -->
        <div id="presets-section">
          <div style="font-size:11px;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">Or choose a clinical prompt template:</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:6px">
            ${PROMPT_PRESETS.map((p, i) => `
              <div class="preset-card" data-preset="${i}" style="padding:8px 10px;background:var(--surface-sunk);border:1px solid var(--line);border-radius:6px;cursor:pointer;transition:background 0.15s">
                <div style="font-size:12px;font-weight:600;color:var(--pine)">${p.title}</div>
                <div style="font-size:11px;color:var(--ink-2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.prompt}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Generation Loading Indicator -->
        <div id="generation-spinner" style="display:none;padding:24px;text-align:center;background:var(--surface-sunk);border-radius:8px">
          <div class="spinner" style="width:28px;height:28px;margin:0 auto 10px auto;border:3px solid var(--line);border-top-color:var(--pine);border-radius:50%;animation:spin 0.8s linear infinite"></div>
          <div style="font-size:13px;font-weight:600;color:var(--pine)">gemini-3.1-flash-image-preview is generating your visual...</div>
          <div style="font-size:11px;color:var(--ink-3);margin-top:4px">Synthesizing clinical anatomy, metrics, and educational infographic graphics</div>
        </div>

        <!-- Result Preview Section -->
        <div id="result-display-section" style="display:none;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:16px;box-shadow:0 2px 6px rgba(0,0,0,0.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <div>
              <span class="chip chip--in" style="font-size:11px;padding:2px 8px">Generated Visual Asset</span>
              <span id="result-model-badge" style="font-size:11px;color:var(--ink-3);margin-left:8px">Model: gemini-3.1-flash-image-preview</span>
            </div>
            <div style="display:flex;gap:6px">
              <button type="button" id="save-firestore-btn" class="btn btn-secondary btn-sm" style="font-size:11px;padding:4px 10px">☁️ Save to Firestore</button>
              <a id="download-image-link" class="btn btn-primary btn-sm" style="font-size:11px;padding:4px 10px" download="readout-clinical-visual.png" href="#">⬇️ Download</a>
            </div>
          </div>
          
          <div style="text-align:center;background:#0b2420;border-radius:8px;padding:12px;overflow:hidden">
            <img id="generated-image-result" src="" alt="Generated clinical visual" style="max-height:360px;max-width:100%;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25)">
          </div>

          <div style="margin-top:10px;font-size:12px;color:var(--ink-2);background:var(--surface-sunk);padding:8px 12px;border-radius:6px">
            <strong>Prompt:</strong> <span id="result-prompt-text"></span>
          </div>
        </div>

        <!-- Saved Visuals Gallery Container (Shown in Gallery tab) -->
        <div id="gallery-display-section" style="display:none">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <h4 style="margin:0;font-size:14px;color:var(--ink-1)">Saved Visual Health Assets</h4>
            <span style="font-size:11px;color:var(--ink-3)">Backed by Firestore Database</span>
          </div>
          <div id="gallery-items-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:10px">
            <div style="padding:16px;text-align:center;color:var(--ink-3)">Loading saved visuals...</div>
          </div>
        </div>

      </div>
    `;

    // Elements
    const tabCreate = modal.querySelector('#tab-create');
    const tabEdit = modal.querySelector('#tab-edit');
    const tabGallery = modal.querySelector('#tab-gallery');
    const editUploadSection = modal.querySelector('#edit-upload-section');
    const promptInput = modal.querySelector('#image-prompt-input');
    const promptLabel = modal.querySelector('#prompt-section-label');
    const ratioButtons = modal.querySelectorAll('.ratio-btn');
    const generateBtn = modal.querySelector('#generate-image-btn');
    const spinner = modal.querySelector('#generation-spinner');
    const resultSection = modal.querySelector('#result-display-section');
    const gallerySection = modal.querySelector('#gallery-display-section');
    const presetsSection = modal.querySelector('#presets-section');
    const generatedImg = modal.querySelector('#generated-image-result');
    const downloadLink = modal.querySelector('#download-image-link');
    const resultPromptText = modal.querySelector('#result-prompt-text');
    const resultModelBadge = modal.querySelector('#result-model-badge');
    const saveFirestoreBtn = modal.querySelector('#save-firestore-btn');
    const fileInput = modal.querySelector('#image-file-input');
    const sampleChartBtn = modal.querySelector('#use-sample-chart-btn');
    const previewBox = modal.querySelector('#image-preview-box');
    const previewImg = modal.querySelector('#source-image-preview');
    const removeImgBtn = modal.querySelector('#remove-img-btn');

    let lastGeneratedData = null;

    // Tab Switcher
    function setTab(mode) {
      activeMode = mode;
      tabCreate.className = 'studio-tab btn btn-sm ' + (mode === 'create' ? 'btn-primary' : 'btn-secondary');
      tabEdit.className = 'studio-tab btn btn-sm ' + (mode === 'edit' ? 'btn-primary' : 'btn-secondary');
      tabGallery.className = 'studio-tab btn btn-sm ' + (mode === 'gallery' ? 'btn-primary' : 'btn-secondary');

      if (mode === 'gallery') {
        editUploadSection.style.display = 'none';
        presetsSection.style.display = 'none';
        promptInput.closest('div').style.display = 'none';
        ratioButtons[0].closest('div').style.display = 'none';
        resultSection.style.display = 'none';
        gallerySection.style.display = 'block';
        loadGalleryItems();
      } else {
        gallerySection.style.display = 'none';
        promptInput.closest('div').style.display = 'block';
        ratioButtons[0].closest('div').style.display = 'flex';
        presetsSection.style.display = 'block';

        if (mode === 'edit') {
          editUploadSection.style.display = 'block';
          promptLabel.textContent = 'Describe changes or edits to apply to this image:';
          promptInput.placeholder = 'e.g. Add red warning markers to glucose value 113, and highlight the normal reference band in green...';
          generateBtn.innerHTML = '<span>🖌️ Edit with Gemini</span>';
        } else {
          editUploadSection.style.display = 'none';
          promptLabel.textContent = 'Describe the clinical visual you want to create:';
          promptInput.placeholder = 'e.g. Create an anatomical infographic explaining why fasting blood glucose rises after dinner...';
          generateBtn.innerHTML = '<span>✨ Generate with Gemini</span>';
        }
      }
    }

    tabCreate.addEventListener('click', () => setTab('create'));
    tabEdit.addEventListener('click', () => setTab('edit'));
    tabGallery.addEventListener('click', () => setTab('gallery'));

    // Aspect Ratio Selection
    ratioButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        ratioButtons.forEach(b => {
          b.style.background = 'var(--surface)';
          b.style.color = 'var(--ink-1)';
        });
        btn.style.background = 'var(--pine)';
        btn.style.color = '#fff';
        currentAspectRatio = btn.getAttribute('data-ratio');
      });
    });

    // Preset Selection
    modal.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-preset'), 10);
        promptInput.value = PROMPT_PRESETS[idx].prompt;
        promptInput.focus();
      });
    });

    // Image Upload Handling (Edit Mode)
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImageBase64 = evt.target.result;
        previewImg.src = uploadedImageBase64;
        previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });

    sampleChartBtn.addEventListener('click', () => {
      // Create a sample test report canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8f7f4';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#194a43';
      ctx.font = 'bold 20px Georgia';
      ctx.fillText('Sample Lab Specimen: Glucose & Lipids', 30, 45);
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.fillText('Fasting Blood Glucose: 113 mg/dL (High)', 30, 85);
      ctx.fillText('Reference Range: 70 - 99 mg/dL', 30, 110);
      ctx.fillText('Total Cholesterol: 214 mg/dL', 30, 150);
      ctx.fillStyle = '#e2ded4';
      ctx.fillRect(30, 200, 540, 140);
      ctx.fillStyle = '#194a43';
      ctx.fillText('[Baseline Report Graphic for Visual Editing]', 160, 270);

      uploadedImageBase64 = canvas.toDataURL('image/png');
      previewImg.src = uploadedImageBase64;
      previewBox.style.display = 'block';
    });

    removeImgBtn.addEventListener('click', () => {
      uploadedImageBase64 = null;
      fileInput.value = '';
      previewBox.style.display = 'none';
    });

    // Generate / Edit Image Action
    generateBtn.addEventListener('click', async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) {
        alert('Please enter a description for the image to generate or edit.');
        promptInput.focus();
        return;
      }

      if (activeMode === 'edit' && !uploadedImageBase64) {
        alert('Please select or upload a reference image to edit.');
        return;
      }

      isGenerating = true;
      generateBtn.disabled = true;
      spinner.style.display = 'block';
      resultSection.style.display = 'none';

      try {
        const response = await fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            mode: activeMode,
            referenceImage: activeMode === 'edit' ? uploadedImageBase64 : null,
            aspectRatio: currentAspectRatio
          })
        });

        if (!response.ok) {
          throw new Error(`Generation error ${response.status}`);
        }

        const resData = await response.json();
        if (resData.status === 'success' && resData.data?.imageUrl) {
          lastGeneratedData = resData.data;
          generatedImg.src = resData.data.imageUrl;
          downloadLink.href = resData.data.imageUrl;
          resultPromptText.textContent = prompt;
          resultModelBadge.textContent = `Model: ${resData.data.model || 'gemini-3.1-flash-image-preview'}`;
          resultSection.style.display = 'block';

          // Auto-save to Firestore if signed in
          if (window.ReadoutFirebase && typeof window.ReadoutFirebase.saveImage === 'function') {
            window.ReadoutFirebase.saveImage({
              prompt,
              imageUrl: resData.data.imageUrl,
              mode: activeMode,
              model: resData.data.model || 'gemini-3.1-flash-image-preview'
            });
          }
        } else {
          throw new Error(resData.message || 'Image URL not returned');
        }

      } catch (err) {
        alert(`Could not complete image generation: ${err.message}`);
      } finally {
        isGenerating = false;
        generateBtn.disabled = false;
        spinner.style.display = 'none';
      }
    });

    // Save to Firestore manually button
    saveFirestoreBtn.addEventListener('click', async () => {
      if (!lastGeneratedData) return;
      if (window.ReadoutFirebase && typeof window.ReadoutFirebase.saveImage === 'function') {
        saveFirestoreBtn.disabled = true;
        saveFirestoreBtn.textContent = 'Saving...';
        const res = await window.ReadoutFirebase.saveImage({
          prompt: promptInput.value.trim(),
          imageUrl: lastGeneratedData.imageUrl,
          mode: activeMode,
          model: lastGeneratedData.model || 'gemini-3.1-flash-image-preview'
        });
        if (res.success) {
          saveFirestoreBtn.textContent = '✓ Saved to Firestore';
        } else {
          saveFirestoreBtn.textContent = 'Sign-in required';
        }
        setTimeout(() => {
          saveFirestoreBtn.disabled = false;
          saveFirestoreBtn.textContent = '☁️ Save to Firestore';
        }, 2000);
      } else {
        alert('Firebase not connected or user signed out.');
      }
    });

    // Gallery Loader
    async function loadGalleryItems() {
      const grid = modal.querySelector('#gallery-items-grid');
      grid.innerHTML = '<div style="padding:16px;text-align:center;color:var(--ink-3)">Checking Firestore image assets...</div>';

      let items = [];
      if (window.ReadoutFirebase && typeof window.ReadoutFirebase.getImages === 'function') {
        items = await window.ReadoutFirebase.getImages();
      }

      if (!items || items.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;padding:24px;text-align:center;background:var(--surface-sunk);border-radius:8px">
            <div style="font-size:24px;margin-bottom:6px">🖼️</div>
            <div style="font-size:13px;font-weight:600;color:var(--ink-1)">No Saved Visuals Yet</div>
            <div style="font-size:11px;color:var(--ink-3);margin-top:4px">Generate or edit an image with gemini-3.1-flash-image-preview to see it stored here.</div>
          </div>
        `;
        return;
      }

      grid.innerHTML = items.map(item => `
        <div style="background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px">
          <img src="${item.imageUrl}" alt="Visual" style="width:100%;height:130px;object-fit:cover;border-radius:4px">
          <div style="font-size:11px;color:var(--ink-1);line-height:1.3;max-height:40px;overflow:hidden;text-overflow:ellipsis">
            ${escapeHtml(item.prompt)}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
            <span style="font-size:10px;color:var(--ink-3)">${item.mode === 'edit' ? 'Edited' : 'Created'}</span>
            <a href="${item.imageUrl}" download="readout-visual.png" class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 6px">⬇️ Get</a>
          </div>
        </div>
      `).join('');
    }

    if (typeof window.openModal === 'function') {
      window.openModal(modal);
    } else {
      document.body.appendChild(modal);
    }

    if (initialPrompt) {
      promptInput.value = initialPrompt;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Export to window
  window.GeminiImageStudio = {
    open: openImageStudioModal
  };

})();
