// Grade points mapping - preserved from original
const gradePoints = {
  "A1": 8, "B2": 7, "B3": 6, "C4": 5,
  "C5": 4, "C6": 3, "D7": 2, "E8": 1, "F9": 0
};

// DOM elements
let form, jambInput, gradeSelects, calculateBtn, resultDiv;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeForm();
  addEventListeners();
});

function initializeElements() {
  form = document.getElementById('screeningForm');
  jambInput = document.getElementById('jamb');
  gradeSelects = document.querySelectorAll('.grade');
  calculateBtn = document.querySelector('.calculate-btn');
  resultDiv = document.getElementById('result');
  
  // Debug: Check if elements are found
  console.log('Form:', form);
  console.log('JAMB Input:', jambInput);
  console.log('Grade Selects:', gradeSelects.length);
  console.log('Calculate Button:', calculateBtn);
  console.log('Result Div:', resultDiv);
}

function initializeForm() {
  if (jambInput) jambInput.value = '';
  if (gradeSelects) {
    gradeSelects.forEach(select => select.value = '');
  }
  if (resultDiv) {
    resultDiv.innerHTML = '';
    resultDiv.className = 'result-display';
  }
}

function addEventListeners() {
  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // Input validation
  if (jambInput) {
    jambInput.addEventListener('input', validateJambScore);
    jambInput.addEventListener('input', updateFormValidity);
  }
  
  // Grade selection validation
  if (gradeSelects) {
    gradeSelects.forEach(select => {
      select.addEventListener('change', validateGrades);
      select.addEventListener('change', updateFormValidity);
    });
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  console.log('Form submitted');
  
  // Show loading state
  showLoading();
  
  // Calculate immediately
  setTimeout(() => {
    calculateScore();
  }, 300);
}

function showLoading() {
  if (calculateBtn) {
    calculateBtn.classList.add('loading');
    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Calculating...';
  }
  if (resultDiv) {
    resultDiv.innerHTML = '';
    resultDiv.className = 'result-display';
  }
}

function hideLoading() {
  if (calculateBtn) {
    calculateBtn.classList.remove('loading');
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Score';
  }
}

function calculateScore() {
  console.log('Calculating score...');
  
  // Get and validate JAMB score
  const jamb = Number(jambInput?.value || 0);
  console.log('JAMB score:', jamb);
  
  if (!validateJambInput(jamb)) {
    hideLoading();
    return;
  }
  
  // Get and validate O'Level grades
  const grades = getSelectedGrades();
  console.log('Selected grades:', grades);
  
  if (!validateGradeSelections(grades)) {
    hideLoading();
    return;
  }
  
  // Perform calculation using original formula
  const jambPercent = (jamb * 60) / 400;
  const olevelPoints = grades.reduce((acc, grade) => acc + (gradePoints[grade] || 0), 0);
  const total = jambPercent + olevelPoints;
  
  console.log('Calculation:', { jambPercent, olevelPoints, total });
  
  // Display result
  showResult(total, jamb, grades);
  hideLoading();
}

function validateJambInput(jamb) {
  if (isNaN(jamb) || jamb < 0 || jamb > 400) {
    showError("Please enter a valid JAMB score between 0 and 400.");
    return false;
  }
  return true;
}

function getSelectedGrades() {
  const grades = [];
  if (gradeSelects) {
    gradeSelects.forEach(select => {
      grades.push(select.value);
    });
  }
  return grades;
}

function validateGradeSelections(grades) {
  const emptyGrades = grades.filter(grade => !grade).length;
  if (emptyGrades > 0) {
    showError("Please select all 5 O'Level grades.");
    return false;
  }
  return true;
}

function showResult(total, jamb, grades) {
  const jambPercent = (jamb * 60) / 400;
  const olevelPoints = grades.reduce((acc, grade) => acc + (gradePoints[grade] || 0), 0);
  
  const resultHtml = `
    <div>
      Your UNIOSUN Screening Score: 
      <span class="score-highlight">${total.toFixed(2)}%</span>
    </div>
    <div style="font-size: var(--font-size-sm); margin-top: var(--space-8); color: var(--color-text-secondary);">
      JAMB: ${jamb}/400 (${jambPercent.toFixed(1)}%) + O'Level: ${olevelPoints} points
    </div>
  `;
  
  if (resultDiv) {
    resultDiv.innerHTML = resultHtml;
    resultDiv.className = 'result-display show';
  }
  
  console.log('Result displayed:', total.toFixed(2) + '%');
}

function showError(message) {
  console.log('Error:', message);
  if (resultDiv) {
    resultDiv.innerHTML = message;
    resultDiv.className = 'result-display error show';
    
    // Clear error after 5 seconds
    setTimeout(() => {
      if (resultDiv.classList.contains('error')) {
        resultDiv.innerHTML = '';
        resultDiv.className = 'result-display';
      }
    }, 5000);
  }
}

function validateJambScore() {
  if (!jambInput) return;
  
  const jamb = Number(jambInput.value);
  
  // Remove any existing validation styling
  jambInput.classList.remove('error');
  
  if (jambInput.value && (isNaN(jamb) || jamb < 0 || jamb > 400)) {
    jambInput.classList.add('error');
  }
}

function validateGrades() {
  if (!gradeSelects) return true;
  
  // Check if all grades are selected
  const allSelected = Array.from(gradeSelects).every(select => select.value);
  
  gradeSelects.forEach(select => {
    select.classList.remove('error');
    if (!select.value && hasAttemptedSubmission()) {
      select.classList.add('error');
    }
  });
  
  return allSelected;
}

function updateFormValidity() {
  if (!calculateBtn || !jambInput || !gradeSelects) return;
  
  const jambValid = jambInput.value && Number(jambInput.value) >= 0 && Number(jambInput.value) <= 400;
  const gradesValid = Array.from(gradeSelects).every(select => select.value);
  
  calculateBtn.disabled = !(jambValid && gradesValid);
}

function hasAttemptedSubmission() {
  return calculateBtn?.classList.contains('loading') || 
         (resultDiv?.innerHTML !== '');
}

// Add error styling to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .form-control.error {
    border-color: var(--color-error) !important;
    box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.1) !important;
  }
`;
document.head.appendChild(style);

// Add input formatting for better UX
document.addEventListener('DOMContentLoaded', function() {
  const jambInput = document.getElementById('jamb');
  if (jambInput) {
    jambInput.addEventListener('input', function() {
      // Ensure only numbers are entered
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // Limit to 3 digits (max 400)
      if (this.value.length > 3) {
        this.value = this.value.slice(0, 3);
      }
    });
  }
});

// Simple fallback calculation function for testing
window.testCalculation = function() {
  const jamb = 250;
  const grades = ['A1', 'B2', 'C4', 'B3', 'C5'];
  const jambPercent = (jamb * 60) / 400;
  const olevelPoints = grades.reduce((acc, grade) => acc + (gradePoints[grade] || 0), 0);
  const total = jambPercent + olevelPoints;
  
  console.log('Test calculation:', {
    jamb,
    grades,
    jambPercent: jambPercent.toFixed(2),
    olevelPoints,
    total: total.toFixed(2)
  });
  
  return total;
};

// Debug function to check if everything is working
window.debugApp = function() {
  console.log('=== DEBUG INFO ===');
  console.log('Form element:', document.getElementById('screeningForm'));
  console.log('JAMB input:', document.getElementById('jamb'));
  console.log('Grade selects:', document.querySelectorAll('.grade'));
  console.log('Calculate button:', document.querySelector('.calculate-btn'));
  console.log('Result div:', document.getElementById('result'));
  console.log('Grade points:', gradePoints);
  console.log('==================');
};

// Make sure the script runs after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    setTimeout(() => {
      if (typeof debugApp === 'function') {
        debugApp();
      }
    }, 100);
  });
} else {
  console.log('DOM already loaded');
  setTimeout(() => {
    if (typeof debugApp === 'function') {
      debugApp();
    }
  }, 100);
}