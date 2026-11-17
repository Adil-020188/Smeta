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
const estimateTitleInput = document.querySelector('#estimate-title');
const customerInput = document.querySelector('#customer-name');
const printEstimateTitle = document.querySelector('#print-estimate-title');
const printCustomer = document.querySelector('#print-customer');
const historyList = document.querySelector('#history-list');
const historyEmpty = document.querySelector('#history-empty');
const clearHistoryButton = document.querySelector('#clear-history');
const languageButtons = [...document.querySelectorAll('.language-button')];

const storageKey = 'estimate-draft-v1';
const languageStorageKey = 'estimate-language';
const historyStorageKey = 'estimate-history-v1';
let copyStatusTimer;
let currentLanguage = getSavedLanguage();
let currentEstimateId = '';
let estimateHistory = [];
let excludeCurrentFromHistory = false;

const translations = {
  ru: {
    documentTitle: 'Смета за 5 минут',
    languageChoice: 'Выбор языка',
    eyebrow: 'Быстрый расчёт',
    pageTitle: 'Смета за 5 минут',
    intro: 'Составьте аккуратную смету, рассчитайте итог и отправьте клиенту — всё в одном окне.',
    autosave: 'Черновик сохраняется автоматически',
    estimateName: 'Название сметы',
    estimateNamePlaceholder: 'Например, ремонт офиса',
    customerData: 'Данные заказчика',
    customerPlaceholder: 'Имя или название компании',
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
    copied: 'Скопировано ✓',
    savedEstimates: 'Сохранённые сметы',
    estimateHistory: 'История смет',
    historyDescription: 'Откройте любую смету, чтобы посмотреть или продолжить редактирование.',
    clearHistory: 'Очистить историю',
    historyEmpty: 'Сохранённых смет пока нет.',
    currentEstimate: 'Открыта сейчас',
    openEstimate: 'Открыть',
    deleteEstimate: 'Удалить',
    historyItems: 'поз.',
    noCustomer: 'Заказчик не указан',
    confirmDelete: 'Удалить смету',
    confirmClearHistory: 'Удалить всю историю смет? Это действие нельзя отменить.'
  },
  kk: {
    documentTitle: '5 минутта смета',
    languageChoice: 'Тілді таңдау',
    eyebrow: 'Жылдам есеп',
    pageTitle: '5 минутта смета',
    intro: 'Ұқыпты смета жасаңыз, қорытындыны есептеп, клиентке жіберіңіз — бәрі бір терезеде.',
    autosave: 'Нобай автоматты түрде сақталады',
    estimateName: 'Смета атауы',
    estimateNamePlaceholder: 'Мысалы, кеңсені жөндеу',
    customerData: 'Тапсырыс беруші туралы мәлімет',
    customerPlaceholder: 'Аты немесе компания атауы',
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
    copied: 'Көшірілді ✓',
    savedEstimates: 'Сақталған сметалар',
    estimateHistory: 'Сметалар тарихы',
    historyDescription: 'Көру немесе өңдеуді жалғастыру үшін кез келген сметаны ашыңыз.',
    clearHistory: 'Тарихты тазарту',
    historyEmpty: 'Сақталған сметалар әзірге жоқ.',
    currentEstimate: 'Қазір ашық',
    openEstimate: 'Ашу',
    deleteEstimate: 'Жою',
    historyItems: 'позиция',
    noCustomer: 'Тапсырыс беруші көрсетілмеген',
    confirmDelete: 'Сметаны жою',
    confirmClearHistory: 'Сметалар тарихын толығымен жою керек пе? Бұл әрекетті болдырмау мүмкін емес.'
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
  updatePrintDetails();
  renderHistory();
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

  return { subtotal, discountAmount, discountedSubtotal, vatAmount, grandTotal };
}

function createEstimateId() {
  return `estimate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function updatePrintDetails() {
  printEstimateTitle.textContent = estimateTitleInput.value.trim();
  printCustomer.textContent = customerInput.value.trim() || '_______________________________________________';
}

function loadHistory() {
  try {
    const savedHistory = JSON.parse(localStorage.getItem(historyStorageKey));
    if (!Array.isArray(savedHistory)) return [];
    const usedIds = new Set();
    return savedHistory
      .filter((estimate) => estimate && typeof estimate === 'object' && Array.isArray(estimate.items))
      .map((estimate) => {
        let id = typeof estimate.id === 'string' && estimate.id ? estimate.id : createEstimateId();
        if (usedIds.has(id)) id = createEstimateId();
        usedIds.add(id);
        return {
          ...estimate,
          id,
          items: estimate.items.filter((item) => item && typeof item === 'object'),
          grandTotal: Number.isFinite(Number(estimate.grandTotal)) ? Number(estimate.grandTotal) : 0
        };
      });
  } catch (error) {
    return [];
  }
}

function persistHistory() {
  try {
    localStorage.setItem(historyStorageKey, JSON.stringify(estimateHistory));
  } catch (error) {
    // Текущий черновик продолжает работать, даже если история недоступна.
  }
}

function hasMeaningfulContent(draft) {
  return Boolean(
    draft.title.trim()
    || draft.customer.trim()
    || draft.comment.trim()
    || numberOrZero(draft.discount)
    || numberOrZero(draft.vat)
    || draft.items.some((item) => item.name.trim() || numberOrZero(item.price))
  );
}

function getDraft() {
  const totals = calculate();
  return {
    id: currentEstimateId,
    title: estimateTitleInput.value,
    customer: customerInput.value,
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
    comment: commentInput.value,
    grandTotal: totals.grandTotal,
    historyExcluded: excludeCurrentFromHistory
  };
}

function saveCurrentDraftOnly(draft = getDraft()) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch (error) {
    // Расчёты продолжают работать, даже если хранилище браузера недоступно.
  }
}

function upsertHistory(draft) {
  if (draft.historyExcluded) return;
  const existingIndex = estimateHistory.findIndex((estimate) => estimate.id === draft.id);
  if (existingIndex < 0 && !hasMeaningfulContent(draft)) return;

  const historyEntry = {
    ...draft,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    estimateHistory[existingIndex] = historyEntry;
  } else {
    estimateHistory.push(historyEntry);
  }
  persistHistory();
  renderHistory();
}

function saveDraft(markAsChanged = true) {
  if (markAsChanged) excludeCurrentFromHistory = false;
  updatePrintDetails();
  const draft = getDraft();
  saveCurrentDraftOnly(draft);
  upsertHistory(draft);
}

function applyEstimateState(savedEstimate) {
  currentEstimateId = savedEstimate.id || createEstimateId();
  excludeCurrentFromHistory = Boolean(savedEstimate.historyExcluded);
  estimateTitleInput.value = savedEstimate.title ?? '';
  customerInput.value = savedEstimate.customer ?? '';
  setDocumentDetails({
    number: savedEstimate.number || getTodayDetails().number,
    date: savedEstimate.date || getTodayDetails().date
  });
  discountInput.value = savedEstimate.discount ?? 0;
  vatInput.value = savedEstimate.vat ?? 0;
  if ([...currencySelect.options].some((option) => option.value === savedEstimate.currency)) {
    currencySelect.value = savedEstimate.currency;
  } else {
    currencySelect.selectedIndex = 0;
  }
  commentInput.value = savedEstimate.comment ?? '';
  itemsBody.replaceChildren();
  savedEstimate.items.forEach((item) => addRow(item || {}, false));
  if (!savedEstimate.items.length) addRow({}, false);
  calculate();
  resizeComment();
  updatePrintDetails();
}

function loadDraft() {
  try {
    const savedDraft = JSON.parse(localStorage.getItem(storageKey));
    if (!savedDraft || !Array.isArray(savedDraft.items)) return false;
    applyEstimateState(savedDraft);
    return true;
  } catch (error) {
    return false;
  }
}

function getHistoryTitle(estimate) {
  return String(estimate.title || '').trim() || `${t('estimate')} № ${estimate.number || ''}`.trim();
}

function formatStoredMoney(value, currency) {
  const safeValue = Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
  return `${safeValue.toLocaleString(getLocale())} ${currency || '₸'}`;
}

function renderHistory() {
  if (!historyList || !historyEmpty) return;

  historyList.replaceChildren();
  const sortedHistory = [...estimateHistory].sort((first, second) => {
    return String(second.updatedAt || '').localeCompare(String(first.updatedAt || ''));
  });

  sortedHistory.forEach((estimate) => {
    const item = document.createElement('article');
    item.className = 'history-item';
    if (estimate.id === currentEstimateId) item.classList.add('is-current');

    const content = document.createElement('div');
    const titleRow = document.createElement('div');
    titleRow.className = 'history-title-row';

    const title = document.createElement('h3');
    title.textContent = getHistoryTitle(estimate);
    titleRow.append(title);

    if (estimate.id === currentEstimateId) {
      const currentBadge = document.createElement('span');
      currentBadge.className = 'history-current-badge';
      currentBadge.textContent = t('currentEstimate');
      titleRow.append(currentBadge);
    }

    const meta = document.createElement('p');
    meta.className = 'history-meta';
    meta.textContent = `№ ${estimate.number || '—'} · ${estimate.date || '—'} · ${String(estimate.customer || '').trim() || t('noCustomer')}`;

    const stats = document.createElement('p');
    stats.className = 'history-stats';
    const itemCount = estimate.items.filter((position) => {
      return position && (String(position.name || '').trim() || numberOrZero(position.price));
    }).length;
    stats.textContent = `${itemCount} ${t('historyItems')} · ${formatStoredMoney(estimate.grandTotal, estimate.currency)}`;

    content.append(titleRow, meta, stats);

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const openButton = document.createElement('button');
    openButton.className = 'button button-secondary';
    openButton.type = 'button';
    openButton.dataset.historyAction = 'open';
    openButton.dataset.estimateId = estimate.id;
    openButton.textContent = t('openEstimate');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'button button-secondary history-delete';
    deleteButton.type = 'button';
    deleteButton.dataset.historyAction = 'delete';
    deleteButton.dataset.estimateId = estimate.id;
    deleteButton.textContent = t('deleteEstimate');

    actions.append(openButton, deleteButton);
    item.append(content, actions);
    historyList.append(item);
  });

  historyEmpty.hidden = sortedHistory.length > 0;
  clearHistoryButton.disabled = sortedHistory.length === 0;
}

function openStoredEstimate(estimateId) {
  const savedEstimate = estimateHistory.find((estimate) => estimate.id === estimateId);
  if (!savedEstimate) return;

  applyEstimateState(savedEstimate);
  excludeCurrentFromHistory = false;
  saveCurrentDraftOnly(getDraft());
  renderHistory();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector('.card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function clearEditor(details) {
  currentEstimateId = createEstimateId();
  excludeCurrentFromHistory = false;
  estimateTitleInput.value = '';
  customerInput.value = '';
  itemsBody.replaceChildren();
  discountInput.value = 0;
  vatInput.value = 0;
  currencySelect.selectedIndex = 0;
  commentInput.value = '';
  manualCopy.hidden = true;
  copyStatus.textContent = '';
  setDocumentDetails(details);
  addRow({}, false);
  calculate();
  resizeComment();
  updatePrintDetails();
}

function deleteStoredEstimate(estimateId) {
  const savedEstimate = estimateHistory.find((estimate) => estimate.id === estimateId);
  if (!savedEstimate) return;
  if (!window.confirm(`${t('confirmDelete')} «${getHistoryTitle(savedEstimate)}»?`)) return;

  estimateHistory = estimateHistory.filter((estimate) => estimate.id !== estimateId);
  persistHistory();

  if (estimateId === currentEstimateId) {
    clearEditor(getNextEstimateDetails());
    saveDraft(false);
  } else {
    renderHistory();
  }
}

function clearEstimateHistory() {
  if (!estimateHistory.length || !window.confirm(t('confirmClearHistory'))) return;

  estimateHistory = [];
  currentEstimateId = createEstimateId();
  excludeCurrentFromHistory = true;
  persistHistory();
  saveCurrentDraftOnly(getDraft());
  renderHistory();
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
[estimateTitleInput, customerInput].forEach((input) => {
  input.addEventListener('input', saveDraft);
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
  clearEditor(nextDetails);
  saveDraft(false);
  estimateTitleInput.focus();
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
historyList.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-history-action]');
  if (!actionButton) return;

  if (actionButton.dataset.historyAction === 'open') {
    openStoredEstimate(actionButton.dataset.estimateId);
  }
  if (actionButton.dataset.historyAction === 'delete') {
    deleteStoredEstimate(actionButton.dataset.estimateId);
  }
});
clearHistoryButton.addEventListener('click', clearEstimateHistory);

estimateHistory = loadHistory();
currentEstimateId = createEstimateId();
if (!loadDraft()) {
  setDocumentDetails();
  addRow({}, false);
  saveDraft(false);
}

applyLanguage(currentLanguage, false);
saveDraft(false);
