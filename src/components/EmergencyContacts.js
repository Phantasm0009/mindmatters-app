import React, { useState, useEffect } from 'react';
import './EmergencyContacts.css';

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formError, setFormError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Load contacts from localStorage on component mount
    useEffect(() => {
        const savedContacts = localStorage.getItem('emergencyContacts');
        if (savedContacts) {
            setContacts(JSON.parse(savedContacts));
        }
    }, []);

    // Save contacts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    }, [contacts]);

    const validatePhone = (phoneNumber) => {
        // Basic phone validation - allows different formats including country codes
        const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
        return regex.test(phoneNumber);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setFormError('Please enter a contact name');
            return;
        }
        
        if (!phone.trim() || !validatePhone(phone)) {
            setFormError('Please enter a valid phone number');
            return;
        }
        
        if (editIndex !== null) {
            // Update existing contact
            const updatedContacts = [...contacts];
            updatedContacts[editIndex] = { name, phone };
            setContacts(updatedContacts);
            setEditIndex(null);
        } else {
            // Add new contact
            setContacts([...contacts, { name, phone }]);
        }
        
        // Reset form
        setName('');
        setPhone('');
        setFormError('');
        setIsAdding(false);
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleEdit = (index) => {
        setName(contacts[index].name);
        setPhone(contacts[index].phone);
        setEditIndex(index);
        setIsAdding(true);
        setFormError('');
    };

    const handleCancel = () => {
        setName('');
        setPhone('');
        setEditIndex(null);
        setIsAdding(false);
        setFormError('');
    };

    const removeContact = (index) => {
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
    };

    const testCall = (phoneNumber) => {
        window.location.href = `tel:${phoneNumber}`;
    };

    return (
        <div className="emergency-contacts">
            <h2>
                <span className="emergency-icon">👥</span> Emergency Contacts
            </h2>
            
            <div className="contacts-info">
                <p>Add people you trust who can be contacted in case of an emergency. 
                These contacts will receive an alert message when you use the SOS button.</p>
            </div>

            {showSuccess && (
                <div className="success-message">
                    <span>✅ Contact {editIndex !== null ? 'updated' : 'added'} successfully!</span>
                </div>
            )}
            
            <div className="contacts-container">
                {contacts.length > 0 ? (
                    <div className="contacts-list">
                        {contacts.map((contact, index) => (
                            <div key={index} className="contact-card">
                                <div className="contact-info">
                                    <h3>{contact.name}</h3>
                                    <p>{contact.phone}</p>
                                </div>
                                <div className="contact-actions">
                                    <button 
                                        className="test-call-btn" 
                                        onClick={() => testCall(contact.phone)}
                                        aria-label={`Call ${contact.name}`}
                                    >
                                        <span className="btn-icon">📞</span>
                                    </button>
                                    <button 
                                        className="edit-contact-btn" 
                                        onClick={() => handleEdit(index)}
                                        aria-label={`Edit ${contact.name}`}
                                    >
                                        <span className="btn-icon">✏️</span>
                                    </button>
                                    <button 
                                        className="remove-contact-btn" 
                                        onClick={() => removeContact(index)}
                                        aria-label={`Remove ${contact.name}`}
                                    >
                                        <span className="btn-icon">❌</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-contacts">
                        <div className="no-contacts-icon">👤</div>
                        <p>No emergency contacts added yet</p>
                        <p className="no-contacts-subtitle">Add trusted people who can help during a crisis</p>
                    </div>
                )}

                {!isAdding ? (
                    <button className="add-contact-button" onClick={() => setIsAdding(true)}>
                        + Add Emergency Contact
                    </button>
                ) : (
                    <div className="contact-form-container">
                        <h3>{editIndex !== null ? 'Edit Contact' : 'Add New Contact'}</h3>
                        <form onSubmit={handleSubmit} className="contact-form">
                            {formError && <div className="form-error">{formError}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="contact-name">Name</label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contact name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="contact-phone">Phone Number</label>
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone number with country code"
                                />
                                <small className="phone-format-hint">Format: +1234567890 or 123-456-7890</small>
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="save-contact-btn">
                                    {editIndex !== null ? 'Update Contact' : 'Save Contact'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            
            <div className="sos-guide">
                <h3>How to Use SOS Feature</h3>
                <div className="sos-steps">
                    <div className="sos-step">
                        <div className="step-number">1</div>
                        <p>Add your trusted emergency contacts above</p>
                    </div>
                    <div className="sos-step">
                        <div className="step-number">2</div>
                        <p>In a crisis, tap the SOS button in the app header</p>
                    </div>
                    <div className="sos-step">
                        <div className="step-number">3</div>
                        <p>Confirm to send emergency text messages to all your contacts</p>
                    </div>
                </div>
                <div className="sos-note">
                    <p>
                        <strong>Note:</strong> The SOS feature will open your phone's messaging app 
                        with pre-written emergency texts. You'll need to manually send the messages.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;