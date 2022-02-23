( function ($) {
  'use strict';
  
  $(function () {
    localStorage.clear();

    // form elements
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const submitButton = document.querySelector('[type="submit"]');
    
    // disable elements
    const disableElements = ({isLoading}) => {
      username.setAttribute('disabled', 'true');
      password.setAttribute('disabled', 'true');
      submitButton.setAttribute('disabled', 'true');
      if ( isLoading ) {
        submitButton.firstElementChild.textContent = '';
        submitButton.lastElementChild.className = 'fas fa-1x fa-sync-alt fa-spin';
      }
      document.getElementById('rememberMe').setAttribute('disabled', 'true');
      for (const link of document.querySelectorAll('div > a')) {
        link.setAttribute('style', 'pointer-events:none;cursor:default;color:#acb3b7;');
      }
    };

    // position toastr
    toastr.options = {
      "positionClass": "toast-top-center",
    };

    // Token error message
    const url = window.location.href.replace(/\+/g,' ');
    if ( !url.endsWith('login') ) {
      try {
        const start = url.lastIndexOf('=')+1;
        const type = url.slice(url.indexOf('=')+1, start-8);
        const detail = url.slice(start);
        toastr[type](detail);
        disableElements({isLoading: false});
        setTimeout(() => {
          window.location.replace(url.slice(0, url.indexOf('?')));
        }, 3000);
      } catch {}
    }

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
    
    // go to landing page
    const goToLandingPage = (data) => {
      localStorage.setItem('USER_PROFILE_PIC', data.user_profile_pic);
      localStorage.setItem('USER_FULLNAME', data.user_fullname);
      localStorage.setItem('USER_POSITION', data.user_position);
      localStorage.setItem('USER_DEPARTMENT', data.user_department);
      window.location.replace('http://127.0.0.1:8000'+data.endpoint);
    };

    // reset login form
    const resetLoginForm = () => {
      username.value = "";
      password.value = "";
      username.removeAttribute('disabled');
      password.removeAttribute('disabled');
      submitButton.removeAttribute('disabled');
      submitButton.firstElementChild.textContent = 'Log In';
      submitButton.lastElementChild.className = 'fas fa-sign-in-alt ml-1';
      document.getElementById('rememberMe').removeAttribute('disabled');
      for (const link of document.querySelectorAll('div > a')) {
        link.removeAttribute('style');
      }
    };

    // make a fetch
    const makeFetch = (resource, init) => {
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
        if ( data.endpoint ) {
          document.getElementById('toast-container')?.remove();
          toastr["success"](data.detail);
          setTimeout(() => {
            goToLandingPage(data);
          }, 2000);
        } else {
          document.getElementById('toast-container')?.remove();
          toastr["warning"](data.detail);
          resetLoginForm();
        }
      }).catch((error) => {
        document.getElementById('toast-container')?.remove();
        error = error.toString().replace('Error: ','');
        toastr["error"](error);
        resetLoginForm();
      }); 
    };
   
    // errors
    const usernameError = createError('usernameError');    
    const passwordError = createError('passwordError');    
    
    // input event listeners
    username.addEventListener('input', () => {
      if ( username.classList.contains('is-invalid') ) {
        username.classList.remove('is-invalid');
        usernameError.remove();
      }
    });
    password.addEventListener('input', () => {
      if ( password.classList.contains('is-invalid') ) {
        password.classList.remove('is-invalid');
        passwordError.remove();
      }
    });

    // submit event listener
    document.getElementById('form').addEventListener(
      'submit', 
      function (e) {
        e.preventDefault();
        let hasError = false;
        // validate password
        const isPasswordInvalid = password.classList.contains('is-invalid');
        if ( password.value === "" ) {
          if ( !isPasswordInvalid ) {
            displayError(password, passwordError, 'Password is required.', '.col');
          }
          hasError = true;
          password.focus();
        } else if ( isPasswordInvalid ) {
          password.classList.remove('is-invalid');
          passwordError.remove();
        }
        // validate username
        const isUsernameInvalid = username.classList.contains('is-invalid');
        if ( username.value === "" ) {
          if ( !isUsernameInvalid ) {
            displayError(username, usernameError, 'Email Address is required.', '.col'); 
          }
          hasError = true;
          username.focus();
        } else if ( isUsernameInvalid ) {
          username.classList.remove('is-invalid');
          usernameError.remove();
        }
        // if no error then submit
        if ( !hasError ) {
          // disable elements
          disableElements({isLoading: true});
          
          // make a fetch 
          setTimeout(() => {
            makeFetch('../login', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                username: username.value,
                password: password.value
              }),
              mode: 'same-origin',
              credentials: 'same-origin',
              cache: 'no-store',
              redirect: 'manual',
              referrer: '',
              referrerPolicy: 'no-referrer',
              keepalive: false
            });
          }, 1000);
        }
      }
    );   
  });
}(jQuery) );




 