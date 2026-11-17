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
const languageButtons = [...document.querySelectorAll('.language-button')];

const storageKey = 'estimate-draft-v1';
const languageStorageKey = 'estimate-language';
let copyStatusTimer;
let currentLanguage = getSavedLanguage();

const translations = {
  ru: {
    documentTitle: 'Смета за 5 минут',
    languageChoice: 'Выбор языка',
    eyebrow: 'Быстрый расчёт',
    pageTitle: 'Смета за 5 минут',
    intro: 'Составьте аккуратную смету, рассчитайте итог и отправьте клиенту — всё в одном окне.',
    autosave: 'Черновик сохраняется автоматически',
    estimate: 'Смета',
    from: 'от',
    contractor: 'Исполнитель:',
    customer: 'Заказчик:',
    estimateContents: 'Состав сметы',
    itemsAndCost: 'Позиции и стоимость',
    itemsDescription: 'Укажите работы или товары, количество и цену за единицу.',
    addItem: 'Добавить позицию',
    name: 'Наименование',
    quantity: 'Количество',
    price: 'Цена',
    amount: 'Сумма',
    actions: 'Действия',
    adjustmentsLabel: 'Скидка, НДС и валюта',
    parameters: 'Параметры',
    calculationTerms: 'Условия расчёта',
    discountPercent: 'Скидка, %',
    vatPercent: 'НДС, %',
    currency: 'Валюта',
    calculation: 'Расчёт',
    finalAmount: 'Итоговая сумма',
    discount: 'Скидка',
    discountedAmount: 'Сумма со скидкой',
    vat: 'НДС',
    totalDue: 'Итого к оплате',
    comment: 'Комментарий',
    optional: 'необязательно',
    commentPlaceholder: 'Например: срок выполнения — 5 рабочих дней, предоплата — 50 %',
    savePdf: 'Сохранить PDF',
    copyWhatsApp: 'Скопировать для WhatsApp',
    newEstimate: 'Новая смета',
    manualCopy: 'Не удалось скопировать автоматически. Скопируйте текст вручную:',
    pdfHint: 'В окне печати выберите «Сохранить как PDF».',
    signature: 'Подпись',
    itemName: 'Наименование позиции',
    itemPlaceholder: 'Например, офисное кресло',
    remove: 'Удалить',
    removeItem: 'Удалить позицию',
    confirmNew: 'Очистить текущую смету и создать новую?',
    unnamed: 'Без наименования',
    unit: 'шт',
    copied: 'Скопировано ✓'
  },
  kk: {
    documentTitle: '5 минутта смета',
    languageChoice: 'Тілді таңдау',
    eyebrow: 'Жылдам есеп',
    pageTitle: '5 минутта смета',
    intro: 'Ұқыпты смета жасаңыз, қорытындыны есептеп, клиентке жіберіңіз — бәрі бір терезеде.',
    autosave: 'Нобай автоматты түрде сақталады',
    estimate: 'Смета',
    from: 'күні',
    contractor: 'Орындаушы:',
    customer: 'Тапсырыс беруші:',
    estimateContents: 'Смета құрамы',
    itemsAndCost: 'Позициялар мен құны',
    itemsDescription: 'Жұмыстарды немесе тауарларды, санын және бірлік бағасын көрсетіңіз.',
    addItem: 'Позиция қосу',
    name: 'Атауы',
    quantity: 'Саны',
    price: 'Бағасы',
    amount: 'Сома',
    actions: 'Әрекеттер',
    adjustmentsLabel: 'Жеңілдік, ҚҚС және валюта',
    parameters: 'Параметрлер',
    calculationTerms: 'Есептеу шарттары',
    discountPercent: 'Жеңілдік, %',
    vatPercent: 'ҚҚС, %',
    currency: 'Валюта',
    calculation: 'Есеп',
    finalAmount: 'Қорытынды сома',
    discount: 'Жеңілдік',
    discountedAmount: 'Жеңілдіктен кейінгі сома',
    vat: 'ҚҚС',
    totalDue: 'Төлеуге барлығы',
    comment: 'Түсініктеме',
    optional: 'міндетті емес',
    commentPlaceholder: 'Мысалы: орындау мерзімі — 5 жұмыс күні, алдын ала төлем — 50 %',
    savePdf: 'PDF сақтау',
    copyWhatsApp: 'WhatsApp үшін көшіру',
    newEstimate: 'Жаңа смета',
    manualCopy: 'Автоматты түрде көшіру мүмкін болмады. Мәтінді қолмен көшіріңіз:',
    pdfHint: 'Басып шығару терезесінде «PDF ретінде сақтау» тармағын таңдаңыз.',
    signature: 'Қолы',
    itemName: 'Позиция атауы',
    itemPlaceholder: 'Мысалы, кеңсе орындығы',
    remove: 'Жою',
    removeItem: 'Позицияны жою',
    confirmNew: 'Ағымдағы сметаны тазалап, жаңасын жасау керек пе?',
    unnamed: 'Атаусыз',
    unit: 'дана',
    copied: 'Көшірілді ✓'
  }
};

const subtotalOutput = document.querySelector('#subtotal');
const discountRow = document.querySelector('#discount-row');
const discountOutput = document.querySelector('#discount-amount');
const discountedRow = document.querySelector('#discounted-row');
const discountedOutput = document.querySelector('#discounted-subtotal');
const vatRow = document.querySelector('#vat-row');
const vatOutput = document.querySelector('#vat-amount');
const grandTotalOutput = document.querySelector('#grand-total');

function getSavedLanguage() {
  try {
    return localStorage.getItem('estimate-language') === 'kk' ? 'kk' : 'ru';
  } catch (error) {
    return 'ru';
  }
}

function t(key) {
  return translations[currentLanguage][key] ?? translations.ru[key] ?? key;
}

function getLocale() {
  return currentLanguage === 'kk' ? 'kk-KZ' : 'ru-RU';
}

function translateRoot(root) {
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
  root.querySelectorAll('[data-i18n-data-label]').forEach((element) => {
    element.dataset.label = t(element.dataset.i18nDataLabel);
  });
}

function applyLanguage(language, shouldSave = true) {
  currentLanguage = language === 'kk' ? 'kk' : 'ru';
  document.documentElement.lang = currentLanguage;
  document.title = t('documentTitle');
  translateRoot(document);
  translateRoot(rowTemplate.content);

  languageButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage));
  });

  if (copyStatus.textContent) copyStatus.textContent = t('copied');
  calculate();
  if (!manualCopy.hidden) manualCopyText.value = getEstimateText();

  if (shouldSave) {
    try {
      localStorage.setItem(languageStorageKey, currentLanguage);
    } catch (error) {
      // Переключение языка работает и без доступа к хранилищу.
    }
  }
}

function numberOrZero(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatMoney(value) {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return `${safeValue.toLocaleString(getLocale())} ${currencySelect.value}`;
}

function getTodayDetails(sequence = 1) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return {
    number: `${year}${month}${day}-${String(sequence).padStart(2, '0')}`,
    date: today.toLocaleDateString(getLocale())
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
  if (!window.confirm(t('confirmNew'))) return;

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
  const lines = [`${t('estimate')} № ${estimateNumber.textContent} ${t('from')} ${estimateDate.textContent}`, ''];

  itemsBody.querySelectorAll('.item-row').forEach((row) => {
    const name = row.querySelector('.item-name').value.trim() || t('unnamed');
    const quantity = numberOrZero(row.querySelector('.item-quantity').value);
    const price = numberOrZero(row.querySelector('.item-price').value);
    lines.push(`• ${name} — ${quantity.toLocaleString(getLocale())} ${t('unit')} × ${formatMoney(price)} = ${formatMoney(quantity * price)}`);
  });

  const discountPercent = numberOrZero(discountInput.value);
  const vatPercent = numberOrZero(vatInput.value);
  if (discountPercent > 0) lines.push(`${t('discount')} ${discountPercent.toLocaleString(getLocale())}%: −${discountOutput.textContent}`);
  if (vatPercent > 0) lines.push(`${t('vat')} ${vatPercent.toLocaleString(getLocale())}%: ${vatOutput.textContent}`);
  lines.push('', `${t('totalDue')}: ${grandTotalOutput.textContent}`);

  return lines.join('\n');
}

function showCopiedStatus() {
  window.clearTimeout(copyStatusTimer);
  copyStatus.textContent = t('copied');
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
languageButtons.forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.language));
});

if (!loadDraft()) {
  setDocumentDetails();
  addRow({}, false);
  saveDraft();
}

applyLanguage(currentLanguage, false);
