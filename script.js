const itemsBody = document.querySelector('#items-body');
const rowTemplate = document.querySelector('#item-row-template');
const addRowButton = document.querySelector('#add-row');
const discountInput = document.querySelector('#discount');
const vatInput = document.querySelector('#vat');
const currencySelect = document.querySelector('#currency');
const commentInput = document.querySelector('#comment');
const printButton = document.querySelector('#print-estimate');
const copyButton = document.querySelector('#copy-whatsapp');
const newEstimateButton = document.querySelector('#new-estimate');
const copyStatus = document.querySelector('#copy-status');
const manualCopy = document.querySelector('#manual-copy');
const manualCopyText = document.querySelector('#manual-copy-text');
const estimateNumber = document.querySelector('#estimate-number');
const estimateDate = document.querySelector('#estimate-date');

const storageKey = 'estimate-draft-v1';
let copyStatusTimer;

const subtotalOutput = document.querySelector('#subtotal');
const discountRow = document.querySelector('#discount-row');
const discountOutput = document.querySelector('#discount-amount');
const discountedRow = document.querySelector('#discounted-row');
const discountedOutput = document.querySelector('#discounted-subtotal');
const vatRow = document.querySelector('#vat-row');
const vatOutput = document.querySelector('#vat-amount');
const grandTotalOutput = document.querySelector('#grand-total');

function numberOrZero(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatMoney(value) {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return `${safeValue.toLocaleString('ru-RU')} ${currencySelect.value}`;
}

function getTodayDetails(sequence = 1) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return {
    number: `${year}${month}${day}-${String(sequence).padStart(2, '0')}`,
    date: today.toLocaleDateString('ru-RU')
  };
}

function setDocumentDetails(details = getTodayDetails()) {
  estimateNumber.textContent = details.number;
  estimateDate.textContent = details.date;
}

function resizeComment() {
  commentInput.style.height = 'auto';
  commentInput.style.height = `${Math.max(104, commentInput.scrollHeight)}px`;
}

function calculate() {
  let rawSubtotal = 0;

  itemsBody.querySelectorAll('.item-row').forEach((row) => {
    const quantity = numberOrZero(row.querySelector('.item-quantity').value);
    const price = numberOrZero(row.querySelector('.item-price').value);
    const lineTotal = quantity * price;

    rawSubtotal += lineTotal;
    row.querySelector('.item-total').textContent = formatMoney(lineTotal);
  });

  const subtotal = Math.round(rawSubtotal);
  const discountPercent = numberOrZero(discountInput.value);
  const vatPercent = numberOrZero(vatInput.value);
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const vatAmount = Math.round(discountedSubtotal * vatPercent / 100);
  const grandTotal = discountedSubtotal + vatAmount;

  subtotalOutput.textContent = formatMoney(subtotal);
  discountOutput.textContent = formatMoney(discountAmount);
  discountedOutput.textContent = formatMoney(discountedSubtotal);
  vatOutput.textContent = formatMoney(vatAmount);
  grandTotalOutput.textContent = formatMoney(grandTotal);

  const hasDiscount = discountAmount !== 0;
  discountRow.hidden = !hasDiscount;
  discountedRow.hidden = !hasDiscount;
  vatRow.hidden = vatAmount === 0;
}

function getDraft() {
  return {
    number: estimateNumber.textContent,
    date: estimateDate.textContent,
    items: [...itemsBody.querySelectorAll('.item-row')].map((row) => ({
      name: row.querySelector('.item-name').value,
      quantity: row.querySelector('.item-quantity').value,
      price: row.querySelector('.item-price').value
    })),
    discount: discountInput.value,
    vat: vatInput.value,
    currency: currencySelect.value,
    comment: commentInput.value
  };
}

function saveDraft() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(getDraft()));
  } catch (error) {
    // Расчёты продолжают работать, даже если хранилище браузера недоступно.
  }
}

function loadDraft() {
  try {
    const savedDraft = JSON.parse(localStorage.getItem(storageKey));
    if (!savedDraft || !Array.isArray(savedDraft.items)) return false;

    setDocumentDetails({
      number: savedDraft.number || getTodayDetails().number,
      date: savedDraft.date || getTodayDetails().date
    });
    discountInput.value = savedDraft.discount ?? 0;
    vatInput.value = savedDraft.vat ?? 0;
    if ([...currencySelect.options].some((option) => option.value === savedDraft.currency)) {
      currencySelect.value = savedDraft.currency;
    }
    commentInput.value = savedDraft.comment ?? '';
    savedDraft.items.forEach((item) => addRow(item, false));
    if (!savedDraft.items.length) addRow({}, false);
    calculate();
    resizeComment();
    return true;
  } catch (error) {
    return false;
  }
}

function addRow({ name = '', quantity = 1, price = 0 } = {}, shouldSave = true) {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.item-row');

  row.querySelector('.item-name').value = name;
  row.querySelector('.item-quantity').value = quantity;
  row.querySelector('.item-price').value = price;
  itemsBody.append(fragment);
  calculate();
  if (shouldSave) saveDraft();

  return row;
}

addRowButton.addEventListener('click', () => {
  const row = addRow();
  row.querySelector('.item-name').focus();
});

itemsBody.addEventListener('input', calculate);
itemsBody.addEventListener('input', saveDraft);

itemsBody.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.remove-row');
  if (!removeButton) return;

  removeButton.closest('.item-row').remove();
  if (!itemsBody.querySelector('.item-row')) addRow();
  calculate();
  saveDraft();
});

[discountInput, vatInput].forEach((input) => {
  input.addEventListener('input', calculate);
  input.addEventListener('input', saveDraft);
});
currencySelect.addEventListener('change', () => {
  calculate();
  saveDraft();
});
commentInput.addEventListener('input', () => {
  resizeComment();
  saveDraft();
});
printButton.addEventListener('click', () => {
  calculate();
  resizeComment();
  window.print();
});

function getNextEstimateDetails() {
  const currentNumber = estimateNumber.textContent;
  const match = currentNumber.match(/^(.*?)(\d+)$/);
  if (!match) return getTodayDetails(2);

  const nextSequence = Number.parseInt(match[2], 10) + 1;
  return {
    number: `${match[1]}${String(nextSequence).padStart(match[2].length, '0')}`,
    date: getTodayDetails().date
  };
}

function resetEstimate() {
  if (!window.confirm('Очистить текущую смету и создать новую?')) return;

  const nextDetails = getNextEstimateDetails();
  itemsBody.replaceChildren();
  discountInput.value = 0;
  vatInput.value = 0;
  currencySelect.selectedIndex = 0;
  commentInput.value = '';
  manualCopy.hidden = true;
  copyStatus.textContent = '';
  setDocumentDetails(nextDetails);
  addRow({}, false);
  calculate();
  resizeComment();
  saveDraft();
  itemsBody.querySelector('.item-name').focus();
}

function getEstimateText() {
  calculate();
  const lines = [`Смета № ${estimateNumber.textContent} от ${estimateDate.textContent}`, ''];

  itemsBody.querySelectorAll('.item-row').forEach((row) => {
    const name = row.querySelector('.item-name').value.trim() || 'Без наименования';
    const quantity = numberOrZero(row.querySelector('.item-quantity').value);
    const price = numberOrZero(row.querySelector('.item-price').value);
    lines.push(`• ${name} — ${quantity.toLocaleString('ru-RU')} шт × ${formatMoney(price)} = ${formatMoney(quantity * price)}`);
  });

  const discountPercent = numberOrZero(discountInput.value);
  const vatPercent = numberOrZero(vatInput.value);
  if (discountPercent > 0) lines.push(`Скидка ${discountPercent.toLocaleString('ru-RU')}%: −${discountOutput.textContent}`);
  if (vatPercent > 0) lines.push(`НДС ${vatPercent.toLocaleString('ru-RU')}%: ${vatOutput.textContent}`);
  lines.push('', `Итого к оплате: ${grandTotalOutput.textContent}`);

  return lines.join('\n');
}

function showCopiedStatus() {
  window.clearTimeout(copyStatusTimer);
  copyStatus.textContent = 'Скопировано ✓';
  copyStatusTimer = window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 2000);
}

async function copyForWhatsApp() {
  const text = getEstimateText();
  manualCopy.hidden = true;

  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    showCopiedStatus();
  } catch (error) {
    copyStatus.textContent = '';
    manualCopyText.value = text;
    manualCopy.hidden = false;
    manualCopyText.focus();
    manualCopyText.select();
  }
}

copyButton.addEventListener('click', copyForWhatsApp);
newEstimateButton.addEventListener('click', resetEstimate);

if (!loadDraft()) {
  setDocumentDetails();
  addRow({}, false);
  saveDraft();
}
