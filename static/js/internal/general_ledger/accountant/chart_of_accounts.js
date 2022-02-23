'use strict';
  
var isForView, code; 

// elements
const elements = {
  'uuid': document.getElementById('uuid'),
  'account_title': document.getElementById('account_title'),
  'account_type': document.getElementById('account_type'),
  'account_number': document.getElementById('account_number'),
  'description': document.getElementById('description'),
  'account_titleError': createError('account_titleError'),
  'account_typeError': createError('account_typeError'),
  'account_numberError': createError('account_numberError'),
  'submitButton': document.querySelector('[type="submit"')
};

// load table w/ initialization
const loadTable = () => {
  if ( table ) table.destroy(); 
    
  table = $('#table').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
      "url": "../accountant/chart_of_accounts/datatable",
      "method": "post",
      "contentType": "application/json; charset=UTF-8;",
      "dataType": "json",
      "data": function ( data ) {
        return JSON.stringify(data);
      },
      "dataSrc": function ( response ) {
        for (const data of response.data) {
          // dummy balance
          data.balance = '';
          const status = data.status;
          data.status = 
            `<div class="badge ${status == 'Active' ? 'badge-success' : 'badge-danger'} p-2 w-100">  
              <i class="fas ${status == 'Active' ? 'fa-check' : 'fa-times'} mr-1" aria-hidden="true"></i>
              ${status}  
            </div>`;
          const actions = 
            `<div class="text-center dropdown">
              <a class="btn btn-sm btn-default" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <div class="dropdown-menu dropdown-menu-right p-0" aria-labelledby="dropdownMenuLink">
                <a class="dropdown-item " onclick="editData('${data.chart_account_id}', true);"><i class="fas fa-list mr-1" style="width: 2rem;"></i><span>View</span></a>
                ${
                  status == 'Active' 
                  ? '<a class="dropdown-item " onclick="editData(\'' + data.chart_account_id + '\', false);"><i class="fas fa-edit mr-1" style="width: 2rem;"></i><span>Edit</span></a>'
                  : ''
                }
                <div class="dropdown-divider m-0"></div>
                ${
                  status == 'Active' 
                  ? '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + data.chart_account_id + '\', 0);"><i class="fas fa-trash-alt mr-1" style="width: 2rem;"></i><span>Deactivate</span></a>'
                  : '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + data.chart_account_id + '\', 1);"><i class="fas fa-trash-restore-alt mr-1" style="width: 2rem;"></i><span>Activate</span></a>'
                }
              </div>
            </div>`; 
          data.chart_account_id = actions;
        }
        return response.data;
      }
    },
    "columns": [
      { 
        'data': 'account_number',
        'name': 'account_number',
      },
      { 
        'data': 'account_title',
        'name': 'account_title',
      },
      { 
        'data': 'account_type',
        'name': 'account_type',
      },
      { 
        'data': 'description',
        'name': 'description',
        'searchable': false,
        'orderable': false,
      },
      { 
        'data': 'balance',
        'name': 'balance',
        'searchable': false,
        'orderable': false,
      },
      { 
        'data': 'status',
        'name': 'status',
        'searchable': false,
        'orderable': true,
      },
      { 
        'data': 'chart_account_id',
        'name': 'chart_account_id',
        'searchable': false,
        'orderable': false,
      },
    ],
    "deferRender": true,    
    "responsive": true,
    "autoWidth": false,
    "ordering": true,
    "order": [[ 0, 'asc' ]],
    /* "lengthChange": true,
    "lengthMenu": [ 10, 25, 50, 75, 100 ], */
    "searching": true,
    "info": true,
    "paging": true, 
    "language": {
      "paginate": {
        "next": '<i class="fas fa-caret-right"></i>',
        "previous": '<i class="fas fa-caret-left"></i>',
      }
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
      'colvis'
    ],
  });
  table.buttons().container().prependTo('#table_filter').parent().css({'display':'flex', 'justify-content':'space-between'}); 
};

// load account types
const loadAccountTypes = (response) => { 
  for (const data of response) {
    const option = document.createElement('OPTION');
    option.dataset.code = data.code;
    option.value = data.id;
    option.textContent = data.text;  
    elements.account_type.appendChild(option);
  }
};

// callback for validation, creation, update, deactivation / activation process result
const forNotEditOrViewCallback = (data) => {
  let detail = data.detail;
  const element = data.element;
  // display error for validation if column has constraint issue
  if ( element ) {
    elements[element].focus();
    detail = detail.replace(/_/g, ' ');
    displayError(elements[element], elements[element+'Error'], detail, data.closest);
  // popup for creation, update, deactivation / activation
  } else if ( detail ) {
    loadTable();
    if ( detail.search(/activate/i) == -1 ) 
      document.getElementById('form-dismiss').click();
    document.getElementById('toast-container')?.remove();
    toastr[data.type](detail);
  }
};

// callback for edit / view process result
const forEditOrViewCallback = (data) => {
  // for viewing
  if ( isForView ) {
    // account_title
    document.getElementById('view-account-title').value = data.account_title;
    // account_type
    elements.account_type.value = data.account_type;
    elements.account_type.className = '';
    elements.account_type.setAttribute('disabled', 'true');
    document.getElementById('view-account-type').insertAdjacentElement('afterend', elements.account_type);
    // account_number
    document.getElementById('view-account-number').value = data.account_number;
    // description
    const description = document.getElementById('view-description');
    if ( !data.description ) { 
      data.description = ' ';
      description.rows = 1;
    }
    description.value = data.description;
    // status
    document.getElementById('view-status').value = data.status;
    // created by & created at
    let creator = data.ca_created_by;
    creator = (creator.last_name + ", " + creator.first_name + " ")+
      (
        creator.middle_name
        ? (creator.middle_name.charAt(0).toUpperCase()+".") 
        : ''
      );
    document.getElementById('view-created-by').value = creator;
    document.getElementById('view-created-at').value = formatDate(data.created_at);
    // updated by & updated at
    let updater = data.ca_updated_by;
    if ( updater ) {
      updater = (updater.last_name + ", " + updater.first_name + " ")+
      (
        updater.middle_name
        ? (updater.middle_name.charAt(0).toUpperCase()+".") 
        : ''
      );
      document.getElementById('updatedByAtDiv').classList.remove('d-none');
      document.getElementById('view-updated-by').value = updater;
      document.getElementById('view-updated-at').value = formatDate(data.updated_at);
    }
    // show modal
    document.getElementById('view-toggle').click();
  // for editing
  } else {
    elements.uuid.value = data.chart_account_id;
    elements.account_title.value = data.account_title;
    elements.account_type.value = data.account_type;
    // account_number
      code = (data.account_number - (data.account_number % 100));
      elements.account_number.min = code + 1;
      elements.account_number.max = code + 99;
      elements.account_number.removeAttribute('disabled');
    elements.account_number.value = data.account_number;
    elements.description.value = data.description;
    // show modal
    document.getElementById('form-toggle').click();
  }
};

// finally callback
const finallyCallback = () => {
  // reset options & submit button to its default
  // for creation & update
  delete options.body;
  delete options.headers['Content-Type'];
  options['cache'] = 'no-cache';
  elements.submitButton.removeAttribute('disabled');
};

// ready function
$(function () {
  // load table w/ initialization
  loadTable();

  // load account types
  options['method'] = 'get';
  makeFetch(`../accountant/account_types`, 
    options, 
    loadAccountTypes
  );

  // validate account title
  elements.account_title.addEventListener('input', function (e) {
    // remove error if exist
    if ( this.classList.contains('is-invalid') ) {
      this.classList.remove('is-invalid');
      elements.account_titleError.remove();
    }
    // display error if it`s empty
    if ( this.value == "" ) {
      displayError(this, elements.account_titleError, 'Account title is required.', '.col');
    // make a fetch for server-side validation
    } else {
      options['method'] = 'get';
      makeFetch(`../accountant/chart_of_accounts/validate?column=account_title&value=${this.value}&closest=.col`, 
        options, 
        forNotEditOrViewCallback
      );
    }
  });

  // initialize account number
  elements.account_type.addEventListener('change', function (e) {
    // remove error if exist
    if ( this.classList.contains('is-invalid') ) {
      this.classList.remove('is-invalid');
      elements.account_typeError.remove();
    }
    code = parseInt(this.options[this.selectedIndex].dataset.code);
    elements.account_number.removeAttribute('disabled');
    elements.account_number.min = code + 1;
    elements.account_number.max = code + 99;
    elements.account_number.value = code + 1;
    elements.account_number.dispatchEvent(new Event('input', {'bubbles': true}));
  });

  // validate account number
  elements.account_number.addEventListener('input', function (e) {
    // remove 4th character
    if ( this.value.length > 3 ) {
      this.value = this.value.slice(0, 3);
      return;
    // remove error if exist
    } else if ( this.classList.contains('is-invalid') ) {
      this.classList.remove('is-invalid');
      elements.account_numberError.remove();
    } 
    // display error if it`s empty
    if ( this.value == "" ) {
      displayError(this, elements.account_numberError, 'Account number is required.', '.col-md-6');
    // display error if it`s invalid
    } else if ( !this.checkValidity() ) {
      displayError(this, elements.account_numberError, `Account number must be ${code+1} - ${code+99}.`, '.col-md-6');
    // make a fetch for server-side validation
    } else {
      options['method'] = 'get';
      makeFetch(`../accountant/chart_of_accounts/validate?column=account_number&value=${this.value}&closest=.col-md-6`,
        options,
        forNotEditOrViewCallback
      );
    }
  });
  
  // submit event listener
  form.addEventListener(
    'submit',
    function (e) {
      e.preventDefault();
      // validate account number
      if ( elements.account_number.value == "" ) {
        elements.account_number.focus();
        elements.account_number.dispatchEvent(new Event('input', {'bubbles': true}));
      } 
      // validate account type
      if ( elements.account_type.value == "" ) {
        if ( !elements.account_type.classList.contains('is-invalid') ) {
          displayError(elements.account_type, elements.account_typeError, 'Account type is required.', '.col-md-6');
        }
      }
      // validate account title
      if ( elements.account_title.value == "" ) {
        elements.account_title.focus();
        elements.account_title.dispatchEvent(new Event('input', {'bubbles': true}));
      // if no error, then submit
      } else if ( !elements.account_title.classList.contains('is-invalid')
        && !elements.account_type.classList.contains('is-invalid')
        && !elements.account_number.classList.contains('is-invalid') 
      ) {
        elements.submitButton.setAttribute('disabled', 'true');
        trimTextFields();
        // url
        const url = (
          elements.uuid.value == "" 
          ? '../accountant/chart_of_accounts'
          : `../accountant/chart_of_accounts/${elements.uuid.value}`
        );
        // modify options
        options['method'] = 'post';
        options['cache'] = 'no-store';
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';
        options['body'] = JSON.stringify({
          account_title: elements.account_title.value,
          account_type: elements.account_type.value,
          account_number: elements.account_number.value,
          description: elements.description.value
        });
        // make a fetch for creation / update
        makeFetch(url, 
          options, 
          forNotEditOrViewCallback, 
          finallyCallback
        );
      }
    }
  );

  // reset form modal
  $('#form-modal').on('hidden.bs.modal', function () {
    resetForm();
    elements.account_number.setAttribute('disabled', 'true');
    elements.account_titleError.remove();
    elements.account_typeError.remove();
    elements.account_numberError.remove();
  });

  // reset view modal
  $('#view-modal').on('hidden.bs.modal', function () {
    isForView = false;
    // account_type
      elements.account_type.value = '';
      elements.account_type.className = 'form-control';
      elements.account_type.removeAttribute('disabled');
    document.getElementById('origin').insertAdjacentElement('afterend', elements.account_type);
    document.getElementById('view-description').rows = 3;
    document.getElementById('updatedByAtDiv').classList.add('d-none');
  });
});

// function for viewing / editing data
const editData = (id, isForViewArg) => {
  isForView = isForViewArg;
  options['method'] = 'get';
  makeFetch(`../accountant/chart_of_accounts/${id}`, 
    options, 
    forEditOrViewCallback
  );
};

// function for deactivating / activating data
function deActivateData () {
  $('#confirm-modal').modal('hide');
  const id = this.id;
  const operation_type = this.operation_type;
  options['method'] = 'delete';
  makeFetch(`../accountant/chart_of_accounts/${id}?operation_type=${operation_type}`, 
    options, 
    forNotEditOrViewCallback
  );
};

