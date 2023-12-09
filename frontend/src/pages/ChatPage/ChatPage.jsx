import './chatPage.css'
import Input from '../../components/Input/Input';
import Message from '../../components/Message/Message';
import Button from '../../components/Button/Button';
import { useEffect, useRef, useState } from 'react';
import { sha1 } from '../../utils/sha1';
import { generateRandomBigInt } from '../../utils/RSA';

const ChatPage = () => {
  const socket = useRef();
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [companionLogin, setCompanionLogin] = useState('')
  const [userLogin, setUserLogin] = useState('')
  const [userPassword, setUserPassword] = useState('')

  const handleInput = (setState) => {
    return (e) => {
      setState(e.target.value)
    }
  }
  
  const handleAddUser = () => {
    localStorage.removeItem(userLogin)
    localStorage.setItem(userLogin, JSON.stringify({login: userLogin, password: userPassword}))
  }

  const handleAuthentication = (login, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const findedUser = JSON.parse(localStorage.getItem(login))

    if (!findedUser) {
      return
    }

    console.log('логин:', login, 'пользователь:', login)

    const word = generateRandomBigInt(128).toString()
    const timestamp = Date.now() + 1000 * 60 * 10

    console.log('Сгенерированное ключевое слово:', word, 'пользователь:', ownerLogin)
    console.log('Сгенерированный timestamp:', timestamp, 'пользователь:', ownerLogin)

    localStorage.removeItem(login)
    localStorage.setItem(login, JSON.stringify({...findedUser, word, timestamp}))

    console.log('Отправка sha1(word)', sha1(word), 'пользователь:', ownerLogin)
  
    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      message: sha1(word),
      to: login,
      type: 'code-word'
    }))
  }

  const handleCheckCodeWord = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const password = JSON.parse(localStorage.getItem('owner')).password

    const passwordHash = sha1(password)

    const H = sha1(passwordHash + message.message)

    console.log('H:', H, 'пользователь:', ownerLogin)

    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      message: H,
      to: message.login,
      type: 'H'
    }))
  }

  const handleCheckH = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const findedUser = JSON.parse(localStorage.getItem(message.login))

    const passwordHash = sha1(findedUser.password)

    const ownerH = sha1(passwordHash + sha1(findedUser.word))
    console.log('H`', ownerH, 'H', message.message, 'пользователь:', ownerLogin)
    console.log('timestamp (дата генерации word + 10мин)в мс:', findedUser.timestamp, 'Текущее время в мс:', Date.now())


    if (ownerH === message.message && findedUser.timestamp >= Date.now()) {
      console.log('Соединение успешно установлено!')
      socket.current?.send(JSON.stringify({
        event: 'private-message',
        login: ownerLogin,
        message: 'Соединение успешно установлено!',
        to: message.login,
        type: 'status'
      }))
    } else {
      console.log('Соединение не удалось установить!')
      socket.current?.send(JSON.stringify({
        event: 'private-message',
        login: ownerLogin,
        message: 'Соединение не удалось установить!',
        to: message.login,
        type: 'status'
      }))
    }
  }

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      const message = {
        event: "private-connection",
        login: JSON.parse(localStorage.getItem('owner')).login
      };
      socket.current?.send(JSON.stringify(message));
    };

    socket.current.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      // console.log(message)
      const ownerLogin = JSON.parse(localStorage.getItem('owner')).login

      if (message.to !== ownerLogin) return

      switch (message.type) {
        case 'authentication':
          handleAuthentication(message.login, socket)
          break;
        case 'code-word':
          handleCheckCodeWord(message, socket)
          break;
        case 'H':
          handleCheckH(message, socket)
          break;
        case 'status':
          console.log(message.message)
          break;
      }

      setMessages(message)
    };


    socket.current.onclose = () => {
      console.log("Socket закрыт");
    };

    socket.current.onerror = () => {
      console.log("Socket произошла ошибка");
    };

    return () => {
      socket.current?.close();
    };
  }, [])

  const handleSendMessage = () => {
    const login = JSON.parse(localStorage.getItem('owner')).login

    const message = {
      event: "private-message",
      login,
      message: inputValue,
      to: companionLogin
    }

    socket.current.send(JSON.stringify(message))
  }

  const handleSendToCompanionLogin = () => {
    const login = JSON.parse(localStorage.getItem('owner')).login

    const message = {
      event: "private-message",
      login,
      message: companionLogin,
      to: companionLogin,
      type: 'authentication'
    }

    socket.current.send(JSON.stringify(message))
  }

  // const handleSendLogin = () => {

  // }

  return (
    <div className='chat-page'>
      <div className='chat'>
        <div className='chat-title'>
          <Input placeholder={'Введите логин пользователя, которому хотите отправить сообщение'} 
                onChange={handleInput(setCompanionLogin)} 
                value={companionLogin}/>
          <Button text={'Выбрать'} onClick={handleSendToCompanionLogin} />
        </div>
        <div className="messages">
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
          <Message/>
        </div>
        <div className="chat-page-sender">
          <Input placeholder={'Сообщение'} onChange={handleInput(setInputValue)} value={inputValue} onClick={handleSendMessage}/>
          <Button text={'Отправить'}/>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
          <Button text={'Выйти'} />
          <div className="commander-form">
            <div className='chat-page-commander-form-title'>
              Введите логин и пароль пользователя
            </div>
            <Input placeholder={'Логин'} onChange={handleInput(setUserLogin)}/>
            <Input placeholder={'Пароль'} type='password' onChange={handleInput(setUserPassword)}/>
            <Button text={'Отправить'}  onClick={handleAddUser}/>
          </div>
      </div>
    </div>
  );
};

export default ChatPage;