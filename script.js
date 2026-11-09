// State & LocalStorage Keys
const STORAGE_PREFIX = "mediqueue_";

// 1. Doctors Data with Individual Login Credentials for Every Doctor
const defaultDoctors = [
  {
    id: "doc_rao",
    name: "Dr. Arvind Rao, MD",
    deptId: "gen",
    deptName: "General Medicine",
    room: "OPD 104",
    avgTime: 10,
    email: "dr.rao@hospital.org",
    password: "rao@med104",
    currentToken: 12,
    waitingCount: 3
  },
  {
    id: "doc_sen",
    name: "Dr. Sunita Sen, DCH",
    deptId: "ped",
    deptName: "Pediatrics (Child OPD)",
    room: "OPD 202",
    avgTime: 12,
    email: "dr.sen@hospital.org",
    password: "sen@ped202",
    currentToken: 8,
    waitingCount: 2
  },
  {
    id: "doc_mehta",
    name: "Dr. K. Mehta, MS",
    deptId: "ortho",
    deptName: "Orthopedics & Joint",
    room: "OPD 110",
    avgTime: 15,
    email: "dr.mehta@hospital.org",
    password: "mehta@ortho110",
    currentToken: 6,
    waitingCount: 4
  },
  {
    id: "doc_ali",
    name: "Dr. Farhan Ali, DM",
    deptId: "cardio",
    deptName: "Cardiology Screening",
    room: "OPD 305",
    avgTime: 15,
    email: "dr.ali@hospital.org",
    password: "ali@cardio305",
    currentToken: 4,
    waitingCount: 2
  },
  {
    id: "doc_nayak",
    name: "Dr. R. Nayak, MS",
    deptId: "ent",
    deptName: "ENT (Ear, Nose & Throat)",
    room: "OPD 108",
    avgTime: 10,
    email: "dr.nayak@hospital.org",
    password: "nayak@ent108",
    currentToken: 14,
    waitingCount: 5
  },
  {
    id: "doc_sharma",
    name: "Dr. P. Sharma, MD",
    deptId: "derma",
    deptName: "Dermatology / Skin",
    room: "OPD 214",
    avgTime: 10,
    email: "dr.sharma@hospital.org",
    password: "sharma@skin214",
    currentToken: 9,
    waitingCount: 3
  }
];

// Available 20-minute OPD slots
const ALL_20MIN_SLOTS = [
  "09:00 AM - 09:20 AM",
  "09:20 AM - 09:40 AM",
  "09:40 AM - 10:00 AM",
  "10:00 AM - 10:20 AM",
  "10:20 AM - 10:40 AM",
  "10:40 AM - 11:00 AM",
  "11:20 AM - 11:40 AM",
  "11:40 AM - 12:00 PM",
  "12:00 PM - 12:20 PM",
  "12:20 PM - 12:40 PM",
  "02:00 PM - 02:20 PM",
  "02:20 PM - 02:40 PM",
  "02:40 PM - 03:00 PM",
  "03:00 PM - 03:20 PM",
  "03:20 PM - 03:40 PM",
  "03:40 PM - 04:00 PM"
];

// On-Duty Emergency Medical Officers (EMO)
const emergencyDoctors = [
  { name: "Dr. Vikram Deshmukh", role: "Chief Trauma Specialist", phone: "+91 98201 11999", room: "Emergency Bay 1" },
  { name: "Dr. Neha Kulkarni", role: "Critical Care & Resuscitation", phone: "+91 98201 22888", room: "ICU Triage" },
  { name: "Dr. Tariq Sheikh", role: "Acute Surgical Resident", phone: "+91 98201 33777", room: "Trauma OT" }
];

// Storage Helpers
function getDoctors() {
  const stored = localStorage.getItem(STORAGE_PREFIX + "doctors");
  if (!stored) {
    localStorage.setItem(STORAGE_PREFIX + "doctors", JSON.stringify(defaultDoctors));
    return defaultDoctors;
  }
  return JSON.parse(stored);
}

function saveDoctors(docs) {
  localStorage.setItem(STORAGE_PREFIX + "doctors", JSON.stringify(docs));
}

function getBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "all_bookings") || "[]");
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_PREFIX + "all_bookings", JSON.stringify(bookings));
}

function getActiveUser() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_user") || "null");
}

function getActiveDoctor() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_doc") || "null");
}

function getMyToken() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "my_token") || "null");
}

// Navigation
function navigateTo(viewName) {
  const views = ["home", "book", "track", "patient", "doctor", "auth"];
  views.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.classList.add("hidden");
    const navBtn = document.getElementById("nav-" + v);
    if (navBtn) navBtn.classList.remove("active");
  });

  const targetView = document.getElementById("view-" + viewName);
  if (targetView) targetView.classList.remove("hidden");

  const targetBtn = document.getElementById("nav-" + viewName);
  if (targetBtn) targetBtn.classList.add("active");

  window.scrollTo(0, 0);

  if (viewName === "home") renderHome();
  if (viewName === "track") renderLiveQueueBoard();
  if (viewName === "book") renderBookingForm();
  if (viewName === "patient") renderPatientTokenView();
  if (viewName === "doctor") renderDoctorDesk();
  updateAuthHeader();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function updateAuthHeader() {
  const authBox = document.getElementById("auth-header-actions");
  const user = getActiveUser();
  if (user) {
    authBox.innerHTML = `
      <span class="user-name-tag">👤 ${user.name.split(" ")[0]}</span>
      <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Sign Out</button>
    `;
  } else {
    authBox.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="navigateTo('auth')">Sign In / Register</button>
    `;
  }
}

// 1. HOME VIEW
function renderHome() {
  const container = document.getElementById("home-dept-list");
  const docs = getDoctors();
  container.innerHTML = docs.map(d => {
    const waitMins = d.waitingCount * d.avgTime;
    return `
      <div class="card">
        <h3 style="color:var(--primary-navy); margin-bottom:0.25rem;">${d.deptName}</h3>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:0.75rem;">${d.name} • ${d.room}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
          <span style="font-size:0.9rem;">Waiting: <strong>${d.waitingCount}</strong></span>
          <span style="font-size:0.95rem; font-weight:700; color:var(--medical-blue);">~${waitMins} mins wait</span>
        </div>
      </div>
    `;
  }).join("");
}

function handleStartBooking() {
  const user = getActiveUser();
  if (!user) {
    showToast("Please create an account or sign in first.");
    navigateTo("auth");
  } else {
    navigateTo("book");
  }
}

// 2. BOOKING VIEW & DYNAMIC 20-MINUTE SLOT LOCKING
function renderBookingForm() {
  const docs = getDoctors();
  const deptSelect = document.getElementById("book-department");

  // Unique departments from doctors
  const depts = [];
  docs.forEach(d => {
    if (!depts.find(item => item.id === d.deptId)) {
      depts.push({ id: d.deptId, name: d.deptName });
    }
  });

  deptSelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join("");

  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("book-date");
  if (!dateInput.value) {
    dateInput.value = today;
  }
  dateInput.min = today;

  onDepartmentSelectChange();
}

function onDepartmentSelectChange() {
  const deptId = document.getElementById("book-department").value;
  const docs = getDoctors();
  const filteredDocs = docs.filter(d => d.deptId === deptId);

  const docSelect = document.getElementById("book-doctor");
  docSelect.innerHTML = filteredDocs.map(d => `<option value="${d.id}">${d.name} (${d.room})</option>`).join("");

  onDoctorOrDateChange();
}

function onDoctorOrDateChange() {
  const docId = document.getElementById("book-doctor").value;
  const date = document.getElementById("book-date").value;
  const docs = getDoctors();
  const doc = docs.find(d => d.id === docId) || docs[0];

  updateBookingPreview(doc);
  populateAvailableSlots(doc.id, date);
}

// Filters out already booked slots for this doctor on this specific date
function populateAvailableSlots(doctorId, date) {
  const slotSelect = document.getElementById("book-slot");
  const bookings = getBookings();

  // Find all slots already reserved for this doctor on this date
  const bookedSlots = bookings
    .filter(b => b.doctorId === doctorId && b.appointmentDate === date && b.status !== "cancelled")
    .map(b => b.timeSlot);

  // Remaining free slots
  const freeSlots = ALL_20MIN_SLOTS.filter(slot => !bookedSlots.includes(slot));

  if (freeSlots.length === 0) {
    slotSelect.innerHTML = `<option value="">⚠️ No slots available for this date (All Booked)</option>`;
    slotSelect.disabled = true;
    document.getElementById("btn-submit-booking").disabled = true;
  } else {
    slotSelect.disabled = false;
    document.getElementById("btn-submit-booking").disabled = false;
    slotSelect.innerHTML = freeSlots
      .map(slot => `<option value="${slot}">${slot}</option>`)
      .join("");
  }
}

function updateBookingPreview(doc) {
  document.getElementById("preview-doc-name").innerText = doc.name;
  document.getElementById("preview-doc-dept").innerText = `${doc.deptName} • ${doc.room}`;
  document.getElementById("preview-doc-queue").innerText = `${doc.waitingCount} Patients Waiting`;
  
  const estimatedWait = doc.waitingCount * doc.avgTime;
  document.getElementById("preview-doc-wait").innerText = `~${estimatedWait} Mins Wait Time`;
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const user = getActiveUser();
  if (!user) {
    showToast("Session expired. Please log in.");
    navigateTo("auth");
    return;
  }

  const docId = document.getElementById("book-doctor").value;
  const date = document.getElementById("book-date").value;
  const slot = document.getElementById("book-slot").value;

  if (!slot) {
    alert("Please select a valid time slot.");
    return;
  }

  const docs = getDoctors();
  const doc = docs.find(d => d.id === docId);

  // Increase queue count and assign token
  doc.waitingCount += 1;
  const newTokenNum = doc.currentToken + doc.waitingCount;
  const tokenCode = `MQ-${doc.deptId.toUpperCase()}-${newTokenNum}`;

  saveDoctors(docs);

  // Save to global bookings list to lock this slot
  const bookings = getBookings();
  const newBooking = {
    bookingId: "BKG-" + Date.now().toString().slice(-5),
    doctorId: doc.id,
    doctorName: doc.name,
    patientId: user.id,
    patientName: user.name,
    patientPhone: user.phone,
    department: doc.deptName,
    room: doc.room,
    appointmentDate: date,
    timeSlot: slot,
    tokenCode: tokenCode,
    tokenNumber: newTokenNum,
    status: "active",
    bookedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
  bookings.push(newBooking);
  saveBookings(bookings);

  // Store user's active token
  localStorage.setItem(STORAGE_PREFIX + "my_token", JSON.stringify(newBooking));

  showToast(`Token ${tokenCode} booked for ${slot}!`);
  navigateTo("patient");
}

// 3. LIVE QUEUE VIEW
function renderLiveQueueBoard() {
  const container = document.getElementById("queue-board-list");
  const docs = getDoctors();

  container.innerHTML = docs.map(d => {
    const waitTime = d.waitingCount * d.avgTime;
    return `
      <div class="card" style="border-top:3px solid var(--primary-navy);">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
          <div>
            <h3 style="font-size:1.15rem; color:var(--primary-navy);">${d.deptName}</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">${d.room}</span>
          </div>
          <span style="background:#e0f2fe; color:#0369a1; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700; font-size:0.85rem;">Active</span>
        </div>
        <p style="font-weight:600; font-size:0.95rem; margin-bottom:1rem;">${d.name}</p>
        <div style="background:#f8fafc; border:1px solid var(--border-subtle); padding:1rem; border-radius:6px; margin-bottom:1rem; text-align:center;">
          <div style="font-size:0.85rem; color:var(--text-muted);">Currently Consulting Token</div>
          <div style="font-size:2rem; font-weight:800; color:var(--primary-navy);">MQ-${d.deptId.toUpperCase()}-${d.currentToken}</div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.92rem;">
          <span>Patients Waiting: <strong>${d.waitingCount}</strong></span>
          <span style="color:var(--medical-blue); font-weight:700;">~${waitTime} mins wait</span>
        </div>
      </div>
    `;
  }).join("");
}

// 4. PATIENT TOKEN DASHBOARD
function renderPatientTokenView() {
  const container = document.getElementById("patient-token-container");
  const token = getMyToken();
  const docs = getDoctors();

  if (!token) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem 1.5rem; max-width:550px; margin:0 auto;">
        <h3 style="color:var(--primary-navy); margin-bottom:0.5rem;">No Active Token Found</h3>
        <p class="text-muted" style="margin-bottom:1.5rem;">You do not currently have an active OPD appointment token booked.</p>
        <button class="btn btn-primary" onclick="handleStartBooking()">Book a Token Now</button>
      </div>
    `;
    return;
  }

  const doc = docs.find(d => d.id === token.doctorId) || { currentToken: token.tokenNumber - 1, avgTime: 10 };
  const patientsAhead = Math.max(0, token.tokenNumber - doc.currentToken - 1);
  const waitMins = patientsAhead * doc.avgTime;

  container.innerHTML = `
    <div class="token-display-box">
      <span class="badge">Confirmed Appointment Token</span>
      <div class="token-huge">${token.tokenCode}</div>
      <p style="color:var(--text-muted); font-size:0.95rem;">Patient: <strong>${token.patientName}</strong></p>
      
      <div class="wait-callout">
        ${patientsAhead === 0 ? "You're Next! Proceed to consultation room." : `~${waitMins} Minutes (${patientsAhead} patients ahead)`}
      </div>

      <table class="info-table">
        <tr>
          <td>Department</td>
          <td>${token.department}</td>
        </tr>
        <tr>
          <td>Doctor</td>
          <td>${token.doctorName}</td>
        </tr>
        <tr>
          <td>Room</td>
          <td>${token.room}</td>
        </tr>
        <tr>
          <td>Reserved Slot</td>
          <td><strong style="color:var(--primary-navy);">${token.timeSlot}</strong> (${token.appointmentDate})</td>
        </tr>
        <tr>
          <td>Doctor Currently Serving</td>
          <td>MQ-${doc.deptId.toUpperCase()}-${doc.currentToken}</td>
        </tr>
      </table>

      <div style="margin-top:1.8rem; display:flex; gap:0.75rem;">
        <button class="btn btn-secondary flex-1" onclick="navigateTo('track')">View Full Queue</button>
        <button class="btn btn-danger flex-1" onclick="handleCancelToken()">Cancel Token</button>
      </div>
    </div>
  `;
}

function handleCancelToken() {
  if (confirm("Are you sure you want to cancel this appointment? This will release your reserved slot for other patients.")) {
    const token = getMyToken();
    if (token) {
      // 1. Release slot in bookings
      const bookings = getBookings();
      const bIndex = bookings.findIndex(b => b.tokenCode === token.tokenCode);
      if (bIndex !== -1) {
        bookings[bIndex].status = "cancelled";
        saveBookings(bookings);
      }

      // 2. Reduce queue count for doctor
      const docs = getDoctors();
      const doc = docs.find(d => d.id === token.doctorId);
      if (doc && doc.waitingCount > 0) {
        doc.waitingCount -= 1;
        saveDoctors(docs);
      }
    }
    localStorage.removeItem(STORAGE_PREFIX + "my_token");
    showToast("Token cancelled. Slot released.");
    renderPatientTokenView();
  }
}

// 5. DOCTOR AUTHENTICATION & DESK
function renderDoctorDesk() {
  const container = document.getElementById("doctor-view-container");
  const activeDoc = getActiveDoctor();
  const docs = getDoctors();

  if (!activeDoc) {
    // Render Doctor Login with a clear credentials directory
    container.innerHTML = `
      <div class="auth-card">
        <div class="form-header">
          <h2>Doctor Consultation Desk Login</h2>
          <p>Secure login for individual hospital doctors & department specialists.</p>
        </div>
        <form onsubmit="handleDoctorLogin(event)">
          <div class="form-group">
            <label>Doctor's Official Email</label>
            <input type="email" id="doc-email" class="form-input" placeholder="e.g. dr.rao@hospital.org" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="doc-pass" class="form-input" placeholder="Enter password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Access My Consultation Desk</button>
        </form>

        <div style="margin-top:1.5rem; background:#f8fafc; border:1px solid var(--border-color); border-radius:6px; padding:1rem;">
          <strong style="display:block; font-size:0.9rem; margin-bottom:0.5rem; color:var(--primary-navy);">
            📋 Demo Doctor Login Directory (Click to Auto-Fill):
          </strong>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.82rem;">
            ${docs.map(d => `
              <div style="padding:0.4rem; background:#fff; border:1px solid #e2e8f0; border-radius:4px; cursor:pointer;" onclick="autofillDocLogin('${d.email}','${d.password}')">
                <strong>${d.name.split(',')[0]}</strong><br>
                <span class="text-muted">${d.deptName.split(' ')[0]}</span><br>
                <span style="color:var(--medical-blue); font-family:monospace;">${d.email}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Active Doctor Dashboard
  const currentDoc = docs.find(d => d.id === activeDoc.id) || activeDoc;
  const bookings = getBookings().filter(b => b.doctorId === currentDoc.id && b.status !== "cancelled");

  container.innerHTML = `
    <div class="form-container" style="max-width:850px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.5rem;">
        <div>
          <h2>${currentDoc.name}</h2>
          <p class="text-muted">${currentDoc.deptName} • Room: <strong>${currentDoc.room}</strong></p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="handleDoctorLogout()">Sign Out Desk</button>
      </div>

      <div class="grid grid-3" style="margin-bottom:1.5rem;">
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Currently Serving</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary-navy); margin:0.3rem 0;">
            MQ-${currentDoc.deptId.toUpperCase()}-${currentDoc.currentToken}
          </div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Patients in Queue</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--medical-blue); margin:0.3rem 0;">
            ${currentDoc.waitingCount}
          </div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Consultation Pace</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--text-main); margin:0.3rem 0;">
            ${currentDoc.avgTime}m / patient
          </div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:1.5rem; text-align:center; margin-bottom:1.5rem;">
        <h4 style="margin-bottom:0.4rem; color:var(--primary-navy);">Call Next Patient</h4>
        <p class="text-muted" style="font-size:0.95rem; margin-bottom:1.25rem;">
          Marks current consultation finished, advances to next token, and adjusts wait calculations for all upcoming patients.
        </p>
        <button class="btn btn-primary btn-lg" onclick="handleCallNextPatient('${currentDoc.id}')">
          ✓ Complete Consultation & Call Next Token
        </button>
      </div>

      <h3 style="font-size:1.15rem; margin-bottom:0.75rem; color:var(--primary-navy);">Upcoming Reserved Slots For You</h3>
      ${bookings.length === 0 ? '<p class="text-muted">No upcoming appointments booked yet.</p>' : `
        <table class="info-table" style="font-size:0.9rem;">
          <thead>
            <tr style="text-align:left; background:#f1f5f9;">
              <th style="padding:0.5rem;">Token</th>
              <th style="padding:0.5rem;">Patient Name</th>
              <th style="padding:0.5rem;">Phone</th>
              <th style="padding:0.5rem;">Slot Time</th>
              <th style="padding:0.5rem;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td style="padding:0.5rem;"><strong>${b.tokenCode}</strong></td>
                <td style="padding:0.5rem;">${b.patientName}</td>
                <td style="padding:0.5rem;">${b.patientPhone}</td>
                <td style="padding:0.5rem; color:var(--medical-blue); font-weight:600;">${b.timeSlot}</td>
                <td style="padding:0.5rem;">${b.appointmentDate}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function autofillDocLogin(email, pass) {
  document.getElementById("doc-email").value = email;
  document.getElementById("doc-pass").value = pass;
}

function handleDoctorLogin(e) {
  e.preventDefault();
  const email = document.getElementById("doc-email").value.trim().toLowerCase();
  const pass = document.getElementById("doc-pass").value;

  const docs = getDoctors();
  const found = docs.find(d => d.email.toLowerCase() === email && d.password === pass);

  if (found) {
    localStorage.setItem(STORAGE_PREFIX + "active_doc", JSON.stringify(found));
    showToast(`Logged in as ${found.name}`);
    renderDoctorDesk();
  } else {
    alert("Invalid doctor credentials. Please check your email or click one of the pre-filled demo accounts.");
  }
}

function handleDoctorLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_doc");
  showToast("Doctor logged out.");
  renderDoctorDesk();
}

function handleCallNextPatient(docId) {
  const docs = getDoctors();
  const doc = docs.find(d => d.id === docId);
  if (doc) {
    doc.currentToken += 1;
    if (doc.waitingCount > 0) {
      doc.waitingCount -= 1;
    }
    saveDoctors(docs);
    showToast(`Calling Token MQ-${doc.deptId.toUpperCase()}-${doc.currentToken}`);
    renderDoctorDesk();
  }
}

// 6. PATIENT AUTH (REGISTER & LOGIN)
function switchAuthTab(mode) {
  const loginForm = document.getElementById("patient-login-form");
  const regForm = document.getElementById("patient-register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabReg = document.getElementById("tab-register");

  if (mode === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabReg.classList.add("active");
  }
}

function handlePatientRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const age = document.getElementById("reg-age").value;
  const gender = document.getElementById("reg-gender").value;
  const phone = document.getElementById("reg-phone").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  const patients = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "patients") || "[]");

  const existing = patients.find(p => p.phone === phone || p.email === email);
  if (existing) {
    alert("An account with this phone or email already exists. Please log in.");
    switchAuthTab("login");
    return;
  }

  const newPatient = { id: "PAT-" + Date.now().toString().slice(-4), name, age, gender, phone, email, password };
  patients.push(newPatient);
  localStorage.setItem(STORAGE_PREFIX + "patients", JSON.stringify(patients));
  localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(newPatient));

  showToast(`Welcome, ${name}!`);
  navigateTo("book");
}

function handlePatientLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("login-identifier").value.trim();
  const pass = document.getElementById("login-password").value;

  const patients = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "patients") || "[]");
  const user = patients.find(p => (p.phone === identifier || p.email === identifier) && p.password === pass);

  if (user) {
    localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    navigateTo("home");
  } else {
    alert("Invalid credentials. If you are new, please switch to 'Create New Account'.");
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_user");
  showToast("You have been signed out.");
  updateAuthHeader();
  navigateTo("home");
}

// Render the Emergency Medical Officers at the bottom
function renderEmergencySection() {
  const container = document.getElementById("emergency-doctors-list");
  if (!container) return;

  container.innerHTML = emergencyDoctors.map(doc => `
    <div class="emergency-doc-card">
      <div>
        <div style="font-weight:700; font-size:0.95rem; color:#991b1b;">${doc.name}</div>
        <div style="font-size:0.85rem; color:#7f1d1d;">${doc.role} • ${doc.room}</div>
      </div>
      <a href="tel:${doc.phone.replace(/\\s+/g, '')}" class="btn-emergency-call">
        📞 Call EMO
      </a>
    </div>
  `).join("");
}

// Initial Boot
window.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderEmergencySection();
  updateAuthHeader();
});