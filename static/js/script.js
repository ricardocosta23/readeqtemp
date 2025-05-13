document.addEventListener('DOMContentLoaded', function() {
    // Handle delete destination buttons
    document.querySelectorAll('.delete-destination').forEach(button => {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const overlay = button.closest('.form-group').querySelector('.delete-overlay');
        const originalInput = button.closest('.row').querySelector('input[readonly]');
        const originalValue = originalInput ? originalInput.value : '';
        const resumeId = 'resumo-' + targetId.replace('nova', '').toLowerCase();
        const resumeElem = document.getElementById(resumeId);
        const newValueElem = document.getElementById('nova-' + targetId.replace('nova', '').toLowerCase());

        // Remove any existing listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        // Add click handler
        button.addEventListener('click', function() {
            // Set input value to an empty string to clear the Monday column
            newInput.value = '';
            if (this.classList.contains('disabled')) {
                // Reset state
                this.classList.remove('disabled');
                overlay.classList.add('d-none');
                newInput.value = '';
                // Remove hidden field for delete state
                const hiddenField = document.querySelector(`input[name="deleted_${this.dataset.section}"]`);
                if (hiddenField) hiddenField.remove();

                if (originalValue && originalValue.trim() !== '' && originalValue !== 'None') {
                    if (resumeElem) resumeElem.style.display = 'none';
                    if (newValueElem) newValueElem.textContent = '';
                }
            } else {
                // Delete state
                this.classList.add('disabled');
                this.style.pointerEvents = 'auto';
                this.style.cursor = 'pointer';
                newInput.value = '';
                overlay.classList.remove('d-none');

                // Add hidden field to track delete state
                const form = document.querySelector('form');
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = `deleted_${this.dataset.section}`;
                hiddenField.value = 'true';
                form.appendChild(hiddenField);

                if (originalValue && originalValue.trim() !== '' && originalValue !== 'None') {
                    if (resumeElem) resumeElem.style.display = 'block';
                    if (newValueElem) newValueElem.textContent = 'Apagado';
                }
            }
            atualizarResumoMudancas();
        });

        // Add input handler
        newInput.addEventListener('input', function() {
            if (this.value) {
                overlay.classList.add('d-none');
                button.classList.remove('disabled');

                if (originalValue && originalValue.trim() !== '' && originalValue !== 'None' && 
                    this.value !== originalValue) {
                    if (resumeElem) resumeElem.style.display = 'block';
                    if (newValueElem) newValueElem.textContent = this.value;
                } else {
                    if (resumeElem) resumeElem.style.display = 'none';
                }
            } else {
                if (resumeElem) resumeElem.style.display = 'none';
            }
            atualizarResumoMudancas();
        });
    });

    // Handle delete date buttons
    document.querySelectorAll('.delete-date').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const section = this.dataset.section;
            const input = document.getElementById(targetId);
            const overlay = this.closest('.form-group').querySelector('.delete-overlay');
            const buttonElement = this;
            const originalInput = buttonElement.closest('.card-body').querySelector('input[readonly]');
            const originalDate = originalInput ? originalInput.value : '';
            const fp = input._flatpickr;

            const resumeId = 'resumo-' + targetId.replace('nova', '').toLowerCase();
            const resumeElem = document.getElementById(resumeId);
            const newValueElem = document.getElementById('nova-' + targetId.replace('nova', '').toLowerCase());

            if (buttonElement.classList.contains('disabled')) {
                // Reset button state
                buttonElement.classList.remove('disabled');
                overlay.classList.add('d-none');

                // Keep calendar empty but restore original value internally
                if (fp) {
                    fp.clear();
                }
                input.value = originalDate || '';

                // Reset summary
                if (resumeElem) {
                    resumeElem.style.display = 'none';
                }
                if (newValueElem) {
                    newValueElem.textContent = '';
                }
                atualizarResumoMudancas();
            } else {
                // Click state - clear field and show banner
                buttonElement.classList.add('disabled');
                buttonElement.style.pointerEvents = 'auto';
                buttonElement.style.cursor = 'pointer';
                if (fp) {
                    fp.clear(); // Clear the flatpickr instance
                }
                input.value = ''; // Clear the input value
                overlay.classList.remove('d-none');
                // Update summary to show field will be cleared
                const resumeId = 'resumo-' + targetId.replace('nova', '').toLowerCase();
                const resumeElem = document.getElementById(resumeId);
                const newValueElem = document.getElementById('nova-' + targetId.replace('nova', '').toLowerCase());
                if (resumeElem && newValueElem) {
                    resumeElem.style.display = 'block';
                    newValueElem.textContent = `Data ${section} será apagada`;
                }
            }

            // Handler for calendar field changes
            const inputHandler = function() {
                if (input.value) {
                    // If calendar field changes, unclick delete button
                    overlay.classList.add('d-none');
                    buttonElement.classList.remove('disabled');
                    // Update summary to show new date
                    const resumeId = 'resumo-' + targetId.replace('nova', '').toLowerCase();
                    const resumeElem = document.getElementById(resumeId);
                    const newValueElem = document.getElementById('nova-' + targetId.replace('nova', '').toLowerCase());
                    if (resumeElem && newValueElem) {
                        resumeElem.style.display = 'block';
                        newValueElem.textContent = input.value;
                    }
                }
            };

            input.removeEventListener('input', inputHandler);
            input.addEventListener('input', inputHandler);
            if (fp) {
                fp.config.onChange.push(inputHandler);
            }
        });
    });

    // Initialize Flatpickr for date fields
    const flatpickrConfig = {
        dateFormat: "d/m/Y",
        locale: "pt",
        allowInput: true,
        altInput: true,
        altFormat: "d/m/Y",
        disableMobile: true,
        static: true,
        theme: "dark",
        position: "auto",
        monthSelectorType: "static",
        minDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            // Update summary when date changes
            atualizarResumoMudancas();
        },
        onOpen: function(selectedDates, dateStr, instance) {
            // Add custom class to the calendar for specific styling
            instance.calendarContainer.classList.add('custom-flatpickr');
        }
    };

    // Apply Flatpickr to all date fields
    document.querySelectorAll('.flatpickr-date').forEach(function(element) {
        flatpickr(element, flatpickrConfig);

        // Add specific styling and behavior for each date picker
        element.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
            atualizarResumoMudancas();
        });
    });


    // Add change event listeners to all text inputs
    Object.values(fields).forEach(field => {
        const input = document.getElementById(field.inputId);
        if (input) {
            input.addEventListener('input', atualizarResumoMudancas);
            input.addEventListener('change', atualizarResumoMudancas);
        }
    });

    // Initialize summary on page load
    atualizarResumoMudancas();

    // Validate file size before form submission
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const maxSizeInBytes = 16 * 1024 * 1024; // 16MB

            if (this.files.length > 0) {
                const fileSize = this.files[0].size;

                if (fileSize > maxSizeInBytes) {
                    this.classList.add('is-invalid');
                    if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('invalid-feedback')) {
                        const feedback = document.createElement('div');
                        feedback.classList.add('invalid-feedback');
                        feedback.textContent = 'O arquivo excede o tamanho máximo de 16MB.';
                        this.parentNode.appendChild(feedback);
                    }
                    // Reset the file input
                    this.value = '';
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    const invalidFeedback = this.nextElementSibling;
                    if (invalidFeedback && invalidFeedback.classList.contains('invalid-feedback')) {
                        invalidFeedback.remove();
                    }
                }
            }
        });
    }

    // Form submission validation
    const form = document.querySelector('form[action="/submit_readequacao"]');
    if (form) {
        form.addEventListener('submit', function(event) {
            // Check if any invalid inputs exist
            const invalidInputs = form.querySelectorAll('.is-invalid');
            if (invalidInputs.length > 0) {
                event.preventDefault();
                // Scroll to the first invalid input
                invalidInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Create alert for user
                const alertDiv = document.createElement('div');
                alertDiv.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');
                alertDiv.innerHTML = 'Por favor, corrija os erros no formulário antes de enviar.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

                // Insert alert at the top of the form
                form.insertBefore(alertDiv, form.firstChild);
            }
        });
    }

    // Add form submission protection
    const form2 = document.querySelector('form[action="/submit_readequacao"]');
    if (form2) {
        form2.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
                const alertDiv = document.createElement('div');
                alertDiv.classList.add('alert', 'alert-info', 'alert-dismissible', 'fade', 'show', 'mt-4', 'mb-4', 'text-center');
                alertDiv.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Aguarde! Readequação sendo processada. Este processo pode levar por volta de 1 minuto.<br><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
                submitButton.parentElement.parentElement.insertAdjacentElement('afterend', alertDiv);
            }
        });
    }

    // Dismiss alerts after 5 seconds
    document.querySelectorAll('.alert:not(.alert-danger)').forEach(function(alert) {
        setTimeout(function() {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            }
        }, 5000);
    });
});

// Function to safely get input value
function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : '';
}

// Function to safely get hidden value
function getHiddenValue(elementName) {
    const element = document.querySelector(`input[name="original_${elementName}"]`);
    if (!element) return '';
    const value = element.value;
    return value === '""' || value === 'None' ? '' : value;
}

// Function to check if value is empty
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    return value.trim() === '' || value === 'None' || value === '""';
}

// Define field mappings
const fields = {
    'data__1': {
        inputId: 'novaDataEntregaAEREO',
        resumeId: 'resumo-data__1',
        newValueId: 'nova-data__1'
    },
    'date3__1': {
        inputId: 'novaDataEntregaTERRESTRE',
        resumeId: 'resumo-date3__1',
        newValueId: 'nova-date3__1'
    },
    'date9__1': {
        inputId: 'novaDataEntregaCRIACAO',
        resumeId: 'resumo-date9__1',
        newValueId: 'nova-date9__1'
    },
    'date7__1': {
        inputId: 'novaDataEntregaSALES',
        resumeId: 'resumo-date7__1',
        newValueId: 'nova-date7__1'
    },
    'texto16__1': {
        inputId: 'novaOpcao1A',
        resumeId: 'resumo-texto16__1',
        newValueId: 'nova-texto16__1'
    },
    'dup__of_op__o_1a__1': {
        inputId: 'novaOpcao1B',
        resumeId: 'resumo-dup__of_op__o_1a__1',
        newValueId: 'nova-dup__of_op__o_1a__1'
    },
    'text0__1': {
        inputId: 'novaOpcao1C',
        resumeId: 'resumo-text0__1',
        newValueId: 'nova-text0__1'
    },
    'dup__of_op__o_1c0__1': {
        inputId: 'novaOpcao2A',
        resumeId: 'resumo-dup__of_op__o_1c0__1',
        newValueId: 'nova-dup__of_op__o_1c0__1'
    },
    'dup__of_op__o_1c5__1': {
        inputId: 'novaOpcao2B',
        resumeId: 'resumo-dup__of_op__o_1c5__1',
        newValueId: 'nova-dup__of_op__o_1c5__1'
    },
    'dup__of_op__o_1c__1': {
        inputId: 'novaOpcao2C',
        resumeId: 'resumo-dup__of_op__o_1c__1',
        newValueId: 'nova-dup__of_op__o_1c__1'
    },
    'dup__of_op__o_2c__1': {
        inputId: 'novaOpcao3A',
        resumeId: 'resumo-dup__of_op__o_2c__1',
        newValueId: 'nova-dup__of_op__o_2c__1'
    },
    'dup__of_op__o_3a__1': {
        inputId: 'novaOpcao3B',
        resumeId: 'resumo-dup__of_op__o_3a__1',
        newValueId: 'nova-dup__of_op__o_3a__1'
    },
    'dup__of_op__o_3b__1': {
        inputId: 'novaOpcao3C',
        resumeId: 'resumo-dup__of_op__o_3b__1',
        newValueId: 'nova-dup__of_op__o_3b__1'
    },
    'dup__of_op__o_3c9__1': {
        inputId: 'novaOpcao4A',
        resumeId: 'resumo-dup__of_op__o_3c9__1',
        newValueId: 'nova-dup__of_op__o_3c9__1'
    },
    'dup__of_op__o_3c4__1': {
        inputId: 'novaOpcao4B',
        resumeId: 'resumo-dup__of_op__o_3c4__1',
        newValueId: 'nova-dup__of_op__o_3c4__1'
    },
    'dup__of_op__o_3c__1': {
        inputId: 'novaOpcao4C',
        resumeId: 'resumo-dup__of_op__o_3c__1',
        newValueId: 'nova-dup__of_op__o_3c__1'
    }
};

        function atualizarResumoMudancas() {
            let hasChanges = false;

            // Process each field
            Object.entries(fields).forEach(([fieldName, fieldInfo]) => {
                const currentValue = getInputValue(fieldInfo.inputId);
                const originalValue = getHiddenValue(fieldName);
                const resumeElem = document.getElementById(fieldInfo.resumeId);
                const newValueElem = document.getElementById(fieldInfo.newValueId);

                if (!resumeElem || !newValueElem) return;

                const deleteButton = document.querySelector(`button[data-target="${fieldInfo.inputId}"]`);
                if (!deleteButton) return;

                const isDeleted = deleteButton.classList.contains('disabled');

                if (isDeleted) {
                    resumeElem.style.display = 'block';
                    newValueElem.textContent = 'Apagado';
                    hasChanges = true;
                } else if (currentValue && currentValue !== originalValue && !isEmpty(currentValue)) {
                    resumeElem.style.display = 'block';
                    newValueElem.textContent = currentValue;
                    hasChanges = true;
                } else {
                    resumeElem.style.display = 'none';
                }
            });



    // Update no changes message
    const semMudancas = document.getElementById('sem-mudancas');
    if (semMudancas) {
        semMudancas.style.display = hasChanges ? 'none' : 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const deleteOverlays = document.querySelectorAll('.delete-overlay');

    deleteOverlays.forEach(overlay => {
        const targetId = overlay.dataset.target;
        const inputElement = document.getElementById(targetId);

        if (inputElement) {
            overlay.innerHTML = `
                <div class="banner">
                    <span>O destino será cancelado</span>
                </div>
            `;
        }
    });
});

        // Get all visible items in Resumo de Mudanças
        const visibleResumes = Array.from(document.querySelectorAll('.mudanca-item')).filter(item => 
            item.style.display === 'block' || getComputedStyle(item).display === 'block'
        );

        const deletedFields = {};
        const columnValues = {};

        // Map field IDs to their Monday column names
        const fieldToColumnMap = {
            'texto16__1': '1A',
            'dup__of_op__o_1c0__1': '2A',
            'dup__of_op__o_2c__1': '3A',
            'dup__of_op__o_3c9__1': '4A',
            'dup__of_op__o_1a__1': '1B',
            'text0__1': '1C',
            'dup__of_op__o_1c5__1': '2B',
            'dup__of_op__o_1c__1': '2C',
            'dup__of_op__o_3a__1': '3B',
            'dup__of_op__o_3b__1': '3C',
            'dup__of_op__o_3c4__1': '4B',
            'dup__of_op__o_3c__1': '4C'
        };

        // Check each visible resume item
        visibleResumes.forEach(resumeItem => {
            const resumeId = resumeItem.id.replace('resumo-', '');
            const section = fieldToColumnMap[resumeId];
            
            if (section) {
                const deleteButton = document.querySelector(`button[data-section="${section}"]`);
                if (deleteButton && deleteButton.classList.contains('disabled')) {
                    deletedFields[`deleted_${section}`] = true;
                    columnValues[resumeId] = null;
                }
            }
        });