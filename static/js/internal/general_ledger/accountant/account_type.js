'use strict';
  
var isForView; 

// elements
const elements = {
  'uuid': document.getElementById('uuid'),
  'name': document.getElementById('name'),
  'code': document.getElementById('code'),
  'description': document.getElementById('description'),
  'nameError': createError('nameError'),
  'codeError': createError('codeError'),
  'submitButton': document.querySelector('[type="submit"')
};

// load table w/ initialization
const loadTable = () => {
  if ( table ) table.destroy(); 
    
  table = $('#table').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
      "url": "../accountant/account_type/datatable",
      "method": "post",
      "contentType": "application/json; charset=UTF-8;",
      "dataType": "json",
      "data": function ( data ) {
        return JSON.stringify(data);
      },
      "dataSrc": function ( response ) {
        for (const data of response.data) {
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
                <a class="dropdown-item " onclick="editData('${data.account_type_id}', true);"><i class="fas fa-list mr-1" style="width: 2rem;"></i><span>View</span></a>
                ${
                  status == 'Active' 
                  ? '<a class="dropdown-item " onclick="editData(\'' + data.account_type_id + '\', false);"><i class="fas fa-edit mr-1" style="width: 2rem;"></i><span>Edit</span></a>'
                  : ''
                }
                <div class="dropdown-divider m-0"></div>
                ${
                  status == 'Active' 
                  ? '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + data.account_type_id + '\', 0);"><i class="fas fa-trash-alt mr-1" style="width: 2rem;"></i><span>Deactivate</span></a>'
                  : '<a class="dropdown-item " onclick="confirmToDeactivateOrActivate(\'' + data.account_type_id + '\', 1);"><i class="fas fa-trash-restore-alt mr-1" style="width: 2rem;"></i><span>Activate</span></a>'
                }
              </div>
            </div>`; 
          data.account_type_id = actions;
        }
        return response.data;
      }
    },
    "columns": [
      { 
        'data': 'code',
        'name': 'code',
      },
      { 
        'data': 'name',
        'name': 'name',
      },
      { 
        'data': 'description',
        'name': 'description',
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
        'data': 'account_type_id',
        'name': 'account_type_id',
        'searchable': false,
        'orderable': false,
      },
    ],
    "deferRender": true,    
    "responsive": true,
    "autoWidth": false,
    "ordering": true,
    "order": [[ 0, 'asc' ]],
    "lengthChange": true,
    "lengthMenu": [ 10, 25, 50, 75, 100 ],
    "searching": true,
    "info": true,
    "paging": true, 
    "language": {
      "paginate": {
        "next": '<i class="fas fa-caret-right"></i>',
        "previous": '<i class="fas fa-caret-left"></i>',
      }
    },
  }); 
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
    // name
    document.getElementById('view-name').value = data.name;
    // code
    document.getElementById('view-code').value = data.code;
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
    let creator = data.at_created_by;
    creator = (creator.last_name + ", " + creator.first_name + " ")+
      (
        creator.middle_name
        ? (creator.middle_name.charAt(0).toUpperCase()+".") 
        : ''
      );
    document.getElementById('view-created-by').value = creator;
    document.getElementById('view-created-at').value = formatDate(data.created_at);
    // updated by & updated at
    let updater = data.at_updated_by;
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
    elements.uuid.value = data.account_type_id;
    elements.name.value = data.name;
    elements.code.value = data.code;
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
    
  // validate name
  elements.name.addEventListener('input', function (e) {
    // remove error if exist
    if ( this.classList.contains('is-invalid') ) {
      this.classList.remove('is-invalid');
      elements.nameError.remove();
    }
    // display error if it`s empty
    if ( this.value == "" ) {
      displayError(this, elements.nameError, 'Name is required.', '.col');
    // make a fetch for server-side validation
    } else {
      options['method'] = 'get';
      makeFetch(`../accountant/account_type/validate?column=name&value=${this.value}&closest=.col`, 
        options, 
        forNotEditOrViewCallback
      );
    }
  });

  // validate code
  elements.code.addEventListener('input', function (e) {
    // remove 4th character
    if ( this.value.length > 3 ) {
      this.value = this.value.slice(0, 3);
      return;
    // remove error if exist
    } else if ( this.classList.contains('is-invalid') ) {
      this.classList.remove('is-invalid');
      elements.codeError.remove();
    } 
    // display error if it`s empty
    if ( this.value == "" ) {
      displayError(this, elements.codeError, 'Code is required.', '.col');
    // display error if it`s invalid
    } else if ( !this.checkValidity() ) {
      displayError(this, elements.codeError, 'Code is invalid.', '.col');
    // make a fetch for server-side validation
    } else {
      options['method'] = 'get';
      makeFetch(`../accountant/account_type/validate?column=code&value=${this.value}&closest=.col`, 
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
      // validate code
      if ( elements.code.value == "" ) {
        elements.code.focus();
        elements.code.dispatchEvent(new Event('input', {'bubbles': true}));
      } 
      // validate name
      if ( elements.name.value == "" ) {
        elements.name.focus();
        elements.name.dispatchEvent(new Event('input', {'bubbles': true})); 
      // if no error, then submit
      } else if ( !elements.name.classList.contains('is-invalid') 
        && !elements.code.classList.contains('is-invalid')
      ) {
        elements.submitButton.setAttribute('disabled', 'true');
        trimTextFields();
        // url
        const url = (
          elements.uuid.value == "" 
          ? '../accountant/account_type'
          : `../accountant/account_type/${elements.uuid.value}`
        );
        // modify options
        options['method'] = 'post';
        options['cache'] = 'no-store';
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';
        options['body'] = JSON.stringify({
          name: elements.name.value,
          code: elements.code.value,
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
  $('#form-modal, #view-modal').on('hidden.bs.modal', function () {
    if ( isForView ) {
      isForView = false;
      document.getElementById('view-description').rows = 3;
      document.getElementById('updatedByAtDiv').classList.add('d-none');
    } else {
      resetForm();
      elements.nameError.remove();
      elements.codeError.remove();
    }
  });
});

// function for viewing / editing data
const editData = (id, isForViewArg) => {
  isForView = isForViewArg;
  options['method'] = 'get';
  makeFetch(`../accountant/account_type/${id}`, 
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
  makeFetch(`../accountant/account_type/${id}?operation_type=${operation_type}`, 
    options, 
    forNotEditOrViewCallback
  );
};
