import React from 'react';
import './authorizationPage.css'
import Input from '../../components/Input/Input';
import Form from '../../components/Form/Form';
import Button from '../../components/Button/Button';
import FormTitle from '../../components/FormTitle/FormTitle';

const AuthorizationPage = () => {
  return (
    <div className='auth-page'>
      <Form>
        <FormTitle text={'Авторизация'}/>
        <Input placeholder={'Логин'}/>
        <Input placeholder={'Пароль'} type='password'/>
        <Button text={'Отправить'}/>
      </Form>
    </div>
  );
};

export default AuthorizationPage;