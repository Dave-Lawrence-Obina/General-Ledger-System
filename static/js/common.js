'use strict';

// base url
const baseUrl = 'http://127.0.0.1:8000/';
  
// set user attributes
setTimeout(() => {
  const userImagePlaceholder = document.getElementById('userImagePlaceholder');
  if ( localStorage.getItem('USER_PROFILE_PIC') != "null" ) {
    userImagePlaceholder.src = baseUrl+localStorage.getItem('USER_PROFILE_PIC');
    userImagePlaceholder.classList.remove('user-image-placeholder-content');
  } else {
    userImagePlaceholder.src = '';
    userImagePlaceholder.classList.add('user-image-placeholder-content');
  }
  document.getElementById('userFullName').textContent = localStorage.getItem('USER_FULLNAME');
  document.getElementById('userPosition').textContent = localStorage.getItem('USER_POSITION');
  document.getElementById('userDepartment').textContent = localStorage.getItem('USER_DEPARTMENT');
}, 100);

// form
const form = document.getElementById('form');

// confirm modal`s variables
const confirmTitleIcon = document.getElementById('confirm-title-icon');
const confirmTitle = document.getElementById('confirm-title');
const confirmText = document.getElementById('confirm-text');
const confirmSubmit = document.getElementById('confirm-submit');
const confirmSubmitText = document.getElementById('confirm-submit-text');
const confirmSubmitIcon = document.getElementById('confirm-submit-icon');
const confirmDismiss = document.querySelectorAll('#confirm-modal button[data-dismiss="modal"]');

// global variables
var eventCallbackOk, eventCallbackCancel, table;

// fetch options
const options =  {
  headers: {
    'Accept': 'application/json'
  },
  mode: 'same-origin',
  credentials: 'same-origin',
  cache: 'no-cache',
  redirect: 'manual',
  referrer: '',
  referrerPolicy: 'no-referrer',
  keepAlive: false
};

// create error
const createError = (elementError) => {
  const error = document.createElement('SPAN');
  error.id = elementError;
  error.className = 'error invalid-feedback';
  return error;
};

// display error
const displayError = (element, elementError, text, closest) => { 
  element.classList.add('is-invalid');
  elementError.classList.add('d-block');
  elementError.textContent = text;
  element.closest(closest).appendChild(elementError);
};

// Format name => Sur, Given Middle. Name
const formatName = (name) => {
  return (name.last_name + ", " + name.first_name + " ") +
    (
      name.middle_name
      ? (name.middle_name.charAt(0).toUpperCase()+".") 
      : ''
    );    
};    

// Format date => Week., Month. dd, yyyy hh:mm AM|PM
const formatDate = (date) => {
  date = new Date(date);
  const dateParts = date.toString().split(' ');
  let hour = parseInt(dateParts[4].slice(0,2));
  const amOrPm = hour < 12 ? 'AM' : 'PM';
  hour = hour > 12 ? (hour-12) : hour;
  hour = hour < 10 ? ('0'+hour) : hour; 
  date = `${dateParts[0]}., ${dateParts[1]}. ${dateParts[2]}, ${dateParts[3]} ${hour}${dateParts[4].slice(2,-3)} ${amOrPm}`;
  return date;
};

// Format amount
const formatAmount = (amount) => {
  amount = amount.search(/\./g) == -1 
    ? amount+'.00' 
    : ( amount.search(/(\.\d{1,1})\b/) > -1 
      ? amount+'0' 
      : amount ); 
  let end = -6;
  while (true) {
    if ( amount.search(/(\d{4,})/g) > -1 ) 
      amount = amount.slice(0,end)+','+amount.slice(end);
    else
      break;
    end -= -4;
  };
  return amount;
};

// trim text fields
const trimTextFields = () => {
  const textFields = form.querySelectorAll(`
    input:not(
      [id="uuid"],
      [id="status"],
      [id="created_by"],
      [id="created_at"],
      [id="updated_by"],
      [id="updated_at"],
      [type="number"], 
      [type="password"], 
      [type="checkbox"], 
      [type="file"]
    ), 
    textarea`);
  for(const field of textFields) {
	  field.value = field.value.trim();
  }
};

// reset form
const resetForm = () => {
  form.reset();
  const formFields = form.querySelectorAll(`
    input:not(
      [id="uuid"],
      [id="status"],
      [id="created_by"],
      [id="created_at"],
      [id="updated_by"],
      [id="updated_at"]
    ), 
    select
  `);
  for(const field of formFields) {
    field.classList.remove('is-invalid');
  }
};

var fetchable = true;
// make a fetch
const makeFetch = (resource, init, thenCallback, finallyCallback=undefined) => {
  if ( fetchable ) {
    fetchable = false;
    fetch(resource, init)
    .then((response) => {
      if ( response.ok ) {
        return response.json();
      } else {
        return response.json().then((response) => { 
          throw new Error(response.detail);
        });
      }
    })
    .then((data) => {
      thenCallback(data);
    }).catch((error) => {
      document.getElementById('toast-container')?.remove();
      error = error.toString().replace('Error: ','');
      toastr["error"](error);
    }).finally(() => {
      if ( finallyCallback ) finallyCallback();
      fetchable = true;
    }); 
  } 
};

// confirm to deactivate or activate 
const confirmToDeactivateOrActivate = (id, operation_type, adjustable) => {
  // update confirm modal
  const toDo = 
    operation_type == 0 
    ? 'deactivate' 
    : operation_type == 1
      ? 'activate'
      : operation_type == 2
        ? 'unpost'
        : operation_type == 3
          ? 'post'
          : 'remove';
  const color = (operation_type == 1 || operation_type == 3) ? 'primary': 'danger';
  confirmTitleIcon.className = `fas fa-exclamation-triangle text-secondary mr-3`;
  confirmTitle.textContent = 'Confirmation';
  if ( operation_type == 4 && adjustable ) {
    confirmText.innerHTML = 
      `<div class="d-flex justify-content-between">
        <div class="mr-2"><i><b>Warning: </b></i></div>
        <div>Once you remove the entry, its adjustments will also be removed.</div>
      </div>
      <div><br />Are you sure you want to remove it now?</div>`;
  } else {
    confirmText.textContent = `Are you sure you want to ${toDo} it now?`;
  }
  confirmSubmit.className = `btn btn-sm btn-${color}`;
  confirmSubmitText.textContent = `Yes, ${toDo} it!`;
  confirmSubmitIcon.className = 'fas fa-check ml-2';
  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = deActivateData.bind({'id': id, 'operation_type': operation_type});
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

// confirm to logout
const confirmToLogout = () => {
  // update confirm modal
  confirmTitleIcon.className = 'fas fa-sign-out-alt mr-3 text-secondary';
  confirmTitle.textContent = 'Log out';
  confirmText.textContent = 'Are you sure you want to logout?';
  confirmSubmit.className = 'btn btn-sm btn-danger';
  confirmSubmitText.textContent = 'Log out';
  confirmSubmitIcon.className = 'fas fa-sign-out-alt ml-2';
  // update attached event
  confirmSubmit.removeEventListener('click', eventCallbackOk);
  eventCallbackOk = () => {
    document.querySelector('[aria-label="Close"]').setAttribute('disabled','true');
    confirmSubmit.previousElementSibling.setAttribute('disabled','true');
    confirmSubmit.setAttribute('disabled','true');
    confirmSubmitText.textContent = '';
    confirmSubmitIcon.className = 'fas fa-1x fa-sync-alt fa-spin';
    setTimeout(() => {
      window.location.replace(baseUrl+'login');
    }, 1000);
  };
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

// Disable confirm modal buttons
const disableConfirmModalButtons = () => {
  confirmDismiss.forEach((dismiss) => { dismiss.setAttribute('disabled','true'); });
  confirmSubmit.setAttribute('disabled','true');
};
