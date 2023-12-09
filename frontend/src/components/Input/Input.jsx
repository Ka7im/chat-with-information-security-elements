import React from 'react';
import './input.css'

// eslint-disable-next-line react/prop-types
const Input = ({placeholder, onChange, value, type = 'text'}) => {

  return (
    <input type={type} placeholder={placeholder} className='input' onChange={onChange} value={value}/>
  );
};

export default Input;