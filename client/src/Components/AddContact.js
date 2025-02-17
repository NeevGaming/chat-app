import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddContact = ({email}) => {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userEmail = email;
      await axios.post(`/contacts/${userEmail}`, { name : name, email : mail });
      navigate('/');
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  return (
    <form className='add-contact-form' onSubmit={handleSubmit}>
      <div>
        <Link to='/'><button type="button">&larr;</button></Link>
      </div>
      <input
        type="text"
        placeholder='Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder='Email'
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        required
      />
      <button type='submit'>Add Contact</button>
    </form>
  );
};

export default AddContact;