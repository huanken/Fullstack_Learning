// Day 18 - Web Frontend Fundamentals Interactive Script

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. BOX MODEL VISUALIZER LOGIC ---
  const selectBoxSizing = document.getElementById('box-sizing-select');
  const inputWidth = document.getElementById('input-width');
  const inputPadding = document.getElementById('input-padding');
  const inputBorder = document.getElementById('input-border');
  const inputMargin = document.getElementById('input-margin');

  const valWidth = document.getElementById('val-width');
  const valPadding = document.getElementById('val-padding');
  const valBorder = document.getElementById('val-border');
  const valMargin = document.getElementById('val-margin');

  const lblMargin = document.getElementById('lbl-margin');
  const lblBorder = document.getElementById('lbl-border');
  const lblPadding = document.getElementById('lbl-padding');
  const contentDim = document.getElementById('content-dim');

  const visualMargin = document.getElementById('visual-margin');
  const visualBorder = document.getElementById('visual-border');
  const visualPadding = document.getElementById('visual-padding');
  const visualContent = document.getElementById('visual-content');
  const calcFormula = document.getElementById('calc-formula');

  function updateBoxModel() {
    const boxSizing = selectBoxSizing.value;
    const w = parseInt(inputWidth.value, 10);
    const p = parseInt(inputPadding.value, 10);
    const b = parseInt(inputBorder.value, 10);
    const m = parseInt(inputMargin.value, 10);

    // Update labels
    valWidth.textContent = w;
    valPadding.textContent = p;
    valBorder.textContent = b;
    valMargin.textContent = m;

    lblMargin.textContent = `${m}px`;
    lblBorder.textContent = `${b}px`;
    lblPadding.textContent = `${p}px`;

    // Apply styles to visual layers
    visualMargin.style.padding = `${m}px`;
    visualBorder.style.padding = `${b}px`;
    visualPadding.style.padding = `${p}px`;

    let renderedContentWidth = w;
    let totalElementWidth = 0;

    if (boxSizing === 'content-box') {
      // Content-box: specified width is ONLY the content
      renderedContentWidth = w;
      totalElementWidth = w + (p * 2) + (b * 2);
      contentDim.textContent = `${renderedContentWidth}px × 80px`;

      calcFormula.innerHTML = `
        <strong>content-box:</strong> Total Width = Content (${w}px) + Padding (${p}px × 2) + Border (${b}px × 2) + Margin (${m}px × 2)
        <br>👉 Chiều rộng element trên màn hình = <span style="color:#22c55e;font-size:1.2rem;font-weight:bold">${totalElementWidth}px</span> (Chưa tính margin: ${totalElementWidth + m * 2}px với margin)
      `;
    } else {
      // Border-box: specified width includes content + padding + border
      renderedContentWidth = Math.max(20, w - (p * 2) - (b * 2));
      totalElementWidth = w;
      contentDim.textContent = `${renderedContentWidth}px × 80px (Co lại để tổng = ${w}px)`;

      calcFormula.innerHTML = `
        <strong>border-box:</strong> Total Width = Đặt trước (${w}px). Content tự co lại còn ${renderedContentWidth}px.
        <br>👉 Chiều rộng element trên màn hình = <span style="color:#38bdf8;font-size:1.2rem;font-weight:bold">${totalElementWidth}px</span> (Chưa tính margin: ${totalElementWidth + m * 2}px với margin)
      `;
    }

    visualContent.style.width = `${renderedContentWidth}px`;
  }

  // Bind input listeners
  [selectBoxSizing, inputWidth, inputPadding, inputBorder, inputMargin].forEach(el => {
    el.addEventListener('input', updateBoxModel);
  });

  updateBoxModel();

  // --- 2. DOM MANIPULATION LAB ---
  const itemInput = document.getElementById('item-input');
  const addBtn = document.getElementById('add-btn');
  const dynamicList = document.getElementById('dynamic-list');

  function addItem() {
    const text = itemInput.value.trim();
    if (!text) return;

    // 1. createElement
    const li = document.createElement('li');
    li.className = 'tech-item';

    const span = document.createElement('span');
    span.textContent = text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Xóa khỏi DOM';

    // 2. addEventListener for delete
    delBtn.addEventListener('click', () => {
      li.style.opacity = '0';
      li.style.transform = 'translateX(20px)';
      setTimeout(() => li.remove(), 200);
    });

    // 3. appendChild
    li.appendChild(span);
    li.appendChild(delBtn);
    dynamicList.appendChild(li);

    itemInput.value = '';
    itemInput.focus();
  }

  addBtn.addEventListener('click', addItem);
  itemInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addItem();
  });

  // Attach delete handlers for existing static items
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.tech-item');
      if (item) item.remove();
    });
  });
});
