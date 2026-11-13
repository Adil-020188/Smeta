const itemsBody = document.querySelector('#items-body');
const rowTemplate = document.querySelector('#item-row-template');
const addRowButton = document.querySelector('#add-row');
const discountInput = document.querySelector('#discount');
const vatInput = document.querySelector('#vat');
const currencySelect = document.querySelector('#currency');
const commentInput = document.querySelector('#comment');
const printButton = document.querySelector('#print-estimate');
const estimateNumber = document.querySelector('#estimate-number');
const estimateDate = document.querySelector('#estimate-date');

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

function setDocumentDetails() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  estimateNumber.textContent = `${year}${month}${day}-01`;
  estimateDate.textContent = today.toLocaleDateString('ru-RU');
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

function addRow({ name = '', quantity = 1, price = 0 } = {}) {
  const fragment = rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.item-row');

  row.querySelector('.item-name').value = name;
  row.querySelector('.item-quantity').value = quantity;
  row.querySelector('.item-price').value = price;
  itemsBody.append(fragment);
  calculate();

  return row;
}

addRowButton.addEventListener('click', () => {
  const row = addRow();
  row.querySelector('.item-name').focus();
});

itemsBody.addEventListener('input', calculate);

itemsBody.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.remove-row');
  if (!removeButton) return;

  removeButton.closest('.item-row').remove();
  if (!itemsBody.querySelector('.item-row')) addRow();
  calculate();
});

discountInput.addEventListener('input', calculate);
vatInput.addEventListener('input', calculate);
currencySelect.addEventListener('change', calculate);
commentInput.addEventListener('input', resizeComment);
printButton.addEventListener('click', () => {
  calculate();
  resizeComment();
  window.print();
});

setDocumentDetails();
addRow();
