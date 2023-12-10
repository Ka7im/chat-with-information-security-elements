import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './authorizationPage.css'
import Input from '../../components/Input/Input';
import Form from '../../components/Form/Form';
import Button from '../../components/Button/Button';
import FormTitle from '../../components/FormTitle/FormTitle';

const AuthorizationPage = () => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleInput = (setState) => {
    return (e) => {
      setState(e.target.value)
    }
  }


  const handleAuth = () => {
    const owner = JSON.stringify({login, password})
    localStorage.removeItem('owner')
    localStorage.setItem('owner', owner)
    navigate('/')
  }

  return (
    <div className='auth-page'>
      <Form>
        <FormTitle text={'Авторизация'}/>
        <Input placeholder={'Логин'} onChange={handleInput(setLogin)} value={login}/>
        <Input placeholder={'Пароль'} type='password' onChange={handleInput(setPassword)} value={password}/>
        <Button text={'Отправить'} onClick={handleAuth} />
      </Form>
    </div>
  );
};

export default AuthorizationPage;