'use strict';
  
//------------------------- GLOBAL VARIABLES ------------------------- 
var accessType = 0,
  table, entryType = 'Initial', prevStatus = 'Posted', 
  formTable, 
  prevAmount,
  accounts, totalDebitAmount, totalCreditAmount, 
  oldAccounts,
  prevAdjustedBalance = 0,
  prevAdjustable = false;
  
 

//------------------------- ACCOUNTING PERIOD ------------------------- 
const yearEstablished = 2015,
  dateNow = new Date();
var currentPeriod, currentDate, lastDay,
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
  lastDay = new Date(currentYear, currentMonth, 0).getDate();
  if ( entryType == 'Initial' ) {
    elements.date.min = currentPeriod + '-01';
    elements.date.max = currentPeriod + '-' + lastDay;
    elements.date.value = currentDate = currentPeriod + '-' + (dateNow.toString().slice(8,10));
  } else {
    elements.date.min = currentPeriod + '-' + lastDay;
    elements.date.max = elements.date.min;
    elements.date.value = elements.date.max;
  }
};
// Validate access date
const validateAccessDate = () => {
  return (
      dateNow.getFullYear() > currentYear
    || dateNow.getMonth() > currentMonth-1
    || (
        dateNow.getFullYear() == currentYear 
      && dateNow.getMonth() == currentMonth-1
      && dateNow.getDate() == lastDay 
    ) 
  );
};






//------------------------- FORM ELEMENTS -------------------------
const elements = {
  'initialTab': document.getElementById('initialTab'),
  'adjustingTab': document.getElementById('adjustingTab'),
  'uuid': document.getElementById('uuid'),
  'date': document.getElementById('date'),
  'debit_account': document.getElementById('debit_account'),
  'credit_account': document.getElementById('credit_account'),
  'explanation': document.getElementById('explanation'),
  'adjustable': document.getElementById('adjustable'),
  'status': document.getElementById('status'),
  'submitButton': document.getElementById('form_submit'),
  'dateError': createError('dateError'),
  'debit_accountError': createError('debit_accountError'),
  'credit_accountError': createError('credit_accountError')
};

// Reset modal form
const resetModalForm = () => {
  document.querySelector('div.originating-entry').classList.remove('d-none');
  document.getElementById('displayedEntry')?.remove();
  $('#originating_entry').val(null).trigger('change');
  
  elements.date.parentElement.classList.remove('d-none');
  elements.date.previousElementSibling.classList.remove('text-danger');
  elements.date.removeAttribute('disabled');
  elements.date.value = currentDate;
  elements.date.classList.remove('is-invalid');
  elements.dateError.remove();
    
  clearError();

  formTable.clear().draw(); 
  
  elements.uuid.value = elements.explanation.value = elements.status.value = "";
  elements.status.checked = true;
  elements.adjustable.checked = false;

  $('#method').prop('disabled',true).val(null).trigger('change');
  $('#account').prop('disabled',true).val(null).trigger('change');

  elements.submitButton.removeAttribute('disabled');

  prevAdjustedBalance = 0;
  prevAdjustable = false;
};




//------------------------- LOAD TABLE W/ INITIALIZATION -------------------------
const loadTable = ({status, type}) => {
  if ( status ) prevStatus = status;
  else status = prevStatus;
  
  if ( type ) entryType = type;
  else type = entryType;
  
  if ( table ) table.clear().draw().destroy();
    
  table = $('#table').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
      "url": "../accountant/general_journal/datatable",
      "method": "post",
      "contentType": "application/json; charset=UTF-8;",
      "dataType": "json",
      "data": function ( data ) {
        data['period'] = currentPeriod;
        data['status'] = status;
        data['type'] = type;
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
                  status == 'Journalized' 
                  ? 'badge-warning' 
                  : ( status == 'Posted'
                      ? 'badge-primary'
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
                    ? `<a class="dropdown-item " onclick="confirmToDeactivateOrActivate('${id}', 3);"><i class="fas fa-undo mr-1" style="width: 2rem;"></i><span>Post</span></a>`
                    : ``
                  }
                  
                  ${
                    data.status == 'Posted'
                    ? `<div class="dropdown-divider m-0"></div><a class="dropdown-item " onclick="confirmToDeactivateOrActivate('${id}', 2);"><i class="fas fa-undo mr-1" style="width: 2rem;"></i><span>Unpost</span></a>`
                    : data.status != 'Inactive' 
                      ? `<div class="dropdown-divider m-0"></div><a class="dropdown-item " onclick="confirmToDeactivateOrActivate('${id}', 0);"><i class="fas fa-trash-alt mr-1" style="width: 2rem;"></i><span>Deactivate</span></a>`
                      : `<a class="dropdown-item " onclick="confirmToDeactivateOrActivate('${id}', 1);"><i class="fas fa-trash-restore-alt mr-1" style="width: 2rem;"></i><span>Activate</span></a>
                        <div class="dropdown-divider m-0"></div><a class="dropdown-item " onclick="confirmToDeactivateOrActivate('${id}', 4, ${data.adjustable});"><i class="fas fa-trash-alt mr-1" style="width: 2rem;"></i><span>Remove</span></a>`
                  }
                </div>
              </div>`; 
            entry = {
              date: data.date.slice(-2),
              explanation: data.explanation,
              entry_type: data.entry_type,
              status: status,
              action: action
            };
            accounts = 
              `<div class="table-responsive">
                <table class="table table-borderless account-table">
                  <thead class="border-bottom">
                    <tr class="text-info">
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
            accounts += 
                  `</tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2"></td>
                      <td class="text-right">
                        <div>
                          <strong>${formatAmount(totalDebitAmount.toString())}</strong>
                          <hr class="my-0" />
                          <hr class="mt-1 mb-0" />
                        </div>
                      </td>
                      <td class="text-right">
                        <div>
                          <strong>${formatAmount(totalCreditAmount.toString())}</strong>
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
        'data': 'entry_type',
        'name': 'entry_type',
        'searchable': false,
        'orderable': false,
        'width': 'auto',
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
  $(`<div class="dropdown" id="typeDropdown">
      <button type="button" class="btn btn-secondary dropdown-toggle rounded-0" data-toggle="dropdown" id="typeDropdownMenuButton" aria-haspopup="true" aria-expanded="false">Show by Type</button>
      <div class="dropdown-menu" aria-labelledby="typeDropdownMenuButton">
        <a class="dropdown-item ${type=='Initial'?'active':''}" onclick="loadTable({type:'Initial'});">Initial Entry</a>
        <a class="dropdown-item ${type=='Adjusting'?'active':''}" onclick="loadTable({type:'Adjusting'});">Adjusting Entry</a>
        <a class="dropdown-item ${type=='Closing'?'active':''}" onclick="loadTable({type:'Closing'});">Closing Entry</a>
        <a class="dropdown-item ${type=='Reversing'?'active':''}" onclick="loadTable({type:'Reversing'});">Reversing Entry</a>
      </div>
    </div>
  `).insertBefore('.buttons-csv');
  $(`<div class="dropdown">
      <button type="button" class="btn btn-secondary dropdown-toggle rounded-0" data-toggle="dropdown" id="statusDropdownMenuButton" aria-haspopup="true" aria-expanded="false">Show by Status</button>
      <div class="dropdown-menu" aria-labelledby="statusDropdownMenuButton">
        <a class="dropdown-item ${status=='Journalized'?'active':''}" onclick="loadTable({status:'Journalized'});">Journalized</a>
        <a class="dropdown-item ${status=='Posted'?'active':''}" onclick="loadTable({status:'Posted'});">Posted</a>
        <div class="dropdown-divider my-0"></div>
        <a class="dropdown-item ${status=='Inactive'?'active':''}" onclick="loadTable({status:'Inactive'});">Inactive</a>
      </div>
    </div>
  `).insertBefore('.buttons-csv');
  table.buttons().container().prependTo('#table_filter').parent().css({'display':'flex', 'justify-content':'space-between'});
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

// Append accounts
const appendAccounts = (method) => {
  $('#account').empty().append('<option value="Account: None">Account: None</option>');
  if ( method == 'Method: None' ) return;
  let searchKey;
  if ( method == 'Method: Asset' ) {
    searchKey = 'debit-1';
  } else if ( method == 'Method: Expense' ) {
    searchKey = 'debit-5';
  } else if ( method == 'Method: Liability' ) {
    searchKey = 'credit-2';
  } else {
    searchKey = 'credit-4';
  }
  let accounts = document.querySelectorAll(`[class~="${searchKey}"]`);
  accounts.forEach((account, i) => {
    if ( i == 0 ) $('#account').empty();
    $('#account').append(
      `<option value="input-${account.classList[1]}">
        ${account.textContent}
      </option>`
    );
  });
};


//------------------------- FOR NOT EDIT/VIEW CALLBACK -------------------------
// Callback for validation, creation, update, deactivation & activation process result
const forNotEditOrViewCallback = (data) => {
  loadTable({});
  loadEntries();
  const detail = data.detail;
  if ( detail.search(/(activated|posted|removed)/i) == -1 ) $('#form_modal').modal('hide');
  document.getElementById('toast-container')?.remove();
  toastr[data.type](detail);
};

//------------------------- FINALLY CALLBACK -------------------------
const finallyCallback = () => {
  setTimeout(() => {
    enableFormElements();
  }, 500);
  // Reset options & submit button to their default
  // For creation & update
  delete options.body;
  delete options.headers['Content-Type'];
  options['cache'] = 'no-cache';
};



//------------------------- LOAD VIEW TABLE FOR journal, adjusting & originating entry -------------------------
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
        'data': 'ja_account_title.account_title',
        'name': 'ja_account_title.account_title',
        'orderable': false, 
        "width": "35%",
        'render': function ( data, type, row ) {
          return `<div class="${row.credit > 0 ? `pl-4` : ``}">${data}</div>`;
        }
      },
       // account_type
      { 
        'data': 'ja_account_title.ca_account_type.name',
        'name': 'ja_account_title.ca_account_type.name',
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

//------------------------- FOR EDIT/VIEW CALLBACK -------------------------
// Callback for edit / view process result
const forEditOrViewCallback = (data) => {
  let entry;
  // For viewing adjusting entry w/ originating entry
  if ( accessType == 1 && data.je_originating_entry != undefined ) { 
    entry = data.je_originating_entry;
    delete data.je_originating_entry;
    accessType = 3;
  // For all entry types
  } else {
    entry = data;
    if ( accessType == 1 && data.entry_type == 'Adjusting' ) accessType = 2;
  }
  
  // For viewing
  if ( accessType > 0 ) {
    const viewModal = `
      <div class="modal fade" id="view_modal">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title"><i class="fas fa-sitemap mr-3 text-secondary"></i>${accessType == 1 ? 'Journal Entry':'Adjusting Entry'}</h4>
              <button type="button" class="btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i class="fas fa-times"></i></span>
              </button>
            </div>
            <div class="modal-body">
            </div>
            <!-- /.modal-body -->
            <div class="modal-footer text-right">
              <button type="button" class="btn btn-sm btn-default mr-2" data-dismiss="modal">Cancel</button>
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
        displayEntry(entry, 1);
        if ( accessType == 3 ) {
          accessType = 2;
          displayEntry(data, 2);
        } 
      });
      $('#view_modal').on('hidden.bs.modal', function () {
        this.remove(); 
        accessType = 0;
      });
      $('#view_modal').modal({
        'backdrop': 'static',
        'keyboard': true,
        'focus': true,
        'show': true
      });
  // For editing
  } else {
    $('#form_modal').modal({
      'backdrop': 'static',
      'keyboard': true,
      'focus': true,
      'show': true
    });
    if ( entry.je_originating_entry != undefined ) {
      displayEntry(entry.je_originating_entry, 1);
      prevAdjustedBalance = parseFloat(entry.balance);
    }
    distributeData(entry);
  }
};

// Display entry
const displayEntry = (entry, nthTableArg) => {
  const nthTable = nthTableArg == undefined ? 1 : nthTableArg;
  const displayedEntry = `
  <div class="row ${accessType == 0 ? 'mt-3':''}" id="displayedEntry">
  <div class="col">
    <div class="alert alert-dismissible border p-0">
      <div class="card-header">
      ${
        accessType == 0 && nthTableArg == undefined
        ? `<button type="button" class="close p-2" data-dismiss="alert" onclick="clearForm(null);">
            <span aria-hidden="true"><i class="fas fa-times-circle"></i></span>
          </button>`
        : ``
      }
        <h3 class="card-title">
          <i class="icon fas fa-info-circle text-info"></i>
          Details about 
          ${ 
            accessType == 1
            ? 'journal entry'
            : (
              accessType == 2
              ? 'adjusting entry'
              : 'originating entry'
            )
          }
        </h3>
      </div>
      <!-- /.card-header -->
      <div class="card-body pb-0">
        <dl class="row">
          <dt class="col-sm-2">Entry Type</dt>
          <dd class="col-sm-10">${entry.entry_type}</dd>
          <dt class="col-sm-2">Date</dt>
          <dd class="col-sm-10">${entry.date}</dd>
          <dt class="col-sm-2">Status</dt>
          <dd class="col-sm-10">${entry.status}</dd>
          ${
            entry.entry_type == 'Initial'
            ? `<dt class="col-sm-2">Adjustable</dt>
              <dd class="col-sm-10">${entry.adjustable ? 'Yes':'No'}</dd>`
            : ``
          }
          <dt class="col-sm-2">Method</dt>
          <dd class="col-sm-10" id="method-aewoe-${nthTable}">${
            entry.method != undefined 
            ? entry.method.replace('Method: ','')
            : `None`
          }</dd>
          <div class="col-12">
            <div class="row">
              <dt class="col-sm-2">Journal. At:</dt>
              <dd class="col-sm-4">${formatDate(entry.journalized_at)}</dd>
              <dt class="col-sm-2">Journal. By:</dt>
              <dd class="col-sm-4">${formatName(entry.je_journalized_by)}</dd>
            </div>
          </div>
          ${ // POSTED
            entry.je_posted_by != undefined
            ? `<div class="col-12">
                <div class="row">
                  <dt class="col-sm-2">Posted At:</dt>
                  <dd class="col-sm-4">${formatDate(entry.posted_at)}</dd>
                  <dt class="col-sm-2">Posted By:</dt>
                  <dd class="col-sm-4">${formatName(entry.je_posted_by)}</dd>
                </div>
              </div>`
            : ``
          }
          ${ // UPDATED
            entry.je_updated_by != undefined
            ? `<div class="col-12">
                <div class="row">
                  <dt class="col-sm-2">Updated At:</dt>
                  <dd class="col-sm-4">${formatDate(entry.updated_at)}</dd>
                  <dt class="col-sm-2">Updated By:</dt>
                  <dd class="col-sm-4">${formatName(entry.je_updated_by)}</dd>
                </div>
              </div>`
            : ``
          }
          ${ // EXPLANATION
            entry.explanation != ""
            ? `<dt class="col-sm-2">Explanation</dt>
              <dd class="col-sm-10">${entry.explanation}</dd>`
            : ``
          }
        </dl>
        <div class="text-info mt-3 mb-2"><strong>Accounts</strong></div>
        <div class="row">
          ${
            accessType == 0
            ? `<input type="hidden" class="originating-entry" id="${entry.id}" value="${entry.balance}" />` 
            : ``
          } 
          <div class="col-auto table-responsive">
            <table id="table-${nthTable}" class="table table-bordered  nowrap" style="width: 100%;" >
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
        <!-- /.row -->
      </div>
      <!-- /.card-body -->
    </div>
  </div>
  </div>`;
  if ( accessType == 0 ) {
    form.insertAdjacentHTML('beforebegin', displayedEntry);
  } else {
    document.querySelector('#view_modal .modal-body').insertAdjacentHTML('beforeend', displayedEntry);
  }
  loadViewTable(`table-${nthTable}`, entry.je_journal_accounts);
  totalDebitAmount = (totalDebitAmount/2).toString();
  totalCreditAmount = (totalCreditAmount/2).toString();
  document.getElementById(`totalDebitAmount-${nthTable}`).textContent = formatAmount(totalDebitAmount);
  document.getElementById(`totalCreditAmount-${nthTable}`).textContent = formatAmount(totalCreditAmount);
  totalDebitAmount = totalCreditAmount = 0;
};



// Distribute data
const distributeData = (data) => {
  elements.uuid.value = data.id;
  elements.date.value = data.date;
  elements.explanation.value = data.explanation;
  elements.status.value = data.status;
  elements.status.checked = (data.status == 'Posted' ? true:false);

  oldAccounts = [];
  for (const account of data.je_journal_accounts) {
    const isDebit = (account.debit > 0 ? true : false);
    const accountId = account.ja_account_title.chart_account_id + (isDebit ? '&Debit' : '&Credit');
    oldAccounts.push(accountId);
    addAccount(
      account.ja_account_title.account_title,
      account.pr.toString(), 
      isDebit, 
      accountId,
      (isDebit?account.debit:account.credit)
    );
  }

  if ( entryType == 'Initial' ) {
    elements.adjustingTab.classList.add('disabled');
    elements.adjustable.checked = prevAdjustable = data.adjustable;
    if ( elements.adjustable.checked ) {
      $('#method').prop('disabled',false);
      $('#account').prop('disabled',false);
      if ( data.method == undefined ) {
        $('#method').val('Method: None').trigger('change');
        appendAccounts('Method: None');
      } else {
        $('#method').val(data.method).trigger('change');
        appendAccounts(data.method);
      }
    }
  } else if ( entryType == 'Adjusting' ) {
    elements.initialTab.classList.add('disabled');
    document.querySelector('div.originating-entry').classList.add('d-none');
    elements.date.setAttribute('disabled','true');
  }
  formModalBody.style.height = `462px`;

  elements.submitButton.firstElementChild.textContent = 'Update';
};







//------------------------- FORM TABLE FOR JOURNAL ENTRY -------------------------
// Load form table
const loadFormTable = () => {
  accounts = {}, totalDebitAmount = totalCreditAmount = 0;
  if ( formTable ) formTable.destroy();
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
    `<div id="${accountId.split('&')[0]}" 
      class="${isDebit?'debit':'credit'}-${pr.slice(0,1)} ${isDebit?'debit':'credit'}-${pr}">
      ${accountTitle}
    </div>`,
    // P.R.
    pr,
    // Debit
    (isDebit) ? `<input type="text" class="form-control form-control-sm input-debit-${pr}" value="${value}"
      onfocus="setPrevAmount(parseFloat(this.value))" 
      oninput="computeTotalDebitOrCredit(this, ${isDebit}, '${accountId}');" 
      autocomplete="off" />` : null,
    // Credit
    (!isDebit) ? `<input type="text" class="form-control form-control-sm input-credit-${pr}" value="${value}"
      onfocus="setPrevAmount(parseFloat(this.value))" 
      oninput="computeTotalDebitOrCredit(this, ${isDebit}, '${accountId}');" 
      autocomplete="off" />` : null,
    // Action
    `<button type="button" class="btn btn-sm btn-danger" 
      onclick="removeAccount(this.parentElement, ${isDebit}, '${accountId}');">
      <i class="fas fa-trash-alt" style=""></i>
    </button>` 
  ]).draw(false);
  const input = $($(row.node()).children()[(isDebit?2:3)]).children()[0];
  // For edit
  if ( value ) {
    prevAmount = 0;
    computeTotalDebitOrCredit(
      input,
      isDebit,
      accountId
    );
  } else {
    input.focus()
    document.getElementById('errorMessage')?.remove();
  }
  if ( elements.adjustable.checked ) elements.adjustable.click();
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
  if ( isNoBlank() ) clearError();
  
  if ( elements.adjustable.checked ) elements.adjustable.click();
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
    if ( isNoBlank() ) clearError();
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











      





//------------------------- READY FUNCTION ------------------------- 
$(function () {
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
    loadTable({});
    loadEntries();
  });
  $('#ap_year').on('change', function () { 
    currentYear = this.value; 
    setDateRange();
    loadTable({});
    loadEntries();
  });
  // Set year to their default values
  $('#ap_year').val(currentYear).trigger('change');

  //------------------------- ORIGINATING ENTRY -------------------------
  // Handles select event for originating_entry
  $('#originating_entry').on('select2:select', function () {
    clearForm(this.value);
    accessType = 0;
    options['method'] = 'get';
    makeFetch(
      `../accountant/general_journal/${this.value}`,
      options,
      displayEntry
    );
  });
  $('#originating_entry').on('select2:opening', function (e) {
    if ( !validateAccessDate() ) {
      preventModalShow();
      return e.preventDefault();
    }
  });
  
  //------------------------- FORM ELEMENTS -------------------------
  // DATE
  elements.date.addEventListener('change', function () {
    // Remove error first if exist
    if ( this.classList.contains('is-invalid') ) {
      this.previousElementSibling.classList.remove('text-danger');
      this.classList.remove('is-invalid');
      elements.dateError.remove();
    } 
    // Check validity
    if ( this.value == "" ) {
      this.previousElementSibling.classList.add('text-danger');
      displayError(this, elements.dateError, 'Date is invalid.', '.' + this.parentElement.className);
    }
  });

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
    $(`#${select}`).on('select2:open', function () {
      setTimeout(() => document.querySelector('.select2-search__field')?.focus(), 100);
    });
    $(`#${select}`).on('select2:close', function () {
      // Remove error first if exist
      if ( this.classList.contains('is-invalid') ) {
        document.querySelector(`[aria-labelledby="select2-${select}-container"]`).classList.remove('is-invalid');
        this.previousElementSibling.classList.remove('text-danger');
        this.classList.remove('is-invalid');
        elements[`${select}Error`].remove();
      } 
      const closest = '.' + this.parentElement.className;
      // Is account selectable
      if ( !isNoBlank() ) {
        document.querySelector(`[aria-labelledby="select2-${select}-container"]`).classList.add('is-invalid');
        this.previousElementSibling.classList.add('text-danger');
        displayError(this, elements[`${select}Error`], `Unable to add new account due to blank debit/credit field.`, closest);
      // Add account
      } else if ( this.value != "" ) {
        const accountTitle = $(this).find(':selected').text();
        const [accountId, pr, isDebit] = this.value.split('&');
        addAccount(accountTitle, pr, (isDebit=='Debit'?true:false), accountId+'&'+isDebit);
      }
      $(this).val(null).trigger("change");
    });
  }
 
  // Enable/Disable method & account select
  elements.adjustable.addEventListener('change', function () {
    if ( this.checked ) {
      $('#method').prop('disabled', false).val('Method: None').trigger('change');
      $('#account').empty().append('<option value="Account: None">Account: None</option>');
      $('#account').prop('disabled', false).val('Account: None').trigger('change');
    } else {
      $('#method').prop('disabled', true).val(null).trigger('change');
      $('#account').prop('disabled', true).val(null).trigger('change');
    }
  });
  
  // METHOD
  // Load methods
  loadOptions({
    select: "method",
    data: ['Method: None','Method: Asset','Method: Expense','Method: Liability','Method: Income'],
    placeholder: 'Select method',
    language: 'No available methods'
  });
  $('#method').on('select2:select', function () { appendAccounts(this.value); });

  // ACCOUNT
  $('#account').select2({
    'placeholder': 'Select account',
    'language': 'No available accounts'
  });

  //------------------------- HANDLE SUBMIT EVENT -------------------------
  form.addEventListener(
    'submit',
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      prepareAndSendData();
    }
  );
    
  // Load form_table
  $('#form_modal').on('show.bs.modal', function () { 
    resetTabs((
      document.querySelector('#typeDropdown a[class~="active"]').textContent.replace(' Entry','')
    ) == 'Adjusting' ? 'Adjusting':'Initial');
    loadFormTable();
  });
  // Reset form_modal
  $('#form_modal').on('hidden.bs.modal', function () { 
    entryType = (
      document.querySelector('#typeDropdown a[class~="active"]').textContent.replace(' Entry','')
    ) == 'Adjusting' ? 'Adjusting':'Initial';
    resetModalForm();
  });

  // Enable confirm modal buttons
  $('#confirm-modal').on('hidden.bs.modal', function () {
    confirmDismiss.forEach((dismiss) => { dismiss.removeAttribute('disabled'); });
    confirmSubmit.removeAttribute('disabled');
  });
});

// Validate form elements
const validateFormElements = () => {
  elements.submitButton.setAttribute('disabled', 'true');
  document.getElementById('errorMessage')?.remove();
  // Validate date
  if ( elements.date.value == "" ) {
    elements.submitButton.removeAttribute('disabled');
    elements.date.dispatchEvent(new Event('change'));
    formModalBody.animate({ scrollTop: elements.date.offsetTop }, "slow");
  // Check if there are debit and their corresponding credit accounts
  } else if ( totalDebitAmount == 0 && totalCreditAmount == 0 ) {
    elements.submitButton.removeAttribute('disabled');
    form.insertAdjacentHTML('beforebegin', 
      `<div class="mt-3" id="errorMessage">
        <div class="col">
          <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
            The debit and their corresponding credit accounts are required.
          </div>
        </div>
      </div>`);
    formModalBody.animate({ scrollTop: document.getElementById('errorMessage').offsetTop }, "slow");
  // Check if the total debit & credit amounts are equal
  } else if ( (totalDebitAmount != totalCreditAmount) || !isNoBlank() ) {
    elements.submitButton.removeAttribute('disabled');
    form.insertAdjacentHTML('beforebegin', 
      `<div class="mt-3" id="errorMessage">
        <div class="col">
          <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
            The total debit and total credit amounts are not equal.
          </div>
        </div>
      </div>`);
    formModalBody.animate({ scrollTop: document.getElementById('errorMessage').offsetTop }, "slow");
  // Check if the selected method is appropriate
  } else if ( $('#method').val() != 'Method: None' && $('#account').val() == 'Account: None' ) { 
    elements.submitButton.removeAttribute('disabled');
    form.insertAdjacentHTML('beforebegin', 
      `<div class="mt-3" id="errorMessage">
        <div class="col">
          <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
            The selected method has no corresponding account.
          </div>
        </div>
      </div>`);
    formModalBody.animate({ scrollTop: document.getElementById('errorMessage').offsetTop }, "slow");
  // If no error, then submit
  } else {
    if ( prevAdjustable ) {
      confirmToCreateOrUpdate('Once you update the entry, its adjustments will be removed.');
    } else {
      disableFormElements();
      setTimeout(() => { form.dispatchEvent(new Event('submit', {'cancelable': true})); }, 3000);
    }
  }
};

// Confirm to create / update 
const confirmToCreateOrUpdate = (text) => {
  // update confirm modal
  confirmTitleIcon.className = `fas fa-exclamation-triangle text-secondary mr-3`;
  confirmTitle.textContent = 'Confirmation';
  confirmText.innerHTML = 
    `<div class="d-flex justify-content-between">
      <div class="mr-2"><i><b>Warning: </b></i></div>
      <div>${text}</div>
    </div>
    <div><br />Are you sure you want to update it now?</div>`;
  confirmSubmit.className = `btn btn-sm btn-primary`;
  confirmSubmitText.textContent = `Yes, update it!`;
  confirmSubmitIcon.className = 'fas fa-check ml-2';
  
  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = () => {
    disableConfirmModalButtons();
    $('#confirm-modal').modal('hide');
    disableFormElements();
    setTimeout(() => {
      form.dispatchEvent(new Event('submit', {'cancelable': true}));
    }, 3000);
  };
  confirmSubmit.addEventListener('click', eventCallbackOk);

  // update attached event
  confirmDismiss.forEach((dismiss) => {
    if ( eventCallbackCancel != undefined ) dismiss.removeEventListener('click', eventCallbackCancel);
    eventCallbackCancel = () => elements.submitButton.removeAttribute('disabled');
    dismiss.addEventListener('click', eventCallbackCancel);
  });

  // show modal
  $('#confirm-modal').modal({
    'backdrop': 'static',
    'keyboard': true,
    'focus': true,
    'show': true
  });
};

// Prepare & send data
const prepareAndSendData = () => {
  //------------------------- GET ROWS` DATA -------------------------
  const entry = {
    'date': elements.date.value,
    'explanation': elements.explanation.value,
    'adjustable': false,
    'method': null,
    'balance': 0,
    'status': (
      elements.status.checked
      ? 'Posted'
      : (
          elements.status.value != 'Inactive'
          ? 'Journalized'
          : 'Inactive'
        )
    ),
    'entry_type': entryType,
    'originating_entry': null,
    'new_accounts': []
  };

  const originating_entry = document.querySelector('input.originating-entry');
  console.log(originating_entry)
  if ( entryType == 'Initial' ) {
    entry['adjustable'] = elements.adjustable.checked;
    entry['method'] = (
      ( $('#method').val() && $('#method').val() != 'Method: None' )
      ? $('#method').val() 
      : null
    );
    entry['balance'] = (
      ( $('#account').val() && $('#account').val() != 'Account: None' )
      ? $(`.${$('#account').val()}`).val()
      : 0
    );
  } else if ( originating_entry != null ) {
    entry['originating_entry'] = originating_entry.id;
    entry['balance'] = originating_entry.value != "" ? parseFloat(originating_entry.value) : 0;
    entry['method'] = document.getElementById('method-aewoe-1').textContent;
    entry['method'] = entry.method != 'None' ? ('Method: ' + entry.method) : null;
    if ( entry.method != null ) {
      if ( entry.method == 'Method: Asset' ) entry['adjusted_balance'] = totalCreditAmount;
      else if ( entry.method == 'Method: Liability') entry['adjusted_balance'] = totalDebitAmount;
      else if ( entry.method == 'Method: Expense' ) entry['adjusted_balance'] = (entry.balance + prevAdjustedBalance) - totalCreditAmount;
      else entry['adjusted_balance'] = (entry.balance + prevAdjustedBalance) - totalDebitAmount;
      if ( elements.uuid.value == "" ) entry['balance'] = entry.balance - entry.adjusted_balance;
      else {
        if ( entry.adjusted_balance > prevAdjustedBalance ) entry['balance'] = entry.balance - (entry.adjusted_balance - prevAdjustedBalance);
        else if ( entry.adjusted_balance < prevAdjustedBalance ) entry['balance'] = entry.balance + (prevAdjustedBalance - entry.adjusted_balance);
      }
    } else {
      entry['adjusted_balance'] = totalCreditAmount;
      if ( elements.uuid.value == "" ) entry['balance'] = entry.balance + entry.adjusted_balance;
      else {
        if ( entry.adjusted_balance > prevAdjustedBalance ) entry['balance'] = entry.balance + (entry.adjusted_balance - prevAdjustedBalance);
        else if ( entry.adjusted_balance < prevAdjustedBalance ) entry['balance'] = entry.balance - (prevAdjustedBalance - entry.adjusted_balance);
      }
    }
    console.log(entry.balance)
    if ( entry.balance < 0 ) {
      enableFormElements();
      form.insertAdjacentHTML('beforebegin', 
        `<div class="mt-3" id="errorMessage">
          <div class="col">
            <div class="alert alert-danger alert-dismissible">
              <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
              <h5><i class="icon fas fa-exclamation-triangle"></i> Error!</h5>
              Invalid adjusted balance
            </div>
          </div>
        </div>`);
      formModalBody.animate({ scrollTop: document.getElementById('errorMessage').offsetTop }, "slow");
      return false;
    }
  }

  // For edit
  if ( elements.uuid.value != "" ) {
    entry['updated_accounts'] = [];
    entry['accounts_to_delete'] = oldAccounts;
  }
  const rows = document.querySelectorAll('#form_table > tbody > tr');
  for (const row of rows) {
    const account = {};
    account['account_title'] = row.firstElementChild.firstElementChild.id;
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
      const idx = entry['accounts_to_delete'].indexOf(accountId);
      if ( idx == -1 )
        entry.new_accounts.push(account);
      else {
        entry.updated_accounts.push(account); 
        entry['accounts_to_delete'].splice(idx, 1);
      }
    }
  }

  let url;
  // For create
  if ( elements.uuid.value == "" ) {
    url = '../accountant/general_journal';
  // For edit
  } else {
    url = `../accountant/general_journal/${elements.uuid.value}`;
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
};






// Disable form elements
const disableFormElements = () => {
  const formElements = document.querySelectorAll(`
    #form input:not([id="uuid"]), 
    #form select,
    #form textarea,
    #form button,
    [form="form"]
  `);
  formElements.forEach((el) => { 
    if ( el.nodeName == 'A' ) el.classList.add('disabled');
    else el.setAttribute('disabled','true'); 
  });
  elements.submitButton.firstElementChild.textContent = '';
  elements.submitButton.lastElementChild.className = 'fas fa-1x fa-sync-alt fa-spin';
};

// Enable form elements
const enableFormElements = () => {
  let formElements;
  if ( entryType == 'Initial' && elements.adjustable.checked ) {
    formElements = document.querySelectorAll(`
      #form input:not([id="uuid"]), 
      #form select,
      #form textarea,
      #form button,
      [form="form"]
    `);
    if ( elements.uuid.value == "" ) elements.submitButton.firstElementChild.textContent = 'Submit';
    else elements.submitButton.firstElementChild.textContent = 'Update';
  } else if ( entryType == 'Initial' ) {
   formElements = document.querySelectorAll(`
      #form input:not([id="uuid"]), 
      #form select:not([id="method"], [id="account"]),
      #form textarea,
      #form button,
      [form="form"]
    `);
    if ( elements.uuid.value == "" ) elements.submitButton.firstElementChild.textContent = 'Submit';
    else elements.submitButton.firstElementChild.textContent = 'Update';
  } else if ( entryType == 'Adjusting' ) {
    formElements = document.querySelectorAll(`
      #form input:not([id="uuid"], [id="date"]), 
      #form select:not([id="method"], [id="account"]),
      #form textarea,
      #form button,
      [form="form"]
    `);
    if ( elements.uuid.value == "" ) elements.submitButton.firstElementChild.textContent = 'Adjust';
    else elements.submitButton.firstElementChild.textContent = 'Update';
  }
  formElements.forEach((el) => { 
    if ( elements.uuid.value == "" && el.nodeName == 'A' ) el.classList.remove('disabled');
    else el.removeAttribute('disabled'); 
  });
  elements.submitButton.lastElementChild.className = 'fas fa-check ml-2';
  elements.submitButton.removeAttribute('disabled');
};





// Toggle form
const formModalBody = document.querySelector('#form_modal .modal-body');
formModalBody.style.height = `462px`;
const toggleForm = (tabPanel, entryTypeArg) => {
  tabPanel = document.getElementById(tabPanel);
  if ( !tabPanel.classList.contains('active') ) {
    entryType = entryTypeArg;
    resetModalForm();
    setDateRange();
    loadFormTable();
    if ( entryType == 'Initial' ) {
      elements.date.removeAttribute('disabled');
      document.getElementById('adjustableRow').classList.remove('d-none');
      elements.submitButton.firstElementChild.textContent = 'Submit';
    } else {
      document.getElementById('displayedEntry')?.remove();
      $('#originating_entry').val(null).trigger('change');
      elements.date.setAttribute('disabled','true');
      document.getElementById('adjustableRow').classList.add('d-none');
      elements.submitButton.firstElementChild.textContent = 'Adjust';
    }
    tabPanel.insertAdjacentElement('beforeend', form);
    formModalBody.style.height = `${formModalBody.clientHeight}px`;
  }
};

// Reset tabs
const resetTabs = (entryTypeArg) => {
  entryType = entryTypeArg;
  entryTypeArg = entryTypeArg.toLowerCase();
  elements[`${(entryTypeArg=='initial'?'adjusting':'initial')}Tab`].classList.remove('disabled','active');
  elements[`${entryTypeArg}Tab`].classList.remove('disabled');
  elements[`${entryTypeArg}Tab`].classList.add('active');
  document.getElementById(`${(entryTypeArg=='initial'?'adjusting':'initial')}TabPanel`).classList.remove('active','show');
  document.getElementById(`${entryTypeArg}TabPanel`).classList.add('active','show');
  document.getElementById(`${entryTypeArg}TabPanel`).insertAdjacentElement('beforeend', form);
  setDateRange();
  if ( entryTypeArg == 'initial' ) {
    elements.date.removeAttribute('disabled');
    document.getElementById('adjustableRow').classList.remove('d-none');
    elements.submitButton.firstElementChild.textContent = 'Submit';
  } else {
    document.getElementById('displayedEntry')?.remove();
    $('#originating_entry').val(null).trigger('change');
    elements.date.setAttribute('disabled','true');
    document.getElementById('adjustableRow').classList.add('d-none');
    elements.submitButton.firstElementChild.textContent = 'Adjust';
  }
};

// Clear error
const clearError = () => {
  document.getElementById('errorMessage')?.remove();
  
  document.querySelector('[aria-labelledby="select2-debit_account-container"]').classList.remove('is-invalid');
  elements.debit_account.previousElementSibling.classList.remove('text-danger');
  elements.debit_account.classList.remove('is-invalid');
  elements.debit_accountError.remove();

  document.querySelector('[aria-labelledby="select2-credit_account-container"]').classList.remove('is-invalid');
  elements.credit_account.previousElementSibling.classList.remove('text-danger');
  elements.credit_account.classList.remove('is-invalid');
  elements.credit_accountError.remove();
};

// Clear form
const clearForm = (value) => {
  resetModalForm();
  resetTabs('Adjusting');
  loadFormTable();
  $('#originating_entry').val(value).trigger('change');
};

//------------------------- FOR VIEWING/EDITING DATA FUNCTION -------------------------
const editData = (id, accessTypeArg) => {
  accessType = accessTypeArg;
  options['method'] = 'get';
  makeFetch(
    `../accountant/general_journal/${id}`, 
    options, 
    forEditOrViewCallback
  );
};

//------------------------- FOR DEACTIVATING/ACTIVATING DATA FUNCTION -------------------------
function deActivateData () {
  disableConfirmModalButtons();
  $('#confirm-modal').modal('hide');
  const id = this.id;
  const operation_type = this.operation_type;
  options['method'] = 'delete';
  makeFetch(
    `../accountant/general_journal/${id}?operation_type=${operation_type}`, 
    options, 
    forNotEditOrViewCallback
  );
};





// Prevent modal show
const preventModalShow = () => {
  // update confirm modal
  confirmTitleIcon.className = `fas fa-info-circle text-secondary mr-3`;
  confirmTitle.textContent = 'Information';
  confirmText.textContent = `This feature is enabled at the end of accounting period.`;
  
  confirmDismiss[1].className = `d-none`;

  confirmSubmit.className = `btn btn-sm btn-info`;
  confirmSubmitText.textContent = `OK`;
  confirmSubmitIcon.className = 'fas fa-check ml-2';

  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = () => {
    $('#confirm-modal').modal('hide');
    setTimeout(()=> { confirmDismiss[1].className = `btn btn-sm btn-default`; }, 100);
  };
  confirmSubmit.addEventListener('click', eventCallbackOk);
  
  // update attached event
  confirmDismiss.forEach((dismiss) => {
    if ( eventCallbackCancel != undefined ) dismiss.removeEventListener('click', eventCallbackCancel);
  });
  
  // show modal
  $('#confirm-modal').modal({
    'backdrop': 'static',
    'keyboard': true,
    'focus': true,
    'show': true
  });
};

