'use strict';
  
//------------------------- GLOBAL VARIABLES ------------------------- 
var table, prevStatus = 'Posted', 
  formTable, accessType,
  prevAmount,
  accounts, totalDebitAmount, totalCreditAmount, 
  oldTotalDebitAmount, oldTotalCreditAmount, oldAccounts,
  currentCandidate;

//------------------------- FORM ELEMENTS -------------------------
const elements = {
  'uuid': document.getElementById('uuid'),
  'date': document.getElementById('date'),
  'debit_account': document.getElementById('debit_account'),
  'credit_account': document.getElementById('credit_account'),
  'explanation': document.getElementById('explanation'),
  'status': document.getElementById('status'),
  'debit_accountError': createError('debit_accountError'),
  'credit_accountError': createError('credit_accountError')
};
// Reset modal form
const resetModalForm = () => {
  document.getElementById('errorMessage')?.remove();
  document.querySelector('[aria-labelledby="select2-debit_account-container"]').classList.remove('is-invalid');
  elements.debit_account.classList.remove('is-invalid');
  elements.debit_accountError.remove();
  document.querySelector('[aria-labelledby="select2-credit_account-container"]').classList.remove('is-invalid');
  elements.credit_account.classList.remove('is-invalid');
  elements.credit_accountError.remove();
  elements.uuid.value = elements.explanation.value = elements.status.value = "";
  elements.status.checked = true;
  elements.date.parentElement.classList.remove('d-none');
  document.querySelectorAll('[type="submit"]').forEach((submit) => {
    submit.removeAttribute('disabled');
  });
};

//------------------------- LOAD OPTIONS -------------------------
const loadOptions = ({select, url, data, placeholder, language, callback, template}) => {
  if (data) {
    $('#'+select).select2({
      data: data,  
      placeholder: placeholder, 
      language: { noResults: () => language,},
    });
  } else {
    $.ajax({
      url: url,
      type: 'get',
      dataType: "json"
    }).done(function (data) {
      $('#'+select).select2({
        data: callback ? callback(data) : data,
        placeholder: data.length ? placeholder.split('|')[0] : placeholder.split('|')[1],
        language: { noResults: () => language,},
        templateResult: template,
      });
    }).fail(function ({ responseJSON }) {
      document.getElementById('toast-container')?.remove();
      toastr.error(responseJSON.detail);
    });
  }
};

//------------------------- FORM MODAL FOR ADJUSTING ENTRY -------------------------
// Append account titles
const appendAccountTitles = (accountTitles) => {
  const accountTypes = ['Assets','Liabilities','Equity','Revenues','Expenses','Contra Assets'];
  let prevFirstCode = 0, debitOptgroups = '', creditOptgroups = '';
  for (const accountTitle of accountTitles) {
    const firstCode = parseInt(accountTitle.id.slice(37,38));
    const last2Codes = accountTitle.id.slice(38,40);
    const accountNumber = parseInt(accountTitle.id.slice(37,40));
    if ( firstCode > prevFirstCode ) {
      if ( firstCode != 4 && firstCode != 6 ) 
        debitOptgroups += `<optgroup label="${accountTypes[firstCode-1]}">`;
      if ( firstCode != 5 )
        creditOptgroups += `<optgroup label="${accountTypes[firstCode-1]}">`;
    }
    if ( (accountNumber >= 101 && accountNumber <= 299) || accountNumber == 399 ) {
      debitOptgroups += `<option value="${accountTitle.id}&Debit">${accountTitle.text}</option>`;
      creditOptgroups +=  `<option value="${accountTitle.id}&Credit">${accountTitle.text}</option>`;
    } else if ( accountNumber == 302 || (accountNumber >= 501 && accountNumber <= 599) ) {
      debitOptgroups += `<option value="${accountTitle.id}&Debit">${accountTitle.text}</option>`;
    } else {
      creditOptgroups += `<option value="${accountTitle.id}&Credit">${accountTitle.text}</option>`;
    }
    if ( last2Codes == '99' ) {
      debitOptgroups += `</optgroup>`;
      creditOptgroups += `</optgroup>`;
    }
    prevFirstCode = firstCode;
  }
  elements.debit_account.insertAdjacentHTML('afterbegin', debitOptgroups);
  elements.credit_account.insertAdjacentHTML('afterbegin', creditOptgroups);
};

// Load form table
const loadFormTable = () => {
  accounts = {}, totalDebitAmount = totalCreditAmount = 0;
  if ( formTable ) formTable.clear().draw().destroy(); 
  formTable = $('#form_table').DataTable({
    //"scrollY": "40px", 
    //"scrollX": true,
    "searching": false,
    "order": [],
    "info": false,
    "paging": false,
    "language": {
      "emptyTable": "Please enter debit and the corresponding credit accounts."
    },
    "autoWidth": false,
    "columns": [
      // account title
      { 
        'name': 'account_title',
        'orderable': false, 
        "width": "30%",
      },
      // P.R.
      { 
        'name': 'pr',
        'orderable': false, 
        "width": "10%",
      },
      // debit 
      { 
        'name': 'debit',
        'orderable': false, 
        "width": "25%",
      },
      // credit
      { 
        'name': 'credit',
        'orderable': false, 
        "width": "25%",
      },
      // action
      { 
        'name': 'action',
        'orderable': false, 
        "width": "10%",
        "class": 'text-center',
      },
    ],
  });
};
// Add account
const addAccount = (accountTitle, pr, isDebit, accountId, value='') => {
  if ( accounts.hasOwnProperty(accountId) ) return;
  accounts[accountId] = { hasBlank: true };
  const row = formTable.row.add([
    // Account title
    accountTitle,
    // P.R.
    pr,
    // Debit
    (isDebit) ? `<input type="text" class="form-control form-control-sm" value="${value}"
      onfocus="setPrevAmount(parseFloat(this.value))" 
      oninput="computeTotalDebitOrCredit(this, ${isDebit}, '${accountId}');" 
      autocomplete="off" />` : null,
    // Credit
    (!isDebit) ? `<input type="text" class="form-control form-control-sm" value="${value}"
      onfocus="setPrevAmount(parseFloat(this.value))" 
      oninput="computeTotalDebitOrCredit(this, ${isDebit}, '${accountId}');" 
      autocomplete="off" />` : null,
    // Action
    `<button type="button" class="btn btn-sm btn-danger" id="${accountId.split('&')[0]}" 
      onclick="removeAccount(this.parentElement, ${isDebit}, '${accountId}');">
      <i class="fas fa-trash-alt" style=""></i>
    </button>` 
  ]).draw(false);
  // For edit
  if ( value ) {
    prevAmount = 0;
    computeTotalDebitOrCredit(
      ($($(row.node()).children()[(isDebit?2:3)]).children()[0]),
      isDebit,
      accountId
    );
  } else {
    document.getElementById('errorMessage')?.remove();
  }
};
// Remove account
const removeAccount = (action, isDebit, accountId) => {
  const row = action.parentElement;
  if ( isDebit ) {
    const debit = row.children[2].firstElementChild.value;
    totalDebitAmount -= isNaN(parseFloat(debit)) ? 0 : parseFloat(debit);
  } else {
    const credit = row.children[3].firstElementChild.value;
    totalCreditAmount -= isNaN(parseFloat(credit)) ? 0 : parseFloat(credit);
  } 
  formTable.row(row).remove().draw();
  delete accounts[accountId];
  if ( isNoBlank() ) {
    document.querySelector('[aria-labelledby="select2-debit_account-container"]').classList.remove('is-invalid');
    elements.debit_accountError.remove();
    document.querySelector('[aria-labelledby="select2-credit_account-container"]').classList.remove('is-invalid');
    elements.credit_accountError.remove();
    document.getElementById('errorMessage')?.remove();
  }
};
// Set previous amount
const setPrevAmount = (amount) => {
  if ( isNaN(amount) ) prevAmount = 0;
  else prevAmount = amount;
};
// Compute total debit/credit
const computeTotalDebitOrCredit = (debitOrCredit, isDebit, id) => {
  let amount = debitOrCredit.value;
  if ( (/^[1-9]{1,1}\d{0,12}(\.\d{0,2})?$/.test(amount)) ) {
    amount = parseFloat(amount);
    if ( amount > prevAmount ) {
      if ( isDebit ) totalDebitAmount += amount - prevAmount;
      else totalCreditAmount += amount - prevAmount;
    } else if ( amount < prevAmount ) {
      if ( isDebit ) totalDebitAmount -= prevAmount - amount;
      else totalCreditAmount -= prevAmount - amount; 
    }
    prevAmount = amount;
    accounts[id].hasBlank = false;
    if ( isNoBlank() ) {
      document.querySelector('[aria-labelledby="select2-debit_account-container"]').classList.remove('is-invalid');
      elements.debit_accountError.remove();
      document.querySelector('[aria-labelledby="select2-credit_account-container"]').classList.remove('is-invalid');
      elements.credit_accountError.remove();
      document.getElementById('errorMessage')?.remove();
    }
  } else if ( amount != "" ) {
    debitOrCredit.value = prevAmount == 0 ? "" : prevAmount;
  } else {
    if ( isDebit ) totalDebitAmount -= prevAmount;
    else totalCreditAmount -= prevAmount;
    prevAmount = 0;
    accounts[id].hasBlank = true;
  }
};
// Check if there`s no blank field
const isNoBlank = () => {
  let noBlank = true;
  for (const account in accounts) { if ( accounts[account].hasBlank ) { noBlank = false; break; } }
  return noBlank;
};

//------------------------- ACCOUNTING PERIOD ------------------------- 
const yearEstablished = 2015,
  dateNow = new Date();
var currentPeriod, lastDate,
  currentMonth = dateNow.getMonth(), 
  currentYear = dateNow.getFullYear();
// Accounting period - month
const apMonths = [
  { id: 0, text: 'January' },
  { id: 1, text: 'February' },
  { id: 2, text: 'March' },
  { id: 3, text: 'April' },
  { id: 4, text: 'May' },
  { id: 5, text: 'June' },
  { id: 6, text: 'July' },
  { id: 7, text: 'August' },
  { id: 8, text: 'September' },
  { id: 9, text: 'October' },
  { id: 10, text: 'November' },
  { id: 11, text: 'December' }
];
// Accounting period - year
const apYears = [];
// Get all accounting period - year 
const getAllAPYears = () => {
  for (let year = currentYear; year >= yearEstablished; year--) {
    apYears.push(year);
  }
};
// Set date range
const setDateRange = () => {
  currentPeriod = `${currentYear}-${currentMonth > 9 ? currentMonth : '0'+currentMonth }`;
  lastDate = new Date(currentYear, currentMonth, 0).getDate();
  elements.date.min = currentPeriod + '-' + lastDate;
  elements.date.max = elements.date.min;
  elements.date.value = elements.date.max;
};
// Validate access date
const validateAccessDate = () => {
  return (
      dateNow.getFullYear() > currentYear
    || dateNow.getMonth() > currentMonth-1
    || (
        dateNow.getFullYear() == currentYear 
      && dateNow.getMonth() == currentMonth-1
      && dateNow.getDate() == lastDate 
    ) 
  );
};

//------------------------- ORIGINATING ENTRIES ------------------------- 
// Load originating_entry
const loadEntries = () => {
  $('#originating_entry').empty().append('<option></option>');
  loadOptions({
    select: "originating_entry", 
    url: `../accountant/journal_entries?period=${currentPeriod}&adjustable=True`,
    language: 'No available entries',
    placeholder: 'Select originating entry|No available entries',
    callback: appendOriginatingEntries,
  });
};

// Append Originating_entries
const appendOriginatingEntries = (data) => {
  let prevEntry, prevId, entries = '', sameCounter = 1;
  data.forEach((item, i) => {
    if ( item.text == prevEntry ) {
      sameCounter++;
    } else if ( prevEntry && item.text != prevEntry ) {
      entries += `<option value="${prevId}">${prevEntry}${(sameCounter > 1 ? ' ('+ sameCounter +')' : '')}</option>`;
      sameCounter = 1;
    }
    if ( i+1 == data.length ) {
      entries += `<option value="${item.id}">${item.text}${(sameCounter > 1 ? ' ('+ sameCounter +')' : '')}</option>`;
    }
    prevEntry = item.text;
    prevId = item.id;
  });
  document.getElementById('originating_entry').insertAdjacentHTML('afterbegin', entries);
};

//------------------------- LOAD TABLE W/ INITIALIZATION -------------------------
const loadTable = (status) => {
  if ( status ) prevStatus = status;
  else status = prevStatus;

  if ( table ) table.destroy();
    
  table = $('#table').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
      "url": "../accountant/adjustment/datatable",
      "method": "post",
      "contentType": "application/json; charset=UTF-8;",
      "dataType": "json",
      "data": function ( data ) {
        data['period'] = currentPeriod;
        data['status'] = status;
        return JSON.stringify(data);
      },
      "dataSrc": function ( response ) {
        const entryCounter = response.data.length;
        const entries = [];
        let prevEntry, entry;
        response.data.forEach(function (data, i) {        
          if ( data.entry != prevEntry ) {
            let status = data.status;
            status = 
              `<div class="badge ${
                  status == 'Posted' 
                  ? 'badge-primary' 
                  : (
                      status == 'Not Posted' 
                      ? 'badge-warning'
                      : 'badge-dark'
                    )
                } p-2 w-100">  
                <i class="fas fa-check mr-1" aria-hidden="true"></i>
                ${status}  
              </div>`;
            const id = data.entry;
            const action = 
              `<div class="text-center dropdown">
                <a class="btn btn-sm btn-default" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fas fa-ellipsis-v"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right p-0" aria-labelledby="dropdownMenuLink">
                  <a class="dropdown-item " onclick="editData('${id}', 1);"><i class="fas fa-list mr-1" style="width: 2rem;"></i><span>View</span></a>
                  <a class="dropdown-item " onclick="editData('${id}', 0);"><i class="fas fa-edit mr-1" style="width: 2rem;"></i><span>Edit</span></a>
                  ${
                    data.status != 'Posted'
                    ? '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + id + '\', 3);"><i class="fas fa-undo mr-1" style="width: 2rem;"></i><span>Post</span></a>'
                    : ''
                  }
                  <div class="dropdown-divider m-0"></div>
                  ${
                    data.status == 'Posted'
                    ? '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + id + '\', 2);"><i class="fas fa-undo mr-1" style="width: 2rem;"></i><span>Unpost</span></a>'
                    : data.status != 'Inactive' 
                      ? '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + id + '\', 0);"><i class="fas fa-trash-alt mr-1" style="width: 2rem;"></i><span>Deactivate</span></a>'
                      : '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + id + '\', 1);"><i class="fas fa-trash-restore-alt mr-1" style="width: 2rem;"></i><span>Activate</span></a>'
                  }
                </div>
              </div>`; 
            entry = {
              date: data.date.slice(-2),
              explanation: data.explanation,
              status: status,
              action: action
            };
            accounts = 
              `<div class="table-responsive">
                <table class="table table-borderless account-table">
                  <thead class="border-bottom">
                    <tr>
                      <th>Account Title</th>
                      <th>P.R.</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>`;
            totalDebitAmount = totalCreditAmount = 0;
          }
          accounts += 
            `<tr class="border-bottom">
              <td class="${data.debit == 0 ? 'pl-4' : ''}">${data.account_title}</td>
              <td>${data.pr}</td>
              <td>${data.debit == 0 ? "" : formatAmount(data.debit)}</td>
              <td>${data.credit == 0 ? "" : formatAmount(data.credit)}</td>
            </tr>`;
          totalDebitAmount += parseFloat(data.debit);
          totalCreditAmount += parseFloat(data.credit);
          if ( entryCounter == i+1 || (data.entry != response.data[i+1].entry ) ) {
            totalDebitAmount = totalDebitAmount.toString();
            totalCreditAmount = totalCreditAmount.toString();
            accounts += 
                  `</tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2"></td>
                      <td class="text-right">
                        <div>
                          <strong>${formatAmount(totalDebitAmount)}</strong>
                          <hr class="my-0" />
                          <hr class="mt-1 mb-0" />
                        </div>
                      </td>
                      <td class="text-right">
                        <div>
                          <strong>${formatAmount(totalCreditAmount)}</strong>
                          <hr class="my-0" />
                          <hr class="mt-1 mb-0" />
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>`; 
            entry['accounts'] = accounts;
            entries.push(entry);
          }
          prevEntry = data.entry;
        }); 
        return entries;
      }
    },
    "columns": [
      { 
        'data': 'date',
        'name': 'date',
        'width': 'auto',
      },
      { 
        'data': 'accounts',
        'name': 'accounts',
        'searchable': false,
        'orderable': false,
        'width': '75%',
      },
      { 
        'data': 'explanation',
        'name': 'explanation',
        'searchable': false,
        'orderable': false,
        'width': '25%',
      },
      { 
        'data': 'status',
        'name': 'status',
        'searchable': false,
        'orderable': false,
        'width': 'auto',
      },
      { 
        'data': 'action',
        'name': 'action',
        'searchable': false,
        'orderable': false,
        'width': 'auto',
      },
    ],
    "deferRender": true,    
    "responsive": true,
    "autoWidth": false,
    "ordering": true,
    "order": [[ 0, 'asc' ]],
    "lengthChange": true,
    "lengthMenu": [ 100 ],
    "searching": true,
    "info": true,
    "paging": true, 
    "language": {
      "zeroRecords": "No result found",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
      "emptyTable": "No entries available for the period.",
      "paginate": {
        "next": '<i class="fas fa-caret-right"></i>',
        "previous": '<i class="fas fa-caret-left"></i>',
      },
    },
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'pageLength',
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'csv',
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'excel',
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'pdf',
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'print',
        exportOptions: {
            columns: ':visible'
        },
        customize: function ( win ) {
          $(win.document.body)
            .css( 'font-size', '10pt' )
          $(win.document.body).find( 'table' )
            .addClass( 'compact' )
            .css( 'font-size', 'inherit' );
        }
      },
      'colvis',
    ],
  });
   $(`<button type="button" class="btn btn-secondary dropdown-toggle rounded-0" data-toggle="dropdown">Show by</button>
    <div class="dropdown-menu">
      <a class="dropdown-item ${status=='Posted'?'active':''}" onclick="loadTable('Posted');">Posted</a>
      <a class="dropdown-item ${status=='Not Posted'?'active':''}" onclick="loadTable('Not Posted');">Not Posted</a>
      <div class="dropdown-divider my-0"></div>
      <a class="dropdown-item ${status=='Inactive'?'active':''}" onclick="loadTable('Inactive');">Inactive</a>
    </div>
  `).insertBefore('.buttons-csv');
  table.buttons().container().prependTo('#table_filter').parent().css({'display':'flex', 'justify-content':'space-between'}); 
};

//------------------------- LOAD VIEW TABLE FOR journal/originating entry -------------------------
const loadViewTable = (entry, data) => {
  totalDebitAmount = totalCreditAmount = 0;
  $(`#${entry}`).DataTable({
    "searching": false,
    "order": [],
    "info": false,
    "paging": false,
    "autoWidth": false,
    'responsive': true,
    "columns": [
      // account title
      { 
        'data': (accessType == 1 ? 'aa':'ja') + '_account_title.account_title',
        'name': (accessType == 1 ? 'aa':'ja') + '_account_title.account_title',
        'orderable': false, 
        "width": "35%",
        'render': function ( data, type, row ) {
          const id = `${data}&${row.debit > 0 ? 'debit':'credit'}`;
          return ( 
            ( accessType == 1 || accessType == 4 )
            ? `<div class="${row.credit > 0 ? 'pl-4' : ''}">${data}</div>`
            : `<div class="icheck-primary d-inline ${row.credit > 0 ? 'pl-4' : ''}">
                <input type="checkbox" id="${id}" value="${row.debit>0?row.debit:row.credit}" onclick="setCandidate(this);">
                <label for="${id}">${data}</label>
              </div>`
          );
        }
      },
       // account_type
      { 
        'data': (accessType == 1 ? 'aa':'ja') + '_account_title.ca_account_type.name',
        'name': (accessType == 1 ? 'aa':'ja') + '_account_title.ca_account_type.name',
        'orderable': false, 
        "width": "15%",
      },
      // P.R.
      { 
        'data': 'pr',
        'name': 'pr',
        'orderable': false, 
        "width": "10%",
      },
      // debit 
      { 
        'data': 'debit',
        'name': 'debit',
        'orderable': false, 
        "width": "20%",
        'class': 'text-right',
        'render': function ( data, type, row ) {
          totalDebitAmount += parseFloat(data);
          return data == 0 ? "" : formatAmount(data);
        }
      },
      // credit
      { 
        'data': 'credit',
        'name': 'credit',
        'orderable': false, 
        "width": "20%",
        'class': 'text-right',
        'render': function ( data, type, row ) {
          totalCreditAmount += parseFloat(data);
          return data == 0 ? "" : formatAmount(data);
        }
      },
    ],
    'data': data,
  });
};

// Set candidate
const setCandidate = (newCandidate) => {
  if ( newCandidate.checked && newCandidate.id != currentCandidate ) {
    if ( currentCandidate != undefined ) {
      document.getElementById(currentCandidate).checked = false;
    }
    return currentCandidate = newCandidate.id;
  } else {
    return currentCandidate = undefined;
  }  
};

//------------------------- FOR EDIT/VIEW CALLBACK -------------------------
// Callback for edit / view process result
const forEditOrViewCallback = (data) => {
  let entry;
  // For adjusted entry w/ originating entry
  if ( data.ae_journal_entry != undefined ) { 
    entry = data.ae_journal_entry;
    delete data.ae_journal_entry;
    // Edit option
    if ( accessType == 0 ) accessType = 3;
    // View option
    else accessType = 4;
  // For adjusted entry
  } else {
    entry = data;
  }
  
  // For viewing
  if ( accessType > 0 ) {
    const viewModal = `
      <div class="modal fade" id="view_modal">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title"><i class="fas fa-sitemap mr-3 text-secondary"></i>Adjusting Entry</h4>
              <button type="button" class="btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i class="fas fa-times"></i></span>
              </button>
            </div>
            <div class="modal-body">
              <div class="text-muted mb-2">Details about ${accessType == 1 ? 'adjusting entry':'originating entry'}.</div>
              <hr />
              ${ // DATE & STATUS
                displayDetails({section: 1, detail: entry}) 
              }
              
              ${
                accessType == 1
                // ADJUSTED & POSTED & UPDATED
                ? displayDetails({section: 2, detail: entry})
                : // JOURNALIZED & POSTED & UPDATED
                  `<div class="row">
                    <div class="col-lg-6">
                      <div class="row">
                        <div class="col-4">
                          <strong>Journal. At:</strong>
                        </div>
                        <div class="col-auto">${formatDate(entry.journalized_at)}</div>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="row">
                        <div class="col-4">
                          <strong>Journal. By:</strong>
                        </div>
                        <div class="col-auto">${formatName(entry.je_journalized_by)}</div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="row">
                        <div class="col-4">
                          <strong>Posted At:</strong>
                        </div>
                        <div class="col-auto">${formatDate(entry.posted_at)}</div>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="row">
                        <div class="col-4">
                          <strong>Posted By:</strong>
                        </div>
                        <div class="col-auto">${formatName(entry.je_posted_by)}</div>
                      </div>
                    </div>
                  </div>
                  ${ // UPDATE
                    entry.je_updated_by != undefined
                    ? `<div class="row">
                        <div class="col-lg-6">
                          <div class="row">
                            <div class="col-4">
                              <strong>Updated At:</strong>
                            </div>
                            <div class="col-auto">${formatDate(entry.updated_at)}</div>
                          </div>
                        </div>
                        <div class="col-lg-6">
                          <div class="row">
                            <div class="col-4">
                              <strong>Updated By:</strong>
                            </div>
                            <div class="col-auto">${formatName(entry.je_updated_by)}</div>
                          </div>
                        </div>
                      </div>`
                    : ``
                  }`
              }

              ${ // EXPLANATION
                displayDetails({section: 3, detail: entry}) 
              }

              ${ // ADJUSTABLE
                accessType == 1
                ? ``
                : displayDetails({section: 4, detail: entry}) 
              }
              
              ${ // TABLE
                displayDetails({section: 5, detail: entry, nthTable: 1})
              }
             
              ${ // NOTE
                (accessType == 2 || accessType == 3)
                ? `<div class="row">
                    <div class="col-12">
                      <div class="callout callout-info">
                        <h5><i class="fas fa-info"></i> Note (optional):</h5>
                        You may select an account above as candidate for the asset/liability method.
                      </div>
                    </div>
                  </div>`
                : ``
              }

              ${ // HR
                accessType == 1
                ? ``
                : `<hr />
                  <div class="text-info mt-3 mb-2"><strong>Adjusting Entry</strong></div>`
              }
              
              ${
                (accessType == 3 || accessType == 4)   
                ? `${ // DATE & STATUS
                    displayDetails({section: 1, detail: data})
                  }
                  ${ // ADJUSTED & POSTED & UPDATED
                    displayDetails({section: 2, detail: data})
                  }
                  ${ // EXPLANATION
                    displayDetails({section: 3, detail: data}) 
                  }`
                : ``
              }

              ${ // TABLE
                accessType == 4
                ? displayDetails({section: 5, detail: data, nthTable: 2})
                : ``
              }

            </div>
            <!-- /.modal-body -->
            <div class="modal-footer text-right">
              <button type="button" class="btn btn-sm btn-default mr-2" id="view_dismiss" data-dismiss="modal">Cancel</button>
              ${
                accessType == 2
                ? `<button type="submit" class="btn btn-sm btn-primary" form="form">Adjust<i class="fas fa-check ml-2"></i></button>`
                : (
                    accessType == 3
                    ? `<button type="submit" class="btn btn-sm btn-primary" form="form">Update<i class="fas fa-check ml-2"></i></button>`
                    : ``
                  )
              }
              <button type="button" class="d-none" id="view_toggle" data-toggle="modal" data-target="#view_modal" data-backdrop="static"></button>
            </div>
            <!-- /.modal-footer -->
          </div>
          <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
      </div>
      <!-- /.modal -->`;
      document.body.insertAdjacentHTML('beforeend', viewModal);
      $('#view_modal').on('show.bs.modal', function () {
        loadViewTable(entry.id, entry[`${accessType == 1 ? `ae_adjusted_accounts`:`je_journal_accounts`}`]);
        totalDebitAmount = (totalDebitAmount/2).toString();
        totalCreditAmount = (totalCreditAmount/2).toString();
        document.getElementById('totalDebitAmount-1').textContent = formatAmount(totalDebitAmount);
        document.getElementById('totalCreditAmount-1').textContent = formatAmount(totalCreditAmount);

        if ( accessType == 4 ) {
          accessType = 1;
          loadViewTable(data.id, data.ae_adjusted_accounts);
          totalDebitAmount = (totalDebitAmount/2).toString();
          totalCreditAmount = (totalCreditAmount/2).toString();
          document.getElementById('totalDebitAmount-2').textContent = formatAmount(totalDebitAmount);
          document.getElementById('totalCreditAmount-2').textContent = formatAmount(totalCreditAmount);
        }

        if ( accessType == 2 || accessType == 3 ) {
          document.querySelector('#view_modal .modal-body').insertAdjacentElement('beforeend', form);
          loadFormTable();
          if ( accessType == 3 ) {
            populateEntry(data);
            oldTotalDebitAmount = totalDebitAmount;
            oldTotalCreditAmount = totalCreditAmount;
          }
        }
      });
      $('#view_modal').on('hidden.bs.modal', function () { 
        if ( accessType == 2 || accessType == 3 ) {
          document.querySelector('#form_modal .modal-body').insertAdjacentElement('beforeend', form);
          resetModalForm();
          currentCandidate = undefined;
        }
        this.remove(); 
        accessType = 0;
      });
      document.getElementById('view_toggle').click();
  // For editing
  } else {
    const adjustedEntryDetail = 
      `<div id="adjustedEntryDetail">
        <div class="text-muted mb-2">Details about adjusting entry.</div>
        <hr />
        ${ // DATE & STATUS
          displayDetails({section: 1, detail: data}) 
        }
        ${ // ADJUSTED & POSTED & UPDATED
          displayDetails({section: 2, detail: data})
        }
        ${ // EXPLANATION
          displayDetails({section: 3, detail: data}) 
        }
      </div>`;
    document.querySelector('#form_modal .modal-body').insertAdjacentHTML('afterbegin', adjustedEntryDetail);
    document.getElementById('form_toggle').click();
    populateEntry(data);
  }
};

// Display details
const displayDetails = ({section, detail, nthTable}) => {
  if (section == 1) {
    // DATE & STATUS
    return (
      `<div class="row">
        <div class="col-4 col-lg-2">
          <strong>Date:</strong>
        </div>
        <div class="col-auto">${detail.date}</div>
      </div>
      <div class="row">
        <div class="col-4 col-lg-2">
          <strong>Status:</strong>
        </div>
        <div class="col-auto">${detail.status}</div>
      </div>`
    );
  } else if (section == 2) {
    // ADJUSTED
    return (
      `<div class="row">
        <div class="col-lg-6">
          <div class="row">
            <div class="col-4">
              <strong>Adjusted At:</strong>
            </div>
            <div class="col-auto">${formatDate(detail.adjusted_at)}</div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="row">
            <div class="col-4">
              <strong>Adjusted By:</strong>
            </div>
            <div class="col-auto">${formatName(detail.ae_adjusted_by)}</div>
          </div>
        </div>
      </div>
      ${ // POSTED
        detail.ae_posted_by != undefined
        ? `<div class="row">
            <div class="col-lg-6">
              <div class="row">
                <div class="col-4">
                  <strong>Posted At:</strong>
                </div>
                <div class="col-auto">${formatDate(detail.posted_at)}</div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="row">
                <div class="col-4">
                  <strong>Posted By:</strong>
                </div>
                <div class="col-auto">${formatName(detail.ae_posted_by)}</div>
              </div>
            </div>
          </div>`
        : ``
      }
      ${ // UPDATE
        detail.ae_updated_by != undefined
        ? `<div class="row">
            <div class="col-lg-6">
              <div class="row">
                <div class="col-4">
                  <strong>Updated At:</strong>
                </div>
                <div class="col-auto">${formatDate(detail.updated_at)}</div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="row">
                <div class="col-4">
                  <strong>Updated By:</strong>
                </div>
                <div class="col-auto">${formatName(detail.ae_updated_by)}</div>
              </div>
            </div>
          </div>`
        : ``
      }`
    );
  } else if (section == 3) {
    // EXPLANATION
    return (
      detail.explanation != ""
      ? `<div class="row">
          <div class="col-4 col-lg-2">
            <strong>Explanation:</strong>
          </div>
          <div class="col-auto">${detail.explanation}</div>
        </div>`
      : ``
    );
  } else if (section == 4) {
    // ADJUSTABLE
    return (
      `<div class="row">
        <div class="col-4 col-lg-2">
          <strong>Adjustable:</strong>
        </div>
        <div class="col-auto">${detail.adjustable ? 'Yes':'No'}</div>
      </div>`
    );
  } else {
    // TABLE
    return (
      `<div class="text-info mt-3"><strong>Accounts</strong></div>
      <div class="row">
        <div class="col-auto table-responsive">
          <table id="${detail.id}" class="table table-bordered  nowrap ${accessType == 1 ? '' : detail.balance}" style="width: 100%;" >
            <thead>
            <tr>
              <th>Account Title</th>
              <th>Account Type</th>
              <th>P.R.</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right text-muted small">Total:</td>
                <td>
                  <div>
                    <strong id="totalDebitAmount-${nthTable}"></strong>
                    <hr class="my-0" />
                    <hr class="mt-1 mb-0" />
                  </div>
                </td>
                <td>
                  <div>
                    <strong id="totalCreditAmount-${nthTable}"></strong>
                    <hr class="my-0" />
                    <hr class="mt-1 mb-0" />
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->`
    );
  }
};

// Populate entry
const populateEntry = (data) => {
  elements.uuid.value = data.id;
  elements.date.value = data.date;
  elements.date.parentElement.classList.add('d-none');
  elements.explanation.value = data.explanation;
  elements.status.value = data.status;
  elements.status.checked = (data.status == 'Posted' ? true:false);
  oldAccounts = [];
  for (const account of data.ae_adjusted_accounts) {
    const isDebit = (account.debit > 0 ? true : false);
    const accountId = account.aa_account_title.chart_account_id + (isDebit ? '&Debit' : '&Credit');
    oldAccounts.push(accountId);
    addAccount(
      account.aa_account_title.account_title,
      account.pr, 
      isDebit, 
      accountId,
      (isDebit?account.debit:account.credit)
    );
  }
};

//------------------------- FOR NOT EDIT/VIEW CALLBACK -------------------------
// Callback for validation, creation, update, deactivation & activation process result
const forNotEditOrViewCallback = (data) => {
  let detail = data.detail, 
    element = data.element;
  // Display error for validation if column has constraint issue
  if ( element ) {
    elements[element].focus();
    detail = detail.replace(/_/g, ' ');
    displayError(elements[element], elements[element+'Error'], detail, data.closest);
  // Popup for creation, update, deactivation & activation
  } else if ( detail ) {
    loadTable();
    if ( detail.search(/(activate|posted)/i) == -1 ) {
      if ( accessType > 0 ) {
        loadEntries();
        document.getElementById('view_dismiss').click();
      } else {
        document.getElementById('form_dismiss').click();
      }
    }
    document.getElementById('toast-container')?.remove();
    toastr[data.type](detail);
  }
};

//------------------------- FINALLY CALLBACK -------------------------
const finallyCallback = () => {
  // Reset options & submit button to their default
  // For creation & update
  delete options.body;
  delete options.headers['Content-Type'];
  options['cache'] = 'no-cache';
};

//------------------------- READY FUNCTION ------------------------- 
$(function () {
  //------------------------- FORM ELEMENTS -------------------------
  // DEBIT ACCOUNT
  $('#debit_account').select2({
    placeholder: 'Select debit account',
    language: { noResults: () => 'No available debit accounts',},
  });
  // CREDIT ACCOUNT
  // Load debit_account & credit_account
  loadOptions({
    select: "credit_account", 
    url: `../accountant/chart_accounts`,
    placeholder: 'Select credit account',
    language: 'No available credit accounts',
    callback: appendAccountTitles,
  });

  // Handle select2 close event for debit & credit accounts
  for (const select of ['debit_account', 'credit_account']) {
    $(`#${select}`).on('select2:close', function() {
      // Remove error first if exist
      if ( this.classList.contains('is-invalid') ) {
        this.classList.remove('is-invalid');
        document.querySelector(`[aria-labelledby="select2-${select}-container"]`).classList.remove('is-invalid');
        elements[`${select}Error`].remove();
      } 
      const closest = '.' + this.parentElement.className;
      // Is account selectable
      if ( !isNoBlank() ) {
        document.querySelector(`[aria-labelledby="select2-${select}-container"]`).classList.add('is-invalid');
        displayError(this, elements[`${select}Error`], `Unable to add new account due to blank debit/credit field.`, closest);
      // Add adjusted account
      } else if ( this.value != "" ) {
        const accountTitle = $(this).find(':selected').text();
        const [accountId, pr, isDebit] = this.value.split('&');
        addAccount(accountTitle, pr, (isDebit=='Debit'?true:false), accountId+'&'+isDebit);
      }
      $(this).val(null).trigger("change");
    });
  }

  //------------------------- ACCOUNTING PERIOD ------------------------- 
  // Get all accounting period - year   
  getAllAPYears();
  // Load months & years
  loadOptions({
    select: "ap_month",
    data: apMonths,
    language: 'No available months'
  });
  loadOptions({
    select: "ap_year",
    data: apYears,
    language: 'No available years'
  });
  // Set month to their default values
  $('#ap_month').val(currentMonth++).trigger('change');
  // Set current_month & current_year to their new values
  $('#ap_month').on('change', function () { 
    currentMonth = 1 + parseInt(this.value);
    setDateRange();
    // Load table
    loadTable();
    loadEntries();
  });
  $('#ap_year').on('change', function () { 
    currentYear = this.value; 
    setDateRange();
    // Load table
    loadTable();
    loadEntries();
  });
  // Set year to their default values
  $('#ap_year').val(currentYear).trigger('change');

  //------------------------- ORIGINATING ENTRY -------------------------
  // Handles select event for originating_entry
  $('#originating_entry').on('select2:select', function () {
    accessType = 2;
    options['method'] = 'get';
    makeFetch(
      `../accountant/general_journal/${$(this).find(':selected').val()}`,
      options,
      forEditOrViewCallback
    );
    $(this).val(null).trigger('change');
  });
  $('#originating_entry').on('select2:opening', function (e) {
    if ( !validateAccessDate() ) {
      preventModalShow();
      return e.preventDefault();
    }
  });

  //------------------------- HANDLE SUBMIT EVENT -------------------------
  form.addEventListener(
    'submit',
    function (e) {
      document.querySelectorAll('[type="submit"]').forEach((submit) => {
        submit.setAttribute('disabled', 'true');
      });
      e.preventDefault();
      document.getElementById('errorMessage')?.remove();
      // Check if there are debit and their corresponding credit accounts
      if ( totalDebitAmount == 0 && totalCreditAmount == 0 ) {
        document.getElementById('dateTitleDiv').insertAdjacentHTML('beforebegin', 
          `<div class="form-group row mb-0" id="errorMessage">
            <div class="col">
              <div class="alert alert-danger alert-dismissible">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
                The debit and their corresponding credit accounts are required.
              </div>
            </div>
          </div>`);
          document.querySelectorAll('[type="submit"]').forEach((submit) => {
            submit.removeAttribute('disabled');
          });
      // Check if the total debit & credit amounts are equal
      } else if ( totalDebitAmount != totalCreditAmount ) {
        document.getElementById('dateTitleDiv').insertAdjacentHTML('beforebegin', 
          `<div class="form-group row mb-0" id="errorMessage">
            <div class="col">
              <div class="alert alert-danger alert-dismissible">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
                The total debit and total credit amounts are not equal.
              </div>
            </div>
          </div>`);
          document.querySelectorAll('[type="submit"]').forEach((submit) => {
            submit.removeAttribute('disabled');
          });
      // If no error, then submit
      } else {

        //------------------------- GET ROWS` DATA -------------------------
        const entry = {
          'date': elements.date.value,
          'explanation': elements.explanation.value,
          'status': (
            elements.status.checked 
            ? 'Posted' 
            : ( 
                elements.status.value != 'Inactive'
                ? 'Not Posted'
                : 'Inactive'
              )
          ),
          'new_accounts': [],
          'journal_entry': null
        };
       
        // For edit
        if ( elements.uuid.value != "" ) entry['updated_accounts'] = [];
        const rows = document.querySelectorAll('#form_table > tbody > tr');
        for (const row of rows) {
          const account = {};
          account['account_title'] = row.lastElementChild.firstElementChild.id;
          account['pr'] = row.children[1].textContent;
          try { 
            account['debit'] = row.children[2].firstElementChild.value;
            account['credit'] = 0;
          } catch { 
            account['debit'] = 0;
            account['credit'] = row.children[3].firstElementChild.value;
          }
          // For create
          if ( elements.uuid.value == "" ) entry.new_accounts.push(account);
          // For edit
          else {
            const accountId = account['account_title'] + (account['debit'] != 0 ? '&Debit' : '&Credit');
            const idx = oldAccounts.indexOf(accountId);
            if ( idx == -1 )
              entry.new_accounts.push(account);
            else {
              entry.updated_accounts.push(account); 
              oldAccounts.splice(idx, 1);
            }
          }
        }

        // For create w/ originating entry
        if ( accessType == 2 || accessType == 3 ) {
          const viewTable = document.querySelector('#view_modal table');
          entry['journal_entry'] = viewTable.id;
          entry['balance'] = viewTable.classList[3];
          if ( currentCandidate != undefined ) {
            if ( entry['balance'] == 0 ) {
              entry['balance'] = document.getElementById(currentCandidate).value;
            }
            if ( currentCandidate.split('&')[1] == 'debit' ) {
              if ( accessType == 3 ) {
                if ( totalDebitAmount > oldTotalDebitAmount )
                  entry['balance'] = parseFloat(entry['balance']) - (totalDebitAmount - oldTotalDebitAmount);
                else if ( totalDebitAmount < oldTotalDebitAmount ) 
                  entry['balance'] = parseFloat(entry['balance']) + (oldTotalDebitAmount - totalDebitAmount);
              } else {
                entry['balance'] = parseFloat(entry['balance']) - totalDebitAmount;
              }
            } else {
              if ( accessType == 3 ) {
                if ( totalCreditAmount > oldTotalCreditAmount )
                  entry['balance'] = parseFloat(entry['balance']) - (totalCreditAmount - oldTotalCreditAmount);
                else if ( totalCreditAmount < oldTotalCreditAmount ) 
                  entry['balance'] = parseFloat(entry['balance']) + (oldTotalCreditAmount - totalCreditAmount);
              } else {
                entry['balance'] = parseFloat(entry['balance']) - totalCreditAmount;
              }
            }
          } else {
            if ( accessType == 3 ) {
              if ( totalDebitAmount > oldTotalDebitAmount ) 
                entry['balance'] = parseFloat(entry['balance']) + (totalDebitAmount - oldTotalDebitAmount);
              else if ( totalDebitAmount < oldTotalDebitAmount ) 
                entry['balance'] = parseFloat(entry['balance']) - (oldTotalDebitAmount - totalDebitAmount);
            } else {
              entry['balance'] = parseFloat(entry['balance']) + totalDebitAmount;
            }
          } 
        }

        let url;
        // For create
        if ( elements.uuid.value == "" ) {
          url = '../accountant/adjustment';
        // For edit
        } else {
          url = `../accountant/adjustment/${elements.uuid.value}`;
          entry['accounts_to_delete'] = oldAccounts;
        }
      
        //------------------------- AJAX REQUEST -------------------------
        // Modify options
        options['method'] = 'post';
        options['cache'] = 'no-store';
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';
        options['body'] = JSON.stringify(entry);
        // Make a fetch for creation / update
        makeFetch(url, 
          options, 
          forNotEditOrViewCallback, 
          finallyCallback
        );
      }
    }
  );
    
  document.getElementById('form_toggle').addEventListener('click', function () {
    if ( validateAccessDate() ) {
      this.setAttribute('data-toggle', "modal");
      this.click();
    } else {
      this.removeAttribute('data-toggle');
      preventModalShow();
    }
  });

  // Load form_table
  $('#form_modal').on('show.bs.modal', function () { loadFormTable(); });
  // Reset modal form
  $('#form_modal').on('hidden.bs.modal', function () { 
    resetModalForm(); 
    document.getElementById('adjustedEntryDetail')?.remove();
  });
});

// Prevent modal show
const preventModalShow = () => {
  // update confirm modal
  confirmTitleIcon.className = `fas fa-info-circle text-secondary mr-3`;
  confirmTitle.textContent = 'Information';
  confirmText.textContent = `This feature is enabled at the end of accounting period.`;
  
  confirmDismiss.className = `d-none`;

  confirmSubmit.className = `btn btn-sm btn-info`;
  confirmSubmitText.textContent = `OK`;
  confirmSubmitIcon.className = 'fas fa-check ml-2';

  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = () => {
    confirmDismiss.click();
    setTimeout(()=> { confirmDismiss.className = `btn btn-sm btn-default`; }, 100);
  };
  confirmSubmit.addEventListener('click', eventCallbackOk);
  confirmDismiss.forEach((dismiss) => {
    if ( eventCallbackCancel != undefined ) dismiss.removeEventListener('click', eventCallbackCancel);
  });
  
  // show modal
  $('#confirm-modal').modal('show');
};

//------------------------- FOR VIEWING/EDITING DATA FUNCTION -------------------------
const editData = (id, accessTypeArg) => {
  accessType = accessTypeArg;
  options['method'] = 'get';
  makeFetch(
    `../accountant/adjustment/${id}`, 
    options, 
    forEditOrViewCallback
  );
};

//------------------------- FOR DEACTIVATING/ACTIVATING DATA FUNCTION -------------------------
function deActivateData () {
  $('#confirm-modal').modal('hide');
  const id = this.id;
  const operation_type = this.operation_type;
  options['method'] = 'delete';
  makeFetch(
    `../accountant/adjustment/${id}?operation_type=${operation_type}`, 
    options, 
    forNotEditOrViewCallback
  );
};