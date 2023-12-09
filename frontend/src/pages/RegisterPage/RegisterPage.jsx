import {useState} from 'react';
import Input from '../../components/Input/Input';
import Form from '../../components/Form/Form';
import './registerPage.css'
import Button from '../../components/Button/Button';
import FormTitle from '../../components/FormTitle/FormTitle';
import { useNavigate } from 'react-router-dom';
import { sha1 } from '../../utils/sha1';


const RegisterPage = () => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleInput = (setState) => {
    return (e) => {
      setState(e.target.value)
    }
  }


  const handleRegistrarion = () => {
    const owner = JSON.stringify({login, password})
    localStorage.removeItem('owner')
    localStorage.setItem('owner', owner)
    navigate('/')
  }


  return (
    <div className='register-page'>
      <Form>
        <FormTitle text={'Регистрация'}/>
        <Input placeholder={'Логин'} onChange={handleInput(setLogin)} value={login}/>
        <Input placeholder={'Пароль'} type='password' onChange={handleInput(setPassword)} value={password}/>
        <Button text={'Зарегистрироваться'} onClick={handleRegistrarion} />
      </Form>
    </div>
  );
};

export default RegisterPage;