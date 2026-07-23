import React, { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    dob: '',
    profileImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [submittedUser, setSubmittedUser] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, profileImage: file });
        setImagePreview(URL.createObjectURL(file));
        setErrors({ ...errors, profileImage: '' });
      }
    } else if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: onlyNums });
      setErrors({ ...errors, phone: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain numbers only";
    } else if (formData.phone.length !== 11) {
      newErrors.phone = `Phone number must be exactly 11 digits (Current: ${formData.phone.length})`;
    }

    if (!formData.department) {
      newErrors.department = "Department selection is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.profileImage) {
      newErrors.profileImage = "Please upload a profile picture";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: '',
      dob: '',
      profileImage: null
    });
    setImagePreview(null);
    setErrors({});
    setToast({ message: '', type: '' });
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ message: '', type: '' });

    if (!validate()) {
      setToast({ message: 'Please review and fix the highlighted fields below.', type: 'error' });
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('department', formData.department);
    data.append('dob', formData.dob);
    data.append('profileImage', formData.profileImage);

    try {
      const response = await fetch('http://localhost:5000/api/submit-form', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmittedUser(formData.fullName);
        resetForm();
        setCurrentPage('success');
      } else {
        setToast({ message: result.message, type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Unable to connect to the backend server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.appContainer}>

        {/* Top Navbar */}
        <div style={styles.navbar}>
          <div style={styles.brandLogo}>
            <span style={styles.brandIcon}>🎓</span> Student Portal
          </div>
          <div style={styles.stepTrack}>
            <span style={currentPage === 'home' ? styles.stepActive : styles.stepInactive}>01 Overview</span>
            <span style={styles.stepDot}>•</span>
            <span style={currentPage === 'form' ? styles.stepActive : styles.stepInactive}>02 Registration</span>
            <span style={styles.stepDot}>•</span>
            <span style={currentPage === 'success' ? styles.stepActive : styles.stepInactive}>03 Confirmation</span>
          </div>
        </div>

        {/* 🟢 PAGE 1: ELEGANT PORTAL HOME */}
        {currentPage === 'home' && (
          <div style={styles.whiteCard}>
            <div style={styles.pillBadge}>
              <span style={styles.pillDot}></span> Official Enrollment System
            </div>
            
            <h1 style={styles.headingPrimary}>Academic Student Gateway</h1>
            <p style={styles.subtextText}>
              Welcome to the central registration system. Please complete the digital application form to verify your identity and finalize your enrollment.
            </p>

            <div style={styles.gridInfoBox}>
              <div style={styles.infoTile}>
                <div style={styles.infoTileIcon}>📁</div>
                <div>
                  <h4 style={styles.infoTileTitle}>Fast Uploads</h4>
                  <p style={styles.infoTileDesc}>Multer File Storage</p>
                </div>
              </div>
              <div style={styles.infoTile}>
                <div style={styles.infoTileIcon}>🗄️</div>
                <div>
                  <h4 style={styles.infoTileTitle}>MySQL Database</h4>
                  <p style={styles.infoTileDesc}>Synced & Secure Record</p>
                </div>
              </div>
            </div>

            <button 
              style={styles.btnPrimary} 
              onClick={() => setCurrentPage('form')}
            >
              Fill Student Form →
            </button>
          </div>
        )}

        {/* 🔵 PAGE 2: HIGH-CONTRAST APPLICATION FORM */}
        {currentPage === 'form' && (
          <div style={styles.whiteCard}>
            <div style={styles.cardHeaderFlex}>
              <button style={styles.backButton} onClick={() => setCurrentPage('home')}>
                ← Back
              </button>
              <span style={styles.formTag}>Application #2026</span>
            </div>

            <h2 style={styles.headingSecondary}>Student Details Form</h2>
            <p style={styles.subtextText}>Please provide accurate credentials for your official records.</p>

            {toast.message && (
              <div style={toast.type === 'success' ? styles.toastBoxSuccess : styles.toastBoxError}>
                {toast.message}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={styles.formLayout}>
              
              {/* Full Name */}
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  Full Name <span style={styles.reqAsterisk}>*</span>
                </label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder="e.g. Hammayal Chaudry" 
                  style={errors.fullName ? styles.inputError : styles.inputBase} 
                />
                {errors.fullName && <span style={styles.errorText}>{errors.fullName}</span>}
              </div>

              {/* Email & Phone */}
              <div style={styles.twoColumnGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>
                    Email Address <span style={styles.reqAsterisk}>*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="student@domain.com" 
                    style={errors.email ? styles.inputError : styles.inputBase} 
                  />
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>

                <div style={styles.formGroup}>
                  <div style={styles.labelFlex}>
                    <label style={styles.inputLabel}>
                      Phone Number <span style={styles.reqAsterisk}>*</span>
                    </label>
                    <span style={styles.charCounter}>{formData.phone.length}/11</span>
                  </div>
                  <input 
                    type="text" 
                    name="phone" 
                    maxLength="11"
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="03001234567" 
                    style={errors.phone ? styles.inputError : styles.inputBase} 
                  />
                  {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                </div>
              </div>

              {/* Department & DOB */}
              <div style={styles.twoColumnGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>
                    Department <span style={styles.reqAsterisk}>*</span>
                  </label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    style={errors.department ? styles.inputError : styles.selectBase}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                  {errors.department && <span style={styles.errorText}>{errors.department}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>
                    Date of Birth <span style={styles.reqAsterisk}>*</span>
                  </label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    style={errors.dob ? styles.inputError : styles.inputBase} 
                  />
                  {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
                </div>
              </div>

              {/* Profile Image Dropzone */}
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>
                  Profile Picture <span style={styles.reqAsterisk}>*</span>
                </label>
                <div style={errors.profileImage ? styles.uploadBoxError : styles.uploadBoxBase}>
                  {imagePreview ? (
                    <div style={styles.previewFlex}>
                      <img src={imagePreview} alt="Avatar" style={styles.avatarImg} />
                      <div>
                        <p style={styles.fileNameText}>{formData.profileImage?.name}</p>
                        <span style={styles.changeText}>Click to select another photo</span>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.uploadPlaceholder}>
                      <div style={styles.uploadIcon}>📷</div>
                      <p style={styles.uploadMainText}>Upload profile photo</p>
                      <p style={styles.uploadSubText}>PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input 
                    id="imageInput"
                    type="file" 
                    name="profileImage" 
                    accept="image/*" 
                    onChange={handleChange} 
                    style={styles.hiddenFileInput} 
                  />
                </div>
                {errors.profileImage && <span style={styles.errorText}>{errors.profileImage}</span>}
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={loading ? styles.btnDisabled : styles.btnPrimary}
              >
                {loading ? 'Submitting Record...' : 'Submit Application →'}
              </button>

            </form>
          </div>
        )}

        {/* 🎉 PAGE 3: SOFT GREEN RECEIPT CONFIRMATION */}
        {currentPage === 'success' && (
          <div style={styles.whiteCardCenter}>
            <div style={styles.greenTickCircle}>✓</div>

            <h1 style={styles.headingPrimary}>Form Submitted!</h1>
            <p style={styles.subtextText}>
              Thank you, <strong style={{ color: '#0F172A' }}>{submittedUser || 'Student'}</strong>! Your information and document have been successfully recorded in our MySQL database.
            </p>

            <div style={styles.receiptBox}>
              <div style={styles.receiptRow}>
                <span>Status:</span>
                <strong style={{ color: '#0D9488' }}>● Verified & Saved</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Recorded On:</span>
                <strong style={{ color: '#0F172A' }}>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={styles.buttonFlex}>
              <button 
                style={styles.btnPrimary} 
                onClick={() => setCurrentPage('form')}
              >
                Submit Another Form
              </button>
              <button 
                style={styles.btnOutline} 
                onClick={() => setCurrentPage('home')}
              >
                Back to Gateway
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// 🎨 High Contrast Dark Background Stylesheet
const styles = {
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: '#0B0F17', // Rich Dark Background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 15px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  appContainer: {
    width: '100%',
    maxWidth: '520px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 8px'
  },
  brandLogo: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#FFFFFF', // Crisp White Logo Text
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  brandIcon: {
    fontSize: '18px'
  },
  stepTrack: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  stepActive: {
    color: '#14B8A6',
    fontWeight: '700'
  },
  stepInactive: {
    color: '#64748B'
  },
  stepDot: {
    color: '#334155'
  },

  // Main Cards
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px 32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)', // Deep floating shadow on dark bg
    border: '1px solid #1E293B',
    boxSizing: 'border-box'
  },
  whiteCardCenter: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px 32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
    border: '1px solid #1E293B',
    textAlign: 'center',
    boxSizing: 'border-box'
  },

  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F0FDF4',
    color: '#166534',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '16px',
    border: '1px solid #DCFCE7'
  },
  pillDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#16A34A',
    borderRadius: '50%'
  },
  headingPrimary: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px'
  },
  headingSecondary: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 6px 0'
  },
  subtextText: {
    fontSize: '13px',
    color: '#64748B',
    lineHeight: '1.6',
    margin: '0 0 24px 0'
  },

  // Grid Info Tiles
  gridInfoBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '28px'
  },
  infoTile: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  infoTileIcon: { fontSize: '18px' },
  infoTileTitle: { margin: 0, fontSize: '12px', fontWeight: '700', color: '#0F172A' },
  infoTileDesc: { margin: 0, fontSize: '10px', color: '#64748B' },

  // Buttons
  btnPrimary: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
  },
  btnDisabled: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#94A3B8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'not-allowed'
  },
  btnOutline: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },

  // Form Elements
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0
  },
  formTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0D9488',
    backgroundColor: '#CCFBF1',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  formLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGroup: {
    textAlign: 'left'
  },
  labelFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px'
  },
  reqAsterisk: { color: '#EF4444' },
  charCounter: { fontSize: '10px', color: '#94A3B8', fontWeight: '600' },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  inputBase: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    outline: 'none',
    fontSize: '13px',
    color: '#0F172A',
    boxSizing: 'border-box'
  },
  selectBase: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    outline: 'none',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFF',
    boxSizing: 'border-box'
  },
  inputError: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    border: '1px solid #EF4444',
    backgroundColor: '#FEF2F2',
    outline: 'none',
    fontSize: '13px',
    color: '#991B1B',
    boxSizing: 'border-box'
  },
  errorText: {
    color: '#DC2626',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '4px',
    display: 'block'
  },

  // Dropzone
  uploadBoxBase: {
    position: 'relative',
    border: '2px dashed #CBD5E1',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    cursor: 'pointer'
  },
  uploadBoxError: {
    position: 'relative',
    border: '2px dashed #FCA5A5',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    cursor: 'pointer'
  },
  hiddenFileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  uploadPlaceholder: { pointerEvents: 'none' },
  uploadIcon: { fontSize: '20px', marginBottom: '2px' },
  uploadMainText: { margin: 0, fontSize: '12px', fontWeight: '700', color: '#334155' },
  uploadSubText: { margin: '2px 0 0 0', fontSize: '10px', color: '#94A3B8' },
  previewFlex: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatarImg: { width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' },
  fileNameText: { margin: 0, fontSize: '12px', fontWeight: '700', color: '#0F172A' },
  changeText: { fontSize: '10px', color: '#0D9488', fontWeight: '600' },

  // Success Confirmation
  greenTickCircle: {
    width: '70px',
    height: '70px',
    backgroundColor: '#F0FDF4',
    color: '#0D9488',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 auto 20px auto',
    border: '1px solid #CCFBF1'
  },
  receiptBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px'
  },
  receiptRow: { display: 'flex', justifyContent: 'space-between', color: '#64748B' },
  buttonFlex: { display: 'flex', flexDirection: 'column', gap: '10px' },

  // Toasts
  toastBoxSuccess: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#166534',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '14px'
  },
  toastBoxError: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '14px'
  }
};

export default App;
