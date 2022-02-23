'use strict';
  
//------------------------- GLOBAL VARIABLES ------------------------- 
/* var accessType = 0,
  entryType = 'Initial', prevStatus = 'Posted', 
  prevAmount,
  accounts,
  oldAccounts,
  prevAdjustedBalance = 0,
  prevAdjustable = false; 
  isForView,*/
  
var table, accountCounter,
  formTable, 
  totalDebitAmount, totalCreditAmount;

//------------------------- ACCOUNTING PERIOD ------------------------- 
const yearEstablished = 2015,
  dateNow = new Date();
var currentPeriod, lastDay,
  currentMonth = dateNow.getMonth(), 
  currentYear = dateNow.getFullYear();
 // , currentDate
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
};








// reports
var reports = [];

// get available reports
const getAvailableReports = () => {
  if ( 
    ( dateNow.getDate() == lastDay 
    || currentYear < dateNow.getFullYear()
    || ( currentYear == dateNow.getFullYear() && currentMonth-1 < dateNow.getMonth() ))
    && accountCounter > 0
  ) {
    reports.push('Trial Balance');
  } else {
    reports = [];
  }
  // load reports
  loadOptions({
    select: "report",
    data: reports,
    placeholder: reports.length ? 'Select a report' : 'No available reports',
    language: 'No available reports'
  });
};



//------------------------- LOAD TABLE W/ INITIALIZATION -------------------------
const loadTable = () => {
  if ( table ) table.destroy();
    
  table = $('#table').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
      "url": "../accountant/ledger/datatable",
      "method": "post",
      "contentType": "application/json; charset=UTF-8;",
      "dataType": "json",
      "data": function ( data ) {
        data['period'] = currentPeriod;
        return JSON.stringify(data);
      },
      "dataSrc": function ( response ) {
        const accounts = [];
        accountCounter = response.data.length;
        let rowCounter = 0;
        let prevAccountNumber, account, account_parts;
        response.data.forEach(function (data, i) {        
          if ( data.account_number != prevAccountNumber ) {
            let status = data.status;
            status = 
              `<div class="badge badge-primary p-2 w-100">  
                <i class="fas fa-check mr-1" aria-hidden="true"></i>
                ${status}  
              </div>`;
            const action = 
              `<div class="text-center dropdown">
                <a class="btn btn-sm btn-default" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fas fa-ellipsis-v"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right p-0" aria-labelledby="dropdownMenuLink">
                  <a class="dropdown-item " onclick="confirmToUnPost('${rowCounter++}');"><i class="fas fa-undo mr-1" style="width: 2rem;"></i><span>Unpost</span></a>
                </div>
              </div>`; 
            account = {
              account_title: data.account_title,
              account_number: data.account_number,
              status: status,
              action: action
            };
            account_parts = 
              `<div class="table-responsive">
                <table class="table table-borderless account-table">
                  <thead class="border-bottom">
                    <tr class="text-info">
                      <th>Date</th>
                      <th>Explanation</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>`;
            totalDebitAmount = totalCreditAmount = 0;
          }
          account_parts += 
            `<tr class="border-bottom ${data.entry}">
              <td>${data.date.slice(-2)}</td>
              <td>${data.explanation}</td>
              <td>${data.debit == 0 ? "" : formatAmount(data.debit)}</td>
              <td>${data.credit == 0 ? "" : formatAmount(data.credit)}</td>
            </tr>`;
          totalDebitAmount += parseFloat(data.debit);
          totalCreditAmount += parseFloat(data.credit);
          if ( accountCounter == i+1 || (data.account_number != response.data[i+1].account_number ) ) {
            const balance = totalDebitAmount - totalCreditAmount;
            account_parts += 
                  `</tbody>
                  <tfoot>
                    <tr>
                      ${
                        balance > 0 || balance == 0
                        ? `<td colspan="2" class="text-right text-muted small">Bal.:</td>`
                        : ``
                      }
                      <td class="text-right">
                        ${
                          balance > 0 
                          ? `<div>
                              <strong id="${data.account_number}-debit">${formatAmount(balance.toString())}</strong>
                              <hr class="my-0" />
                              <hr class="mt-1 mb-0" />
                            </div>`
                          : balance == 0
                            ? `<div>
                                <strong id="${data.account_number}-debit">0.00</strong>
                                <hr class="my-0" />
                                <hr class="mt-1 mb-0" />
                              </div>`
                            : ``
                        }
                      </td>
                      ${
                        balance < 0
                        ? `<td colspan="2" class="text-right text-muted small">Bal.:</td>`
                        : ``
                      }
                      <td class="text-right">
                        ${
                          balance < 0 
                          ? `<div>
                              <strong id="${data.account_number}-credit">${formatAmount(Math.abs(balance).toString())}</strong>
                              <hr class="my-0" />
                              <hr class="mt-1 mb-0" />
                            </div>`
                          : balance == 0
                            ? `<div>
                                <strong id="${data.account_number}-credit">0.00</strong>
                                <hr class="my-0" />
                                <hr class="mt-1 mb-0" />
                              </div>`
                            : ``
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>`; 
            account['accounts'] = account_parts;
            accounts.push(account);
          }
          prevAccountNumber = data.account_number;
        }); 
        // get available reports
        getAvailableReports();
        return accounts;
      }
    },
    "columns": [
      { 
        'data': 'account_number',
        'name': 'account_number',
        'width': '1%',
      },
      { 
        'data': 'account_title',
        'name': 'account_title',
        'width': '15%',
      },
      { 
        'data': 'accounts',
        'name': 'accounts',
        'searchable': false,
        'orderable': false,
        'width': '60%',
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
            "info": "Showing _START_ to _END_ of _TOTAL_ accounts",
      "emptyTable": "No accounts have been posted yet for the period.",
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
  // get available reports
  table.on('search.dt', function () { getAvailableReports(); });
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

// Load journalized entries
const loadEntries = () => {
  $('#journal_entry').empty().append('<option></option>');
  loadOptions({
    select: "journal_entry", 
    url: `../accountant/journal_entries?period=${currentPeriod}`,
    language: 'No available entries',
    placeholder: 'Select a journal entry|No available entries',
    callback: appendEntries,
  });
};

// Append entries
const appendEntries = (data) => {
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
  document.getElementById('journal_entry').insertAdjacentHTML('afterbegin', entries);
};



      
    
      
      



//------------------------- VIEW TABLE FOR JOURNAL ENTRY -------------------------
const loadViewTable = (data) => {
  totalDebitAmount = totalCreditAmount = 0;
  $('#view_table').DataTable({
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
const showViewModal = (data) => {
    const viewModal = `
      <div class="modal fade" id="view_modal">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title"><i class="fas fa-sitemap mr-3 text-secondary"></i>${data.entry_type == 'Initial' ? 'Journal Entry':'Adjusting Entry'}</h4>
              <button type="button" class="btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i class="fas fa-times"></i></span>
              </button>
            </div>
            <div class="modal-body">
            </div>
            <!-- /.modal-body -->
            <div class="modal-footer text-right">
              <button type="button" class="btn btn-sm btn-default mr-2" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-sm btn-primary" id="${data.id}" onclick="post(this);"><span>Post</span><i class="fas fa-check ml-2"></i></button>
            </div>
            <!-- /.modal-footer -->
          </div>
          <!-- /.modal-content -->
        </div>
        <!-- /.modal-dialog -->
      </div>
      <!-- /.modal -->`;
  document.body.insertAdjacentHTML('beforeend', viewModal);
  $('#view_modal').on('show.bs.modal', function () { displayEntry(data); });
  $('#view_modal').on('hidden.bs.modal', function () { this.remove(); });
  $('#view_modal').modal({
    'backdrop': 'static',
    'keyboard': true,
    'focus': true,
    'show': true
  });
};

// Display entry
const displayEntry = (entry) => {
  const displayedEntry = `
  <div class="row">
  <div class="col">
    <div class="alert alert-dismissible border p-0">
      <div class="card-header">
        <h3 class="card-title">
          <i class="icon fas fa-info-circle text-info"></i>
          Details about 
          ${ 
            entry.entry_type == 'Initial'
            ? 'journal entry'
            : 'adjusting entry'
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
          <dd class="col-sm-10">${
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
          <div class="col-auto table-responsive">
            <table id="view_table" class="table table-bordered  nowrap" style="width: 100%;" >
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
                      <strong id="totalDebitAmount"></strong>
                      <hr class="my-0" />
                      <hr class="mt-1 mb-0" />
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong id="totalCreditAmount"></strong>
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
  document.querySelector('#view_modal .modal-body').insertAdjacentHTML('beforeend', displayedEntry);
  loadViewTable(entry.je_journal_accounts);
  totalDebitAmount = (totalDebitAmount/2).toString();
  totalCreditAmount = (totalCreditAmount/2).toString();
  document.getElementById(`totalDebitAmount`).textContent = formatAmount(totalDebitAmount);
  document.getElementById(`totalCreditAmount`).textContent = formatAmount(totalCreditAmount);
};



            
              
             

// Post
const post = (button) => {
  disableButtons();
  options['method'] = 'put';
  setTimeout(() => {
    makeFetch(
      `../accountant/ledger?id=${button.id}`,
      options,
      forNotEditOrViewCallback,
      finallyCallback
    );
  }, 3000);
};


// Unpost 
function unpost () {
  disableConfirmModalButtons();
  $('#confirm-modal').modal('hide');
  const rows = document.querySelectorAll('.account-table')[this.row].querySelectorAll('tbody > tr');
  const entries = new Set();
  rows.forEach((row) => { entries.add(row.classList[1]); });
  //------------------------- AJAX REQUEST -------------------------
  // Modify options
  options['method'] = 'post';
  options['cache'] = 'no-store';
  options.headers['Content-Type'] = 'application/json; charset=UTF-8';
  options['body'] = JSON.stringify([...entries]);
  // Make a fetch for creation / update
  makeFetch(
    `../accountant/ledger`, 
    options, 
    forNotEditOrViewCallback, 
    finallyCallback
  );
}



   


//------------------------- FOR NOT EDIT/VIEW CALLBACK -------------------------
// Callback for validation, creation, update, deactivation & activation process result
const forNotEditOrViewCallback = (data) => {
  loadTable();
  loadEntries();
  const detail = data.detail;
  if ( detail.search(/\sposted/i) > -1 ) {
    $('#view_modal').modal('hide');
    console.log('here')
  }
  document.getElementById('toast-container')?.remove();
  toastr[data.type](detail);
};

//------------------------- FINALLY CALLBACK -------------------------
const finallyCallback = () => {
  const buttons = document.querySelectorAll('#view_modal button');
  if ( buttons.length ) {
    setTimeout(() => {
      buttons.forEach((button) => { button.removeAttribute('disabled'); });
      buttons[2].firstElementChild.textContent = 'Post';
      buttons[2].lastElementChild.className = 'fas fa-check ml-2';
    }, 500);
  } else {
    // Reset options & submit button to their default
    // For creation & update
    delete options.body;
    delete options.headers['Content-Type'];
    options['cache'] = 'no-cache';
  }
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
    loadTable();
    loadEntries();
  });
  $('#ap_year').on('change', function () { 
    currentYear = this.value; 
    setDateRange();
    loadTable();
    loadEntries();
  });
  // Set year to their default values
  $('#ap_year').val(currentYear).trigger('change');

  
  

  


  // Handles select event for journal_entry
  $('#journal_entry').on('select2:select', function () {
    options['method'] = 'get';
    makeFetch(
      `../accountant/general_journal/${this.value}`,
      options,
      showViewModal
    );
    $(this).val(null).trigger('change');
  });

 

  

  // Handles select event for report
  $('#report').on('select2:select', function () {
    const report = this.value;
    if ( report == 'Trial Balance' ) {
      generateTrialBalance();
    }
    $(this).val(null).trigger('change');
  });
  
  // Enable confirm modal buttons
  $('#confirm-modal').on('hidden.bs.modal', function () {
    confirmDismiss.forEach((dismiss) => { dismiss.removeAttribute('disabled'); });
    confirmSubmit.removeAttribute('disabled');
  });
});

// confirm to unpost 
const confirmToUnPost = (row) => {
  // update confirm modal
  confirmTitleIcon.className = `fas fa-exclamation-triangle text-secondary mr-3`;
  confirmTitle.textContent = 'Confirmation';
  confirmText.innerHTML = 
    `<div class="d-flex justify-content-between">
      <div class="mr-2"><i><b>Warning: </b></i></div>
      <div>Other accounts may also be unposted due to entry relationship.</div>
    </div>
    <div><br />Are you sure you want to unpost it now?</div>`;
  confirmSubmit.className = `btn btn-sm btn-danger`;
  confirmSubmitText.textContent = `Yes, unpost it!`;
  confirmSubmitIcon.className = 'fas fa-undo ml-2';
  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = unpost.bind({'row': row});
  confirmSubmit.addEventListener('click', eventCallbackOk);
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







// Generate trial balance
const generateTrialBalance = () => { 
  // Get data from table
  const accountNumbers = table.column('account_number:name').data();
  const accountTitles = table.column('account_title:name').data();
  // Instantiate jsPDF w/ options
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
    hotfixes: ['px_scaling'],
    encryption: {
      userPermissions: ['print']
    },
  });
  // Get & set page settings
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  let leftHeight = pageHeight, y, pageNumber = 0, nextPage;
  // Set title
  y = 50;
  doc.setFont('courier', 'normal', 'bold');
  doc.setFontSize(14);
  doc.text(
    [
      'Homies', 
      'Trial Balance', 
      `${$('#ap_month').find(':selected').text()} ${lastDay}, ${currentYear}`
    ], 
    pageWidth / 2, 
    y, 
    {align: 'center'}
  );
  leftHeight -= 50 + (18.67 * 3);
  // Set column heading
  y += 100;
  doc.setFont('courier', 'normal', 'bold');
  doc.setFontSize(12);
  doc.text('Account No.', 50, y);
  doc.text('Account Title', 180, y);
  doc.text('Debit', pageWidth-290, y);
  doc.text('Credit', pageWidth-120, y);
  leftHeight -= 100 + (16 * 1);
  // Set all data for each column
  doc.setFont('courier', 'normal', 'normal');
  totalDebitAmount = totalCreditAmount = 0;
  const length = accountNumbers.length;
  for (let i=0; i<length; i++) {
    if ( nextPage ) {
      nextPage = false;
      setPageNumber(doc, ++pageNumber, pageWidth, pageHeight);
      leftHeight = pageHeight - 50;
      y = 50;
    } else if ( nextPage == undefined ) {
      nextPage = false;
      setPageNumber(doc, ++pageNumber, pageWidth, pageHeight);
      y += 25; 
    } else {
      y += 25; 
    }
    doc.text(accountNumbers[i].toString(), 50, y, {align: 'left'});
    doc.text(accountTitles[i].toString(), 180, y, {align: 'left'});
  
    if ( document.getElementById(accountNumbers[i]+'-debit') ) {
      const debit = document.getElementById(accountNumbers[i]+'-debit').textContent;
      doc.text(debit, pageWidth-245, y, {align: 'right'});
      totalDebitAmount += parseFloat(debit.replace(/,/g,''));
    } else {
      const credit = document.getElementById(accountNumbers[i]+'-credit').textContent;
      doc.text(credit, pageWidth-65, y, {align: 'right'});
      totalCreditAmount += parseFloat(credit.replace(/,/g,''));
    }
    leftHeight -= 25;
    if ( i+1 == length ) {
      if ( Math.floor(leftHeight) < 25 ) {
        doc.addPage();
        setPageNumber(doc, ++pageNumber, pageWidth, pageHeight);
        y = 50;
      } else {
        y += 25; 
      }
      doc.line(pageWidth-410, y-(25/2), pageWidth-245, y-(25/2));
      doc.line(pageWidth-230, y-(25/2), pageWidth-65, y-(25/2));
      doc.text(formatAmount(totalDebitAmount.toString()), pageWidth-245, y, {align: 'right'});
      doc.text(formatAmount(totalCreditAmount.toString()), pageWidth-65, y, {align: 'right'});
      doc.line(pageWidth-410, y+5, pageWidth-245, y+5);
      doc.line(pageWidth-230, y+5, pageWidth-65, y+5);
      doc.line(pageWidth-410, y+10, pageWidth-245, y+10);
      doc.line(pageWidth-230, y+10, pageWidth-65, y+10);
    } else if ( Math.floor(leftHeight) < 25 ) {
      doc.addPage();
      nextPage = true;
    }
  }
  // View pdf preview
  viewPdfPreview(doc);
};

// Set page number
const setPageNumber = (doc, pageNumber, pageWidth, pageHeight) => {
  doc.setPage(pageNumber);
  doc.setFontSize(8);
  doc.text(`Page ${pageNumber}`, pageWidth/2, pageHeight-5);
  doc.setFontSize(12);
};

// View pdf preview
const viewPdfPreview = (doc) => {
  // Get output from jsPDF instance
  const output = doc.output('blob');
  const reader = new FileReader();
  reader.readAsDataURL(output);
  reader.onloadend = function() { 
    const base64data = reader.result;
    // pdf_viewer_modal
    const pdfViewerModal = `
    <div class="modal fade" id="pdf_viewer_modal">
      <div class="modal-dialog modal-custom modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title"><i class="fas fa-file-pdf mr-3 text-secondary"></i>Trial Balance</h4>
            <button type="button" class="btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"><i class="fas fa-times"></i></span>
            </button>
          </div>
          <div class="modal-body">
            <iframe src="${base64data}" style="width: 100%; height: ${document.body.clientHeight}px; border: none;"></iframe>
          </div>
          <!-- /.modal-body -->
          <div class="modal-footer text-right">
            <button type="button" class="btn btn-sm btn-default mr-2" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" id="downloadButton">Download<i class="fas fa-download ml-2"></i></button>
          </div>
          <!-- /.modal-footer -->
        </div>
        <!-- /.modal-content -->
      </div>
      <!-- /.modal-dialog -->
    </div>
    <!-- /.modal -->`;
    document.body.insertAdjacentHTML('beforeend', pdfViewerModal);
    // Attach event
    const eventCallback = downloadPdf.bind({'doc': doc, 'name': `Trial-Balance-${currentYear}-${currentMonth}`});
    document.getElementById('downloadButton').addEventListener('click', eventCallback);
    $('#pdf_viewer_modal').on('hidden.bs.modal', function () { this.remove(); });
    $('#pdf_viewer_modal').modal({
      'backdrop': 'static',
      'keyboard': true,
      'focus': true,
      'show': true
    });
  };
};

// Download pdf
function downloadPdf () {
  $('#pdf_viewer_modal').modal('hide');
  this.doc.save(this.name);
};



// Disable buttons
const disableButtons = () => {
  const buttons = document.querySelectorAll(`#view_modal button`);
  buttons.forEach((button) => { button.setAttribute('disabled','true'); });
  buttons[2].firstElementChild.textContent = '';
  buttons[2].lastElementChild.className = 'fas fa-1x fa-sync-alt fa-spin';
};